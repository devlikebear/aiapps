import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">Card Title</h3>
        <p className="text-gray-400">This is a card with default padding.</p>
      </div>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          No Padding Card
        </h3>
        <p className="text-gray-400">
          This card has no padding. You can add your own.
        </p>
      </div>
    ),
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    children: (
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Small Padding
        </h3>
        <p className="text-gray-400">This card has small padding.</p>
      </div>
    ),
  },
};

export const MediumPadding: Story = {
  args: {
    padding: 'md',
    children: (
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Medium Padding
        </h3>
        <p className="text-gray-400">This card has medium padding (default).</p>
      </div>
    ),
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    children: (
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Large Padding
        </h3>
        <p className="text-gray-400">This card has large padding.</p>
      </div>
    ),
  },
};

export const WithImage: Story = {
  args: {
    padding: 'none',
    children: (
      <div>
        <div className="h-48 bg-gradient-to-br from-purple-500 to-blue-500" />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">
            Card with Image
          </h3>
          <p className="text-gray-400">
            Cards can contain images and custom content.
          </p>
        </div>
      </div>
    ),
  },
};
