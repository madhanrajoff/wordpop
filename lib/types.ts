export interface Word {
  id: string;
  user_id: string;
  word: string;
  definition: string;
  sentence: string;
  created_at: string;
}

export interface Attempt {
  id: string;
  word_id: string;
  user_id: string;
  correct: boolean;
  created_at: string;
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  subscription: PushSubscriptionJSON;
  interval_minutes: number;
  last_notified_at: string | null;
  updated_at: string;
}

export interface WordWithStats extends Word {
  total_attempts: number;
  correct_attempts: number;
  recall_rate: number;
}
