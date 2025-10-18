'use client';

import { useState, useMemo } from 'react';
import type {
  AudioPresetBuilderSchema,
  PresetField,
  PresetValues,
} from '@/lib/audio/preset-builder-schema';
import { AudioPromptBuilder as PromptBuilder } from '@/lib/audio/prompt-builder';
import { Copy, Eye } from 'lucide-react';

interface AudioPromptBuilderProps {
  preset: AudioPresetBuilderSchema;
  onPromptChange?: (prompt: string) => void;
  onValuesChange?: (values: PresetValues) => void;
}

export default function AudioPromptBuilder({
  preset,
  onPromptChange,
  onValuesChange,
}: AudioPromptBuilderProps) {
  // 필드 값 상태
  const [values, setValues] = useState<PresetValues>(() => {
    const initialValues: Record<string, string | number | string[] | boolean> =
      {};
    preset.groups.forEach((group) => {
      group.fields.forEach((field) => {
        initialValues[field.id] = field.value;
      });
    });
    return initialValues as PresetValues;
  });

  // 복사 상태
  const [copied, setCopied] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  // 생성된 프롬프트
  const prompt = useMemo(() => {
    return PromptBuilder.buildPrompt(preset, values);
  }, [preset, values]);

  // 프롬프트 분석
  const promptAnalysis = useMemo(() => {
    return PromptBuilder.analyzePromptLength(prompt);
  }, [prompt]);

  // 필드 값 변경 핸들러
  const handleFieldChange = (fieldId: string, value: unknown) => {
    const castedValue = value as string | number | string[] | boolean;
    const newValues: PresetValues = { ...values, [fieldId]: castedValue };
    setValues(newValues);
    onValuesChange?.(newValues);
    onPromptChange?.(PromptBuilder.buildPrompt(preset, newValues));
  };

  // 프롬프트 복사
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Handle copy error silently
    }
  };

  // 필드 렌더링
  const renderField = (field: PresetField) => {
    const value = values[field.id];

    switch (field.type) {
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <label
              htmlFor={field.id}
              className="text-sm font-medium text-gray-300"
            >
              {field.label}
            </label>
            <select
              id={field.id}
              value={String(value)}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {field.options?.map((opt) => (
                <option key={opt} value={String(opt)}>
                  {String(opt)}
                </option>
              ))}
            </select>
          </div>
        );

      case 'range':
        return (
          <div key={field.id} className="space-y-3">
            <label
              htmlFor={field.id}
              className="text-sm font-medium text-gray-300"
            >
              {field.label}
            </label>
            <div className="flex items-center gap-3">
              <input
                id={field.id}
                type="range"
                value={Number(value)}
                onChange={(e) =>
                  handleFieldChange(field.id, Number(e.target.value))
                }
                min={field.min || 0}
                max={field.max || 100}
                step={field.step || 1}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <span className="text-sm font-medium text-gray-300 w-12 text-right">
                {Number(value)}
              </span>
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <label key={field.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-300">
              {field.label}
            </span>
          </label>
        );

      case 'multiselect':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              {field.label}
            </label>
            <div className="flex flex-wrap gap-2">
              {field.options?.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    const arr = Array.isArray(value) ? value : [];
                    const newVal = arr.includes(String(opt))
                      ? arr.filter((v) => v !== String(opt))
                      : [...arr, String(opt)];
                    handleFieldChange(field.id, newVal);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    Array.isArray(value) && value.includes(String(opt))
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <label
              htmlFor={field.id}
              className="text-sm font-medium text-gray-300"
            >
              {field.label}
            </label>
            <textarea
              id={field.id}
              value={String(value || '')}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 프리셋 정보 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          {preset.icon && <div className="text-2xl">{preset.icon}</div>}
          <div>
            <h3 className="font-semibold text-white">{preset.name}</h3>
            <p className="text-sm text-gray-400">{preset.description}</p>
          </div>
        </div>
      </div>

      {/* 필드 그룹들 */}
      {preset.groups.map((group) => (
        <div key={group.id} className="bg-gray-900 rounded-lg p-4 space-y-4">
          {/* 그룹 헤더 */}
          <div className="flex items-center gap-2 pb-3 border-b border-gray-700">
            {group.icon && <div className="text-lg">{group.icon}</div>}
            <h4 className="font-medium text-white">{group.name}</h4>
          </div>

          {/* 필드들 */}
          <div className="space-y-4">
            {group.fields
              .sort((a, b) => a.order - b.order)
              .map((field) => renderField(field))}
          </div>
        </div>
      ))}

      {/* 프롬프트 미리보기 */}
      <div className="bg-gray-900 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-white flex items-center gap-2">
            <Eye className="w-4 h-4" />
            생성된 프롬프트
          </h4>
          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copied ? '복사됨!' : '복사'}
          </button>
        </div>

        {/* 프롬프트 텍스트 */}
        <div className="relative">
          <div
            className={`bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 whitespace-pre-wrap break-words ${
              showFullPrompt ? 'max-h-none' : 'max-h-24 overflow-hidden'
            }`}
          >
            {prompt}
          </div>

          {prompt.length > 200 && (
            <button
              onClick={() => setShowFullPrompt(!showFullPrompt)}
              className="mt-2 text-xs text-purple-400 hover:text-purple-300"
            >
              {showFullPrompt ? '축소' : '전체 보기'}
            </button>
          )}
        </div>

        {/* 프롬프트 분석 */}
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
          <div>
            <div className="text-gray-500">글자 수</div>
            <div className="text-white font-medium">
              {promptAnalysis.characterCount}
            </div>
          </div>
          <div>
            <div className="text-gray-500">단어 수</div>
            <div className="text-white font-medium">
              {promptAnalysis.wordCount}
            </div>
          </div>
          <div>
            <div className="text-gray-500">예상 토큰</div>
            <div className="text-white font-medium">
              ~{promptAnalysis.estimatedTokens}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
