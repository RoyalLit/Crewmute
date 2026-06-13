import { Router } from 'express';
import { usersController } from './users.controller';
import { uploadMiddleware } from './upload.middleware';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth); // All user routes require authentication

router.get('/me', usersController.getCurrentUser);
router.patch('/me', usersController.updateProfile);
router.post('/me/photo', uploadMiddleware.single('photo'), usersController.uploadPhoto);
router.get('/:id', usersController.getPublicProfile);

export default router;
