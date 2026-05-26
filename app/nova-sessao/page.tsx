"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, ArrowLeft, Sparkles, Loader2 } from "lucide-react";

export default function NovaSessaoPage() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (texto.trim().length < 100) {
      setErro("O texto precisa ter pelo menos 100 caracteres para gerar blocos.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const response = await fetch("/api/gerar-blocos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo || "Sessão sem título",
          texto,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.error || "Erro ao processar o conteúdo");
        return;
      }

      router.push(`/sessao/${data.session_id}`);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <Brain className="text-violet-400" size={22} />
          <span className="font-bold">Nova Sessão de Estudo</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Cole o conteúdo para estudar</h1>
          <p className="text-gray-400">
            Pode ser qualquer texto: resumo de aula, transcrição de vídeo, artigo,
            capítulo de livro... A IA vai dividir em blocos e você estuda um de cada vez.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título da sessão
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: História do Brasil — Período Colonial"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Texto */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Conteúdo para estudar{" "}
              <span className="text-gray-500 font-normal">
                (mínimo 100 caracteres)
              </span>
            </label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Cole aqui o texto, transcrição ou resumo que você quer estudar..."
              rows={14}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none font-mono text-sm"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-600">
                {texto.length} caracteres
              </span>
              {texto.length >= 100 && (
                <span className="text-xs text-green-500">✓ Pronto para gerar</span>
              )}
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {erro}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading || texto.trim().length < 100}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                A IA está criando os blocos...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Gerar Blocos de Estudo
              </>
            )}
          </button>

          {loading && (
            <p className="text-center text-sm text-gray-500">
              Isso leva alguns segundos dependendo do tamanho do texto...
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
