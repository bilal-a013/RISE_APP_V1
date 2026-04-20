import type {
  AnyLessonContent,
  LearnLessonContent,
  PractiseLessonContent,
  LessonContent,
} from '@rise/shared'

// ─── Linear Equations — Learn ─────────────────────────────────────────────────

const linearEquationsLearn: LearnLessonContent = {
  version: 2,
  type: 'learn',
  intro: {
    topic_name: 'Solving Linear Equations',
    what_you_will_learn:
      'How to isolate an unknown using inverse operations, and how to check your answer by substituting back.',
  },
  why_it_matters: [
    'Linear equations appear in every GCSE Maths paper — typically 3–5 marks.',
    'The same method extends directly to simultaneous equations and rearranging formulae.',
    'Real-world problems — from splitting costs to working out distances — are modelled with linear equations.',
  ],
  explanation: {
    body: 'A linear equation contains one unknown raised to the power of 1. To solve it, use inverse operations to get the unknown on its own. Work in reverse order of operations: undo addition/subtraction first, then multiplication/division.',
    formula: 'ax + b = c  →  x = (c − b) / a',
    key_terms: [
      {
        term: 'Unknown',
        definition: 'The letter (e.g. x) whose value you are trying to find.',
      },
      {
        term: 'Inverse operation',
        definition:
          'The opposite operation — addition undoes subtraction, multiplication undoes division.',
      },
      {
        term: 'Balance',
        definition:
          'Whatever you do to one side of the equation, you must do to the other to keep it equal.',
      },
    ],
  },
  visual: {
    type: 'step_through',
    data: {
      steps: [
        'Start with the equation: 4x − 3 = 13.',
        'Undo the −3 first — add 3 to both sides: 4x = 16.',
        'Undo the ×4 — divide both sides by 4: x = 4.',
        'Check by substituting back: 4(4) − 3 = 13 ✓',
      ],
    },
  },
  worked_example: {
    question: 'Solve: 4x − 3 = 13',
    steps: [
      'Add 3 to both sides: 4x − 3 + 3 = 13 + 3 → 4x = 16',
      'Divide both sides by 4: 4x ÷ 4 = 16 ÷ 4 → x = 4',
      'Check: 4(4) − 3 = 16 − 3 = 13 ✓',
    ],
    answer: 'x = 4',
  },
  summary: [
    'A linear equation has one unknown raised to the power 1.',
    'Use inverse operations — undo addition/subtraction first, then multiplication/division.',
    'Keep the equation balanced: same operation on both sides.',
    'Always check your answer by substituting it back into the original equation.',
    'Negative answers are valid — don\'t assume x must be positive.',
  ],
  scaffolding: {
    simplified_explanation:
      'Think of the equation as a set of weighing scales. Both sides must stay equal. Each step you take must happen on BOTH sides so the scales stay balanced.',
    extra_hints: [
      'Circle or underline the term with x to keep track of what you\'re isolating.',
      'Write out each step on a new line — don\'t try to do two things at once.',
    ],
    extension_note:
      'Try forming your own equation where the answer is a negative fraction, then verify it. This is the level of fluency Edexcel Higher papers expect.',
  },
}

// ─── Linear Equations — Practise ──────────────────────────────────────────────

