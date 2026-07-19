import { prisma } from '../db';

interface TimeSuggestion {
  day: number;
  hour: number;
  avgEngagement: number;
  label: string;
}

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export async function getBestPostingTimes(accountId: string): Promise<TimeSuggestion[]> {
  const insights = await prisma.postInsight.findMany({
    where: { accountId },
    orderBy: { engagement: 'desc' },
    take: 100,
  });

  if (insights.length < 5) {
    return getDefaultSuggestions();
  }

  const byHour: Record<string, { total: number; count: number }> = {};

  for (const insight of insights) {
    const hour = insight.fetchedAt.getHours();
    const day = insight.fetchedAt.getDay();
    const key = `${day}-${hour}`;
    if (!byHour[key]) byHour[key] = { total: 0, count: 0 };
    byHour[key].total += insight.engagement;
    byHour[key].count++;
  }

  return Object.entries(byHour)
    .map(([key, val]) => {
      const [day, hour] = key.split('-').map(Number);
      return {
        day,
        hour,
        avgEngagement: val.total / val.count,
        label: `${DAY_NAMES[day]} às ${hour}h`,
      };
    })
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 5);
}

function getDefaultSuggestions(): TimeSuggestion[] {
  return [
    { day: 2, hour: 10, avgEngagement: 0, label: 'Terça às 10h' },
    { day: 4, hour: 11, avgEngagement: 0, label: 'Quinta às 11h' },
    { day: 3, hour: 14, avgEngagement: 0, label: 'Quarta às 14h' },
    { day: 1, hour: 9, avgEngagement: 0, label: 'Segunda às 9h' },
    { day: 5, hour: 17, avgEngagement: 0, label: 'Sexta às 17h' },
  ];
}

export function getContentTypeSuggestions(): Array<{ type: string; reason: string }> {
  return [
    { type: 'Carrossel educativo', reason: 'Carrosséis geram 3x mais salvamentos que posts simples' },
    { type: 'Antes e depois', reason: 'Prova social visual — alta taxa de compartilhamento' },
    { type: 'Reels bastidores', reason: 'Conteúdo autêntico aumenta alcance orgânico' },
    { type: 'Depoimento paciente', reason: 'Confiança e autoridade — converte seguidores em leads' },
    { type: 'Dica rápida', reason: 'Posts educativos aumentam salvamentos e alcance' },
  ];
}
