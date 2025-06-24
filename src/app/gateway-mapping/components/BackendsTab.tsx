import { useState, useContext, useEffect } from "react";
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
import { useFormData, FormConfigContext } from "../page";

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
        return undefined;
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
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Hostname with DNS detection */}
      <Box sx={{ mb: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <TextField 
            label="Hostname" 
            fullWidth 
            required 
            value={backend.hostname} 
            onChange={e => handleChange(idx, "hostname", e.target.value)}
            error={dnsCheckResult.status === 'error'}
            helperText={dnsCheckResult.message || "输入服务器主机名"}
          />
          <Tooltip title="检测DNS解析">
            <IconButton 
              onClick={() => checkDns(backend.hostname)}
              disabled={!backend.hostname.trim() || dnsCheckResult.status === 'checking'}
              color="primary"
            >
              <NetworkCheckIcon />
            </IconButton>
          </Tooltip>
          {dnsCheckResult.status !== 'idle' && (
            <Chip
              icon={getStatusIcon(dnsCheckResult.status)}
              label={dnsCheckResult.status === 'checking' ? '检测中' : 
                     dnsCheckResult.status === 'success' ? 'DNS正常' :
                     dnsCheckResult.status === 'warning' ? 'DNS警告' : 'DNS错误'}
              color={getStatusColor(dnsCheckResult.status) as any}
              size="small"
              onClick={() => setShowDnsDetails(true)}
              sx={{ cursor: 'pointer' }}
            />
          )}
        </Box>
      </Box>

      {/* Port and Protocol */}
      <Box display="flex" gap={2} sx={{ mb: 2 }}>
        <Box flex={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField 
              label="Port" 
              type="number" 
              fullWidth 
              required 
              inputProps={{ min: 0, max: 65535 }}
              helperText="0-65535"
              value={backend.port}
              onChange={e => handleChange(idx, "port", e.target.value)}
            />
            <Tooltip title="测试连接">
              <IconButton 
                onClick={() => testConnection(backend.hostname, backend.port, backend.protocol)}
                disabled={!backend.hostname.trim() || !backend.port.trim() || !backend.protocol || connectionTestResult.status === 'testing'}
                color="primary"
              >
                <NetworkCheckIcon />
              </IconButton>
            </Tooltip>
            {connectionTestResult.status !== 'idle' && (
              <Chip
                icon={getStatusIcon(connectionTestResult.status)}
                label={connectionTestResult.status === 'testing' ? '测试中' : 
                       connectionTestResult.status === 'success' ? '连接正常' : '连接失败'}
                color={getStatusColor(connectionTestResult.status) as any}
                size="small"
              />
            )}
          </Box>
        </Box>
        <Box flex={1}>
          <TextField select label="Protocol" fullWidth required value={backend.protocol} onChange={e => handleChange(idx, "protocol", e.target.value)}>
            {protocols.map((item) => (
              <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Region and Data Center */}
      <Box display="flex" gap={2} sx={{ mb: 2 }}>
        <Box flex={1}>
          <TextField select label="Region" fullWidth required value={backend.region} onChange={handleRegionChange}>
            {regions.map((item) => (
              <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
            ))}
          </TextField>
        </Box>
        <Box flex={1}>
          <TextField select label="Data Center" fullWidth required value={backend.dataCenter} onChange={e => handleChange(idx, "dataCenter", e.target.value)}>
            {(dataCenterOptions[backend.region] || []).map((item) => (
              <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* DNS检测详情对话框 */}
      <Dialog open={showDnsDetails} onClose={() => setShowDnsDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <NetworkCheckIcon color="primary" />
            DNS检测详情
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box>
            <Typography variant="subtitle2" gutterBottom>检测结果:</Typography>
            <Alert severity={dnsCheckResult.status === 'success' ? 'success' : 
                           dnsCheckResult.status === 'warning' ? 'warning' : 'error'} sx={{ mb: 2 }}>
              {dnsCheckResult.message}
            </Alert>
            
            {dnsCheckResult.ipAddresses && dnsCheckResult.ipAddresses.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>解析到的IP地址:</Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {dnsCheckResult.ipAddresses.map((ip, index) => (
                    <Chip key={index} label={ip} variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}
            
            {dnsCheckResult.responseTime && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>响应时间:</Typography>
                <Typography>{dnsCheckResult.responseTime}ms</Typography>
              </Box>
            )}
            
            {dnsCheckResult.error && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>错误详情:</Typography>
                <Typography color="error">{dnsCheckResult.error}</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDnsDetails(false)}>关闭</Button>
          <Button onClick={() => {
            checkDns(backend.hostname);
            setShowDnsDetails(false);
          }} variant="contained">重新检测</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function BackendsTab() {
  const { formData, setFormData } = useFormData();
  const formConfig = useContext(FormConfigContext);
  if (!formConfig) return null;
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
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <InfoIcon />
          <Typography variant="body2">
            系统会自动检测hostname的DNS解析状态，您也可以手动点击检测按钮进行DNS检测和连接测试。
          </Typography>
        </Box>
      </Alert>

      {backends.map((backend, idx) => (
        <Paper key={idx} elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4, position: 'relative' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={700}>Backend #{idx + 1}</Typography>
            {backends.length > 1 && (
              <IconButton color="error" onClick={() => handleRemove(idx)} sx={{ position: 'absolute', top: 12, right: 12 }}>
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>基本信息</Typography>
          <BackendForm idx={idx} backend={backend} handleChange={handleChange} />
          <Box mt={3} mb={2}>
            <FormControlLabel
              control={<Checkbox checked={!!backend.enabled} onChange={e => handleChange(idx, "enabled", e.target.checked)} />}
              label={<Typography fontWeight={600}>Enable</Typography>}
              sx={{ mr: 4 }}
            />
            <FormControlLabel
              control={<Checkbox checked={!!backend.rewriteHost} onChange={e => handleChange(idx, "rewriteHost", e.target.checked)} />}
              label={<Typography fontWeight={600}>Rewrite Host</Typography>}
            />
          </Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>代理设置</Typography>
          <Box bgcolor="grey.100" p={3} borderRadius={2} mb={2}>
            <FormControlLabel
              control={<Checkbox checked={!!backend.webProxyEnabled} onChange={e => handleChange(idx, "webProxyEnabled", e.target.checked)} />}
              label={<Typography fontWeight={600}>Enable Web Proxy</Typography>}
            />
            {backend.webProxyEnabled && (
              <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
                <TextField label="Proxy Host" sx={{ flex: 1, minWidth: 200 }} value={backend.proxyHost} onChange={e => handleChange(idx, "proxyHost", e.target.value)} />
                <TextField label="Proxy Port" type="number" sx={{ flex: 1, minWidth: 200 }} value={backend.proxyPort} onChange={e => handleChange(idx, "proxyPort", e.target.value)} />
                <TextField label="Proxy Username" sx={{ flex: 1, minWidth: 200 }} value={backend.proxyUsername} onChange={e => handleChange(idx, "proxyUsername", e.target.value)} />
                <TextField label="Proxy Password" type="password" sx={{ flex: 1, minWidth: 200 }} value={backend.proxyPassword} onChange={e => handleChange(idx, "proxyPassword", e.target.value)} />
              </Box>
            )}
          </Box>
        </Paper>
      ))}
      <Box display="flex" justifyContent="flex-end">
        <IconButton color="primary" onClick={handleAdd} sx={{ fontSize: 32 }}><AddCircleOutlineIcon fontSize="inherit" /></IconButton>
      </Box>
    </Box>
  );
} 