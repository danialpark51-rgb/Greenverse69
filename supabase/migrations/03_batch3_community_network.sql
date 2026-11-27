-- ==============================================================================
-- GREENVERSE — BATCH 3: COMMUNITY & SQUAD NETWORK MIGRATION
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. COMMUNITIES TABLE
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Local neighborhood',
    focus_area TEXT,
    location_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_private BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    banner_url TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    trees_planted_count INTEGER DEFAULT 0,
    members_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. COMMUNITY MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (community_id, user_id)
);

-- 4. SQUADS TABLE
CREATE TABLE IF NOT EXISTS public.squads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tagline TEXT,
    leader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    skills_needed TEXT[] DEFAULT '{}',
    environmental_interests TEXT[] DEFAULT '{}',
    location_name TEXT,
    max_members INTEGER DEFAULT 20,
    members_count INTEGER DEFAULT 1,
    goals TEXT,
    avatar TEXT DEFAULT '🌱',
    is_recruiting BOOLEAN DEFAULT TRUE,
    trees_planted INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SQUAD MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.squad_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'scout', 'planter', 'researcher', 'member')),
    skills TEXT[] DEFAULT '{}',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (squad_id, user_id)
);

-- 6. GREEN CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS public.green_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'Intermediate' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced', 'Master')),
    duration_days INTEGER NOT NULL DEFAULT 7,
    target_metric TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    reward_points INTEGER DEFAULT 50,
    reward_badge TEXT,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_team_challenge BOOLEAN DEFAULT FALSE,
    community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    participants_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CHALLENGE PARTICIPATIONS TABLE
CREATE TABLE IF NOT EXISTS public.challenge_participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES public.green_challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    squad_id UUID REFERENCES public.squads(id) ON DELETE SET NULL,
    current_progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    completed_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (challenge_id, user_id)
);

-- 8. GREEN EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.green_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
    squad_id UUID REFERENCES public.squads(id) ON DELETE SET NULL,
    organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organizer_name TEXT NOT NULL DEFAULT 'Greenverse Steward',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    max_participants INTEGER DEFAULT 50,
    current_rsvp_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. EVENT RSVPS TABLE
CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.green_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'going' CHECK (status IN ('going', 'interested', 'cancelled', 'attended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);

-- 10. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    title TEXT,
    content TEXT NOT NULL,
    media_url TEXT,
    post_type TEXT DEFAULT 'general' CHECK (post_type IN ('general', 'tree_progress', 'challenge_completed', 'event_update', 'achievement')),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. POST LIKES & COMMENTS TABLES
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. GREEN BRAIN ARTICLES, BOOKMARKS & UPVOTES
CREATE TABLE IF NOT EXISTS public.green_brain_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL DEFAULT 'Community Contributor',
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    upvotes_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.green_brain_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES public.green_brain_articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (article_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.green_brain_upvotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES public.green_brain_articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (article_id, user_id)
);

-- 13. IN-APP NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.in_app_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'community',
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.green_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.green_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.green_brain_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.green_brain_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.green_brain_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

-- 15. RLS POLICIES (Read: public, Insert/Update/Delete: authorized users)
-- Communities
CREATE POLICY "Public read communities" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Auth users insert communities" ON public.communities FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);
CREATE POLICY "Owners update communities" ON public.communities FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

-- Members
CREATE POLICY "Public read community members" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Users join communities" ON public.community_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users leave communities" ON public.community_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Squads & Members
CREATE POLICY "Public read squads" ON public.squads FOR SELECT USING (true);
CREATE POLICY "Auth users insert squads" ON public.squads FOR INSERT TO authenticated WITH CHECK (auth.uid() = leader_id OR leader_id IS NULL);
CREATE POLICY "Public read squad members" ON public.squad_members FOR SELECT USING (true);
CREATE POLICY "Users join squads" ON public.squad_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users leave squads" ON public.squad_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Challenges
CREATE POLICY "Public read challenges" ON public.green_challenges FOR SELECT USING (true);
CREATE POLICY "Auth users insert challenges" ON public.green_challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id OR creator_id IS NULL);
CREATE POLICY "Users manage challenge participation" ON public.challenge_participations FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Events
CREATE POLICY "Public read events" ON public.green_events FOR SELECT USING (true);
CREATE POLICY "Auth users insert events" ON public.green_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id OR organizer_id IS NULL);
CREATE POLICY "Users manage RSVPs" ON public.event_rsvps FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Posts & Comments
CREATE POLICY "Public read posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Users manage own posts" ON public.community_posts FOR ALL TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Public read likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users manage own likes" ON public.post_likes FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public read comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users insert comments" ON public.post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users delete own comments" ON public.post_comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Green Brain
CREATE POLICY "Public read articles" ON public.green_brain_articles FOR SELECT USING (true);
CREATE POLICY "Users manage own articles" ON public.green_brain_articles FOR ALL TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Users manage bookmarks" ON public.green_brain_bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage upvotes" ON public.green_brain_upvotes FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users read own notifications" ON public.in_app_notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.in_app_notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 16. VOLUNTEER OPPORTUNITIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.volunteer_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
    organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organizer_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    opportunity_date DATE NOT NULL,
    start_time TEXT,
    skills_needed TEXT[] DEFAULT '{}',
    max_volunteers INTEGER DEFAULT 20 CHECK (max_volunteers > 0),
    current_volunteers_count INTEGER DEFAULT 0 CHECK (current_volunteers_count >= 0),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_volunteer_opp_community ON public.volunteer_opportunities(community_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_opp_organizer ON public.volunteer_opportunities(organizer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_opp_date ON public.volunteer_opportunities(opportunity_date);
CREATE INDEX IF NOT EXISTS idx_volunteer_opp_status ON public.volunteer_opportunities(status);

-- ============================================================
-- 17. VOLUNTEER REGISTRATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.volunteer_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (opportunity_id, user_id)
);

ALTER TABLE public.volunteer_registrations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_volunteer_reg_opportunity ON public.volunteer_registrations(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_reg_user ON public.volunteer_registrations(user_id);

-- ============================================================
-- 18. COMMUNITY LEADERBOARD SCORES TABLE
--     Stores computed community scoring snapshots.
--     Score = trees_planted_count*2 + members_count*1 + challenges_hosted*3
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_leaderboard_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    trees_points INTEGER NOT NULL DEFAULT 0,
    members_points INTEGER NOT NULL DEFAULT 0,
    challenges_points INTEGER NOT NULL DEFAULT 0,
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (community_id)
);

ALTER TABLE public.community_leaderboard_scores ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.community_leaderboard_scores(score DESC);

-- ============================================================
-- 19. RLS POLICIES — VOLUNTEER & LEADERBOARD
-- ============================================================

-- Volunteer Opportunities: public read, authenticated insert (by organizer), organizer update/delete
CREATE POLICY "Public read volunteer opportunities"
    ON public.volunteer_opportunities FOR SELECT USING (true);

CREATE POLICY "Auth users create volunteer opportunities"
    ON public.volunteer_opportunities FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers update volunteer opportunities"
    ON public.volunteer_opportunities FOR UPDATE TO authenticated
    USING (auth.uid() = organizer_id)
    WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers delete volunteer opportunities"
    ON public.volunteer_opportunities FOR DELETE TO authenticated
    USING (auth.uid() = organizer_id);

-- Volunteer Registrations: registrant or organizer can read; user inserts own; user updates own
CREATE POLICY "Users read own registrations or as organizer"
    ON public.volunteer_registrations FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id
        OR auth.uid() = (
            SELECT organizer_id FROM public.volunteer_opportunities
            WHERE id = opportunity_id LIMIT 1
        )
    );

