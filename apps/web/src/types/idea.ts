export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'

export type Category = 'DeFi' | 'NFT' | 'Gaming' | 'AI' | 'Infra' | 'Social' | 'DAO' | 'Privacy' | 'Identity'

export interface Idea {
  id: number
  title: string
  description: string
  prize: string
  techStack: string[]
  difficulty: Difficulty
  sponsor: string
  tags: Category[]
  emoji: string
}

export interface AIGeneratedIdea {
  uniqueTitle: string
  uniqueDescription: string
  differentiators: string[]
  suggestedTechStack: string[]
  implementationHints: string[]
  generatedAt: number
  baseIdeaId: number
}
