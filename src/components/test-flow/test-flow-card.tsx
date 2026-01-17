import * as React from 'react'
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, X, Check } from 'lucide-react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { TestStepItem } from './test-step-item'
import type { TestFlow, TestStep } from '@/types/test-flow'

interface TestFlowCardProps {
  flow: TestFlow
  onUpdateTitle: (title: string) => void
  onDelete: () => void
  onAddStep: (description: string, expectedResult?: string) => void
  onUpdateStep: (stepId: string, updates: Partial<Omit<TestStep, 'id'>>) => void
  onDeleteStep: (stepId: string) => void
}

export function TestFlowCard({
  flow,
  onUpdateTitle,
  onDelete,
  onAddStep,
  onUpdateStep,
  onDeleteStep,
}: TestFlowCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(true)
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [title, setTitle] = React.useState(flow.title)
  const [isAddingStep, setIsAddingStep] = React.useState(false)
  const [newStepDescription, setNewStepDescription] = React.useState('')
  const [newStepExpectedResult, setNewStepExpectedResult] = React.useState('')

  const handleSaveTitle = () => {
    if (!title.trim()) return
    onUpdateTitle(title.trim())
    setIsEditingTitle(false)
  }

  const handleCancelTitle = () => {
    setTitle(flow.title)
    setIsEditingTitle(false)
  }

  const handleAddStep = () => {
    if (!newStepDescription.trim()) return
    onAddStep(newStepDescription.trim(), newStepExpectedResult.trim() || undefined)
    setNewStepDescription('')
    setNewStepExpectedResult('')
    setIsAddingStep(false)
  }

  const handleCancelAddStep = () => {
    setNewStepDescription('')
    setNewStepExpectedResult('')
    setIsAddingStep(false)
  }

  return (
    <Card>
      <CardHeader>
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle()
                if (e.key === 'Escape') handleCancelTitle()
              }}
              autoFocus
              className="flex-1"
            />
            <Button variant="ghost" size="icon-xs" onClick={handleCancelTitle}>
              <X />
            </Button>
            <Button size="icon-xs" onClick={handleSaveTitle} disabled={!title.trim()}>
              <Check />
            </Button>
          </div>
        ) : (
          <>
            <CardTitle className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hover:bg-muted -ml-1 rounded p-1"
              >
                {isExpanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </button>
              {flow.title}
            </CardTitle>
            <CardDescription>
              {flow.steps.length} step{flow.steps.length !== 1 ? 's' : ''}
            </CardDescription>
          </>
        )}
        {!isEditingTitle && (
          <CardAction>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsEditingTitle(true)}
                aria-label="Edit title"
              >
                <Pencil />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Delete test flow"
                      className="hover:text-destructive"
                    />
                  }
                >
                  <Trash2 />
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Test Flow?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{flow.title}" and all its steps.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardAction>
        )}
      </CardHeader>

      {isExpanded && (
        <>
          <CardContent className="flex flex-col gap-2">
            {flow.steps.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-xs">
                No steps yet. Add your first step below.
              </p>
            ) : (
              flow.steps.map((step, index) => (
                <TestStepItem
                  key={step.id}
                  step={step}
                  index={index}
                  onUpdate={(updates) => onUpdateStep(step.id, updates)}
                  onDelete={() => onDeleteStep(step.id)}
                />
              ))
            )}

            {isAddingStep && (
              <div className="border-border bg-muted/30 flex flex-col gap-2 border border-dashed p-3">
                <Input
                  value={newStepDescription}
                  onChange={(e) => setNewStepDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey) handleAddStep()
                    if (e.key === 'Escape') handleCancelAddStep()
                  }}
                  placeholder="Step description"
                  autoFocus
                />
                <Textarea
                  value={newStepExpectedResult}
                  onChange={(e) => setNewStepExpectedResult(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey) handleAddStep()
                    if (e.key === 'Escape') handleCancelAddStep()
                  }}
                  placeholder="Expected result (optional)"
                  className="min-h-12"
                />
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="xs" onClick={handleCancelAddStep}>
                    <X data-icon="inline-start" />
                    Cancel
                  </Button>
                  <Button
                    size="xs"
                    onClick={handleAddStep}
                    disabled={!newStepDescription.trim()}
                  >
                    <Check data-icon="inline-start" />
                    Add Step
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          {!isAddingStep && (
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingStep(true)}
                className="w-full"
              >
                <Plus data-icon="inline-start" />
                Add Step
              </Button>
            </CardFooter>
          )}
        </>
      )}
    </Card>
  )
}
