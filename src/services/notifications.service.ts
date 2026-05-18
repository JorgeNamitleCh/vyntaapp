import { notificationRepository } from '../repositories/firebase/notification.repository';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  TriggerType,
  RepeatFrequency,
  AuthorizationStatus,
} from '@notifee/react-native';
import { Vibration, Platform } from 'react-native';

// ── Channel IDs ──────────────────────────────────────────────
const CH = {
  sales:     'vynta-sales',
  goals:     'vynta-goals',
  reminders: 'vynta-reminders',
};

// ── Notification IDs ─────────────────────────────────────────
export const NOTIF_IDS = {
  dailyReminder: 'daily-no-sales',
  monthlyTax:    'monthly-tax-sat',
};

// ── Cash-register vibration pattern ──────────────────────────
// Short burst × 3 — mimics drawer opening
const CASH_PATTERN = [0, 60, 40, 60, 40, 180];

// ─────────────────────────────────────────────────────────────
export const notificationsService = {

  // Call once on app start
  async setup(): Promise<void> {
    // Request permission
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) return;

    // Android channels
    if (Platform.OS === 'android') {
      await Promise.all([
        notifee.createChannel({
          id:          CH.sales,
          name:        'Ventas',
          importance:  AndroidImportance.HIGH,
          vibration:   true,
          vibrationPattern: CASH_PATTERN,
          visibility:  AndroidVisibility.PUBLIC,
        }),
        notifee.createChannel({
          id:         CH.goals,
          name:       'Metas',
          importance: AndroidImportance.HIGH,
          vibration:  true,
          visibility: AndroidVisibility.PUBLIC,
        }),
        notifee.createChannel({
          id:         CH.reminders,
          name:       'Recordatorios',
          importance: AndroidImportance.DEFAULT,
          visibility: AndroidVisibility.PRIVATE,
        }),
      ]);
    }

    // Schedule recurring notifications
    await this.scheduleDailyReminder();
    await this.scheduleMonthlyTaxReminder();
  },

  // ── Cash-register effect ──────────────────────────────────
  async fireCashRegister(tenantId: string, saleTotal: number): Promise<void> {
    const body = `+$${saleTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    notificationRepository.add(tenantId, { title: '💰 Venta registrada', body, type: 'sale' }).catch(() => {});

    Vibration.vibrate(Platform.OS === 'android' ? CASH_PATTERN : 400);

    await notifee.displayNotification({
      title: '💰 ¡Venta registrada!',
      body,
      android: {
        channelId:       CH.sales,
        smallIcon:       'ic_notification',
        color:           '#0E5C3F',
        pressAction:     { id: 'default' },
        // sound plays from the channel default
      },
      ios: {
        // Uses default notification sound — replace 'default' with 'cash_register'
        // once you add cash_register.caf to the Xcode bundle
        sound:           'default',
        foregroundPresentationOptions: {
          sound: true,
          badge: false,
          banner: true,
        },
      },
    });
  },

  // ── Goal notifications ────────────────────────────────────
  async fireDailyGoalReached(tenantId: string, total: number, goal: number): Promise<void> {
    const body = `Superaste $${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} en ventas hoy. ¡Meta alcanzada!`;
    notificationRepository.add(tenantId, { title: '🎯 Meta del día alcanzada', body, type: 'sale' }).catch(() => {});

    Vibration.vibrate(Platform.OS === 'android' ? [0, 100, 60, 100] : 500);
    await notifee.displayNotification({
      title: '🎯 ¡Meta del día superada!',
      body,
      android: { channelId: CH.goals, smallIcon: 'ic_notification', color: '#0E5C3F', pressAction: { id: 'default' } },
      ios: {
        sound: 'default',
        foregroundPresentationOptions: { sound: true, badge: false, banner: true },
      },
    });
  },

  async fireMonthlyGoalReached(tenantId: string, total: number, goal: number): Promise<void> {
    const body = `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} este mes. Meta de $${goal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} alcanzada.`;
    notificationRepository.add(tenantId, { title: '🏆 Meta del mes alcanzada', body, type: 'sale' }).catch(() => {});

    Vibration.vibrate(Platform.OS === 'android' ? [0, 120, 60, 120, 60, 300] : 600);
    await notifee.displayNotification({
      title: '🏆 ¡Meta del mes superada!',
      body,
      android: { channelId: CH.goals, smallIcon: 'ic_notification', color: '#D97706', pressAction: { id: 'default' } },
      ios: {
        sound: 'default',
        foregroundPresentationOptions: { sound: true, badge: false, banner: true },
      },
    });
  },

  // ── Daily "no sales" reminder at 2pm ─────────────────────
  async scheduleDailyReminder(): Promise<void> {
    const now    = new Date();
    const target = new Date();
    target.setHours(14, 0, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    await notifee.createTriggerNotification(
      {
        id:    NOTIF_IDS.dailyReminder,
        title: '📊 ¿Cómo van las ventas hoy?',
        body:  'Recuerda registrar tus ventas para mantener tu reporte al día.',
        android: { channelId: CH.reminders, smallIcon: 'ic_notification', pressAction: { id: 'default' } },
        ios: {
          sound: 'default',
          foregroundPresentationOptions: { sound: true, badge: false, banner: true },
        },
      },
      {
        type:            TriggerType.TIMESTAMP,
        timestamp:       target.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      },
    );
  },

  // Cancel the daily reminder once the first sale of the day is made
  async cancelDailyReminder(): Promise<void> {
    await notifee.cancelTriggerNotification(NOTIF_IDS.dailyReminder);
  },

  // ── Monthly SAT reminder on the 30th at 9am ──────────────
  // One-shot trigger; rescheduled on next app open if already fired.
  async scheduleMonthlyTaxReminder(): Promise<void> {
    // Skip if already scheduled
    const pending = await notifee.getTriggerNotificationIds();
    if (pending.includes(NOTIF_IDS.monthlyTax)) return;

    const now    = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), 30, 9, 0, 0);
    if (target <= now) {
      target.setMonth(target.getMonth() + 1);
    }

    await notifee.createTriggerNotification(
      {
        id:    NOTIF_IDS.monthlyTax,
        title: '🧾 Reporte mensual SAT',
        body:  'Hoy es día 30. Revisa tus ingresos del mes para tu factura global o declaración ante el SAT.',
        android: { channelId: CH.reminders, smallIcon: 'ic_notification', pressAction: { id: 'default' } },
        ios: {
          sound: 'default',
          foregroundPresentationOptions: { sound: true, badge: false, banner: true },
        },
      },
      {
        type:      TriggerType.TIMESTAMP,
        timestamp: target.getTime(),
        // No repeat — rescheduled on next app open
      },
    );
  },

  // Set up foreground event handler (call once in App.tsx)
  setupForegroundHandler(): () => void {
    return notifee.onForegroundEvent(({ type }) => {
      // Dismiss automatically — no action needed beyond display
    });
  },
};
