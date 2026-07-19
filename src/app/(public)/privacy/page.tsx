import { PRODUCT_NAME } from '@/lib/config';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-900 text-brand-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-6">Política de Privacidade</h1>
        <div className="space-y-4 text-xs text-brand-50/60 leading-relaxed">
          <p>
            O {PRODUCT_NAME} respeita a privacidade dos seus usuários e está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </p>
          <h2 className="text-sm font-bold text-brand-50 mt-6">Dados Coletados</h2>
          <p>Coletamos dados necessários para o funcionamento do CRM: nome, email, telefone, dados de campanhas publicitárias e conversas de WhatsApp.</p>
          <h2 className="text-sm font-bold text-brand-50 mt-6">Uso dos Dados</h2>
          <p>Os dados são utilizados exclusivamente para operação do CRM, automação de agentes de IA e analytics de campanhas.</p>
          <h2 className="text-sm font-bold text-brand-50 mt-6">Direitos do Titular</h2>
          <p>Você pode solicitar exportação ou exclusão dos seus dados a qualquer momento através da seção LGPD nas configurações.</p>
          <h2 className="text-sm font-bold text-brand-50 mt-6">Consentimento</h2>
          <p>O envio de mensagens automatizadas via WhatsApp requer consentimento prévio do contato, registrado em nosso sistema.</p>
          <h2 className="text-sm font-bold text-brand-50 mt-6">Contato</h2>
          <p>Para questões sobre privacidade, entre em contato com o administrador da sua instância.</p>
        </div>
      </div>
    </div>
  );
}
