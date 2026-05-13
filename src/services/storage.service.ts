import storage from '@react-native-firebase/storage';
import { Platform } from 'react-native';

const uploadFile = async (path: string, localUri: string): Promise<string> => {
  const ref      = storage().ref(path);
  const filePath = Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri;
  const task     = ref.putFile(filePath);
  task.catch(() => {});
  await task;
  return ref.getDownloadURL();
};

export const storageService = {
  async uploadLogoImage(tenantId: string, localUri: string): Promise<string> {
    return uploadFile(`tenants/${tenantId}/logo.jpg`, localUri);
  },

  async uploadProductImage(tenantId: string, productId: string, localUri: string): Promise<string> {
    return uploadFile(`tenants/${tenantId}/products/${productId}.jpg`, localUri);
  },

  async deleteFile(url: string): Promise<void> {
    try {
      await storage().refFromURL(url).delete();
    } catch {
      // ignore — file may not exist
    }
  },
};
