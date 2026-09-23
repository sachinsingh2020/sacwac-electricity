import { NextResponse } from 'next/server';
import {
  isSalesforceConfigured,
  querySalesforce,
  updateSalesforceRecord,
  deleteSalesforceRecord,
} from '@/lib/salesforce';
import { mockStore } from '@/lib/mockStore';

export async function GET(request, { params }) {
  const { id } = params;

  if (!isSalesforceConfigured()) {
    const tenant = mockStore.getTenantById(id);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    const readings = mockStore.getReadingsByTenant(id);
    return NextResponse.json({ tenant, readings, source: 'demo' });
  }

  try {
    const tenantSoql = `
      SELECT Id, Name, Room_Number__c, Phone_Number__c, Email__c, 
             Meter_Number__c, Initial_Reading__c, Latest_Reading__c, 
             Status__c, Move_In_Date__c, Notes__c, CreatedDate
      FROM Tenant__c 
      WHERE Id = '${id}'
      LIMIT 1
    `;
    const tenantRes = await querySalesforce(tenantSoql);
    if (!tenantRes.records || tenantRes.records.length === 0) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    const tenant = tenantRes.records[0];

    // Query all readings for this tenant ordered chronologically (oldest to newest / bottom to top)
    const readingsSoql = `
      SELECT Id, Name, Tenant__c, Reading_DateTime__c, Previous_Reading__c, 
             Current_Reading__c, Units_Consumed__c, Rate_Per_Unit__c, 
             Total_Amount__c, Payment_Status__c, Paid_Date__c, 
             Meter_Image_URL__c, Image_Public_Id__c, Notes__c, CreatedDate
      FROM Meter_Reading__c
      WHERE Tenant__c = '${id}'
      ORDER BY Reading_DateTime__c DESC
    `;
    const readingsRes = await querySalesforce(readingsSoql);
    const readings = readingsRes.records || [];

    return NextResponse.json({
      tenant,
      readings,
      source: 'salesforce',
    });
  } catch (err) {
    console.error('Error fetching tenant details:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { id } = params;

  try {
    const updates = await request.json();

    if (!isSalesforceConfigured()) {
      const updated = mockStore.updateTenant(id, updates);
      return NextResponse.json({ success: true, tenant: updated, source: 'demo' });
    }

    await updateSalesforceRecord('Tenant__c', id, updates);
    return NextResponse.json({ success: true, id, source: 'salesforce' });
  } catch (err) {
    console.error('Error updating tenant:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    if (!isSalesforceConfigured()) {
      return NextResponse.json({ success: true, source: 'demo' });
    }

    await deleteSalesforceRecord('Tenant__c', id);
    return NextResponse.json({ success: true, source: 'salesforce' });
  } catch (err) {
    console.error('Error deleting tenant:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
