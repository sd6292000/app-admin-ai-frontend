"use client";
import React from 'react';
import { 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Box,
  Typography
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage, loading } = useLanguage();

  const handleLanguageChange = (event: any) => {
    const newLanguage = event.target.value as 'en' | 'zh';
    setLanguage(newLanguage);
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <LanguageIcon color="action" fontSize="small" />
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Language</InputLabel>
        <Select
          value={language}
          onChange={handleLanguageChange}
          label="Language"
          disabled={loading}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="zh">中文</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
} 