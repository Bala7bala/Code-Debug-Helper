export interface CodeError {
  type: string;
  line: string;
  description: string;
  fix: string;
}

export interface AnalysisResult {
  language: string;
  errors: CodeError[];
  correctSyntax: string;
  explanation: string;
  simplifiedLogic: string;
  formattedCode: string;
  learningTips: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}