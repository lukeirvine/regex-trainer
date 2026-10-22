import type { Topic } from "./types";

export const topics: Topic[] = [
  {
    id: "literals",
    title: "Literals & escaping",
    summary: "Most characters match themselves. Metacharacters need a backslash to be literal.",
    tokens: [
      { token: "abc", meaning: "The literal text abc" },
      { token: String.raw`\.`, meaning: "A literal period (escape any metacharacter with \\)" },
      { token: String.raw`\\`, meaning: "A literal backslash" },
      { token: String.raw`. ^ $ * + ? ( ) [ ] { } | \ /`, meaning: "Metacharacters — escape these to match them literally" },
    ],
  },
  {
    id: "anchors",
    title: "Dot & anchors",
    summary: "The dot is a single-character wildcard. Anchors match positions, not characters.",
    tokens: [
      { token: ".", meaning: "Any single character except a newline", example: "c.t → cat, cot, c9t" },
      { token: "^", meaning: "Start of string (start of line with the m flag)", example: "^Hello" },
      { token: "$", meaning: "End of string (end of line with the m flag)", example: "world$" },
    ],
  },
  {
    id: "classes",
    title: "Character classes",
    summary: "Square brackets match exactly one character from a set.",
    tokens: [
      { token: "[abc]", meaning: "One of a, b or c", example: "gr[ae]y → gray, grey" },
      { token: "[a-z]", meaning: "One character in the range a–z" },
      { token: "[^abc]", meaning: "One character that is NOT a, b or c" },
      { token: "[a-z0-9_-]", meaning: "Combine ranges; put a literal - first or last" },
    ],
  },
  {
    id: "shorthands",
    title: "Shorthand classes",
    summary: "Short escapes for the character sets you use constantly.",
    tokens: [
      { token: String.raw`\d`, meaning: "A digit 0–9" },
      { token: String.raw`\w`, meaning: "A word character: letter, digit or underscore" },
      { token: String.raw`\s`, meaning: "Whitespace: space, tab, newline…" },
      { token: String.raw`\D \W \S`, meaning: "Uppercase = the opposite (non-digit, non-word, non-space)" },
      { token: String.raw`\b`, meaning: "Word boundary — a position between \\w and \\W", example: String.raw`\bcat\b` },
    ],
  },
  {
    id: "quantifiers",
    title: "Quantifiers",
    summary: "Say how many times the previous item repeats. Greedy by default.",
    tokens: [
      { token: "*", meaning: "Zero or more", example: "ab*c → ac, abc, abbbc" },
      { token: "+", meaning: "One or more", example: "ab+c → abc, abbbc" },
      { token: "?", meaning: "Optional — zero or one", example: "colou?r" },
      { token: "{n}", meaning: "Exactly n", example: String.raw`\d{4}` },
      { token: "{n,m}", meaning: "Between n and m (omit m for 'n or more')", example: String.raw`\d{2,4}` },
      { token: "*? +? ??", meaning: "Lazy — match as few as possible", example: "<.+?>" },
    ],
  },
  {
    id: "groups",
    title: "Groups & alternation",
    summary: "Parentheses group and capture. The pipe chooses between alternatives.",
    tokens: [
      { token: "a|b", meaning: "Either a or b (lowest precedence — spans the whole group)" },
      { token: "(abc)", meaning: "Group and capture", example: "(ha)+" },
      { token: "(?:abc)", meaning: "Group without capturing" },
    ],
  },
  {
    id: "backrefs",
    title: "Backreferences & named groups",
    summary: "Refer back to what a group captured — inside the regex or in a replacement.",
    tokens: [
      { token: String.raw`\1`, meaning: "Whatever group 1 matched", example: String.raw`(\w+) \1 → "the the"` },
      { token: String.raw`(?<name>…)`, meaning: "A named capture group" },
      { token: String.raw`\k<name>`, meaning: "Backreference to a named group" },
      { token: "$1 / $<name>", meaning: "Insert a group in a replacement string" },
    ],
  },
  {
    id: "lookaround",
    title: "Lookahead",
    summary: "Assert what comes next without consuming it.",
    tokens: [
      { token: "(?=…)", meaning: "Followed by …", example: String.raw`\d+(?=px)` },
      { token: "(?!…)", meaning: "NOT followed by …", example: "foo(?!bar)" },
      { token: "(?<=…) (?<!…)", meaning: "Lookbehind — preceded / not preceded by …" },
    ],
  },
  {
    id: "flags",
    title: "Flags",
    summary: "Modifiers written after the closing slash: /pattern/gi",
    tokens: [
      { token: "g", meaning: "Global — find every match, not just the first" },
      { token: "i", meaning: "Case-insensitive" },
      { token: "m", meaning: "Multiline — ^ and $ match at each line" },
      { token: "s", meaning: "Dot-all — . also matches newlines" },
    ],
  },
];

export const topicById = Object.fromEntries(topics.map((t) => [t.id, t]));
