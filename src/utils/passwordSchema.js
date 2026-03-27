import { z } from 'zod';
import zxcvbn from 'zxcvbn';

/**
 * Password rules — single source of truth used by both
 * the Zod schema (server-side guard) and the UI checklist.
 */
export const PASSWORD_RULES = [
  { id: 'length',    label: 'At least 8 characters',        test: (p) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter (A–Z)',    test: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter (a–z)',    test: (p) => /[a-z]/.test(p) },
  { id: 'number',    label: 'One number (0–9)',              test: (p) => /[0-9]/.test(p) },
  { id: 'special',   label: 'One special character (!@#…)',  test: (p) => /[^A-Za-z0-9]/.test(p) },
];

/**
 * Maps a zxcvbn score (0–4) to a label + colour.
 * Score 4 = "Strong" — the only level we accept for registration.
 */
export const STRENGTH_CONFIG = [
  { label: 'Very Weak', color: '#e53935', width: '15%'  },
  { label: 'Weak',      color: '#f44336', width: '32%'  },
  { label: 'Fair',      color: '#FF9800', width: '55%'  },
  { label: 'Good',      color: '#66BB6A', width: '75%'  },
  { label: 'Strong',    color: '#2E7D32', width: '100%' },
];

/**
 * Returns an enriched zxcvbn result with all custom rule results attached.
 * `score` is the zxcvbn entropy score (0–4).
 * `allRulesPassed` guards against dictionary-word passwords that technically
 * satisfy the regex rules but score low entropy (e.g. "Password1!").
 */
export const analyzePassword = (password) => {
  if (!password) return { score: -1, allRulesPassed: false, ruleResults: [] };

  const zResult = zxcvbn(password);
  const ruleResults = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));
  const allRulesPassed = ruleResults.every((r) => r.passed);

  return {
    score: zResult.score,          // 0–4 (zxcvbn entropy)
    allRulesPassed,
    ruleResults,
    feedback: zResult.feedback,    // { warning, suggestions }
  };
};

/**
 * Zod schema for Step 2 account-details form.
 * Apply with useForm({ resolver: zodResolver(accountSchema) }).
 */
export const accountSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(80, 'Name is too long'),
    email: z
      .string()
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine((p) => /[A-Z]/.test(p), 'Must contain an uppercase letter')
      .refine((p) => /[a-z]/.test(p), 'Must contain a lowercase letter')
      .refine((p) => /[0-9]/.test(p), 'Must contain a number')
      .refine((p) => /[^A-Za-z0-9]/.test(p), 'Must contain a special character')
      .refine((p) => zxcvbn(p).score >= 3, 'Password is too easy to guess — try a longer phrase'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });
