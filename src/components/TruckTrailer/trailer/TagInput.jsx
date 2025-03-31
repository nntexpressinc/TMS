import React, { useState, useEffect } from 'react';
import { Box, TextField, OutlinedInput, Typography, Button, MenuItem, Select, FormControl, InputLabel, IconButton, NativeSelect } from '@mui/material';
import { ApiService } from '../../../api/auth';
import AddIcon from '@mui/icons-material/Add';

const TagInput = ({ trailerData, handleChange }) => {
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);
  const [showTagInput, setShowTagInput] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await ApiService.getData('/trailer/tags/');
        setTags(response);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

  const handleTagChange = (e) => {
    setNewTag(e.target.value);
  };

  const handleAddTag = async (e) => {
    if (e.key === 'Enter') {
      try {
        const response = await ApiService.postData('/trailer/tags/', { tag: newTag });
        setTags([...tags, response]);
        setNewTag('');
        setShowTagInput(false);
      } catch (error) {
        console.error('Error adding tag:', error);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <FormControl fullWidth>
   
        <NativeSelect
          value={trailerData.tags || ''}
          onChange={handleChange}
          inputProps={{
            name: 'tags',
            id: 'tags',
          }}
        >
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.tag}
            </option>
          ))}
        </NativeSelect>
      </FormControl>
      <IconButton onClick={() => setShowTagInput(!showTagInput)}>
        <AddIcon />
      </IconButton>
      {showTagInput && (
        <TextField
          label="New Tag"
          value={newTag}
          onChange={handleTagChange}
          onKeyPress={handleAddTag}
          sx={{ width: '150px' }}
        />
      )}
    </Box>
  );
};

export default TagInput;