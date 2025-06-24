import { useState, useContext } from "react";
import { 
  Box, 
  TextField, 
  Typography, 
  Checkbox, 
  FormControlLabel, 
  Paper, 
  Divider, 
  IconButton, 
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  Button
} from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SecurityIcon from '@mui/icons-material/Security';
import { useFormData, FormConfigContext } from "../page";

// CSP策略预设
const CSP_PRESETS = {
  strict: "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; upgrade-insecure-requests;",
  moderate: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
  relaxed: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
  custom: ""
};

// CSP指令选项
const CSP_DIRECTIVES = [
  { value: "default-src", label: "default-src", description: "默认资源加载策略" },
  { value: "script-src", label: "script-src", description: "JavaScript脚本加载策略" },
  { value: "style-src", label: "style-src", description: "CSS样式加载策略" },
  { value: "img-src", label: "img-src", description: "图片资源加载策略" },
  { value: "font-src", label: "font-src", description: "字体资源加载策略" },
  { value: "connect-src", label: "connect-src", description: "网络连接策略" },
  { value: "media-src", label: "media-src", description: "媒体资源加载策略" },
  { value: "object-src", label: "object-src", description: "插件资源加载策略" },
  { value: "frame-src", label: "frame-src", description: "框架加载策略" },
  { value: "worker-src", label: "worker-src", description: "Worker脚本加载策略" },
  { value: "manifest-src", label: "manifest-src", description: "应用清单加载策略" },
  { value: "base-uri", label: "base-uri", description: "基础URI策略" },
  { value: "form-action", label: "form-action", description: "表单提交目标策略" },
  { value: "frame-ancestors", label: "frame-ancestors", description: "框架嵌入策略" },
  { value: "upgrade-insecure-requests", label: "upgrade-insecure-requests", description: "升级不安全请求" },
  { value: "block-all-mixed-content", label: "block-all-mixed-content", description: "阻止混合内容" }
];

// CSP值选项
const CSP_VALUES = [
  { value: "'self'", label: "'self'", description: "同源" },
  { value: "'unsafe-inline'", label: "'unsafe-inline'", description: "允许内联脚本/样式" },
  { value: "'unsafe-eval'", label: "'unsafe-eval'", description: "允许eval()等动态代码" },
  { value: "'none'", label: "'none'", description: "禁止所有" },
  { value: "data:", label: "data:", description: "允许data URI" },
  { value: "https:", label: "https:", description: "允许HTTPS" },
  { value: "http:", label: "http:", description: "允许HTTP" },
  { value: "*", label: "*", description: "允许所有" }
];

