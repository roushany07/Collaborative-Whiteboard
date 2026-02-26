import Room from '../models/Room.js';
import Message from '../models/Message.js';

const activeUsers = new Map();

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', async ({ roomId, userId, userName }) => {
      try {
        socket.join(roomId);
        
        if (!activeUsers.has(roomId)) {
          activeUsers.set(roomId, new Map());
        }
        
        activeUsers.get(roomId).set(socket.id, { userId, userName, socketId: socket.id });

        const users = Array.from(activeUsers.get(roomId).values());
        io.to(roomId).emit('user-joined', { userId, userName, users });

        const room = await Room.findOne({ roomId });
        if (room && room.canvasData) {
          socket.emit('load-canvas', room.canvasData);
        }

        const messages = await Message.find({ room: room._id })
          .populate('user', 'name avatar')
          .sort({ createdAt: 1 })
          .limit(50);
        
        socket.emit('load-messages', messages);
      } catch (error) {
        console.error('Error joining room:', error);
      }
    });

    socket.on('draw', ({ roomId, drawData }) => {
      socket.to(roomId).emit('draw', drawData);
    });

    socket.on('clear-canvas', ({ roomId }) => {
      io.to(roomId).emit('clear-canvas');
    });

    socket.on('undo', ({ roomId }) => {
      socket.to(roomId).emit('undo');
    });

    socket.on('redo', ({ roomId }) => {
      socket.to(roomId).emit('redo');
    });

    socket.on('chat-message', async ({ roomId, userId, userName, message }) => {
      try {
        console.log('Chat message received:', { roomId, userId, userName, message });
        const room = await Room.findOne({ roomId });
        
        if (!room) {
          console.error('Room not found for chat:', roomId);
          return;
        }

        const newMessage = await Message.create({
          room: room._id,
          user: userId,
          userName,
          message,
          type: 'text'
        });

        await newMessage.populate('user', 'name avatar');
        console.log('Message saved and emitting:', newMessage);

        io.to(roomId).emit('chat-message', newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('cursor-move', ({ roomId, x, y, userName }) => {
      socket.to(roomId).emit('cursor-move', { x, y, userName, socketId: socket.id });
    });

    socket.on('screen-share-start', ({ roomId }) => {
      io.to(roomId).emit('screen-share-started', { socketId: socket.id });
    });

    socket.on('screen-share-stop', ({ roomId }) => {
      io.to(roomId).emit('screen-share-stopped', { socketId: socket.id });
    });

    socket.on('file-share', async ({ roomId, userId, userName, fileName, fileData, fileType }) => {
      io.to(roomId).emit('file-received', {
        userId,
        userName,
        fileName,
        fileData,
        fileType,
        timestamp: new Date()
      });
    });

    socket.on('add-text', ({ roomId, textData }) => {
      socket.to(roomId).emit('add-text', textData);
    });

    socket.on('call-user', ({ roomId, callerId, callerName }) => {
      socket.to(roomId).emit('incoming-call', { callerId, callerName, socketId: socket.id });
    });

    socket.on('call-accepted', ({ roomId, callerId }) => {
      io.to(roomId).emit('call-accepted', { accepterId: socket.id });
    });

    socket.on('call-declined', ({ roomId, callerId }) => {
      socket.to(roomId).emit('call-declined');
    });

    socket.on('video-offer', ({ roomId, offer, userId }) => {
      socket.to(roomId).emit('video-offer', { offer, userId });
    });

    socket.on('video-answer', ({ roomId, answer }) => {
      socket.to(roomId).emit('video-answer', { answer });
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('ice-candidate', { candidate });
    });

    socket.on('call-ended', ({ roomId }) => {
      io.to(roomId).emit('call-ended');
    });

    socket.on('leave-room', ({ roomId, userId, userName }) => {
      socket.leave(roomId);
      
      if (activeUsers.has(roomId)) {
        activeUsers.get(roomId).delete(socket.id);
        const users = Array.from(activeUsers.get(roomId).values());
        io.to(roomId).emit('user-left', { userId, userName, users });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      activeUsers.forEach((roomUsers, roomId) => {
        if (roomUsers.has(socket.id)) {
          const user = roomUsers.get(socket.id);
          roomUsers.delete(socket.id);
          const users = Array.from(roomUsers.values());
          io.to(roomId).emit('user-left', { 
            userId: user.userId, 
            userName: user.userName, 
            users 
          });
        }
      });
    });
  });
};
