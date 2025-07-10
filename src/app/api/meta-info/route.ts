import { NextRequest, NextResponse } from 'next/server';

// 验证规则类型
interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message: string;
}

// 字段配置类型
interface FieldConfig {
  key: string;
  label: Record<string, string>; // 多语言标签
  type: 'text' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'textarea' | 'switch';
  required?: boolean;
  defaultValue?: any;
  placeholder?: Record<string, string>;
  validation?: ValidationRule[];
  options?: Array<{ label: Record<string, string>; value: string }>;
  dependencies?: string[]; // 依赖的其他字段
  conditional?: {
    field: string;
    value: any;
    operator: 'equals' | 'not_equals' | 'contains' | 'exists';
  };
}

// 表单配置类型
interface FormMetaConfig {
  key: string;
  label: Record<string, string>;
  fields: FieldConfig[];
  validation?: ValidationRule[];
}

// 页面配置类型
interface PageMetaConfig {
  key: string;
  label: Record<string, string>;
  forms: FormMetaConfig[];
  actions: Array<{
    key: string;
    label: Record<string, string>;
    type: 'primary' | 'secondary' | 'danger';
    icon?: string;
  }>;
}

// 完整的Meta Information配置
interface MetaInformation {
  languages: string[];
  defaultLanguage: string;
  pages: PageMetaConfig[];
  common: {
    labels: Record<string, Record<string, string>>;
    messages: Record<string, Record<string, string>>;
    validation: Record<string, Record<string, string>>;
  };
}

