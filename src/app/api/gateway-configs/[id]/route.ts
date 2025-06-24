import { NextRequest, NextResponse } from 'next/server';

// 模拟数据库数据
const mockGatewayConfigs = [
  {
    id: '1',
    domain: 'api.example.com',
    requestPathPattern: '/api/v1/*',
    backendForwardPath: '/backend/v1',
    application: 'User Management System',
    status: 'active',
    createdBy: 'john.doe@company.com',
    createdAt: '2024-01-15T10:30:00Z',
    updatedBy: 'jane.smith@company.com',
    updatedAt: '2024-01-20T14:45:00Z',
    backends: [
      { hostname: 'backend1.example.com', port: 8080, protocol: 'HTTP', enabled: true },
      { hostname: 'backend2.example.com', port: 8080, protocol: 'HTTP', enabled: true }
    ],
    effectiveUrl: 'https://api.example.com/api/v1/*',
    tags: ['production', 'user-api'],
    headers: [
      { name: 'X-API-Version', value: 'v1', enabled: true },
      { name: 'X-Request-ID', value: '${uuid}', enabled: true },
      { name: 'Content-Security-Policy', value: "default-src 'self'", enabled: false }
    ],
    cookies: [
      { name: 'session_id', value: '${session.id}', domain: '.example.com', path: '/', enabled: true },
      { name: 'user_pref', value: '${user.preferences}', domain: '.example.com', path: '/api', enabled: false }
    ],
    limiters: [
      { type: 'rate', value: 1000, unit: 'requests/minute', enabled: true },
      { type: 'concurrent', value: 50, unit: 'connections', enabled: true },
      { type: 'bandwidth', value: 10, unit: 'MB/s', enabled: false }
    ]
  },
  {
    id: '2',
    domain: 'admin.example.com',
    requestPathPattern: '/admin/*',
    backendForwardPath: '/admin-panel',
    application: 'Admin Dashboard',
    status: 'active',
    createdBy: 'admin@company.com',
    createdAt: '2024-01-10T09:15:00Z',
    updatedBy: 'admin@company.com',
    updatedAt: '2024-01-18T16:20:00Z',
    backends: [
      { hostname: 'admin-backend.example.com', port: 8080, protocol: 'HTTPS', enabled: true }
    ],
    effectiveUrl: 'https://admin.example.com/admin/*',
    tags: ['production', 'admin'],
    headers: [
      { name: 'X-Admin-Token', value: '${admin.token}', enabled: true }
    ],
    cookies: [
      { name: 'admin_session', value: '${admin.session}', domain: '.example.com', path: '/admin', enabled: true }
    ],
    limiters: [
      { type: 'rate', value: 100, unit: 'requests/minute', enabled: true },
      { type: 'concurrent', value: 10, unit: 'connections', enabled: true }
    ]
  },
  {
    id: '3',
    domain: 'test.example.com',
    requestPathPattern: '/test/*',
    backendForwardPath: '/test-backend',
    application: 'Testing Environment',
    status: 'draft',
    createdBy: 'dev@company.com',
    createdAt: '2024-01-25T11:00:00Z',
    updatedBy: 'dev@company.com',
    updatedAt: '2024-01-25T11:00:00Z',
    backends: [
      { hostname: 'test-backend.example.com', port: 8080, protocol: 'HTTP', enabled: false }
    ],
    effectiveUrl: 'http://test.example.com/test/*',
    tags: ['testing', 'dev'],
    headers: [],
    cookies: [],
    limiters: []
  }
];

// GET - 获取单个配置详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 查找配置
    const config = mockGatewayConfigs.find(config => config.id === id);
    
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching gateway config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gateway configuration' },
      { status: 500 }
    );
  }
}

// PUT - 更新单个配置
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // 查找配置
    const configIndex = mockGatewayConfigs.findIndex(config => config.id === id);
    
    if (configIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // 检查域名+路径唯一性（排除当前配置）
    const existingConfig = mockGatewayConfigs.find(
      config => config.id !== id && 
      config.domain === body.domain && 
      config.requestPathPattern === body.requestPathPattern
    );
    
    if (existingConfig) {
      return NextResponse.json(
        { success: false, error: 'Domain and path pattern combination already exists' },
        { status: 409 }
      );
    }

    // 更新配置
    const updatedConfig = {
      ...mockGatewayConfigs[configIndex],
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user@company.com' // 实际项目中从认证信息获取
    };

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      data: updatedConfig,
      message: 'Gateway configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating gateway config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update gateway configuration' },
      { status: 500 }
    );
  }
}

// DELETE - 删除单个配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 查找配置
    const configIndex = mockGatewayConfigs.findIndex(config => config.id === id);
    
    if (configIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Gateway configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gateway config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete gateway configuration' },
      { status: 500 }
    );
  }
} 