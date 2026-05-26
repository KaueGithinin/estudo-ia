import Groq from "groq-sdk";
import type { GeneratedBlocks, EvaluationResult } from "./types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─── Prompt 1: Estruturar conteúdo em blocos ──────────────────────────────────
export async function gerarBlocos(texto: string): Promise<GeneratedBlocks> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Você é um organizador pedagógico especialista em aprendizagem ativa.
Divida o texto em blocos de estudo lógicos.

REGRAS:
- Mínimo de 2 blocos, máximo de 8
- Cada bloco deve ser um conceito coeso e independente
- O content de cada bloco deve ter entre 2 e 6 parágrafos
- Os key_points devem ser os 3-5 pontos MAIS importantes para lembrar
- Títulos curtos e diretos
- Responda APENAS com JSON válido, sem markdown, sem texto extra

Formato:
{ "blocks": [{ "title": "string", "content": "string", "key_points": ["string"] }] }`,
      },
      {
        role: "user",
        content: `Divida o texto abaixo em blocos de estudo:\n\n${texto}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content || "";

  try {
    return JSON.parse(text) as GeneratedBlocks;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("IA não retornou JSON válido");
    return JSON.parse(match[0]) as GeneratedBlocks;
  }
}

// ─── Prompt 2: Avaliar explicação do aluno ────────────────────────────────────
export async function avaliarExplicacao(
  blocoContent: string,
  blocoKeyPoints: string[],
  explicacaoAluno: string
): Promise<EvaluationResult> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Você é um tutor pedagógico gentil e encorajador, especialista em active recall.
Avalie a explicação do aluno com generosidade — o objetivo é incentivar o aprendizado, não desanimar.

REGRAS:
- correct_points: tudo que o aluno mencionou corretamente, mesmo que de forma resumida ou com outras palavras. Seja generoso.
- missing_points: APENAS pontos absolutamente essenciais que o aluno deixou completamente de fora. Máximo 2 itens. Se o aluno cobriu o essencial, deixe vazio.
- corrections: APENAS erros conceituais graves, onde o aluno disse algo factualmente errado. Ignore imprecisões menores ou respostas incompletas. Se não houver erros graves, deixe vazio.
- score: seja generoso. Se o aluno demonstrou entendimento geral, dê no mínimo 60. Explicações razoáveis merecem 70-80. Reserve notas abaixo de 50 para explicações totalmente equivocadas.
- encouragement: 1 frase motivadora e calorosa em português, destacando algo positivo na resposta do aluno.
- Responda APENAS com JSON válido, sem markdown, sem texto extra.

Formato:
{
  "correct_points": ["string"],
  "missing_points": ["string"],
  "corrections": [{ "wrong": "string", "correct": "string" }],
  "score": number,
  "encouragement": "string"
}`,
      },
      {
        role: "user",
        content: `CONTEÚDO ESTUDADO:\n${blocoContent}\n\nPONTOS CHAVE:\n${blocoKeyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\nEXPLICAÇÃO DO ALUNO:\n${explicacaoAluno}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content || "";

  try {
    return JSON.parse(text) as EvaluationResult;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("IA não retornou JSON válido");
    return JSON.parse(match[0]) as EvaluationResult;
  }
}
