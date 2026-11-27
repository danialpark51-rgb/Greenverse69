-- ==============================================================================
-- GREENVERSE — BATCH 3: COMMUNITY NETWORK ENHANCEMENTS & PERSISTENCE
-- File: supabase/migrations/11_batch3_community_network_enhancements.sql
-- Description: Extends community network schema with challenge progress logs,
--              community roles management, volunteer hour tracking, post editing policies,
--              and automatic community notification triggers.
-- ==============================================================================

-- 1. EXTEND CHALLENGE PARTICIPATIONS WITH DETAILED LOGS
CREATE TABLE IF NOT EXISTS public.challenge_progress_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participation_id UUID NOT NULL REFERENCES public.challenge_participations(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.green_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    units_completed INTEGER NOT NULL DEFAULT 1,
    note TEXT,
    logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.challenge_progress_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_progress_logs_participation ON public.challenge_progress_logs(participation_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_user ON public.challenge_progress_logs(user_id);

-- RLS: Users can view and insert their own progress logs
DROP POLICY IF EXISTS "Users view own challenge logs" ON public.challenge_progress_logs;
CREATE POLICY "Users view own challenge logs" ON public.challenge_progress_logs
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own challenge logs" ON public.challenge_progress_logs;
CREATE POLICY "Users insert own challenge logs" ON public.challenge_progress_logs
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.challenge_progress_logs TO authenticated;

-- 2. EXTEND VOLUNTEER REGISTRATIONS WITH HOURS AND ATTENDANCE CONFIRMATION
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'volunteer_registrations' 
          AND column_name = 'hours_contributed'
    ) THEN
        ALTER TABLE public.volunteer_registrations 
        ADD COLUMN hours_contributed NUMERIC(5, 2) DEFAULT 0.0 CHECK (hours_contributed >= 0);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'volunteer_registrations' 
          AND column_name = 'feedback_notes'
    ) THEN
        ALTER TABLE public.volunteer_registrations 
        ADD COLUMN feedback_notes TEXT;
    END IF;
END $$;

-- 3. ENSURE ORGANIZERS CAN UPDATE VOLUNTEER REGISTRATION STATUS (Accept, Attend, Hours)
DROP POLICY IF EXISTS "Organizers manage registrations" ON public.volunteer_registrations;
CREATE POLICY "Organizers manage registrations" ON public.volunteer_registrations
    FOR UPDATE TO authenticated
    USING (
        auth.uid() = user_id 
        OR auth.uid() = (
            SELECT organizer_id FROM public.volunteer_opportunities
            WHERE id = opportunity_id LIMIT 1
        )
    )
    WITH CHECK (
        auth.uid() = user_id 
        OR auth.uid() = (
            SELECT organizer_id FROM public.volunteer_opportunities
            WHERE id = opportunity_id LIMIT 1
        )
    );

-- 4. ENSURE POST AUTHORS & COMMUNITY MODS CAN UPDATE / DELETE POSTS
DROP POLICY IF EXISTS "Users update own posts" ON public.community_posts;
CREATE POLICY "Users update own posts" ON public.community_posts
    FOR UPDATE TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users delete own posts" ON public.community_posts;
CREATE POLICY "Users delete own posts" ON public.community_posts
    FOR DELETE TO authenticated
    USING (
        auth.uid() = author_id
        OR auth.uid() = (
            SELECT owner_id FROM public.communities 
            WHERE id = community_id LIMIT 1
        )
    );

-- 5. ENSURE COMMENT AUTHORS CAN UPDATE & DELETE COMMENTS
DROP POLICY IF EXISTS "Users update own comments" ON public.post_comments;
CREATE POLICY "Users update own comments" ON public.post_comments
    FOR UPDATE TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- 6. COMMUNITY ROLES MANAGEMENT
-- Allows community owners to assign moderator/admin roles
DROP POLICY IF EXISTS "Owners update community members" ON public.community_members;
CREATE POLICY "Owners update community members" ON public.community_members
    FOR UPDATE TO authenticated
    USING (
        auth.uid() = (
            SELECT owner_id FROM public.communities
            WHERE id = community_id LIMIT 1
        )
    )
    WITH CHECK (
        auth.uid() = (
            SELECT owner_id FROM public.communities
            WHERE id = community_id LIMIT 1
        )
    );

-- 7. EVENT ORGANIZERS UPDATE & DELETE EVENTS
DROP POLICY IF EXISTS "Organizers update events" ON public.green_events;
CREATE POLICY "Organizers update events" ON public.green_events
    FOR UPDATE TO authenticated
    USING (auth.uid() = organizer_id)
    WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Organizers delete events" ON public.green_events;
CREATE POLICY "Organizers delete events" ON public.green_events
    FOR DELETE TO authenticated
    USING (auth.uid() = organizer_id);

-- 8. AUTOMATIC NOTIFICATION DISPATCH TRIGGER FOR COMMUNITY ACTIONS
-- Dispatches an in_app_notification to post author on like/comment (never to oneself)
CREATE OR REPLACE FUNCTION public.notify_post_interaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_post_author UUID;
    v_actor_id UUID;
    v_post_title TEXT;
BEGIN
    v_actor_id := auth.uid();

    IF TG_TABLE_NAME = 'post_likes' THEN
        SELECT author_id, COALESCE(title, 'community post') INTO v_post_author, v_post_title
        FROM public.community_posts WHERE id = NEW.post_id;
        
        IF v_post_author IS NOT NULL AND v_post_author != v_actor_id THEN
            INSERT INTO public.in_app_notifications (user_id, title, message, type, link_url)
            VALUES (
                v_post_author,
                'New Post Reaction',
                'Someone liked your post: ' || LEFT(v_post_title, 40),
                'community',
                '/communities?tab=feed'
            );
        END IF;
    ELSIF TG_TABLE_NAME = 'post_comments' THEN
        SELECT author_id, COALESCE(title, 'community post') INTO v_post_author, v_post_title
        FROM public.community_posts WHERE id = NEW.post_id;

        IF v_post_author IS NOT NULL AND v_post_author != v_actor_id THEN
            INSERT INTO public.in_app_notifications (user_id, title, message, type, link_url)
            VALUES (
                v_post_author,
                'New Discussion Comment',
                NEW.author_name || ' commented: "' || LEFT(NEW.content, 40) || '"',
                'community',
                '/communities?tab=feed'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_post_like ON public.post_likes;
CREATE TRIGGER trg_notify_post_like
    AFTER INSERT ON public.post_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_post_interaction();

DROP TRIGGER IF EXISTS trg_notify_post_comment ON public.post_comments;
CREATE TRIGGER trg_notify_post_comment
    AFTER INSERT ON public.post_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_post_interaction();
