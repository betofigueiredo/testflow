import { useState, useEffect, useCallback } from 'react';
import type { TestFlow, TestStep } from '@/types/test-flow';

const STORAGE_KEY = 'testflow-data';

function generateId(): string {
  return crypto.randomUUID();
}

function loadFromStorage(): TestFlow[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
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
    (
      flowId: string,
      description: string,
      expectedResult?: string,
    ): TestStep => {
      const newStep: TestStep = {
        id: generateId(),
        description,
        expectedResult,
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
  };
}
