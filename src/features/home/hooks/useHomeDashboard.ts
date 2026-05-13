import { useState, useEffect, useCallback } from 'react';
import { subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, getHours } from 'date-fns';
import { useAuthStore } from '../../../store/authStore';
import { useProducts } from '../../inventory/hooks/useProducts';
import { salesService } from '../../sales/services/sales.service';
import { Sale } from '../../../types';

export interface HourBar {
  hour: number;
  total: number;
}

const CHART_HOURS = 18; // 6 AM → 11 PM
const CHART_START = 6;

export const useHomeDashboard = () => {
  const tenantId = useAuthStore(s => s.tenant?.id);
  const { products } = useProducts();

  const [todaySales,     setTodaySales]     = useState<Sale[]>([]);
  const [yesterdaySales, setYesterdaySales] = useState<Sale[]>([]);
  const [monthSales,     setMonthSales]     = useState<Sale[]>([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [refreshedAt,    setRefreshedAt]    = useState(0);

  const refresh = useCallback(() => setRefreshedAt(Date.now()), []);

  useEffect(() => {
    if (!tenantId) { setIsLoading(false); return; }
    setIsLoading(true);

    const now  = new Date();
    const yday = subDays(now, 1);

    Promise.all([
      salesService.getTodaySales(tenantId),
      salesService.getSalesByDateRange(tenantId, startOfDay(yday), endOfDay(yday)),
      salesService.getSalesByDateRange(tenantId, startOfMonth(now), endOfMonth(now)),
    ]).then(([today, yesterday, month]) => {
      setTodaySales(today);
      setYesterdaySales(yesterday);
      setMonthSales(month);
    }).finally(() => setIsLoading(false));
  }, [tenantId, refreshedAt]);

  // ── Totals ────────────────────────────────────────────────
  const todayTotal     = todaySales.reduce((s, sale) => s + sale.total, 0);
  const monthTotal     = monthSales.reduce((s, sale) => s + sale.total, 0);
  const yesterdayTotal = yesterdaySales.reduce((s, sale) => s + sale.total, 0);
  const ticketCount    = todaySales.length;
  const avgTicket      = ticketCount > 0 ? Math.round(todayTotal / ticketCount) : 0;
  const cashTotal      = todaySales
    .filter(s => s.paymentMethod === 'cash')
    .reduce((s, sale) => s + sale.total, 0);

  const trendPct: number | null = yesterdayTotal > 0
    ? Math.round(((todayTotal - yesterdayTotal) / yesterdayTotal) * 100)
    : null;

  // ── Hourly bar chart (6 AM – 11 PM = 18 bars) ────────────
  const hourlyBars: HourBar[] = Array.from({ length: CHART_HOURS }, (_, i) => ({
    hour:  CHART_START + i,
    total: 0,
  }));

  todaySales.forEach(sale => {
    const h = getHours(sale.createdAt);
    const idx = h - CHART_START;
    if (idx >= 0 && idx < CHART_HOURS) {
      hourlyBars[idx].total += sale.total;
    }
  });

  const currentHourIdx = Math.min(
    Math.max(getHours(new Date()) - CHART_START, 0),
    CHART_HOURS - 1,
  );

  // ── Low stock ─────────────────────────────────────────────
  const lowStockProducts = products.filter(
    p => p.controlStock && p.stock >= 0 && p.alertAt != null && p.stock <= p.alertAt,
  );

  // ── Recent sales (last 5) ─────────────────────────────────
  const recentSales = todaySales.slice(0, 5);

  return {
    isLoading,
    refresh,
    todayTotal,
    monthTotal,
    yesterdayTotal,
    ticketCount,
    avgTicket,
    cashTotal,
    trendPct,
    hourlyBars,
    currentHourIdx,
    lowStockProducts,
    recentSales,
  };
};
