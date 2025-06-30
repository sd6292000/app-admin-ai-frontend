"use client";
import { useState, useEffect } from "react";
import { 
  Box, 
  TextField, 
  Typography, 
  MenuItem, 
  Paper, 
  IconButton, 
  Divider, 
  Checkbox, 
  FormControlLabel,
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
import { useFormData, useFormConfig } from "../contexts/FormContext";

const protocols = [
  { label: "HTTP", value: "HTTP" },
  { label: "HTTPS", value: "HTTPS" },
];

const regions = [
  { label: "EU", value: "EU" },
  { label: "AS", value: "AS" },
  { label: "AM", value: "AM" },
];

const dataCenterOptions: Record<string, { label: string; value: string }[]> = {
  EU: [
    { label: "WK", value: "WK" },
    { label: "RH", value: "RH" },
  ],
  AS: [
    { label: "SDC", value: "SDC" },
    { label: "TDC", value: "TDC" },
  ],
  AM: [
    { label: "PSC", value: "PSC" },
  ],
};

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

function BackendForm({ idx, backend, handleChange }: { idx: number; backend: any; handleChange: (idx: number, field: string, value: any) => void }) {
  const [dnsCheckResult, setDnsCheckResult] = useState<DnsCheckResult>({ status: 'idle', message: '' });
  const [connectionTestResult, setConnectionTestResult] = useState<ConnectionTestResult>({ status: 'idle', message: '' });
  const [showDnsDetails, setShowDnsDetails] = useState(false);

  const handleRegionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(idx, "region", e.target.value);
  };

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
        return <InfoIcon color="action" fontSize="small" />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: DnsCheckStatus | 'idle' | 'testing' | 'success' | 'error') => {
    switch (status) {
      case 'checking':
      case 'testing':
        return 'info';
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 2, mb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={600}>
          后端服务器 #{idx + 1}
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="DNS检测">
            <IconButton
              size="small"
              onClick={() => checkDns(backend.hostname)}
              disabled={!backend.hostname}
            >
              <NetworkCheckIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="连接测试">
            <IconButton
              size="small"
              onClick={() => testConnection(backend.hostname, backend.port, backend.protocol)}
              disabled={!backend.hostname || !backend.port || !backend.protocol}
            >
              <CheckCircleIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box display="flex" gap={2} flexWrap="wrap">
        <TextField
          label="Hostname *"
          required
          value={backend.hostname || ""}
          onChange={e => handleChange(idx, "hostname", e.target.value)}
          sx={{ minWidth: 200, flex: 1 }}
        />
        <TextField
          label="Port *"
          required
          type="number"
          value={backend.port || ""}
          onChange={e => handleChange(idx, "port", e.target.value)}
          sx={{ width: 100 }}
        />
        <TextField
          select
          label="Protocol *"
          required
          value={backend.protocol || ""}
          onChange={e => handleChange(idx, "protocol", e.target.value)}
          sx={{ width: 120 }}
        >
          {protocols.map(protocol => (
            <MenuItem key={protocol.value} value={protocol.value}>
              {protocol.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Region"
          value={backend.region || ""}
          onChange={handleRegionChange}
          sx={{ width: 120 }}
        >
          {regions.map(region => (
            <MenuItem key={region.value} value={region.value}>
              {region.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Data Center"
          value={backend.dataCenter || ""}
          onChange={e => handleChange(idx, "dataCenter", e.target.value)}
          disabled={!backend.region}
          sx={{ width: 120 }}
        >
          {(dataCenterOptions[backend.region] || []).map(dc => (
            <MenuItem key={dc.value} value={dc.value}>
              {dc.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box display="flex" gap={2} mt={2} flexWrap="wrap">
        <FormControlLabel
          control={
            <Checkbox
              checked={backend.enabled !== false}
              onChange={e => handleChange(idx, "enabled", e.target.checked)}
            />
          }
          label="启用"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={backend.rewriteHost || false}
              onChange={e => handleChange(idx, "rewriteHost", e.target.checked)}
            />
          }
          label="重写Host"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={backend.webProxyEnabled || false}
              onChange={e => handleChange(idx, "webProxyEnabled", e.target.checked)}
            />
          }
          label="Web Proxy"
        />
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

export default function BackendsTab() {
  const { formData, setFormData } = useFormData();
  const formConfig = useFormConfig();
  const { labels, options, validation } = formConfig.backends || {};

  // 初始化backends数组
  const backends = formData.backends && formData.backends.length > 0 ? formData.backends : [{ hostname: "", port: "", protocol: "", region: "", dataCenter: "", enabled: true, rewriteHost: false, webProxyEnabled: false, proxyHost: "", proxyPort: "", proxyUsername: "", proxyPassword: "" }];

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
    setFormData((prev: any) => ({ ...prev, backends: [...backends, { hostname: "", port: "", protocol: "", region: "", dataCenter: "", enabled: true, rewriteHost: false, webProxyEnabled: false, proxyHost: "", proxyPort: "", proxyUsername: "", proxyPassword: "" }] }));
  };

  const handleRemove = (idx: number) => {
    const arr = [...backends];
    arr.splice(idx, 1);
    setFormData((prev: any) => ({ ...prev, backends: arr.length ? arr : [{ hostname: "", port: "", protocol: "", region: "", dataCenter: "", enabled: true, rewriteHost: false, webProxyEnabled: false, proxyHost: "", proxyPort: "", proxyUsername: "", proxyPassword: "" }] }));
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {labels?.title || "Backend Servers"}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      {backends.map((backend, idx) => (
        <Box key={idx}>
          <BackendForm
            idx={idx}
            backend={backend}
            handleChange={handleChange}
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
          {labels?.addBackend || "Add Backend Server"}
        </Button>
      </Box>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        {labels?.tip || "Configure one or more backend servers for load balancing."}
      </Alert>
    </Paper>
  );
} 