const linearEquationsPractise: PractiseLessonContent = {
  version: 2,
  type: 'practise',
  orientation:
    'You are practising solving one-step and two-step linear equations. Each question is solved using the same inverse-operations method from the learn lesson.',
  worked_example: {
    question: 'Solve: 3x + 5 = 20',
    steps: [
      'Subtract 5 from both sides: 3x = 15',
      'Divide both sides by 3: x = 5',
      'Check: 3(5) + 5 = 15 + 5 = 20 ✓',
    ],
    answer: 'x = 5',
  },
  questions: [
    {
      question: 'Solve: x + 9 = 15',
      answer: 'x = 6',
      worked_solution: [
        'Subtract 9 from both sides: x + 9 − 9 = 15 − 9',
        'x = 6',
        'Check: 6 + 9 = 15 ✓',
      ],
      interactive_type: 'generic_mcq',
      interactive_config: {
        options: [
          { label: 'x = 5', correct: false },
          { label: 'x = 6', correct: true },
          { label: 'x = 7', correct: false },
          { label: 'x = 24', correct: false },
        ],
      },
      hint: 'What is the inverse of adding 9?',
    },
    {
      question: 'Solve: 3x = 21',
      answer: 'x = 7',
      worked_solution: [
        'Divide both sides by 3: 3x ÷ 3 = 21 ÷ 3',
        'x = 7',
        'Check: 3 × 7 = 21 ✓',
      ],
      interactive_type: 'generic_mcq',
      interactive_config: {
        options: [
          { label: 'x = 6', correct: false },
          { label: 'x = 7', correct: true },
          { label: 'x = 8', correct: false },
          { label: 'x = 63', correct: false },
        ],
      },
      hint: 'What is the inverse of multiplying by 3?',
    },
    {
      question: 'Solve: 5x − 4 = 16',
      answer: 'x = 4',
      worked_solution: [
        'Add 4 to both sides: 5x = 20',
        'Divide both sides by 5: x = 4',
        'Check: 5(4) − 4 = 20 − 4 = 16 ✓',
      ],
      interactive_type: 'generic_mcq',
      interactive_config: {
        options: [
          { label: 'x = 3', correct: false },
          { label: 'x = 4', correct: true },
          { label: 'x = 5', correct: false },
          { label: 'x = 12/5', correct: false },
        ],
      },
      hint: 'Deal with the − 4 before dealing with the 5.',
    },
    {
      question: 'Solve: 4x + 11 = 3',
      answer: 'x = −2',
      worked_solution: [
        'Subtract 11 from both sides: 4x = 3 − 11 = −8',
        'Divide both sides by 4: x = −2',
        'Check: 4(−2) + 11 = −8 + 11 = 3 ✓',
      ],
      interactive_type: 'generic_mcq',
      interactive_config: {
        options: [
          { label: 'x = 2', correct: false },
          { label: 'x = −2', correct: true },
          { label: 'x = −3', correct: false },
          { label: 'x = 3.5', correct: false },
        ],
      },
    },
    {
      question: 'Solve: 3(x + 2) = 18',
      answer: 'x = 4',
      worked_solution: [
        'Divide both sides by 3: x + 2 = 6',
        'Subtract 2 from both sides: x = 4',
        'Check: 3(4 + 2) = 3(6) = 18 ✓',
      ],
      interactive_type: 'generic_mcq',
      interactive_config: {
        options: [
          { label: 'x = 4', correct: true },
          { label: 'x = 5', correct: false },
          { label: 'x = 6', correct: false },
          { label: 'x = 8', correct: false },
        ],
      },
    },
  ],
  common_mistakes: [
    {
      mistake: 'Only applying the inverse operation to one side.',
      why_wrong:
        'The equation is a balance. If you subtract 4 from the left, you must subtract 4 from the right — otherwise the two sides are no longer equal.',
      correction:
        'Write "= ..." after every step and check both sides have been treated equally.',
    },
    {
      mistake: 'Dividing by the coefficient before removing the constant.',
      why_wrong:
        'Dividing 5x − 4 = 16 by 5 first gives x − 4/5 = 16/5 — messy fractions. Undo addition/subtraction first to keep the numbers clean.',
      correction:
        'Always undo addition or subtraction before dividing or multiplying.',
    },
    {
      mistake: 'Assuming x cannot be negative or a fraction.',
      why_wrong:
        'Edexcel papers regularly include solutions like x = −2 or x = 3/4. Stopping at a negative result and saying "I must have made a mistake" costs marks.',
      correction: 'Substitute your answer back in to verify — if it checks, it\'s correct.',
    },
  ],
  summary: [
    'Use inverse operations: undo + / − before × / ÷.',
    'Keep the equation balanced — same step on both sides.',
    'Negative and fractional answers are valid.',
    'Always substitute back to check.',
    'For equations with brackets, dividing both sides by the coefficient first is often the cleanest approach.',
  ],
}

// ─── Expanding Brackets — Learn ───────────────────────────────────────────────

