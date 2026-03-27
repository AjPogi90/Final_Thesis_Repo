import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { analyzePassword, STRENGTH_CONFIG } from '../utils/passwordSchema';

/**
 * PasswordStrengthIndicator
 *
 * Reusable component that displays:
 *  1. An animated, colour-coded strength bar (powered by zxcvbn entropy scoring)
 *  2. A live requirement checklist (regex rules)
 *  3. Optional zxcvbn suggestion text when the password is too weak
 *
 * Props:
 *  - password {string} — current password value (no default)
 */
const PasswordStrengthIndicator = ({ password }) => {
  const { score, ruleResults, feedback } = useMemo(
    () => analyzePassword(password),
    [password]
  );

  if (!password) return null;

  const strength = score >= 0 ? STRENGTH_CONFIG[score] : null;
  const suggestion =
    score < 3 && feedback?.suggestions?.length
      ? feedback.suggestions[0]
      : null;

  return (
    <Box sx={{ mb: 2 }}>
      {/* ── Strength bar ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
        <Box
          role="progressbar"
          aria-valuenow={score >= 0 ? score : 0}
          aria-valuemin={0}
          aria-valuemax={4}
          sx={{
            flex: 1,
            height: 6,
            borderRadius: 99,
            bgcolor: 'rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              borderRadius: 99,
              bgcolor: strength?.color ?? 'transparent',
              width: strength?.width ?? '0%',
              transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1), background-color 0.3s ease',
            }}
          />
        </Box>

        {/* Strength label — aria-live so screen readers announce changes */}
        <Typography
          aria-live="polite"
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: '0.72rem',
            color: strength?.color ?? 'transparent',
            minWidth: 62,
            transition: 'color 0.3s ease',
            userSelect: 'none',
          }}
        >
          {strength?.label ?? ''}
        </Typography>
      </Box>

      {/* ── zxcvbn suggestion ── */}
      {suggestion && (
        <Typography
          variant="caption"
          sx={{ display: 'block', color: '#E65100', fontSize: '0.69rem', mb: 0.75, fontStyle: 'italic' }}
        >
          💡 {suggestion}
        </Typography>
      )}

      {/* ── Requirement checklist ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0.6,
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: 'rgba(0,0,0,0.025)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {ruleResults.map((rule) => (
          <Box key={rule.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            {rule.passed ? (
              <CheckCircleIcon sx={{ fontSize: 13, color: '#2E7D32' }} />
            ) : (
              <RadioButtonUncheckedIcon sx={{ fontSize: 13, color: 'rgba(0,0,0,0.22)' }} />
            )}
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                fontWeight: rule.passed ? 600 : 400,
                color: rule.passed ? '#2E7D32' : 'rgba(0,0,0,0.42)',
                transition: 'color 0.25s ease',
              }}
            >
              {rule.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PasswordStrengthIndicator;
