// ─── Tipos principais do SaaS de Estudo ───────────────────────────────────────

export interface StudySession {
  id: string
  user_id: string
  title: string
  original_text: string
  status: 'processing' | 'ready' | 'completed'
  created_at: string
}

export interface Block {
  id: string
  session_id: string
  title: string
  content: string
  key_points: string[]
  order_index: number
  created_at: string
  // Virtual (calculado na hora de carregar)
  review_status?: 'pending' | 'studied' | 'with_doubts'
  last_score?: number
}

export interface Review {
  id: string
  block_id: string
  user_id: string
  user_explanation: string
  correct_points: string[]
  missing_points: string[]
  corrections: Array<{ wrong: string; correct: string }>
  score: number
  encouragement: string
  created_at: string
}

export interface Doubt {
  id: string
  user_id: string
  block_id: string
  description: string
  resolved: boolean
  created_at: string
  // Joined
  block?: Block
  session?: StudySession
}

// Resposta da IA ao gerar blocos
export interface GeneratedBlocks {
  blocks: Array<{
    title: string
    content: string
    key_points: string[]
  }>
}

// Resposta da IA ao avaliar explicação
export interface EvaluationResult {
  correct_points: string[]
  missing_points: string[]
  corrections: Array<{ wrong: string; correct: string }>
  score: number
  encouragement: string
}
