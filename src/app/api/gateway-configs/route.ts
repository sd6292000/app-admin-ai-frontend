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

// 搜索和过滤配置
function filterConfigs(configs: any[], query: string, status: string, application: string) {
  let filtered = [...configs];

  // 关键字搜索
  if (query.trim()) {
    const searchQuery = query.toLowerCase();
    filtered = filtered.filter(config =>
      config.domain.toLowerCase().includes(searchQuery) ||
      config.requestPathPattern.toLowerCase().includes(searchQuery) ||
      config.application.toLowerCase().includes(searchQuery) ||
      config.effectiveUrl.toLowerCase().includes(searchQuery) ||
      config.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery))
    );
  }

  // 状态过滤
  if (status && status !== 'all') {
    filtered = filtered.filter(config => config.status === status);
  }

  // 应用过滤
  if (application && application !== 'all') {
    filtered = filtered.filter(config => config.application === application);
  }

  return filtered;
}

// GET - 获取配置列表（支持搜索和过滤）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const status = searchParams.get('status') || 'all';
    const application = searchParams.get('application') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 过滤配置
    const filteredConfigs = filterConfigs(mockGatewayConfigs, query, status, application);

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedConfigs = filteredConfigs.slice(startIndex, endIndex);

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      data: paginatedConfigs,
      pagination: {
        page,
        limit,
        total: filteredConfigs.length,
        totalPages: Math.ceil(filteredConfigs.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching gateway configs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gateway configs' },
      { status: 500 }
    );
  }
}

// POST - 创建新配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.domain || !body.requestPathPattern || !body.application) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 检查域名+路径唯一性
    const existingConfig = mockGatewayConfigs.find(
      config => config.domain === body.domain && config.requestPathPattern === body.requestPathPattern
    );
    
    if (existingConfig) {
      return NextResponse.json(
        { success: false, error: 'Domain and path pattern combination already exists' },
        { status: 409 }
      );
    }

    // 创建新配置
    const newConfig = {
      id: Date.now().toString(),
      ...body,
      status: body.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user@company.com', // 实际项目中从认证信息获取
      updatedBy: 'current-user@company.com'
    };

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      data: newConfig,
      message: 'Gateway configuration created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating gateway config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create gateway configuration' },
      { status: 500 }
    );
  }
}

// PUT - 更新配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Configuration ID is required' },
        { status: 400 }
      );
    }

    // 查找现有配置
    const configIndex = mockGatewayConfigs.findIndex(config => config.id === body.id);
    
    if (configIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // 检查域名+路径唯一性（排除当前配置）
    const existingConfig = mockGatewayConfigs.find(
      config => config.id !== body.id && 
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

// DELETE - 删除配置
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Configuration ID is required' },
        { status: 400 }
      );
    }

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