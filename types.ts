
export enum QuestionType {
  SINGLE_CHOICE = '单选题',
  MULTIPLE_CHOICE = '多选题',
  TRUE_FALSE = '判断题'
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[]; // For choice questions
  answer: string | string[]; // Correct answer(s)
  explanation: string; // Safety analysis/explanation
  hazardFocus: string; // What specific hazard does this address?
}

export interface GenerationConfig {
  count: number;
  types: QuestionType[];
  difficulty: '基础' | '进阶' | '专家';
}

export interface UploadedMedia {
  id: string;
  url: string; // Base64 or Object URL for display
  base64Data: string; // Clean base64 for API
  mimeType: string;
  type: 'image' | 'video';
}

export type AppState = 'upload' | 'config' | 'generating' | 'review';
