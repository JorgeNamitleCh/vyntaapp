import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { salesService } from '../../sales/services/sales.service';
import { expenseService } from '../../expenses/services/expense.service';
import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  subWeeks, subMonths, subYears, subDays,
  eachDayOfInterval, eachMonthOfInterval, format, getHours,
} from 'date-fns';
import { es } from 'date-fns/locale';

export type Period = 'Día' | 'Semana' | 'Mes' | 'Año';

const getRange = (period: Period, now: Date) => {
  switch (period) {
    case 'Día':    return { from: startOfDay(now),   to: endOfDay(now)   };
    case 'Semana': return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'Mes':    return { from: startOfMonth(now), to: endOfMonth(now) };
    case 'Año':    return { from: startOfYear(now),  to: endOfYear(now)  };
  }
};

const getPrevRange = (period: Period, now: Date) => {
  switch (period) {
    case 'Día':    return getRange('Día',    subDays(now, 1));
    case 'Semana': return getRange('Semana', subWeeks(now, 1));
    case 'Mes':    return getRange('Mes',    subMonths(now, 1));
    case 'Año':    return getRange('Año',    subYears(now, 1));
  }
};

export const useReports = (period: Period) => {
  const tenant   = useAuthStore(s => s.tenant);
  const tenantId = tenant?.id ?? '';
  const [tick, setTick] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['reports', tenantId, period, tick],
    enabled: !!tenantId,
    staleTime: 60_000,
    queryFn: async () => {
      const now   = new Date();
      const range = getRange(period, now);
      const prev  = getPrevRange(period, now);

      const [sales, prevSales, expenses] = await Promise.all([
        salesService.getSalesByDateRange(tenantId, range.from, range.to),
        salesService.getSalesByDateRange(tenantId, prev.from, prev.to),
        expenseService.getByDateRange(tenantId, range.from, range.to),
      ]);

      const revenue     = sales.reduce((s, x) => s + x.total, 0);
      const prevRevenue = prevSales.reduce((s, x) => s + x.total, 0);
      const trendPct    = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : 0;

      const expenseTotal = expenses.reduce((s, x) => s + x.amount, 0);
      const profit       = revenue - expenseTotal;
      const ticketCount  = sales.length;
      const avgTicket    = ticketCount > 0 ? Math.round(revenue / ticketCount) : 0;

      // Chart buckets
      let chartValues: number[] = [];
      let chartLabels: string[] = [];
      let activeDayIdx = 0;

      if (period === 'Día') {
        const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6am-11pm
        chartValues = hours.map(h => {
          return sales
            .filter(s => getHours(s.createdAt) === h)
            .reduce((acc, s) => acc + s.total, 0);
        });
        chartLabels = hours.map(h => `${h}`);
        const curH = getHours(now);
        activeDayIdx = Math.max(0, Math.min(17, curH - 6));
      } else if (period === 'Semana') {
        const days = eachDayOfInterval({ start: range.from, end: range.to });
        chartValues = days.map(d => {
          const dStr = format(d, 'yyyy-MM-dd');
          return sales
            .filter(s => format(s.createdAt, 'yyyy-MM-dd') === dStr)
            .reduce((acc, s) => acc + s.total, 0);
        });
        chartLabels = days.map(d => format(d, 'EEE', { locale: es }).slice(0, 1).toUpperCase());
        activeDayIdx = Math.min(days.length - 1, now.getDay() === 0 ? 6 : now.getDay() - 1);
      } else if (period === 'Mes') {
        const days = eachDayOfInterval({ start: range.from, end: range.to });
        // Group into weeks to keep chart readable
        const weeks: number[] = [0, 0, 0, 0, 0];
        days.forEach(d => {
          const wk = Math.floor((d.getDate() - 1) / 7);
          const dStr = format(d, 'yyyy-MM-dd');
          const dayTotal = sales
            .filter(s => format(s.createdAt, 'yyyy-MM-dd') === dStr)
            .reduce((acc, s) => acc + s.total, 0);
          weeks[wk] = (weeks[wk] ?? 0) + dayTotal;
        });
        chartValues = weeks.filter((_, i) => i * 7 < days.length);
        chartLabels = chartValues.map((_, i) => `S${i + 1}`);
        activeDayIdx = Math.min(chartValues.length - 1, Math.floor((now.getDate() - 1) / 7));
      } else {
        // Año — monthly
        const months = eachMonthOfInterval({ start: range.from, end: range.to });
        chartValues = months.map(m => {
          const mStr = format(m, 'yyyy-MM');
          return sales
            .filter(s => format(s.createdAt, 'yyyy-MM') === mStr)
            .reduce((acc, s) => acc + s.total, 0);
        });
        chartLabels = months.map(m => format(m, 'MMM', { locale: es }).slice(0, 3));
        activeDayIdx = now.getMonth();
      }

      // Top products
      const productMap: Record<string, { revenue: number; units: number }> = {};
      for (const sale of sales) {
        for (const item of sale.items) {
          if (!productMap[item.productName]) productMap[item.productName] = { revenue: 0, units: 0 };
          productMap[item.productName].revenue += item.subtotal;
          productMap[item.productName].units   += item.quantity;
        }
      }
      const topProducts = Object.entries(productMap)
        .sort(([, a], [, b]) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(([name, v]) => ({ name, revenue: v.revenue, units: v.units }));

      const maxRev = topProducts[0]?.revenue ?? 1;

      return {
        revenue, prevRevenue, trendPct,
        chartValues, chartLabels, activeDayIdx,
        profit, ticketCount, avgTicket, expenseTotal,
        topProducts: topProducts.map(p => ({ ...p, barPct: p.revenue / maxRev })),
        periodLabel: period,
      };
    },
  });

  const refresh = useCallback(() => setTick(t => t + 1), []);

  return { data, isLoading, refresh };
};
