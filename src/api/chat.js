class ChatSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 5000; // Cap the maximum delay at 5 seconds
  }

  // Initialize socket connection
  connect(userId, loadId) {
    if (this.socket && this.isConnected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Create native WebSocket connection with user and load IDs
        const wsUrl = `wss://nnt.nntexpressinc.com/ws/chat/${userId}/${loadId}/`;
        this.socket = new WebSocket(wsUrl);

        // Connection event handlers
        this.socket.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onerror = (error) => {
          this.isConnected = false;
          reject(new Error('WebSocket not available - using REST API fallback'));
        };

        this.socket.onclose = (event) => {
          this.isConnected = false;
          
          // Don't attempt to reconnect if server doesn't support WebSocket
          if (event.code === 1006) {
            return;
          }
          
          // Attempt to reconnect if not manually closed and not a server issue
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            // Calculate delay with exponential backoff, but cap it
            const delay = Math.min(
              this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
              this.maxReconnectDelay
            );
            setTimeout(() => {
              this.connect(userId, loadId);
            }, delay);
          }
        };

        this.socket.onmessage = (event) => {
          try {
            let data;
            try {
              data = JSON.parse(event.data);
            } catch (parseError) {
              data = event.data;
            }
            this.handleMessage(data);
          } catch (error) {
            // Silent error handling
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  // Message handlers
  messageHandlers = {
    new_message: null,
    message_updated: null,
    message_deleted: null,
    user_typing: null,
    user_stopped_typing: null,
    connection_established: null
  };

  // Handle incoming messages
  handleMessage(data) {
    try {

      // Parse data if it's a string
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      
      // Get message type
      const messageType = parsedData.type;

      // Different handling based on message type
      let formattedPayload;
      
      if (messageType === 'connection_established') {
        // Handle connection established message
        formattedPayload = {
          type: messageType,
          message: parsedData.message,
          user: parsedData.user_id,
          load_id: parsedData.load_id
        };
      } else if (typeof parsedData.message === 'object') {
        // Handle chat messages (with nested message object)
        const messageData = parsedData.message;
        formattedPayload = {
          id: messageData.id,
          type: messageData.type,
          message: messageData.message,
          user: messageData.user_id,
          user_email: messageData.user_email,
          file_url: messageData.file_url,
          file_name: messageData.file_name,
          created_at: messageData.created_at,
          group_message_id: messageData.group_message_id
        };
      } else {
        // Handle simple message format
        formattedPayload = {
          type: messageType,
          message: parsedData.message,
          ...parsedData
        };
      }

      // Call the appropriate message handler
      if (this.messageHandlers[messageType] && typeof this.messageHandlers[messageType] === 'function') {
        this.messageHandlers[messageType](formattedPayload);
      }
    } catch (error) {
      // Silent error handling
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.close(1000);
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join chat room
  joinRoom(userId, loadId) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: 'join_room',
        payload: { userId, loadId }
      }));
    }
  }

  // Leave chat room
  leaveRoom(userId, loadId) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: 'leave_room',
        payload: { userId, loadId }
      }));
    }
  }

  // Send message
  sendMessage(messageData) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.send(JSON.stringify({
        message: messageData.message
      }));
      
      // For WebSocket, we assume success if message is sent
      resolve(messageData);
    });
  }

  // Send text message
  sendTextMessage(message, loadId, userId) {
    return this.sendMessage({
      type: 'text',
      message,
      load_id: loadId,
      user: userId,
      timestamp: new Date().toISOString()
    });
  }

  // Send file message
  sendFileMessage(file, message, loadId, userId) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('message', message || '');
      formData.append('load_id', loadId);
      formData.append('user', userId);

      // Use fetch for file upload
      const token = localStorage.getItem('accessToken');
      fetch('https://nnt.nntexpressinc.com/api/chat/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.id) {
          // Send WebSocket message to notify other users
          this.socket.send(JSON.stringify({
            type: 'file_message_sent',
            payload: {
              messageId: data.id,
              loadId,
              userId
            }
          }));
          resolve(data);
        } else {
          reject(new Error('Failed to upload file'));
        }
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  // Listen for new messages
  onMessageReceived(callback) {
    this.messageHandlers.new_message = callback;
  }

  // Listen for message updates
  onMessageUpdated(callback) {
    this.messageHandlers.message_updated = callback;
  }

  // Listen for message deletions
  onMessageDeleted(callback) {
    this.messageHandlers.message_deleted = callback;
  }

  // Listen for user typing
  onUserTyping(callback) {
    this.messageHandlers.user_typing = callback;
  }

  // Listen for user stopped typing
  onUserStoppedTyping(callback) {
    this.messageHandlers.user_stopped_typing = callback;
  }

  // Emit typing event
  emitTyping(userId, loadId) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: 'typing',
        payload: { userId, loadId }
      }));
    }
  }

  // Emit stopped typing event
  emitStoppedTyping(userId, loadId) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({
        type: 'stopped_typing',
        payload: { userId, loadId }
      }));
    }
  }

  // Update message
  updateMessage(messageId, messageData) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.send(JSON.stringify({
        type: 'update_message',
        payload: { messageId, ...messageData }
      }));
      
      // For WebSocket, we assume success if message is sent
      resolve(messageData);
    });
  }

  // Delete message
  deleteMessage(messageId) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.send(JSON.stringify({
        type: 'delete_message',
        payload: { messageId }
      }));
      
      // For WebSocket, we assume success if message is sent
      resolve({ messageId });
    });
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Remove all event listeners
  removeAllListeners() {
    this.messageHandlers = {
      new_message: null,
      message_updated: null,
      message_deleted: null,
      user_typing: null,
      user_stopped_typing: null
    };
  }
}

// Create singleton instance
const chatSocketService = new ChatSocketService();

export default chatSocketService; 