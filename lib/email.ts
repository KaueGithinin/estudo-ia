import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EnviarRevisaoParams {
  para: string
  sessaoTitulo: string
  blocoTitulo: string
  blocoConteudo: string
  keyPoints: string[]
  duvidas: string[]
  blocoUrl: string
}

export async function enviarEmailRevisao({
  para,
  sessaoTitulo,
  blocoTitulo,
  blocoConteudo,
  keyPoints,
  duvidas,
  blocoUrl,
}: EnviarRevisaoParams) {
  const keyPointsHtml = keyPoints
    .map((p) => `<li style="margin-bottom:6px;">${p}</li>`)
    .join('')

  const duvidasHtml =
    duvidas.length > 0
      ? duvidas.map((d) => `<li style="margin-bottom:6px;color:#f59e0b;">${d}</li>`).join('')
      : '<li style="color:#6b7280;">Nenhuma dúvida registrada neste bloco 🎉</li>'

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <span style="font-size:24px;">🧠</span>
        <span style="color:#a78bfa;font-size:20px;font-weight:700;">EstudoIA</span>
      </div>
      <p style="color:#6b7280;margin-top:8px;font-size:14px;">Hora de revisar!</p>
    </div>

    <!-- Sessão -->
    <p style="color:#9ca3af;font-size:13px;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">Sessão</p>
    <h1 style="color:#ffffff;font-size:22px;margin:0 0 24px;">${sessaoTitulo}</h1>

    <!-- Bloco -->
    <div style="background:#1a1a2e;border:1px solid #2d2d3d;border-radius:12px;padding:24px;margin-bottom:24px;">
      <p style="color:#a78bfa;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Bloco para revisar</p>
      <h2 style="color:#ffffff;font-size:18px;margin:0 0 16px;">${blocoTitulo}</h2>
      <p style="color:#d1d5db;font-size:14px;line-height:1.7;margin:0;">${blocoConteudo.substring(0, 400)}${blocoConteudo.length > 400 ? '...' : ''}</p>
    </div>

    <!-- Pontos-chave -->
    <div style="background:#111827;border:1px solid #1f2937;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#34d399;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">📌 Pontos-chave</p>
      <ul style="margin:0;padding-left:20px;color:#d1d5db;font-size:14px;line-height:1.7;">
        ${keyPointsHtml}
      </ul>
    </div>

    <!-- Dúvidas -->
    <div style="background:#1c1208;border:1px solid #2d1f05;border-radius:12px;padding:20px;margin-bottom:32px;">
      <p style="color:#f59e0b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">⚠️ Seus pontos de dúvida</p>
      <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;">
        ${duvidasHtml}
      </ul>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${blocoUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;font-weight:600;font-size:16px;padding:14px 32px;border-radius:12px;text-decoration:none;">
        Revisar este bloco agora →
      </a>
    </div>

    <!-- Footer -->
    <p style="text-align:center;color:#4b5563;font-size:12px;">
      EstudoIA — Aprenda de verdade, não só no dia da prova.
    </p>

  </div>
</body>
</html>`

  return resend.emails.send({
    from: 'EstudoIA <onboarding@resend.dev>',
    to: para,
    subject: `📚 Revisar agora: ${blocoTitulo}`,
    html,
  })
}
