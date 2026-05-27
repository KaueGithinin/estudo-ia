import Link from "next/link";
import { BookOpen, Brain, Target, Bell, ChevronRight, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="text-violet-400" size={24} />
          <span className="font-bold text-lg">EstudoIA</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/precos"
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Preços
          </Link>
          <Link
            href="/sign-in"
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors"
          >
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-400 mb-8">
          <Zap size={14} />
          Active Recall com Inteligência Artificial
        </div>

        <h1 className="text-5xl font-bold leading-tight mb-6">
          Você estuda, entende,{" "}
          <span className="text-violet-400">mas esquece.</span>
          <br />
          Vamos resolver isso.
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Cole qualquer conteúdo que você está estudando. A IA divide em blocos,
          você explica com suas palavras, e a IA te diz exatamente o que você
          realmente sabe — e o que esqueceu.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 rounded-xl font-semibold text-lg transition-colors"
          >
            Começar agora — é grátis
            <ChevronRight size={20} />
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-lg transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Como funciona */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Como funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="text-violet-400" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">1. Cole o conteúdo</h3>
            <p className="text-gray-400 text-sm">
              Cole qualquer texto — resumo, transcrição, artigo. A IA divide
              automaticamente em blocos de estudo lógicos.
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4">
              <Brain className="text-violet-400" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">
              2. Explique com suas palavras
            </h3>
            <p className="text-gray-400 text-sm">
              Leia cada bloco e explique o que entendeu. Sem copiar — use suas
              próprias palavras como se estivesse ensinando alguém.
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4">
              <Target className="text-violet-400" size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-2">3. Veja o que esqueceu</h3>
            <p className="text-gray-400 text-sm">
              A IA avalia sua explicação, aponta o que acertou e salva
              automaticamente os pontos que você esqueceu para revisar depois.
            </p>
          </div>
        </div>
      </section>

      {/* Feature: Aba de dúvidas */}
      <section className="max-w-4xl mx-auto px-6 py-8 pb-20">
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 flex flex-col md:flex-row gap-8 items-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <Bell className="text-amber-400" size={32} />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Revisão cirúrgica — só o que você não sabe
            </h3>
            <p className="text-gray-400">
              Todas as suas lacunas ficam salvas em{" "}
              <strong className="text-white">&ldquo;Minhas Dúvidas&rdquo;</strong>
              . Sem precisar reler tudo — só os pontos específicos que você ainda
              não domina. Revisar 5 minutos por dia vale mais do que estudar 2
              horas de uma vez.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-500">
        <p className="mb-2">EstudoIA — Aprenda de verdade, não só no dia da prova.</p>
        <p className="text-xs text-gray-600">
          <Link href="/privacidade" className="hover:text-gray-400 transition-colors">Privacidade</Link>
          {" · "}
          <Link href="/termos" className="hover:text-gray-400 transition-colors">Termos</Link>
          {" · "}
          <Link href="/precos" className="hover:text-gray-400 transition-colors">Preços</Link>
        </p>
      </footer>
    </main>
  );
}
