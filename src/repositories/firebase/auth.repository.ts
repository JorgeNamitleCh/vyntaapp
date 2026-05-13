import auth from '@react-native-firebase/auth';
import { IAuthRepository, AuthCredential } from '../interfaces/IAuthRepository';

const toCredential = (user: {
  uid: string;
  phoneNumber: string | null;
  email: string | null;
}): AuthCredential => ({
  uid: user.uid,
  phoneNumber: user.phoneNumber,
  email: user.email,
});

export const firebaseAuthRepository: IAuthRepository = {
  async sendOtp(phoneNumber) {
    if (__DEV__) {
      auth().settings.appVerificationDisabledForTesting = true;
    }
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    if (!confirmation.verificationId) {
      throw new Error('No se pudo iniciar la verificación por SMS');
    }
    return confirmation.verificationId;
  },

  async verifyOtp(verificationId, code) {
    const credential = auth.PhoneAuthProvider.credential(verificationId, code);
    const result = await auth().signInWithCredential(credential);
    return toCredential(result.user);
  },

  signOut() {
    return auth().signOut();
  },

  onAuthStateChanged(callback) {
    return auth().onAuthStateChanged(user => callback(user ? toCredential(user) : null));
  },
};
