export interface TestStep {
  id: string
  description: string
  expectedResult?: string
}

export interface TestFlow {
  id: string
  title: string
  steps: TestStep[]
  createdAt: string
  updatedAt: string
}
