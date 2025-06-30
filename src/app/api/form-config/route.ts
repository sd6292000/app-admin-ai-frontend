import { NextRequest, NextResponse } from 'next/server';

// 表单配置类型
interface FormConfig {
  basic?: {
    labels?: Record<string, string>;
    options?: {
      cmdbProject?: Array<{ label: string; value: string }>;
    };
  };
  backends?: {
    labels?: Record<string, string>;
    options?: {
      protocol?: Array<{ label: string; value: string }>;
      region?: Array<{ label: string; value: string }>;
      dataCenter?: Record<string, Array<{ label: string; value: string }>>;
    };
    validation?: {
      port?: { min: number; max: number };
    };
  };
  cookies?: {
    labels?: Record<string, string>;
    options?: {
      strategy?: Array<{ label: string; value: string }>;
    };
  };
  headers?: {
    labels?: Record<string, string>;
  };
  responseBodyDecorator?: {
    labels?: Record<string, string>;
  };
  limiters?: {
    labels?: Record<string, string>;
    options?: {
      mode?: Array<{ label: string; value: string }>;
      methods?: Array<{ label: string; value: string }>;
    };
  };
}

// 默认配置
const defaultConfig: FormConfig = {
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

// 中文配置
const chineseConfig: FormConfig = {
  basic: {
    labels: {
      domain: '域名',
      requestPathPattern: '请求路径模式',
      backendForwardPath: '后端转发路径',
      cmdbProject: 'CMDB项目',
      uniqueTip: '域名 + 路径模式必须唯一。'
    },
    options: {
      cmdbProject: [
        { label: '项目A', value: 'a' },
        { label: '项目B', value: 'b' }
      ]
    }
  },
  backends: {
    labels: {
      hostname: '主机名',
      port: '端口',
      protocol: '协议',
      region: '区域',
      dataCenter: '数据中心'
    },
    options: {
      protocol: [
        { label: 'HTTP', value: 'HTTP' },
        { label: 'HTTPS', value: 'HTTPS' }
      ],
      region: [
        { label: '欧洲', value: 'EU' },
        { label: '亚洲', value: 'AS' },
        { label: '美洲', value: 'AM' }
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
      globalStrategy: '全局Cookie策略',
      exception: '例外',
      cookieName: 'Cookie名称',
      strategy: '策略',
      rfcTip: 'Cookie名称必须符合RFC标准。'
    },
    options: {
      strategy: [
        { label: '透传', value: 'passthrough' },
        { label: '持久化', value: 'persist' }
      ]
    }
  },
  headers: {
    labels: {
      request: '请求头',
      response: '响应头',
      name: '名称',
      value: '值',
      override: '覆盖',
      addRequest: '添加请求头',
      addResponse: '添加响应头',
      remove: '删除'
    }
  },
  responseBodyDecorator: {
    labels: {
      errorPage: '错误页面映射',
      statusCode: '状态码',
      pagePath: '页面路径',
      add: '添加映射'
    }
  },
  limiters: {
    labels: {
      ipRule: 'IP/子网规则',
      ipOrCidr: 'IP或CIDR',
      mode: '模式',
      allow: '允许',
      deny: '拒绝',
      addRule: '添加规则',
      maxConcurrent: '最大并发数',
      maxPerMinute: '每分钟最大调用次数',
      allowedMethods: '允许的方法',
      atLeastOne: '至少需要设置一个限制器。'
    },
    options: {
      mode: [
        { label: '允许', value: 'allow' },
        { label: '拒绝', value: 'deny' }
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

// 验证语言参数
function validateLanguage(lang: string): boolean {
  return ['en', 'zh'].includes(lang);
}

// 获取配置
function getConfig(lang: string): FormConfig {
  if (lang === 'zh') {
    return chineseConfig;
  }
  return defaultConfig;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';

    // 验证语言参数
    if (!validateLanguage(lang)) {
      console.error('Form config error: Invalid language parameter:', lang);
      return NextResponse.json(
        { error: '无效的语言参数' },
        { status: 400 }
      );
    }

    const config = getConfig(lang);
    
    console.log(`Form config loaded for language: ${lang}`);
    
    return NextResponse.json(config);

  } catch (error) {
    console.error('Form config error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: '获取表单配置时发生内部错误',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 