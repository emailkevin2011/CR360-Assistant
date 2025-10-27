
export enum ConversationRole {
  USER = 'user',
  MODEL = 'atlys',
}

export interface ConversationEntry {
  role: ConversationRole;
  text: string;
}

export enum Status {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  THINKING = 'THINKING',
  SPEAKING = 'SPEAKING',
  ERROR = 'ERROR',
}

export interface FunctionCallLog {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: string;
}