CREATE POLICY "Users register for opportunities"
    ON public.volunteer_registrations FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own registration status"
    ON public.volunteer_registrations FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cancel own registrations"
    ON public.volunteer_registrations FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Community Leaderboard Scores: public read; no direct writes (managed by backend/triggers)
CREATE POLICY "Public read leaderboard scores"
    ON public.community_leaderboard_scores FOR SELECT USING (true);

-- ============================================================
-- 20. GRANTS — TABLE-SPECIFIC (replaces broad schema-wide grant)
-- ============================================================

-- Batch 3 tables — anon read-only where public data is intended
GRANT SELECT ON public.communities TO anon;
GRANT SELECT ON public.community_members TO anon;
GRANT SELECT ON public.squads TO anon;
GRANT SELECT ON public.squad_members TO anon;
GRANT SELECT ON public.green_challenges TO anon;
GRANT SELECT ON public.challenge_participations TO anon;
GRANT SELECT ON public.green_events TO anon;
GRANT SELECT ON public.event_rsvps TO anon;
GRANT SELECT ON public.community_posts TO anon;
GRANT SELECT ON public.post_likes TO anon;
GRANT SELECT ON public.post_comments TO anon;
GRANT SELECT ON public.green_brain_articles TO anon;
GRANT SELECT ON public.green_brain_bookmarks TO anon;
GRANT SELECT ON public.green_brain_upvotes TO anon;
GRANT SELECT ON public.volunteer_opportunities TO anon;
GRANT SELECT ON public.community_leaderboard_scores TO anon;
-- anon has no access to volunteer_registrations (private: registrant & organizer only)
-- anon has no access to in_app_notifications (private: owner only)

-- Authenticated users — full DML on appropriate tables (RLS enforces row-level rules)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.communities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.squads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.squad_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.green_challenges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenge_participations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.green_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_rsvps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_likes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.green_brain_articles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.green_brain_bookmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.green_brain_upvotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.in_app_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_opportunities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_registrations TO authenticated;
GRANT SELECT ON public.community_leaderboard_scores TO authenticated;
-- leaderboard scores are read-only for all; computed server-side only

