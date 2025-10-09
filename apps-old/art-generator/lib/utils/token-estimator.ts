import type {
  ImagePrompt,
  ImageEdit,
  ImageCompose,
  StyleTransfer,
} from '../schemas/image';

/**
 * Gemini 2.5 Flash Image token cost estimator
 * Based on: https://ai.google.dev/pricing
 */

// Base costs per operation (estimated)
const BASE_COSTS = {
  generate: 100, // Text-to-image
  edit: 150, // Image editing
  compose: 200, // Image composition (base + per image)
  styleTransfer: 150, // Style transfer
} as const;

// Resolution multipliers
const RESOLUTION_MULTIPLIERS = {
  low: 0.7, // < 512x512
  medium: 1.0, // 512x512 to 1024x1024
  high: 1.5, // > 1024x1024
} as const;

// Additional costs
const ADDITIONAL_COSTS = {
  negativePrompt: 10,
  seed: 5,
  perImage: 50, // For composition
} as const;

function getResolutionMultiplier(width: number, height: number): number {
  const pixels = width * height;

  if (pixels < 512 * 512) {
    return RESOLUTION_MULTIPLIERS.low;
  } else if (pixels <= 1024 * 1024) {
    return RESOLUTION_MULTIPLIERS.medium;
  } else {
    return RESOLUTION_MULTIPLIERS.high;
  }
}

export function estimateGenerationCost(prompt: ImagePrompt): number {
  let cost = BASE_COSTS.generate;

  // Apply resolution multiplier
  cost *= getResolutionMultiplier(prompt.width, prompt.height);

  // Add negative prompt cost
  if (prompt.negativePrompt) {
    cost += ADDITIONAL_COSTS.negativePrompt;
  }

  // Add seed cost
  if (prompt.seed !== undefined) {
    cost += ADDITIONAL_COSTS.seed;
  }

  return Math.round(cost);
}

export function estimateEditCost(edit: ImageEdit): number {
  let cost = BASE_COSTS.edit;

  // Add negative prompt cost
  if (edit.negativePrompt) {
    cost += ADDITIONAL_COSTS.negativePrompt;
  }

  return Math.round(cost);
}

export function estimateComposeCost(compose: ImageCompose): number {
  let cost = BASE_COSTS.compose;

  // Add per-image cost
  cost += (compose.images.length - 1) * ADDITIONAL_COSTS.perImage;

  return Math.round(cost);
}

export function estimateStyleTransferCost(_transfer: StyleTransfer): number {
  return BASE_COSTS.styleTransfer;
}
