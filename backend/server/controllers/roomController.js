import Room from '../models/Room.js';
import crypto from 'crypto';

export const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    const roomId = crypto.randomBytes(5).toString('hex');

    const room = await Room.create({
      roomId,
      name,
      host: req.user._id,
      participants: [req.user._id]
    });

    await room.populate('host', 'name email avatar');

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log('Join room request:', roomId, 'User:', req.user._id);

    const room = await Room.findOne({ roomId: roomId.trim() })
      .populate('host', 'name email avatar')
      .populate('participants', 'name email avatar');

    console.log('Room found:', room ? 'Yes' : 'No');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.participants.some(p => p._id.toString() === req.user._id.toString())) {
      room.participants.push(req.user._id);
      await room.save();
      await room.populate('participants', 'name email avatar');
    }

    res.json(room);
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId })
      .populate('host', 'name email avatar')
      .populate('participants', 'name email avatar');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [
        { host: req.user._id },
        { participants: req.user._id }
      ]
    })
      .populate('host', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveCanvas = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { canvasData } = req.body;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.canvasData = canvasData;
    await room.save();

    res.json({ message: 'Canvas saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
