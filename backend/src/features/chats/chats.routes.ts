import { Router } from 'express';
import { chatsController } from './chats.controller';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../shared/asyncHandler';

const router = Router();

// Protect all chat routes
router.use(requireAuth);

router.get('/', asyncHandler(chatsController.getMyChats.bind(chatsController)));
router.get('/:rideId/:otherUserId', asyncHandler(chatsController.getChatHistory.bind(chatsController)));

export default router;
