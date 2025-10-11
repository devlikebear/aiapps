import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    fullWidth: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: '', label: 'Select an option' },
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

export const Default: Story = {
  args: {
    options,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Choose Option',
    options,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Select Country',
    options: [
      { value: '', label: 'Select a country' },
      { value: 'us', label: 'United States' },
      { value: 'kr', label: 'South Korea' },
      { value: 'jp', label: 'Japan' },
    ],
    helperText: 'Your country of residence',
  },
};

export const WithError: Story = {
  args: {
    label: 'Required Field',
    options,
    error: 'Please select an option',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Select',
    options,
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width Select',
    options,
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};
