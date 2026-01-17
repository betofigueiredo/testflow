import * as React from 'react';
import { CheckCircle2, XCircle, Circle, X, ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { TestRun, TestStep, StepResultStatus } from '@/types/test-flow';

interface TestRunExecutorProps {
  run: TestRun;
  steps: TestStep[];
  flowTitle: string;
  runNumber: number;
  onUpdateStepResult: (stepId: string, status: StepResultStatus) => void;
  onAddNote: (note: string) => void;
  onClose: () => void;
}

export function TestRunExecutor({
  run,
  steps,
  flowTitle,
  runNumber,
  onUpdateStepResult,
  onAddNote,
  onClose,
}: TestRunExecutorProps) {
  const [note, setNote] = React.useState(run.note ?? '');

  const getStepResult = (stepId: string) => {
    return run.stepResults.find((r) => r.stepId === stepId);
  };

  const handlePass = (stepId: string) => {
    onUpdateStepResult(stepId, 'passed');
  };

  const handleFail = (stepId: string) => {
    onUpdateStepResult(stepId, 'failed');
  };

  const handleSaveNote = () => {
    onAddNote(note.trim());
  };

  const passedCount = run.stepResults.filter(
    (r) => r.status === 'passed',
  ).length;
  const failedCount = run.stepResults.filter(
    (r) => r.status === 'failed',
  ).length;

  return (
    <div className="border-border bg-background fixed inset-0 z-50 flex flex-col overflow-hidden">
      <div className="border-border flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <ArrowLeft />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{flowTitle}</h2>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>Run #{runNumber}</span>
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
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-green-600">{passedCount} passed</span>
            <span className="text-muted-foreground mx-2">·</span>
            <span className="text-red-600">{failedCount} failed</span>
            <span className="text-muted-foreground mx-2">·</span>
            <span>{steps.length - passedCount - failedCount} remaining</span>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {steps.map((step, index) => {
            const result = getStepResult(step.id);
            const status = result?.status ?? 'pending';
            const isCompleted = status !== 'pending';

            return (
              <div
                key={step.id}
                className={cn(
                  'border-border border p-4',
                  status === 'passed' &&
                    'border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20',
                  status === 'failed' &&
                    'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20',
                  status === 'pending' && 'border-l-4 border-l-gray-300',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {status === 'passed' && (
                      <CheckCircle2 className="size-5 text-green-500" />
                    )}
                    {status === 'failed' && (
                      <XCircle className="size-5 text-red-500" />
                    )}
                    {status === 'pending' && (
                      <Circle className="text-muted-foreground size-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm font-medium">
                        Step {index + 1}
                      </span>
                      {isCompleted && (
                        <Badge
                          variant={
                            status === 'passed' ? 'default' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {status}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm">{step.description}</p>

                    {!isCompleted && run.status === 'in_progress' && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950"
                          onClick={() => handlePass(step.id)}
                        >
                          <CheckCircle2 data-icon="inline-start" />
                          Pass
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                          onClick={() => handleFail(step.id)}
                        >
                          <XCircle data-icon="inline-start" />
                          Fail
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {run.status !== 'in_progress' && (
        <div className="border-border border-t p-4">
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            <div className="text-sm">
              {run.status === 'passed' ? (
                <span className="font-medium text-green-600">
                  All steps passed!
                </span>
              ) : (
                <span className="font-medium text-red-600">
                  Run failed - one or more steps failed
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this run (optional)"
                className="min-h-20 text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                {note.trim() !== (run.note ?? '') && (
                  <Button onClick={handleSaveNote}>Save Note</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
