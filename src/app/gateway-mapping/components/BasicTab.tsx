"use client";
import { Box, Typography, Divider, Paper, Alert, FormControlLabel, Checkbox } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useLocalizedText } from "../../../contexts/LanguageContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import FormField from "../../../components/FormField";
import { getFormConfig, validateForm, FieldConfig } from "../../../lib/i18n";

// 组件接口
interface BasicTabProps {
  formData: {
    basic: {
      domain: string;
      requestPathPattern: string;
      backendForwardPath: string;
      cmdbProject: string;
    };
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  showValidation?: boolean;
  isEditMode?: boolean;
}

function BasicTab({ formData, setFormData, showValidation = false, isEditMode = false }: BasicTabProps) {
  const { getLabel, getMessage } = useLocalizedText();
  const { language, metaInfo } = useLanguage();
  
  // 添加状态来控制checkbox
  const [sameAsRequestPath, setSameAsRequestPath] = useState(true);

  // 获取表单配置
  const formConfig = metaInfo ? getFormConfig(metaInfo, 'gateway-mapping', 'basic') : null;

  // 初始化checkbox状态 - 检查当前值是否相同
  useEffect(() => {
    const requestPath = formData.basic?.requestPathPattern || "";
    const backendPath = formData.basic?.backendForwardPath || "";
    setSameAsRequestPath(requestPath === backendPath);
  }, []); // 只在组件挂载时执行一次

  // 当checkbox状态改变或requestPathPattern改变时，同步backendForwardPath的值
  useEffect(() => {
    if (sameAsRequestPath && formData.basic?.requestPathPattern) {
      const currentBackendPath = formData.basic?.backendForwardPath || "";
      const newBackendPath = formData.basic.requestPathPattern;
      
      // 只有当值不同时才更新，避免无限循环
      if (currentBackendPath !== newBackendPath) {
        setFormData((prev: any) => ({
          ...prev,
          basic: { 
            ...prev.basic, 
            backendForwardPath: newBackendPath
          }
        }));
      }
    }
  }, [sameAsRequestPath, formData.basic?.requestPathPattern, setFormData]);

  // 处理字段变化
  const handleFieldChange = useCallback((fieldKey: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      basic: { ...prev.basic, [fieldKey]: value }
    }));
  }, [setFormData]);

  // 处理checkbox变化
  const handleCheckboxChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSameAsRequestPath(event.target.checked);
  }, []);

  // 验证表单
  const validationErrors: string[] = [];
  if (showValidation && formConfig) {
    const errors = validateForm(formConfig, formData.basic, language);
    validationErrors.push(...errors.map(error => error.message));
  }

  if (!formConfig) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {getLabel('basicInformation')}
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
        {getLabel('basicInformation')}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Domain字段 */}
          {formConfig.fields.find(f => f.key === 'domain') && (
            <FormField
              field={formConfig.fields.find(f => f.key === 'domain')!}
              value={formData.basic?.domain || ""}
              onChange={(value) => handleFieldChange("domain", value)}
              language={language}
              allValues={formData.basic}
              showValidation={showValidation}
              disabled={isEditMode}
            />
          )}
          
          {/* Request Path Pattern字段 */}
          {formConfig.fields.find(f => f.key === 'requestPathPattern') && (
            <FormField
              field={formConfig.fields.find(f => f.key === 'requestPathPattern')!}
              value={formData.basic?.requestPathPattern || ""}
              onChange={(value) => handleFieldChange("requestPathPattern", value)}
              language={language}
              allValues={formData.basic}
              showValidation={showValidation}
              disabled={isEditMode}
            />
          )}
        </Box>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={sameAsRequestPath}
              onChange={handleCheckboxChange}
              color="primary"
            />
          }
          label={getLabel('sameAsRequestPath')}
        />
        
        {!sameAsRequestPath && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Backend Forward Path字段 */}
            {formConfig.fields.find(f => f.key === 'backendForwardPath') && (
              <FormField
                field={formConfig.fields.find(f => f.key === 'backendForwardPath')!}
                value={formData.basic?.backendForwardPath || ""}
                onChange={(value) => handleFieldChange("backendForwardPath", value)}
                language={language}
                allValues={formData.basic}
                showValidation={showValidation}
              />
            )}
          </Box>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* CMDB Project字段 */}
          {formConfig.fields.find(f => f.key === 'cmdbProject') && (
            <FormField
              field={formConfig.fields.find(f => f.key === 'cmdbProject')!}
              value={formData.basic?.cmdbProject || ""}
              onChange={(value) => handleFieldChange("cmdbProject", value)}
              language={language}
              allValues={formData.basic}
              showValidation={showValidation}
            />
          )}
        </Box>
      </Box>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        {getLabel('uniqueTip')}
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

export default BasicTab; 