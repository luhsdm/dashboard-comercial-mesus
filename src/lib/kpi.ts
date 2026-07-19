import { prisma } from './db';
import type { Decimal } from '@prisma/client/runtime/library';

export interface KpiData {
  total: number;
  agend: number;
  comp: number;
  fech: number;
  receita: number;
  ticket: number;
  taxaConv: number;
  monthlyRevenue: number[];
}

function decimalToNumber(d: Decimal): number {
  return Number(d);
}

export async function computeKpis(clientId: string, year?: number, month?: number): Promise<KpiData> {
  const where: any = { clientId };
  if (year) where.year = year;
  if (month) where.month = month;

  const leads = await prisma.lead.findMany({ where });

  const total = leads.length;
  const agend = leads.filter((l) => ['AGENDADO', 'COMPARECEU', 'VENDA_FECHADA'].includes(l.status)).length;
  const comp = leads.filter((l) => ['COMPARECEU', 'VENDA_FECHADA'].includes(l.status)).length;
  const fech = leads.filter((l) => l.status === 'VENDA_FECHADA').length;
  const receita = leads.reduce((s, l) => s + decimalToNumber(l.revenueCard) + decimalToNumber(l.revenueCash), 0);
  const ticket = fech > 0 ? receita / fech : 0;
  const taxaConv = agend > 0 ? (fech / agend) * 100 : 0;

  const monthlyRevenue = Array(12).fill(0);
  leads
    .filter((l) => l.status === 'VENDA_FECHADA')
    .forEach((l) => {
      if (l.month >= 1 && l.month <= 12) {
        monthlyRevenue[l.month - 1] += decimalToNumber(l.revenueCard) + decimalToNumber(l.revenueCash);
      }
    });

  return { total, agend, comp, fech, receita, ticket, taxaConv, monthlyRevenue };
}

export interface DimensionGroup {
  name: string;
  leads: number;
  agend: number;
  comp: number;
  vendas: number;
  receita: number;
}

export async function computeDimensions(
  clientId: string,
  dimension: 'campaign' | 'adSet' | 'ad' | 'creative' | 'sourceId' | 'platform',
  year?: number,
  month?: number
): Promise<DimensionGroup[]> {
  const where: any = { clientId };
  if (year) where.year = year;
  if (month) where.month = month;

  const leads = await prisma.lead.findMany({ where });
  const groups: Record<string, DimensionGroup> = {};

  for (const lead of leads) {
    const val = ((lead as any)[dimension] || '').trim();
    if (!val) continue;

    if (!groups[val]) groups[val] = { name: val, leads: 0, agend: 0, comp: 0, vendas: 0, receita: 0 };
    groups[val].leads++;

    if (['AGENDADO', 'COMPARECEU', 'VENDA_FECHADA'].includes(lead.status)) groups[val].agend++;
    if (['COMPARECEU', 'VENDA_FECHADA'].includes(lead.status)) groups[val].comp++;
    if (lead.status === 'VENDA_FECHADA') {
      groups[val].vendas++;
      groups[val].receita += decimalToNumber(lead.revenueCard) + decimalToNumber(lead.revenueCash);
    }
  }

  return Object.values(groups).sort((a, b) => b.leads - a.leads);
}
