import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Button,
  Divider,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  Avatar,
  Badge,
  Tooltip,
  Chip,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Send,
  LocationOn,
  Edit as EditIcon,
  AttachFile,
  Close as CloseIcon,
  InsertDriveFile,
  Image,
  Download,
  PictureAsPdf,
  LocalShipping
} from "@mui/icons-material";
import { ApiService } from "../../api/auth";
import { useSidebar } from "../SidebarContext";
import darkLogo from '../../images/dark-logo.png';
import { CiDeliveryTruck } from "react-icons/ci";
import EmojiPicker from 'emoji-picker-react';

// Styled components for the layout
const MainContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "calc(100vh - 64px)",
  padding: theme.spacing(2),
  gap: theme.spacing(2),
}));

const Panel = styled(Paper)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  borderRadius: theme.spacing(1),
  overflow: "hidden",
}));

const PanelHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const PanelContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  flex: 1,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  position: 'relative',
  zIndex: 1
}));

const FormGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const FormLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 500,
  marginBottom: theme.spacing(1),
}));

const StyledTextarea = styled("textarea")(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(0.5),
  resize: "vertical",
  minHeight: "80px",
  fontFamily: theme.typography.fontFamily,
  fontSize: "0.875rem",
  backgroundColor: "#f9f9f9",
  "&:focus": {
    outline: "none",
    borderColor: theme.palette.primary.main,
  },
}));

const StyledInput = styled("input")(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(0.5),
  fontFamily: theme.typography.fontFamily,
  fontSize: "0.875rem",
  backgroundColor: "#f9f9f9",
  "&:focus": {
    outline: "none",
    borderColor: theme.palette.primary.main,
  },
}));

const LocationInput = styled(Box)(({ theme }) => ({
  position: "relative",
  "& svg": {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: theme.palette.text.secondary,
    zIndex: 1,
  },
  "& input": {
    paddingLeft: "35px",
  }
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  padding: theme.spacing(2),
  backgroundColor: "#f8f9fa",
  backgroundImage: `url(${darkLogo})`,
  backgroundRepeat: 'repeat',
  backgroundSize: '50px',
  backgroundPosition: 'center',
  position: 'relative',
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0, 2),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(248, 249, 250, 0.85)',
    backdropFilter: 'blur(2px)',
    borderRadius: theme.spacing(1),
  }
}));

// Add a new black and white filter for logo background
const ChatBackgroundOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `url(${darkLogo})`,
  backgroundRepeat: 'repeat',
  backgroundSize: '50px',
  backgroundPosition: 'center',
  opacity: 0.15,
  filter: 'grayscale(100%)',
  zIndex: 0,
  borderRadius: 'inherit',
});

const ChatContentWrapper = styled(Box)({
  position: 'relative',
  zIndex: 1,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backdropFilter: 'blur(2px)',
  height: '100%',
  width: '100%',
});

const MessageBubble = styled(Paper)(({ theme, isCurrentUser }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  backgroundColor: isCurrentUser ? '#0078d4' : '#ffffff',
  color: isCurrentUser ? '#ffffff' : theme.palette.text.primary,
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  position: 'relative',
  maxWidth: '100%',
  wordBreak: 'break-word',
}));

const MessageTime = styled(Typography)(({ theme, isCurrentUser }) => ({
  fontSize: '0.65rem',
  display: 'inline-block',
  textAlign: 'right',
  color: isCurrentUser ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
  marginTop: '4px',
  cursor: 'default',
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  border: '2px solid #fff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
}));

const MessageInput = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  gap: theme.spacing(1),
  margin: theme.spacing(0, 2, 2, 2),
  borderRadius: `0 0 ${theme.spacing(1)}px ${theme.spacing(1)}px`,
  boxShadow: "0 -1px 3px rgba(0,0,0,0.05)",
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const InfoIcon = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  backgroundColor: theme.palette.grey[200],
  color: theme.palette.text.primary,
}));

