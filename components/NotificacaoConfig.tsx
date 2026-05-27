"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Send, Loader2, Check, Shield } from "lucide-react";

interface Props {
  sessionId: string;
}

export default function NotificacaoConfig({ sessionId }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState(2);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [consentimentoDado, setConsentimentoDado] = useState(false);

  // Carregar configuração atual
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/notificacoes/configurar?session_id=${sessionId}`);
      const data = await res.json();
      if (data.config) {
        setEnabled(data.config.enabled);
        setFrequency(data.config.frequency_hours);
        if (data.config.consent_given_at) {
          setConsentimentoDado(true);
          setConsentimento(true);
        }
      }
      setLoading(false);
    }
    load();
  }, [sessionId]);

  const handleToggle = async (novoValor: boolean) => {
    // Se está ativando e ainda não deu consentimento, exige checkbox
    if (novoValor && !consentimentoDado && !consentimento) {
      setErro("Você precisa aceitar receber emails antes de ativar as notificações.");
      return;
    }
    setErro("");
    setEnabled(novoValor);
    setSaving(true);
    await fetch("/api/notificacoes/configurar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        enabled: novoValor,
        frequency_hours: frequency,
        consent: consentimento && !consentimentoDado, // só registrar se for novo
      }),
    });
    if (novoValor && consentimento) setConsentimentoDado(true);
    setSaving(false);
  };

  const handleFrequency = async (horas: number) => {
    setFrequency(horas);
    setSaving(true);
    await fetch("/api/notificacoes/configurar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        enabled,
        frequency_hours: horas,
      }),
    });
    setSaving(false);
  };

  const handleEnviarAgora = async () => {
    setSending(true);
    setErro("");
    const res = await fetch("/api/notificacoes/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErro(data.error || "Erro ao enviar");
    } else {
      setEnviado(true);
      setTimeout(() => setEnviado(false), 4000);
    }
    setSending(false);
  };

  if (loading) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {enabled ? (
            <Bell size={18} className="text-violet-400" />
          ) : (
            <BellOff size={18} className="text-gray-500" />
          )}
          <span className="font-medium text-sm">Notificações por email</span>
          {saving && (
            <Loader2 size={14} className="animate-spin text-gray-500" />
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={() => handleToggle(!enabled)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            enabled ? "bg-violet-600" : "bg-gray-700"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Consentimento (mostrar apenas se ainda não deu e está tentando ativar) */}
      {!consentimentoDado && (
        <label className="flex items-start gap-2 cursor-pointer mb-3 p-3 bg-gray-800/60 rounded-lg border border-gray-700">
          <input
            type="checkbox"
            checked={consentimento}
            onChange={(e) => {
              setConsentimento(e.target.checked);
              setErro("");
            }}
            className="mt-0.5 accent-violet-500 shrink-0"
          />
          <span className="text-xs text-gray-400 leading-relaxed">
            <Shield size={11} className="inline mr-1 text-violet-400" />
            Concordo em receber emails de revisão de estudo do Ixa. Posso cancelar
            a qualquer momento desativando as notificações.{" "}
            <a href="/privacidade" className="text-violet-400 hover:underline" target="_blank">
              Política de Privacidade
            </a>
          </span>
        </label>
      )}

      {erro && (
        <p className="text-red-400 text-xs mb-3">{erro}</p>
      )}

      {enabled && (
        <>
          {/* Frequência */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Enviar a cada:</p>
            <div className="flex gap-2">
              {[2, 4, 8, 24].map((h) => (
                <button
                  key={h}
                  onClick={() => handleFrequency(h)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    frequency === h
                      ? "bg-violet-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {h === 24 ? "1 dia" : `${h}h`}
                </button>
              ))}
            </div>
          </div>

          {/* Botão enviar agora */}
          <button
            onClick={handleEnviarAgora}
            disabled={sending || enviado}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
          >
            {sending ? (
              <><Loader2 size={16} className="animate-spin" /> Enviando...</>
            ) : enviado ? (
              <><Check size={16} className="text-green-400" /> <span className="text-green-400">Email enviado!</span></>
            ) : (
              <><Send size={16} /> Enviar revisão agora</>
            )}
          </button>

          <p className="text-xs text-gray-600 mt-2 text-center">
            Os blocos são enviados em ordem, um por notificação
          </p>
        </>
      )}
    </div>
  );
}
