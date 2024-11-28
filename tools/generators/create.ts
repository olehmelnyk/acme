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

interface TemplateConfig {
  type: string
  name: string
  description?: string
  path?: string
  customization?: Record<string, boolean>
  content?: string
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
  customization: string[]
}

async function replaceInFile(filePath: string, replacements: Record<string, string>): Promise<void> {
  let content = await fs.readFile(filePath, 'utf-8')

  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(`\\[${key}\\]`, 'g'), value)
  }

  await fs.writeFile(filePath, content)
}

async function copyDir(src: string, dest: string, replacements: Record<string, string>): Promise<void> {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name.replace(/\[name\]/g, replacements.name))

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, replacements)
    } else {
      await fs.copyFile(srcPath, destPath)
      await replaceInFile(destPath, replacements)
    }
  }
}

async function generateWithAI(config: TemplateConfig, promptTemplate: string): Promise<string> {
  const prompt = promptTemplate
    .replace(/\[name\]/g, config.name)
    .replace(/\[description\]/g, config.description || '')
    .replace(/\[type\]/g, config.type)
    .replace(/\[content\]/g, config.content || '')

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  })

  return completion.choices[0].message.content || ''
}

async function createComponent(): Promise<void> {
  const questions: inquirer.QuestionCollection<ComponentAnswers> = [
    {
      type: 'list',
      name: 'type',
      message: 'What type of component do you want to create?',
      choices: ['atom', 'molecule', 'organism', 'template', 'page'],
    },
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of your component?',
      validate: (input: string) => {
        if (!/^[A-Z][A-Za-z0-9]*$/.test(input)) {
          return 'Component name must be in PascalCase'
        }
        return true
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Provide a brief description of the component:',
      validate: (input: string) => {
        if (input.length < 10) {
          return 'Description must be at least 10 characters long'
        }
        return true
      },
    },
    {
      type: 'checkbox',
      name: 'customization',
      message: 'Select component features:',
      choices: [
        { name: 'TypeScript', value: 'typescript', checked: true },
        { name: 'Storybook', value: 'storybook', checked: true },
        { name: 'Tests', value: 'tests', checked: true },
        { name: 'Documentation', value: 'documentation', checked: true },
      ],
    },
    {
      type: 'confirm',
      name: 'useAI',
      message: 'Would you like to use AI to help generate the component?',
      default: false,
    },
  ]

  const answers = await inquirer.prompt<ComponentAnswers>(questions)
  const config = validateComponent({
    ...answers,
    customization: answers.customization.reduce((acc: Record<string, boolean>, curr: string) => {
      acc[curr] = true
      return acc
    }, {}),
  })

  const templatePath = path.join(__dirname, '../../templates/ui/component')
  const targetPath = path.join(__dirname, `../../packages/ui/components/${config.type}s/${config.name}`)

  console.log(chalk.blue('\nCreating component...'))
  await copyDir(templatePath, targetPath, config)

  if (config.useAI) {
    console.log(chalk.blue('\nGenerating AI suggestions...'))
    const componentCode = await generateWithAI(
      config,
      componentPrompts[config.type as ComponentType]
    )
    await fs.writeFile(
      path.join(targetPath, `${config.name}.tsx`),
      componentCode
    )
  }

  console.log(chalk.green('\nComponent created successfully! '))
}

