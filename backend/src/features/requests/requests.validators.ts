import { body } from 'express-validator';

export const createRequestValidator = [
  body('rideId').isMongoId().withMessage('Invalid ride ID format'),
];
