// Supabase Edge Function: tree-diagnosis
// Accepts a symptom/observation payload, calls Google Gemini API,
// and returns a structured AI diagnostic report.
// NEVER called with a service-role key — anon JWT from authenticated user is sufficient.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface DiagnosisRequest {
  symptoms: string[];
  observations: string;
  severity: "mild" | "moderate" | "severe";
  speciesName?: string;
  photo_url?: string;
}

interface DiagnosisResponse {
  diagnosis: string;
  confidence: "High" | "Moderate" | "Low";
  likely_causes: string[];
  treatment_steps: string[];
  preventive_measures: string[];
  follow_up: string;
  disclaimer: string;
  model: string;
  ai_powered: boolean;
  error?: boolean;
  fallback?: boolean;
}

function buildPrompt(req: DiagnosisRequest): string {
  const symptomList =
    req.symptoms.length > 0
      ? req.symptoms.join(", ")
      : "No specific symptoms selected";

  return `You are an expert arborist and plant pathologist. A tree health triage report has been submitted with the following information:

Tree Species (if known): ${req.speciesName || "Unknown species"}
Observed Severity: ${req.severity.toUpperCase()}
Observed Symptoms: ${symptomList}
Field Observations: ${req.observations || "None provided"}

Please provide a structured diagnostic assessment. Your response MUST be a valid JSON object with this exact structure:
{
  "diagnosis": "One clear sentence naming the most likely condition or disease",
  "confidence": "High" | "Moderate" | "Low",
  "likely_causes": ["cause 1", "cause 2", "cause 3"],
  "treatment_steps": ["step 1", "step 2", "step 3", "step 4"],
  "preventive_measures": ["measure 1", "measure 2", "measure 3"],
  "follow_up": "Recommended follow-up timeline and next inspection milestone",
  "disclaimer": "AI-generated horticultural assessment. Consult a certified arborist for critical or high-value trees."
}

Base your assessment on established arboricultural science. Do not fabricate diagnoses. If symptoms are insufficient for a confident diagnosis, set confidence to "Low" and explain what additional information is needed in the diagnosis field. Return ONLY the JSON object, no additional text.`;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Validate that we have an authenticated user (not anonymous abuse)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Authentication required" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Verify auth session against Supabase Auth service if URL and anon key are present
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized: Invalid, expired, or unauthenticated session" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } catch (authErr) {
      console.warn("[tree-diagnosis] Auth token verification exception:", authErr);
    }
  }

  // Get Gemini API key from Edge Function environment (set in Supabase Dashboard)
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

  if (!geminiApiKey) {
    // Honest fallback — no fabricated diagnoses
    const fallback: DiagnosisResponse = {
      diagnosis:
        "AI diagnosis is currently unavailable. The GEMINI_API_KEY environment variable has not been configured in the Supabase Edge Function settings.",
      confidence: "Low",
      likely_causes: [
        "AI service not configured by administrator",
        "Refer to the Greenverse setup documentation",
      ],
      treatment_steps: [
        "Configure GEMINI_API_KEY in Supabase Dashboard → Edge Functions → tree-diagnosis → Secrets",
        "Obtain a Gemini API key from Google AI Studio (https://aistudio.google.com)",
        "In the meantime, consult a certified arborist for critical tree health concerns",
      ],
      preventive_measures: [
        "Regular visual inspection every 4-6 weeks",
        "Maintain proper mulch depth (3-4 inches) around root zone",
        "Avoid soil compaction near the trunk base",
      ],
      follow_up:
        "Re-run this diagnostic after the GEMINI_API_KEY is configured.",
      disclaimer:
        "AI diagnosis unavailable — GEMINI_API_KEY not configured. This is a fallback message, not an AI assessment.",
      model: "fallback",
      ai_powered: false,
      error: true,
      fallback: true,
    };

    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let diagnosisReq: DiagnosisRequest;
  try {
    diagnosisReq = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON in request body" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Validate basic input
  if (
    !Array.isArray(diagnosisReq.symptoms) ||
    typeof diagnosisReq.severity !== "string"
  ) {
    return new Response(
      JSON.stringify({
        error: "Missing required fields: symptoms (array), severity (string)",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const prompt = buildPrompt(diagnosisReq);

  // Build Gemini API payload
  const geminiPayload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.3, // Low temp for factual, consistent medical-style output
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
  };

  try {
    const geminiResponse = await fetch(
      `${GEMINI_API_URL}?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("[tree-diagnosis] Gemini API error:", geminiResponse.status, errText);
      throw new Error(`Gemini API returned ${geminiResponse.status}: ${errText}`);
    }

    const geminiData = await geminiResponse.json();

    // Extract the generated text
    const generatedText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("Gemini API returned empty content");
    }

    // Parse JSON response from Gemini
    let parsedDiagnosis: Partial<DiagnosisResponse>;
    try {
      parsedDiagnosis = JSON.parse(generatedText);
    } catch {
      // If Gemini returned text with markdown fences, strip them
      const cleaned = generatedText
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/, "")
        .trim();
      parsedDiagnosis = JSON.parse(cleaned);
    }

    const response: DiagnosisResponse = {
      diagnosis: parsedDiagnosis.diagnosis || "Diagnosis could not be determined from the provided symptoms.",
      confidence: parsedDiagnosis.confidence || "Low",
      likely_causes: parsedDiagnosis.likely_causes || [],
      treatment_steps: parsedDiagnosis.treatment_steps || [],
      preventive_measures: parsedDiagnosis.preventive_measures || [],
      follow_up: parsedDiagnosis.follow_up || "Schedule follow-up inspection in 4 weeks.",
      disclaimer:
        parsedDiagnosis.disclaimer ||
        "AI-generated horticultural assessment. Consult a certified arborist for critical or high-value trees.",
      model: "gemini-1.5-flash",
      ai_powered: true,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[tree-diagnosis] Error calling Gemini:", errorMessage);

    // Honest fallback on API failure
    const fallback: DiagnosisResponse = {
      diagnosis:
        "AI diagnosis is temporarily unavailable due to a service error. Please try again later or consult a certified arborist.",
      confidence: "Low",
      likely_causes: ["AI service temporarily unavailable"],
      treatment_steps: [
        "Retry the diagnosis in a few minutes",
        "If symptoms are severe, contact a certified arborist immediately",
        "Document current observations with photographs for arborist consultation",
      ],
      preventive_measures: [
        "Continue regular visual monitoring",
        "Maintain adequate watering and mulching",
      ],
      follow_up: "Retry AI diagnosis or consult a certified arborist.",
      disclaimer:
        "AI diagnosis unavailable due to a service error. This is a fallback response, not an AI assessment.",
      model: "fallback",
      ai_powered: false,
      error: true,
      fallback: true,
    };

    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
