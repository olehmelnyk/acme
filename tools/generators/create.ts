import { Command } from 'commander'
import inquirer from 'inquirer'
import * as fs from 'fs/promises'
import { existsSync } from 'fs'
import * as path from 'path'
import chalk from 'chalk'
import { OpenAI } from 'openai'
import { componentPrompts, featurePrompts, ideaPrompts } from './prompts'
import { validateComponent, validateFeature, validateIdea } from './validation'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface TemplateConfig extends Record<string, unknown> {
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

type ComponentType = 'atom' | 'molecule' | 'organism' | 'template' | 'page'
type IdeaType = 'feature' | 'improvement' | 'experiment'

interface ComponentAnswers {
  type: ComponentType
  name: string
  description: string
  customization: string[]
  useAI: boolean
}

interface FeatureAnswers {
  name: string
  description: string
  customization: string[]
  generateDocs: boolean
}

interface IdeaAnswers {
  path: string
  type: IdeaType
  content: string
  customization: string[]
  generateImplementation: boolean
}

async function replaceInFile(filePath: string, replacements: Record<string, string>): Promise<void> {
  let content = await fs.readFile(filePath, 'utf-8')
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  await fs.writeFile(filePath, content)
}

async function copyDir(src: string, dest: string, replacements: Record<string, unknown>): Promise<void> {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, replacements)
    } else {
      await fs.copyFile(srcPath, destPath)
      if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.md')) {
        await replaceInFile(destPath, replacements as Record<string, string>)
      }
    }
  }
}

async function generateWithAI(config: TemplateConfig, promptTemplate: string): Promise<string> {
  const prompt = promptTemplate
    .replace('{{type}}', config.type)
    .replace('{{name}}', config.name)
    .replace('{{description}}', config.description || '')

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  })

  return response.choices[0]?.message?.content || ''
}

async function createComponent(): Promise<void> {
  try {
    const answers = await inquirer.prompt<ComponentAnswers>(componentPrompts as never)

    const config: TemplateConfig = {
      type: answers.type,
      name: answers.name,
      description: answers.description,
      customization: answers.customization.reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      useAI: answers.useAI
    }

    if (!validateComponent(config)) {
      console.error(chalk.red('Invalid component configuration'))
      return
    }

    const templatePath = path.join(__dirname, '..', '..', 'templates', 'ui', answers.type)
    const componentPath = path.join(process.cwd(), 'components', answers.type, answers.name)

    if (existsSync(componentPath)) {
      console.error(chalk.red(`Component ${answers.name} already exists!`))
      return
    }

    try {
      await copyDir(templatePath, componentPath, config)

      if (config.useAI) {
        const aiContent = await generateWithAI(config, 'Generate a React component...')
        // Handle AI-generated content
      }

      console.log(chalk.green(`✨ Component ${answers.name} created successfully!`))
    } catch (error) {
      console.error(chalk.red('Error creating component:'), error)
    }

  } catch (error) {
    console.error(chalk.red('Error creating component:'), error)
  }
}

async function createFeature(): Promise<void> {
  try {
    const answers = await inquirer.prompt<FeatureAnswers>(featurePrompts as never)

    const config: TemplateConfig = {
      type: 'feature',
      name: answers.name,
      description: answers.description,
      customization: answers.customization.reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      generateDocs: answers.generateDocs
    }

    if (!validateFeature(config)) {
      console.error(chalk.red('Invalid feature configuration'))
      return
    }

    const templatePath = path.join(__dirname, '..', '..', 'templates', 'features')
    const featurePath = path.join(process.cwd(), 'features', answers.name)

    if (existsSync(featurePath)) {
      console.error(chalk.red(`Feature ${answers.name} already exists!`))
      return
    }

    try {
      await copyDir(templatePath, featurePath, config)

      if (config.generateDocs) {
        const docsPath = path.join(featurePath, 'docs')
        await fs.mkdir(docsPath, { recursive: true })
        
        const docTypes = {
          requirements: 'Requirements.md',
          technical: 'Technical.md',
          implementation: 'Implementation.md'
        }

        for (const [type, filename] of Object.entries(docTypes)) {
          const templateContent = await fs.readFile(
            path.join(__dirname, '..', '..', 'templates', 'docs', filename),
            'utf-8'
          )
          await fs.writeFile(path.join(docsPath, filename), templateContent)
        }
      }

      console.log(chalk.green(`✨ Feature ${answers.name} created successfully!`))
    } catch (error) {
      console.error(chalk.red('Error creating feature:'), error)
    }

  } catch (error) {
    console.error(chalk.red('Error creating feature:'), error)
  }
}

async function implementIdea(): Promise<void> {
  try {
    const answers = await inquirer.prompt<IdeaAnswers>(ideaPrompts as never)

    const config: TemplateConfig = {
      type: answers.type,
      name: path.basename(answers.path),
      path: answers.path,
      content: answers.content,
      customization: answers.customization.reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      generateImplementation: answers.generateImplementation
    }

    if (!validateIdea(config)) {
      console.error(chalk.red('Invalid idea configuration'))
      return
    }

    const templatePath = path.join(__dirname, '..', '..', 'templates', 'ideas')
    const ideaPath = path.join(process.cwd(), 'ideas', answers.path)

    if (existsSync(ideaPath)) {
      console.error(chalk.red(`Idea at ${answers.path} already exists!`))
      return
    }

    try {
      await copyDir(templatePath, ideaPath, config)

      if (config.generateImplementation) {
        const implementationPath = path.join(ideaPath, 'implementation')
        await fs.mkdir(implementationPath, { recursive: true })
        // Add implementation files
      }

      console.log(chalk.green(`✨ Idea implemented successfully at ${answers.path}!`))
    } catch (error) {
      console.error(chalk.red('Error implementing idea:'), error)
    }

  } catch (error) {
    console.error(chalk.red('Error implementing idea:'), error)
  }
}

const program = new Command()

program
  .command('component')
  .description('Create a new component')
  .action(createComponent)

program
  .command('feature')
  .description('Create a new feature')
  .action(createFeature)

program
  .command('idea')
  .description('Implement a new idea')
  .action(implementIdea)

program.parse(process.argv)
