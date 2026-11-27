import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type StorageBucket = 'avatars' | 'trees' | 'projects' | 'evidence' | 'marketplace' | 'community';

export interface UploadOptions {
  bucket: StorageBucket;
  file: File;
  userId: string;
  folder?: string;
}

export interface UploadResult {
  publicUrl: string;
  path: string;
  bucket: StorageBucket;
}

const BUCKET_CONFIGS: Record<StorageBucket, { maxBytes: number; allowedMime: string[]; label: string }> = {
  avatars: {
    maxBytes: 2 * 1024 * 1024, // 2MB
    allowedMime: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    label: 'Profile Avatar'
  },
  trees: {
    maxBytes: 10 * 1024 * 1024, // 10MB
    allowedMime: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif'],
    label: 'Tree & Sapling Photos'
  },
  projects: {
    maxBytes: 10 * 1024 * 1024, // 10MB
    allowedMime: ['image/jpeg', 'image/png', 'image/webp'],
    label: 'Project Cover & Media'
  },
  evidence: {
    maxBytes: 15 * 1024 * 1024, // 15MB
    allowedMime: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'],
    label: 'Field Evidence & Verification Proof'
  },
  marketplace: {
    maxBytes: 10 * 1024 * 1024, // 10MB
    allowedMime: ['image/jpeg', 'image/png', 'image/webp'],
    label: 'Eco-Marketplace Item'
  },
  community: {
    maxBytes: 10 * 1024 * 1024, // 10MB
    allowedMime: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    label: 'Community Feed Attachment'
  }
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(val?: string | null): val is string {
  return typeof val === 'string' && UUID_REGEX.test(val);
}

/**
 * Sanitizes a filename to avoid unsafe characters, spaces, or directory traversal.
 */
function sanitizeFileName(name: string): string {
  const parts = name.split('.');
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, '') : 'jpg';
  const base = parts.join('.')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);
  return `${base || 'upload'}-${Date.now()}.${ext}`;
}

/**
 * Uploads a file to a designated Supabase storage bucket under the user's isolated folder.
 * Path format: {userId}/{folder}/{timestamp-filename}
 * Enforces authenticated RLS: (storage.foldername(name))[1] = auth.uid()::text
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const { bucket, file, userId, folder = 'general' } = options;

  if (!isSupabaseConfigured) {
    throw new Error('Supabase client is not configured with active credentials.');
  }

  if (!userId || !isValidUUID(userId)) {
    throw new Error('An active authenticated user session is required to upload files.');
  }

  // 1. Validate bucket configuration
  const config = BUCKET_CONFIGS[bucket];
  if (!config) {
    throw new Error(`Invalid storage bucket requested: ${bucket}`);
  }

  // 2. Validate MIME type
  if (file.type && !config.allowedMime.includes(file.type.toLowerCase())) {
    throw new Error(
      `Unsupported file type (${file.type}). Allowed types for ${config.label}: ${config.allowedMime.map(m => m.split('/')[1]).join(', ')}`
    );
  }

  // 3. Validate file size
  if (file.size > config.maxBytes) {
    const maxMb = (config.maxBytes / (1024 * 1024)).toFixed(0);
    throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is ${maxMb}MB.`);
  }

  // 4. Clean folder segment and construct object path
  const safeFolder = folder.replace(/[^a-z0-9_-]/gi, '-').toLowerCase() || 'general';
  const safeFileName = sanitizeFileName(file.name);
  const objectPath = `${userId}/${safeFolder}/${safeFileName}`;

  // 5. Upload via Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error(`[Greenverse Storage] Error uploading to ${bucket}/${objectPath}:`, error);
    // Provide user-friendly translation for common storage errors
    if (error.message.includes('row-level security') || error.message.includes('policy')) {
      throw new Error('Permission denied: Storage RLS policy prevented upload. Ensure your account is authenticated.');
    }
    if (error.message.includes('duplicate') || error.message.includes('already exists')) {
      throw new Error('A file with this name already exists in your folder.');
    }
    throw new Error(error.message || 'Failed to upload file to cloud storage.');
  }

  // 6. Generate public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    publicUrl: urlData.publicUrl,
    path: data.path,
    bucket
  };
}

/**
 * Uploads a user profile avatar into the 'avatars' bucket.
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const result = await uploadFile({
    bucket: 'avatars',
    file,
    userId,
    folder: 'profile'
  });
  return result.publicUrl;
}

/**
 * Uploads a tree planting or growth log image into the 'trees' bucket.
 */
export async function uploadTreePhoto(file: File, userId: string, subfolder: string = 'planting'): Promise<string> {
  const result = await uploadFile({
    bucket: 'trees',
    file,
    userId,
    folder: subfolder
  });
  return result.publicUrl;
}

/**
 * Uploads a project cover photo into the 'projects' bucket.
 */
export async function uploadProjectCover(file: File, userId: string, projectId?: string): Promise<string> {
  const result = await uploadFile({
    bucket: 'projects',
    file,
    userId,
    folder: projectId ? `proj-${projectId.slice(0, 8)}` : 'covers'
  });
  return result.publicUrl;
}

/**
 * Uploads verification, tree protection, or bounty proof into the 'evidence' bucket.
 */
export async function uploadEvidence(file: File, userId: string, category: string = 'verification'): Promise<string> {
  const result = await uploadFile({
    bucket: 'evidence',
    file,
    userId,
    folder: category
  });
  return result.publicUrl;
}

/**
 * Uploads an eco-marketplace product photo into the 'marketplace' bucket.
 */
export async function uploadMarketplaceImage(file: File, userId: string): Promise<string> {
  const result = await uploadFile({
    bucket: 'marketplace',
    file,
    userId,
    folder: 'listings'
  });
  return result.publicUrl;
}

/**
 * Uploads a community social post attachment into the 'community' bucket.
 */
export async function uploadCommunityMedia(file: File, userId: string): Promise<string> {
  const result = await uploadFile({
    bucket: 'community',
    file,
    userId,
    folder: 'posts'
  });
  return result.publicUrl;
}

/**
 * Safely deletes a file from a bucket if owned by the user.
 */
export async function deleteStorageFile(bucket: StorageBucket, pathOrUrl: string, userId: string): Promise<boolean> {
  if (!isValidUUID(userId)) return false;

  try {
    // Extract relative path if a full public URL was provided
    let path = pathOrUrl;
    if (pathOrUrl.includes('/storage/v1/object/public/')) {
      const parts = pathOrUrl.split(`/storage/v1/object/public/${bucket}/`);
      if (parts.length > 1) {
        path = parts[1];
      }
    }

    // Safety check: ensure file path belongs to current user
    if (!path.startsWith(`${userId}/`)) {
      console.warn('[Greenverse Storage] Cannot delete file outside user folder:', path);
      return false;
    }

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error('[Greenverse Storage] Error deleting file:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Greenverse Storage] Failed to remove storage file:', err);
    return false;
  }
}
