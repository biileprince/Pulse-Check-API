import { body, ValidationChain } from 'express-validator';

/**
 * Validation rules for POST /monitors.
 */
export const createMonitorRules: ValidationChain[] = [
  body('id')
    .trim()
    .notEmpty()
    .withMessage('id is required')
    .isString()
    .withMessage('id must be a string')
    .matches(/^\S+$/)
    .withMessage('id must not contain spaces'),

  body('timeout')
    .notEmpty()
    .withMessage('timeout is required')
    .isInt({ min: 1 })
    .withMessage('timeout must be a positive integer (seconds)'),

  body('alert_email')
    .trim()
    .notEmpty()
    .withMessage('alert_email is required')
    .isEmail()
    .withMessage('alert_email must be a valid email address'),
];
