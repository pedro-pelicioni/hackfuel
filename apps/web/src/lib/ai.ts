import type { Idea } from '@/types/idea'
import type { AIGeneratedIdea } from '@/types/idea'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

function getCacheKey(ideaId: number, userId: string): string {
  return `hackmatch-ai-${ideaId}-${userId}`
}

function getCachedIdea(ideaId: number, userId: string): AIGeneratedIdea | null {
  try {
    const cached = localStorage.getItem(getCacheKey(ideaId, userId))
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

function cacheIdea(ideaId: number, userId: string, idea: AIGeneratedIdea): void {
  try {
    localStorage.setItem(getCacheKey(ideaId, userId), JSON.stringify(idea))
  } catch {
    // localStorage full, ignore
  }
}

export interface ProjectSuggestion {
  improvedDescription: string
  differentiators: string[]
  suggestedTechStack: string[]
  suggestedTags: string[]
  originalityTips: string[]
}

export async function generateProjectSuggestion(
  projectName: string,
  projectDescription: string
): Promise<ProjectSuggestion | null> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined

  if (!apiKey) {
    return null
  }

  const prompt = `You are an anti-plagiarism hackathon advisor. A developer wants to register a project. Help them make it UNIQUE and original to avoid plagiarism.

Project name: "${projectName}"
${projectDescription ? `Current description: "${projectDescription}"` : 'No description yet.'}

Generate suggestions to make this project unique and original. Respond with ONLY valid JSON (no markdown):
{
  "improvedDescription": "A compelling, unique description (2-3 sentences) that differentiates this project from similar ones",
  "differentiators": ["What makes this unique - point 1", "point 2", "point 3"],
  "suggestedTechStack": ["Tech1", "Tech2", "Tech3", "Tech4"],
  "suggestedTags": ["Category1", "Category2"],
  "originalityTips": ["Tip to make it more original 1", "Tip 2", "Tip 3"]
}`

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a hackathon anti-plagiarism advisor. Help developers create unique, original projects. Always respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty response')

    const parsed = JSON.parse(content)

    return {
      improvedDescription: parsed.improvedDescription || '',
      differentiators: parsed.differentiators || [],
      suggestedTechStack: parsed.suggestedTechStack || [],
      suggestedTags: parsed.suggestedTags || [],
      originalityTips: parsed.originalityTips || [],
    }
  } catch (error) {
    console.error('AI project suggestion failed:', error)
    return null
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function chatWithAI(
  messages: ChatMessage[],
  existingProjects: { title: string; description: string; techStack: string[] }[]
): Promise<string | null> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined
  if (!apiKey) return null

  const projectList = existingProjects
    .map((p, i) => `${i + 1}. "${p.title}" - ${p.description} (Tech: ${p.techStack.join(', ')})`)
    .join('\n')

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `You are HackFuel AI, a hackathon advisor for the Monad blockchain ecosystem. You help developers brainstorm UNIQUE project ideas for Monad hackathons that DON'T overlap with existing projects.

Here are the projects that ALREADY EXIST on the platform — the user must NOT build something too similar:

${projectList}

Your job:
- Suggest creative, original project ideas that are different from the ones above
- Focus on Monad's strengths: 10k TPS, parallel execution, EVM compatibility, low gas
- Be specific with tech stack, architecture, and implementation details
- If the user asks about an idea that's too similar to an existing one, warn them and suggest how to differentiate
- Keep responses concise and actionable
- Use markdown formatting for readability`,
          },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.8,
        max_tokens: 800,
      }),
    })

    if (!response.ok) throw new Error(`Groq API error: ${response.status}`)

    const data = await response.json()
    return data.choices?.[0]?.message?.content || null
  } catch (error) {
    console.error('AI chat failed:', error)
    return null
  }
}

export async function generateUniqueIdea(
  baseIdea: Idea,
  userDisplayName: string
): Promise<AIGeneratedIdea | null> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined

  if (!apiKey) {
    console.warn('Groq API key not configured, skipping AI generation')
    return null
  }

  // Check cache first
  const cached = getCachedIdea(baseIdea.id, userDisplayName)
  if (cached) return cached

  const salt = Math.random().toString(36).substring(2, 10)

  const prompt = `You are a hackathon idea generator. Given a base concept, generate a UNIQUE variation that maintains the spirit but is sufficiently different to be original and avoid plagiarism.

Base idea: "${baseIdea.title}" - ${baseIdea.description}
Tech stack: ${baseIdea.techStack.join(', ')}
Category: ${baseIdea.tags.join(', ')}
Prize: ${baseIdea.prize}

User seed: ${userDisplayName}-${salt}

Generate a unique variation of this idea. Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "uniqueTitle": "A creative unique title (max 50 chars)",
  "uniqueDescription": "A detailed description of the unique variation (2-3 sentences)",
  "differentiators": ["How this differs from the base idea - point 1", "point 2", "point 3"],
  "suggestedTechStack": ["Tech1", "Tech2", "Tech3", "Tech4"],
  "implementationHints": ["Step 1: ...", "Step 2: ...", "Step 3: ..."]
}`

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a creative hackathon idea generator. Always respond with valid JSON only, no markdown formatting.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('Empty response from Groq')
    }

    const parsed = JSON.parse(content)

    const aiIdea: AIGeneratedIdea = {
      uniqueTitle: parsed.uniqueTitle || `${baseIdea.title} Remix`,
      uniqueDescription: parsed.uniqueDescription || baseIdea.description,
      differentiators: parsed.differentiators || [],
      suggestedTechStack: parsed.suggestedTechStack || baseIdea.techStack,
      implementationHints: parsed.implementationHints || [],
      generatedAt: Date.now(),
      baseIdeaId: baseIdea.id,
    }

    // Cache the result
    cacheIdea(baseIdea.id, userDisplayName, aiIdea)

    return aiIdea
  } catch (error) {
    console.error('AI idea generation failed:', error)
    return null
  }
}
