"use client";
import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, Typography, Paper, AppBar, Toolbar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Card, Divider, IconButton, CircularProgress, Alert } from "@mui/material";
import BasicTab from "./components/BasicTab";
import BackendsTab from "./components/BackendsTab";
import CookiesTab from "./components/CookiesTab";
import HeadersTab from "./components/HeadersTab";
import ResponseBodyDecoratorTab from "./components/ResponseBodyDecoratorTab";
import LimitersTab from "./components/LimitersTab";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import CookieIcon from '@mui/icons-material/Cookie';
import HttpIcon from '@mui/icons-material/Http';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SecurityIcon from '@mui/icons-material/Security';
import { useLanguage, useLocalizedText } from "../../contexts/LanguageContext";
import { getPageConfig, getFormConfig, validateForm } from "../../lib/i18n";

// 表单数据类型
interface FormDataType {
  basic: {
    domain: string;
    requestPathPattern: string;
    backendForwardPath: string;
    cmdbProject: string;
  };
  backends: Array<{
    hostname: string;
    port: number;
    protocol: string;
    region: string;
    dataCenter: string;
    enabled: boolean;
  }>;
  cookies: {
    globalStrategy: string;
    exceptions: Array<{
      name: string;
      strategy: string;
    }>;
  };
  headers: {
    request: Array<{ name: string; value: string; override: boolean }>;
    response: Array<{ name: string; value: string; override: boolean }>;
  };
  responseBodyDecorator: Array<{
    statusCode: string;
    pagePath: string;
  }>;
  limiters: {
    ipRules: Array<{ value: string; mode: string }>;
    maxConcurrent: string;
    maxPerMinute: string;
    allowedMethods: string[];
  };
  cache: {
    enabled: boolean;
    cacheControl: string;
    maxAgeSeconds: number;
    etagEnabled: boolean;
    staleWhileRevalidateSeconds: number;
    staleIfErrorSeconds: number;
  };
}

// 提交状态类型
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

// 主组件
function GatewayMappingPage() {
  const { language, metaInfo, loading: metaLoading } = useLanguage();
  const { getLabel, getMessage } = useLocalizedText();
  
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState<FormDataType>({
    basic: {
      domain: '',
      requestPathPattern: '',
      backendForwardPath: '',
      cmdbProject: ''
    },
    backends: [],
    cookies: {
      globalStrategy: 'passthrough',
      exceptions: []
    },
    headers: {
      request: [],
      response: []
    },
    responseBodyDecorator: [],
    limiters: {
      ipRules: [],
      maxConcurrent: '',
      maxPerMinute: '',
      allowedMethods: []
    },
    cache: {
      enabled: false,
      cacheControl: '',
      maxAgeSeconds: 3600,
      etagEnabled: true,
      staleWhileRevalidateSeconds: 0,
      staleIfErrorSeconds: 0
    }
  });
  
  const [openDialog, setOpenDialog] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 获取页面配置
  const pageConfig = metaInfo ? getPageConfig(metaInfo, 'gateway-mapping') : null;

  // 处理标签页变化
  function handleTabChange(_: React.SyntheticEvent, newValue: number) {
    setTab(newValue);
  }

  // 提交按钮点击
  function handleSubmit() {
    setOpenDialog(true);
  }

  // 确认提交
  async function handleConfirm() {
    setOpenDialog(false);
    setSubmitStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch("/api/gateway-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
      } else {
        const errorText = await response.text();
        setErrorMessage(errorText);
        setSubmitStatus('error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(message);
      setSubmitStatus('error');
    }
  }

  // 关闭结果对话框
  function handleCloseResult() {
    setSubmitStatus('idle');
    setErrorMessage('');
  }

  // 关闭确认对话框
  function handleCloseConfirm() {
    setOpenDialog(false);
  }

  // 标签页配置
  const tabConfig = [
    { label: getLabel('basic'), icon: <AssignmentIcon fontSize="small" /> },
    { label: getLabel('backends'), icon: <SettingsEthernetIcon fontSize="small" /> },
    { label: getLabel('cookies'), icon: <CookieIcon fontSize="small" /> },
    { label: getLabel('headers'), icon: <HttpIcon fontSize="small" /> },
    { label: getLabel('responseBodyDecorator'), icon: <ErrorOutlineIcon fontSize="small" /> },
    { label: getLabel('limiters'), icon: <SecurityIcon fontSize="small" /> },
  ];

  if (metaLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 顶部工具栏 */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {getLabel('gatewayMapping')}
          </Typography>
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>

      {/* 主要内容 */}
      <Box sx={{ p: 3 }}>
        <Paper elevation={1} sx={{ borderRadius: 2 }}>
          {/* 标签页导航 */}
          <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            {tabConfig.map((tabItem, index) => (
              <Tab 
                key={index} 
                label={tabItem.label} 
                icon={tabItem.icon} 
                iconPosition="start"
              />
            ))}
          </Tabs>

          {/* 标签页内容 */}
          <Box sx={{ p: 3 }}>
            {tab === 0 && <BasicTab formData={formData} setFormData={setFormData} />}
            {tab === 1 && <BackendsTab formData={formData} setFormData={setFormData} />}
            {tab === 2 && <CookiesTab formData={formData} setFormData={setFormData} />}
            {tab === 3 && <HeadersTab formData={formData} setFormData={setFormData} />}
            {tab === 4 && <ResponseBodyDecoratorTab formData={formData} setFormData={setFormData} />}
            {tab === 5 && <LimitersTab formData={formData} setFormData={setFormData} />}
          </Box>

          {/* 提交按钮 */}
          <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              size="large"
            >
              {getLabel('submit')}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* 确认对话框 */}
      <Dialog open={openDialog} onClose={handleCloseConfirm}>
        <DialogTitle>{getLabel('confirmSubmit')}</DialogTitle>
        <DialogContent>
          <Typography>
            {getMessage('confirmSubmitMessage')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>
            {getLabel('cancel')}
          </Button>
          <Button onClick={handleConfirm} variant="contained">
            {getLabel('confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 结果对话框 */}
      <Dialog open={submitStatus !== 'idle'} onClose={handleCloseResult}>
        <DialogTitle>
          {submitStatus === 'success' ? getLabel('success') : getLabel('error')}
        </DialogTitle>
        <DialogContent>
          {submitStatus === 'loading' && (
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress size={20} />
              <Typography>{getMessage('submitting')}</Typography>
            </Box>
          )}
          {submitStatus === 'success' && (
            <Alert severity="success">
              {getMessage('submitSuccess')}
            </Alert>
          )}
          {submitStatus === 'error' && (
            <Alert severity="error">
              {getMessage('submitError')}: {errorMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResult}>
            {getLabel('close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GatewayMappingPage; 