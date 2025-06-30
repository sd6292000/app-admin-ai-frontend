import { NextRequest, NextResponse } from 'next/server';
import net from 'net';

// 自定义错误类型
class ConnectionError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 503) {
    super(message);
    this.name = 'ConnectionError';
  }
}

// 创建连接测试函数
function testConnection(hostname: string, port: number, timeout: number = 5000): Promise<number> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const socket = new net.Socket();
    
    // 设置超时
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      const responseTime = Date.now() - startTime;
      socket.destroy();
      resolve(responseTime);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      reject(new ConnectionError('连接超时', 'TIMEOUT'));
    });
    
    socket.on('error', (error) => {
      socket.destroy();
      reject(error);
    });
    
    // 尝试连接
    socket.connect(port, hostname);
  });
}

// 验证输入参数
function validateInput(hostname: string, port: number, protocol: string): void {
  if (!hostname || typeof hostname !== 'string' || hostname.trim().length === 0) {
    throw new ConnectionError('无效的主机名', 'INVALID_HOSTNAME', 400);
  }

  if (!port || typeof port !== 'number' || port < 1 || port > 65535) {
    throw new ConnectionError('无效的端口号。端口必须在1到65535之间', 'INVALID_PORT', 400);
  }

  if (!protocol || !['http', 'https'].includes(protocol.toLowerCase())) {
    throw new ConnectionError('无效的协议。必须是HTTP或HTTPS', 'INVALID_PROTOCOL', 400);
  }
}

// 处理连接错误
function handleConnectionError(error: any): { message: string; statusCode: number } {
  if (error instanceof ConnectionError) {
    return { message: error.message, statusCode: error.statusCode };
  }

  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      return { message: '连接超时', statusCode: 503 };
    }
    if (error.message.includes('ECONNREFUSED')) {
      return { message: '连接被拒绝 - 服务器可能未运行或端口已关闭', statusCode: 503 };
    }
    if (error.message.includes('ENOTFOUND')) {
      return { message: '主机名未找到 - DNS解析失败', statusCode: 404 };
    }
    if (error.message.includes('EHOSTUNREACH')) {
      return { message: '主机不可达 - 网络路由问题', statusCode: 503 };
    }
    return { message: error.message, statusCode: 503 };
  }

  return { message: '未知连接错误', statusCode: 500 };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 验证请求体
    if (!request.body) {
      console.error('Connection test error: Missing request body');
      return NextResponse.json(
        { error: '请求体缺失' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { hostname, port, protocol } = body;

    // 验证输入参数
    try {
      validateInput(hostname, port, protocol);
    } catch (error) {
      if (error instanceof ConnectionError) {
        console.error('Connection test validation error:', error.message);
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }
      throw error;
    }

    // 测试TCP连接
    const responseTime = await testConnection(hostname, port, 10000);
    const totalTime = Date.now() - startTime;
    
    console.log(`Connection test successful: ${hostname}:${port} (${protocol.toUpperCase()}) - ${responseTime}ms`);
    
    return NextResponse.json({
      success: true,
      hostname,
      port,
      protocol,
      responseTime,
      totalTime,
      message: `连接成功到 ${hostname}:${port} (${protocol.toUpperCase()})`
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    const { message, statusCode } = handleConnectionError(error);
    
    console.error('Connection test error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      totalTime
    });

    return NextResponse.json(
      { 
        error: message,
        details: error instanceof Error ? error.message : '未知连接错误',
        totalTime
      },
      { status: statusCode }
    );
  }
} 