import * as React from 'react'
import { CheckCircle2, XCircle, Clock, Trash2, Play } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import type { TestRun, TestStep } from '@/types/test-flow'

interface TestRunItemProps {
  run: TestRun
  runNumber: number
  steps: TestStep[]
  onDelete: () => void
  onContinue: () => void
}

export function TestRunItem({ run, runNumber, steps, onDelete, onContinue }: TestRunItemProps) {
  const passedCount = run.stepResults.filter((r) => r.status === 'passed').length
  const failedCount = run.stepResults.filter((r) => r.status === 'failed').length
  const pendingCount = run.stepResults.filter((r) => r.status === 'pending').length

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  return (
    <div
      className={cn(
        'border-border hover:bg-muted/30 group flex items-center gap-3 border p-3 transition-colors',
        run.status === 'passed' && 'border-l-4 border-l-green-500',
        run.status === 'failed' && 'border-l-4 border-l-red-500',
        run.status === 'in_progress' && 'border-l-4 border-l-yellow-500',
      )}
    >
      <div className="flex items-center gap-2">
        {run.status === 'passed' && <CheckCircle2 className="size-5 text-green-500" />}
        {run.status === 'failed' && <XCircle className="size-5 text-red-500" />}
        {run.status === 'in_progress' && <Clock className="size-5 text-yellow-500" />}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Run #{runNumber}</span>
          <Badge
            variant={
              run.status === 'passed'
                ? 'default'
                : run.status === 'failed'
                  ? 'destructive'
                  : 'secondary'
            }
          >
            {run.status === 'in_progress' ? 'In Progress' : run.status}
          </Badge>
        </div>
        <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
          <span>Started: {formatDate(run.createdAt)}</span>
          {run.completedAt && <span>Completed: {formatDate(run.completedAt)}</span>}
        </div>
        <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
          <span className="text-green-600">{passedCount} passed</span>
          <span className="text-red-600">{failedCount} failed</span>
          <span>{pendingCount} pending</span>
        </div>
      </div>

      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {run.status === 'in_progress' && (
          <Button
            variant="outline"
            size="xs"
            onClick={onContinue}
            aria-label="Continue run"
          >
            <Play data-icon="inline-start" />
            Continue
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Delete run"
                className="hover:text-destructive"
              />
            }
          >
            <Trash2 />
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Run?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete Run #{runNumber} and its results.
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
    </div>
  )
}
