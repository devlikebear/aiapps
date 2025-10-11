import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Toast } from './Toast';
import { Button } from './Button';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
    },
    position: {
      control: 'select',
      options: [
        'top-right',
        'top-center',
        'top-left',
        'bottom-right',
        'bottom-center',
        'bottom-left',
      ],
    },
    duration: {
      control: 'number',
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

const ToastWithButton = (props: any) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setIsVisible(true)}>Show Toast</Button>
      {isVisible && <Toast onClose={() => setIsVisible(false)} {...props} />}
    </>
  );
};

export const Success: Story = {
  render: () => (
    <ToastWithButton
      type="success"
      message="Operation completed successfully!"
    />
  ),
};

export const Error: Story = {
  render: () => <ToastWithButton type="error" message="An error occurred!" />,
};

export const Warning: Story = {
  render: () => (
    <ToastWithButton
      type="warning"
      message="Warning: Please check your input."
    />
  ),
};

export const Info: Story = {
  render: () => (
    <ToastWithButton type="info" message="This is an informational message." />
  ),
};

export const TopRight: Story = {
  render: () => (
    <ToastWithButton
      type="success"
      message="Top Right Toast"
      position="top-right"
    />
  ),
};

export const TopCenter: Story = {
  render: () => (
    <ToastWithButton
      type="success"
      message="Top Center Toast"
      position="top-center"
    />
  ),
};

export const TopLeft: Story = {
  render: () => (
    <ToastWithButton
      type="success"
      message="Top Left Toast"
      position="top-left"
    />
  ),
};

export const BottomRight: Story = {
  render: () => (
    <ToastWithButton
      type="success"
      message="Bottom Right Toast"
      position="bottom-right"
    />
  ),
};

export const BottomCenter: Story = {
  render: () => (
    <ToastWithButton
      type="success"
      message="Bottom Center Toast"
      position="bottom-center"
    />
  ),
};

export const BottomLeft: Story = {
  render: () => (
    <ToastWithButton
      type="success"
      message="Bottom Left Toast"
      position="bottom-left"
    />
  ),
};

export const AutoDismiss: Story = {
  render: () => (
    <ToastWithButton
      type="info"
      message="This toast will auto-dismiss in 3 seconds"
      duration={3000}
    />
  ),
};

export const LongDuration: Story = {
  render: () => (
    <ToastWithButton
      type="info"
      message="This toast will stay for 10 seconds"
      duration={10000}
    />
  ),
};

export const AllTypes: Story = {
  render: () => {
    const [toasts, setToasts] = useState<
      Array<{ id: number; type: 'success' | 'error' | 'warning' | 'info' }>
    >([]);

    const showToast = (type: 'success' | 'error' | 'warning' | 'info') => {
      const id = Date.now();
      setToasts([...toasts, { id, type }]);
    };

    const removeToast = (id: number) => {
      setToasts(toasts.filter((t) => t.id !== id));
    };

    return (
      <div>
        <div className="flex gap-2">
          <Button onClick={() => showToast('success')} size="sm">
            Success
          </Button>
          <Button onClick={() => showToast('error')} size="sm">
            Error
          </Button>
          <Button onClick={() => showToast('warning')} size="sm">
            Warning
          </Button>
          <Button onClick={() => showToast('info')} size="sm">
            Info
          </Button>
        </div>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={`This is a ${toast.type} message`}
            position="top-right"
            duration={3000}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    );
  },
};
