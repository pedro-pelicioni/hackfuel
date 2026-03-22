import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RegisteredProject {
  name: string
  description: string
  techStack: string[]
  tags: string[]
  emoji: string
  nftTxHash: string
  registeredAt: number
}

interface ProjectStore {
  projects: RegisteredProject[]
  addProject: (project: RegisteredProject) => void
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],

      addProject: (project) =>
        set((state) => ({
          projects: [project, ...state.projects],
        })),
    }),
    { name: 'hackfuel-projects' }
  )
)
