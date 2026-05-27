"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, Check, Zap, ChevronRight } from "lucide-react";

export default function PrecosPage() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleUpgrade = async () => {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErro(data.error || "Erro ao iniciar pagamento. Tente novamente.");
        setLoading(false);
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Brain className="text-violet-400" size={22} />
          <span className="font-bold">EstudoIA</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/sign-in" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
            Entrar
          </Link>
          <Link href="/sign-up" className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors">
            Começar grátis
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Escolha seu plano</h1>
          <p className="text-gray-400 text-lg">Comece grátis, evolua quando precisar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Plano Grátis */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">Grátis</h2>
              <p className="text-gray-400 text-sm">Para experimentar</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$ 0</span>
                <span className="text-gray-500 text-sm">/mês</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "3 sessões de estudo por mês",
                "Geração de blocos com IA",
                "Avaliação de explicações",
                "Minhas Dúvidas",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-gray-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/sign-up"
              className="block w-full text-center py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 font-medium transition-colors"
            >
              Começar grátis
            </Link>
          </div>

          {/* Plano Pro */}
          <div className="bg-violet-600/10 border-2 border-violet-500/40 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="flex items-center gap-1 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                <Zap size={11} />
                RECOMENDADO
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">Pro</h2>
              <p className="text-gray-400 text-sm">Para estudantes sérios</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$ 19</span>
                <span className="text-gray-500 text-sm">/mês</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Sessões ilimitadas",
                "Geração de blocos com IA",
                "Avaliação de explicações",
                "Minhas Dúvidas",
                "Notificações por email",
                "Perfil com estatísticas",
                "Gamificação e streak",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-violet-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 font-semibold transition-colors"
            >
              {loading ? "Redirecionando..." : (
                <>Assinar agora <ChevronRight size={16} /></>
              )}
            </button>
            {erro && (
              <p className="text-xs text-red-400 text-center mt-2">{erro}</p>
            )}
            {!erro && <p className="text-xs text-gray-500 text-center mt-2">Cancele quando quiser</p>}
          </div>
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