// 英文配置
const englishMetaInfo: MetaInformation = {
  languages: ['en', 'zh'],
  defaultLanguage: 'en',
  pages: [
    {
      key: 'gateway-mapping',
      label: { en: 'Gateway Mapping', zh: '网关映射' },
      forms: [
        {
          key: 'basic',
          label: { en: 'Basic Configuration', zh: '基础配置' },
          fields: [
            {
              key: 'domain',
              label: { en: 'Domain', zh: '域名' },
              type: 'text',
              required: true,
              placeholder: { en: 'Enter domain name', zh: '请输入域名' },
              validation: [
                { type: 'required', message: 'Domain is required' },
                { type: 'pattern', value: '^[a-zA-Z0-9.-]+$', message: 'Invalid domain format' }
              ]
            },
            {
              key: 'requestPathPattern',
              label: { en: 'Request Path Pattern', zh: '请求路径模式' },
              type: 'text',
              required: true,
              placeholder: { en: 'e.g., /api/*', zh: '例如：/api/*' },
              validation: [
                { type: 'required', message: 'Request path pattern is required' },
                { type: 'pattern', value: '^/.*$', message: 'Path must start with /' }
              ]
            },
            {
              key: 'backendForwardPath',
              label: { en: 'Backend Forward Path', zh: '后端转发路径' },
              type: 'text',
              required: true,
              placeholder: { en: 'e.g., /backend', zh: '例如：/backend' },
              validation: [
                { type: 'required', message: 'Backend forward path is required' },
                { type: 'pattern', value: '^/.*$', message: 'Path must start with /' }
              ]
            },
            {
              key: 'cmdbProject',
              label: { en: 'CMDB Project', zh: 'CMDB项目' },
              type: 'select',
              required: true,
              options: [
                { label: { en: 'Project A', zh: '项目A' }, value: 'a' },
                { label: { en: 'Project B', zh: '项目B' }, value: 'b' },
                { label: { en: 'Project C', zh: '项目C' }, value: 'c' }
              ]
            }
          ],
          validation: [
            {
              type: 'custom',
              message: 'Domain + Path Pattern must be unique',
              value: 'unique_domain_path'
            }
          ]
        },
        {
          key: 'backends',
          label: { en: 'Backend Servers', zh: '后端服务器' },
          fields: [
            {
              key: 'hostname',
              label: { en: 'Hostname', zh: '主机名' },
              type: 'text',
              required: true,
              placeholder: { en: 'Enter hostname', zh: '请输入主机名' },
              validation: [
                { type: 'required', message: 'Hostname is required' },
                { type: 'pattern', value: '^[a-zA-Z0-9.-]+$', message: 'Invalid hostname format' }
              ]
            },
            {
              key: 'port',
              label: { en: 'Port', zh: '端口' },
              type: 'number',
              required: true,
              defaultValue: 80,
              validation: [
                { type: 'required', message: 'Port is required' },
                { type: 'min', value: 1, message: 'Port must be at least 1' },
                { type: 'max', value: 65535, message: 'Port must be at most 65535' }
              ]
            },
            {
              key: 'protocol',
              label: { en: 'Protocol', zh: '协议' },
              type: 'select',
              required: true,
              defaultValue: 'HTTP',
              options: [
                { label: { en: 'HTTP', zh: 'HTTP' }, value: 'HTTP' },
                { label: { en: 'HTTPS', zh: 'HTTPS' }, value: 'HTTPS' }
              ]
            },
            {
              key: 'region',
              label: { en: 'Region', zh: '区域' },
              type: 'select',
              required: true,
              options: [
                { label: { en: 'Europe', zh: '欧洲' }, value: 'EU' },
                { label: { en: 'Asia', zh: '亚洲' }, value: 'AS' },
                { label: { en: 'America', zh: '美洲' }, value: 'AM' }
              ]
            },
            {
              key: 'dataCenter',
              label: { en: 'Data Center', zh: '数据中心' },
              type: 'select',
              required: true,
              dependencies: ['region'],
              options: [
                { label: { en: 'WK', zh: 'WK' }, value: 'WK' },
                { label: { en: 'RH', zh: 'RH' }, value: 'RH' },
                { label: { en: 'SDC', zh: 'SDC' }, value: 'SDC' },
                { label: { en: 'TDC', zh: 'TDC' }, value: 'TDC' },
                { label: { en: 'PSC', zh: 'PSC' }, value: 'PSC' }
              ]
            },
            {
              key: 'enabled',
              label: { en: 'Enabled', zh: '启用' },
              type: 'switch',
              defaultValue: true
            }
          ]
        },
        {
          key: 'headers',
          label: { en: 'Headers', zh: '请求头' },
          fields: [
            {
              key: 'name',
              label: { en: 'Header Name', zh: '请求头名称' },
              type: 'text',
              required: true,
              placeholder: { en: 'Enter header name', zh: '请输入请求头名称' },
              validation: [
                { type: 'required', message: 'Header name is required' },
                { type: 'custom', message: 'Header name must be unique', value: 'unique_header_name' }
              ]
            },
            {
              key: 'value',
              label: { en: 'Header Value', zh: '请求头值' },
              type: 'textarea',
              required: true,
              placeholder: { en: 'Enter header value', zh: '请输入请求头值' },
              validation: [
                { type: 'required', message: 'Header value is required' }
              ]
            },
            {
              key: 'override',
              label: { en: 'Override', zh: '覆盖' },
              type: 'switch',
              defaultValue: false
            }
          ],
          validation: [
            {
              type: 'custom',
              message: 'Header names must be unique',
              value: 'unique_header_names'
            }
          ]
        },
        {
          key: 'cookies',
          label: { en: 'Cookies', zh: 'Cookies' },
          fields: [
            {
              key: 'globalStrategy',
              label: { en: 'Global Cookie Strategy', zh: '全局Cookie策略' },
              type: 'select',
              required: true,
              defaultValue: 'passthrough',
              options: [
                { label: { en: 'Passthrough', zh: '透传' }, value: 'passthrough' },
                { label: { en: 'Persist', zh: '持久化' }, value: 'persist' }
              ]
            },
            {
              key: 'cookieName',
              label: { en: 'Cookie Name', zh: 'Cookie名称' },
              type: 'text',
              required: true,
              placeholder: { en: 'Enter cookie name', zh: '请输入Cookie名称' },
              validation: [
                { type: 'required', message: 'Cookie name is required' },
                { type: 'pattern', value: '^[!#$%&\'*+\\-.^_`|~0-9a-zA-Z]+$', message: 'Invalid cookie name format (RFC6265)' },
                { type: 'custom', message: 'Cookie name must be unique', value: 'unique_cookie_name' }
              ]
            },
            {
              key: 'strategy',
              label: { en: 'Strategy', zh: '策略' },
              type: 'select',
              required: true,
              options: [
                { label: { en: 'Passthrough', zh: '透传' }, value: 'passthrough' },
                { label: { en: 'Persist', zh: '持久化' }, value: 'persist' }
              ]
            }
          ],
          validation: [
            {
              type: 'custom',
              message: 'Cookie names must be unique',
              value: 'unique_cookie_names'
            }
          ]
        },
        {
          key: 'limiters',
          label: { en: 'Limiters', zh: '限制器' },
          fields: [
            {
              key: 'ipRule',
              label: { en: 'IP/Subnet Rules', zh: 'IP/子网规则' },
              type: 'text',
              placeholder: { en: 'IP or CIDR', zh: 'IP或CIDR' },
              validation: [
                { type: 'pattern', value: '^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}(?:/[0-9]{1,2})?$', message: 'Invalid IP or CIDR format' }
              ]
            },
            {
              key: 'mode',
              label: { en: 'Mode', zh: '模式' },
              type: 'select',
              options: [
                { label: { en: 'Allow', zh: '允许' }, value: 'allow' },
                { label: { en: 'Deny', zh: '拒绝' }, value: 'deny' }
              ]
            },
            {
              key: 'maxConcurrent',
              label: { en: 'Max Concurrent', zh: '最大并发数' },
              type: 'number',
              placeholder: { en: 'Max concurrent connections', zh: '最大并发连接数' },
              validation: [
                { type: 'min', value: 1, message: 'Max concurrent must be at least 1' },
                { type: 'max', value: 10000, message: 'Max concurrent must be at most 10000' }
              ]
            },
            {
              key: 'maxPerMinute',
              label: { en: 'Max Calls Per Minute', zh: '每分钟最大调用次数' },
              type: 'number',
              placeholder: { en: 'Max calls per minute', zh: '每分钟最大调用次数' },
              validation: [
                { type: 'min', value: 1, message: 'Max per minute must be at least 1' },
                { type: 'max', value: 1000000, message: 'Max per minute must be at most 1000000' }
              ]
            },
            {
              key: 'allowedMethods',
              label: { en: 'Allowed Methods', zh: '允许的方法' },
              type: 'multiselect',
              options: [
                { label: { en: 'GET', zh: 'GET' }, value: 'GET' },
                { label: { en: 'POST', zh: 'POST' }, value: 'POST' },
                { label: { en: 'PUT', zh: 'PUT' }, value: 'PUT' },
                { label: { en: 'DELETE', zh: 'DELETE' }, value: 'DELETE' },
                { label: { en: 'PATCH', zh: 'PATCH' }, value: 'PATCH' },
                { label: { en: 'HEAD', zh: 'HEAD' }, value: 'HEAD' },
                { label: { en: 'OPTIONS', zh: 'OPTIONS' }, value: 'OPTIONS' }
              ]
            }
          ],
          validation: [
            {
              type: 'custom',
              message: 'At least one limiter must be set',
              value: 'at_least_one_limiter'
            }
          ]
        },
        {
          key: 'csp',
          label: { en: 'Content Security Policy', zh: '内容安全策略' },
          fields: [
            {
              key: 'enabled',
              label: { en: 'Enable CSP', zh: '启用CSP' },
              type: 'switch',
              defaultValue: false
            },
            {
              key: 'preset',
              label: { en: 'CSP Preset', zh: 'CSP预设' },
              type: 'select',
              options: [
                { label: { en: 'Strict', zh: '严格' }, value: 'strict' },
                { label: { en: 'Moderate', zh: '中等' }, value: 'moderate' },
                { label: { en: 'Relaxed', zh: '宽松' }, value: 'relaxed' },
                { label: { en: 'Custom', zh: '自定义' }, value: 'custom' }
              ],
              conditional: {
                field: 'enabled',
                value: true,
                operator: 'equals'
              }
            },
            {
              key: 'customValue',
              label: { en: 'Custom CSP Value', zh: '自定义CSP值' },
              type: 'textarea',
              placeholder: { en: 'Enter custom CSP value', zh: '请输入自定义CSP值' },
              conditional: {
                field: 'preset',
                value: 'custom',
                operator: 'equals'
              }
            },
            {
              key: 'directives',
              label: { en: 'CSP Directives', zh: 'CSP指令' },
              type: 'multiselect',
              options: [
                { label: { en: 'default-src', zh: 'default-src' }, value: 'default-src' },
                { label: { en: 'script-src', zh: 'script-src' }, value: 'script-src' },
                { label: { en: 'style-src', zh: 'style-src' }, value: 'style-src' },
                { label: { en: 'img-src', zh: 'img-src' }, value: 'img-src' },
                { label: { en: 'font-src', zh: 'font-src' }, value: 'font-src' },
                { label: { en: 'connect-src', zh: 'connect-src' }, value: 'connect-src' },
                { label: { en: 'media-src', zh: 'media-src' }, value: 'media-src' },
                { label: { en: 'object-src', zh: 'object-src' }, value: 'object-src' },
                { label: { en: 'frame-src', zh: 'frame-src' }, value: 'frame-src' },
                { label: { en: 'worker-src', zh: 'worker-src' }, value: 'worker-src' },
                { label: { en: 'manifest-src', zh: 'manifest-src' }, value: 'manifest-src' },
                { label: { en: 'base-uri', zh: 'base-uri' }, value: 'base-uri' },
                { label: { en: 'form-action', zh: 'form-action' }, value: 'form-action' },
                { label: { en: 'frame-ancestors', zh: 'frame-ancestors' }, value: 'frame-ancestors' },
                { label: { en: 'upgrade-insecure-requests', zh: 'upgrade-insecure-requests' }, value: 'upgrade-insecure-requests' },
                { label: { en: 'block-all-mixed-content', zh: 'block-all-mixed-content' }, value: 'block-all-mixed-content' }
              ],
              conditional: {
                field: 'enabled',
                value: true,
                operator: 'equals'
              }
            },
            {
              key: 'values',
              label: { en: 'CSP Values', zh: 'CSP值' },
              type: 'multiselect',
              options: [
                { label: { en: "'self'", zh: "'self'" }, value: "'self'" },
                { label: { en: "'unsafe-inline'", zh: "'unsafe-inline'" }, value: "'unsafe-inline'" },
                { label: { en: "'unsafe-eval'", zh: "'unsafe-eval'" }, value: "'unsafe-eval'" },
                { label: { en: "'none'", zh: "'none'" }, value: "'none'" },
                { label: { en: 'data:', zh: 'data:' }, value: 'data:' },
                { label: { en: 'https:', zh: 'https:' }, value: 'https:' },
                { label: { en: 'http:', zh: 'http:' }, value: 'http:' },
                { label: { en: '*', zh: '*' }, value: '*' }
              ],
              conditional: {
                field: 'enabled',
                value: true,
                operator: 'equals'
              }
            }
          ]
        },
        {
          key: 'cache',
          label: { en: 'Cache Configuration', zh: '缓存配置' },
          fields: [
            {
              key: 'enabled',
              label: { en: 'Enable Cache', zh: '启用缓存' },
              type: 'switch',
              defaultValue: false
            },
            {
              key: 'cacheControl',
              label: { en: 'Cache Control', zh: '缓存控制' },
              type: 'text',
              placeholder: { en: 'e.g., max-age=3600', zh: '例如：max-age=3600' },
              conditional: {
                field: 'enabled',
                value: true,
                operator: 'equals'
              }
            },
            {
              key: 'maxAgeSeconds',
              label: { en: 'Max Age (seconds)', zh: '最大缓存时间（秒）' },
              type: 'number',
              defaultValue: 3600,
              validation: [
                { type: 'min', value: 0, message: 'Max age must be non-negative' },
                { type: 'max', value: 31536000, message: 'Max age must be at most 1 year' }
              ],
              conditional: {
                field: 'enabled',
                value: true,
                operator: 'equals'
              }
            },
            {
              key: 'etagEnabled',
              label: { en: 'Enable ETag', zh: '启用ETag' },
              type: 'switch',
              defaultValue: true,
              conditional: {
                field: 'enabled',
                value: true,
                operator: 'equals'
              }
            },
            {
              key: 'staleWhileRevalidateSeconds',
              label: { en: 'Stale While Revalidate (seconds)', zh: '重新验证时的过期时间（秒）' },
              type: 'number',
              validation: [
                { type: 'min', value: 0, message: 'Stale while revalidate must be non-negative' }
              ],
              conditional: {
                field: 'enabled',
                value: true,
                operator: 'equals'
              }
            },
            {
              key: 'staleIfErrorSeconds',
              label: { en: 'Stale If Error (seconds)', zh: '错误时的过期时间（秒）' },
              type: 'number',
              validation: [
                { type: 'min', value: 0, message: 'Stale if error must be non-negative' }
              ],
              conditional: {
                field: 'enabled',
                value: true,
                operator: 'equals'
              }
            }
          ]
        }
      ],
      actions: [
        {
          key: 'save',
          label: { en: 'Save', zh: '保存' },
          type: 'primary',
          icon: 'SaveIcon'
        },
        {
          key: 'cancel',
          label: { en: 'Cancel', zh: '取消' },
          type: 'secondary',
          icon: 'CancelIcon'
        },
        {
          key: 'delete',
          label: { en: 'Delete', zh: '删除' },
          type: 'danger',
          icon: 'DeleteIcon'
        }
      ]
    }
  ],
  common: {
    labels: {
      loading: { en: 'Loading...', zh: '加载中...' },
      error: { en: 'Error', zh: '错误' },
      success: { en: 'Success', zh: '成功' },
      warning: { en: 'Warning', zh: '警告' },
      info: { en: 'Information', zh: '信息' },
      confirm: { en: 'Confirm', zh: '确认' },
      cancel: { en: 'Cancel', zh: '取消' },
      save: { en: 'Save', zh: '保存' },
      edit: { en: 'Edit', zh: '编辑' },
      delete: { en: 'Delete', zh: '删除' },
      add: { en: 'Add', zh: '添加' },
      remove: { en: 'Remove', zh: '删除' },
      search: { en: 'Search', zh: '搜索' },
      filter: { en: 'Filter', zh: '筛选' },
      refresh: { en: 'Refresh', zh: '刷新' },
      export: { en: 'Export', zh: '导出' },
      import: { en: 'Import', zh: '导入' },
      back: { en: 'Back', zh: '返回' },
      next: { en: 'Next', zh: '下一步' },
      previous: { en: 'Previous', zh: '上一步' },
      submit: { en: 'Submit', zh: '提交' },
      reset: { en: 'Reset', zh: '重置' },
      close: { en: 'Close', zh: '关闭' },
      open: { en: 'Open', zh: '打开' },
      enabled: { en: 'Enabled', zh: '启用' },
      disabled: { en: 'Disabled', zh: '禁用' },
      active: { en: 'Active', zh: '激活' },
      inactive: { en: 'Inactive', zh: '非激活' },
      draft: { en: 'Draft', zh: '草稿' },
      published: { en: 'Published', zh: '已发布' },
      archived: { en: 'Archived', zh: '已归档' },
      requestHeaders: { en: 'Request Headers', zh: '请求头' },
      responseHeaders: { en: 'Response Headers', zh: '响应头' },
      securityHeaders: { en: 'Security Headers', zh: '安全请求头' },
      cookieExceptions: { en: 'Cookie Exceptions', zh: 'Cookie异常' },
      cspAdvanced: { en: 'Advanced CSP Configuration', zh: '高级CSP配置' },
      cspPreview: { en: 'CSP Preview', zh: 'CSP预览' },
      cspNoValue: { en: 'No CSP value generated', zh: '未生成CSP值' },
      addCspToHeaders: { en: 'Add CSP to Response Headers', zh: '将CSP添加到响应头' },
      addSecurityHeaders: { en: 'Add Security Headers', zh: '添加安全请求头' },
      headersTip: { en: 'Configure request and response headers for the gateway', zh: '为网关配置请求和响应头' },
      cookieTip: { en: 'Configure cookie handling strategy for the gateway', zh: '为网关配置Cookie处理策略' },
      cspTip: { en: 'Configure Content Security Policy to enhance security', zh: '配置内容安全策略以增强安全性' }
    },
    messages: {
      saveSuccess: { en: 'Saved successfully', zh: '保存成功' },
      saveError: { en: 'Failed to save', zh: '保存失败' },
      deleteSuccess: { en: 'Deleted successfully', zh: '删除成功' },
      deleteError: { en: 'Failed to delete', zh: '删除失败' },
      loadError: { en: 'Failed to load data', zh: '加载数据失败' },
      networkError: { en: 'Network error', zh: '网络错误' },
      validationError: { en: 'Validation error', zh: '验证错误' },
      unsavedChanges: { en: 'You have unsaved changes', zh: '您有未保存的更改' },
      confirmDelete: { en: 'Are you sure you want to delete?', zh: '您确定要删除吗？' },
      confirmLeave: { en: 'Are you sure you want to leave?', zh: '您确定要离开吗？' },
      duplicateHeaderNames: { en: 'Header names must be unique', zh: '请求头名称必须唯一' },
      duplicateCookieNames: { en: 'Cookie names must be unique', zh: 'Cookie名称必须唯一' },
      loading: { en: 'Loading...', zh: '加载中...' },
      submitting: { en: 'Submitting...', zh: '提交中...' },
      submitSuccess: { en: 'Submitted successfully', zh: '提交成功' },
      submitError: { en: 'Submit failed', zh: '提交失败' },
      confirmSubmit: { en: 'Confirm Submit', zh: '确认提交' },
      confirmSubmitMessage: { en: 'Are you sure you want to submit this configuration?', zh: '您确定要提交此配置吗？' }
    },
    validation: {
      required: { en: 'This field is required', zh: '此字段为必填项' },
      email: { en: 'Please enter a valid email address', zh: '请输入有效的邮箱地址' },
      url: { en: 'Please enter a valid URL', zh: '请输入有效的URL' },
      minLength: { en: 'Minimum length is {min}', zh: '最小长度为{min}' },
      maxLength: { en: 'Maximum length is {max}', zh: '最大长度为{max}' },
      minValue: { en: 'Minimum value is {min}', zh: '最小值为{min}' },
      maxValue: { en: 'Maximum value is {max}', zh: '最大值为{max}' },
      pattern: { en: 'Invalid format', zh: '格式无效' },
      unique: { en: 'This value must be unique', zh: '此值必须唯一' }
    }
  }
};

