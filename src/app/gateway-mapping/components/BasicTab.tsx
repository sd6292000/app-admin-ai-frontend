"use client";
import { useFormData, useFormConfig, useFormValidation } from "../contexts/FormContext";
import { Box, TextField, MenuItem, Typography, Divider, Paper, Alert, FormControlLabel, Checkbox } from "@mui/material";
import { useState, useEffect, useCallback } from "react";

// 静态内容
const STATIC_CONTENT = {
  title: "Basic Information",
  validationMessages: {
    domainRequired: "域名不能为空",
    pathPatternRequired: "请求路径模式不能为空",
    backendPathRequired: "后端转发路径不能为空",
    cmdbProjectRequired: "CMDB项目必须选择"
  }
};

// 组件接口
interface BasicTabProps {
  showValidation?: boolean;
  isEditMode?: boolean;
}

function BasicTab({ showValidation = false, isEditMode = false }: BasicTabProps) {
  const { formData, setFormData } = useFormData();
  const { config } = useFormConfig();
  const { validateBasic } = useFormValidation();
  
  const { labels, options } = config?.basic || {};

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
        setFormData((prev) => ({
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
    setFormData((prev) => ({
      ...prev,
      basic: { ...prev.basic, [field]: value }
    }));
  }, [setFormData]);

  // 处理checkbox变化
  const handleCheckboxChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSameAsRequestPath(event.target.checked);
  }, []);

  // 获取验证错误
  const validationErrors = showValidation ? validateBasic() : [];

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {STATIC_CONTENT.title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <TextField
            label={<b>{labels?.domain || "Domain"} *</b>}
            required
            fullWidth
            disabled={isEditMode}
            value={formData.basic?.domain || ""}
            onChange={(e) => handleChange("domain", e.target.value)}
            error={showValidation && !formData.basic?.domain?.trim()}
            helperText={showValidation && !formData.basic?.domain?.trim() ? STATIC_CONTENT.validationMessages.domainRequired : ""}
          />
          
          <TextField
            label={<b>{labels?.requestPathPattern || "Request Path Pattern"} *</b>}
            required
            fullWidth
            disabled={isEditMode}
            value={formData.basic?.requestPathPattern || ""}
            onChange={(e) => handleChange("requestPathPattern", e.target.value)}
            error={showValidation && !formData.basic?.requestPathPattern?.trim()}
            helperText={showValidation && !formData.basic?.requestPathPattern?.trim() ? STATIC_CONTENT.validationMessages.pathPatternRequired : ""}
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
          label="后端转发路径与请求路径模式相同"
        />
        
        {!sameAsRequestPath && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <TextField
              label={<b>{labels?.backendForwardPath || "Backend Forward Path"} *</b>}
              required
              fullWidth
              value={formData.basic?.backendForwardPath || ""}
              onChange={(e) => handleChange("backendForwardPath", e.target.value)}
              error={showValidation && !formData.basic?.backendForwardPath?.trim()}
              helperText={showValidation && !formData.basic?.backendForwardPath?.trim() ? STATIC_CONTENT.validationMessages.backendPathRequired : ""}
            />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <TextField
            select
            label={<b>{labels?.cmdbProject || "CMDB Project"} *</b>}
            required
            fullWidth
            value={formData.basic?.cmdbProject || ""}
            onChange={(e) => handleChange("cmdbProject", e.target.value)}
            error={showValidation && !formData.basic?.cmdbProject}
            helperText={showValidation && !formData.basic?.cmdbProject ? STATIC_CONTENT.validationMessages.cmdbProjectRequired : ""}
          >
            {(options?.cmdbProject || []).map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        {labels?.uniqueTip || "Domain + Path Pattern must be unique."}
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