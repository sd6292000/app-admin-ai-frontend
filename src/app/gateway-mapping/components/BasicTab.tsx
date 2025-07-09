"use client";
import { Box, TextField, MenuItem, Typography, Divider, Paper, Alert, FormControlLabel, Checkbox } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useLocalizedText } from "../../../contexts/LanguageContext";

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
  
  // 添加状态来控制checkbox
  const [sameAsRequestPath, setSameAsRequestPath] = useState(true);

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
  const handleChange = useCallback((field: keyof typeof formData.basic, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      basic: { ...prev.basic, [field]: value }
    }));
  }, [setFormData]);

  // 处理checkbox变化
  const handleCheckboxChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSameAsRequestPath(event.target.checked);
  }, []);

  // 验证错误
  const validationErrors: string[] = [];
  if (showValidation) {
    if (!formData.basic?.domain?.trim()) {
      validationErrors.push(getMessage('domainRequired'));
    }
    if (!formData.basic?.requestPathPattern?.trim()) {
      validationErrors.push(getMessage('pathPatternRequired'));
    }
    if (!formData.basic?.backendForwardPath?.trim()) {
      validationErrors.push(getMessage('backendPathRequired'));
    }
    if (!formData.basic?.cmdbProject) {
      validationErrors.push(getMessage('cmdbProjectRequired'));
    }
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {getLabel('basicInformation')}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <TextField
            label={<b>{getLabel('domain')} *</b>}
            required
            fullWidth
            disabled={isEditMode}
            value={formData.basic?.domain || ""}
            onChange={(e) => handleChange("domain", e.target.value)}
            error={showValidation && !formData.basic?.domain?.trim()}
            helperText={showValidation && !formData.basic?.domain?.trim() ? getMessage('domainRequired') : ""}
          />
          
          <TextField
            label={<b>{getLabel('requestPathPattern')} *</b>}
            required
            fullWidth
            disabled={isEditMode}
            value={formData.basic?.requestPathPattern || ""}
            onChange={(e) => handleChange("requestPathPattern", e.target.value)}
            error={showValidation && !formData.basic?.requestPathPattern?.trim()}
            helperText={showValidation && !formData.basic?.requestPathPattern?.trim() ? getMessage('pathPatternRequired') : ""}
          />
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
            <TextField
              label={<b>{getLabel('backendForwardPath')} *</b>}
              required
              fullWidth
              value={formData.basic?.backendForwardPath || ""}
              onChange={(e) => handleChange("backendForwardPath", e.target.value)}
              error={showValidation && !formData.basic?.backendForwardPath?.trim()}
              helperText={showValidation && !formData.basic?.backendForwardPath?.trim() ? getMessage('backendPathRequired') : ""}
            />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <TextField
            select
            label={<b>{getLabel('cmdbProject')} *</b>}
            required
            fullWidth
            value={formData.basic?.cmdbProject || ""}
            onChange={(e) => handleChange("cmdbProject", e.target.value)}
            error={showValidation && !formData.basic?.cmdbProject}
            helperText={showValidation && !formData.basic?.cmdbProject ? getMessage('cmdbProjectRequired') : ""}
          >
            <MenuItem value="a">Project A</MenuItem>
            <MenuItem value="b">Project B</MenuItem>
            <MenuItem value="c">Project C</MenuItem>
          </TextField>
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