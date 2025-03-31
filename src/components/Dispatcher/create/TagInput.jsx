import React, { useState, useEffect } from 'react';
import { Box, TextField, FormControl, NativeSelect, IconButton } from '@mui/material';
import { ApiService } from '../../../api/auth';
import AddIcon from '@mui/icons-material/Add';

const TagInput = ({ dispatcherData, handleChange }) => {
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);
  const [showTagInput, setShowTagInput] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await ApiService.getData('/dispatcher/tags/');
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
        const response = await ApiService.postData('/dispatcher/tags/', { tag: newTag });
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
          value={dispatcherData.dispatcher_tags || ''}
          onChange={handleChange}
          inputProps={{
            name: 'dispatcher_tags',
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