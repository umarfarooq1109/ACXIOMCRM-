export const APP_CONFIG = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Acxiom CRM",
  tagline: "Customers, pipeline and follow-ups in one place.",
  version: process.env.NEXT_PUBLIC_APP_VERSION || "v1.0.0",
  accountLockoutThreshold: Number(process.env.ACCOUNT_LOCKOUT_THRESHOLD) || 5,
  accountLockoutMinutes: Number(process.env.ACCOUNT_LOCKOUT_MINUTES) || 15,
  sessionMaxAgeSeconds: Number(process.env.SESSION_MAX_AGE_SECONDS) || 28800,
  lockout: {
    maxFailedAttempts: Number(process.env.ACCOUNT_LOCKOUT_THRESHOLD) || 5,
    lockoutDurationMinutes: Number(process.env.ACCOUNT_LOCKOUT_MINUTES) || 15,
  },
  validation: {
    phoneRegex: /^(\+91[\-\s]?)?[6-9]\d{9}$/,
    passwordMinLength: 8,
  },
  pagination: {
    defaultPageSize: Number(process.env.DEFAULT_PAGE_SIZE) || 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
  currency: {
    symbol: "₹",
    locale: "en-IN",
  },
};
