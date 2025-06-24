"use client";
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useRouter, useParams } from 'next/navigation';
import { LanguageContext } from '../../page';
import BasicTab from '../../components/BasicTab';
import BackendsTab from '../../components/BackendsTab';
import HeadersTab from '../../components/HeadersTab';
import CookiesTab from '../../components/CookiesTab';
import LimitersTab from '../../components/LimitersTab';
import ResponseBodyDecoratorTab from '../../components/ResponseBodyDecoratorTab';

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

export default function GatewayEditPage() {
  const router = useRouter();
  const params = useParams();
  const { lang } = useContext(LanguageContext) || { lang: 'en' };
  const [config, setConfig] = useState<GatewayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [unsavedChangesDialog, setUnsavedChangesDialog] = useState(false);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/gateway-configs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setHasChanges(false);
        // 保存成功后跳转到查看页面
        router.push(`/gateway-mapping/view/${params.id}`);
      } else {
        console.error('Failed to save config:', result.error);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      setUnsavedChangesDialog(true);
    } else {
      router.push(`/gateway-mapping/view/${params.id}`);
    }
  };

  const handleConfirmBack = () => {
    setUnsavedChangesDialog(false);
    router.push(`/gateway-mapping/view/${params.id}`);
  };

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
  };

  const handleConfigChange = () => {
    setHasChanges(true);
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

  const tabs = [
    { label: lang === 'zh' ? '基本信息' : 'Basic', component: BasicTab },
    { label: lang === 'zh' ? '后端服务器' : 'Backends', component: BackendsTab },
    { label: lang === 'zh' ? '请求头' : 'Headers', component: HeadersTab },
    { label: lang === 'zh' ? 'Cookies' : 'Cookies', component: CookiesTab },
    { label: lang === 'zh' ? '限制器' : 'Limiters', component: LimitersTab },
    { label: lang === 'zh' ? '响应体装饰器' : 'Response Body Decorator', component: ResponseBodyDecoratorTab }
  ];

  const ActiveTabComponent = tabs[activeTab].component;

  return (
    <Box sx={{ p: 3 }}>
      {/* 页面头部 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight={700}>
            {lang === 'zh' ? '编辑配置' : 'Edit Configuration'}
          </Typography>
          {hasChanges && (
            <Alert severity="warning" sx={{ ml: 2 }}>
              {lang === 'zh' ? '有未保存的更改' : 'Unsaved changes'}
            </Alert>
          )}
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            lang === 'zh' ? '保存' : 'Save'
          )}
        </Button>
      </Box>

      {/* 标签页导航 */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', overflowX: 'auto' }}>
            {tabs.map((tab, index) => (
              <Button
                key={index}
                onClick={() => handleTabChange(index)}
                sx={{
                  minWidth: 'auto',
                  px: 3,
                  py: 2,
                  borderRadius: 0,
                  borderBottom: activeTab === index ? 2 : 0,
                  borderColor: 'primary.main',
                  color: activeTab === index ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* 标签页内容 */}
      <Paper elevation={2}>
        <ActiveTabComponent />
      </Paper>

      {/* 未保存更改确认对话框 */}
      <Dialog open={unsavedChangesDialog} onClose={() => setUnsavedChangesDialog(false)}>
        <DialogTitle>
          {lang === 'zh' ? '未保存的更改' : 'Unsaved Changes'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {lang === 'zh' 
              ? '您有未保存的更改。确定要离开吗？' 
              : 'You have unsaved changes. Are you sure you want to leave?'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnsavedChangesDialog(false)}>
            {lang === 'zh' ? '取消' : 'Cancel'}
          </Button>
          <Button onClick={handleConfirmBack} color="primary">
            {lang === 'zh' ? '离开' : 'Leave'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 