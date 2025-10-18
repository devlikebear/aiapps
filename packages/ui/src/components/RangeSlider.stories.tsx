import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RangeSlider } from './RangeSlider';

const meta = {
  title: 'Components/RangeSlider',
  component: RangeSlider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A customizable range slider input component for selecting numeric values within a defined range.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RangeSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper for stories
function RangeSliderWrapper({
  defaultValue = 50,
  ...props
}: React.ComponentProps<typeof RangeSlider> & { defaultValue?: number }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="w-full max-w-md">
      <RangeSlider
        {...props}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
    </div>
  );
}

/**
 * Default RangeSlider with standard configuration
 */
export const Default: Story = {
  render: () => <RangeSliderWrapper defaultValue={50} />,
};

/**
 * RangeSlider with label and helper text
 */
export const WithLabelAndHelper: Story = {
  render: () => (
    <RangeSliderWrapper
      label="Volume"
      helperText="Adjust the volume level (0-100)"
      defaultValue={75}
    />
  ),
};

/**
 * RangeSlider with value display
 */
export const WithValueDisplay: Story = {
  render: () => (
    <RangeSliderWrapper label="Brightness" valueDisplay defaultValue={60} />
  ),
};

/**
 * RangeSlider with value display hidden
 */
export const WithoutValueDisplay: Story = {
  render: () => (
    <RangeSliderWrapper
      label="Opacity"
      valueDisplay={false}
      defaultValue={80}
    />
  ),
};

/**
 * RangeSlider at minimum value
 */
export const MinimumValue: Story = {
  render: () => (
    <RangeSliderWrapper
      label="Speed"
      min={0}
      max={100}
      defaultValue={0}
      helperText="Minimum speed"
    />
  ),
};

/**
 * RangeSlider at maximum value
 */
export const MaximumValue: Story = {
  render: () => (
    <RangeSliderWrapper
      label="Quality"
      min={0}
      max={100}
      defaultValue={100}
      helperText="Maximum quality"
    />
  ),
};

/**
 * RangeSlider with custom range (1-10)
 */
export const CustomRange: Story = {
  render: () => (
    <RangeSliderWrapper
      label="Difficulty"
      min={1}
      max={10}
      defaultValue={5}
      helperText="Select difficulty level from 1 to 10"
    />
  ),
};

/**
 * RangeSlider with step value
 */
export const WithStep: Story = {
  render: () => (
    <RangeSliderWrapper
      label="Batch Size"
      min={1}
      max={4}
      step={1}
      defaultValue={2}
      helperText="Select batch size (step by 1)"
    />
  ),
};

/**
 * RangeSlider in full width
 */
export const FullWidth: Story = {
  render: () => (
    <div className="w-full bg-gray-900 p-8">
      <RangeSliderWrapper
        label="Duration"
        min={30}
        max={300}
        defaultValue={60}
        helperText="Select duration in seconds"
        fullWidth={true}
      />
    </div>
  ),
};

/**
 * Disabled RangeSlider
 */
export const Disabled: Story = {
  render: () => (
    <RangeSliderWrapper
      label="Disabled Slider"
      disabled={true}
      defaultValue={50}
      helperText="This slider is disabled"
    />
  ),
};

/**
 * RangeSlider with error state
 */
export const WithError: Story = {
  render: () => (
    <RangeSliderWrapper
      label="Invalid Value"
      error="Value is out of acceptable range"
      defaultValue={150}
      min={0}
      max={100}
    />
  ),
};

/**
 * Multiple RangeSliders for comparison
 */
function MultipleRangeSlidersComponent() {
  const [brightness, setBrightness] = useState(70);
  const [contrast, setContrast] = useState(50);
  const [saturation, setSaturation] = useState(80);

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <RangeSlider
          label="Brightness"
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          min={0}
          max={100}
          helperText="Adjust brightness (0-100)"
          fullWidth
        />
      </div>

      <div>
        <RangeSlider
          label="Contrast"
          value={contrast}
          onChange={(e) => setContrast(Number(e.target.value))}
          min={0}
          max={100}
          helperText="Adjust contrast (0-100)"
          fullWidth
        />
      </div>

      <div>
        <RangeSlider
          label="Saturation"
          value={saturation}
          onChange={(e) => setSaturation(Number(e.target.value))}
          min={0}
          max={100}
          helperText="Adjust saturation (0-100)"
          fullWidth
        />
      </div>

      <div className="pt-4 border-t border-gray-700">
        <p className="text-sm text-gray-300">Current Values:</p>
        <p className="text-xs text-gray-400 mt-2">
          Brightness: {brightness}% | Contrast: {contrast}% | Saturation:{' '}
          {saturation}%
        </p>
      </div>
    </div>
  );
}

export const Multiple: Story = {
  render: () => <MultipleRangeSlidersComponent />,
};

/**
 * Audio Duration Slider (Audio Generator Use Case)
 */
export const AudioDuration: Story = {
  render: () => (
    <RangeSliderWrapper
      label="Duration"
      min={1}
      max={10}
      step={1}
      defaultValue={5}
      helperText="Set audio duration in seconds (1-10 seconds for SFX)"
    />
  ),
};

/**
 * Image Batch Size Slider (Art Generator Use Case)
 */
export const ImageBatchSize: Story = {
  render: () => (
    <RangeSliderWrapper
      label="Batch Size"
      min={1}
      max={4}
      step={1}
      defaultValue={1}
      helperText="Generate multiple images at once (1-4 images)"
    />
  ),
};
