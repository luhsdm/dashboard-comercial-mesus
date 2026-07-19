import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo',
      slug: 'demo',
      plan: 'saas',
      settings: { create: { whatsappEnabled: true, aiAgentsEnabled: true, instagramEnabled: true } },
    },
  });

  const stages = [
    { name: 'Lead Novo', slug: 'lead_novo', order: 0, color: '#4f8ef7', isDefault: true },
    { name: 'Agendado', slug: 'agendado', order: 1, color: '#f7a84f' },
    { name: 'Compareceu', slug: 'compareceu', order: 2, color: '#a84ff7' },
    { name: 'Venda Fechada', slug: 'venda_fechada', order: 3, color: '#4fcf7a', isFinal: true },
    { name: 'Perdida', slug: 'perdida', order: 4, color: '#f74f6f', isFinal: true },
  ];

  for (const stage of stages) {
    await prisma.pipelineStage.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: stage.slug } },
      update: {},
      create: { tenantId: tenant.id, ...stage },
    });
  }

  const hashedPassword = await hash('demo123', 12);
  await prisma.user.upsert({
    where: { email: 'demo@vibecrm.com' },
    update: {},
    create: { email: 'demo@vibecrm.com', password: hashedPassword, name: 'Demo Admin', role: 'AGENCY', tenantId: tenant.id },
  });

  const prompts = [
    {
      name: 'Pré-Qualificação Geral',
      slug: 'pre-qual-geral',
      description: 'Qualificação genérica para qualquer setor',
      industry: 'geral',
      agentType: 'PRE_QUALIFICATION' as const,
      content: `Você é um assistente de pré-qualificação. Faça perguntas para entender a necessidade do lead.
Pergunte: nome, interesse principal, orçamento estimado, urgência.
Ao final, atribua um score de 1 a 10 no formato [SCORE:N].
Seja educado e objetivo.`,
    },
    {
      name: 'Pré-Qualificação Odontologia',
      slug: 'pre-qual-odonto',
      description: 'Qualificação para clínicas odontológicas',
      industry: 'odontologia',
      agentType: 'PRE_QUALIFICATION' as const,
      content: `Você é um assistente de uma clínica odontológica. Qualifique o lead perguntando:
1. Qual procedimento tem interesse (implante, ortodontia, clareamento, etc)
2. Já fez avaliação antes?
3. Tem convênio?
4. Qual a urgência?
Atribua score [SCORE:N] de 1-10. Seja acolhedor.`,
    },
    {
      name: 'Pré-Qualificação Estética',
      slug: 'pre-qual-estetica',
      description: 'Qualificação para clínicas de estética',
      industry: 'estetica',
      agentType: 'PRE_QUALIFICATION' as const,
      content: `Você é um assistente de uma clínica de estética. Qualifique perguntando:
1. Qual procedimento tem interesse
2. Já realizou algum procedimento antes?
3. Tem alguma contraindicação conhecida?
4. Qual seu orçamento?
Score [SCORE:N] de 1-10. Seja empático e profissional.`,
    },
    {
      name: 'Pré-Qualificação Imóveis',
      slug: 'pre-qual-imoveis',
      description: 'Qualificação para corretores de imóveis',
      industry: 'imoveis',
      agentType: 'PRE_QUALIFICATION' as const,
      content: `Você é um assistente imobiliário. Qualifique o lead:
1. Tipo de imóvel (casa, apto, terreno, comercial)
2. Região de interesse
3. Faixa de valor
4. Financiamento ou à vista?
5. Prazo para decisão
Score [SCORE:N] de 1-10.`,
    },
    {
      name: 'Pré-Qualificação Educação',
      slug: 'pre-qual-educacao',
      description: 'Qualificação para instituições de ensino',
      industry: 'educacao',
      agentType: 'PRE_QUALIFICATION' as const,
      content: `Você é um assistente de uma instituição de ensino. Qualifique:
1. Curso de interesse
2. Nível (graduação, pós, técnico, livre)
3. Modalidade preferida (presencial, EAD, híbrido)
4. Quando pretende iniciar?
Score [SCORE:N] de 1-10.`,
    },
    {
      name: 'Kanban Mover Padrão',
      slug: 'kanban-mover-padrao',
      description: 'Move leads no pipeline baseado na qualificação',
      industry: 'geral',
      agentType: 'KANBAN_MOVER' as const,
      content: `Analise a conversa e o score de qualificação do lead.
Estágios disponíveis: {{stages}}
Resumo da conversa: {{summary}}
Score: {{score}}

Regras:
- Score >= 7 e mostrou interesse claro → agendado
- Score >= 5 e compareceu/confirmou → compareceu
- Fechou negócio → venda_fechada
- Sem interesse ou desqualificado → perdida
- Caso contrário → manter

Responda APENAS com o slug do estágio ou "manter".`,
    },
    {
      name: 'Instagram Caption Geral',
      slug: 'insta-caption-geral',
      description: 'Geração de captions para Instagram',
      industry: 'geral',
      agentType: 'INSTAGRAM' as const,
      content: `Gere uma caption profissional para Instagram sobre o tema: {{topic}}
Tom: {{tone}}
Inclua hashtags relevantes.
A caption deve ser envolvente, usar emojis com moderação e ter call-to-action.`,
    },
  ];

  for (const prompt of prompts) {
    await prisma.promptTemplate.upsert({
      where: { slug: prompt.slug },
      update: { content: prompt.content },
      create: { ...prompt, isBuiltIn: true },
    });
  }

  console.log('Seed completed.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
