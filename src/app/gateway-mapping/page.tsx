"use client";
import React, { useState, useEffect, createContext, useContext } from "react";
import { Box, Tabs, Tab, Typography, Paper, AppBar, Toolbar, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, Card, Divider, IconButton, CircularProgress, Alert } from "@mui/material";
import BasicTab from "./components/BasicTab";
import BackendsTab from "./components/BackendsTab";
import CookiesTab from "./components/CookiesTab";
import HeadersTab from "./components/HeadersTab";
import ResponseBodyDecoratorTab from "./components/ResponseBodyDecoratorTab";
import LimitersTab from "./components/LimitersTab";
import LanguageIcon from '@mui/icons-material/Language';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import CookieIcon from '@mui/icons-material/Cookie';
import HttpIcon from '@mui/icons-material/Http';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SecurityIcon from '@mui/icons-material/Security';
import { FormProvider, FormDataType, FormConfigType, useFormValidation } from "./contexts/FormContext";

// 静态内容
const STATIC_CONTENT = {
  title: "Gateway Admin",
  submitButton: "提交",
  cancelButton: "取消",
  confirmButton: "确认提交",
  closeButton: "关闭",
  confirmTitle: "请确认创建内容",
  successMessage: "创建成功！",
  errorPrefix: "提交失败：",
  loadingMessage: "正在提交...",
  tabLabels: [
    { label: "Basic", icon: <AssignmentIcon fontSize="small" /> },
    { label: "Backends", icon: <SettingsEthernetIcon fontSize="small" /> },
    { label: "Cookies", icon: <CookieIcon fontSize="small" /> },
    { label: "Headers", icon: <HttpIcon fontSize="small" /> },
    { label: "Response Body Decorator", icon: <ErrorOutlineIcon fontSize="small" /> },
    { label: "Limiters", icon: <SecurityIcon fontSize="small" /> },
  ]
};

// 语言 context
export const LanguageContext = createContext<{
  lang: string;
  setLang: (lang: string) => void;
} | null>(null);

// 默认的formConfig
const defaultFormConfig: FormConfigType = {
  basic: {
    labels: {
      domain: 'Domain',
      requestPathPattern: 'Request Path Pattern',
      backendForwardPath: 'Backend Forward Path',
      cmdbProject: 'CMDB Project',
      uniqueTip: 'Domain + Path Pattern must be unique.'
    },
    options: {
      cmdbProject: [
        { label: 'Project A', value: 'a' },
        { label: 'Project B', value: 'b' }
      ]
    }
  },
  backends: {
    labels: {
      hostname: 'Hostname',
      port: 'Port',
      protocol: 'Protocol',
      region: 'Region',
      dataCenter: 'Data Center'
    },
    options: {
      protocol: [
        { label: 'HTTP', value: 'HTTP' },
        { label: 'HTTPS', value: 'HTTPS' }
      ],
      region: [
        { label: 'EU', value: 'EU' },
        { label: 'AS', value: 'AS' },
        { label: 'AM', value: 'AM' }
      ],
      dataCenter: {
        EU: [
          { label: 'WK', value: 'WK' },
          { label: 'RH', value: 'RH' }
        ],
        AS: [
          { label: 'SDC', value: 'SDC' },
          { label: 'TDC', value: 'TDC' }
        ],
        AM: [
          { label: 'PSC', value: 'PSC' }
        ]
      }
    },
    validation: {
      port: { min: 0, max: 65535 }
    }
  },
  cookies: {
    labels: {
      globalStrategy: 'Global Cookie Strategy',
      exception: 'Exceptions',
      cookieName: 'Cookie Name',
      strategy: 'Strategy',
      rfcTip: 'Cookie name must conform to RFC standard.'
    },
    options: {
      strategy: [
        { label: 'Passthrough', value: 'passthrough' },
        { label: 'Persist', value: 'persist' }
      ]
    }
  },
  headers: {
    labels: {
      request: 'Request Headers',
      response: 'Response Headers',
      name: 'Name',
      value: 'Value',
      override: 'Override',
      addRequest: 'Add Request Header',
      addResponse: 'Add Response Header',
      remove: 'Remove'
    }
  },
  responseBodyDecorator: {
    labels: {
      errorPage: 'Error Page Mapping',
      statusCode: 'Status Code',
      pagePath: 'Page Path',
      add: 'Add Mapping'
    }
  },
  limiters: {
    labels: {
      ipRule: 'IP/Subnet Rules',
      ipOrCidr: 'IP or CIDR',
      mode: 'Mode',
      allow: 'Allow',
      deny: 'Deny',
      addRule: 'Add Rule',
      maxConcurrent: 'Max Concurrent',
      maxPerMinute: 'Max Calls Per Minute',
      allowedMethods: 'Allowed Methods',
      atLeastOne: 'At least one limiter must be set.'
    },
    options: {
      mode: [
        { label: 'Allow', value: 'allow' },
        { label: 'Deny', value: 'deny' }
      ],
      methods: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' }
      ]
    }
  }
};

