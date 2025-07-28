import React, { useState } from 'react';
import { Box, TextField, Typography, Button, Paper, Divider, IconButton, CircularProgress } from '@mui/material';
import { AttachFile, Send, Close } from '@mui/icons-material';
import FileUploads from './FileUploads';

const ChatBox = ({ chatMessages, newMessage, setNewMessage, handleSendMessage, loadData = {}, handleChange, handleSubmitFiles, isDisabled, isReadOnly = false }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCancelFileSelection = () => {
    setSelectedFile(null);
  };

  const handleSendMessageWithFile = async () => {
    if (!newMessage.trim() && !selectedFile) return;
    
    setIsChatLoading(true);
    
    try {
      // If handleSendMessage function exists, call it with message and file
      if (handleSendMessage) {
        await handleSendMessage(newMessage, selectedFile);
      }
      
      // Reset state after successful send
      setNewMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsChatLoading(false);
    }
  };
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <IconButton 
              component="label"
              disabled={isChatLoading}
              sx={{ 
                color: selectedFile ? 'success.main' : 'text.secondary',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <input 
                type="file" 
                hidden 
                onChange={handleFileSelect}
                accept="*/*"
              />
              <AttachFile />
            </IconButton>
            
            {selectedFile && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: 'success.light',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                mr: 1
              }}>
                <Typography variant="caption" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedFile.name}
                </Typography>
                <IconButton size="small" onClick={handleCancelFileSelection}>
                  <Close sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isChatLoading}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessageWithFile();
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessageWithFile}
            disabled={(!newMessage.trim() && !selectedFile) || isChatLoading}
            startIcon={isChatLoading ? <CircularProgress size={20} /> : <Send />}
            sx={{ mt: 1 }}
          >
            {isChatLoading ? 'Sending...' : 'Send Message'}
          </Button>
        </Box>
      )}
      <FileUploads loadData={loadData} handleChange={handleChange} handleSubmitFiles={handleSubmitFiles} isDisabled={isDisabled} />
    </Paper>
  );
};

export default ChatBox;