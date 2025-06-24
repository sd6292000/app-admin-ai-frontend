"use client";
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Avatar,
  Divider
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useRouter } from 'next/navigation';
import { LanguageContext } from '../gateway-mapping/page';

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
}

// 用户权限接口
interface UserPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
}

export default function GatewaySearchPage() {
  const router = useRouter();
  const { lang } = useContext(LanguageContext) || { lang: 'en' };
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [applicationFilter, setApplicationFilter] = useState<string>('all');
  const [gatewayConfigs, setGatewayConfigs] = useState<GatewayConfig[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<GatewayConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    canView: true,
    canEdit: true,
    canDelete: false,
    canCreate: true
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<GatewayConfig | null>(null);

  // 加载数据
  useEffect(() => {
    loadGatewayConfigs();
  }, []);

  // 过滤数据
  useEffect(() => {
    filterConfigs();
  }, [gatewayConfigs, searchQuery, statusFilter, applicationFilter]);

  const loadGatewayConfigs = async () => {
    setLoading(true);
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (applicationFilter !== 'all') params.append('application', applicationFilter);
      
      const response = await fetch(`/api/gateway-configs?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setGatewayConfigs(result.data);
      } else {
        console.error('Failed to load configs:', result.error);
      }
    } catch (error) {
      console.error('Failed to load gateway configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterConfigs = () => {
    // 由于API已经处理了过滤，这里只需要设置过滤后的结果
    setFilteredConfigs(gatewayConfigs);
  };

  const handleView = (config: GatewayConfig) => {
    router.push(`/gateway-mapping/view/${config.id}`);
  };

  const handleEdit = (config: GatewayConfig) => {
    router.push(`/gateway-mapping/edit/${config.id}`);
  };

  const handleDelete = async (config: GatewayConfig) => {
    setConfigToDelete(config);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!configToDelete) return;

    try {
      const response = await fetch(`/api/gateway-configs/${configToDelete.id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 重新加载数据
        await loadGatewayConfigs();
        setDeleteDialogOpen(false);
        setConfigToDelete(null);
      } else {
        console.error('Failed to delete config:', result.error);
      }
    } catch (error) {
      console.error('Failed to delete gateway config:', error);
    }
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueApplications = () => {
    const applications = gatewayConfigs.map(config => config.application);
    return ['all', ...Array.from(new Set(applications))];
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 页面标题 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          {lang === 'zh' ? 'Gateway配置搜索' : 'Gateway Configuration Search'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/gateway-mapping')}
          disabled={!userPermissions.canCreate}
        >
          {lang === 'zh' ? '新建配置' : 'Create New'}
        </Button>
      </Box>

      {/* 搜索和过滤区域 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder={lang === 'zh' ? '搜索域名、路径、应用...' : 'Search domain, path, application...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>{lang === 'zh' ? '状态' : 'Status'}</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label={lang === 'zh' ? '状态' : 'Status'}
            >
              <MenuItem value="all">{lang === 'zh' ? '全部' : 'All'}</MenuItem>
              <MenuItem value="active">{lang === 'zh' ? '生效' : 'Active'}</MenuItem>
              <MenuItem value="inactive">{lang === 'zh' ? '未生效' : 'Inactive'}</MenuItem>
              <MenuItem value="draft">{lang === 'zh' ? '草稿' : 'Draft'}</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>{lang === 'zh' ? '应用' : 'Application'}</InputLabel>
            <Select
              value={applicationFilter}
              onChange={(e) => setApplicationFilter(e.target.value)}
              label={lang === 'zh' ? '应用' : 'Application'}
            >
              {getUniqueApplications().map(app => (
                <MenuItem key={app} value={app}>
                  {app === 'all' ? (lang === 'zh' ? '全部应用' : 'All Applications') : app}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton onClick={loadGatewayConfigs} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* 结果统计 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          {lang === 'zh' 
            ? `找到 ${filteredConfigs.length} 个配置` 
            : `Found ${filteredConfigs.length} configurations`
          }
        </Typography>
        {loading && <CircularProgress size={20} />}
      </Box>

      {/* 结果表格 */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell><strong>{lang === 'zh' ? '生效网址' : 'Effective URL'}</strong></TableCell>
              <TableCell><strong>{lang === 'zh' ? '应用' : 'Application'}</strong></TableCell>
              <TableCell><strong>{lang === 'zh' ? '状态' : 'Status'}</strong></TableCell>
              <TableCell><strong>{lang === 'zh' ? '后端服务器' : 'Backend Servers'}</strong></TableCell>
              <TableCell><strong>{lang === 'zh' ? '修改者' : 'Modified By'}</strong></TableCell>
              <TableCell><strong>{lang === 'zh' ? '修改时间' : 'Modified At'}</strong></TableCell>
              <TableCell><strong>{lang === 'zh' ? '操作' : 'Actions'}</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredConfigs.map((config) => (
              <TableRow key={config.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {config.effectiveUrl}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {config.domain} {config.requestPathPattern}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{config.application}</Typography>
                  <Box display="flex" gap={0.5} mt={0.5}>
                    {config.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(config.status)}
                    color={getStatusColor(config.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    {config.backends.map((backend, index) => (
                      <Typography key={index} variant="caption" display="block">
                        {backend.hostname}:{backend.port} ({backend.protocol})
                        {!backend.enabled && (
                          <Chip label="Disabled" size="small" color="error" sx={{ ml: 1 }} />
                        )}
                      </Typography>
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {config.updatedBy.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">{config.updatedBy}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{formatDate(config.updatedAt)}</Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title={lang === 'zh' ? '查看' : 'View'}>
                      <IconButton
                        size="small"
                        onClick={() => handleView(config)}
                        disabled={!userPermissions.canView}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={lang === 'zh' ? '编辑' : 'Edit'}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(config)}
                        disabled={!userPermissions.canEdit}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={lang === 'zh' ? '删除' : 'Delete'}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(config)}
                        disabled={!userPermissions.canDelete}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 空状态 */}
      {!loading && filteredConfigs.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {lang === 'zh' ? '未找到匹配的配置' : 'No configurations found'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lang === 'zh' 
              ? '尝试调整搜索条件或创建新的配置' 
              : 'Try adjusting your search criteria or create a new configuration'
            }
          </Typography>
        </Paper>
      )}

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          {lang === 'zh' ? '确认删除' : 'Confirm Delete'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {lang === 'zh' 
              ? `确定要删除配置 "${configToDelete?.effectiveUrl}" 吗？此操作不可撤销。`
              : `Are you sure you want to delete the configuration "${configToDelete?.effectiveUrl}"? This action cannot be undone.`
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {lang === 'zh' ? '取消' : 'Cancel'}
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            {lang === 'zh' ? '删除' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 