import * as React from 'react'
import { GripVertical, Pencil, Trash2, X, Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { TestStep } from '@/types/test-flow'

interface TestStepItemProps {
  step: TestStep
  index: number
  onUpdate: (updates: Partial<Omit<TestStep, 'id'>>) => void
  onDelete: () => void
}

export function TestStepItem({ step, index, onUpdate, onDelete }: TestStepItemProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [description, setDescription] = React.useState(step.description)
  const [expectedResult, setExpectedResult] = React.useState(step.expectedResult ?? '')

  const handleSave = () => {
    if (!description.trim()) return
    onUpdate({
      description: description.trim(),
      expectedResult: expectedResult.trim() || undefined,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDescription(step.description)
    setExpectedResult(step.expectedResult ?? '')
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="border-border bg-muted/30 flex flex-col gap-2 border p-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground w-6 text-center text-xs font-medium">
            {index + 1}.
          </span>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Step description"
            autoFocus
          />
        </div>
        <div className="flex items-start gap-2 pl-8">
          <Textarea
            value={expectedResult}
            onChange={(e) => setExpectedResult(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Expected result (optional)"
            className="min-h-12"
          />
        </div>
        <div className="flex justify-end gap-1 pl-8">
          <Button variant="ghost" size="xs" onClick={handleCancel}>
            <X data-icon="inline-start" />
            Cancel
          </Button>
          <Button size="xs" onClick={handleSave} disabled={!description.trim()}>
            <Check data-icon="inline-start" />
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'border-border hover:bg-muted/30 group flex items-start gap-2 border p-3 transition-colors'
      )}
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground mt-0.5 cursor-grab opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="text-muted-foreground w-6 text-center text-xs font-medium">
        {index + 1}.
      </span>
      <div className="flex-1">
        <p className="text-sm">{step.description}</p>
        {step.expectedResult && (
          <p className="text-muted-foreground mt-1 text-xs">
            Expected: {step.expectedResult}
          </p>
        )}
      </div>
      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setIsEditing(true)}
          aria-label="Edit step"
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDelete}
          aria-label="Delete step"
          className="hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  )
}
