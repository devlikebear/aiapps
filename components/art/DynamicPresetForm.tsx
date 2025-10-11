'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type {
  PresetBuilderSchema,
  PresetField,
} from '@/lib/art/preset-builder-schema';

interface DynamicPresetFormProps {
  schema: PresetBuilderSchema;
  onChange: (schema: PresetBuilderSchema) => void;
}

/**
 * 동적 프리셋 폼
 * PresetBuilderSchema를 기반으로 자동으로 폼을 생성하고 값을 수집
 */
export function DynamicPresetForm({
  schema,
  onChange,
}: DynamicPresetFormProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(schema.groups.map((g) => g.id))
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleFieldValueChange = (
    groupId: string,
    fieldId: string,
    value: string | number | string[]
  ) => {
    const updatedSchema: PresetBuilderSchema = {
      ...schema,
      groups: schema.groups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            fields: group.fields.map((field) =>
              field.id === fieldId ? { ...field, value } : field
            ),
          };
        }
        return group;
      }),
    };
    onChange(updatedSchema);
  };

  return (
    <div className="space-y-4">
      {schema.groups
        .sort((a, b) => a.order - b.order)
        .map((group) => (
          <div
            key={group.id}
            className="border border-gray-700 rounded-lg overflow-hidden"
          >
            {/* 그룹 헤더 */}
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                {group.icon && <span className="text-lg">{group.icon}</span>}
                <span className="font-medium">{group.name}</span>
              </div>
              {expandedGroups.has(group.id) ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {/* 그룹 필드 */}
            {expandedGroups.has(group.id) && (
              <div className="p-4 space-y-4 bg-gray-900/30">
                {group.fields
                  .sort((a, b) => a.order - b.order)
                  .map((field) => (
                    <FieldInput
                      key={field.id}
                      field={field}
                      onChange={(value) =>
                        handleFieldValueChange(group.id, field.id, value)
                      }
                    />
                  ))}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

// 필드 입력 컴포넌트
function FieldInput({
  field,
  onChange,
}: {
  field: PresetField;
  onChange: (value: string | number | string[]) => void;
}) {
  const renderInput = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={field.value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        );

      case 'number':
        return (
          <div className="flex gap-2">
            <input
              type="number"
              value={field.value as number}
              onChange={(e) => onChange(Number(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step}
              placeholder={field.placeholder}
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {field.unit && (
              <span className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400">
                {field.unit}
              </span>
            )}
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="range"
                value={field.value as number}
                onChange={(e) => onChange(Number(e.target.value))}
                min={field.min ?? 0}
                max={field.max ?? 100}
                step={field.step ?? 1}
                className="flex-1"
              />
              <span className="min-w-[60px] px-3 py-1 bg-gray-700 border border-gray-600 rounded text-center">
                {field.value}
                {field.unit}
              </span>
            </div>
          </div>
        );

      case 'select':
        return (
          <select
            value={field.value as string}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">선택하세요</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => {
              const isSelected = (field.value as string[]).includes(option);
              return (
                <label
                  key={option}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const currentValue = field.value as string[];
                      if (e.target.checked) {
                        onChange([...currentValue, option]);
                      } else {
                        onChange(currentValue.filter((v) => v !== option));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              );
            })}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={field.value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{field.label}</label>
      {renderInput()}
      {field.helpText && (
        <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
      )}
    </div>
  );
}
