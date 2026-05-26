"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brain, ArrowLeft, AlertCircle, CheckCircle, BookOpen } from "lucide-react";
import type { Doubt } from "@/lib/types";

export default function MinhasDuvidasPage() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDoubts() {
      const response = await fetch("/api/duvidas");
      const data = await response.json();
      setDoubts(data.doubts || []);
      setLoading(false);
    }
    loadDoubts();
  }, []);

  const handleResolver = async (doubtId: string) => {
    await fetch("/api/duvidas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doubt_id: doubtId }),
    });
    setDoubts((prev) => prev.filter((d) => d.id !== doubtId));
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
          <span className="font-bold">Minhas Dúvidas</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Pontos para revisar</h1>
          <p className="text-gray-400 text-sm">
            Esses são os pontos que você esqueceu ou explicou errado. Revise um de cada
            vez — quando dominar, marque como resolvido.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Carregando...</div>
        ) : doubts.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Nenhuma dúvida pendente!
            </h3>
            <p className="text-gray-500 text-sm">
              Continue estudando novos blocos para ver suas lacunas aqui.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors text-sm"
            >
              <BookOpen size={16} />
              Ir para sessões
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {doubts.map((doubt) => (
              <div
                key={doubt.id}
                className="bg-gray-900 border border-amber-500/20 rounded-xl p-5"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300">{doubt.description}</p>
                    {doubt.block && (
                      <Link
                        href={`/sessao/${(doubt.block as unknown as { session_id: string }).session_id}/bloco/${doubt.block_id}`}
                        className="text-xs text-violet-400 hover:text-violet-300 mt-1 inline-block"
                      >
                        → Bloco: {doubt.block.title}
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={() => handleResolver(doubt.id)}
                    className="shrink-0 flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-green-500/10 border border-transparent hover:border-green-500/20"
                  >
                    <CheckCircle size={14} />
                    Resolvi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
