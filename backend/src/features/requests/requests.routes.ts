import { Router } from 'express';
import { requestsController } from './requests.controller';
import { createRequestValidator } from './requests.validators';
import validate from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth); // All request endpoints require authentication

router.post('/', createRequestValidator, validate, requestsController.createRequest);
router.get('/my-requests', requestsController.getMyRequests);
router.get('/incoming', requestsController.getIncomingRequests);
router.post('/:id/accept', requestsController.acceptRequest);
router.post('/:id/reject', requestsController.rejectRequest);
router.post('/:id/withdraw', requestsController.withdrawRequest);

export default router;
