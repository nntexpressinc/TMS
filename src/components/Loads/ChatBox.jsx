import React from 'react';
import { Box, TextField, Typography, Button, Paper, Divider } from '@mui/material';
import FileUploads from './FileUploads';

const ChatBox = ({ chatMessages, newMessage, setNewMessage, handleSendMessage, loadData = {}, handleChange, handleSubmitFiles, isDisabled, isReadOnly = false }) => {
  return (
    <Paper sx={{ p: 2, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', position: 'fixed', top: '64px', right: 0, width: { xs: '100%', sm: '30%', md: '20%' }, zIndex: 1, opacity: isDisabled ? 0.5 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Chat
      </Typography>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
        {chatMessages.map((msg, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="body2" color="textSecondary">
              {msg.timestamp.toLocaleString()}
            </Typography>
            <Typography variant="body1">{msg.message}</Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Box>
      {!isReadOnly && !isDisabled && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            sx={{ mt: 1 }}
          >
            Send Message
          </Button>
        </Box>
      )}
      <FileUploads loadData={loadData} handleChange={handleChange} handleSubmitFiles={handleSubmitFiles} isDisabled={isDisabled} />
    </Paper>
  );
};

export default ChatBox;