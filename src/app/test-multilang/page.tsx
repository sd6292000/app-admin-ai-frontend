"use client";
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Alert,
  Divider
} from '@mui/material';
import { useLanguage, useLocalizedText } from '../../contexts/LanguageContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import FormField from '../../components/FormField';
import { FieldConfig } from '../../lib/i18n';

export default function TestMultilangPage() {
  const { language, metaInfo, loading, error } = useLanguage();
  const { getLabel, getMessage, getText } = useLocalizedText();
  
  const [formData, setFormData] = useState({
    domain: '',
    port: 80,
    protocol: 'HTTP',
    enabled: true
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 测试字段配置
  const testFields: FieldConfig[] = [
    {
      key: 'domain',
      label: { en: 'Domain', zh: '域名' },
      type: 'text',
      required: true,
      placeholder: { en: 'Enter domain name', zh: '请输入域名' },
      validation: [
        { type: 'required', message: 'Domain is required' },
        { type: 'pattern', value: '^[a-zA-Z0-9.-]+$', message: 'Invalid domain format' }
      ]
    },
    {
      key: 'port',
      label: { en: 'Port', zh: '端口' },
      type: 'number',
      required: true,
      defaultValue: 80,
      validation: [
        { type: 'required', message: 'Port is required' },
        { type: 'min', value: 1, message: 'Port must be at least 1' },
        { type: 'max', value: 65535, message: 'Port must be at most 65535' }
      ]
    },
    {
      key: 'protocol',
      label: { en: 'Protocol', zh: '协议' },
      type: 'select',
      required: true,
      defaultValue: 'HTTP',
      options: [
        { label: { en: 'HTTP', zh: 'HTTP' }, value: 'HTTP' },
        { label: { en: 'HTTPS', zh: 'HTTPS' }, value: 'HTTPS' }
      ]
    },
    {
      key: 'enabled',
      label: { en: 'Enabled', zh: '启用' },
      type: 'switch',
      defaultValue: true
    }
  ];

  const handleFieldChange = (fieldKey: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldKey]: value }));
    
    // 清除该字段的验证错误
    if (validationErrors[fieldKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    const errors: Record<string, string> = {};
    
    // 简单验证
    if (!formData.domain.trim()) {
      errors.domain = getMessage('domainRequired');
    }
    
    if (!formData.port || formData.port < 1 || formData.port > 65535) {
      errors.port = getMessage('portInvalid');
    }
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      alert(getMessage('formSubmitted'));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error loading meta information: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* 页面头部 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {getLabel('multilangTest')}
        </Typography>
        <LanguageSwitcher />
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {getLabel('currentLanguage')}: {language}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {getMessage('metaInfoLoaded')}: {metaInfo ? 'Yes' : 'No'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {getMessage('availableLanguages')}: {metaInfo?.languages?.join(', ') || 'None'}
        </Typography>
      </Paper>

      {/* 测试表单 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {getLabel('testForm')}
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box display="flex" flexDirection="column" gap={2}>
          {testFields.map(field => (
            <FormField
              key={field.key}
              field={field}
              value={formData[field.key as keyof typeof formData]}
              onChange={(value) => handleFieldChange(field.key, value)}
              error={validationErrors[field.key] ? {
                field: field.key,
                message: validationErrors[field.key],
                type: 'validation'
              } : null}
            />
          ))}
          
          <Box mt={2}>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              fullWidth
            >
              {getLabel('submit')}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* 表单数据预览 */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {getLabel('formDataPreview')}
        </Typography>
        
        <Box 
          component="pre" 
          sx={{ 
            bgcolor: 'grey.100', 
            p: 2, 
            borderRadius: 1, 
            overflow: 'auto',
            fontSize: '0.875rem'
          }}
        >
          {JSON.stringify(formData, null, 2)}
        </Box>
      </Paper>

      {/* 通用标签测试 */}
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {getLabel('commonLabelsTest')}
        </Typography>
        
        <Box display="flex" flexWrap="wrap" gap={1}>
          <Button variant="outlined" size="small">
            {getLabel('save')}
          </Button>
          <Button variant="outlined" size="small">
            {getLabel('cancel')}
          </Button>
          <Button variant="outlined" size="small">
            {getLabel('edit')}
          </Button>
          <Button variant="outlined" size="small">
            {getLabel('delete')}
          </Button>
          <Button variant="outlined" size="small">
            {getLabel('add')}
          </Button>
        </Box>
      </Paper>

      {/* 验证消息测试 */}
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {getLabel('validationMessagesTest')}
        </Typography>
        
        <Box display="flex" flexDirection="column" gap={1}>
          <Alert severity="error">
            {getMessage('required')}
          </Alert>
          <Alert severity="error">
            {getMessage('minValue')}
          </Alert>
          <Alert severity="error">
            {getMessage('maxValue')}
          </Alert>
          <Alert severity="error">
            {getMessage('pattern')}
          </Alert>
        </Box>
      </Paper>
    </Box>
  );
} 