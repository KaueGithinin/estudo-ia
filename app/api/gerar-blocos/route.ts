import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { gerarBlocos } from '@/lib/anthropic'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { texto, titulo } = await req.json()

    if (!texto || texto.trim().length < 100) {
      return NextResponse.json(
        { error: 'O texto deve ter pelo menos 100 caracteres' },
        { status: 400 }
      )
    }

    // 1. Criar a sessão de estudo no banco
    const { data: session, error: sessionError } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        title: titulo || 'Sessão sem título',
        original_text: texto,
        status: 'processing',
      })
      .select()
      .single()

    if (sessionError) throw sessionError

    // 2. Chamar Claude para gerar os blocos
    const resultado = await gerarBlocos(texto)

    // 3. Salvar os blocos no banco
    const blocosParaSalvar = resultado.blocks.map((bloco, index) => ({
      session_id: session.id,
      title: bloco.title,
      content: bloco.content,
      key_points: bloco.key_points,
      order_index: index,
    }))

    const { data: blocks, error: blocksError } = await supabase
      .from('blocks')
      .insert(blocosParaSalvar)
      .select()

    if (blocksError) throw blocksError

    // 4. Atualizar status da sessão para 'ready'
    await supabase
      .from('study_sessions')
      .update({ status: 'ready' })
      .eq('id', session.id)

    return NextResponse.json({
      session_id: session.id,
      blocks_count: blocks.length,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('❌ Erro ao gerar blocos:', msg)
    return NextResponse.json(
      { error: `Erro: ${msg}` },
      { status: 500 }
    )
  }
}
