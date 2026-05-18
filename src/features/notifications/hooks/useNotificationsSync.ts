import { useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { notificationRepository } from '../../../repositories/firebase/notification.repository';

export const useNotificationsSync = () => {
  const tenantId        = useAuthStore(s => s.tenant?.id);
  const setNotifications = useNotificationStore(s => s.setNotifications);

  useEffect(() => {
    if (!tenantId) return;
    return notificationRepository.subscribe(tenantId, setNotifications);
  }, [tenantId]);
};
