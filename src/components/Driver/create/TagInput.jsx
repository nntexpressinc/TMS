import React, { useState, useEffect } from 'react';
import { Box, TextField, OutlinedInput, IconButton, NativeSelect, FormControl, InputLabel } from '@mui/material';
import { ApiService } from '../../../api/auth';
import AddIcon from '@mui/icons-material/Add';

const TagInput = ({ driverData, handleChange }) => {
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);
  const [showTagInput, setShowTagInput] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await ApiService.getData('/driver/tags/');
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
        const response = await ApiService.postData('/driver/tags/', { tag: newTag });
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
          value={driverData.driver_tags || ''}
          onChange={handleChange}
          inputProps={{
            name: 'driver_tags',
            id: 'tags',
          }}
        >
          <option value="">None</option>
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