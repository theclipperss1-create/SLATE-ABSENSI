import { storage } from './config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadSelfie(file: Blob, userId: string): Promise<string | null> {
  try {
    const filename = `selfies/${userId}_${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading selfie:', error);
    return null;
  }
}