const expandingBracketsLearn: LearnLessonContent = {
  version: 2,
  type: 'learn',
  intro: {
    topic_name: 'Expanding Brackets',
    what_you_will_learn:
      'How to apply the distributive law to remove brackets, and how to simplify by collecting like terms afterwards.',
  },
  why_it_matters: [
    'Expanding brackets is needed to solve equations, factorise, and work with quadratics — all core GCSE topics.',
    'Errors here propagate into every subsequent step of a multi-mark question.',
    'Double bracket expansion (covered in a later lesson) builds directly on this single-bracket skill.',
  ],
  explanation: {
    body: 'To expand a bracket, multiply the term outside by every term inside. This is the distributive law. After expanding, collect any like terms to simplify fully.',
    formula: 'a(b + c) = ab + ac',
    key_terms: [
      {
        term: 'Distributive law',
        definition:
          'The rule that allows you to multiply a bracket term-by-term: a(b + c) = ab + ac.',
      },
      {
        term: 'Like terms',
        definition:
          'Terms with the same letter(s) raised to the same power — only like terms can be added or subtracted.',
      },
      {
        term: 'Coefficient',
        definition: 'The number in front of a letter, e.g. in 3x the coefficient is 3.',
      },
    ],
  },
  visual: {
    type: 'step_through',
    data: {
      steps: [
        'Expression to expand: 5(2x − 3).',
        'Multiply 5 by the first term: 5 × 2x = 10x.',
        'Multiply 5 by the second term — keep the sign: 5 × (−3) = −15.',
        'Combine the two results: 10x − 15.',
      ],
    },
  },
  worked_example: {
    question: 'Expand and simplify: 3(2x + 4) + 2x',
    steps: [
      'Expand the bracket: 3 × 2x = 6x, 3 × 4 = 12 → 6x + 12 + 2x',
      'Collect like terms: (6x + 2x) + 12',
      'Simplify: 8x + 12',
    ],
    answer: '8x + 12',
  },
  summary: [
    'Multiply the outside term by every term inside the bracket.',
    'Pay attention to signs — a negative outside flips every sign inside.',
    'After expanding, collect like terms to simplify fully.',
    'Write each step clearly to avoid sign errors.',
    'Always check by substituting a simple value (e.g. x = 1) into both the original and expanded forms.',
  ],
  scaffolding: {
    simplified_explanation:
      'Think of the bracket as a bag. The number outside has to "reach into" the bag and multiply every single thing inside it — nothing escapes.',
    extra_hints: [
      'Draw arrows from the term outside to each term inside to remind yourself to multiply everything.',
      'Deal with the expansion first, then collect like terms in a second step.',
    ],
    extension_note:
      'Try expanding expressions like −2(3x − 5) where the outside term is negative. Getting this fluent now makes factorising much easier in the next unit.',
  },
}

// ─── Expanding Brackets — Practise ────────────────────────────────────────────

