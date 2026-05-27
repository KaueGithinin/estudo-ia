"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Brain,
  ArrowLeft,
  Share2,
  Trash2,
  Download,
  Flame,
  Loader2,
} from "lucide-react";

interface Stats {
  totalBlocos: number;
  totalSessoes: number;
  totalDuvidasResolvidas: number;
  scoresMedio: number;
  streak: number;
  nivel: { emoji: string; label: string };
}

export default function PerfilPage() {
  const { user } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletando, setDeletando] = useState(false);
  const [confirmarDelete, setConfirmarDelete] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/perfil/stats");
        if (!res.ok) throw new Error("falha");
        const data = await res.json();
        setStats(data);
      } catch {
        // stats ficam null — página renderiza sem elas
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleExportar = () => {
    window.location.href = "/api/users/export";
  };

  const handleExcluirConta = async () => {
    setDeletando(true);
    try {
      const res = await fetch("/api/users/delete", { method: "POST" });
      if (res.ok) {
        router.push("/");
      }
    } catch {
      setDeletando(false);
    }
  };

  const handleCompartilhar = () => {
    if (!stats) return;
    const texto = `Já estudei ${stats.totalBlocos} blocos de conteúdo no Ixa com score médio de ${stats.scoresMedio}/100. Aprenda de verdade em ixa.com.br 🧠`;
    navigator.clipboard.writeText(texto).then(() => {
      alert("Copiado! Cole no WhatsApp ou Instagram.");
    });
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Brain className="text-violet-400" size={22} />
            <span className="font-bold">Meu Perfil</span>
          </div>
        </div>
        <UserButton />
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Avatar e nome */}
        <div className="flex items-center gap-4 mb-8">
          {user?.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-full border-2 border-violet-500/30"
            />
          )}
          <div>
            <h1 className="text-xl font-bold">
              {user?.firstName} {user?.lastName}
            </h1>
            {stats && !loading && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg">{stats.nivel.emoji}</span>
                <span className="text-sm text-violet-400 font-medium">{stats.nivel.label}</span>
                <span className="text-gray-600 text-sm">·</span>
                <span className="text-gray-500 text-sm">
                  membro desde{" "}
                  {new Date(user?.createdAt ?? Date.now()).toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-violet-400" />
          </div>
        ) : stats ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { valor: stats.totalBlocos, label: "blocos\nestudados" },
                { valor: stats.totalSessoes, label: "sessões\nconcluídas" },
                { valor: stats.totalDuvidasResolvidas, label: "dúvidas\nresolvidas" },
                { valor: `${stats.scoresMedio}/100`, label: "score\nmédio" },
              ].map(({ valor, label }) => (
                <div
                  key={label}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"
                >
                  <div className="text-3xl font-bold text-white mb-1">{valor}</div>
                  <div className="text-xs text-gray-500 whitespace-pre-line leading-tight">{label}</div>
                </div>
              ))}
            </div>

            {/* Streak */}
            {stats.streak > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
                <Flame size={24} className="text-orange-400 shrink-0" />
                <div>
                  <p className="font-semibold text-orange-300">
                    🔥 {stats.streak} {stats.streak === 1 ? "dia" : "dias"} de streak
                  </p>
                  <p className="text-xs text-orange-400/70">Continue assim — consistência é o segredo!</p>
                </div>
              </div>
            )}

            {/* Botão compartilhar */}
            <button
              onClick={handleCompartilhar}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors mb-8"
            >
              <Share2 size={16} />
              Compartilhar conquista
            </button>
          </>
        ) : null}

        {/* Seção LGPD */}
        <div className="border border-gray-800 rounded-xl p-6">
          <h2 className="font-semibold mb-1">Seus dados</h2>
          <p className="text-gray-500 text-sm mb-4">
            Você pode exportar ou excluir todos os seus dados a qualquer momento,
            conforme a LGPD.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportar}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors"
            >
              <Download size={16} />
              Exportar meus dados
            </button>
            <button
              onClick={() => setConfirmarDelete(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm font-medium text-red-400 transition-colors"
            >
              <Trash2 size={16} />
              Excluir minha conta
            </button>
          </div>
        </div>

        {/* Modal de confirmação de exclusão */}
        {confirmarDelete && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="font-bold text-lg mb-2">Excluir conta?</h3>
              <p className="text-gray-400 text-sm mb-6">
                Todos os seus dados serão excluídos permanentemente: sessões, blocos,
                histórico de reviews e dúvidas. Essa ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmarDelete(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 font-medium text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExcluirConta}
                  disabled={deletando}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 font-medium text-sm transition-colors"
                >
                  {deletando ? "Excluindo..." : "Sim, excluir"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-gray-800 py-6 text-center text-xs text-gray-600">
        <Link href="/privacidade" className="hover:text-gray-400 transition-colors">Privacidade</Link>
        {" · "}
        <Link href="/termos" className="hover:text-gray-400 transition-colors">Termos</Link>
      </footer>
    </div>
  );
}
