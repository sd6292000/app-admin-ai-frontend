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
import { FormDataContext, FormConfigContext, FormDataType } from "./contexts/FormContext";

const tabLabels = [
  { label: "Basic", icon: <AssignmentIcon fontSize="small" /> },
  { label: "Backends", icon: <SettingsEthernetIcon fontSize="small" /> },
  { label: "Cookies", icon: <CookieIcon fontSize="small" /> },
  { label: "Headers", icon: <HttpIcon fontSize="small" /> },
  { label: "Response Body Decorator", icon: <ErrorOutlineIcon fontSize="small" /> },
  { label: "Limiters", icon: <SecurityIcon fontSize="small" /> },
];

// 语言 context
export const LanguageContext = createContext<any>(null);

// 默认的formConfig
const defaultFormConfig = {
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

export default function GatewayMappingPage() {
  const [tab, setTab] = useState(0);
  const [lang, setLang] = useState("en");
  const [formConfig, setFormConfig] = useState<any>({
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
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    basic: {},
    backends: [],
    cookies: {},
    headers: {},
    responseBodyDecorator: [],
    limiters: {},
  });
  const [submitResult, setSubmitResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/form-config?lang=${lang}`)
      .then(res => res.json())
      .then(data => {
        // 合并API返回的数据和默认配置
        setFormConfig((prevConfig: any) => ({ ...prevConfig, ...data }));
      })
      .catch(error => {
        console.error('Failed to load form config:', error);
        // 如果API失败，保持默认配置不变
      });
  }, [lang]);

  const handleChange = (_: any, newValue: number) => setTab(newValue);

  // 用于收集所有Tab的表单数据
  const collectFormData = () => formData;

  // 提交按钮点击
  const handleSubmit = () => {
    setFormData(formData);
    setOpenDialog(true);
  };

  // 确认提交
  const handleConfirm = async () => {
    setOpenDialog(false);
    setLoading(true);
    try {
      const res = await fetch("/api/gateway-mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitResult("success");
      } else {
        setSubmitResult("fail:" + (await res.text()));
      }
    } catch (e: any) {
      setSubmitResult("fail:" + e.message);
    } finally {
      setLoading(false);
    }
  };

  // 关闭提示
  const handleCloseResult = () => setSubmitResult(null);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      <FormConfigContext.Provider value={formConfig}>
        <FormDataContext.Provider value={{ formData, setFormData }}>
          <AppBar position="static" color="default" elevation={2} sx={{ mb: 2, borderRadius: 2 }}>
            <Toolbar sx={{ justifyContent: "space-between" }}>
              <Box display="flex" alignItems="center" gap={2}>
                <img src="/logo.svg" alt="logo" style={{ height: 32 }} />
                <Typography variant="h6" fontWeight={700} color="primary">Gateway Admin</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <LanguageIcon color="action" />
                <Select
                  value={lang}
                  onChange={e => setLang(e.target.value)}
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
            <Tabs value={tab} onChange={handleChange} variant="scrollable" scrollButtons="auto" textColor="primary" indicatorColor="primary" sx={{ mb: 2 }}>
              {tabLabels.map((tabObj, idx) => (
                <Tab label={<Box display="flex" alignItems="center" gap={1}>{tabObj.icon}{tabObj.label}</Box>} key={tabObj.label} id={`tab-${idx}`} aria-controls={`tabpanel-${idx}`} sx={{ fontSize: 16, fontWeight: 600, minHeight: 48 }} />
              ))}
            </Tabs>
            <Divider sx={{ mb: 2 }} />
            <div hidden={tab !== 0}><BasicTab /></div>
            <div hidden={tab !== 1}><BackendsTab /></div>
            <div hidden={tab !== 2}><CookiesTab /></div>
            <div hidden={tab !== 3}><HeadersTab /></div>
            <div hidden={tab !== 4}><ResponseBodyDecoratorTab /></div>
            <div hidden={tab !== 5}><LimitersTab /></div>
            <Box mt={4} display="flex" justifyContent="center">
              <Button variant="contained" color="primary" size="large" onClick={handleSubmit} disabled={loading} sx={{ px: 6, py: 1.5, fontSize: 18, borderRadius: 2 }}>
                {loading ? <CircularProgress size={28} color="inherit" /> : "提交"}
              </Button>
            </Box>
            {/* 确认弹窗 */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
              <DialogTitle>请确认创建内容</DialogTitle>
              <DialogContent dividers>
                <Box bgcolor="grey.100" p={2} borderRadius={2}>
                  <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>{JSON.stringify(formData, null, 2)}</pre>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>取消</Button>
                <Button onClick={handleConfirm} variant="contained" color="primary">确认提交</Button>
              </DialogActions>
            </Dialog>
            {/* 提交结果提示 */}
            <Dialog open={!!submitResult} onClose={handleCloseResult}>
              <DialogTitle>提示</DialogTitle>
              <DialogContent>
                {submitResult === "success" ? (
                  <Alert severity="success">创建成功！</Alert>
                ) : (
                  <Alert severity="error">{submitResult?.replace(/^fail:/, "提交失败：")}</Alert>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseResult}>关闭</Button>
              </DialogActions>
            </Dialog>
          </Card>
        </FormDataContext.Provider>
      </FormConfigContext.Provider>
    </LanguageContext.Provider>
  );
} 