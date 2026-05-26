"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Block, EvaluationResult } from "@/lib/types";

type Phase = "reading" | "explaining" | "result";

export default function BlocoPage() {
  const { id, blocoId } = useParams<{ id: string; blocoId: string }>();
  const router = useRouter();

  const [block, setBlock] = useState<Block | null>(null);
  const [phase, setPhase] = useState<Phase>("reading");
  const [explicacao, setExplicacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function loadBlock() {
      const { data } = await supabase
        .from("blocks")
        .select("*")
        .eq("id", blocoId)
        .single();
      setBlock(data);
    }
    loadBlock();
  }, [blocoId]);

  const handleExplicar = async () => {
    if (explicacao.trim().length < 20) {
      setErro("Escreva pelo menos uma frase explicando o que entendeu.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const response = await fetch("/api/avaliar-explicacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloco_id: blocoId,
          explicacao,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.error || "Erro ao avaliar explicação");
        return;
      }

      setResult(data.avaliacao);
      setPhase("result");
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleTentarNovamente = () => {
    setExplicacao("");
    setResult(null);
    setErro("");
    setPhase("reading");
  };

  if (!block) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link
          href={`/sessao/${id}`}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2 min-w-0">
          <Brain className="text-violet-400 shrink-0" size={22} />
          <span className="font-bold truncate">{block.title}</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* ── FASE 1: LEITURA ── */}
        {(phase === "reading" || phase === "explaining") && (
          <div className="space-y-6">
            {/* Conteúdo do bloco */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">{block.title}</h2>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                {block.content}
              </div>

              {/* Key points */}
              {block.key_points && block.key_points.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h3 className="text-sm font-semibold text-violet-400 mb-3 uppercase tracking-wide">
                    Pontos-chave deste bloco
                  </h3>
                  <ul className="space-y-2">
                    {block.key_points.map((point: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="text-violet-500 mt-0.5">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Área de explicação */}
            {phase === "reading" && (
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-4">
                  Leu o conteúdo acima? Agora feche os olhos por alguns segundos e...
                </p>
                <button
                  onClick={() => setPhase("explaining")}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 rounded-xl font-semibold text-lg transition-colors"
                >
                  Pronto — vou explicar com minhas palavras
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {phase === "explaining" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Explique com suas palavras o que você entendeu deste bloco
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    💡 Dica: explique como se estivesse ensinando um amigo. Não precisa ser
                    perfeito — o importante é tentar lembrar.
                  </p>
                  <textarea
                    value={explicacao}
                    onChange={(e) => setExplicacao(e.target.value)}
                    placeholder="Ex: Nesse bloco aprendi que..."
                    rows={8}
                    autoFocus
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none text-sm"
                  />
                  <div className="text-xs text-gray-600 mt-1">
                    {explicacao.length} caracteres
                  </div>
                </div>

                {erro && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {erro}
                  </div>
                )}

                <button
                  onClick={handleExplicar}
                  disabled={loading || explicacao.trim().length < 20}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Avaliando sua explicação...
                    </>
                  ) : (
                    "Avaliar minha explicação →"
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── FASE 2: RESULTADO ── */}
        {phase === "result" && result && (
          <div className="space-y-6">
            {/* Score */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <div className="text-6xl font-bold mb-2">
                <span
                  className={
                    result.score >= 70
                      ? "text-green-400"
                      : result.score >= 40
                      ? "text-amber-400"
                      : "text-red-400"
                  }
                >
                  {result.score}
                </span>
                <span className="text-3xl text-gray-600">/100</span>
              </div>
              <p className="text-gray-300 italic">&ldquo;{result.encouragement}&rdquo;</p>
            </div>

            {/* Pontos certos */}
            {result.correct_points.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                <h3 className="flex items-center gap-2 font-semibold text-green-400 mb-4">
                  <CheckCircle size={18} />
                  O que você acertou ({result.correct_points.length})
                </h3>
                <ul className="space-y-2">
                  {result.correct_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pontos que esqueceu */}
            {result.missing_points.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                <h3 className="flex items-center gap-2 font-semibold text-amber-400 mb-4">
                  <AlertCircle size={18} />
                  O que você esqueceu ({result.missing_points.length})
                </h3>
                <ul className="space-y-2">
                  {result.missing_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-amber-500 mt-0.5 shrink-0">!</span>
                      {point}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-amber-600 mt-4">
                  ↳ Esses pontos foram salvos em &ldquo;Minhas Dúvidas&rdquo; para revisão futura.
                </p>
              </div>
            )}

            {/* Correções */}
            {result.corrections.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                <h3 className="flex items-center gap-2 font-semibold text-red-400 mb-4">
                  <XCircle size={18} />
                  O que você explicou errado ({result.corrections.length})
                </h3>
                <div className="space-y-3">
                  {result.corrections.map((c, i) => (
                    <div key={i} className="text-sm">
                      <div className="flex items-start gap-2 text-red-300 mb-1">
                        <span className="shrink-0">✗</span>
                        <span className="line-through opacity-70">{c.wrong}</span>
                      </div>
                      <div className="flex items-start gap-2 text-green-300 ml-4">
                        <span className="shrink-0">→</span>
                        {c.correct}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleTentarNovamente}
                className="flex items-center justify-center gap-2 flex-1 px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
              >
                <RotateCcw size={16} />
                Tentar novamente
              </button>
              <Link
                href={`/sessao/${id}`}
                className="flex items-center justify-center gap-2 flex-1 px-5 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors"
              >
                Próximo bloco
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
