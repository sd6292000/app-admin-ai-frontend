"use client";
import { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Divider, 
  Button,
  Alert,
  Chip,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import InfoIcon from '@mui/icons-material/Info';
import { useLanguage } from "../../../contexts/LanguageContext";
import { useLocalizedText } from "../../../contexts/LanguageContext";
import FormField from "../../../components/FormField";
import { getFormConfig, validateForm, FieldConfig } from "../../../lib/i18n";

// DNS检测状态类型
type DnsCheckStatus = 'idle' | 'checking' | 'success' | 'error' | 'warning';

// DNS检测结果接口
interface DnsCheckResult {
  status: DnsCheckStatus;
  message: string;
  ipAddresses?: string[];
  responseTime?: number;
  error?: string;
}

// 连接测试结果接口
interface ConnectionTestResult {
  status: 'idle' | 'testing' | 'success' | 'error';
  message: string;
  responseTime?: number;
  error?: string;
}

// 后端服务器接口
interface Backend {
  hostname: string;
  port: string;
  protocol: string;
  region: string;
  dataCenter: string;
  enabled: boolean;
  rewriteHost?: boolean;
  webProxyEnabled?: boolean;
  proxyHost?: string;
  proxyPort?: string;
  proxyUsername?: string;
  proxyPassword?: string;
}

// 组件接口
interface BackendsTabProps {
  formData: {
    backends: Backend[];
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  showValidation?: boolean;
}

function BackendForm({ 
  idx, 
  backend, 
  handleChange, 
  formConfig,
  language,
  showValidation 
}: { 
  idx: number; 
  backend: Backend; 
  handleChange: (idx: number, field: string, value: any) => void;
  formConfig: any;
  language: string;
  showValidation: boolean;
}) {
  const [dnsCheckResult, setDnsCheckResult] = useState<DnsCheckResult>({ status: 'idle', message: '' });
  const [connectionTestResult, setConnectionTestResult] = useState<ConnectionTestResult>({ status: 'idle', message: '' });
  const [showDnsDetails, setShowDnsDetails] = useState(false);

  // DNS检测函数
  const checkDns = async (hostname: string) => {
    if (!hostname.trim()) {
      setDnsCheckResult({ status: 'idle', message: '' });
      return;
    }

    setDnsCheckResult({ status: 'checking', message: '正在检测DNS解析...' });

    try {
      const response = await fetch('/api/dns-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname: hostname.trim() })
      });

      const result = await response.json();

      if (response.ok) {
        if (result.ipAddresses && result.ipAddresses.length > 0) {
          setDnsCheckResult({
            status: 'success',
            message: `DNS解析成功，找到 ${result.ipAddresses.length} 个IP地址`,
            ipAddresses: result.ipAddresses,
            responseTime: result.responseTime
          });
        } else {
          setDnsCheckResult({
            status: 'warning',
            message: 'DNS解析成功，但未找到IP地址',
            responseTime: result.responseTime
          });
        }
      } else {
        setDnsCheckResult({
          status: 'error',
          message: result.error || 'DNS解析失败',
          error: result.error
        });
      }
    } catch (error) {
      setDnsCheckResult({
        status: 'error',
        message: 'DNS检测请求失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  // 连接测试函数
  const testConnection = async (hostname: string, port: string, protocol: string) => {
    if (!hostname.trim() || !port.trim() || !protocol) {
      setConnectionTestResult({ status: 'idle', message: '' });
      return;
    }

    setConnectionTestResult({ status: 'testing', message: '正在测试连接...' });

    try {
      const response = await fetch('/api/connection-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hostname: hostname.trim(), 
          port: parseInt(port), 
          protocol: protocol.toLowerCase() 
        })
      });

      const result = await response.json();

      if (response.ok) {
        setConnectionTestResult({
          status: 'success',
          message: `连接成功，响应时间: ${result.responseTime}ms`,
          responseTime: result.responseTime
        });
      } else {
        setConnectionTestResult({
          status: 'error',
          message: result.error || '连接测试失败',
          error: result.error
        });
      }
    } catch (error) {
      setConnectionTestResult({
        status: 'error',
        message: '连接测试请求失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  // 当hostname改变时自动检测DNS
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (backend.hostname && backend.hostname.trim()) {
        checkDns(backend.hostname);
      } else {
        setDnsCheckResult({ status: 'idle', message: '' });
      }
    }, 1000); // 延迟1秒检测，避免频繁请求

    return () => clearTimeout(timeoutId);
  }, [backend.hostname]);

  // 获取状态图标
  const getStatusIcon = (status: DnsCheckStatus | 'idle' | 'testing' | 'success' | 'error') => {
    switch (status) {
      case 'checking':
      case 'testing':
        return <CircularProgress size={16} />;
      case 'success':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />;
      case 'warning':
        return <WarningIcon color="warning" fontSize="small" />;
      default:
        return <InfoIcon color="info" fontSize="small" />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: DnsCheckStatus | 'idle' | 'testing' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'checking':
      case 'testing':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, flexWrap: 'wrap' }}>
        {/* 使用FormField组件渲染字段 */}
        {formConfig?.fields?.map((field: FieldConfig) => (
          <FormField
            key={field.key}
            field={field}
            value={backend[field.key as keyof Backend] || ''}
            onChange={(value) => handleChange(idx, field.key, value)}
            language={language}
            allValues={backend}
            showValidation={showValidation}
          />
        ))}
      </Box>

      {/* DNS检测结果 */}
      {dnsCheckResult.status !== 'idle' && (
        <Box mt={2}>
          <Chip
            icon={getStatusIcon(dnsCheckResult.status)}
            label={dnsCheckResult.message}
            color={getStatusColor(dnsCheckResult.status) as any}
            variant="outlined"
            onClick={() => setShowDnsDetails(true)}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      )}

      {/* 连接测试结果 */}
      {connectionTestResult.status !== 'idle' && (
        <Box mt={1}>
          <Chip
            icon={getStatusIcon(connectionTestResult.status)}
            label={connectionTestResult.message}
            color={getStatusColor(connectionTestResult.status) as any}
            variant="outlined"
          />
        </Box>
      )}

      {/* DNS详情对话框 */}
      <Dialog open={showDnsDetails} onClose={() => setShowDnsDetails(false)}>
        <DialogTitle>DNS检测详情</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            主机名: {backend.hostname}
          </Typography>
          {dnsCheckResult.ipAddresses && dnsCheckResult.ipAddresses.length > 0 && (
            <Box>
              <Typography variant="body2" gutterBottom>
                解析到的IP地址:
              </Typography>
              {dnsCheckResult.ipAddresses.map((ip, index) => (
                <Typography key={index} variant="body2" color="text.secondary">
                  {ip}
                </Typography>
              ))}
            </Box>
          )}
          {dnsCheckResult.responseTime && (
            <Typography variant="body2" color="text.secondary">
              响应时间: {dnsCheckResult.responseTime}ms
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDnsDetails(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function BackendsTab({ formData, setFormData, showValidation = false }: BackendsTabProps) {
  const { getLabel, getMessage } = useLocalizedText();
  const { language, metaInfo } = useLanguage();
  
  // 获取表单配置
  const formConfig = metaInfo ? getFormConfig(metaInfo, 'gateway-mapping', 'backends') : null;

  // 初始化backends数组
  const backends = formData.backends && formData.backends.length > 0 
    ? formData.backends 
    : [{ 
        hostname: "", 
        port: "", 
        protocol: "", 
        region: "", 
        dataCenter: "", 
        enabled: true, 
        rewriteHost: false, 
        webProxyEnabled: false, 
        proxyHost: "", 
        proxyPort: "", 
        proxyUsername: "", 
        proxyPassword: "" 
      }];

  const handleChange = (idx: number, field: string, value: any) => {
    const arr = [...backends];
    arr[idx][field] = value;
    if (field === "region") arr[idx]["dataCenter"] = "";
    if (field === "webProxyEnabled" && !value) {
      arr[idx].proxyHost = "";
      arr[idx].proxyPort = "";
      arr[idx].proxyUsername = "";
      arr[idx].proxyPassword = "";
    }
    setFormData((prev: any) => ({ ...prev, backends: arr }));
  };

  const handleAdd = () => {
    setFormData((prev: any) => ({ 
      ...prev, 
      backends: [...backends, { 
        hostname: "", 
        port: "", 
        protocol: "", 
        region: "", 
        dataCenter: "", 
        enabled: true, 
        rewriteHost: false, 
        webProxyEnabled: false, 
        proxyHost: "", 
        proxyPort: "", 
        proxyUsername: "", 
        proxyPassword: "" 
      }] 
    }));
  };

  const handleRemove = (idx: number) => {
    const arr = [...backends];
    arr.splice(idx, 1);
    setFormData((prev: any) => ({ 
      ...prev, 
      backends: arr.length ? arr : [{ 
        hostname: "", 
        port: "", 
        protocol: "", 
        region: "", 
        dataCenter: "", 
        enabled: true, 
        rewriteHost: false, 
        webProxyEnabled: false, 
        proxyHost: "", 
        proxyPort: "", 
        proxyUsername: "", 
        proxyPassword: "" 
      }] 
    }));
  };

  // 验证表单
  const validationErrors: string[] = [];
  if (showValidation && formConfig) {
    backends.forEach((backend, index) => {
      const errors = validateForm(formConfig, backend, language);
      validationErrors.push(...errors.map(error => `后端服务器 ${index + 1}: ${error.message}`));
    });
  }

  if (!formConfig) {
    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {getLabel('backends')}
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
        {getLabel('backends')}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {backends.map((backend, idx) => (
        <Box key={idx}>
          <BackendForm
            idx={idx}
            backend={backend}
            handleChange={handleChange}
            formConfig={formConfig}
            language={language}
            showValidation={showValidation}
          />
          {backends.length > 1 && (
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <IconButton
                color="error"
                onClick={() => handleRemove(idx)}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      ))}
      
      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          variant="outlined"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAdd}
        >
          {getLabel('addBackend')}
        </Button>
      </Box>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        {getLabel('backendsTip')}
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