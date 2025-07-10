"use client";
import { useState } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  IconButton, 
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button
} from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SecurityIcon from '@mui/icons-material/Security';
import { useLanguage } from "../../../contexts/LanguageContext";
import { useLocalizedText } from "../../../contexts/LanguageContext";
import FormField from "../../../components/FormField";
import { getFormConfig, validateForm, Language } from "../../../lib/i18n";

// 请求头接口
interface Header {
  name: string;
  value: string;
  override: boolean;
}

// 请求头配置接口
interface HeadersConfig {
  request: Header[];
  response: Header[];
}

// 组件接口
interface HeadersTabProps {
  formData: {
    headers: HeadersConfig;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  showValidation?: boolean;
}

// 请求头表单组件
function HeaderForm({ 
  type, 
  idx, 
  header, 
  onChange, 
  onRemove, 
  showRemove,
  language,
  showValidation 
}: { 
  type: "request" | "response"; 
  idx: number; 
  header: Header; 
  onChange: (field: keyof Header, value: any) => void; 
  onRemove: () => void; 
  showRemove: boolean;
  language: Language;
  showValidation: boolean;
}) {
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      alignItems: 'center', 
      mb: 1, 
      p: 2, 
      bgcolor: 'grey.50', 
      borderRadius: 1 
    }}>
      {/* 请求头名称字段 */}
      <FormField
        field={{
          key: 'name',
          label: { en: 'Header Name', zh: '请求头名称' },
          type: 'text',
          required: true,
          placeholder: { en: 'Enter header name', zh: '请输入请求头名称' },
          validation: [
            { type: 'required', message: 'Header name is required' }
          ]
        }}
        value={header.name}
        onChange={(value) => onChange('name', value)}
        language={language}
        allValues={header}
        showValidation={showValidation}
      />

      {/* 请求头值字段 */}
      <FormField
        field={{
          key: 'value',
          label: { en: 'Header Value', zh: '请求头值' },
          type: 'text',
          required: true,
          placeholder: { en: 'Enter header value', zh: '请输入请求头值' },
          validation: [
            { type: 'required', message: 'Header value is required' }
          ]
        }}
        value={header.value}
        onChange={(value) => onChange('value', value)}
        language={language}
        allValues={header}
        showValidation={showValidation}
      />

      {/* 覆盖字段 */}
      <FormField
        field={{
          key: 'override',
          label: { en: 'Override', zh: '覆盖' },
          type: 'switch',
          defaultValue: false
        }}
        value={header.override}
        onChange={(value) => onChange('override', value)}
        language={language}
        allValues={header}
        showValidation={showValidation}
      />

      {showRemove && (
        <IconButton 
          color="error" 
          onClick={onRemove}
          size="small"
        >
          <RemoveCircleOutlineIcon />
        </IconButton>
      )}
    </Box>
  );
}

export default function HeadersTab({ formData, setFormData, showValidation = false }: HeadersTabProps) {
  const { getLabel, getMessage } = useLocalizedText();
  const { language, metaInfo } = useLanguage();
  
  // 获取表单配置
  const formConfig = metaInfo ? getFormConfig(metaInfo, 'gateway-mapping', 'headers') : null;

  // 初始化
  const requestHeaders = formData.headers?.request || [{ name: "", value: "", override: false }];
  const responseHeaders = formData.headers?.response || [{ name: "", value: "", override: false }];

  const handleHeaderChange = (type: "request" | "response", idx: number, field: keyof Header, value: any) => {
    const headers = type === "request" ? [...requestHeaders] : [...responseHeaders];
    headers[idx] = { ...headers[idx], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      headers: {
        ...prev.headers,
        [type]: headers
      }
    }));
  };

  const handleAddHeader = (type: "request" | "response") => {
    if (type === "request") {
      setFormData((prev: any) => ({
        ...prev,
        headers: {
          ...prev.headers,
          request: [...requestHeaders, { name: "", value: "", override: false }]
        }
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        headers: {
          ...prev.headers,
          response: [...responseHeaders, { name: "", value: "", override: false }]
        }
      }));
    }
  };

  const handleRemoveHeader = (type: "request" | "response", idx: number) => {
    if (type === "request") {
      const headers = [...requestHeaders];
      headers.splice(idx, 1);
      setFormData((prev: any) => ({
        ...prev,
        headers: {
          ...prev.headers,
          request: headers.length ? headers : [{ name: "", value: "", override: false }]
        }
      }));
    } else {
      const headers = [...responseHeaders];
      headers.splice(idx, 1);
      setFormData((prev: any) => ({
        ...prev,
        headers: {
          ...prev.headers,
          response: headers.length ? headers : [{ name: "", value: "", override: false }]
        }
      }));
    }
  };

  // 验证表单
  const validationErrors: string[] = [];
  if (showValidation && formConfig) {
    const errors = validateForm(formConfig, formData.headers, language);
    validationErrors.push(...errors.map(error => error.message));
    
    // 检查重复的header names
    const allHeaders = [...requestHeaders, ...responseHeaders];
    const names = allHeaders.map(h => h.name).filter(Boolean);
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      validationErrors.push(getMessage('duplicateHeaderNames'));
    }
  }

  if (!formConfig) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {getLabel('headers')}
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
        {getLabel('headers')}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 请求请求头 */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight={600}>
              {getLabel('requestHeaders')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {requestHeaders.map((header, idx) => (
              <HeaderForm
                key={idx}
                type="request"
                idx={idx}
                header={header}
                onChange={(field, value) => handleHeaderChange("request", idx, field, value)}
                onRemove={() => handleRemoveHeader("request", idx)}
                showRemove={requestHeaders.length > 1}
                language={language}
                showValidation={showValidation}
              />
            ))}
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <IconButton color="primary" onClick={() => handleAddHeader("request")}>
                <AddCircleOutlineIcon />
              </IconButton>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 响应请求头 */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight={600}>
              {getLabel('responseHeaders')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {responseHeaders.map((header, idx) => (
              <HeaderForm
                key={idx}
                type="response"
                idx={idx}
                header={header}
                onChange={(field, value) => handleHeaderChange("response", idx, field, value)}
                onRemove={() => handleRemoveHeader("response", idx)}
                showRemove={responseHeaders.length > 1}
                language={language}
                showValidation={showValidation}
              />
            ))}
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <IconButton color="primary" onClick={() => handleAddHeader("response")}>
                <AddCircleOutlineIcon />
              </IconButton>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 安全请求头预设 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <SecurityIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight={600}>
              {getLabel('securityHeaders')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  const securityHeaders = [
                    { name: "X-Content-Type-Options", value: "nosniff", override: false },
                    { name: "X-Frame-Options", value: "DENY", override: false },
                    { name: "X-XSS-Protection", value: "1; mode=block", override: false },
                    { name: "Referrer-Policy", value: "strict-origin-when-cross-origin", override: false }
                  ];
                  setFormData((prev: any) => ({
                    ...prev,
                    headers: {
                      ...prev.headers,
                      response: [...responseHeaders, ...securityHeaders]
                    }
                  }));
                }}
              >
                {getLabel('addSecurityHeaders')}
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        {getLabel('headersTip')}
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