import { NextRequest, NextResponse } from 'next/server';
import net from 'net';
import { promisify } from 'util';

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
      reject(new Error('Connection timeout'));
    });
    
    socket.on('error', (error) => {
      socket.destroy();
      reject(error);
    });
    
    // 尝试连接
    socket.connect(port, hostname);
  });
}

export async function POST(request: NextRequest) {
  try {
    const { hostname, port, protocol } = await request.json();

    if (!hostname || typeof hostname !== 'string') {
      return NextResponse.json(
        { error: 'Invalid hostname provided' },
        { status: 400 }
      );
    }

    if (!port || typeof port !== 'number' || port < 1 || port > 65535) {
      return NextResponse.json(
        { error: 'Invalid port provided. Port must be between 1 and 65535' },
        { status: 400 }
      );
    }

    if (!protocol || !['http', 'https'].includes(protocol.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid protocol provided. Must be HTTP or HTTPS' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    
    try {
      // 测试TCP连接
      const responseTime = await testConnection(hostname, port, 10000);
      
      return NextResponse.json({
        success: true,
        hostname,
        port,
        protocol,
        responseTime,
        message: `Connection successful to ${hostname}:${port} (${protocol.toUpperCase()})`
      });

    } catch (error) {
      const totalTime = Date.now() - startTime;
      
      let errorMessage = 'Connection failed';
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Connection timeout';
        } else if (error.message.includes('ECONNREFUSED')) {
          errorMessage = 'Connection refused - server may not be running or port may be closed';
        } else if (error.message.includes('ENOTFOUND')) {
          errorMessage = 'Hostname not found - DNS resolution failed';
        } else if (error.message.includes('EHOSTUNREACH')) {
          errorMessage = 'Host unreachable - network routing issue';
        } else {
          errorMessage = error.message;
        }
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          details: error instanceof Error ? error.message : 'Unknown connection error',
          responseTime: totalTime
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 