"use client";
import { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SecurityIcon from '@mui/icons-material/Security';
import { useLanguage } from "../../../contexts/LanguageContext";
import { useLocalizedText } from "../../../contexts/LanguageContext";
import FormField from "../../../components/FormField";
import { getFormConfig, validateForm } from "../../../lib/i18n";

// CSP配置接口
interface CspConfig {
  enabled: boolean;
  preset: 'strict' | 'moderate' | 'relaxed' | 'custom';
  customValue: string;
  directives: string[];
  values: string[];
}

// 组件接口
interface CspTabProps {
  formData: {
    csp: CspConfig;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  showValidation?: boolean;
}

// CSP预设值
const CSP_PRESETS = {
  strict: "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; upgrade-insecure-requests;",
  moderate: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
  relaxed: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
  custom: ""
};

export default function CspTab({ formData, setFormData, showValidation = false }: CspTabProps) {
  const { getLabel, getMessage } = useLocalizedText();
  const { language, metaInfo } = useLanguage();
  
  // 获取表单配置
  const formConfig = metaInfo ? getFormConfig(metaInfo, 'gateway-mapping', 'csp') : null;

  // 处理字段变化
  const handleFieldChange = (fieldKey: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      csp: { ...prev.csp, [fieldKey]: value }
    }));
  };

  // 当preset改变时，自动设置customValue
  useEffect(() => {
    if (formData.csp?.preset && formData.csp.preset !== 'custom') {
      handleFieldChange('customValue', CSP_PRESETS[formData.csp.preset]);
    }
  }, [formData.csp?.preset]);

  // 生成CSP值
  const generateCspValue = () => {
    if (formData.csp?.preset === 'custom') {
      return formData.csp.customValue;
    }
    
    if (formData.csp?.directives && formData.csp?.values) {
      const directives = formData.csp.directives;
      const values = formData.csp.values;
      
      if (directives.length > 0 && values.length > 0) {
        return `${directives.join(' ')} ${values.join(' ')}`;
      }
    }
    
    return CSP_PRESETS[formData.csp?.preset || 'moderate'];
  };

  // 添加CSP到响应头
  const addCspToHeaders = () => {
    const cspValue = generateCspValue();
    if (!cspValue.trim()) return;

    setFormData((prev: any) => {
      const responseHeaders = prev.headers?.response || [];
      const existingCspIndex = responseHeaders.findIndex((h: any) => 
        h.name.toLowerCase() === 'content-security-policy'
      );

      if (existingCspIndex >= 0) {
        // 更新现有的CSP header
        const updatedHeaders = [...responseHeaders];
        updatedHeaders[existingCspIndex] = { 
          ...updatedHeaders[existingCspIndex], 
          value: cspValue 
        };
        return {
          ...prev,
          headers: { ...prev.headers, response: updatedHeaders }
        };
      } else {
        // 添加新的CSP header
        return {
          ...prev,
          headers: { 
            ...prev.headers, 
            response: [...responseHeaders, { 
              name: "Content-Security-Policy", 
              value: cspValue, 
              override: false 
            }] 
          }
        };
      }
    });
  };

  // 验证表单
  const validationErrors: string[] = [];
  if (showValidation && formConfig) {
    const errors = validateForm(formConfig, formData.csp, language);
    validationErrors.push(...errors.map(error => error.message));
  }

  if (!formConfig) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {getLabel('csp')}
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
        {getLabel('csp')}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 启用CSP */}
        {formConfig.fields.find(f => f.key === 'enabled') && (
          <FormField
            field={formConfig.fields.find(f => f.key === 'enabled')!}
            value={formData.csp?.enabled || false}
            onChange={(value) => handleFieldChange("enabled", value)}
            language={language}
            allValues={formData.csp}
            showValidation={showValidation}
          />
        )}

        {formData.csp?.enabled && (
          <>
            {/* CSP预设 */}
            {formConfig.fields.find(f => f.key === 'preset') && (
              <FormField
                field={formConfig.fields.find(f => f.key === 'preset')!}
                value={formData.csp?.preset || 'moderate'}
                onChange={(value) => handleFieldChange("preset", value)}
                language={language}
                allValues={formData.csp}
                showValidation={showValidation}
              />
            )}

            {/* 自定义CSP值 */}
            {formData.csp?.preset === 'custom' && formConfig.fields.find(f => f.key === 'customValue') && (
              <FormField
                field={formConfig.fields.find(f => f.key === 'customValue')!}
                value={formData.csp?.customValue || ''}
                onChange={(value) => handleFieldChange("customValue", value)}
                language={language}
                allValues={formData.csp}
                showValidation={showValidation}
              />
            )}

            {/* CSP指令和值配置 */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <SecurityIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  {getLabel('cspAdvanced')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* CSP指令 */}
                  {formConfig.fields.find(f => f.key === 'directives') && (
                    <FormField
                      field={formConfig.fields.find(f => f.key === 'directives')!}
                      value={formData.csp?.directives || []}
                      onChange={(value) => handleFieldChange("directives", value)}
                      language={language}
                      allValues={formData.csp}
                      showValidation={showValidation}
                    />
                  )}

                  {/* CSP值 */}
                  {formConfig.fields.find(f => f.key === 'values') && (
                    <FormField
                      field={formConfig.fields.find(f => f.key === 'values')!}
                      value={formData.csp?.values || []}
                      onChange={(value) => handleFieldChange("values", value)}
                      language={language}
                      allValues={formData.csp}
                      showValidation={showValidation}
                    />
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* 预览生成的CSP值 */}
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                {getLabel('cspPreview')}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {generateCspValue() || getLabel('cspNoValue')}
              </Typography>
            </Box>

            {/* 添加到响应头按钮 */}
            <Button
              variant="contained"
              color="primary"
              onClick={addCspToHeaders}
              disabled={!generateCspValue().trim()}
            >
              {getLabel('addCspToHeaders')}
            </Button>
          </>
        )}
      </Box>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        {getLabel('cspTip')}
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