import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { enviarEmailRevisao } from '@/lib/email'

// Chamado automaticamente pelo Vercel Cron a cada hora
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const agora = new Date()

    // Buscar configurações ativas
    const { data: configs } = await supabase
      .from('notification_settings')
      .select('*, session:study_sessions(id, title)')
      .eq('enabled', true)

    if (!configs || configs.length === 0) {
      return NextResponse.json({ enviados: 0 })
    }

    let enviados = 0

    for (const config of configs) {
      // Verificar se já passou o tempo configurado desde o último envio
      if (config.last_sent_at) {
        const ultimoEnvio = new Date(config.last_sent_at)
        const horasPassadas = (agora.getTime() - ultimoEnvio.getTime()) / (1000 * 60 * 60)
        if (horasPassadas < config.frequency_hours) continue
      }

      // Buscar blocos em ordem
      const { data: blocks } = await supabase
        .from('blocks')
        .select('*')
        .eq('session_id', config.session_id)
        .order('order_index')

      if (!blocks || blocks.length === 0) continue

      // Próximo bloco em ordem
      const lastIndex = config.last_block_index ?? -1
      const proximoIndex = (lastIndex + 1) % blocks.length
      const blocoEscolhido = blocks[proximoIndex]

      // Dúvidas deste bloco
      const { data: duvidas } = await supabase
        .from('doubts')
        .select('description')
        .eq('block_id', blocoEscolhido.id)
        .eq('user_id', config.user_id)
        .eq('resolved', false)

      const duvidasTexto = (duvidas || []).map((d: { description: string }) => d.description)

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://estudo-ia.vercel.app'

      try {
        await enviarEmailRevisao({
          para: config.user_email,
          sessaoTitulo: config.session?.title || 'Sessão de estudo',
          blocoTitulo: blocoEscolhido.title,
          blocoConteudo: blocoEscolhido.content,
          keyPoints: blocoEscolhido.key_points || [],
          duvidas: duvidasTexto,
          blocoUrl: `${appUrl}/sessao/${config.session_id}/bloco/${blocoEscolhido.id}`,
        })

        await supabase
          .from('notification_settings')
          .update({
            last_sent_at: agora.toISOString(),
            last_block_index: proximoIndex,
          })
          .eq('id', config.id)

        enviados++
      } catch (e) {
        console.error(`Erro ao enviar para ${config.user_email}:`, e)
      }
    }

    return NextResponse.json({ enviados, total: configs.length })
  } catch (error) {
    console.error('Erro no cron:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
