import type { LessonContent } from '@rise/shared'

export const MOCK_LESSON_CONTENT: Record<string, LessonContent> = {
  'solving-linear-equations': {
    hook: "Ever split a restaurant bill and had to figure out what everyone owes? That's a linear equation in disguise — and once you crack the method, every equation becomes simple.",
    blocks: [
      {
        type: 'concept',
        heading: 'What is a Linear Equation?',
        body: 'A linear equation has one unknown (usually x) raised to the power of 1. Your goal is always the same: get x on its own on one side.',
        formula: 'ax + b = c',
      },
      {
        type: 'rule',
        heading: 'The Golden Rule',
        body: 'Whatever you do to one side of the equation, you must do to the other. Think of it as a perfectly balanced set of scales — if you add weight to one side, you add the same to the other.',
      },
      {
        type: 'example',
        heading: 'Worked Example',
        body: 'Solve: 3x + 5 = 20',
        steps: [
          'Subtract 5 from both sides: 3x + 5 − 5 = 20 − 5 → 3x = 15',
          'Divide both sides by 3: 3x ÷ 3 = 15 ÷ 3 → x = 5',
          'Check: 3(5) + 5 = 15 + 5 = 20 ✓',
        ],
        answer: 'x = 5',
      },
    ],
    interactive_type: 'generic_mcq',
    interactive_config: {
      options: [
        { label: 'x = 3', correct: false },
        { label: 'x = 5', correct: true },
        { label: 'x = 7', correct: false },
        { label: 'x = 10', correct: false },
      ],
    },
    try_it: {
      question: 'Solve: 2x + 3 = 11',
      interactive_config: {
        options: [
          { label: 'x = 3', correct: false },
          { label: 'x = 4', correct: true },
          { label: 'x = 5', correct: false },
          { label: 'x = 7', correct: false },
        ],
      },
      answer: 'x = 4',
      worked_solution: [
        'Start with: 2x + 3 = 11',
        'Subtract 3 from both sides: 2x = 8',
        'Divide both sides by 2: x = 4',
        'Check: 2(4) + 3 = 8 + 3 = 11 ✓',
      ],
    },
    summary: [
      'A linear equation has one unknown raised to the power 1',
      'Always do the same operation to both sides',
      'Undo addition/subtraction first, then multiplication/division',
      'Always check your answer by substituting back in',
    ],
  },

  'simplifying-expanding-expressions': {
    hook: "Algebra expressions can look intimidating — but they follow just a few simple rules. Master those rules and any expression can be tamed.",
    blocks: [
      {
        type: 'concept',
        heading: 'Like Terms',
        body: "You can only add or subtract 'like terms' — terms with the same letter and power. Think of it like fruit: 3 apples + 2 apples = 5 apples, but 3 apples + 2 oranges stay separate.",
      },
      {
        type: 'example',
        heading: 'Simplifying',
        body: 'Simplify: 4x + 3y + 2x − y',
        steps: [
          'Group like terms: (4x + 2x) + (3y − y)',
          'Add the x terms: 6x',
          'Add the y terms: 2y',
        ],
        answer: '6x + 2y',
      },
      {
        type: 'rule',
        heading: 'Expanding Brackets',
        body: 'Multiply the term outside the bracket by every term inside. Use the distributive law: a(b + c) = ab + ac',
        formula: 'a(b + c) = ab + ac',
      },
      {
        type: 'example',
        heading: 'Expanding Example',
        body: 'Expand: 3(2x + 5)',
        steps: [
          'Multiply 3 by 2x: 3 × 2x = 6x',
          'Multiply 3 by 5: 3 × 5 = 15',
        ],
        answer: '6x + 15',
      },
    ],
    interactive_type: 'generic_mcq',
    interactive_config: {
      options: [
        { label: '6x + 2y', correct: true },
        { label: '4x + 2y', correct: false },
        { label: '6x + 4y', correct: false },
        { label: '8xy', correct: false },
      ],
    },
    try_it: {
      question: 'Expand and simplify: 2(3x + 4) + 5x',
      interactive_config: {
        options: [
          { label: '11x + 8', correct: true },
          { label: '10x + 8', correct: false },
          { label: '11x + 4', correct: false },
          { label: '6x + 8', correct: false },
        ],
      },
      answer: '11x + 8',
      worked_solution: [
        'Expand the bracket: 2(3x + 4) = 6x + 8',
        'Rewrite: 6x + 8 + 5x',
        'Collect like terms: (6x + 5x) + 8',
        'Answer: 11x + 8',
      ],
    },
    summary: [
      'Only add or subtract like terms (same letter, same power)',
      'To expand brackets, multiply the outside term by each inside term',
      'Always simplify fully by collecting all like terms',
    ],
  },

  'fractions-adding-subtracting': {
    hook: "Fractions trip up more students than almost anything else — but there's one rule that unlocks everything: you can only add or subtract fractions when the denominators match.",
    blocks: [
      {
        type: 'concept',
        heading: 'The Key Rule',
        body: 'To add or subtract fractions, they must have the same denominator (bottom number). If they do, just add or subtract the numerators (top numbers) and keep the denominator.',
        formula: 'a/c + b/c = (a+b)/c',
      },
      {
        type: 'rule',
        heading: 'Finding a Common Denominator',
        body: 'When denominators are different, find the Lowest Common Multiple (LCM) of both denominators. Convert each fraction to an equivalent fraction with that denominator.',
      },
      {
        type: 'example',
        heading: 'Worked Example',
        body: 'Calculate: 1/3 + 1/4',
        steps: [
          'Find LCM of 3 and 4: LCM = 12',
          'Convert 1/3: multiply top and bottom by 4 → 4/12',
          'Convert 1/4: multiply top and bottom by 3 → 3/12',
          'Add: 4/12 + 3/12 = 7/12',
        ],
        answer: '7/12',
      },
      {
        type: 'example',
        heading: 'Subtraction Example',
        body: 'Calculate: 3/4 − 1/6',
        steps: [
          'Find LCM of 4 and 6: LCM = 12',
          'Convert 3/4: multiply top and bottom by 3 → 9/12',
          'Convert 1/6: multiply top and bottom by 2 → 2/12',
          'Subtract: 9/12 − 2/12 = 7/12',
        ],
        answer: '7/12',
      },
    ],
    interactive_type: 'generic_mcq',
    interactive_config: {
      options: [
        { label: '7/12', correct: true },
        { label: '2/7', correct: false },
        { label: '5/12', correct: false },
        { label: '1/2', correct: false },
      ],
    },
    try_it: {
      question: 'Calculate: 2/5 + 1/3',
      interactive_config: {
        options: [
          { label: '3/8', correct: false },
          { label: '11/15', correct: true },
          { label: '3/15', correct: false },
          { label: '7/15', correct: false },
        ],
      },
      answer: '11/15',
      worked_solution: [
        'Find LCM of 5 and 3: LCM = 15',
        'Convert 2/5: multiply top and bottom by 3 → 6/15',
        'Convert 1/3: multiply top and bottom by 5 → 5/15',
        'Add: 6/15 + 5/15 = 11/15',
      ],
    },
    summary: [
      'Fractions must have the same denominator before adding or subtracting',
      'Find the Lowest Common Multiple (LCM) of the denominators',
      'Convert each fraction to an equivalent fraction with the LCM as the denominator',
      'Add or subtract the numerators, keeping the denominator the same',
      'Always simplify your answer if possible',
    ],
  },
}

/**
 * Returns mock content for a lesson slug, or null if not found.
 * Used as a fallback when lessons.content is null in Supabase.
 */
export function getMockContent(slug: string): LessonContent | null {
  return MOCK_LESSON_CONTENT[slug] ?? null
}