const InfoText = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  fontSize: "0.875rem",
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "0.875rem",
}));

const StatusStep = styled(Box)(({ theme, active }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  "& .step-number": {
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: active ? theme.palette.primary.main : theme.palette.grey[300],
    color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  "& .step-label": {
    fontWeight: active ? 600 : 400,
    color: active ? theme.palette.primary.main : theme.palette.text.primary,
  },
  "& .step-line": {
    flex: 1,
    height: 2,
    backgroundColor: theme.palette.grey[200],
  }
}));

// New styled components for file attachments
const AttachmentPreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(1),
  gap: theme.spacing(1)
}));

const FilePreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  maxWidth: '250px',
  overflow: 'hidden'
}));

const FileAttachment = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.spacing(0.5),
  marginTop: theme.spacing(0.5)
}));

const FilePreviewModal = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '90vw',
    maxHeight: '90vh',
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
  }
}));

const ImagePreview = styled('img')({
  maxWidth: '100%',
  maxHeight: '70vh',
  objectFit: 'contain',
  display: 'block',
  margin: '0 auto',
  cursor: 'pointer',
});

const PdfPreview = styled('iframe')({
  width: '100%',
  height: '80vh',
  border: 'none',
});

const EditIconButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  position: 'absolute',
  top: -8,
  right: -8,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid #e0e0e0',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  zIndex: 1,
}));

const LoadViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [load, setLoad] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const chatEndRef = useRef(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [usersData, setUsersData] = useState({});
  const [previewModal, setPreviewModal] = useState({ open: false, url: '', type: '', name: '' });
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Helper function to format date
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "Invalid Date";
    
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    // If message from today, just show time
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    
    // If message from yesterday, show 'Yesterday' + time
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show full date
    return messageDate.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Load steps for the stepper
  const loadStatuses = [
    { id: 1, name: "Open" },
    { id: 2, name: "Covered" },
    { id: 3, name: "Dispatched" },
    { id: 4, name: "Loading" },
    { id: 5, name: "On Route" },
    { id: 6, name: "Unloading" },
    { id: 7, name: "Delivered" },
    { id: 8, name: "Completed" },
  ];

  useEffect(() => {
    // Get user information from localStorage
    const userInfo = localStorage.getItem("user") 
      ? JSON.parse(localStorage.getItem("user")) 
      : { _id: parseInt(localStorage.getItem("userid")) };
    setUser(userInfo);
    
    const fetchLoadData = async () => {
      setIsLoading(true);
      try {
        const data = await ApiService.getData(`/load/${id}/`);
        setLoad(data);
        
        // Fetch chat messages
        fetchChatMessages();
        } catch (error) {
          console.error("Error fetching load data:", error);
        setError("Could not load data. Please try again.");
        } finally {
          setIsLoading(false);
      }
    };

    fetchLoadData();
  }, [id]);

  const fetchUserData = async (userId) => {
    // Check if we already have this user's data
    if (usersData[userId]) return;
    
    try {
      const userData = await ApiService.getData(`/auth/users/${userId}/`);
      // Store the user data in the state
      setUsersData(prev => ({
        ...prev,
        [userId]: userData
      }));
    } catch (error) {
      console.error(`Error fetching user data for ID ${userId}:`, error);
    }
  };

  const fetchChatMessages = async () => {
    try {
      // Get all chat messages
      const allMessages = await ApiService.getData(`/chat/`);
      // Filter messages for this load
      const loadMessages = allMessages.filter(msg => parseInt(msg.load_id) === parseInt(id));
      
      // Sort messages by timestamp
      loadMessages.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateA - dateB;
      });
      
      setChatMessages(loadMessages || []);
      
      // Fetch user data for each unique user ID in the messages
      const uniqueUserIds = [...new Set(loadMessages.map(msg => msg.user))];
      uniqueUserIds.forEach(userId => {
        fetchUserData(userId);
      });
      
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      showSnackbar("Failed to load chat messages", "error");
    }
  };

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = async (messageText = newMessage, file = selectedFile) => {
    if ((!messageText.trim() && !file) && !editingMessage) return;
    
    try {
      // Get user ID from localStorage
      const userId = parseInt(localStorage.getItem("userid"));
      
      if (!userId) {
        showSnackbar("User authentication required", "error");
        return;
      }
      
      if (editingMessage) {
        // Create message data for update
        const updateData = {
          message: messageText,
          load_id: parseInt(id),
          user: userId
        };
        
        // Don't include file field if editing a message that has a file
        // This avoids the "The submitted data was not a file" error
        if (!editingMessage.file) {
          updateData.file = null;
        }
        
        // Update existing message using PUT method
        await ApiService.putData(`/chat/${editingMessage.id}/`, updateData);
        
        setEditingMessage(null);
        setNewMessage("");
        fetchChatMessages();
        showSnackbar("Message updated", "success");
        return;
      }
      
      if (file) {
        // If there's a file, use FormData for multipart request
        const formData = new FormData();
        formData.append('message', messageText || '');
        formData.append('file', file);
        formData.append('load_id', parseInt(id));
        formData.append('user', userId);
        
        await ApiService.postMediaData(`/chat/`, formData);
      } else {
        // Regular text message
        await ApiService.postData(`/chat/`, {
          message: messageText,
          load_id: parseInt(id),
          user: userId,
          email: localStorage.getItem("email") || "user@example.com"
        });
      }
      
      setNewMessage("");
      setSelectedFile(null);
      fetchChatMessages();
      showSnackbar("Message sent", "success");
    } catch (error) {
      console.error("Error sending message:", error);
      showSnackbar("Failed to send message", "error");
    }
  };

  // Handle emoji selection
  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Function to start editing a message
  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.message || "");
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setNewMessage("");
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCancelFileSelection = () => {
    setSelectedFile(null);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Function to determine if the file is an image
  const isImageFile = (file) => {
    return file && file.type.startsWith('image/');
  };

  // Function to determine if a URL is an image
  const isImageUrl = (url) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
  };

  // Function to determine if the file is a PDF
  const isPdfFile = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.pdf');
  };

  // Handle file paste in message input
  const handlePaste = (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) {
          setSelectedFile(file);
          event.preventDefault();
          break;
        }
      }
    }
  };

  // Function to download file directly
  const downloadFile = (url, fileName) => {
    try {
      // For cross-origin URLs, we need to fetch first
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          // Create blob URL
          const blobUrl = URL.createObjectURL(blob);
          
          // Create anchor element
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName || 'download';
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
          }, 100);
        })
        .catch(err => {
          console.error("Download failed:", err);
          // Fallback to simple method
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName || 'download';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
        } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  // Function to handle file preview in modal
  const handleFilePreview = (url, type, name) => {
    setPreviewModal({
      open: true,
      url,
      type,
      name: name || (type === 'image' ? 'Image' : 'Document')
    });
  };

  // Function to handle file download from modal
  const handleDownload = (e) => {
    e.stopPropagation();
    downloadFile(previewModal.url, previewModal.name);
  };

  // Function to close the preview modal
  const handleClosePreview = () => {
    setPreviewModal({ ...previewModal, open: false });
  };

  // Format profile photo URL to use production API
  const getFormattedProfilePhotoUrl = (url) => {
    if (!url) return "";
    return url.replace('https://0.0.0.0:8000/', 'https://api.biznes-armiya.uz/');
  };

  // Format detailed timestamp with seconds
  const formatDetailedTime = (timestamp) => {
    if (!timestamp) return "Unknown time";
    
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Render chat messages
  const renderChatMessages = () => {
    // Group messages by date
    const messagesByDate = chatMessages.reduce((groups, message) => {
      const messageDate = message.created_at ? new Date(message.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'Unknown Date';
      
      if (!groups[messageDate]) {
        groups[messageDate] = [];
      }
      groups[messageDate].push(message);
      return groups;
    }, {});

    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1, 
        mb: 2,
        position: 'relative',
        zIndex: 1
      }}>
        {Object.entries(messagesByDate).map(([date, messages]) => (
          <Box key={date} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              my: 0.5 
            }}>
              <Chip 
                label={date} 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.5)', 
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  height: 20
                }} 
              />
            </Box>
            
            {messages.map((message, index) => {
              // Check if the message is from the current user
              const isCurrentUserMessage = parseInt(message.user) === parseInt(localStorage.getItem("userid"));
              // Get user data if available
              const messageUser = usersData[message.user] || null;
              
              // Format message time
              const messageTime = message.created_at ? new Date(message.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              }) : "Invalid";
              
              // Check if this is a continuation from the same user
              const isPreviousSameUser = index > 0 && messages[index - 1].user === message.user;
              
              // Check if the message has been edited
              const isEdited = message.updated_at && message.created_at && 
                new Date(message.updated_at).getTime() > new Date(message.created_at).getTime() + 1000;
              
              return (
                <Box
                  key={message.id || index}
                  sx={{
                    alignSelf: isCurrentUserMessage ? 'flex-end' : 'flex-start',
                    display: 'flex',
                    maxWidth: '70%',
                    mt: isPreviousSameUser ? 0.3 : 1.5,
                  }}
                >
                  {/* Only show avatar for non-current user messages */}
                  {!isCurrentUserMessage && (
                    <UserAvatar 
                      src={messageUser?.profile_photo ? getFormattedProfilePhotoUrl(messageUser.profile_photo) : ""}
                      sx={{ 
                        width: 28,
                        height: 28,
                        mr: 1, 
                        alignSelf: 'flex-end',
                        mb: 0.5,
                        bgcolor: messageUser ? 'primary.dark' : 'grey.500',
                      }}
                    >
                      {messageUser ? (messageUser.first_name?.charAt(0) || messageUser.email?.charAt(0) || 'U').toUpperCase() : 'U'}
                    </UserAvatar>
                  )}
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'relative' }}>
                    {/* Edit button for current user's messages */}
                    {isCurrentUserMessage && message.message && (
                      <EditIconButton 
                        size="small"
                        onClick={() => handleEditMessage(message)}
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </EditIconButton>
                    )}
                    
                    {/* Message bubble */}
                    <MessageBubble isCurrentUser={isCurrentUserMessage}>
                      {/* Show message sender name for first message in chain */}
                      {!isPreviousSameUser && !isCurrentUserMessage && (
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: 'text.secondary',
                            mb: 0.5
                          }}
                        >
                          {messageUser ? 
                            `${messageUser.first_name || ''} ${messageUser.last_name || ''}`.trim() || messageUser.email || 'Unknown' 
                          : message.email || 'Unknown'}
                        </Typography>
                      )}
                      
                      {/* Message content */}
                      {message.message && (
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                          {message.message}
                        </Typography>
                      )}
                      
                      {/* File content */}
                      {message.file && renderFileInChat(message.file, message.file_name)}
                      
                      {/* Message timestamp inside bubble */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end',
                        alignItems: 'center', 
                        mt: 0.5
                      }}>
                        {isEdited && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontSize: '0.65rem',
                              fontStyle: 'italic',
                              color: isCurrentUserMessage ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                              mr: 0.5
                            }}
                          >
                            edited
                          </Typography>
                        )}
                        <Tooltip 
                          title={
                            <Box>
                              <Typography variant="caption" sx={{ display: 'block', whiteSpace: 'nowrap' }}>
                                Created: {formatDetailedTime(message.created_at)}
                              </Typography>
                              {isEdited && (
                                <Typography variant="caption" sx={{ display: 'block', whiteSpace: 'nowrap' }}>
                                  Edited: {formatDetailedTime(message.updated_at)}
                                </Typography>
                              )}
                            </Box>
                          }
                          arrow
                          placement="top"
                        >
                          <MessageTime isCurrentUser={isCurrentUserMessage}>
                            {messageTime}
                          </MessageTime>
                        </Tooltip>
                      </Box>
                    </MessageBubble>
                  </Box>
                  
                  {/* Only show avatar for current user messages */}
                  {isCurrentUserMessage && (
                    <UserAvatar 
                      src={user?.profile_photo ? getFormattedProfilePhotoUrl(user.profile_photo) : ""}
                      sx={{ 
                        width: 28,
                        height: 28,
                        ml: 1,
                        alignSelf: 'flex-end',
                        mb: 0.5,
                        bgcolor: 'primary.main',
                      }}
                    >
                      {user ? (user.first_name?.charAt(0) || user.email?.charAt(0) || 'Y').toUpperCase() : 'Y'}
                    </UserAvatar>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
        
        {chatMessages.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            color: 'text.secondary',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '300px',
            width: '100%',
            margin: 'auto',
            paddingTop: '20%',
          }}>
            <Box
              component="img"
              src="https://static.thenounproject.com/png/54580-200.png"
              alt="Truck icon"
              sx={{ 
                width: 70, 
                height: 70, 
                opacity: 0.4,
                mb: 2,
                filter: 'grayscale(80%)'
              }} 
            />
            <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem', mb: 1 }}>No messages yet</Typography>
            <Typography variant="caption" color="text.disabled">
              Start the conversation by sending a message below
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  // Function to render the file in chat
  const renderFileInChat = (fileUrl, fileName) => {
    // Replace URL from development to production URL
    const formattedUrl = fileUrl ? fileUrl.replace('https://0.0.0.0:8000/', 'https://api.biznes-armiya.uz/') : '';
    
    if (isImageUrl(formattedUrl)) {
      return (
        <Box 
          sx={{ 
            mt: 1, 
            maxWidth: '200px',
            cursor: 'pointer',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 1,
            overflow: 'hidden'
          }}
          onClick={() => handleFilePreview(formattedUrl, 'image', fileName)}
        >
          <img 
            src={formattedUrl} 
            alt="Image attachment" 
            style={{ 
              width: '100%',
              maxHeight: '150px',
              objectFit: 'cover'
            }}
          />
        </Box>
      );
    } else if (isPdfFile(formattedUrl)) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            mt: 1,
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#ffffff', 
              fontWeight: 500,
              fontSize: '0.9rem', 
              mb: 0.5 
            }}
          >
            PDF document
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              cursor: 'pointer',
            }}
            onClick={() => handleFilePreview(formattedUrl, 'pdf', fileName)}
          >
            <PictureAsPdf sx={{ color: '#e53935', fontSize: 20 }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#ffffff',
                fontSize: '0.75rem'
              }}
            >
              Click to view
            </Typography>
          </Box>
        </Box>
      );
    } else {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            mt: 1,
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#ffffff', 
              fontWeight: 500,
              fontSize: '0.9rem', 
              mb: 0.5 
            }}
          >
            File attachment
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              cursor: 'pointer',
            }}
            onClick={() => downloadFile(formattedUrl, fileName)}
          >
            <InsertDriveFile sx={{ color: '#ffffff', fontSize: 20 }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#ffffff',
                fontSize: '0.75rem'
              }}
            >
              Click to download
            </Typography>
          </Box>
        </Box>
      );
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !load) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Load not found"}
        </Alert>
        <Button variant="contained" onClick={() => navigate("/loads")}>
          Back to Loads
        </Button>
      </Box>
    );
  }

  // Calculate current step based on load status
  const getCurrentStep = (status) => {
    const normalizedStatus = status?.replace('_', ' ').toUpperCase();
    const step = loadStatuses.findIndex(s => 
      s.name.toUpperCase() === normalizedStatus
    );
    return step !== -1 ? step : 0;
  };

  const currentStep = getCurrentStep(load.load_status);

  return (
    <MainContainer>
      {/* Load Details Panel */}
      <Panel>
        <PanelHeader>
          <Typography variant="h6">Load Details</Typography>
        </PanelHeader>
        <PanelContent>
          <FormGroup>
            <FormLabel>Instructions</FormLabel>
            <StyledTextarea
              value={load.instructions || ""}
              readOnly
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Bills</FormLabel>
            <StyledInput
              value={load.bills || ""}
              readOnly
            />
          </FormGroup>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormGroup sx={{ flex: 1 }}>
              <FormLabel>Load Pay</FormLabel>
              <StyledInput
                value={load.load_pay || ""}
                readOnly
              />
            </FormGroup>
            
            <FormGroup sx={{ flex: 1 }}>
              <FormLabel>Total Miles</FormLabel>
              <StyledInput
                value={load.total_miles || ""}
                readOnly
              />
            </FormGroup>
          </Box>
          
          <FormGroup>
            <FormLabel>Pickup Location</FormLabel>
            <LocationInput>
              <LocationOn />
              <StyledInput
                value={load.pickup_location || ""}
                readOnly
              />
            </LocationInput>
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Delivery Location</FormLabel>
            <LocationInput>
              <LocationOn />
              <StyledInput
                value={load.delivery_location || ""}
                readOnly
              />
            </LocationInput>
          </FormGroup>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormGroup sx={{ flex: 1 }}>
              <FormLabel>Pickup Date</FormLabel>
              <StyledInput
                type="date"
                value={load.pickup_date ? load.pickup_date.split('T')[0] : ""}
                readOnly
              />
            </FormGroup>
            
            <FormGroup sx={{ flex: 1 }}>
              <FormLabel>Delivery Date</FormLabel>
              <StyledInput
                type="date"
                value={load.delivery_date ? load.delivery_date.split('T')[0] : ""}
                readOnly
              />
            </FormGroup>
          </Box>
        </PanelContent>
      </Panel>

      {/* Chat Panel */}
      <Panel>
        <PanelHeader>
          <Typography variant="h6">Chat</Typography>
        </PanelHeader>
        
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: "#f8f9fa",
          borderRadius: theme => theme.spacing(1),
          margin: theme => theme.spacing(0, 2),
          position: 'relative',
          overflow: 'hidden'
        }}>
          <ChatBackgroundOverlay />
          <ChatContentWrapper>
            <Box sx={{ 
              padding: 2,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}>
              {renderChatMessages()}
              <div ref={chatEndRef} />
            </Box>
          </ChatContentWrapper>
        </Box>
        
        <Box sx={{ position: 'relative' }}>
          {showEmojiPicker && (
            <Box sx={{ 
              position: 'absolute', 
              bottom: '100%', 
              right: 16, 
              zIndex: 100,
              boxShadow: 3,
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <EmojiPicker 
                onEmojiClick={onEmojiClick} 
                searchDisabled
                skinTonesDisabled
                width={300}
                height={350}
              />
            </Box>
          )}
          
          {selectedFile && (
            <AttachmentPreview>
              <FilePreview>
                {isImageFile(selectedFile) ? (
                  <Image fontSize="small" color="primary" />
                ) : (
                  <InsertDriveFile fontSize="small" color="primary" />
                )}
                <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                  {selectedFile.name}
                </Typography>
              </FilePreview>
              <Tooltip title="Remove attachment">
                <IconButton size="small" onClick={handleCancelFileSelection}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </AttachmentPreview>
          )}
          
          {editingMessage && (
            <Box sx={{ 
              p: 1, 
              bgcolor: 'primary.light', 
              borderRadius: '4px 4px 0 0',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="body2">Editing message</Typography>
              <IconButton size="small" onClick={handleCancelEdit} sx={{ color: 'white' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          
          <MessageInput>
            <input
              type="file"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload">
              <IconButton component="span" color="primary">
                <AttachFile />
              </IconButton>
            </label>
            
            <TextField
              fullWidth
              placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              onPaste={handlePaste}
              size="small"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      size="small"
                      color="primary"
                    >
                      <CiDeliveryTruck size={20} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <IconButton
              color="primary"
              onClick={() => handleSendMessage()}
              disabled={!newMessage.trim() && !selectedFile && !editingMessage}
            >
              <Send />
            </IconButton>
          </MessageInput>
        </Box>
      </Panel>

      {/* Load Information Panel */}
      <Panel>
        <PanelHeader>
          <Typography variant="h6">Load Information</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
              onClick={() => navigate(`/loads/edit/${id}`)}
          >
            EDIT
          </Button>
        </PanelHeader>
        
        <PanelContent>
          {/* Broker Information */}
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
            {load.customer_broker?.company_name || "No broker assigned"}
          </Typography>
          
          {/* Driver Information */}
          <InfoItem>
            <InfoIcon>D</InfoIcon>
            <InfoText>
              <InfoLabel>Driver</InfoLabel>
              <InfoValue>
                {load.driver ? 
                  `${load.driver.user?.first_name || ''} ${load.driver.user?.last_name || ''}` : 
                  "Not assigned"}
              </InfoValue>
            </InfoText>
          </InfoItem>
          
          {/* Dispatcher Information */}
          <InfoItem>
            <InfoIcon>D</InfoIcon>
            <InfoText>
              <InfoLabel>Dispatcher</InfoLabel>
              <InfoValue>
                {load.dispatcher?.nickname || "Not assigned"}
              </InfoValue>
            </InfoText>
          </InfoItem>
          
          {/* Driver Pay */}
          <InfoItem>
            <InfoIcon>$</InfoIcon>
            <InfoText>
              <InfoLabel>Driver Pay</InfoLabel>
              <InfoValue>
                {load.driver_pay ? `$${load.driver_pay}` : "Not assigned"}
              </InfoValue>
            </InfoText>
          </InfoItem>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Equipment Information */}
          <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1 }}>
            Equipment Information
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {load.truck ? 
              `${load.truck.make || ''} ${load.truck.model || ''} (Unit: ${load.truck.unit_number || ''})` : 
              "No equipment assigned"}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Documents */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              Documents
            </Typography>
            <Button
              variant="text"
              size="small"
              startIcon={<AttachFile />}
              component="label"
            >
              Upload
              <input
                type="file"
                hidden
                onChange={handleFileSelect}
              />
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No documents yet
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Status Stepper */}
          <Box sx={{ mt: 2 }}>
            {loadStatuses.map((step, index) => (
              <StatusStep key={index} active={index <= currentStep}>
                <div className="step-number">{step.id}</div>
                <Typography className="step-label">{step.name}</Typography>
              </StatusStep>
            ))}
        </Box>
        </PanelContent>
      </Panel>

      {/* File Preview Modal */}
      <FilePreviewModal
        open={previewModal.open}
        onClose={handleClosePreview}
        maxWidth="lg"
        onClick={handleClosePreview}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h6" noWrap sx={{ maxWidth: '90%' }}>
            {previewModal.name}
          </Typography>
          <Box>
            {previewModal.type === 'image' && (
              <IconButton 
                onClick={handleDownload}
                sx={{ mr: 1 }}
              >
                <Download />
              </IconButton>
            )}
            <IconButton onClick={handleClosePreview}>
              <CloseIcon />
            </IconButton>
        </Box>
        </DialogTitle>
        <DialogContent sx={{ padding: 0 }}>
          {previewModal.type === 'image' ? (
            <ImagePreview 
              src={previewModal.url} 
              alt={previewModal.name} 
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(e);
              }}
            />
          ) : previewModal.type === 'pdf' ? (
            <PdfPreview src={previewModal.url} title={previewModal.name} />
          ) : null}
        </DialogContent>
      </FilePreviewModal>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainContainer>
  );
};

export default LoadViewPage; 