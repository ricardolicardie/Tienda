// Configuration
const CONFIG = {
  // API Configuration
  SUPABASE_URL: "https://your-project.supabase.co",
  SUPABASE_ANON_KEY: "your-anon-key",
  STRIPE_PUBLISHABLE_KEY: "pk_test_your_publishable_key_here",

  // App Configuration
  APP_NAME: "InviteU.Digital",
  VERSION: "1.0.0",

  // Pricing
  PACKAGES: {
    basico: { min: 159, max: 299 },
    intermedio: { min: 299, max: 499 },
    premium: { min: 499, max: 799 },
  },

  // Tax rate
  TAX_RATE: 0.21,

  // Animation settings
  SLIDER_INTERVAL: 4000,
  NOTIFICATION_DURATION: 4000,

  // Validation rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[+]?[\d\s\-$$$$]+$/,
  },
}

// Export for use in other modules
window.CONFIG = CONFIG
