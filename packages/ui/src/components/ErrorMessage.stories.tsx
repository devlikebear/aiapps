import type { Meta, StoryObj } from '@storybook/react';
import { ErrorMessage } from './ErrorMessage';

const meta = {
  title: 'Components/ErrorMessage',
  component: ErrorMessage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    showRetry: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'An error occurred while processing your request.',
  },
};

export const WithRetry: Story = {
  args: {
    message: 'Failed to load data. Please try again.',
    showRetry: true,
    onRetry: () => alert('Retry clicked!'),
  },
};

export const LongMessage: Story = {
  args: {
    message:
      'An unexpected error occurred while processing your request. This could be due to a network issue or a problem with the server. Please check your connection and try again.',
    showRetry: true,
    onRetry: () => alert('Retry clicked!'),
  },
};

export const ShortMessage: Story = {
  args: {
    message: 'Error!',
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <ErrorMessage message="Simple error message" />
      <ErrorMessage
        message="Error with retry button"
        showRetry
        onRetry={() => alert('Retry!')}
      />
      <ErrorMessage message="Very long error message that wraps to multiple lines and provides detailed information about what went wrong." />
    </div>
  ),
};
