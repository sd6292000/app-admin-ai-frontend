"use client";
import React, { createContext, useContext, ReactNode } from "react";

// 基础类型定义
interface BasicInfo {
  domain: string;
  requestPathPattern: string;
  backendForwardPath: string;
  cmdbProject: string;
}

interface Backend {
  hostname: string;
  port: string;
  protocol: 'HTTP' | 'HTTPS';
  region: 'EU' | 'AS' | 'AM';
  dataCenter: string;
  enabled: boolean;
}

interface CookieException {
  cookieName: string;
  strategy: 'passthrough' | 'persist';
}

interface CookieConfig {
  globalStrategy: 'passthrough' | 'persist';
  exceptions: CookieException[];
}

interface Header {
  name: string;
  value: string;
  override: boolean;
}

interface HeadersConfig {
  request: Header[];
  response: Header[];
}

interface ErrorPageMapping {
  statusCode: string;
  pagePath: string;
}

interface LimiterRule {
  ipOrCidr: string;
  mode: 'allow' | 'deny';
}

interface LimitersConfig {
  ipRules: LimiterRule[];
  maxConcurrent: string;
  maxPerMinute: string;
  allowedMethods: string[];
}

// 表单数据类型
export interface FormDataType {
  basic: BasicInfo;
  backends: Backend[];
  cookies: CookieConfig;
  headers: HeadersConfig;
  responseBodyDecorator: ErrorPageMapping[];
  limiters: LimitersConfig;
}

// 表单配置类型
export interface FormConfigType {
  basic: {
    labels: Record<string, string>;
    options: {
      cmdbProject: Array<{ label: string; value: string }>;
    };
  };
  backends: {
    labels: Record<string, string>;
    options: {
      protocol: Array<{ label: string; value: string }>;
      region: Array<{ label: string; value: string }>;
      dataCenter: Record<string, Array<{ label: string; value: string }>>;
    };
    validation: {
      port: { min: number; max: number };
    };
  };
  cookies: {
    labels: Record<string, string>;
    options: {
      strategy: Array<{ label: string; value: string }>;
    };
  };
  headers: {
    labels: Record<string, string>;
  };
  responseBodyDecorator: {
    labels: Record<string, string>;
  };
  limiters: {
    labels: Record<string, string>;
    options: {
      mode: Array<{ label: string; value: string }>;
      methods: Array<{ label: string; value: string }>;
    };
  };
}

// 默认表单数据
export const defaultFormData: FormDataType = {
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
};

// Context类型定义
interface FormDataContextType {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
}

interface FormConfigContextType {
  config: FormConfigType | null;
  setConfig: React.Dispatch<React.SetStateAction<FormConfigType | null>>;
}

// Context创建
export const FormDataContext = createContext<FormDataContextType | null>(null);
export const FormConfigContext = createContext<FormConfigContextType | null>(null);

// Provider组件
interface FormProviderProps {
  children: ReactNode;
  initialData?: Partial<FormDataType>;
  initialConfig?: FormConfigType;
}

export function FormProvider({ children, initialData, initialConfig }: FormProviderProps) {
  const [formData, setFormData] = React.useState<FormDataType>({
    ...defaultFormData,
    ...initialData
  });
  
  const [config, setConfig] = React.useState<FormConfigType | null>(initialConfig || null);

  return (
    <FormDataContext.Provider value={{ formData, setFormData }}>
      <FormConfigContext.Provider value={{ config, setConfig }}>
        {children}
      </FormConfigContext.Provider>
    </FormDataContext.Provider>
  );
}

// 自定义Hook - 表单数据
export function useFormData(): FormDataContextType {
  const context = useContext(FormDataContext);
  if (!context) {
    throw new Error('useFormData必须在FormProvider内部使用');
  }
  return context;
}

// 自定义Hook - 表单配置
export function useFormConfig(): FormConfigContextType {
  const context = useContext(FormConfigContext);
  if (!context) {
    throw new Error('useFormConfig必须在FormProvider内部使用');
  }
  return context;
}

// 表单验证Hook
export function useFormValidation() {
  const { formData } = useFormData();
  
  const validateBasic = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.basic.domain.trim()) {
      errors.push('域名不能为空');
    }
    
    if (!formData.basic.requestPathPattern.trim()) {
      errors.push('请求路径模式不能为空');
    }
    
    if (!formData.basic.backendForwardPath.trim()) {
      errors.push('后端转发路径不能为空');
    }
    
    if (!formData.basic.cmdbProject) {
      errors.push('CMDB项目必须选择');
    }
    
    return errors;
  };
  
  const validateBackends = (): string[] => {
    const errors: string[] = [];
    
    if (formData.backends.length === 0) {
      errors.push('至少需要配置一个后端服务');
      return errors;
    }
    
    formData.backends.forEach((backend, index) => {
      if (!backend.hostname.trim()) {
        errors.push(`后端 ${index + 1}: 主机名不能为空`);
      }
      
      if (!backend.port.trim()) {
        errors.push(`后端 ${index + 1}: 端口不能为空`);
      } else {
        const port = parseInt(backend.port);
        if (isNaN(port) || port < 1 || port > 65535) {
          errors.push(`后端 ${index + 1}: 端口必须在1-65535之间`);
        }
      }
      
      if (!backend.region) {
        errors.push(`后端 ${index + 1}: 区域必须选择`);
      }
      
      if (!backend.dataCenter) {
        errors.push(`后端 ${index + 1}: 数据中心必须选择`);
      }
    });
    
    return errors;
  };
  
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const basicErrors = validateBasic();
    const backendErrors = validateBackends();
    const allErrors = [...basicErrors, ...backendErrors];
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  };
  
  return {
    validateBasic,
    validateBackends,
    validateForm
  };
} 