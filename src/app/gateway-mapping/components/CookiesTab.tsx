"use client";
import { useState } from "react";
import { Box, Typography, Paper, Divider, IconButton, Alert } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useLanguage } from "../../../contexts/LanguageContext";
import { useLocalizedText } from "../../../contexts/LanguageContext";
import FormField from "../../../components/FormField";
import { getFormConfig, validateForm, Language } from "../../../lib/i18n";

// Cookie异常接口
interface CookieException {
  cookieName: string;
  strategy: 'passthrough' | 'persist';
}

// Cookie配置接口
interface CookieConfig {
  globalStrategy: 'passthrough' | 'persist';
  exceptions: CookieException[];
}

// 组件接口
interface CookiesTabProps {
  formData: {
    cookies: CookieConfig;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  showValidation?: boolean;
}

export default function CookiesTab({ formData, setFormData, showValidation = false }: CookiesTabProps) {
  const { getLabel, getMessage } = useLocalizedText();
  const { language, metaInfo } = useLanguage();
  
  // 获取表单配置
  const formConfig = metaInfo ? getFormConfig(metaInfo, 'gateway-mapping', 'cookies') : null;

  // 处理全局策略变化
  const handleGlobalStrategyChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      cookies: { ...prev.cookies, globalStrategy: value }
    }));
  };

  // 处理异常变化
  const handleExceptionChange = (idx: number, field: keyof CookieException, value: any) => {
    const arr = [...formData.cookies.exceptions];
    arr[idx] = { ...arr[idx], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      cookies: { ...prev.cookies, exceptions: arr }
    }));
  };

  // 添加异常
  const handleAddException = () => {
    setFormData((prev: any) => ({
      ...prev,
      cookies: { 
        ...prev.cookies, 
        exceptions: [...formData.cookies.exceptions, { 
          cookieName: "", 
          strategy: 'passthrough' 
        }] 
      }
    }));
  };

  // 删除异常
  const handleRemoveException = (idx: number) => {
    const arr = [...formData.cookies.exceptions];
    arr.splice(idx, 1);
    setFormData((prev: any) => ({
      ...prev,
      cookies: { 
        ...prev.cookies, 
        exceptions: arr.length ? arr : [{ 
          cookieName: "", 
          strategy: 'passthrough' 
        }] 
      }
    }));
  };

  // 验证表单
  const validationErrors: string[] = [];
  if (showValidation && formConfig) {
    const errors = validateForm(formConfig, formData.cookies, language);
    validationErrors.push(...errors.map(error => error.message));
    
    // 检查重复的cookie names
    const exceptions = formData.cookies?.exceptions || [];
    const names = exceptions.map(e => e.cookieName).filter(Boolean);
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      validationErrors.push(getMessage('duplicateCookieNames'));
    }
  }

  if (!formConfig) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {getLabel('cookies')}
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
        {getLabel('cookies')}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 全局策略字段 */}
        {formConfig.fields.find(f => f.key === 'globalStrategy') && (
          <FormField
            field={formConfig.fields.find(f => f.key === 'globalStrategy')!}
            value={formData.cookies?.globalStrategy || ""}
            onChange={handleGlobalStrategyChange}
            language={language}
            allValues={formData.cookies}
            showValidation={showValidation}
          />
        )}

        {/* 异常列表 */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {getLabel('cookieExceptions')}
          </Typography>
          {formData.cookies?.exceptions?.map((exception, idx) => (
            <Box key={idx} sx={{ 
              display: 'flex', 
              gap: 2, 
              alignItems: 'center', 
              mb: 1, 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1 
            }}>
              {/* Cookie名称字段 */}
              <FormField
                field={{
                  key: 'cookieName',
                  label: { en: 'Cookie Name', zh: 'Cookie名称' },
                  type: 'text',
                  required: true,
                  placeholder: { en: 'Enter cookie name', zh: '请输入cookie名称' },
                  validation: [
                    { type: 'required', message: 'Cookie name is required' },
                    { type: 'pattern', value: '^[!#$%&\'*+\\-.^_`|~0-9a-zA-Z]+$', message: 'Invalid cookie name format' }
                  ]
                }}
                value={exception.cookieName}
                onChange={(value) => handleExceptionChange(idx, 'cookieName', value)}
                language={language}
                allValues={exception}
                showValidation={showValidation}
              />

              {/* 策略字段 */}
              <FormField
                field={{
                  key: 'strategy',
                  label: { en: 'Strategy', zh: '策略' },
                  type: 'select',
                  required: true,
                  options: [
                    { label: { en: 'Passthrough', zh: '透传' }, value: 'passthrough' },
                    { label: { en: 'Persist', zh: '持久化' }, value: 'persist' }
                  ]
                }}
                value={exception.strategy}
                onChange={(value) => handleExceptionChange(idx, 'strategy', value)}
                language={language}
                allValues={exception}
                showValidation={showValidation}
              />

              {formData.cookies.exceptions.length > 1 && (
                <IconButton 
                  color="error" 
                  onClick={() => handleRemoveException(idx)}
                  size="small"
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
              )}
            </Box>
          ))}
          
          <Box display="flex" justifyContent="flex-end" mt={1}>
            <IconButton color="primary" onClick={handleAddException}>
              <AddCircleOutlineIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        {getLabel('cookieTip')}
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