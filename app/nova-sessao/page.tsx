"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  ArrowLeft,
  Sparkles,
  Loader2,
  FileText,
  PlayCircle,
  CheckCircle,
  Mic,
} from "lucide-react";

type Aba = "texto" | "youtube";
type MetodoTranscricao = "legenda" | "whisper" | null;

export default function NovaSessaoPage() {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("texto");

  // Campos comuns
  const [titulo, setTitulo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [precisaUpgrade, setPrecisaUpgrade] = useState(false);

  // Aba Texto
  const [texto, setTexto] = useState("");

  // Aba YouTube
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [transcrevendo, setTranscrevendo] = useState(false);
  const [transcricao, setTranscricao] = useState("");
  const [transcricaoOk, setTranscricaoOk] = useState(false);
  const [metodoTranscricao, setMetodoTranscricao] = useState<MetodoTranscricao>(null);

  // ─── Transcrever YouTube ──────────────────────────────────────────────────────
  const handleTranscrever = async () => {
    if (!youtubeUrl.trim()) {
      setErro("Cole o link do vídeo do YouTube.");
      return;
    }
    setTranscrevendo(true);
    setErro("");
    setTranscricao("");
    setTranscricaoOk(false);
    setMetodoTranscricao(null);

    try {
      const res = await fetch("/api/transcrever-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao buscar transcrição.");
        return;
      }

      setTranscricao(data.texto);
      setMetodoTranscricao(data.metodo);
      setTranscricaoOk(true);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setTranscrevendo(false);
    }
  };

  // ─── Submeter (gerar blocos) ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const conteudo = aba === "texto" ? texto.trim() : transcricao.trim();

    if (conteudo.length < 100) {
      setErro(
        aba === "texto"
          ? "O texto precisa ter pelo menos 100 caracteres para gerar blocos."
          : "Busque a transcrição do vídeo antes de gerar os blocos."
      );
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const res = await fetch("/api/gerar-blocos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo || (aba === "youtube" ? "Aula do YouTube" : "Sessão sem título"),
          texto: conteudo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao processar o conteúdo");
        if (data.upgrade) setPrecisaUpgrade(true);
        return;
      }

      router.push(`/sessao/${data.session_id}`);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const prontoParaGerar =
    aba === "texto" ? texto.trim().length >= 100 : transcricaoOk;

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
          <h1 className="text-2xl font-bold mb-2">
            Escolha o conteúdo para estudar
          </h1>
          <p className="text-gray-400">
            Cole um texto ou a IA extrai a transcrição direto de um vídeo do
            YouTube.
          </p>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-6 bg-gray-900 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => {
              setAba("texto");
              setErro("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              aba === "texto"
                ? "bg-violet-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FileText size={16} />
            Colar texto
          </button>
          <button
            onClick={() => {
              setAba("youtube");
              setErro("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              aba === "youtube"
                ? "bg-red-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <PlayCircle size={16} />
            Link do YouTube
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título da sessão{" "}
              <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder={
                aba === "youtube"
                  ? "Ex: Aula de Biologia Celular"
                  : "Ex: História do Brasil — Período Colonial"
              }
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* ── ABA TEXTO ── */}
          {aba === "texto" && (
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
                  <span className="text-xs text-green-500">
                    ✓ Pronto para gerar
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── ABA YOUTUBE ── */}
          {aba === "youtube" && (
            <div className="space-y-4">
              {/* Input URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Link do vídeo
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => {
                      setYoutubeUrl(e.target.value);
                      setTranscricaoOk(false);
                      setTranscricao("");
                      setMetodoTranscricao(null);
                      setErro("");
                    }}
                    placeholder="https://youtube.com/watch?v=... ou youtu.be/..."
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleTranscrever}
                    disabled={transcrevendo || !youtubeUrl.trim()}
                    className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
                  >
                    {transcrevendo ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Transcrevendo...
                      </>
                    ) : (
                      <>
                        <PlayCircle size={16} />
                        Transcrever
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1.5">
                  Funciona com qualquer vídeo público — com ou sem legenda.
                  Vídeos sem legenda usam o Whisper IA (pode levar ~30s).
                </p>
              </div>

              {/* Loading com aviso de demora */}
              {transcrevendo && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
                  <Loader2
                    size={28}
                    className="animate-spin text-red-400 mx-auto mb-3"
                  />
                  <p className="text-sm text-gray-300 font-medium mb-1">
                    Buscando transcrição...
                  </p>
                  <p className="text-xs text-gray-500">
                    Se o vídeo não tiver legenda, o áudio é transcrito com
                    Whisper — isso pode levar até 30 segundos.
                  </p>
                </div>
              )}

              {/* Preview da transcrição */}
              {transcricaoOk && transcricao && !transcrevendo && (
                <div className="bg-gray-900 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={16} className="text-green-400" />
                    <span className="text-sm font-medium text-green-400">
                      Transcrição obtida!
                    </span>
                    {metodoTranscricao === "whisper" && (
                      <span className="flex items-center gap-1 ml-1 text-xs text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded-full">
                        <Mic size={11} />
                        via Whisper IA
                      </span>
                    )}
                    {metodoTranscricao === "legenda" && (
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                        via legenda
                      </span>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">
                      {transcricao.length.toLocaleString("pt-BR")} caracteres
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-4">
                    {transcricao.slice(0, 500)}
                    {transcricao.length > 500 ? "..." : ""}
                  </p>
                </div>
              )}

              {/* Estado vazio */}
              {!transcricaoOk && !transcrevendo && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                  <PlayCircle size={32} className="text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Cole o link e clique em{" "}
                    <strong className="text-gray-400">Transcrever</strong>{" "}
                    para extrair o conteúdo do vídeo.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Erro de limite do plano — com botão de upgrade */}
          {erro && precisaUpgrade && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-4 text-amber-300 text-sm">
              <p className="font-medium mb-3">{erro}</p>
              <Link
                href="/precos"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl font-semibold text-white text-sm transition-colors"
              >
                Ver plano Pro →
              </Link>
            </div>
          )}

          {/* Erro genérico */}
          {erro && !precisaUpgrade && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {erro}
            </div>
          )}

          {/* Botão gerar */}
          <button
            type="submit"
            disabled={loading || !prontoParaGerar}
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
              Isso leva alguns segundos dependendo do tamanho do conteúdo...
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
