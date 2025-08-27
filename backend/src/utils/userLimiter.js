import rateLimit from "express-rate-limit";

const userLimiter = rateLimit({
  // windowMs is 5 minutes.
  windowMs: 5 * 60 * 1000,

  // max allows only 3 requests per IP per 5 minutes.
  max: 3,

  // Custom message for this specific rate limit.
  message: 'Too many user account action requests from this IP. Please wait a few minutes and try again.',

  // Standard and legacy headers are also configured here.
  standardHeaders: true,
  legacyHeaders: false,
});

export default userLimiter;