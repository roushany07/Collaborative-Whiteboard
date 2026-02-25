import express from 'express';
import { createRoom, joinRoom, getRoom, getUserRooms, saveCanvas } from '../controllers/roomController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/create', createRoom);
router.get('/my-rooms', getUserRooms);
router.get('/:roomId', getRoom);
router.post('/:roomId/join', joinRoom);
router.post('/:roomId/save', saveCanvas);

export default router;
