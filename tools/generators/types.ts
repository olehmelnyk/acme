export type ComponentType = 'atom' | 'molecule' | 'organism' | 'template' | 'page'
export type IdeaType = 'feature' | 'improvement' | 'experiment'

export interface ComponentAnswers {
  type: ComponentType
  name: string
  description: string
  customization: string[]
  useAI: boolean
}

export interface FeatureAnswers {
  name: string
  description: string
  customization: string[]
  generateDocs: boolean
}

export interface IdeaAnswers {
  path: string
  type: IdeaType
  content: string
  customization: string[]
  generateImplementation: boolean
}

export interface TemplateConfig extends Record<string, unknown> {
  type: string
  name: string
  description?: string
  path?: string
  customization?: Record<string, boolean>
  content?: string
  generateImplementation?: boolean
  generateDocs?: boolean
  useAI?: boolean
}
