import rateLimit from "express-rate-limit";

/**
 * @desc    Create action rate limiter - This limiter is specifically for create actions, which are often more sensitive to abuse. it's more strict than the general limiter.
 */

const createLimiter = rateLimit({
  // windowMs for this limiter is 1 minute.
  windowMs: 60 * 1000,

  // max allows only 5 create requests per IP per minute.
  max: 5,

  // Custom message for this specific rate limit.
  message:
    "Too many create requests from this IP. Please wait a minute and try again.",

  // Standard and legacy headers are also configured here.
  standardHeaders: true,
  legacyHeaders: false,
});

export default createLimiter;
