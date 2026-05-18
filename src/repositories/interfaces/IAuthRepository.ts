export interface AuthCredential {
  uid: string;
  phoneNumber: string | null;
  email: string | null;
}

export interface IAuthRepository {
  sendOtp(phoneNumber: string): Promise<string>;
  verifyOtp(verificationId: string, code: string): Promise<AuthCredential>;
  signInWithGoogle(): Promise<AuthCredential>;
  signInWithApple(): Promise<AuthCredential>;
  signOut(): Promise<void>;
  onAuthStateChanged(callback: (cred: AuthCredential | null) => void): () => void;
}
