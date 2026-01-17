import { useState, useEffect, useCallback } from 'react';
import type {
  TestFlow,
  TestStep,
  TestRun,
  StepResultStatus,
} from '@/types/test-flow';

const STORAGE_KEY = 'testflow-data';
const MAX_RUNS_PER_FLOW = 5;

function generateId(): string {
  return crypto.randomUUID();
}

function loadFromStorage(): TestFlow[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const flows = JSON.parse(data) as TestFlow[];
    // Ensure backward compatibility: add runs array if missing
    return flows.map((flow) => ({
      ...flow,
      runs: flow.runs ?? [],
    }));
  } catch {
    return [];
  }
}

function saveToStorage(flows: TestFlow[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flows));
}

export function useTestFlows() {
  const [flows, setFlows] = useState<TestFlow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setFlows(loadFromStorage());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveToStorage(flows);
    }
  }, [flows, isLoaded]);

  const createFlow = useCallback((title: string): TestFlow => {
    const now = new Date().toISOString();
    const newFlow: TestFlow = {
      id: generateId(),
      title,
      steps: [],
      runs: [],
      createdAt: now,
      updatedAt: now,
    };
    setFlows((prev) => [...prev, newFlow]);
    return newFlow;
  }, []);

  const updateFlow = useCallback(
    (id: string, updates: Partial<Pick<TestFlow, 'title'>>) => {
      setFlows((prev) =>
        prev.map((flow) =>
          flow.id === id
            ? { ...flow, ...updates, updatedAt: new Date().toISOString() }
            : flow,
        ),
      );
    },
    [],
  );

  const deleteFlow = useCallback((id: string) => {
    setFlows((prev) => prev.filter((flow) => flow.id !== id));
  }, []);

  const addStep = useCallback(
    (flowId: string, description: string): TestStep => {
      const newStep: TestStep = {
        id: generateId(),
        description,
      };
      setFlows((prev) =>
        prev.map((flow) =>
          flow.id === flowId
            ? {
                ...flow,
                steps: [...flow.steps, newStep],
                updatedAt: new Date().toISOString(),
              }
            : flow,
        ),
      );
      return newStep;
    },
    [],
  );

  const updateStep = useCallback(
    (
      flowId: string,
      stepId: string,
      updates: Partial<Omit<TestStep, 'id'>>,
    ) => {
      setFlows((prev) =>
        prev.map((flow) =>
          flow.id === flowId
            ? {
                ...flow,
                steps: flow.steps.map((step) =>
                  step.id === stepId ? { ...step, ...updates } : step,
                ),
                updatedAt: new Date().toISOString(),
              }
            : flow,
        ),
      );
    },
    [],
  );

  const deleteStep = useCallback((flowId: string, stepId: string) => {
    setFlows((prev) =>
      prev.map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              steps: flow.steps.filter((step) => step.id !== stepId),
              updatedAt: new Date().toISOString(),
            }
          : flow,
      ),
    );
  }, []);

  const reorderSteps = useCallback(
    (flowId: string, fromIndex: number, toIndex: number) => {
      setFlows((prev) =>
        prev.map((flow) => {
          if (flow.id !== flowId) return flow;
          const newSteps = [...flow.steps];
          const [removed] = newSteps.splice(fromIndex, 1);
          newSteps.splice(toIndex, 0, removed);
          return {
            ...flow,
            steps: newSteps,
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [],
  );

  const startRun = useCallback(
    (flowId: string): TestRun | null => {
      const flow = flows.find((f) => f.id === flowId);
      if (!flow || flow.steps.length === 0) return null;

      const newRun: TestRun = {
        id: generateId(),
        flowId,
        status: 'in_progress',
        stepResults: flow.steps.map((step) => ({
          stepId: step.id,
          status: 'pending' as StepResultStatus,
        })),
        createdAt: new Date().toISOString(),
      };

      setFlows((prev) =>
        prev.map((f) => {
          if (f.id !== flowId) return f;
          // Add new run and keep only the last MAX_RUNS_PER_FLOW runs
          const updatedRuns = [...f.runs, newRun].slice(-MAX_RUNS_PER_FLOW);
          return {
            ...f,
            runs: updatedRuns,
            updatedAt: new Date().toISOString(),
          };
        }),
      );

      return newRun;
    },
    [flows],
  );

  const updateStepResult = useCallback(
    (
      flowId: string,
      runId: string,
      stepId: string,
      status: StepResultStatus,
    ) => {
      setFlows((prev) =>
        prev.map((flow) => {
          if (flow.id !== flowId) return flow;

          const updatedRuns = flow.runs.map((run) => {
            if (run.id !== runId) return run;

            const updatedStepResults = run.stepResults.map((result) =>
              result.stepId === stepId ? { ...result, status } : result,
            );

            // If any step fails, mark the run as failed immediately
            if (status === 'failed') {
              return {
                ...run,
                stepResults: updatedStepResults,
                status: 'failed',
                completedAt: new Date().toISOString(),
              } as TestRun;
            }

            // Check if all steps are completed and determine run status
            const allCompleted = updatedStepResults.every(
              (r) => r.status !== 'pending',
            );

            if (allCompleted) {
              return {
                ...run,
                stepResults: updatedStepResults,
                status: 'passed',
                completedAt: new Date().toISOString(),
              } as TestRun;
            }

            return {
              ...run,
              stepResults: updatedStepResults,
            };
          });

          return {
            ...flow,
            runs: updatedRuns,
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [],
  );

  const addRunNote = useCallback(
    (flowId: string, runId: string, note: string) => {
      setFlows((prev) =>
        prev.map((flow) => {
          if (flow.id !== flowId) return flow;

          const updatedRuns = flow.runs.map((run) =>
            run.id === runId ? { ...run, note } : run,
          );

          return {
            ...flow,
            runs: updatedRuns,
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [],
  );

  const deleteRun = useCallback((flowId: string, runId: string) => {
    setFlows((prev) =>
      prev.map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              runs: flow.runs.filter((run) => run.id !== runId),
              updatedAt: new Date().toISOString(),
            }
          : flow,
      ),
    );
  }, []);

  const exportFlowsJson = useCallback(() => {
    const exportData = flows.map((flow) => ({
      id: flow.id,
      title: flow.title,
      steps: flow.steps,
      lastRun: flow.runs.length > 0 ? flow.runs[flow.runs.length - 1] : null,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
    }));

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `testflow-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [flows]);

  const exportFlowsText = useCallback(() => {
    const text = flows
      .map((flow) => {
        const steps = flow.steps
          .map((step, index) => `${index + 1}. ${step.description}`)
          .join('\n');
        return `${flow.title}\n${steps}`;
      })
      .join('\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `testflow-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [flows]);

  return {
    flows,
    isLoaded,
    createFlow,
    updateFlow,
    deleteFlow,
    addStep,
    updateStep,
    deleteStep,
    reorderSteps,
    startRun,
    updateStepResult,
    addRunNote,
    deleteRun,
    exportFlowsJson,
    exportFlowsText,
  };
}
