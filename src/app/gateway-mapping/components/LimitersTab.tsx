"use client";
import { useState } from "react";
import { Box, Typography, Paper, Divider, IconButton, Alert } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useLanguage } from "../../../contexts/LanguageContext";
import { useLocalizedText } from "../../../contexts/LanguageContext";
import FormField from "../../../components/FormField";
import { getFormConfig, validateForm } from "../../../lib/i18n";

// IP规则接口
interface IpRule {
  ipOrCidr: string;
  mode: 'allow' | 'deny';
}

// 限制器配置接口
interface LimitersConfig {
  ipRules: IpRule[];
  maxConcurrent: string;
  maxPerMinute: string;
  allowedMethods: string[];
}

// 组件接口
interface LimitersTabProps {
  formData: {
    limiters: LimitersConfig;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  showValidation?: boolean;
}

export default function LimitersTab({ formData, setFormData, showValidation = false }: LimitersTabProps) {
  const { getLabel, getMessage } = useLocalizedText();
  const { language, metaInfo } = useLanguage();
  
  // 获取表单配置
  const formConfig = metaInfo ? getFormConfig(metaInfo, 'gateway-mapping', 'limiters') : null;

  // 初始化
  const ipRules = formData.limiters?.ipRules || [{ ipOrCidr: "", mode: "allow" }];
  const maxConcurrent = formData.limiters?.maxConcurrent || "";
  const maxPerMinute = formData.limiters?.maxPerMinute || "";
  const allowedMethods = formData.limiters?.allowedMethods || [];

  const handleIpRuleChange = (idx: number, field: keyof IpRule, value: any) => {
    const rules = [...ipRules];
    rules[idx] = { ...rules[idx], [field]: value };
    setFormData((prev: any) => ({
      ...prev,
      limiters: { ...prev.limiters, ipRules: rules }
    }));
  };

  const handleAddIpRule = () => {
    setFormData((prev: any) => ({
      ...prev,
      limiters: { ...prev.limiters, ipRules: [...ipRules, { ipOrCidr: "", mode: "allow" }] }
    }));
  };

  const handleRemoveIpRule = (idx: number) => {
    const rules = [...ipRules];
    rules.splice(idx, 1);
    setFormData((prev: any) => ({
      ...prev,
      limiters: { ...prev.limiters, ipRules: rules.length ? rules : [{ ipOrCidr: "", mode: "allow" }] }
    }));
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      limiters: { ...prev.limiters, [field]: value }
    }));
  };

  const handleMethodChange = (method: string, checked: boolean) => {
    const newMethods = checked ? [...allowedMethods, method] : allowedMethods.filter(v => v !== method);
    setFormData((prev: any) => ({
      ...prev,
      limiters: { ...prev.limiters, allowedMethods: newMethods }
    }));
  };

  // 验证表单
  const validationErrors: string[] = [];
  if (showValidation && formConfig) {
    const errors = validateForm(formConfig, formData.limiters, language);
    validationErrors.push(...errors.map(error => error.message));
  }

  if (!formConfig) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {getLabel('limiters')}
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
        {getLabel('limiters')}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* IP规则 */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {getLabel('ipRules')}
          </Typography>
          {ipRules.map((rule, idx) => (
            <Box key={idx} sx={{ 
              display: 'flex', 
              gap: 2, 
              alignItems: 'center', 
              mb: 1, 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1 
            }}>
              {/* IP或CIDR字段 */}
              <FormField
                field={{
                  key: 'ipOrCidr',
                  label: { en: 'IP or CIDR', zh: 'IP或CIDR' },
                  type: 'text',
                  required: true,
                  placeholder: { en: 'e.g. 1.1.1.1 or 1.1.1.1/24', zh: '例如：1.1.1.1 或 1.1.1.1/24' },
                  validation: [
                    { type: 'required', message: 'IP or CIDR is required' },
                    { type: 'pattern', value: '^(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)){3}(\\/(3[0-2]|[12]?\\d))?$', message: 'Invalid IPv4 or CIDR format' }
                  ]
                }}
                value={rule.ipOrCidr}
                onChange={(value) => handleIpRuleChange(idx, 'ipOrCidr', value)}
                language={language}
                allValues={rule}
                showValidation={showValidation}
              />

              {/* 模式字段 */}
              <FormField
                field={{
                  key: 'mode',
                  label: { en: 'Mode', zh: '模式' },
                  type: 'select',
                  required: true,
                  options: [
                    { label: { en: 'Allow', zh: '允许' }, value: 'allow' },
                    { label: { en: 'Deny', zh: '拒绝' }, value: 'deny' }
                  ]
                }}
                value={rule.mode}
                onChange={(value) => handleIpRuleChange(idx, 'mode', value)}
                language={language}
                allValues={rule}
                showValidation={showValidation}
              />

              {ipRules.length > 1 && (
                <IconButton 
                  color="error" 
                  onClick={() => handleRemoveIpRule(idx)}
                  size="small"
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
              )}
            </Box>
          ))}
          
          <Box display="flex" justifyContent="flex-end" mt={1}>
            <IconButton color="primary" onClick={handleAddIpRule}>
              <AddCircleOutlineIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider />

        {/* 并发限制 */}
        {formConfig.fields.find(f => f.key === 'maxConcurrent') && (
          <FormField
            field={formConfig.fields.find(f => f.key === 'maxConcurrent')!}
            value={maxConcurrent}
            onChange={(value) => handleFieldChange("maxConcurrent", value)}
            language={language}
            allValues={formData.limiters}
            showValidation={showValidation}
          />
        )}

        {/* 每分钟限制 */}
        {formConfig.fields.find(f => f.key === 'maxPerMinute') && (
          <FormField
            field={formConfig.fields.find(f => f.key === 'maxPerMinute')!}
            value={maxPerMinute}
            onChange={(value) => handleFieldChange("maxPerMinute", value)}
            language={language}
            allValues={formData.limiters}
            showValidation={showValidation}
          />
        )}

        {/* 允许的方法 */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {getLabel('allowedMethods')}
          </Typography>
          {["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].map((method) => (
            <FormField
              key={method}
              field={{
                key: method,
                label: { en: method, zh: method },
                type: 'checkbox',
                defaultValue: false
              }}
              value={allowedMethods.includes(method)}
              onChange={(checked) => handleMethodChange(method, checked)}
              language={language}
              allValues={{ allowedMethods }}
              showValidation={showValidation}
            />
          ))}
        </Box>
      </Box>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        {getLabel('limitersTip')}
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