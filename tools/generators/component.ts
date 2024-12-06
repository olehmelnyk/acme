import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

export interface GenerateComponentOptions {
  /**
   * The name of the component (must be in PascalCase)
   */
  name: string;
  /**
   * The directory where the component should be created (relative to project root)
   * @default "src/components"
   */
  directory?: string;
  /**
   * Whether to create a test file for the component
   * @default true
   */
  withTest?: boolean;
  /**
   * Whether to create a stories file for the component
   * @default true
   */
  withStories?: boolean;
}

/**
 * Validates the component name
 * @throws {Error} if the name is invalid
 */
const validateComponentName = (name: string): void => {
  if (!name) {
    throw new Error('Component name is required');
  }
  
  if (!/^[A-Z][a-zA-Z]*$/.test(name)) {
    throw new Error(
      'Component name must be in PascalCase (e.g., MyComponent)'
    );
  }
};

/**
 * Validates and normalizes the target directory
 */
const validateAndNormalizeDirectory = (directory?: string): string => {
  const normalizedDir = directory?.replace(/\\/g, '/') || 'src/components';
  if (normalizedDir.includes('..')) {
    throw new Error('Directory traversal is not allowed');
  }
  return normalizedDir;
};

/**
 * Generates the component template
 */
const generateComponentTemplate = (name: string): string => {
  return `import React from 'react';

export interface ${name}Props {
  /**
   * Optional child elements to render within the component
   */
  children?: React.ReactNode;
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * ${name} component
 *
 * @example
 * \`\`\`tsx
 * <${name}>Content</${name}>
 * \`\`\`
 */
export const ${name} = ({ 
  children,
  className,
}: ${name}Props): React.ReactElement => {
  return (
    <div className={\`${name.toLowerCase()} \${className || ''}\`}>
      {children}
    </div>
  );
};`
};

/**
 * Generates the test template
 */
const generateTestTemplate = (name: string): string => `\
import { render, screen, cleanup } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  // Clean up after each test
  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    test('should render children correctly', async () => {
      try {
        const testContent = 'Test Content';
        render(<${name}>{testContent}</${name}>);
        
        const content = await screen.findByText(testContent);
        expect(content).toBeInTheDocument();
      } catch (error) {
        console.error('Error testing children rendering:', error);
        throw error;
      }
    });

    test('should apply custom className', async () => {
      try {
        const customClass = 'custom-class';
        const { container } = render(<${name} className={customClass} />);
        
        expect(container.firstChild).toHaveClass(customClass);
        expect(container.firstChild).toHaveClass('${name.toLowerCase()}');
      } catch (error) {
        console.error('Error testing className application:', error);
        throw error;
      }
    });
  });
});
`;

/**
 * Generates the stories template
 */
const generateStoriesTemplate = (name: string): string => `\
import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  tags: ['autodocs'],
  args: {
    children: 'Example content',
  },
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-class',
    children: 'Content with custom class',
  },
};
`;

/**
 * Checks if a file exists
 */
const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Generates a React component with optional test and stories files
 */
export const generateComponent = async ({
  name,
  directory,
  withTest = true,
  withStories = true,
}: GenerateComponentOptions): Promise<void> => {
  try {
    // Validate inputs
    validateComponentName(name);
    const targetDir = validateAndNormalizeDirectory(directory);
    
    // Create full paths
    const componentDir = path.join(process.cwd(), targetDir, name);
    const componentPath = path.join(componentDir, `${name}.tsx`);
    const testPath = path.join(componentDir, `${name}.test.tsx`);
    const storiesPath = path.join(componentDir, `${name}.stories.tsx`);

    // Check if component already exists
    if (await fileExists(componentPath)) {
      throw new Error(`Component ${name} already exists at ${componentPath}`);
    }

    // Create component directory
    await mkdir(componentDir, { recursive: true });

    // Generate files
    await writeFile(componentPath, generateComponentTemplate(name));
    console.log(`✓ Generated component: ${componentPath}`);

    if (withTest) {
      await writeFile(testPath, generateTestTemplate(name));
      console.log(`✓ Generated test: ${testPath}`);
    }

    if (withStories) {
      await writeFile(storiesPath, generateStoriesTemplate(name));
      console.log(`✓ Generated stories: ${storiesPath}`);
    }

    console.log(`\n✨ Successfully generated component ${name}`);
  } catch (error) {
    console.error(`\n❌ Failed to generate component ${name}:`, error);
    throw error;
  }
};
