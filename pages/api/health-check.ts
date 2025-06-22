import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/client';

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const checks: HealthCheck[] = [];
  let overallHealth = 0;

  // 1. Database Connection Test
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) throw error;
    
    checks.push({
      name: 'Database Connection',
      status: 'pass',
      message: 'Successfully connected to Supabase',
      details: { profileCount: data?.length || 0 }
    });
    overallHealth += 20;
  } catch (error) {
    checks.push({
      name: 'Database Connection',
      status: 'fail',
      message: 'Failed to connect to database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // 2. Tables Existence Test
  try {
    const tableChecks = await Promise.allSettled([
      supabase.from('profiles').select('count', { count: 'exact', head: true }),
      supabase.from('dj_rooms').select('count', { count: 'exact', head: true }),
      supabase.from('matches').select('count', { count: 'exact', head: true }),
      supabase.from('chat_messages').select('count', { count: 'exact', head: true }),
    ]);

    const successfulTables = tableChecks.filter(result => result.status === 'fulfilled').length;
    const totalTables = tableChecks.length;

    if (successfulTables === totalTables) {
      checks.push({
        name: 'Database Schema',
        status: 'pass',
        message: `All ${totalTables} tables found`,
        details: { tablesFound: successfulTables, totalTables }
      });
      overallHealth += 20;
    } else {
      checks.push({
        name: 'Database Schema',
        status: 'fail',
        message: `Missing tables: ${totalTables - successfulTables}/${totalTables}`,
        details: { tablesFound: successfulTables, totalTables }
      });
    }
  } catch (error) {
    checks.push({
      name: 'Database Schema',
      status: 'fail',
      message: 'Unable to verify table structure',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // 3. Daily.co API Test
  const dailyApiKey = process.env.DAILY_API_KEY;
  if (dailyApiKey) {
    try {
      const response = await fetch('https://api.daily.co/v1/rooms', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${dailyApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        checks.push({
          name: 'Daily.co API',
          status: 'pass',
          message: 'Daily.co API key is valid',
          details: { apiKeyConfigured: true }
        });
        overallHealth += 20;
      } else {
        checks.push({
          name: 'Daily.co API',
          status: 'fail',
          message: 'Daily.co API key is invalid',
          details: { statusCode: response.status }
        });
      }
    } catch (error) {
      checks.push({
        name: 'Daily.co API',
        status: 'fail',
        message: 'Failed to connect to Daily.co API',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    checks.push({
      name: 'Daily.co API',
      status: 'fail',
      message: 'Daily.co API key not configured',
      details: { envVarMissing: 'DAILY_API_KEY' }
    });
  }

  // 4. Supabase Auth Test
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    checks.push({
      name: 'Supabase Auth',
      status: 'pass',
      message: 'Supabase Auth is configured',
      details: { authConfigured: true }
    });
    overallHealth += 20;
  } catch (error) {
    checks.push({
      name: 'Supabase Auth',
      status: 'fail',
      message: 'Supabase Auth configuration error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // 5. Environment Variables Test
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length === 0) {
    checks.push({
      name: 'Environment Variables',
      status: 'pass',
      message: 'All required environment variables are set',
      details: { requiredVars: requiredEnvVars.length, missingVars: 0 }
    });
    overallHealth += 20;
  } else {
    checks.push({
      name: 'Environment Variables',
      status: 'warning',
      message: `Missing environment variables: ${missingEnvVars.join(', ')}`,
      details: { missingVars: missingEnvVars }
    });
    overallHealth += 10;
  }

  // Calculate overall status
  const failedChecks = checks.filter(check => check.status === 'fail').length;
  const warningChecks = checks.filter(check => check.status === 'warning').length;
  
  let overallStatus: 'healthy' | 'warning' | 'critical';
  if (failedChecks === 0 && warningChecks === 0) {
    overallStatus = 'healthy';
  } else if (failedChecks <= 1) {
    overallStatus = 'warning';
  } else {
    overallStatus = 'critical';
  }

  // Response
  const response = {
    status: overallStatus,
    health: overallHealth,
    timestamp: new Date().toISOString(),
    checks,
    summary: {
      total: checks.length,
      passed: checks.filter(c => c.status === 'pass').length,
      warnings: warningChecks,
      failed: failedChecks
    },
    recommendations: [] as string[]
  };

  // Add recommendations
  if (failedChecks > 0) {
    response.recommendations.push('Fix failed health checks before deploying to production');
  }
  
  if (!dailyApiKey) {
    response.recommendations.push('Configure Daily.co API key for video streaming functionality');
  }

  if (missingEnvVars.length > 0) {
    response.recommendations.push('Set all required environment variables');
  }

  if (overallHealth < 80) {
    response.recommendations.push('Complete database setup by running the quick-setup.sql script');
  }

  res.status(200).json(response);
}
