-- ==============================================================================
-- GREENVERSE — BATCH 2: STORAGE BUCKETS, POLICIES & REALTIME SYNCHRONIZATION
-- Migration: 08_batch2_storage_and_realtime.sql
-- Description:
--   1. Idempotently creates Supabase Storage buckets for Greenverse features:
--      - 'avatars': User profile avatar photos (public read, authenticated user write)
--      - 'trees': Tree planting, sapling, and growth log photos (public read, authenticated user write)
--      - 'projects': Project cover images and milestone media (public read, authenticated user write)
--      - 'evidence': Verification proof, tree protection reports, and bounty claims (public read, authenticated user write)
--      - 'marketplace': Eco-marketplace product and listing photos (public read, authenticated user write)
--      - 'community': Community posts and discussion attachments (public read, authenticated user write)
--   2. Implements hardened RLS policies on storage.objects:
--      - Public SELECT on all public media buckets
--      - Authenticated INSERT restricted to user's own directory: (storage.foldername(name))[1] = auth.uid()::text
--      - Authenticated UPDATE restricted to user's own directory
--      - Authenticated DELETE restricted to user's own directory
--   3. Enables Supabase Realtime publication on designated dynamic tables:
--      - community_posts, post_comments, post_likes
--      - projects, project_updates
--      - volunteer_opportunities, volunteer_registrations
--      - tree_protection_reports, tree_protection_updates
--      - marketplace_listings
--      - user_wallets, wallet_transactions
--      - in_app_notifications
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: STORAGE BUCKETS SETUP
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Avatars Bucket (User Profiles)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB max
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Trees Bucket (Tree Registrations & Growth Logs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'trees',
    'trees',
    true,
    10485760, -- 10MB max
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Projects Bucket (Project Covers & Media)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'projects',
    'projects',
    true,
    10485760, -- 10MB max
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. Evidence Bucket (Bounty Proof, Tree Protection Reports, Verification Queue)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'evidence',
    'evidence',
    true,
    15728640, -- 15MB max
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 5. Marketplace Bucket (Product Photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'marketplace',
    'marketplace',
    true,
    10485760, -- 10MB max
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 6. Community Bucket (Social & Discussion Attachments)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'community',
    'community',
    true,
    10485760, -- 10MB max
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: STORAGE RLS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

-- Ensure RLS is enabled on storage.objects


-- 1. Public Read Policy for Greenverse Media
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Public read Greenverse media'
    ) THEN
        CREATE POLICY "Public read Greenverse media"
            ON storage.objects FOR SELECT
            USING (bucket_id IN ('avatars', 'trees', 'projects', 'evidence', 'marketplace', 'community'));
    END IF;
END $$;

-- 2. Authenticated Upload Policy (Owner folder isolation)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Authenticated upload Greenverse media'
    ) THEN
        CREATE POLICY "Authenticated upload Greenverse media"
            ON storage.objects FOR INSERT
            TO authenticated
            WITH CHECK (
                bucket_id IN ('avatars', 'trees', 'projects', 'evidence', 'marketplace', 'community')
                AND (storage.foldername(name))[1] = auth.uid()::text
            );
    END IF;
END $$;

-- 3. Authenticated Update Policy (Owner only)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Authenticated update Greenverse media'
    ) THEN
        CREATE POLICY "Authenticated update Greenverse media"
            ON storage.objects FOR UPDATE
            TO authenticated
            USING (
                bucket_id IN ('avatars', 'trees', 'projects', 'evidence', 'marketplace', 'community')
                AND (storage.foldername(name))[1] = auth.uid()::text
            )
            WITH CHECK (
                bucket_id IN ('avatars', 'trees', 'projects', 'evidence', 'marketplace', 'community')
                AND (storage.foldername(name))[1] = auth.uid()::text
            );
    END IF;
END $$;

-- 4. Authenticated Delete Policy (Owner only)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'Authenticated delete Greenverse media'
    ) THEN
        CREATE POLICY "Authenticated delete Greenverse media"
            ON storage.objects FOR DELETE
            TO authenticated
            USING (
                bucket_id IN ('avatars', 'trees', 'projects', 'evidence', 'marketplace', 'community')
                AND (storage.foldername(name))[1] = auth.uid()::text
            );
    END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: REPLICA IDENTITY (Required for Realtime UPDATE/DELETE payloads)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.community_posts REPLICA IDENTITY FULL;
ALTER TABLE public.post_likes REPLICA IDENTITY FULL;
ALTER TABLE public.post_comments REPLICA IDENTITY FULL;
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.volunteer_opportunities REPLICA IDENTITY FULL;
ALTER TABLE public.volunteer_registrations REPLICA IDENTITY FULL;
ALTER TABLE public.tree_protection_reports REPLICA IDENTITY FULL;
ALTER TABLE public.user_wallets REPLICA IDENTITY FULL;
ALTER TABLE public.in_app_notifications REPLICA IDENTITY FULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: REALTIME PUBLICATION CONFIGURATION
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'community_posts',
        'post_comments',
        'post_likes',
        'projects',
        'project_updates',
        'volunteer_opportunities',
        'volunteer_registrations',
        'tree_protection_reports',
        'tree_protection_updates',
        'marketplace_listings',
        'user_wallets',
        'wallet_transactions',
        'in_app_notifications'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tbl
        ) AND NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
              AND schemaname = 'public'
              AND tablename = tbl
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I;', tbl);
        END IF;
    END LOOP;
END $$;
