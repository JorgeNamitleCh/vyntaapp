import { useState, useCallback } from 'react';
import Contacts from 'react-native-contacts';
import { Alert, Platform } from 'react-native';

export interface ContactEntry {
  name: string;
  phone: string;
}

export const useContactPicker = () => {
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const openPicker = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const permission = await Contacts.requestPermission();
      if (permission !== 'authorized') {
        Alert.alert(
          'Permiso denegado',
          'Activa el acceso a contactos en Ajustes para poder importarlos.',
        );
        return false;
      }
      const all = await Contacts.getAll();
      const entries: ContactEntry[] = all
        .filter(c => c.givenName || c.familyName)
        .map(c => {
          const name = [c.givenName, c.familyName].filter(Boolean).join(' ');
          const phone = c.phoneNumbers?.[0]?.number?.replace(/\s/g, '') ?? '';
          return { name, phone };
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'es'));
      setContacts(entries);
      return true;
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los contactos.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { contacts, isLoading, openPicker };
};
