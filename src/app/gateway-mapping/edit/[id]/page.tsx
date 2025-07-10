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
import { useLanguage } from '../../../contexts/LanguageContext';
import BasicTab from '../../components/BasicTab';
import BackendsTab from '../../components/BackendsTab';
import HeadersTab from '../../components/HeadersTab';
import CookiesTab from '../../components/CookiesTab';
import LimitersTab from '../../components/LimitersTab';
import ResponseBodyDecoratorTab from '../../components/ResponseBodyDecoratorTab';
import VersionManagementTab from '../../components/VersionManagementTab';
import { FormDataContext, FormConfigContext, FormDataType } from '../../contexts/FormContext';

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
    }
  });
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

  useEffect(() => {
    loadConfig();
    loadFormConfig();
  }, [params.id]);

  const loadFormConfig = async () => {
    try {
      const response = await fetch(`/api/form-config?lang=${lang}`);
      const result = await response.json();
      // 合并API返回的数据和默认配置
      setFormConfig((prevConfig: any) => ({ ...prevConfig, ...result }));
    } catch (error) {
      console.error('Failed to load form config:', error);
      // 如果API失败，保持默认配置不变
    }
  };

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/gateway-configs/${params.id}`);
      const result = await response.json();
      
      if (result.success) {
        setConfig(result.data);
        // 将配置数据转换为formData格式
        const convertedFormData: FormDataType = {
          basic: {
            domain: result.data.domain,
            requestPathPattern: result.data.requestPathPattern,
            backendForwardPath: result.data.backendForwardPath,
            cmdbProject: result.data.application
          },
          backends: result.data.backends || [],
          headers: result.data.headers || {},
          cookies: result.data.cookies || {},
          limiters: result.data.limiters || {},
          responseBodyDecorator: []
        };
        setFormData(convertedFormData);
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
    { label: lang === 'zh' ? '基本信息' : 'Basic', component: BasicTab, props: { isEditMode: true } },
    { label: lang === 'zh' ? '后端服务器' : 'Backends', component: BackendsTab, props: {} },
    { label: lang === 'zh' ? '请求头' : 'Headers', component: HeadersTab, props: {} },
    { label: lang === 'zh' ? 'Cookies' : 'Cookies', component: CookiesTab, props: {} },
    { label: lang === 'zh' ? '限制器' : 'Limiters', component: LimitersTab, props: {} },
    { label: lang === 'zh' ? '响应体装饰器' : 'Response Body Decorator', component: ResponseBodyDecoratorTab, props: {} },
    { label: lang === 'zh' ? '版本管理' : 'Version Management', component: VersionManagementTab, props: { formData, onConfigChange: handleConfigChange } }
  ];

  const ActiveTabComponent = tabs[activeTab].component;
  const activeTabProps = tabs[activeTab].props;

  return (
    <FormConfigContext.Provider value={formConfig}>
      <FormDataContext.Provider value={{ formData, setFormData }}>
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
            <ActiveTabComponent {...activeTabProps} />
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
      </FormDataContext.Provider>
    </FormConfigContext.Provider>
  );
} 