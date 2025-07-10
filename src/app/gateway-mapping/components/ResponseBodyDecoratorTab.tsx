"use client";
import { useState } from "react";
import { Box, Typography, Paper, Divider, IconButton, Alert } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useLanguage } from "../../../contexts/LanguageContext";
import { useLocalizedText } from "../../../contexts/LanguageContext";
import FormField from "../../../components/FormField";
import { getFormConfig, validateForm } from "../../../lib/i18n";

// 错误页面映射接口
interface ErrorPageMapping {
  statusCode: string;
  pagePath: string;
}

// 组件接口
interface ResponseBodyDecoratorTabProps {
  formData: {
    responseBodyDecorator: ErrorPageMapping[];
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  showValidation?: boolean;
}

export default function ResponseBodyDecoratorTab({ formData, setFormData, showValidation = false }: ResponseBodyDecoratorTabProps) {
  const { getLabel, getMessage } = useLocalizedText();
  const { language, metaInfo } = useLanguage();
  
  // 获取表单配置
  const formConfig = metaInfo ? getFormConfig(metaInfo, 'gateway-mapping', 'responseBodyDecorator') : null;

  // 初始化
  const mappings = formData.responseBodyDecorator || [{ statusCode: "", pagePath: "" }];

  const handleChange = (idx: number, field: keyof ErrorPageMapping, value: any) => {
    const arr = [...mappings];
    arr[idx] = { ...arr[idx], [field]: value };
    setFormData((prev: any) => ({ ...prev, responseBodyDecorator: arr }));
  };

  const handleAdd = () => {
    setFormData((prev: any) => ({ 
      ...prev, 
      responseBodyDecorator: [...mappings, { statusCode: "", pagePath: "" }] 
    }));
  };

  const handleRemove = (idx: number) => {
    const arr = [...mappings];
    arr.splice(idx, 1);
    setFormData((prev: any) => ({ 
      ...prev, 
      responseBodyDecorator: arr.length ? arr : [{ statusCode: "", pagePath: "" }] 
    }));
  };

  // 验证表单
  const validationErrors: string[] = [];
  if (showValidation && formConfig) {
    mappings.forEach((mapping, index) => {
      const errors = validateForm(formConfig, mapping, language);
      validationErrors.push(...errors.map(error => `映射 ${index + 1}: ${error.message}`));
    });
  }

  if (!formConfig) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {getLabel('responseBodyDecorator')}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity="info">
          {getMessage('loading')}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {getLabel('responseBodyDecorator')}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mappings.map((item, idx) => (
          <Box key={idx} sx={{ 
            display: 'flex', 
            gap: 2, 
            alignItems: 'center', 
            mb: 1, 
            p: 2, 
            bgcolor: 'grey.50', 
            borderRadius: 1 
          }}>
            {/* 状态码字段 */}
            <FormField
              field={{
                key: 'statusCode',
                label: { en: 'Status Code', zh: '状态码' },
                type: 'number',
                required: true,
                placeholder: { en: 'e.g. 404', zh: '例如：404' },
                validation: [
                  { type: 'required', message: 'Status code is required' },
                  { type: 'min', value: 100, message: 'Status code must be at least 100' },
                  { type: 'max', value: 599, message: 'Status code must be at most 599' }
                ]
              }}
              value={item.statusCode}
              onChange={(value) => handleChange(idx, 'statusCode', value)}
              language={language}
              allValues={item}
              showValidation={showValidation}
            />

            {/* 页面路径字段 */}
            <FormField
              field={{
                key: 'pagePath',
                label: { en: 'Page Path', zh: '页面路径' },
                type: 'text',
                required: true,
                placeholder: { en: 'e.g. /404 or https://example.com/404', zh: '例如：/404 或 https://example.com/404' },
                validation: [
                  { type: 'required', message: 'Page path is required' },
                  { type: 'pattern', value: '^(\\/|https?:\\/\\/)[\\w\\-.:/?#\\[\\]@!$&\'()*+,;=%]+$', message: 'Must be URI Path or Full URL' }
                ]
              }}
              value={item.pagePath}
              onChange={(value) => handleChange(idx, 'pagePath', value)}
              language={language}
              allValues={item}
              showValidation={showValidation}
            />

            {mappings.length > 1 && (
              <IconButton 
                color="error" 
                onClick={() => handleRemove(idx)}
                size="small"
              >
                <RemoveCircleOutlineIcon />
              </IconButton>
            )}
          </Box>
        ))}
        
        <Box display="flex" justifyContent="flex-end" mt={1}>
          <IconButton color="primary" onClick={handleAdd}>
            <AddCircleOutlineIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        {getLabel('responseBodyDecoratorTip')}
      </Alert>

      {showValidation && validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2" component="div">
            {validationErrors.map((error, index) => (
              <div key={index}>• {error}</div>
            ))}
          </Typography>
        </Alert>
      )}
    </Paper>
  );
} 