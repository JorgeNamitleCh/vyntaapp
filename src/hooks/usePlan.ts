import { useAuthStore } from '../store/authStore';

export const PLAN_LIMITS = {
  free: {
    salesPerMonth:    50,
    products:         100,
    employees:        0,
    businesses:       1,
    canExport:        false,
    canDiscount:      false,
    canAdvancedReports: false,
  },
  pro: {
    salesPerMonth:    Infinity,
    products:         Infinity,
    employees:        3,
    businesses:       1,
    canExport:        true,
    canDiscount:      true,
    canAdvancedReports: true,
  },
  premium: {
    salesPerMonth:    Infinity,
    products:         Infinity,
    employees:        10,
    businesses:       3,
    canExport:        true,
    canDiscount:      true,
    canAdvancedReports: true,
  },
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;

export const PLAN_LABELS: Record<PlanKey, string> = {
  free:    'PLAN GRATUITO',
  pro:     'PLAN PRO',
  premium: 'PLAN PREMIUM',
};

export const usePlan = () => {
  const plan = (useAuthStore(s => s.tenant?.plan) ?? 'free') as PlanKey;
  return {
    plan,
    isFree:    plan === 'free',
    isPro:     plan === 'pro',
    isPremium: plan === 'premium',
    isPaid:    plan === 'pro' || plan === 'premium',
    limits:    PLAN_LIMITS[plan],
    label:     PLAN_LABELS[plan],
  };
};
