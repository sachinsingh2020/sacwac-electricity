import { NextResponse } from 'next/server';
import { isSalesforceConfigured, querySalesforce } from '@/lib/salesforce';
import { isCloudinaryConfigured } from '@/lib/cloudinary';

export async function GET() {
  const sfConfigured = isSalesforceConfigured();
  const cldConfigured = isCloudinaryConfigured();

  let sfConnected = false;
  let sfError = null;

  if (sfConfigured) {
    try {
      // Test SOQL query
      await querySalesforce('SELECT Id FROM Tenant__c LIMIT 1');
      sfConnected = true;
    } catch (err) {
      sfError = err.message || 'Failed to connect to Salesforce';
    }
  }

  return NextResponse.json({
    salesforce: {
      configured: sfConfigured,
      connected: sfConnected,
      error: sfError,
    },
    cloudinary: {
      configured: cldConfigured,
    },
    mode: sfConfigured && sfConnected ? 'live' : 'demo',
  });
}
