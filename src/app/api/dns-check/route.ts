import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

export async function POST(request: NextRequest) {
  try {
    const { hostname } = await request.json();

    if (!hostname || typeof hostname !== 'string') {
      return NextResponse.json(
        { error: 'Invalid hostname provided' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const ipAddresses: string[] = [];

    try {
      // 尝试解析IPv4地址
      const ipv4Addresses = await resolve4(hostname);
      ipAddresses.push(...ipv4Addresses);
    } catch (error) {
      // IPv4解析失败，继续尝试IPv6
    }

    try {
      // 尝试解析IPv6地址
      const ipv6Addresses = await resolve6(hostname);
      ipAddresses.push(...ipv6Addresses);
    } catch (error) {
      // IPv6解析失败
    }

    const responseTime = Date.now() - startTime;

    if (ipAddresses.length === 0) {
      return NextResponse.json(
        { 
          error: 'DNS resolution failed',
          details: 'No IP addresses found for the provided hostname',
          responseTime 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      hostname,
      ipAddresses,
      responseTime,
      message: `Successfully resolved ${ipAddresses.length} IP address(es)`
    });

  } catch (error) {
    console.error('DNS check error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 