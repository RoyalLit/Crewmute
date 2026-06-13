import { body, query } from 'express-validator';

export const createRideValidator = [
  body('fromCity').isString().trim().notEmpty().withMessage('fromCity is required'),
  body('toCity').isString().trim().notEmpty().withMessage('toCity is required'),
  body('departureDate').isISO8601().withMessage('departureDate must be a valid ISO8601 date'),
  body('departureTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('departureTime must be HH:mm format'),
  body('totalSeats').isInt({ min: 1, max: 7 }).withMessage('totalSeats must be between 1 and 7'),
  body('farePerSeat').isInt({ min: 0 }).withMessage('farePerSeat must be a non-negative number'),
  body('cabType')
    .isIn(['Uber Go', 'Uber XL', 'Ola Mini', 'Ola Prime Sedan', 'Other'])
    .withMessage('cabType must be a valid option'),
];

export const updateRideValidator = [
  body('departureDate').optional().isISO8601().withMessage('departureDate must be a valid ISO8601 date'),
  body('departureTime').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('departureTime must be HH:mm format'),
  body('totalSeats').optional().isInt({ min: 1, max: 7 }).withMessage('totalSeats must be between 1 and 7'),
  body('farePerSeat').optional().isInt({ min: 0 }).withMessage('farePerSeat must be a non-negative number'),
  body('cabType')
    .optional()
    .isIn(['Uber Go', 'Uber XL', 'Ola Mini', 'Ola Prime Sedan', 'Other'])
    .withMessage('cabType must be a valid option'),
];

export const rideFilterValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('pageSize').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('fromCity').optional().isString().trim(),
  query('toCity').optional().isString().trim(),
  query('date').optional().isISO8601(),
];
