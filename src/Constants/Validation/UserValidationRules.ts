export const USER_VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 30
  },
  EMAIL: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 256
  },
} as const;