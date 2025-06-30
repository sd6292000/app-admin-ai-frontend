"use client";
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from "@mui/material";
import {
  History as HistoryIcon,
  Restore as RestoreIcon,
  Compare as CompareIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from "@mui/icons-material";
import { useFormConfig } from "../contexts/FormContext";

interface VersionInfo {
  id: string;
  version: string;
  description: string;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'draft';
  changes: string[];
  isCurrent: boolean;
  canRollback: boolean;
}

interface VersionManagementTabProps {
  formData?: any;
  onConfigChange?: () => void;
}

export default function VersionManagementTab({ formData = {}, onConfigChange }: VersionManagementTabProps) {
  const formConfig = useFormConfig();
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<VersionInfo | null>(null);
  const [compareDialog, setCompareDialog] = useState(false);
  const [rollbackDialog, setRollbackDialog] = useState(false);
  const [rollbackLoading, setRollbackLoading] = useState(false);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockVersions: VersionInfo[] = [
        {
          id: 'v1.0.3',
          version: '1.0.3',
          description: '修复DNS检测功能，优化后端服务器配置',
          createdBy: 'admin@company.com',
          createdAt: '2024-01-25T14:30:00Z',
          status: 'active',
          changes: ['修复DNS检测超时问题', '优化后端服务器健康检查', '更新CSP配置'],
          isCurrent: true,
          canRollback: false
        },
        {
          id: 'v1.0.2',
          version: '1.0.2',
          description: '添加IP限制功能，增强安全配置',
          createdBy: 'security@company.com',
          createdAt: '2024-01-20T10:15:00Z',
          status: 'inactive',
          changes: ['添加IP白名单功能', '配置WAF规则', '更新访问限制'],
          isCurrent: false,
          canRollback: true
        },
        {
          id: 'v1.0.1',
          version: '1.0.1',
          description: '初始版本，基础网关配置',
          createdBy: 'dev@company.com',
          createdAt: '2024-01-15T09:00:00Z',
          status: 'inactive',
          changes: ['创建基础网关配置', '配置域名映射', '设置后端服务器'],
          isCurrent: false,
          canRollback: true
        }
      ];
      
      setVersions(mockVersions);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = (version: VersionInfo) => {
    setSelectedVersion(version);
    setCompareDialog(true);
  };

  const handleRollback = (version: VersionInfo) => {
    setSelectedVersion(version);
    setRollbackDialog(true);
  };

  const confirmRollback = async () => {
    if (!selectedVersion) return;
    
    setRollbackLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Rolling back to version:', selectedVersion.version);
      
      // 这里应该调用实际的回滚API，并更新formData
      if (onConfigChange) {
        onConfigChange();
      }
      
      setRollbackDialog(false);
      setSelectedVersion(null);
      await loadVersions();
    } catch (error) {
      console.error('Failed to rollback:', error);
    } finally {
      setRollbackLoading(false);
    }
  };

  const exportVersion = (version: VersionInfo) => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gateway-config-${version.version}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon color="success" />;
      case 'inactive': return <InfoIcon color="action" />;
      case 'draft': return <WarningIcon color="warning" />;
      default: return <InfoIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={600}>
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          版本管理
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>版本</TableCell>
              <TableCell>描述</TableCell>
              <TableCell>创建者</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {versions.map((version) => (
              <TableRow key={version.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" fontWeight={600}>
                      {version.version}
                    </Typography>
                    {version.isCurrent && (
                      <Chip label="当前" size="small" color="primary" sx={{ ml: 1 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {version.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">{version.createdBy}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <ScheduleIcon sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">{formatDate(version.createdAt)}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {getStatusIcon(version.status)}
                    <Chip
                      label={version.status === 'active' ? '生效' : version.status === 'inactive' ? '未生效' : '草稿'}
                      size="small"
                      color={getStatusColor(version.status) as any}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="版本对比">
                      <IconButton
                        size="small"
                        onClick={() => handleCompare(version)}
                        disabled={version.isCurrent}
                      >
                        <CompareIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="回滚到此版本">
                      <IconButton
                        size="small"
                        onClick={() => handleRollback(version)}
                        disabled={!version.canRollback}
                        color="warning"
                      >
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="导出配置">
                      <IconButton
                        size="small"
                        onClick={() => exportVersion(version)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={compareDialog} onClose={() => setCompareDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <CompareIcon sx={{ mr: 1 }} />
            版本对比 - {selectedVersion?.version}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    版本 {selectedVersion?.version}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedVersion?.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    当前版本
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    正在编辑的配置
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            变更详情
          </Typography>
          
          <List>
            {selectedVersion?.changes.map((change, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={change} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialog(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rollbackDialog} onClose={() => setRollbackDialog(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <RestoreIcon sx={{ mr: 1 }} />
            确认回滚
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            回滚操作将覆盖当前配置，此操作不可撤销。
          </Alert>
          <Typography>
            确定要回滚到版本 <strong>{selectedVersion?.version}</strong> 吗？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedVersion?.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRollbackDialog(false)}>取消</Button>
          <Button
            onClick={confirmRollback}
            color="warning"
            variant="contained"
            disabled={rollbackLoading}
          >
            {rollbackLoading ? '回滚中...' : '确认回滚'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 