import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import { logger } from './logger';

const AVATAR_BUCKET = 'avatars';
const MAX_SIZE = 400; // Max width/height in pixels
const COMPRESSION = 0.8; // JPEG quality

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Request permission to access the photo library
 */
export async function requestMediaPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * Pick an image from the device library
 */
export async function pickImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Take a photo with the camera
 */
export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * Compress and resize image for upload
 */
async function processImage(uri: string): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_SIZE, height: MAX_SIZE } }],
    { compress: COMPRESSION, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!manipulated.base64) {
    throw new Error('Failed to convert image to base64');
  }

  return manipulated.base64;
}

/**
 * Upload avatar to Supabase Storage
 */
export async function uploadAvatar(userId: string, imageUri: string): Promise<UploadResult> {
  try {
    // Process the image (resize and compress)
    const base64 = await processImage(imageUri);
    if (!base64) {
      return { success: false, error: 'Failed to process image' };
    }

    // Generate unique filename
    const fileName = `${userId}/${Date.now()}.jpg`;

    // Delete old avatar files for this user
    const { data: existingFiles } = await supabase.storage.from(AVATAR_BUCKET).list(userId);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map((file) => `${userId}/${file.name}`);
      await supabase.storage.from(AVATAR_BUCKET).remove(filesToDelete);
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(fileName, decode(base64), {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      logger.error('Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(fileName);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    logger.error('Avatar upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete avatar from Supabase Storage
 */
export async function deleteAvatar(userId: string): Promise<boolean> {
  try {
    const { data: existingFiles } = await supabase.storage.from(AVATAR_BUCKET).list(userId);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map((file) => `${userId}/${file.name}`);
      const { error } = await supabase.storage.from(AVATAR_BUCKET).remove(filesToDelete);
      return !error;
    }

    return true;
  } catch (error) {
    logger.error('Delete avatar error:', error);
    return false;
  }
}
