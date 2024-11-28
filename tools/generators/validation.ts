import * as z from 'zod'
import { existsSync } from 'fs'
import { join } from 'path'

export const componentSchema = z.object({
  type: z.enum(['atom', 'molecule', 'organism', 'template', 'page']),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[A-Z][A-Za-z0-9]*$/, 'Name must be in PascalCase'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .optional(),
  path: z.string().optional(),
  useAI: z.boolean().optional(),
  customization: z.object({
    typescript: z.boolean(),
    storybook: z.boolean(),
    tests: z.boolean(),
    documentation: z.boolean(),
  }).optional(),
})

export const featureSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-z][a-z0-9-]*$/, 'Name must be in kebab-case'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .optional(),
  generateDocs: z.boolean().optional(),
  customization: z.object({
    requirements: z.boolean(),
    technical: z.boolean(),
    design: z.boolean(),
    testing: z.boolean(),
  }).optional(),
})

export const ideaSchema = z.object({
  path: z.string()
    .refine(val => existsSync(val), 'File does not exist'),
  type: z.enum(['feature', 'improvement', 'experiment']).optional(),
  generateImplementation: z.boolean().optional(),
  customization: z.object({
    analysis: z.boolean(),
    technical: z.boolean(),
    timeline: z.boolean(),
    risks: z.boolean(),
  }).optional(),
})

export function validateComponent(data: unknown) {
  const result = componentSchema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
    throw new Error(`Invalid component configuration:\n${errors}`)
  }

  // Additional validation
  const { name, type } = result.data
  const targetPath = join(__dirname, `../../packages/ui/components/${type}s/${name}`)
  
  if (existsSync(targetPath)) {
    throw new Error(`Component ${name} already exists in ${type}s directory`)
  }

  return result.data
}

export function validateFeature(data: unknown) {
  const result = featureSchema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
    throw new Error(`Invalid feature configuration:\n${errors}`)
  }

  // Additional validation
  const { name } = result.data
  const targetPath = join(__dirname, `../../libs/${name}`)
  
  if (existsSync(targetPath)) {
    throw new Error(`Feature ${name} already exists`)
  }

  return result.data
}

export function validateIdea(data: unknown) {
  const result = ideaSchema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
    throw new Error(`Invalid idea configuration:\n${errors}`)
  }

  return result.data
}
