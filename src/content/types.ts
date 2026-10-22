export type Mode = "quiz" | "builder";

export type TopicToken = { token: string; meaning: string; example?: string };

export type Topic = {
  id: string;
  title: string;
  summary: string;
  tokens: TopicToken[];
};

type QuizBase = {
  id: string;
  topic: string;
  /** 1–2 sentences shown after answering. Backticks render as code. */
  explanation: string;
};

export type QuizQuestion = QuizBase &
  (
    | {
        /** A free-form question about a token or concept. */
        kind: "concept";
        prompt: string;
        options: string[];
        answer: number;
      }
    | {
        /** "Which string contains a match for /pattern/?" — validated with RegExp.test. */
        kind: "which-string";
        pattern: string;
        flags?: string;
        options: string[];
        answer: number;
      }
    | {
        /** "Which regex does X?" — options are patterns, validated against the examples. */
        kind: "which-regex";
        prompt: string;
        options: string[];
        answer: number;
        examples: { match: string[]; avoid: string[] };
      }
  );

export type BuilderChallenge = {
  id: string;
  level: 1 | 2 | 3;
  title: string;
  brief: string;
  match: string[];
  avoid: string[];
  hint?: string;
  solution: string;
  solutionFlags?: string;
  concepts: string[];
};

export type MenuItem = { id: string; title: string; group: string };