async function createFeature(): Promise<void> {
  const questions: inquirer.QuestionCollection<FeatureAnswers> = [
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of your feature?',
      validate: (input: string) => {
        if (!/^[a-z][a-z0-9-]*$/.test(input)) {
          return 'Feature name must be in kebab-case'
        }
        return true
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Provide a brief description of the feature:',
      validate: (input: string) => {
        if (input.length < 10) {
          return 'Description must be at least 10 characters long'
        }
        return true
      },
    },
    {
      type: 'checkbox',
      name: 'customization',
      message: 'Select feature documentation:',
      choices: [
        { name: 'Requirements', value: 'requirements', checked: true },
        { name: 'Technical Spec', value: 'technical', checked: true },
        { name: 'Design Assets', value: 'design', checked: true },
        { name: 'Testing Strategy', value: 'testing', checked: true },
      ],
    },
    {
      type: 'confirm',
      name: 'generateDocs',
      message: 'Would you like to generate documentation with AI?',
      default: true,
    },
  ]

  const answers = await inquirer.prompt<FeatureAnswers>(questions)
  const config = validateFeature({
    ...answers,
    customization: answers.customization.reduce((acc: Record<string, boolean>, curr: string) => {
      acc[curr] = true
      return acc
    }, {}),
  })

  const templatePath = path.join(__dirname, '../../templates/feature/[name]')
  const targetPath = path.join(__dirname, `../../libs/${config.name}`)

  console.log(chalk.blue('\nCreating feature structure...'))
  await copyDir(templatePath, targetPath, config)

  if (config.generateDocs) {
    console.log(chalk.blue('\nGenerating documentation with AI...'))
    
    if (config.customization?.requirements) {
      const requirements = await generateWithAI(config, featurePrompts.requirements)
      await fs.writeFile(
        path.join(targetPath, 'docs/REQUIREMENTS.md'),
        requirements
      )
    }

    if (config.customization?.technical) {
      const technical = await generateWithAI(config, featurePrompts.technical)
      await fs.writeFile(
        path.join(targetPath, 'docs/TECHNICAL.md'),
        technical
      )
    }

    if (config.customization?.testing) {
      const testing = await generateWithAI(config, featurePrompts.testing)
      await fs.writeFile(
        path.join(targetPath, 'docs/TESTING.md'),
        testing
      )
    }
  }

  console.log(chalk.green('\nFeature created successfully! '))
}

async function implementIdea(): Promise<void> {
  const questions: inquirer.QuestionCollection<IdeaAnswers> = [
    {
      type: 'input',
      name: 'path',
      message: 'Path to the idea file:',
      validate: (input: string) => existsSync(input) || 'File does not exist',
    },
    {
      type: 'list',
      name: 'type',
      message: 'What type of idea is this?',
      choices: ['feature', 'improvement', 'experiment'] as IdeaType[],
    },
    {
      type: 'checkbox',
      name: 'customization',
      message: 'Select documentation to generate:',
      choices: [
        { name: 'Analysis', value: 'analysis', checked: true },
        { name: 'Technical Design', value: 'technical', checked: true },
        { name: 'Timeline', value: 'timeline', checked: true },
        { name: 'Risk Assessment', value: 'risks', checked: true },
      ],
    },
  ]

  const answers = await inquirer.prompt<IdeaAnswers>(questions)
  const config = validateIdea({
    ...answers,
    customization: answers.customization.reduce((acc: Record<string, boolean>, curr: string) => {
      acc[curr] = true
      return acc
    }, {}),
  })

  const ideaContent = await fs.readFile(config.path, 'utf-8')

  console.log(chalk.blue('\nAnalyzing idea...'))
  
  const targetDir = path.join(path.dirname(config.path), '../implementations', path.basename(config.path, '.md'))
  await fs.mkdir(targetDir, { recursive: true })

  if (config.customization?.analysis) {
    const analysis = await generateWithAI(
      { ...config, content: ideaContent },
      ideaPrompts.analysis
    )
    await fs.writeFile(
      path.join(targetDir, 'ANALYSIS.md'),
      analysis
    )
  }

  if (config.customization?.technical) {
    const implementation = await generateWithAI(
      { ...config, content: ideaContent },
      ideaPrompts.implementation
    )
    await fs.writeFile(
      path.join(targetDir, 'IMPLEMENTATION.md'),
      implementation
    )
  }

  console.log(chalk.green('\nIdea analysis and implementation plan generated! '))
}

const program = new Command()

program
  .command('component')
  .description('Create a new UI component')
  .action(createComponent)

program
  .command('feature')
  .description('Create a new feature')
  .action(createFeature)

program
  .command('implement')
  .description('Implement an idea')
  .action(implementIdea)

program.parse(process.argv)
