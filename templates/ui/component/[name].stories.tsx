import type { Meta, StoryObj } from '@storybook/react'
import { [name] } from './[name]'

const meta = {
  title: 'UI/[name]',
  component: [name],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof [name]>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    // Add default props here
  },
}
