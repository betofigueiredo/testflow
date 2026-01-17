import * as React from 'react';
import { Plus, FlaskConical, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TestFlowCard } from './test-flow-card';
import { useTestFlows } from '@/hooks/use-test-flows';

export function TestFlowList() {
  const {
    flows,
    isLoaded,
    createFlow,
    updateFlow,
    deleteFlow,
    addStep,
    updateStep,
    deleteStep,
    startRun,
    updateStepResult,
    addRunNote,
    deleteRun,
    exportFlows,
  } = useTestFlows();

  const [isCreating, setIsCreating] = React.useState(false);
  const [newFlowTitle, setNewFlowTitle] = React.useState('');

  const handleCreateFlow = () => {
    if (!newFlowTitle.trim()) return;
    createFlow(newFlowTitle.trim());
    setNewFlowTitle('');
    setIsCreating(false);
  };

  const handleCancelCreate = () => {
    setNewFlowTitle('');
    setIsCreating(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <FlaskConical className="size-5" />
          Test Flows
        </h1>
        {!isCreating && (
          <div className="flex gap-2">
            {flows.length > 0 && (
              <Button variant="outline" onClick={exportFlows}>
                <Download data-icon="inline-start" />
                Export
              </Button>
            )}
            <Button onClick={() => setIsCreating(true)}>
              <Plus data-icon="inline-start" />
              New Flow
            </Button>
          </div>
        )}
      </div>

      {isCreating && (
        <div className="border-border bg-muted/30 flex items-center gap-2 border border-dashed p-3">
          <Input
            value={newFlowTitle}
            onChange={(e) => setNewFlowTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFlow();
              if (e.key === 'Escape') handleCancelCreate();
            }}
            placeholder="Enter test flow title..."
            autoFocus
            className="flex-1"
          />
          <Button variant="ghost" size="sm" onClick={handleCancelCreate}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleCreateFlow}
            disabled={!newFlowTitle.trim()}
          >
            Create
          </Button>
        </div>
      )}

      {flows.length === 0 && !isCreating ? (
        <div className="border-border flex flex-col items-center justify-center gap-3 border border-dashed py-16">
          <FlaskConical className="text-muted-foreground size-12" />
          <div className="text-center">
            <p className="text-sm font-medium">No test flows yet</p>
            <p className="text-muted-foreground text-xs">
              Create your first test flow to get started
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="mt-2">
            <Plus data-icon="inline-start" />
            Create Test Flow
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {flows.map((flow) => (
            <TestFlowCard
              key={flow.id}
              flow={flow}
              onUpdateTitle={(title) => updateFlow(flow.id, { title })}
              onDelete={() => deleteFlow(flow.id)}
              onAddStep={(description) => addStep(flow.id, description)}
              onUpdateStep={(stepId, updates) =>
                updateStep(flow.id, stepId, updates)
              }
              onDeleteStep={(stepId) => deleteStep(flow.id, stepId)}
              onStartRun={() => startRun(flow.id)}
              onUpdateStepResult={(runId, stepId, status) =>
                updateStepResult(flow.id, runId, stepId, status)
              }
              onAddRunNote={(runId, note) => addRunNote(flow.id, runId, note)}
              onDeleteRun={(runId) => deleteRun(flow.id, runId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
