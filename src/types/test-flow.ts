export interface TestStep {
  id: string;
  description: string;
}

export type StepResultStatus = 'pending' | 'passed' | 'failed';

export interface TestStepResult {
  stepId: string;
  status: StepResultStatus;
}

export type RunStatus = 'in_progress' | 'passed' | 'failed';

export interface TestRun {
  id: string;
  flowId: string;
  status: RunStatus;
  stepResults: TestStepResult[];
  note?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TestFlow {
  id: string;
  title: string;
  steps: TestStep[];
  runs: TestRun[];
  createdAt: string;
  updatedAt: string;
}
