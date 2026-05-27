import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { enviarEmailRevisao } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const body = await req.json()
    const { session_id } = body

    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json({ error: 'session_id inválido' }, { status: 400 })
    }

    // 1. Verificar ownership da sessão
    const { data: session } = await supabaseAdmin
      .from('study_sessions')
      .select('id, title')
      .eq('id', session_id)
      .eq('user_id', userId)
      .single()

    if (!session) return NextResponse.json({ error: 'Sessão não encontrada ou sem permissão' }, { status: 403 })

    // 2. Buscar todos os blocos em ordem
    const { data: blocks } = await supabaseAdmin
      .from('blocks')
      .select('id, title, content, key_points, order_index')
      .eq('session_id', session_id)
      .order('order_index')

    if (!blocks || blocks.length === 0) {
      return NextResponse.json({ error: 'Nenhum bloco encontrado' }, { status: 404 })
    }

    // 3. Buscar configuração de notificação (inclui consentimento e estado de progresso)
    const { data: config } = await supabaseAdmin
      .from('notification_settings')
      .select('last_block_index, user_email, consent_given_at')
      .eq('user_id', userId)
      .eq('session_id', session_id)
      .single()

    // 4. Verificar consentimento antes de qualquer envio (LGPD)
    if (!config?.consent_given_at) {
      return NextResponse.json({ error: 'Consentimento de email não registrado' }, { status: 403 })
    }

    // 5. Calcular o próximo bloco em ordem
    const lastIndex = config?.last_block_index ?? -1
    const proximoIndex = (lastIndex + 1) % blocks.length
    const blocoEscolhido = blocks[proximoIndex]

    // 6. Buscar dúvidas não resolvidas deste bloco
    const { data: duvidas } = await supabaseAdmin
      .from('doubts')
      .select('description')
      .eq('block_id', blocoEscolhido.id)
      .eq('user_id', userId)
      .eq('resolved', false)

    const duvidasTexto = (duvidas || []).map((d: { description: string }) => d.description)

    // 7. Enviar email — NEXT_PUBLIC_APP_URL obrigatório em produção para links corretos nos emails
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    await enviarEmailRevisao({
      para: config.user_email,
      sessaoTitulo: session.title,
      blocoTitulo: blocoEscolhido.title,
      blocoConteudo: blocoEscolhido.content,
      keyPoints: blocoEscolhido.key_points || [],
      duvidas: duvidasTexto,
      blocoUrl: `${appUrl}/sessao/${session_id}/bloco/${blocoEscolhido.id}`,
    })

    // 8. Atualizar last_block_index e last_sent_at
    await supabaseAdmin
      .from('notification_settings')
      .update({
        last_sent_at: new Date().toISOString(),
        last_block_index: proximoIndex,
      })
      .eq('user_id', userId)
      .eq('session_id', session_id)

    return NextResponse.json({
      success: true,
      bloco: blocoEscolhido.title,
      index: proximoIndex + 1,
      total: blocks.length,
    })
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error instanceof Error ? error.message : 'erro')
    return NextResponse.json({ error: 'Erro ao enviar email de revisão' }, { status: 500 })
  }
}
