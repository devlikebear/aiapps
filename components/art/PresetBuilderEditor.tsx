'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react';
import type {
  PresetBuilderSchema,
  PresetGroup,
  PresetField,
  PresetFieldType,
  PresetFieldUnit,
} from '@/lib/art/preset-builder-schema';
import {
  createEmptyGroup,
  createEmptyField,
  buildPromptFromSchema,
} from '@/lib/art/preset-builder-schema';

interface PresetBuilderEditorProps {
  value: PresetBuilderSchema;
  onChange: (schema: PresetBuilderSchema) => void;
}

const FIELD_TYPES: { value: PresetFieldType; label: string }[] = [
  { value: 'text', label: '텍스트' },
  { value: 'number', label: '숫자' },
  { value: 'select', label: '선택 (단일)' },
  { value: 'multiselect', label: '선택 (다중)' },
  { value: 'slider', label: '슬라이더' },
  { value: 'textarea', label: '긴 텍스트' },
];

const UNITS: PresetFieldUnit[] = [
  'px',
  'em',
  'rem',
  '%',
  'm',
  'cm',
  'mm',
  'kg',
  'g',
  's',
  'ms',
];

export function PresetBuilderEditor({
  value,
  onChange,
}: PresetBuilderEditorProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(value.groups.map((g) => g.id))
  );
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  // 그룹 추가
  const handleAddGroup = () => {
    const newGroup = createEmptyGroup(
      `그룹 ${value.groups.length + 1}`,
      value.groups.length
    );
    onChange({
      ...value,
      groups: [...value.groups, newGroup],
    });
    setExpandedGroups((prev) => new Set([...prev, newGroup.id]));
  };

  // 그룹 삭제
  const handleDeleteGroup = (groupId: string) => {
    onChange({
      ...value,
      groups: value.groups.filter((g) => g.id !== groupId),
    });
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      newSet.delete(groupId);
      return newSet;
    });
  };

  // 그룹 수정
  const handleUpdateGroup = (
    groupId: string,
    updates: Partial<PresetGroup>
  ) => {
    onChange({
      ...value,
      groups: value.groups.map((g) =>
        g.id === groupId ? { ...g, ...updates } : g
      ),
    });
  };

  // 필드 추가
  const handleAddField = (groupId: string) => {
    onChange({
      ...value,
      groups: value.groups.map((g) => {
        if (g.id === groupId) {
          const newField = createEmptyField(
            `필드 ${g.fields.length + 1}`,
            'text',
            g.fields.length
          );
          return {
            ...g,
            fields: [...g.fields, newField],
          };
        }
        return g;
      }),
    });
  };

  // 필드 삭제
  const handleDeleteField = (groupId: string, fieldId: string) => {
    onChange({
      ...value,
      groups: value.groups.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            fields: g.fields.filter((f) => f.id !== fieldId),
          };
        }
        return g;
      }),
    });
  };

  // 필드 수정
  const handleUpdateField = (
    groupId: string,
    fieldId: string,
    updates: Partial<PresetField>
  ) => {
    onChange({
      ...value,
      groups: value.groups.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            fields: g.fields.map((f) =>
              f.id === fieldId ? { ...f, ...updates } : f
            ),
          };
        }
        return g;
      }),
    });
  };

  // 그룹 확장/축소 토글
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

  // 프롬프트 미리보기 생성
  const previewPrompt = buildPromptFromSchema(value);

  return (
    <div className="space-y-6">
      {/* 프롬프트 미리보기 */}
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPromptPreview(!showPromptPreview)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-800 transition-colors"
        >
          <span className="font-medium">🔍 프롬프트 미리보기</span>
          {showPromptPreview ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
        {showPromptPreview && (
          <div className="p-4 bg-gray-900/50">
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
              {previewPrompt || '(값을 입력하면 프롬프트가 생성됩니다)'}
            </p>
          </div>
        )}
      </div>

      {/* 그룹 목록 */}
      <div className="space-y-4">
        {value.groups
          .sort((a, b) => a.order - b.order)
          .map((group) => (
            <div
              key={group.id}
              className="border border-gray-700 rounded-lg overflow-hidden"
            >
              {/* 그룹 헤더 */}
              <div className="bg-gray-800/50 p-3 flex items-center gap-3">
                <button
                  type="button"
                  className="cursor-move text-gray-400 hover:text-gray-300"
                  title="드래그하여 순서 변경 (구현 예정)"
                >
                  <GripVertical className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={group.icon || ''}
                  onChange={(e) =>
                    handleUpdateGroup(group.id, { icon: e.target.value })
                  }
                  placeholder="🎨"
                  maxLength={2}
                  className="w-12 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-center"
                />

                <input
                  type="text"
                  value={group.name}
                  onChange={(e) =>
                    handleUpdateGroup(group.id, { name: e.target.value })
                  }
                  placeholder="그룹 이름"
                  className="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded"
                />

                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  {expandedGroups.has(group.id) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteGroup(group.id)}
                  className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                  title="그룹 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 그룹 내용 (필드 목록) */}
              {expandedGroups.has(group.id) && (
                <div className="p-4 space-y-3 bg-gray-900/30">
                  {group.fields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <FieldEditor
                        key={field.id}
                        field={field}
                        onUpdate={(updates) =>
                          handleUpdateField(group.id, field.id, updates)
                        }
                        onDelete={() => handleDeleteField(group.id, field.id)}
                      />
                    ))}

                  {/* 필드 추가 버튼 */}
                  <button
                    type="button"
                    onClick={() => handleAddField(group.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg transition-colors text-gray-400 hover:text-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                    필드 추가
                  </button>
                </div>
              )}
            </div>
          ))}

        {/* 그룹 추가 버튼 */}
        <button
          type="button"
          onClick={handleAddGroup}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg transition-colors text-gray-400 hover:text-gray-300"
        >
          <Plus className="w-5 h-5" />
          그룹 추가
        </button>
      </div>
    </div>
  );
}

