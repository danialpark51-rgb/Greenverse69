// Supabase Edge Function: plant-intelligence
// Handles:
// 1. action: "identify" -> Multi-modal Gemini Vision Plant Identification
// 2. action: "diagnose" -> Multi-modal Gemini Vision Plant Disease & Health Diagnosis
// 3. action: "care-advice" -> Gemini Contextual Smart Plant Care Advisor
// 4. action: "perenual-search" -> Server-side Proxy to Perenual Species API
// 5. action: "perenual-details" -> Server-side Proxy to Perenual Species Details

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const PERENUAL_API_KEY = Deno.env.get("PERENUAL_API_KEY") || "";

// Gemini 1.5 Flash endpoint (supports image multimodal & JSON output)
const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    const { action } = payload;

    if (!action) {
      return new Response(JSON.stringify({ error: "Missing required 'action' in request payload." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // =========================================================================
    // 1. AI PLANT IDENTIFICATION (Gemini Vision)
    // =========================================================================
    if (action === "identify") {
      if (!GEMINI_API_KEY) {
        return new Response(
          JSON.stringify({ error: "Gemini API key not configured on server (GEMINI_API_KEY missing in secrets)." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { imageBase64, mimeType = "image/jpeg" } = payload;
      if (!imageBase64) {
        return new Response(JSON.stringify({ error: "Missing imageBase64 data for identification." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const prompt = `You are an expert botanical taxonomist and arborist. Analyze this plant photograph carefully.
Identify the plant species, family, observable characteristics, and confidence level.
If the image does not show a plant or is too blurry/unclear to identify, state that clearly in the response.

Return a STRICT JSON object with this exact structure (no markdown fences, just raw JSON):
{
  "identified": true,
  "commonName": "Primary Common Name",
  "scientificName": "Genus species",
  "family": "Botanical Family",
  "category": "Tree | Shrub | Perennial | Annual | Succulent | Vine | Fern | Grass | Other",
  "confidenceLevel": "High" | "Moderate" | "Low",
  "confidenceScore": 85,
  "confidenceExplanation": "Explanation of visual markers supporting this identification and any ambiguities.",
  "observableCharacteristics": ["trait 1", "trait 2", "trait 3"],
  "alternativeSpecies": [
    { "commonName": "Alternative 1", "scientificName": "Genus species", "distinction": "Why it might be this instead" }
  ],
  "careOverview": {
    "sunlight": "Full Sun | Partial Shade | Full Shade",
    "watering": "Low | Moderate | High",
    "soil": "Well-draining loam, pH 6.0-7.0",
    "hardinessZones": "Zone 4-9",
    "summary": "Brief 1-2 sentence care overview"
  }
}`;

      const geminiRes = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        return new Response(
          JSON.stringify({ error: `Gemini API error: ${geminiRes.status} ${errText}` }),
          { status: geminiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const geminiData = await geminiRes.json();
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const parsed = JSON.parse(rawText);

      return new Response(JSON.stringify({ success: true, data: parsed }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // =========================================================================
    // 2. AI PLANT DISEASE & HEALTH DIAGNOSIS (Gemini Vision)
    // =========================================================================
    if (action === "diagnose") {
      if (!GEMINI_API_KEY) {
        return new Response(
          JSON.stringify({ error: "Gemini API key not configured on server (GEMINI_API_KEY missing in secrets)." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { imageBase64, mimeType = "image/jpeg", plantName, symptoms = [], observations = "" } = payload;
      const symptomList = symptoms.length > 0 ? symptoms.join(", ") : "None specifically selected";

      const prompt = `You are a certified plant pathologist and arborist specializing in plant health diagnostics.
Evaluate this plant specimen for diseases, pests, nutritional deficiencies, and environmental stress.
User Plant Name: ${plantName || "Not specified"}
Selected Symptoms: ${symptomList}
User Observations: ${observations || "None provided"}

Return a STRICT JSON object with this exact structure (no markdown fences, just raw JSON):
{
  "plantIdentified": "${plantName || "Identified from visual traits"}",
  "primaryIssue": "Name of most probable disease, pest, or stressor",
  "category": "Fungal | Bacterial | Viral | Pest | Nutrient Deficiency | Environmental Stress | Overwatering | Underwatering | Healthy",
  "severity": "Mild" | "Moderate" | "Severe",
  "confidence": "High" | "Moderate" | "Low",
  "visibleEvidence": ["Observation 1 from photo", "Observation 2 from symptoms"],
  "otherPlausibleCauses": ["Alternative cause 1", "Alternative cause 2"],
  "immediateActions": ["Action 1 to halt damage", "Action 2"],
  "treatmentRecommendations": ["Eco-friendly treatment 1", "Treatment step 2"],
  "preventionAdvice": ["Cultural practice 1 to prevent recurrence", "Cultural practice 2"],
  "monitoringGuidance": "Inspection timeline (e.g. check leaf undersides every 48 hours for 2 weeks)",
  "disclaimer": "AI diagnosis provides observational horticultural assessment. For high-value crops or severe outbreaks, consult your local agricultural extension service or certified arborist."
}`;

      const contentsParts: any[] = [{ text: prompt }];
      if (imageBase64) {
        contentsParts.push({
          inlineData: {
            mimeType: mimeType,
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
          },
        });
      }

      const geminiRes = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: contentsParts }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        return new Response(
          JSON.stringify({ error: `Gemini API error: ${geminiRes.status} ${errText}` }),
          { status: geminiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const geminiData = await geminiRes.json();
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const parsed = JSON.parse(rawText);

      return new Response(JSON.stringify({ success: true, data: parsed }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // =========================================================================
    // 3. SMART PLANT CARE ADVISOR (Gemini Contextual Generation)
    // =========================================================================
    if (action === "care-advice") {
      if (!GEMINI_API_KEY) {
        return new Response(
          JSON.stringify({ error: "Gemini API key not configured on server (GEMINI_API_KEY missing in secrets)." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { plantName, scientificName, location, weatherContext, indoorOutdoor = "Outdoor", userNotes = "" } = payload;
      if (!plantName) {
        return new Response(JSON.stringify({ error: "Missing plantName for care advisor." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const prompt = `You are a professional horticulturist creating a comprehensive, personalized plant care regimen.
Target Plant: ${plantName} (${scientificName || "Species unknown"})
Environment: ${indoorOutdoor}
User Location: ${location || "Temperate climate"}
Current Weather Context: ${JSON.stringify(weatherContext || "Standard seasonal conditions")}
User Notes: ${userNotes || "None"}

Generate a personalized, scientifically grounded plant care plan.
Return a STRICT JSON object with this exact structure (no markdown fences, just raw JSON):
{
  "plantName": "${plantName}",
  "careSummary": "1-2 sentence high-level summary of care difficulty and key focus.",
  "watering": {
    "frequency": "e.g., Every 5-7 days when top 2 inches feel dry",
    "guidance": "Detailed watering method, tap vs rainwater, winter reduction",
    "weatherAdjustment": "Guidance on adjusting for high heat or recent rain"
  },
  "sunlight": {
    "requirement": "Full Sun | Partial Sun | Partial Shade | Full Shade",
    "hoursPerDay": "6+ hours direct sunlight",
    "guidance": "Placement tips, avoiding scorching or legginess"
  },
  "soil": {
    "type": "Loam | Sandy-Loam | Acidic | Peaty | Well-drained cactus mix",
    "phRange": "6.0 - 7.0",
    "drainage": "Must have drainage holes / well-aerated",
    "fertilizer": "Balanced 10-10-10 slow release every 6 weeks in spring/summer"
  },
  "temperatureAndHumidity": {
    "idealTempRange": "18°C - 26°C (65°F - 78°F)",
    "frostTolerance": "Hardy down to -10°C | Frost tender, bring indoors below 5°C",
    "humidity": "Moderate (40-60%)"
  },
  "maintenance": {
    "pruning": "Prune dead or crossed branches in late winter before bud burst",
    "repotting": "Every 2-3 years in spring if rootbound",
    "growthRate": "Slow | Moderate | Fast"
  },
  "seasonalCalendar": {
    "spring": "Actionable task for spring",
    "summer": "Actionable task for summer",
    "autumn": "Actionable task for autumn",
    "winter": "Actionable task for winter"
  },
  "commonMistakes": [
    "Mistake 1 (e.g. overwatering causing root rot)",
    "Mistake 2"
  ],
  "alerts": [
    "Important caution 1"
  ]
}`;

      const geminiRes = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        return new Response(
          JSON.stringify({ error: `Gemini API error: ${geminiRes.status} ${errText}` }),
          { status: geminiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const geminiData = await geminiRes.json();
      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const parsed = JSON.parse(rawText);

      return new Response(JSON.stringify({ success: true, data: parsed }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // =========================================================================
    // 4. PERENUAL PLANT SPECIES SEARCH PROXY
    // =========================================================================
    if (action === "perenual-search") {
      if (!PERENUAL_API_KEY) {
        return new Response(
          JSON.stringify({ error: "Perenual API key not configured on server (PERENUAL_API_KEY missing in secrets)." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { q = "", page = 1, order = "asc", edible, poisonous, cycle, watering, sunlight, indoor } = payload;
      const url = new URL("https://perenual.com/api/species-list");
      url.searchParams.set("key", PERENUAL_API_KEY);
      if (q) url.searchParams.set("q", q);
      if (page) url.searchParams.set("page", String(page));
      if (order) url.searchParams.set("order", order);
      if (edible !== undefined && edible !== null) url.searchParams.set("edible", String(edible));
      if (poisonous !== undefined && poisonous !== null) url.searchParams.set("poisonous", String(poisonous));
      if (cycle) url.searchParams.set("cycle", cycle);
      if (watering) url.searchParams.set("watering", watering);
      if (sunlight) url.searchParams.set("sunlight", sunlight);
      if (indoor !== undefined && indoor !== null) url.searchParams.set("indoor", String(indoor));

      const perenualRes = await fetch(url.toString());
      if (!perenualRes.ok) {
        const errText = await perenualRes.text();
        return new Response(
          JSON.stringify({ error: `Perenual API returned ${perenualRes.status}: ${errText}` }),
          { status: perenualRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await perenualRes.json();
      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // =========================================================================
    // 5. PERENUAL PLANT SPECIES DETAILS PROXY
    // =========================================================================
    if (action === "perenual-details") {
      if (!PERENUAL_API_KEY) {
        return new Response(
          JSON.stringify({ error: "Perenual API key not configured on server (PERENUAL_API_KEY missing in secrets)." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { id } = payload;
      if (!id) {
        return new Response(JSON.stringify({ error: "Missing species id for details lookup." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const url = `https://perenual.com/api/species/details/${encodeURIComponent(id)}?key=${PERENUAL_API_KEY}`;
      const perenualRes = await fetch(url);

      if (!perenualRes.ok) {
        const errText = await perenualRes.text();
        return new Response(
          JSON.stringify({ error: `Perenual API returned ${perenualRes.status}: ${errText}` }),
          { status: perenualRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await perenualRes.json();
      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: '${action}'` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
