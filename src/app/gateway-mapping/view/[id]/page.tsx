"use client";
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useRouter, useParams } from 'next/navigation';
import { LanguageContext } from '../../page';

// Gateway配置接口
interface GatewayConfig {
  id: string;
  domain: string;
  requestPathPattern: string;
  backendForwardPath: string;
  application: string;
  status: 'active' | 'inactive' | 'draft';
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  backends: Array<{
    hostname: string;
    port: number;
    protocol: string;
    enabled: boolean;
  }>;
  effectiveUrl: string;
  tags: string[];
  headers?: Array<{
    name: string;
    value: string;
    enabled: boolean;
  }>;
  cookies?: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
    enabled: boolean;
  }>;
  limiters?: Array<{
    type: 'rate' | 'concurrent' | 'bandwidth';
    value: number;
    unit: string;
    enabled: boolean;
  }>;
}

// 用户权限接口
interface UserPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function GatewayViewPage() {
  const router = useRouter();
  const params = useParams();
  const { lang } = useContext(LanguageContext) || { lang: 'en' };
  const [config, setConfig] = useState<GatewayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    canView: true,
    canEdit: true,
    canDelete: false,
    canCreate: true
  });

  useEffect(() => {
    loadConfig();
  }, [params.id]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gateway-configs/${params.id}`);
      const result = await response.json();
      
      if (result.success) {
        setConfig(result.data);
      } else {
        console.error('Failed to load config:', result.error);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    router.push(`/gateway-mapping/edit/${params.id}`);
  };

  const handleDelete = () => {
    // 实现删除逻辑
    router.push('/gateway-search');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return lang === 'zh' ? '生效' : 'Active';
      case 'inactive':
        return lang === 'zh' ? '未生效' : 'Inactive';
      case 'draft':
        return lang === 'zh' ? '草稿' : 'Draft';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!config) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {lang === 'zh' ? '配置未找到' : 'Configuration not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* 页面头部 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => router.push('/gateway-search')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight={700}>
            {lang === 'zh' ? '配置详情' : 'Configuration Details'}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            disabled={!userPermissions.canEdit}
          >
            {lang === 'zh' ? '编辑' : 'Edit'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={!userPermissions.canDelete}
          >
            {lang === 'zh' ? '删除' : 'Delete'}
          </Button>
        </Box>
      </Box>

      {/* 基本信息卡片 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {lang === 'zh' ? '基本信息' : 'Basic Information'}
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {lang === 'zh' ? '生效网址' : 'Effective URL'}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {config.effectiveUrl}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {lang === 'zh' ? '应用' : 'Application'}
                </Typography>
                <Typography variant="body1">
                  {config.application}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {lang === 'zh' ? '域名' : 'Domain'}
                </Typography>
                <Typography variant="body1">
                  {config.domain}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {lang === 'zh' ? '请求路径模式' : 'Request Path Pattern'}
                </Typography>
                <Typography variant="body1">
                  {config.requestPathPattern}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {lang === 'zh' ? '后端转发路径' : 'Backend Forward Path'}
                </Typography>
                <Typography variant="body1">
                  {config.backendForwardPath}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {lang === 'zh' ? '状态' : 'Status'}
                </Typography>
                <Chip
                  label={getStatusLabel(config.status)}
                  color={getStatusColor(config.status) as any}
                  icon={config.status === 'active' ? <CheckCircleIcon /> : 
                        config.status === 'inactive' ? <CancelIcon /> : <ScheduleIcon />}
                />
              </Box>
            </Box>
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>
              {lang === 'zh' ? '标签' : 'Tags'}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {config.tags.map((tag, index) => (
                <Chip key={index} label={tag} variant="outlined" />
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* 详细信息标签页 */}
      <Paper elevation={2}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={lang === 'zh' ? '后端服务器' : 'Backend Servers'} />
          <Tab label={lang === 'zh' ? '请求头' : 'Headers'} />
          <Tab label={lang === 'zh' ? 'Cookies' : 'Cookies'} />
          <Tab label={lang === 'zh' ? '限制器' : 'Limiters'} />
          <Tab label={lang === 'zh' ? '历史记录' : 'History'} />
        </Tabs>

        {/* 后端服务器标签页 */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>{lang === 'zh' ? '主机名' : 'Hostname'}</strong></TableCell>
                  <TableCell><strong>{lang === 'zh' ? '端口' : 'Port'}</strong></TableCell>
                  <TableCell><strong>{lang === 'zh' ? '协议' : 'Protocol'}</strong></TableCell>
                  <TableCell><strong>{lang === 'zh' ? '状态' : 'Status'}</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {config.backends.map((backend, index) => (
                  <TableRow key={index}>
                    <TableCell>{backend.hostname}</TableCell>
                    <TableCell>{backend.port}</TableCell>
                    <TableCell>{backend.protocol}</TableCell>
                    <TableCell>
                      <Chip
                        label={backend.enabled ? (lang === 'zh' ? '启用' : 'Enabled') : (lang === 'zh' ? '禁用' : 'Disabled')}
                        color={backend.enabled ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* 请求头标签页 */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>{lang === 'zh' ? '名称' : 'Name'}</strong></TableCell>
                  <TableCell><strong>{lang === 'zh' ? '值' : 'Value'}</strong></TableCell>
                  <TableCell><strong>{lang === 'zh' ? '状态' : 'Status'}</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {config.headers?.map((header, index) => (
                  <TableRow key={index}>
                    <TableCell>{header.name}</TableCell>
                    <TableCell>{header.value}</TableCell>
                    <TableCell>
                      <Chip
                        label={header.enabled ? (lang === 'zh' ? '启用' : 'Enabled') : (lang === 'zh' ? '禁用' : 'Disabled')}
                        color={header.enabled ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Cookies标签页 */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>{lang === 'zh' ? '名称' : 'Name'}</strong></TableCell>
                  <TableCell><strong>{lang === 'zh' ? '值' : 'Value'}</strong></TableCell>
                  <TableCell><strong>{lang === 'zh' ? '域名' : 'Domain'}</strong></TableCell>
                  <TableCell><strong>{lang === 'zh' ? '路径' : 'Path'}</strong></TableCell>
                  <TableCell><strong>{lang === 'zh' ? '状态' : 'Status'}</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {config.cookies?.map((cookie, index) => (
                  <TableRow key={index}>
                    <TableCell>{cookie.name}</TableCell>
                    <TableCell>{cookie.value}</TableCell>
                    <TableCell>{cookie.domain || '-'}</TableCell>
                    <TableCell>{cookie.path || '/'}</TableCell>
                    <TableCell>
                      <Chip
                        label={cookie.enabled ? (lang === 'zh' ? '启用' : 'Enabled') : (lang === 'zh' ? '禁用' : 'Disabled')}
                        color={cookie.enabled ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* 限制器标签页 */}
        <TabPanel value={tabValue} index={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>{lang === 'zh' ? '类型' : 'Type'}</strong></TableCell>
                  <TableCell><strong>{lang === 'zh' ? '值' : 'Value'}</strong></TableCell>
                  <TableCell><strong>{lang === 'zh' ? '单位' : 'Unit'}</strong></TableCell>
                  <TableCell><strong>{lang === 'zh' ? '状态' : 'Status'}</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {config.limiters?.map((limiter, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {limiter.type === 'rate' ? (lang === 'zh' ? '速率限制' : 'Rate Limit') :
                       limiter.type === 'concurrent' ? (lang === 'zh' ? '并发限制' : 'Concurrent Limit') :
                       (lang === 'zh' ? '带宽限制' : 'Bandwidth Limit')}
                    </TableCell>
                    <TableCell>{limiter.value}</TableCell>
                    <TableCell>{limiter.unit}</TableCell>
                    <TableCell>
                      <Chip
                        label={limiter.enabled ? (lang === 'zh' ? '启用' : 'Enabled') : (lang === 'zh' ? '禁用' : 'Disabled')}
                        color={limiter.enabled ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* 历史记录标签页 */}
        <TabPanel value={tabValue} index={4}>
          <List>
            <ListItem>
              <ListItemIcon>
                <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                  {config.updatedBy.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={lang === 'zh' ? `由 ${config.updatedBy} 修改` : `Modified by ${config.updatedBy}`}
                secondary={formatDate(config.updatedAt)}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                  {config.createdBy.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={lang === 'zh' ? `由 ${config.createdBy} 创建` : `Created by ${config.createdBy}`}
                secondary={formatDate(config.createdAt)}
              />
            </ListItem>
          </List>
        </TabPanel>
      </Paper>
    </Box>
  );
} 