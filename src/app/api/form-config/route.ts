import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'en';

  // 多语言mock数据
  const data = lang === 'zh'
    ? {
        basic: {
          labels: {
            domain: '域名',
            requestPathPattern: '请求路径Pattern',
            backendForwardPath: '后端转发路径',
            cmdbProject: 'CMDB项目',
            uniqueTip: '域名+路径Pattern必须唯一'
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
            rfcTip: 'Cookie名称需符合RFC标准'
          },
          options: {
            strategy: [
              { label: '透传', value: 'passthrough' },
              { label: '持久', value: 'persist' }
            ]
          }
        },
        headers: {
          labels: {
            request: '请求Header',
            response: '响应Header',
            name: '名称',
            value: '值',
            override: '覆盖',
            addRequest: '添加Request Header',
            addResponse: '添加Response Header',
            remove: '删除'
          }
        },
        responseBodyDecorator: {
          labels: {
            errorPage: '错误页映射',
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
            maxConcurrent: '最大并发',
            maxPerMinute: '每分钟最大调用数',
            allowedMethods: '允许方法',
            atLeastOne: '至少设置一项限制'
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
      }
    : {
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

  return NextResponse.json(data);
} 