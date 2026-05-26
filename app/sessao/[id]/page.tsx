"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import NotificacaoConfig from "@/components/NotificacaoConfig";
import type { Block, StudySession } from "@/lib/types";

interface BlockWithStatus extends Omit<Block, "last_score"> {
  review_status: "pending" | "studied" | "with_doubts";
  last_score: number | null;
}

export default function SessaoPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<StudySession | null>(null);
  const [blocks, setBlocks] = useState<BlockWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Buscar sessão
      const { data: sessionData } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("id", id)
        .single();

      setSession(sessionData);

      // Buscar blocos com o score mais recente
      const { data: blocksData } = await supabase
        .from("blocks")
        .select(`
          *,
          reviews(score, missing_points, created_at)
        `)
        .eq("session_id", id)
        .order("order_index");

      if (blocksData) {
        const blocksWithStatus = blocksData.map((block) => {
          const reviews = block.reviews || [];
          if (reviews.length === 0) {
            return { ...block, review_status: "pending" as const, last_score: null };
          }
          // Pegar a review mais recente
          const latest = reviews.sort(
            (a: { created_at: string }, b: { created_at: string }) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];
          const hasDubts =
            latest.missing_points && latest.missing_points.length > 0;
          return {
            ...block,
            review_status: hasDubts
              ? ("with_doubts" as const)
              : ("studied" as const),
            last_score: latest.score,
          };
        });
        setBlocks(blocksWithStatus);
      }

      setLoading(false);
    }
    loadData();
  }, [id]);

  const statusConfig = {
    pending: {
      icon: <Clock size={16} className="text-gray-500" />,
      label: "Não estudado",
      color: "text-gray-500",
    },
    studied: {
      icon: <CheckCircle size={16} className="text-green-400" />,
      label: "Estudado",
      color: "text-green-400",
    },
    with_doubts: {
      icon: <AlertCircle size={16} className="text-amber-400" />,
      label: "Tem dúvidas",
      color: "text-amber-400",
    },
  };

  const totalStudied = blocks.filter((b) => b.review_status !== "pending").length;
  const progress = blocks.length > 0 ? (totalStudied / blocks.length) * 100 : 0;

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
          <span className="font-bold truncate">{session?.title || "Carregando..."}</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Carregando blocos...</div>
        ) : (
          <>
            {/* Progresso */}
            {blocks.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-300">
                    Progresso da sessão
                  </span>
                  <span className="text-sm text-gray-400">
                    {totalStudied} de {blocks.length} blocos
                  </span>
                </div>
                <div className="bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-violet-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Notificações */}
            {id && <div className="mb-6"><NotificacaoConfig sessionId={id} /></div>}

            {/* Lista de blocos */}
            <div className="space-y-3">
              {blocks.map((block, index) => {
                const status = statusConfig[block.review_status];
                return (
                  <Link
                    key={block.id}
                    href={`/sessao/${id}/bloco/${block.id}`}
                    className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-400 shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">
                        {block.title}
                      </h3>
                      <div className={`flex items-center gap-1.5 mt-1 text-sm ${status.color}`}>
                        {status.icon}
                        {status.label}
                        {block.last_score !== null && (
                          <span className="text-gray-600 ml-1">
                            · Score: {block.last_score}/100
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0"
                    />
                  </Link>
                );
              })}
            </div>

            {blocks.length === 0 && (
              <div className="text-center py-20">
                <BookOpen size={48} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum bloco encontrado nessa sessão.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
