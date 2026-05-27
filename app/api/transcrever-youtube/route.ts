import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'
import ytdl from '@distube/ytdl-core'
import Groq from 'groq-sdk'
import { buffer } from 'node:stream/consumers'
import { youtubeSchema } from '@/lib/schemas'
import { checkRateLimit } from '@/lib/ratelimit'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extrairVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

async function tentarLegenda(videoId: string): Promise<string | null> {
  try {
    let segments
    try {
      segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'pt' })
    } catch {
      try {
        segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' })
      } catch {
        segments = await YoutubeTranscript.fetchTranscript(videoId)
      }
    }

    if (!segments || segments.length === 0) return null

    const texto = segments
      .map((s) => s.text.trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\[.*?\]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    return texto.length >= 100 ? texto : null
  } catch {
    return null
  }
}

async function transcreverComWhisper(videoId: string): Promise<string> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  const info = await ytdl.getInfo(videoUrl)
  const duracaoSegundos = parseInt(info.videoDetails.lengthSeconds, 10)

  if (duracaoSegundos > 25 * 60) {
    throw new Error(
      `Vídeo com ${Math.round(duracaoSegundos / 60)} minutos — muito longo para transcrição automática. ` +
      `O limite é 25 minutos. Tente um vídeo mais curto ou copie a transcrição manualmente.`
    )
  }

  const audioStream = ytdl(videoUrl, {
    filter: 'audioonly',
    quality: 'lowestaudio',
  })

  const audioBuffer = await buffer(audioStream)

  const limiteMB = 24 * 1024 * 1024
  if (audioBuffer.length > limiteMB) {
    throw new Error('Arquivo de áudio muito grande. Tente um vídeo mais curto.')
  }

  const formato = info.formats.find(
    (f) => f.hasAudio && !f.hasVideo && f.container
  )
  const container = formato?.container || 'webm'
  const mimeType = `audio/${container}`

  const audioFile = new File([audioBuffer], `audio.${container}`, {
    type: mimeType,
  })

  const transcricao = await groq.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-large-v3',
    response_format: 'text',
  })

  const texto = (transcricao as unknown as string).trim()
  if (!texto || texto.length < 50) {
    throw new Error('Whisper não conseguiu transcrever o áudio deste vídeo.')
  }

  return texto
}

// ─── Handler principal ────────────────────────────────────────────────────────

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Rate limiting
    const { success } = await checkRateLimit(userId)
    if (!success) {
      return NextResponse.json(
        { error: 'Muitas requisições. Aguarde um momento e tente novamente.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    // Validação com Zod
    const body = await req.json()
    const parsed = youtubeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
    }

    const videoId = extrairVideoId(parsed.data.url.trim())
    if (!videoId) {
      return NextResponse.json(
        { error: 'URL do YouTube inválida. Use um link como youtube.com/watch?v=... ou youtu.be/...' },
        { status: 400 }
      )
    }

    const legendaTexto = await tentarLegenda(videoId)
    if (legendaTexto) {
      return NextResponse.json({ texto: legendaTexto, caracteres: legendaTexto.length, metodo: 'legenda' })
    }

    const whisperTexto = await transcreverComWhisper(videoId)
    return NextResponse.json({ texto: whisperTexto, caracteres: whisperTexto.length, metodo: 'whisper' })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('❌ Erro ao transcrever YouTube:', msg)

    if (msg.includes('muito longo') || msg.includes('muito grande')) {
      return NextResponse.json({ error: msg }, { status: 422 })
    }
    if (msg.includes('Sign in') || msg.includes('age-restricted') || msg.includes('private')) {
      return NextResponse.json(
        { error: 'Este vídeo é privado ou restrito por idade. Tente um vídeo público.' },
        { status: 422 }
      )
    }
    if (msg.includes('Video unavailable')) {
      return NextResponse.json({ error: 'Vídeo indisponível ou removido.' }, { status: 422 })
    }

    return NextResponse.json({ error: 'Não foi possível transcrever o vídeo' }, { status: 500 })
  }
}
