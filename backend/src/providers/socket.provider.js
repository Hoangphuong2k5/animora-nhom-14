export const emitNotification = (userId, notification) => {
  // Realtime Socket.io provider (Hoàng phụ trách NTF-01)
  if (global.io) {
    global.io.to(`user_${userId}`).emit('notification', notification);
  }
};

export default { emitNotification };
