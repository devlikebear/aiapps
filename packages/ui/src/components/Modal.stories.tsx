import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    closeOnBackdrop: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const ModalWithButton = (props: React.ComponentProps<typeof Modal>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} {...props}>
        <p className="text-gray-300">
          This is the modal content. You can put any content here.
        </p>
      </Modal>
    </>
  );
};

export const Default: Story = {
  render: () => <ModalWithButton />,
};

export const WithTitle: Story = {
  render: () => <ModalWithButton title="Modal Title" />,
};

export const Small: Story = {
  render: () => (
    <ModalWithButton title="Small Modal" size="sm">
      <p className="text-gray-300">This is a small modal.</p>
    </ModalWithButton>
  ),
};

export const Medium: Story = {
  render: () => (
    <ModalWithButton title="Medium Modal" size="md">
      <p className="text-gray-300">This is a medium modal (default).</p>
    </ModalWithButton>
  ),
};

export const Large: Story = {
  render: () => (
    <ModalWithButton title="Large Modal" size="lg">
      <p className="text-gray-300">This is a large modal.</p>
    </ModalWithButton>
  ),
};

export const ExtraLarge: Story = {
  render: () => (
    <ModalWithButton title="Extra Large Modal" size="xl">
      <p className="text-gray-300">This is an extra large modal.</p>
    </ModalWithButton>
  ),
};

export const NoBackdropClose: Story = {
  render: () => (
    <ModalWithButton
      title="Cannot Close on Backdrop Click"
      closeOnBackdrop={false}
    >
      <p className="text-gray-300">
        This modal cannot be closed by clicking the backdrop. Use ESC or the
        close button.
      </p>
    </ModalWithButton>
  ),
};

const FormModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Form Modal</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Login">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="••••••••"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" fullWidth>
              Login
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export const WithForm: Story = {
  render: () => <FormModal />,
};