// 中文配置（与英文配置结构相同，但标签和消息使用中文）
const chineseMetaInfo: MetaInformation = {
  ...englishMetaInfo,
  defaultLanguage: 'zh'
};

// 验证语言参数
function validateLanguage(lang: string): boolean {
  return ['en', 'zh'].includes(lang);
}

// 获取配置
function getMetaInfo(lang: string): MetaInformation {
  if (lang === 'zh') {
    return chineseMetaInfo;
  }
  return englishMetaInfo;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    const page = searchParams.get('page');

    // 验证语言参数
    if (!validateLanguage(lang)) {
      console.error('Meta info error: Invalid language parameter:', lang);
      return NextResponse.json(
        { error: 'Invalid language parameter' },
        { status: 400 }
      );
    }

    const metaInfo = getMetaInfo(lang);
    
    // 如果指定了页面，只返回该页面的配置
    if (page) {
      const pageConfig = metaInfo.pages.find(p => p.key === page);
      if (!pageConfig) {
        return NextResponse.json(
          { error: 'Page not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        ...metaInfo,
        pages: [pageConfig]
      });
    }
    
    console.log(`Meta info loaded for language: ${lang}`);
    
    return NextResponse.json(metaInfo);

  } catch (error) {
    console.error('Meta info error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: 'Internal error occurred while getting meta information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 