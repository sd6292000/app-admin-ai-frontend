"use client";
import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Switch,
  FormHelperText,
  OutlinedInput,
  Chip,
  Box
} from '@mui/material';
import { FieldConfig, ValidationError } from '../lib/i18n';
import { useLocalizedText } from '../contexts/LanguageContext';

interface FormFieldProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: ValidationError | null;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function FormField({
  field,
  value,
  onChange,
  error,
  disabled = false,
  fullWidth = true
}: FormFieldProps) {
  const { getText } = useLocalizedText();

  const label = getText(field.label);
  const placeholder = getText(field.placeholder);
  const errorMessage = error?.message || '';

  const handleChange = (event: any) => {
    let newValue = event.target.value;
    
    // 处理不同类型的值
    if (field.type === 'number') {
      newValue = newValue === '' ? undefined : Number(newValue);
    } else if (field.type === 'checkbox') {
      newValue = event.target.checked;
    } else if (field.type === 'switch') {
      newValue = event.target.checked;
    }
    
    onChange(newValue);
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'textarea':
        return (
          <TextField
            label={label}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            multiline={field.type === 'textarea'}
            rows={field.type === 'textarea' ? 3 : 1}
            error={!!error}
            helperText={errorMessage}
            disabled={disabled}
            fullWidth={fullWidth}
            required={field.required}
          />
        );

      case 'number':
        return (
          <TextField
            label={label}
            type="number"
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            error={!!error}
            helperText={errorMessage}
            disabled={disabled}
            fullWidth={fullWidth}
            required={field.required}
            inputProps={{
              min: field.validation?.find(v => v.type === 'min')?.value,
              max: field.validation?.find(v => v.type === 'max')?.value
            }}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth={fullWidth} error={!!error} disabled={disabled} required={field.required}>
            <InputLabel>{label}</InputLabel>
            <Select
              value={value || ''}
              onChange={handleChange}
              label={label}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {getText(option.label)}
                </MenuItem>
              ))}
            </Select>
            {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl fullWidth={fullWidth} error={!!error} disabled={disabled} required={field.required}>
            <InputLabel>{label}</InputLabel>
            <Select
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={handleChange}
              input={<OutlinedInput label={label} />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const option = field.options?.find(opt => opt.value === value);
                    return (
                      <Chip 
                        key={value} 
                        label={option ? getText(option.label) : value} 
                        size="small" 
                      />
                    );
                  })}
                </Box>
              )}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {getText(option.label)}
                </MenuItem>
              ))}
            </Select>
            {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(value)}
                onChange={handleChange}
                disabled={disabled}
              />
            }
            label={label}
          />
        );

      case 'switch':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(value)}
                onChange={handleChange}
                disabled={disabled}
              />
            }
            label={label}
          />
        );

      default:
        return (
          <TextField
            label={label}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            error={!!error}
            helperText={errorMessage}
            disabled={disabled}
            fullWidth={fullWidth}
            required={field.required}
          />
        );
    }
  };

  return renderField();
} 