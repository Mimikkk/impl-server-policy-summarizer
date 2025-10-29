export interface TranslationSample {
  original: string;
  translation: string;
}

export interface Translation {
  translation: string;
}

export interface Verification {
  isValid: boolean;
  issues: string[];
  score: number;
  suggestions: string[];
}

