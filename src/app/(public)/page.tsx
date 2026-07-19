import Link from 'next/link';
import { PRODUCT_NAME, PRODUCT_TAGLINE } from '@/lib/config';

const FEATURES = [
  { title: 'CRM Multi-Tenant', desc: 'Pipeline customizável, kanban drag-and-drop, KPIs em tempo real.' },
  { title: 'Agente WhatsApp', desc: 'Pré-qualificação automática via API oficial do Meta. Sem Evolution ou Chatwoot.' },
  { title: 'Agente Instagram', desc: 'Geração de captions com IA, scheduling, analytics de engagement.' },
  { title: 'Tracking Multicanal', desc: 'Meta Ads + Google Ads + WhatsApp + UTM unificados em um dashboard.' },
  { title: 'Multi-Agente IA', desc: 'LLM flexível (OpenAI, Anthropic, custom). Biblioteca de prompts por indústria.' },
  { title: 'LGPD Compliant', desc: 'Consentimento, exportação e exclusão de dados conforme a lei.' },
];

const PLANS = [
  {
    name: 'Self-Hosted',
    price: 'R$ 497',
    period: 'pagamento único',
    features: ['Código-fonte completo', 'Docker deploy', 'Sem mensalidade', 'Suporte por 30 dias'],
    cta: 'Comprar Agora',
    planType: 'one_time',
  },
  {
    name: 'SaaS',
    price: 'R$ 97',
    period: '/mês',
    features: ['Hospedagem inclusa', 'Atualizações automáticas', 'Suporte prioritário', 'Setup assistido'],
    cta: 'Assinar',
    planType: 'subscription',
    highlight: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-900 text-brand-50">
      <header className="border-b border-brand-400/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-bold tracking-wider text-brand-400">{PRODUCT_NAME}</span>
          <Link href="/login" className="btn-secondary text-xs">Entrar</Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{PRODUCT_TAGLINE}</h1>
        <p className="text-brand-50/50 text-sm md:text-base max-w-2xl mx-auto mb-8">
          CRM completo com agentes de IA para WhatsApp e Instagram. Tracking multicanal. Multi-empresa. Tudo em uma plataforma.
        </p>
        <div className="flex gap-3 justify-center">
          <a href="#pricing" className="btn-primary">Ver Planos</a>
          <a href="#features" className="btn-secondary">Funcionalidades</a>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-xl font-bold text-center mb-8">Funcionalidades</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <div className="text-sm font-bold text-brand-300 mb-2">{f.title}</div>
              <div className="text-[11px] text-brand-50/40">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-xl font-bold text-center mb-8">Planos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`card ${plan.highlight ? 'border-brand-400/30 ring-1 ring-brand-400/20' : ''}`}
            >
              <div className="text-sm font-bold mb-1">{plan.name}</div>
              <div className="text-2xl font-bold text-brand-300 mb-1">
                {plan.price}
                <span className="text-xs text-brand-50/30 font-normal"> {plan.period}</span>
              </div>
              <ul className="space-y-2 my-4">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-brand-50/50 flex items-center gap-2">
                    <span className="text-emerald-400 text-[10px]">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <button className={plan.highlight ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-xl font-bold text-center mb-8">FAQ</h2>
        <div className="space-y-3">
          {[
            { q: 'Preciso de Evolution API ou Chatwoot?', a: 'Não. Usamos a API oficial do Meta WhatsApp Cloud, sem intermediários.' },
            { q: 'Posso usar meu próprio modelo de IA?', a: 'Sim. Suportamos OpenAI, Anthropic e qualquer endpoint compatível com OpenAI (Ollama, vLLM, etc).' },
            { q: 'Funciona para qualquer setor?', a: 'Sim. A biblioteca de prompts inclui templates para odontologia, estética, imóveis, educação e mais.' },
            { q: 'Como funciona o self-hosted?', a: 'Você recebe o código-fonte completo + Docker Compose. Deploy em qualquer VPS com um comando.' },
          ].map((item) => (
            <div key={item.q} className="card">
              <div className="text-xs font-bold text-brand-300 mb-1">{item.q}</div>
              <div className="text-[11px] text-brand-50/40">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-brand-400/10 py-6 text-center">
        <div className="text-[10px] text-brand-50/20">{PRODUCT_NAME} &copy; {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}