const expandingBracketsPractise: PractiseLessonContent = {
  version: 2,
  type: 'practise',
  orientation:
    'You are practising expanding single brackets and simplifying by collecting like terms. Use the distributive law: multiply the outside term by every term inside.',
  worked_example: {
    question: 'Expand and simplify: 4(3x + 2)',
    steps: [
      'Multiply 4 by 3x: 4 × 3x = 12x',
      'Multiply 4 by 2: 4 × 2 = 8',
      'Result: 12x + 8',
    ],
    answer: '12x + 8',
  },
  questions: [
    {
      question: 'Expand: 3(x + 5)',
      answer: '3x + 15',
      worked_solution: [
        'Multiply 3 by x: 3x',
        'Multiply 3 by 5: 15',
        'Result: 3x + 15',
      ],
      interactive_type: 'generic_mcq',
      interactive_config: {
        options: [
          { label: '3x + 5', correct: false },
          { label: '3x + 15', correct: true },
          { label: 'x + 15', correct: false },
          { label: '3x + 8', correct: false },
        ],
      },
      hint: 'Multiply 3 by every term inside the bracket.',
    },
    {
      question: 'Expand: 5(2x − 4)',
      answer: '10x − 20',
      worked_solution: [
        'Multiply 5 by 2x: 10x',
        'Multiply 5 by −4: −20',
        'Result: 10x − 20',
      ],
      interactive_type: 'generic_mcq',
      interactive_config: {
        options: [
          { label: '10x − 4', correct: false },
          { label: '10x + 20', correct: false },
          { label: '10x − 20', correct: true },
          { label: '7x − 4', correct: false },
        ],
      },
      hint: 'Remember to apply the sign: 5 × (−4) = −20.',
    },
    {
      question: 'Expand and simplify: 2(3x + 1) + 4x',
      answer: '10x + 2',
      worked_solution: [
        'Expand: 2(3x + 1) = 6x + 2',
        'Rewrite: 6x + 2 + 4x',
        'Collect like terms: (6x + 4x) + 2 = 10x + 2',
      ],
      interactive_type: 'generic_mcq',
      interactive_config: {
        options: [
          { label: '10x + 2', correct: true },
          { label: '10x + 4', correct: false },
          { label: '6x + 2', correct: false },
          { label: '9x + 2', correct: false },
        ],
      },
      hint: 'Expand the bracket first, then collect x terms at the end.',
    },
    {
      question: 'Expand and simplify: 3(x − 2) + 2(x + 5)',
      answer: '5x + 4',
      worked_solution: [
        'Expand first bracket: 3(x − 2) = 3x − 6',
        'Expand second bracket: 2(x + 5) = 2x + 10',
        'Combine: 3x − 6 + 2x + 10',
        'Collect like terms: (3x + 2x) + (−6 + 10) = 5x + 4',
      ],
      interactive_type: 'generic_mcq',
      interactive_config: {
        options: [
          { label: '5x + 4', correct: true },
          { label: '5x − 4', correct: false },
          { label: '5x + 16', correct: false },
          { label: '6x + 4', correct: false },
        ],
      },
    },
    {
      question: 'Expand and simplify: 4(2x − 3) − 3(x − 2)',
      answer: '5x − 6',
      worked_solution: [
        'Expand first bracket: 4(2x − 3) = 8x − 12',
        'Expand second bracket: −3(x − 2) = −3x + 6',
        'Combine: 8x − 12 − 3x + 6',
        'Collect like terms: (8x − 3x) + (−12 + 6) = 5x − 6',
      ],
      interactive_type: 'generic_mcq',
      interactive_config: {
        options: [
          { label: '5x − 6', correct: true },
          { label: '5x − 18', correct: false },
          { label: '11x − 6', correct: false },
          { label: '5x + 6', correct: false },
        ],
      },
    },
  ],
  common_mistakes: [
    {
      mistake: 'Only multiplying the first term inside the bracket.',
      why_wrong:
        'The distributive law requires every term inside to be multiplied. Writing 3(x + 5) = 3x + 5 misses the second multiplication entirely.',
      correction:
        'Physically draw arrows from the outside term to each term inside until the habit is automatic.',
    },
    {
      mistake: 'Losing the negative sign when the outside term is negative.',
      why_wrong:
        '−3(x − 2) requires −3 × (−2) = +6, not −6. Sign errors here are one of the most common sources of dropped marks.',
      correction:
        'Write out −3 × x and −3 × (−2) as separate multiplications, then combine.',
    },
    {
      mistake: 'Collecting like terms before finishing the expansion.',
      why_wrong:
        'If you add before fully expanding, you risk combining terms that aren\'t actually like terms yet.',
      correction:
        'Expand all brackets completely, rewrite on a single line, then collect like terms in one clean step.',
    },
  ],
  summary: [
    'Multiply the outside term by every term inside the bracket.',
    'Negative outside × negative inside = positive.',
    'Expand all brackets first, then collect like terms.',
    'Two expressions are equivalent if they give the same value for any number substituted for x.',
    'Check your expansion by substituting x = 1 into both the original and expanded forms.',
  ],
}

// ─── Legacy Fractions Content (v1 — backward compatibility) ───────────────────

const legacyFractions: LessonContent = {
  hook: "Fractions trip up more students than almost anything else — but there's one rule that unlocks everything: you can only add or subtract fractions when the denominators match.",
  blocks: [
    {
      type: 'concept',
      heading: 'The Key Rule',
      body: 'To add or subtract fractions, they must have the same denominator. If they do, just add or subtract the numerators and keep the denominator.',
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
}

// ─── Registry ─────────────────────────────────────────────────────────────────

const MOCK_CONTENT: Record<string, AnyLessonContent> = {
  // Linear equations pair
  'solving-linear-equations': linearEquationsLearn,
  'solving-linear-equations-learn': linearEquationsLearn,
  'linear-equations-learn': linearEquationsLearn,
  'solving-linear-equations-practise': linearEquationsPractise,
  'linear-equations-practise': linearEquationsPractise,

  // Expanding brackets pair
  'simplifying-expanding-expressions': expandingBracketsLearn,
  'expanding-brackets-learn': expandingBracketsLearn,
  'expanding-single-brackets': expandingBracketsLearn,
  'expanding-brackets-practise': expandingBracketsPractise,

  // Legacy fractions (v1 — backward compat)
  'fractions-adding-subtracting': legacyFractions,
}

/**
 * Returns mock content for a lesson slug, or null if not found.
 * Used as a fallback when lessons.content is null in Supabase.
 */
export function getMockContent(slug: string): AnyLessonContent | null {
  return MOCK_CONTENT[slug] ?? null
}
