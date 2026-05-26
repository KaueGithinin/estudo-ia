import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { enviarEmailRevisao } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const user = await currentUser()
    const userEmail = user?.emailAddresses[0]?.emailAddress
    if (!userEmail) return NextResponse.json({ error: 'Email não encontrado' }, { status: 400 })

    const { session_id } = await req.json()

    // 1. Buscar a sessão
    const { data: session } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (!session) return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })

    // 2. Buscar todos os blocos em ordem
    const { data: blocks } = await supabase
      .from('blocks')
      .select('*')
      .eq('session_id', session_id)
      .order('order_index')

    if (!blocks || blocks.length === 0) {
      return NextResponse.json({ error: 'Nenhum bloco encontrado' }, { status: 404 })
    }

    // 3. Buscar configuração de notificação para saber qual bloco foi enviado por último
    const { data: config } = await supabase
      .from('notification_settings')
      .select('last_block_index')
      .eq('user_id', userId)
      .eq('session_id', session_id)
      .single()

    // 4. Calcular o próximo bloco em ordem (volta ao 0 quando chegar no fim)
    const lastIndex = config?.last_block_index ?? -1
    const proximoIndex = (lastIndex + 1) % blocks.length
    const blocoEscolhido = blocks[proximoIndex]

    // 5. Buscar dúvidas não resolvidas deste bloco específico
    const { data: duvidas } = await supabase
      .from('doubts')
      .select('description')
      .eq('block_id', blocoEscolhido.id)
      .eq('user_id', userId)
      .eq('resolved', false)

    const duvidasTexto = (duvidas || []).map((d) => d.description)

    // 6. Enviar email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    await enviarEmailRevisao({
      para: userEmail,
      sessaoTitulo: session.title,
      blocoTitulo: blocoEscolhido.title,
      blocoConteudo: blocoEscolhido.content,
      keyPoints: blocoEscolhido.key_points || [],
      duvidas: duvidasTexto,
      blocoUrl: `${appUrl}/sessao/${session_id}/bloco/${blocoEscolhido.id}`,
    })

    // 7. Atualizar last_block_index e last_sent_at
    await supabase
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
    const msg = error instanceof Error ? error.message : String(error)
    console.error('❌ Erro ao enviar email:', msg)
    return NextResponse.json({ error: `Erro ao enviar: ${msg}` }, { status: 500 })
  }
}
