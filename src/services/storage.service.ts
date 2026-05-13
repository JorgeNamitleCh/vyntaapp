import storage from '@react-native-firebase/storage';

export const storageService = {
  async uploadProductImage(tenantId: string, productId: string, localUri: string): Promise<string> {
    const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `tenants/${tenantId}/products/${productId}.${ext}`;
    const ref = storage().ref(path);
    await ref.putFile(localUri);
    return ref.getDownloadURL();
  },

  async deleteFile(url: string): Promise<void> {
    try {
      await storage().refFromURL(url).delete();
    } catch {
      // ignore — file may not exist
    }
  },
};