// 提交状态类型
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

// 主组件
function GatewayMappingPage() {
  const [tab, setTab] = useState(0);
  const [lang, setLang] = useState("en");
  const [formConfig, setFormConfig] = useState<FormConfigType>(defaultFormConfig);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 加载表单配置
  useEffect(() => {
    async function loadFormConfig() {
      try {
        const response = await fetch(`/api/form-config?lang=${lang}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFormConfig((prevConfig) => ({ ...prevConfig, ...data }));
      } catch (error) {
        console.error('Failed to load form config:', error);
        // 如果API失败，保持默认配置不变
      }
    }

    loadFormConfig();
  }, [lang]);

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
        body: JSON.stringify({}), // 这里应该传递实际的表单数据
      });

      if (response.ok) {
        setSubmitStatus('success');
      } else {
        const errorText = await response.text();
        setErrorMessage(errorText);
        setSubmitStatus('error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
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

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      <FormProvider initialConfig={formConfig}>
        <AppBar position="static" color="default" elevation={2} sx={{ mb: 2, borderRadius: 2 }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box display="flex" alignItems="center" gap={2}>
              <img src="/logo.svg" alt="logo" style={{ height: 32 }} />
              <Typography variant="h6" fontWeight={700} color="primary">
                {STATIC_CONTENT.title}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <LanguageIcon color="action" />
              <Select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                size="small"
                sx={{ minWidth: 100 }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="zh">中文</MenuItem>
              </Select>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Card sx={{ width: "100%", minHeight: 600, p: 3, borderRadius: 3, boxShadow: 3 }}>
          <Tabs 
            value={tab} 
            onChange={handleTabChange} 
            variant="scrollable" 
            scrollButtons="auto" 
            textColor="primary" 
            indicatorColor="primary" 
            sx={{ mb: 2 }}
          >
            {STATIC_CONTENT.tabLabels.map((tabObj, idx) => (
              <Tab 
                key={tabObj.label}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    {tabObj.icon}
                    {tabObj.label}
                  </Box>
                } 
                id={`tab-${idx}`} 
                aria-controls={`tabpanel-${idx}`} 
                sx={{ fontSize: 16, fontWeight: 600, minHeight: 48 }} 
              />
            ))}
          </Tabs>
          
          <Divider sx={{ mb: 2 }} />
          
          <div hidden={tab !== 0}><BasicTab showValidation={true} /></div>
          <div hidden={tab !== 1}><BackendsTab /></div>
          <div hidden={tab !== 2}><CookiesTab /></div>
          <div hidden={tab !== 3}><HeadersTab /></div>
          <div hidden={tab !== 4}><ResponseBodyDecoratorTab /></div>
          <div hidden={tab !== 5}><LimitersTab /></div>
          
          <Box mt={4} display="flex" justifyContent="center">
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              onClick={handleSubmit} 
              disabled={submitStatus === 'loading'} 
              sx={{ px: 6, py: 1.5, fontSize: 18, borderRadius: 2 }}
            >
              {submitStatus === 'loading' ? (
                <CircularProgress size={28} color="inherit" />
              ) : (
                STATIC_CONTENT.submitButton
              )}
            </Button>
          </Box>
          
          {/* 确认弹窗 */}
          <Dialog open={openDialog} onClose={handleCloseConfirm} maxWidth="md" fullWidth>
            <DialogTitle>{STATIC_CONTENT.confirmTitle}</DialogTitle>
            <DialogContent dividers>
              <Box bgcolor="grey.100" p={2} borderRadius={2}>
                <pre style={{ 
                  whiteSpace: "pre-wrap", 
                  wordBreak: "break-all", 
                  fontFamily: 'Fira Mono, monospace', 
                  fontSize: 15 
                }}>
                  {/* 这里应该显示实际的表单数据 */}
                  {JSON.stringify({ message: "表单数据将在这里显示" }, null, 2)}
                </pre>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseConfirm}>{STATIC_CONTENT.cancelButton}</Button>
              <Button onClick={handleConfirm} variant="contained" color="primary">
                {STATIC_CONTENT.confirmButton}
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* 提交结果提示 */}
          <Dialog open={submitStatus !== 'idle'} onClose={handleCloseResult}>
            <DialogTitle>提示</DialogTitle>
            <DialogContent>
              {submitStatus === 'success' ? (
                <Alert severity="success">{STATIC_CONTENT.successMessage}</Alert>
              ) : submitStatus === 'error' ? (
                <Alert severity="error">
                  {STATIC_CONTENT.errorPrefix}{errorMessage}
                </Alert>
              ) : null}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseResult}>{STATIC_CONTENT.closeButton}</Button>
            </DialogActions>
          </Dialog>
        </Card>
      </FormProvider>
    </LanguageContext.Provider>
  );
}

export default GatewayMappingPage; 