#!/usr/bin/env node

/**
 * Test script để kiểm tra Redis Pub/Sub hoạt động
 * Chạy script này để test cross-instance communication
 */

const io = require('socket.io-client');

// Test với 2 backend instances
const instance1 = io('http://localhost:3000/api/v1/chat', {
  auth: {
    userId: 'user-1',
    username: 'TestUser1'
  }
});

const instance2 = io('http://localhost:3010/api/v1/chat', {
  auth: {
    userId: 'user-2', 
    username: 'TestUser2'
  }
});

const matchId = 'test-match-123';


// Instance 1 events
instance1.on('connect', () => {
  // Join room
  instance1.emit('join_room', {
    matchId,
    username: 'TestUser1'
  });
});

instance1.on('chat_event', (data) => {
  // Handle chat event
});

// Instance 2 events  
instance2.on('connect', () => {
  // Join room
  instance2.emit('join_room', {
    matchId,
    username: 'TestUser2'
  });
});

instance2.on('chat_event', (data) => {
  // Handle chat event
});

// Test sending messages
setTimeout(() => {
  instance1.emit('send_message', {
    matchId,
    message: 'Hello from Instance 1!',
    username: 'TestUser1'
  });
}, 2000);

setTimeout(() => {
  instance2.emit('send_message', {
    matchId,
    message: 'Hello from Instance 2!',
    username: 'TestUser2'
  });
}, 4000);

setTimeout(() => {
  instance1.disconnect();
  instance2.disconnect();
  process.exit(0);
}, 6000);

// Error handling
instance1.on('connect_error', (error) => {
  // Handle connection error
});

instance2.on('connect_error', (error) => {
  // Handle connection error
});
