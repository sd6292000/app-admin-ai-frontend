import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

// 自定义错误类型
class DnsError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 404) {
    super(message);
    this.name = 'DnsError';
  }
}

// 验证输入参数
function validateHostname(hostname: string): void {
  if (!hostname || typeof hostname !== 'string' || hostname.trim().length === 0) {
    throw new DnsError('无效的主机名', 'INVALID_HOSTNAME', 400);
  }
  
  // 基本的主机名格式验证
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!hostnameRegex.test(hostname.trim())) {
    throw new DnsError('主机名格式无效', 'INVALID_HOSTNAME_FORMAT', 400);
  }
}

// DNS解析函数
async function resolveHostname(hostname: string): Promise<string[]> {
  const ipAddresses: string[] = [];
  
  try {
    // 尝试解析IPv4地址
    const ipv4Addresses = await resolve4(hostname);
    ipAddresses.push(...ipv4Addresses);
  } catch (error) {
    // IPv4解析失败，记录但不抛出错误
    console.log(`IPv4 resolution failed for ${hostname}:`, error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    // 尝试解析IPv6地址
    const ipv6Addresses = await resolve6(hostname);
    ipAddresses.push(...ipv6Addresses);
  } catch (error) {
    // IPv6解析失败，记录但不抛出错误
    console.log(`IPv6 resolution failed for ${hostname}:`, error instanceof Error ? error.message : 'Unknown error');
  }

  return ipAddresses;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 验证请求体
    if (!request.body) {
      console.error('DNS check error: Missing request body');
      return NextResponse.json(
        { error: '请求体缺失' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { hostname } = body;

    // 验证主机名
    try {
      validateHostname(hostname);
    } catch (error) {
      if (error instanceof DnsError) {
        console.error('DNS check validation error:', error.message);
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }
      throw error;
    }

    const trimmedHostname = hostname.trim();
    console.log(`Starting DNS resolution for: ${trimmedHostname}`);

    // 解析主机名
    const ipAddresses = await resolveHostname(trimmedHostname);
    const responseTime = Date.now() - startTime;

    if (ipAddresses.length === 0) {
      console.warn(`DNS resolution failed for ${trimmedHostname}: No IP addresses found`);
      return NextResponse.json(
        { 
          error: 'DNS解析失败',
          details: '未找到该主机名的IP地址',
          hostname: trimmedHostname,
          responseTime 
        },
        { status: 404 }
      );
    }

    console.log(`DNS resolution successful for ${trimmedHostname}: Found ${ipAddresses.length} IP address(es)`);
    
    return NextResponse.json({
      success: true,
      hostname: trimmedHostname,
      ipAddresses,
      responseTime,
      message: `成功解析到 ${ipAddresses.length} 个IP地址`
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('DNS check error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      responseTime
    });

    return NextResponse.json(
      { 
        error: 'DNS解析过程中发生内部错误',
        details: error instanceof Error ? error.message : '未知错误',
        responseTime
      },
      { status: 500 }
    );
  }
} 