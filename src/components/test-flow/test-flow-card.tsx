import * as React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
  X,
  Check,
  Play,
  History,
} from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/alert-dialog';
import { TestStepItem } from './test-step-item';
import { TestRunItem } from './test-run-item';
import { TestRunExecutor } from './test-run-executor';
import type {
  TestFlow,
  TestStep,
  TestRun,
  StepResultStatus,
} from '@/types/test-flow';

interface TestFlowCardProps {
  flow: TestFlow;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
  onAddStep: (description: string) => void;
  onUpdateStep: (
    stepId: string,
    updates: Partial<Omit<TestStep, 'id'>>,
  ) => void;
  onDeleteStep: (stepId: string) => void;
  onStartRun: () => TestRun | null;
  onUpdateStepResult: (
    runId: string,
    stepId: string,
    status: StepResultStatus,
  ) => void;
  onAddRunNote: (runId: string, note: string) => void;
  onDeleteRun: (runId: string) => void;
}

export function TestFlowCard({
  flow,
  onUpdateTitle,
  onDelete,
  onAddStep,
  onUpdateStep,
  onDeleteStep,
  onStartRun,
  onUpdateStepResult,
  onAddRunNote,
  onDeleteRun,
}: TestFlowCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [title, setTitle] = React.useState(flow.title);
  const [isAddingStep, setIsAddingStep] = React.useState(false);
  const [newStepDescription, setNewStepDescription] = React.useState('');
  const [showRuns, setShowRuns] = React.useState(false);
  const [activeRunId, setActiveRunId] = React.useState<string | null>(null);

  const activeRun = activeRunId
    ? flow.runs.find((r) => r.id === activeRunId)
    : null;

  const lastRun = flow.runs.length > 0 ? flow.runs[flow.runs.length - 1] : null;

  const handleStartRun = () => {
    const newRun = onStartRun();
    if (newRun) {
      setActiveRunId(newRun.id);
    }
  };

  const handleContinueRun = (runId: string) => {
    setActiveRunId(runId);
  };

  const handleSaveTitle = () => {
    if (!title.trim()) return;
    onUpdateTitle(title.trim());
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTitle(flow.title);
    setIsEditingTitle(false);
  };

  const handleAddStep = () => {
    if (!newStepDescription.trim()) return;
    onAddStep(newStepDescription.trim());
    setNewStepDescription('');
    setIsAddingStep(false);
  };

  const handleCancelAddStep = () => {
    setNewStepDescription('');
    setIsAddingStep(false);
  };

  return (
    <Card>
      <CardHeader>
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') handleCancelTitle();
              }}
              autoFocus
              className="flex-1"
            />
            <Button variant="ghost" size="icon-xs" onClick={handleCancelTitle}>
              <X />
            </Button>
            <Button
              size="icon-xs"
              onClick={handleSaveTitle}
              disabled={!title.trim()}
            >
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
              {lastRun && (
                <Badge
                  variant={
                    lastRun.status === 'failed'
                      ? 'destructive'
                      : lastRun.status === 'in_progress'
                        ? 'secondary'
                        : 'outline'
                  }
                  className={
                    lastRun.status === 'passed'
                      ? 'border-green-500 bg-green-500/10 text-green-600'
                      : undefined
                  }
                >
                  {lastRun.status === 'in_progress'
                    ? 'In Progress'
                    : lastRun.status}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {flow.steps.length} step{flow.steps.length !== 1 ? 's' : ''} ·{' '}
              {flow.runs?.length ?? 0} run
              {(flow.runs?.length ?? 0) !== 1 ? 's' : ''}
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
                      This will permanently delete "{flow.title}" and all its
                      steps. This action cannot be undone.
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
                    if (e.key === 'Enter') handleAddStep();
                    if (e.key === 'Escape') handleCancelAddStep();
                  }}
                  placeholder="Step description"
                  autoFocus
                />
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={handleCancelAddStep}
                  >
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
            <CardFooter className="flex-col gap-2">
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingStep(true)}
                  className="flex-1"
                >
                  <Plus data-icon="inline-start" />
                  Add Step
                </Button>
                <Button
                  size="sm"
                  onClick={handleStartRun}
                  disabled={flow.steps.length === 0}
                  className="flex-1"
                >
                  <Play data-icon="inline-start" />
                  Start Run
                </Button>
              </div>
              {flow.runs && flow.runs.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRuns(!showRuns)}
                  className="w-full"
                >
                  <History data-icon="inline-start" />
                  {showRuns ? 'Hide' : 'Show'} Run History ({flow.runs.length})
                </Button>
              )}
            </CardFooter>
          )}

          {showRuns && flow.runs && flow.runs.length > 0 && (
            <>
              <Separator />
              <CardContent className="flex flex-col gap-2">
                <h4 className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Run History
                </h4>
                {[...flow.runs].reverse().map((run, index) => (
                  <TestRunItem
                    key={run.id}
                    run={run}
                    runNumber={flow.runs.length - index}
                    steps={flow.steps}
                    onDelete={() => onDeleteRun(run.id)}
                    onContinue={() => handleContinueRun(run.id)}
                  />
                ))}
              </CardContent>
            </>
          )}
        </>
      )}

      {activeRun && (
        <TestRunExecutor
          run={activeRun}
          steps={flow.steps}
          flowTitle={flow.title}
          runNumber={flow.runs.findIndex((r) => r.id === activeRun.id) + 1}
          onUpdateStepResult={(stepId, status) =>
            onUpdateStepResult(activeRun.id, stepId, status)
          }
          onAddNote={(note) => onAddRunNote(activeRun.id, note)}
          onClose={() => setActiveRunId(null)}
        />
      )}
    </Card>
  );
}