// 필드 에디터 컴포넌트
function FieldEditor({
  field,
  onUpdate,
  onDelete,
}: {
  field: PresetField;
  onUpdate: (updates: Partial<PresetField>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-3 bg-gray-800/50 rounded-lg space-y-3">
      {/* 필드 기본 정보 */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="cursor-move text-gray-400 hover:text-gray-300 mt-2"
          title="드래그하여 순서 변경 (구현 예정)"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 space-y-3">
          {/* 레이블과 타입 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">레이블</label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                placeholder="필드 레이블"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">타입</label>
              <select
                value={field.type}
                onChange={(e) =>
                  onUpdate({ type: e.target.value as PresetFieldType })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
              >
                {FIELD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 프롬프트 템플릿 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              프롬프트 템플릿{' '}
              <span className="text-gray-500">{`({{value}}, {{unit}} 사용)`}</span>
            </label>
            <input
              type="text"
              value={field.promptTemplate}
              onChange={(e) => onUpdate({ promptTemplate: e.target.value })}
              placeholder="{{value}} style"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm font-mono"
            />
          </div>

          {/* 타입별 추가 옵션 */}
          {(field.type === 'select' || field.type === 'multiselect') && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                선택 옵션 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={(field.options || []).join(', ')}
                onChange={(e) =>
                  onUpdate({
                    options: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="옵션1, 옵션2, 옵션3"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
              />
            </div>
          )}

          {(field.type === 'number' || field.type === 'slider') && (
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">최소</label>
                <input
                  type="number"
                  value={field.min ?? ''}
                  onChange={(e) =>
                    onUpdate({
                      min: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="0"
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">최대</label>
                <input
                  type="number"
                  value={field.max ?? ''}
                  onChange={(e) =>
                    onUpdate({
                      max: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="100"
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">단계</label>
                <input
                  type="number"
                  value={field.step ?? ''}
                  onChange={(e) =>
                    onUpdate({
                      step: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="1"
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">단위</label>
                <select
                  value={field.unit ?? ''}
                  onChange={(e) =>
                    onUpdate({
                      unit: e.target.value
                        ? (e.target.value as PresetFieldUnit)
                        : undefined,
                    })
                  }
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                >
                  <option value="">없음</option>
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="p-1 hover:bg-red-500/20 text-red-400 rounded mt-2"
          title="필드 삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
