import Link from "next/link";
import { Brain } from "lucide-react";

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Brain className="text-violet-400" size={22} />
          <span className="font-bold">EstudoIA</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-gray-500 text-sm mb-10">Última atualização: maio de 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-gray-300">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Quem somos</h2>
            <p>
              O EstudoIA é um serviço de estudo baseado em active recall com inteligência artificial,
              desenvolvido e operado por Antonio Kaue (antonio77kaue@gmail.com).
              Esta política descreve como coletamos, usamos e protegemos seus dados pessoais,
              em conformidade com a Lei Geral de Proteção de Dados — LGPD (Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Dados que coletamos</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Dados de conta:</strong> nome, endereço de email (fornecidos no cadastro via Clerk)</li>
              <li><strong>Conteúdo de estudo:</strong> textos colados ou transcrições de vídeo que você submete</li>
              <li><strong>Histórico de aprendizado:</strong> suas explicações, scores, pontos acertados e dúvidas registradas</li>
              <li><strong>Configurações:</strong> frequência de notificações e preferências de uso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Como usamos seus dados</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Para gerar blocos de estudo a partir do seu conteúdo</li>
              <li>Para avaliar suas explicações e identificar lacunas de aprendizado</li>
              <li>Para enviar emails de revisão (somente com seu consentimento explícito)</li>
              <li>Para exibir estatísticas do seu progresso de estudo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Terceiros que processam seus dados</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Clerk</strong> (clerk.com) — autenticação e gestão de contas</li>
              <li><strong>Supabase</strong> (supabase.com) — armazenamento de dados no banco</li>
              <li><strong>Groq</strong> (groq.com) — processamento de texto pela IA</li>
              <li><strong>Resend</strong> (resend.com) — envio de emails de revisão</li>
              <li><strong>Vercel</strong> (vercel.com) — hospedagem da aplicação</li>
            </ul>
            <p className="mt-2">Todos os provedores possuem políticas de privacidade próprias e processam dados de acordo com as leis aplicáveis.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Retenção de dados</h2>
            <p>
              Seus dados são mantidos enquanto sua conta estiver ativa. Contas sem atividade por mais de
              12 meses receberão um aviso por email com 30 dias de antecedência antes de qualquer exclusão.
              Após solicitação de exclusão, seus dados são removidos em até 72 horas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Seus direitos (LGPD Arts. 18–20)</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Acesso:</strong> solicitar cópia de todos os seus dados</li>
              <li><strong>Portabilidade:</strong> exportar seus dados em formato JSON (disponível na página de perfil)</li>
              <li><strong>Exclusão:</strong> excluir sua conta e todos os dados associados (disponível na página de perfil)</li>
              <li><strong>Revogação de consentimento:</strong> desativar emails a qualquer momento nas configurações</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Contato</h2>
            <p>
              Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato pelo email:{" "}
              <a href="mailto:antonio77kaue@gmail.com" className="text-violet-400 hover:underline">
                antonio77kaue@gmail.com
              </a>
            </p>
          </section>

        </div>
      </div>

      <footer className="border-t border-gray-800 py-6 text-center text-xs text-gray-600">
        <Link href="/privacidade" className="hover:text-gray-400 transition-colors">Privacidade</Link>
        {" · "}
        <Link href="/termos" className="hover:text-gray-400 transition-colors">Termos</Link>
      </footer>
    </div>
  );
}
