"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  Brain,
  Plus,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Zap,
} from "lucide-react";
import type { StudySession } from "@/lib/types";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroLoad, setErroLoad] = useState(false);
  const [planoAtivado, setPlanoAtivado] = useState(false);

  useEffect(() => {
    // Detectar retorno do Stripe (?plano=ativado)
    const params = new URLSearchParams(window.location.search);
    if (params.get("plano") === "ativado") setPlanoAtivado(true);

    async function loadSessions() {
      try {
        const res = await fetch("/api/sessions");
        if (!res.ok) throw new Error("falha");
        const data = await res.json();
        setSessions(data.sessions || []);
      } catch {
        setErroLoad(true);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const statusIcon = (status: string) => {
    if (status === "completed")
      return <CheckCircle size={16} className="text-green-400" />;
    if (status === "ready")
      return <BookOpen size={16} className="text-violet-400" />;
    if (status === "error")
      return <AlertCircle size={16} className="text-red-400" />;
    return <Clock size={16} className="text-amber-400" />;
  };

  const statusLabel = (status: string) => {
    if (status === "completed") return "Concluído";
    if (status === "ready") return "Pronto para estudar";
    if (status === "error") return "Erro ao processar";
    return "Processando...";
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="text-violet-400" size={24} />
          <span className="font-bold text-lg">Ixa</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/minhas-duvidas"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <AlertCircle size={16} />
            Minhas Dúvidas
          </Link>
          <Link
            href="/perfil"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <User size={16} />
            Perfil
          </Link>
          <UserButton />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Banner de plano ativado (vindo do Stripe) */}
        {planoAtivado && (
          <div className="flex items-center gap-3 bg-violet-500/10 border border-violet-500/30 rounded-xl px-5 py-4 mb-6">
            <Zap size={20} className="text-violet-400 shrink-0" />
            <div>
              <p className="font-semibold text-violet-300">Plano Pro ativado! 🎉</p>
              <p className="text-sm text-violet-400/70">Agora você tem sessões ilimitadas e notificações por email.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Minhas Sessões</h1>
            <p className="text-gray-400 text-sm mt-1">
              Cada sessão é um conteúdo que você está estudando
            </p>
          </div>
          <Link
            href="/nova-sessao"
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors"
          >
            <Plus size={18} />
            Nova Sessão
          </Link>
        </div>

        {/* Lista de sessões */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Carregando...</div>
        ) : erroLoad ? (
          <div className="text-center py-20">
            <AlertCircle size={48} className="text-red-500/50 mx-auto mb-4" />
            <p className="text-gray-400">Erro ao carregar sessões. Recarregue a página.</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              Nenhuma sessão ainda
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Crie sua primeira sessão colando um texto que você quer estudar
            </p>
            <Link
              href="/nova-sessao"
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium transition-colors"
            >
              <Plus size={18} />
              Criar primeira sessão
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/sessao/${session.id}`}
                className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">
                      {session.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(session.created_at).toLocaleDateString(
                        "pt-BR",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 shrink-0">
                    {statusIcon(session.status)}
                    {statusLabel(session.status)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center text-xs text-gray-600">
        <Link href="/privacidade" className="hover:text-gray-400 transition-colors">Privacidade</Link>
        {" · "}
        <Link href="/termos" className="hover:text-gray-400 transition-colors">Termos</Link>
      </footer>
    </div>
  );
}
