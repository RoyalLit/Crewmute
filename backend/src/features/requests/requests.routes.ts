import { Router } from 'express';
import { requestsController } from './requests.controller';
import { createRequestValidator } from './requests.validators';
import validate from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../shared/asyncHandler';

const router = Router();

router.use(requireAuth); // All request endpoints require authentication

router.post('/', createRequestValidator, validate, asyncHandler(requestsController.createRequest.bind(requestsController)));
router.get('/my-requests', asyncHandler(requestsController.getMyRequests.bind(requestsController)));
router.get('/incoming', asyncHandler(requestsController.getIncomingRequests.bind(requestsController)));
router.post('/:id/accept', asyncHandler(requestsController.acceptRequest.bind(requestsController)));
router.post('/:id/reject', asyncHandler(requestsController.rejectRequest.bind(requestsController)));
router.post('/:id/withdraw', asyncHandler(requestsController.withdrawRequest.bind(requestsController)));
router.post('/:id/remove-passenger', asyncHandler(requestsController.removePassenger.bind(requestsController)));

export { router as requestsRoutes };