-- ============================================================
-- 21. SECURE VOLUNTEER COUNT SYNCHRONIZATION RPC
-- ============================================================
-- Synchronizes current_volunteers_count on volunteer_opportunities
-- based on actual verified registrations.
-- • Requires caller to be authenticated.
-- • Requires caller to have an active registration for this opportunity.
-- • Calculates truthful count from active registrations to prevent inflation.
-- • Automatically updates status to 'full' if max capacity reached.
CREATE OR REPLACE FUNCTION public.increment_volunteer_count(opp_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_uid UUID;
    v_actual_count INT;
    v_max INT;
    v_curr_status TEXT;
BEGIN
    -- 1. Validate caller authentication
    v_uid := auth.uid();
    IF v_uid IS NULL THEN
        RAISE EXCEPTION '[UNAUTHORIZED] Authentication required to update volunteer registration.';
    END IF;

    -- 2. Verify caller has an active registration for this opportunity
    IF NOT EXISTS (
        SELECT 1 FROM public.volunteer_registrations
        WHERE opportunity_id = opp_id AND user_id = v_uid AND status = 'registered'
    ) THEN
        RAISE EXCEPTION '[FORBIDDEN] Caller does not have an active registration for opportunity %.', opp_id;
    END IF;

    -- 3. Calculate true active registration count (idempotent, prevents inflation / double counting)
    SELECT COUNT(*) INTO v_actual_count
    FROM public.volunteer_registrations
    WHERE opportunity_id = opp_id AND status = 'registered';

    -- 4. Lock opportunity row and update count and capacity status
    SELECT max_volunteers, status INTO v_max, v_curr_status
    FROM public.volunteer_opportunities
    WHERE id = opp_id
    FOR UPDATE;

    IF FOUND THEN
        UPDATE public.volunteer_opportunities
        SET current_volunteers_count = v_actual_count,
            status = CASE 
                WHEN v_max IS NOT NULL AND v_actual_count >= v_max AND status = 'open' THEN 'full'
                WHEN v_max IS NOT NULL AND v_actual_count < v_max AND status = 'full' THEN 'open'
                ELSE status
            END,
            updated_at = NOW()
        WHERE id = opp_id;
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_volunteer_count(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_volunteer_count(UUID) TO authenticated;

-- ============================================================
-- 22. AUTOMATIC VOLUNTEER COUNT & STATUS SYNCHRONIZATION TRIGGER
-- ============================================================
-- Automatically keeps volunteer_opportunities.current_volunteers_count
-- and status in sync whenever registrations are inserted, updated, or deleted.
-- • Idempotent & derived from actual 'registered' rows.
-- • Switches 'open' -> 'full' when capacity is met.
-- • Reopens 'full' -> 'open' when cancellations free up spots.
-- • Preserves manual organizer states ('completed', 'cancelled').
CREATE OR REPLACE FUNCTION public.sync_volunteer_opportunity_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_opp_id UUID;
    v_actual_count INT;
    v_max INT;
    v_curr_status TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_opp_id := OLD.opportunity_id;
    ELSE
        v_opp_id := NEW.opportunity_id;
    END IF;

    IF v_opp_id IS NOT NULL THEN
        -- 1. Sync primary opportunity
        SELECT COUNT(*) INTO v_actual_count
        FROM public.volunteer_registrations
        WHERE opportunity_id = v_opp_id AND status = 'registered';

        SELECT max_volunteers, status INTO v_max, v_curr_status
        FROM public.volunteer_opportunities
        WHERE id = v_opp_id
        FOR UPDATE;

        IF FOUND THEN
            UPDATE public.volunteer_opportunities
            SET current_volunteers_count = v_actual_count,
                status = CASE 
                    WHEN v_max IS NOT NULL AND v_actual_count >= v_max AND status = 'open' THEN 'full'
                    WHEN v_max IS NOT NULL AND v_actual_count < v_max AND status = 'full' THEN 'open'
                    ELSE status
                END,
                updated_at = NOW()
            WHERE id = v_opp_id;
        END IF;
    END IF;

    -- 2. If UPDATE modified opportunity_id, sync previous opportunity as well
    IF TG_OP = 'UPDATE' AND OLD.opportunity_id IS NOT NULL AND OLD.opportunity_id IS DISTINCT FROM NEW.opportunity_id THEN
        SELECT COUNT(*) INTO v_actual_count
        FROM public.volunteer_registrations
        WHERE opportunity_id = OLD.opportunity_id AND status = 'registered';

        SELECT max_volunteers, status INTO v_max, v_curr_status
        FROM public.volunteer_opportunities
        WHERE id = OLD.opportunity_id
        FOR UPDATE;

        IF FOUND THEN
            UPDATE public.volunteer_opportunities
            SET current_volunteers_count = v_actual_count,
                status = CASE 
                    WHEN v_max IS NOT NULL AND v_actual_count >= v_max AND status = 'open' THEN 'full'
                    WHEN v_max IS NOT NULL AND v_actual_count < v_max AND status = 'full' THEN 'open'
                    ELSE status
                END,
                updated_at = NOW()
            WHERE id = OLD.opportunity_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_volunteer_count ON public.volunteer_registrations;
CREATE TRIGGER trg_sync_volunteer_count
    AFTER INSERT OR UPDATE OF status, opportunity_id OR DELETE
    ON public.volunteer_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_volunteer_opportunity_count();

REVOKE EXECUTE ON FUNCTION public.sync_volunteer_opportunity_count() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_volunteer_opportunity_count() TO authenticated;

