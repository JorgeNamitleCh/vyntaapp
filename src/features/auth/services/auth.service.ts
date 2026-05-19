import firestore from '@react-native-firebase/firestore';
import { firebaseAuthRepository } from '../../../repositories/firebase/auth.repository';
import { useAuthStore } from '../../../store/authStore';
import { User, Tenant } from '../../../types';
import { COLLECTIONS } from '../../../config/firebase';

const repository = firebaseAuthRepository;

export const authService = {
  sendOtp(phoneNumber: string): Promise<string> {
    return repository.sendOtp(phoneNumber);
  },

  signInWithGoogle(): Promise<{ isNewUser: boolean }> {
    return repository.signInWithGoogle().then(async cred => {
      const userDoc = await firestore().collection(COLLECTIONS.USERS).doc(cred.uid).get();
      return { isNewUser: !userDoc.exists };
    });
  },

  signInWithApple(): Promise<{ isNewUser: boolean }> {
    return repository.signInWithApple().then(async cred => {
      const userDoc = await firestore().collection(COLLECTIONS.USERS).doc(cred.uid).get();
      return { isNewUser: !userDoc.exists };
    });
  },

  async verifyOtp(verificationId: string, code: string): Promise<{ isNewUser: boolean }> {
    const cred = await repository.verifyOtp(verificationId, code);
    const userDoc = await firestore().collection(COLLECTIONS.USERS).doc(cred.uid).get();
    return { isNewUser: !userDoc.exists };
  },

  async signOut(): Promise<void> {
    await repository.signOut();
    useAuthStore.getState().clear();
  },

  async deleteAccount(): Promise<void> {
    const { user } = useAuthStore.getState();
    if (user?.uid) {
      await firestore().collection(COLLECTIONS.USERS).doc(user.uid).delete();
    }
    await repository.deleteAccount();
    // signOut fuerza que Firebase limpie la sesión local y dispara onAuthStateChanged(null)
    // garantizando que el RootNavigator redirija a Auth aunque el listener llegue tarde
    try { await repository.signOut(); } catch (_) {}
    useAuthStore.getState().clear();
  },

  initAuthListener(): () => void {
    useAuthStore.getState().setLoading(true);

    return repository.onAuthStateChanged(async cred => {
      const { setUser, setTenant, setLoading, clear } = useAuthStore.getState();

      if (!cred) {
        clear();
        return;
      }

      try {
        const userDoc = await firestore().collection(COLLECTIONS.USERS).doc(cred.uid).get();

        if (!userDoc.exists) {
          setUser({ uid: cred.uid, phone: cred.phoneNumber ?? undefined, tenantId: '' });
          setLoading(false);
          return;
        }

        const userData = userDoc.data() as User;
        setUser(userData);

        if (userData.tenantId) {
          const tenantDoc = await firestore().collection(COLLECTIONS.TENANTS).doc(userData.tenantId).get();
          if (tenantDoc.exists) {
            setTenant({ id: tenantDoc.id, ...tenantDoc.data() } as Tenant);
          }
        }
      } finally {
        setLoading(false);
      }
    });
  },
};