export default function HeadersTab() {
  const { formData, setFormData } = useFormData();
  const formConfig = useContext(FormConfigContext);
  if (!formConfig) return null;
  const { labels } = formConfig.headers || {};

  // 初始化
  const requestHeaders = formData.headers?.request || [{ name: "", value: "", override: false }];
  const responseHeaders = formData.headers?.response || [{ name: "", value: "", override: false }];
  
  // CSP配置状态
  const [cspEnabled, setCspEnabled] = useState(false);
  const [cspPreset, setCspPreset] = useState("moderate");
  const [cspCustomValue, setCspCustomValue] = useState("");
  const [cspDirectives, setCspDirectives] = useState<{[key: string]: string[]}>({
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https:"],
    "font-src": ["'self'", "data:"]
  });

  const handleHeaderChange = (type: "request" | "response", idx: number, field: "name" | "value" | "override", value: any) => {
    const headers = type === "request" ? [...requestHeaders] : [...responseHeaders];
    headers[idx][field] = value;
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

  // CSP相关处理函数
  const handleCspPresetChange = (preset: string) => {
    setCspPreset(preset);
    if (preset === "custom") {
      setCspCustomValue("");
    } else {
      setCspCustomValue(CSP_PRESETS[preset as keyof typeof CSP_PRESETS]);
    }
  };

  const handleCspDirectiveChange = (directive: string, values: string[]) => {
    setCspDirectives(prev => ({
      ...prev,
      [directive]: values
    }));
  };

  const generateCspValue = () => {
    if (cspPreset === "custom") {
      return cspCustomValue;
    }
    
    const directives = Object.entries(cspDirectives)
      .filter(([_, values]) => values.length > 0)
      .map(([directive, values]) => `${directive} ${values.join(' ')}`)
      .join('; ');
    
    return directives;
  };

  const addCspHeader = () => {
    const cspValue = generateCspValue();
    if (!cspValue.trim()) return;

    // 检查是否已存在CSP header
    const existingCspIndex = responseHeaders.findIndex(h => 
      h.name.toLowerCase() === 'content-security-policy'
    );

    if (existingCspIndex >= 0) {
      // 更新现有的CSP header
      handleHeaderChange("response", existingCspIndex, "value", cspValue);
    } else {
      // 添加新的CSP header
      setFormData((prev: any) => ({
        ...prev,
        headers: {
          ...prev.headers,
          response: [...responseHeaders, { 
            name: "Content-Security-Policy", 
            value: cspValue, 
            override: true 
          }]
        }
      }));
    }
  };

  function HeaderForm({ type, idx, header, onChange, onRemove, showRemove }: {
    type: "request" | "response";
    idx: number;
    header: { name: string; value: string; override: boolean };
    onChange: (field: "name" | "value" | "override", value: any) => void;
    onRemove: () => void;
    showRemove: boolean;
  }) {
    return (
      <Box display="flex" gap={2} alignItems="center" mb={1} p={1} bgcolor="grey.50" borderRadius={1}>
        <TextField
          label={labels?.name || "Name"}
          required
          value={header.name}
          onChange={e => onChange("name", e.target.value)}
        />
        <TextField
          label={labels?.value || "Value"}
          required
          value={header.value}
          onChange={e => onChange("value", e.target.value)}
          multiline
          rows={2}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={header.override}
              onChange={e => onChange("override", e.target.checked)}
            />
          }
          label={labels?.override || "Override"}
        />
        {showRemove && (
          <IconButton color="error" onClick={onRemove}><RemoveCircleOutlineIcon /></IconButton>
        )}
      </Box>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>Headers</Typography>
      <Divider sx={{ mb: 2 }} />
      
      {/* CSP配置区域 */}
      <Accordion defaultExpanded sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <SecurityIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Content Security Policy (CSP) 配置
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={cspEnabled}
                  onChange={(e) => setCspEnabled(e.target.checked)}
                />
              }
              label="启用CSP配置"
            />
          </Box>
          
          {cspEnabled && (
            <Box>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>CSP策略预设</InputLabel>
                <Select
                  value={cspPreset}
                  onChange={(e) => handleCspPresetChange(e.target.value)}
                  label="CSP策略预设"
                >
                  <MenuItem value="strict">严格模式 (Strict)</MenuItem>
                  <MenuItem value="moderate">中等模式 (Moderate)</MenuItem>
                  <MenuItem value="relaxed">宽松模式 (Relaxed)</MenuItem>
                  <MenuItem value="custom">自定义 (Custom)</MenuItem>
                </Select>
              </FormControl>

              {cspPreset === "custom" ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="自定义CSP策略"
                  value={cspCustomValue}
                  onChange={(e) => setCspCustomValue(e.target.value)}
                  placeholder="例如: default-src 'self'; script-src 'self' 'unsafe-inline';"
                  helperText="请输入完整的CSP策略字符串"
                  sx={{ mb: 2 }}
                />
              ) : (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>CSP指令配置</Typography>
                  {Object.entries(cspDirectives).map(([directive, values]) => (
                    <Box key={directive} sx={{ mb: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>{directive}</InputLabel>
                        <Select
                          multiple
                          value={values}
                          onChange={(e: SelectChangeEvent<string[]>) => 
                            handleCspDirectiveChange(directive, e.target.value as string[])
                          }
                          input={<OutlinedInput label={directive} />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          {CSP_VALUES.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label} - {option.description}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  ))}
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>生成的CSP策略:</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={generateCspValue()}
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 1 }}
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={addCspHeader}
                  disabled={!generateCspValue().trim()}
                >
                  添加到Response Headers
                </Button>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                CSP (Content Security Policy) 是一种安全策略，用于防止XSS攻击和其他代码注入攻击。
                建议根据应用需求选择合适的策略级别。
              </Alert>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Typography variant="subtitle2">{labels?.request || "Request Headers"}</Typography>
      {requestHeaders.map((header, idx) => (
        <HeaderForm
          key={idx}
          type="request"
          idx={idx}
          header={header}
          onChange={(field, value) => handleHeaderChange("request", idx, field, value)}
          onRemove={() => handleRemoveHeader("request", idx)}
          showRemove={requestHeaders.length > 1}
        />
      ))}
      <Box display="flex" justifyContent="flex-end">
        <IconButton color="primary" onClick={() => handleAddHeader("request") }><AddCircleOutlineIcon /></IconButton>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2">{labels?.response || "Response Headers"}</Typography>
      {responseHeaders.map((header, idx) => (
        <HeaderForm
          key={idx}
          type="response"
          idx={idx}
          header={header}
          onChange={(field, value) => handleHeaderChange("response", idx, field, value)}
          onRemove={() => handleRemoveHeader("response", idx)}
          showRemove={responseHeaders.length > 1}
        />
      ))}
      <Box display="flex" justifyContent="flex-end">
        <IconButton color="primary" onClick={() => handleAddHeader("response") }><AddCircleOutlineIcon /></IconButton>
      </Box>
      <Alert severity="info" sx={{ mt: 2 }}>{labels?.addRequest || "You can add/remove request and response headers."}</Alert>
    </Paper>
  );
} 