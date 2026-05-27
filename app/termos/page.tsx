import Link from "next/link";
import { Brain } from "lucide-react";

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <Brain className="text-violet-400" size={22} />
          <span className="font-bold">Ixa</span>
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
        <p className="text-gray-500 text-sm mb-10">Última atualização: maio de 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-gray-300">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Aceitação dos termos</h2>
            <p>
              Ao criar uma conta ou usar o Ixa, você concorda com estes Termos de Uso.
              Se você não concordar, não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Descrição do serviço</h2>
            <p>
              O Ixa é uma plataforma de estudo que utiliza inteligência artificial para
              dividir conteúdos em blocos temáticos, avaliar explicações dos usuários e
              identificar lacunas de aprendizado. O serviço é oferecido em plano gratuito
              (com limitações) e plano pago (Pro).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Elegibilidade</h2>
            <p>
              O serviço é destinado a pessoas com 13 anos ou mais. Menores de 18 anos
              devem ter consentimento de um responsável legal para criar uma conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Uso aceitável</h2>
            <p>Você concorda em não usar o serviço para:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Enviar conteúdo ilegal, ofensivo ou que viole direitos de terceiros</li>
              <li>Tentar acessar dados de outros usuários</li>
              <li>Sobrecarregar os servidores com requisições automáticas ou scripts</li>
              <li>Revender, sublicenciar ou redistribuir o serviço sem autorização</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Seus conteúdos</h2>
            <p>
              O conteúdo que você cola ou submete (textos, transcrições) é de sua
              responsabilidade. Você mantém todos os direitos sobre esse conteúdo.
              Ao submeter, você nos concede licença limitada apenas para processar o
              conteúdo com IA e exibi-lo a você — nunca para outros fins.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Planos e pagamentos</h2>
            <p>
              O plano gratuito permite até 3 sessões por mês. O plano Pro oferece sessões
              ilimitadas e funcionalidades adicionais pelo valor informado na{" "}
              <Link href="/precos" className="text-violet-400 hover:underline">página de preços</Link>.
              Pagamentos são processados pelo Stripe. Assinaturas podem ser canceladas a qualquer momento
              e o acesso Pro permanece até o fim do período pago.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Limitação de responsabilidade</h2>
            <p>
              O Ixa é fornecido &ldquo;como está&rdquo;. Não garantimos que o serviço
              será ininterrupto ou livre de erros. Não somos responsáveis por decisões
              tomadas com base nas avaliações geradas pela IA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Encerramento de conta</h2>
            <p>
              Você pode excluir sua conta a qualquer momento na página de perfil.
              Podemos suspender ou encerrar contas que violem estes termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Contato</h2>
            <p>
              Dúvidas sobre estes termos:{" "}
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
