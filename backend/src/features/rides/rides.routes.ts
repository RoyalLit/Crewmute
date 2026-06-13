import { Router } from 'express';
import { ridesController } from './rides.controller';
import { createRideValidator, updateRideValidator, rideFilterValidator } from './rides.validators';
import validate from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth); // All ride endpoints require authentication

router.post('/', createRideValidator, validate, ridesController.createRide);
router.get('/', rideFilterValidator, validate, ridesController.browseRides);
router.get('/me', ridesController.getMyRides);
router.get('/:id', ridesController.getRideDetails);
router.patch('/:id', updateRideValidator, validate, ridesController.updateRide);
router.delete('/:id', ridesController.cancelRide);

export default router;
