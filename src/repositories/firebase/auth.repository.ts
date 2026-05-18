import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import { IAuthRepository, AuthCredential } from '../interfaces/IAuthRepository';

GoogleSignin.configure({
  webClientId: '31919809319-lp6loqs4h8e5e6o753gu05vfpsv2lth8.apps.googleusercontent.com',
  iosClientId: '31919809319-osd5om4pg0t1l96nkajeg7koqssglcih.apps.googleusercontent.com',
});

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

  async signInWithGoogle() {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: false });
    const response = await GoogleSignin.signIn();
    const idToken = response.data?.idToken;
    if (!idToken) throw new Error('No se pudo obtener el token de Google');
    const credential = auth.GoogleAuthProvider.credential(idToken);
    const result = await auth().signInWithCredential(credential);
    return toCredential(result.user);
  },

  async signInWithApple() {
    const appleAuthRequest = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    if (!appleAuthRequest.identityToken) throw new Error('No se pudo obtener el token de Apple');
    const credential = auth.AppleAuthProvider.credential(
      appleAuthRequest.identityToken,
      appleAuthRequest.nonce,
    );
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
