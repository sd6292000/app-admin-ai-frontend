"use client";
import React, { useState, useEffect } from 'react';
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Checkbox,
  FormHelperText,
  Chip,
  Box,
  Typography
} from '@mui/material';
import { useLocalizedText } from '../contexts/LanguageContext';
import { 
  FieldConfig, 
  validateField, 
  getFieldLabel, 
  getFieldPlaceholder, 
  getOptionLabel,
  shouldShowField,
  getFieldDefaultValue,
  Language
} from '../lib/i18n';

interface FormFieldProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  language: Language;
  allValues?: Record<string, any>;
  showValidation?: boolean;
  disabled?: boolean;
  error?: string;
}

export default function FormField({
  field,
  value,
  onChange,
  language,
  allValues = {},
  showValidation = false,
  disabled = false,
  error: externalError
}: FormFieldProps) {
  const { getValidationMessage } = useLocalizedText();
  const [validationError, setValidationError] = useState<string | null>(null);

  // 检查字段是否应该显示
  const shouldShow = shouldShowField(field, allValues);

  // 验证字段值
  useEffect(() => {
    if (showValidation) {
      const error = validateField(field, value, language, allValues);
      setValidationError(error ? error.message : null);
    } else {
      setValidationError(null);
    }
  }, [field, value, language, allValues, showValidation]);

  // 如果字段不应该显示，返回null（在Hooks之后）
  if (!shouldShow) return null;

  const hasError = showValidation && (validationError || externalError);
  const errorMessage = externalError || validationError;

  // 处理值变化
  const handleChange = (newValue: any) => {
    onChange(newValue);
  };

  // 根据字段类型渲染不同的组件
  switch (field.type) {
    case 'text':
    case 'textarea':
      return (
        <TextField
          label={getFieldLabel(field, language)}
          placeholder={getFieldPlaceholder(field, language)}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          required={field.required}
          disabled={disabled}
          error={!!hasError}
          helperText={errorMessage}
          multiline={field.type === 'textarea'}
          rows={field.type === 'textarea' ? 4 : 1}
          fullWidth
        />
      );

    case 'number':
      return (
        <TextField
          label={getFieldLabel(field, language)}
          placeholder={getFieldPlaceholder(field, language)}
          value={value || ''}
          onChange={(e) => handleChange(Number(e.target.value))}
          required={field.required}
          disabled={disabled}
          error={!!hasError}
          helperText={errorMessage}
          type="number"
          fullWidth
        />
      );

    case 'select':
      return (
        <FormControl fullWidth error={!!hasError} disabled={disabled}>
          <InputLabel>{getFieldLabel(field, language)}</InputLabel>
          <Select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            label={getFieldLabel(field, language)}
          >
            {field.options?.map((option) => {
              // 检查级联条件
              if (option.parentValue && field.dependencies) {
                const parentField = field.dependencies[0]; // 假设只有一个依赖字段
                const parentValue = allValues[parentField];
                if (parentValue !== option.parentValue) {
                  return null; // 不显示不匹配的选项
                }
              }
              return (
                <MenuItem key={option.value} value={option.value}>
                  {getOptionLabel(option, language)}
                </MenuItem>
              );
            }).filter(Boolean)}
          </Select>
          {hasError && <FormHelperText>{errorMessage}</FormHelperText>}
        </FormControl>
      );

    case 'multiselect':
      return (
        <FormControl fullWidth error={!!hasError} disabled={disabled}>
          <InputLabel>{getFieldLabel(field, language)}</InputLabel>
          <Select
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => handleChange(e.target.value)}
            label={getFieldLabel(field, language)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => {
                  const option = field.options?.find(opt => opt.value === value);
                  return (
                    <Chip 
                      key={value} 
                      label={option ? getOptionLabel(option, language) : value} 
                      size="small" 
                    />
                  );
                })}
              </Box>
            )}
          >
            {field.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {getOptionLabel(option, language)}
              </MenuItem>
            ))}
          </Select>
          {hasError && <FormHelperText>{errorMessage}</FormHelperText>}
        </FormControl>
      );

    case 'checkbox':
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(value)}
              onChange={(e) => handleChange(e.target.checked)}
              disabled={disabled}
            />
          }
          label={getFieldLabel(field, language)}
        />
      );

    case 'switch':
      return (
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(value)}
              onChange={(e) => handleChange(e.target.checked)}
              disabled={disabled}
            />
          }
          label={getFieldLabel(field, language)}
        />
      );

    default:
      return (
        <TextField
          label={getFieldLabel(field, language)}
          placeholder={getFieldPlaceholder(field, language)}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          required={field.required}
          disabled={disabled}
          error={!!hasError}
          helperText={errorMessage}
          fullWidth
        />
      );
  }
} 