import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const bucketName = process.env.SUPABASE_BUCKET_NAME || 'CNTTK23M';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Upload file to Supabase Storage (FREE alternative to Cloudinary)
export const uploadToSupabase = async (
  file: Buffer,
  folder: string,
  filename: string
): Promise<{ url: string; path: string }> => {
  const path = `${folder}/${Date.now()}-${filename}`;
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, {
      contentType: 'auto',
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path);

  return {
    url: publicUrlData.publicUrl,
    path: data.path
  };
};

// Delete file from Supabase Storage
export const deleteFromSupabase = async (path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};

export default supabase;
