import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { gerarBlocos } from '@/lib/anthropic'
import { supabaseAdmin } from '@/lib/supabase-server'
import { gerarBlocosSchema } from '@/lib/schemas'
import { checkRateLimit } from '@/lib/ratelimit'

// Groq pode demorar em textos longos — aumentar timeout do Vercel
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
    const parsed = gerarBlocosSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Dados inválidos'
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    const { texto, titulo } = parsed.data

    // 1. Verificar plano do usuário
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan')
      .eq('user_id', userId)
      .single()

    const plano = profile?.plan || 'free'

    // 2. Criar a sessão de estudo no banco
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('study_sessions')
      .insert({
        user_id: userId,
        title: titulo?.trim() || 'Sessão sem título',
        original_text: texto,
        status: 'processing',
      })
      .select()
      .single()

    if (sessionError) throw sessionError

    // 3. Verificar limite do plano APÓS o insert — elimina race condition
    // (dois requests simultâneos passariam pelo count pré-insert, mas não pelo pós-insert)
    if (plano === 'free') {
      const iniciodoMes = new Date()
      iniciodoMes.setDate(1)
      iniciodoMes.setHours(0, 0, 0, 0)

      const { count } = await supabaseAdmin
        .from('study_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', iniciodoMes.toISOString())

      if ((count ?? 0) > 3) {
        // Ultrapassou — desfazer o insert
        await supabaseAdmin.from('study_sessions').delete().eq('id', session.id)
        return NextResponse.json(
          { error: 'Limite do plano grátis atingido (3 sessões/mês). Faça upgrade para o plano Pro para sessões ilimitadas.', upgrade: true },
          { status: 403 }
        )
      }
    }

    // 4. Chamar IA para gerar os blocos
    let resultado
    try {
      resultado = await gerarBlocos(texto)
    } catch (aiError) {
      // IA falhou: marcar sessão como erro para não ficar presa em 'processing'
      await supabaseAdmin
        .from('study_sessions')
        .update({ status: 'error' })
        .eq('id', session.id)
      throw aiError
    }

    // 5. Salvar os blocos no banco
    const blocosParaSalvar = resultado.blocks.map((bloco, index) => ({
      session_id: session.id,
      title: bloco.title,
      content: bloco.content,
      key_points: bloco.key_points,
      order_index: index,
    }))

    const { data: blocks, error: blocksError } = await supabaseAdmin
      .from('blocks')
      .insert(blocosParaSalvar)
      .select()

    if (blocksError) {
      await supabaseAdmin
        .from('study_sessions')
        .update({ status: 'error' })
        .eq('id', session.id)
      throw blocksError
    }

    // 4. Atualizar status da sessão para 'ready'
    await supabaseAdmin
      .from('study_sessions')
      .update({ status: 'ready' })
      .eq('id', session.id)

    return NextResponse.json({
      session_id: session.id,
      blocks_count: blocks.length,
    })
  } catch (error) {
    console.error('❌ Erro ao gerar blocos:', error instanceof Error ? error.message : 'erro')
    return NextResponse.json({ error: 'Erro ao processar o conteúdo' }, { status: 500 })
  }
}
