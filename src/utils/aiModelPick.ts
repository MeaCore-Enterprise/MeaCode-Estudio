/**
 * Elige el modelo más capaz para tareas de código/chat entre una lista de IDs
 * devueltos por APIs estilo OpenAI (/v1/models).
 */

export type ModelTaskKind = 'chat' | 'code'

const EXCLUDE_RE =
  /embed|embedding|moderat|whisper|tts|dall-?e|audio|realtime|image|clip|text-search|code-search|instruct-beta|davinci-002|\bada\b|\bbabbage\b|\bcurie\b/i

/** Peso por patrón (mayor = más capaz para la tarea). Se suman coincidencias. */
const CODE_WEIGHTS: [RegExp, number][] = [
  [/o3|o1-preview|o1\b|gpt-5|gpt-4\.1|gpt-4o(?!-mini)|gpt-4-turbo|gpt-4(?!\.|o|-mini)/i, 120],
  [/claude[- ]?3\.?5[- ]?sonnet|claude[- ]?3[- ]?opus|claude[- ]?sonnet[- ]?4/i, 115],
  [/gemini[- ]?2|gemini[- ]?1\.5[- ]?pro|gemini[- ]?pro(?!-vision)/i, 108],
  [/deepseek[- ]?r1|deepseek[- ]?coder|qwen[- ]?2\.5[- ]?coder|qwen[- ]?coder/i, 105],
  [/llama[- ]?3\.3|llama3\.3|llama[- ]?3\.1|llama[- ]?3\.2|codellama|mixtral|mistral[- ]?large/i, 95],
  [/gpt-4o-mini|gpt-4-mini|gpt-3\.5-turbo|claude[- ]?3[- ]?haiku|gemini[- ]?flash|gemini[- ]?1\.5[- ]?flash/i, 55],
  [/mini|nano|tiny|8b|3b|1b|instruct(?!ion)/i, -25],
]

const CHAT_WEIGHTS: [RegExp, number][] = [
  [/o3|o1-preview|o1\b|gpt-5|gpt-4\.1|gpt-4o(?!-mini)|gpt-4-turbo|gpt-4(?!\.|o|-mini)/i, 120],
  [/claude[- ]?3\.?5[- ]?sonnet|claude[- ]?3[- ]?opus/i, 115],
  [/gemini[- ]?2|gemini[- ]?1\.5[- ]?pro/i, 108],
  [/llama[- ]?3\.3|llama3\.3|llama[- ]?3\.1|mixtral|mistral[- ]?large/i, 90],
  [/gpt-4o-mini|gpt-3\.5-turbo|gemini[- ]?flash|haiku/i, 50],
  [/mini|nano|tiny|embed/i, -30],
]

function scoreModel(id: string, kind: ModelTaskKind): number {
  const lower = id.toLowerCase()
  if (EXCLUDE_RE.test(lower)) return -1000

  const table = kind === 'code' ? CODE_WEIGHTS : CHAT_WEIGHTS
  let score = 0
  for (const [re, w] of table) {
    if (re.test(lower)) score += w
  }
  // Preferencia leve por IDs más largos (suelen ser variantes nuevas).
  score += Math.min(lower.length * 0.15, 8)
  return score
}

/**
 * Devuelve el ID del modelo con mayor puntuación heurística.
 * Si la lista está vacía, lanza error.
 */
export function pickBestChatModel(ids: string[], kind: ModelTaskKind, _userHint?: string): string {
  const unique = [...new Set(ids.map((s) => s.trim()).filter(Boolean))]
  if (unique.length === 0) {
    throw new Error('Lista de modelos vacía')
  }

  const ranked = unique
    .map((id) => ({ id, score: scoreModel(id, kind) }))
    .filter((x) => x.score > -500)
    .sort((a, b) => b.score - a.score)

  if (ranked.length === 0) {
    return unique[0]
  }

  return ranked[0].id
}
