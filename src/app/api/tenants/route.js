import { NextResponse } from 'next/server';
import { isSalesforceConfigured, querySalesforce, createSalesforceRecord } from '@/lib/salesforce';
import { mockStore } from '@/lib/mockStore';

export async function GET() {
  if (!isSalesforceConfigured()) {
    const tenants = mockStore.getTenants();
    // Compute pending totals for mock data
    const enriched = tenants.map((t) => {
      const readings = mockStore.getReadingsByTenant(t.Id);
      const pendingDues = readings
        .filter((r) => r.Payment_Status__c === 'Pending')
        .reduce((sum, r) => sum + (Number(r.Total_Amount__c) || 0), 0);
      const lastReading = readings[readings.length - 1];
      return {
        ...t,
        Pending_Dues__c: pendingDues,
        Latest_Reading__c: lastReading ? lastReading.Current_Reading__c : t.Initial_Reading__c,
        Total_Readings__c: readings.length,
      };
    });
    return NextResponse.json({ tenants: enriched, source: 'demo' });
  }

  try {
    const soql = `
      SELECT Id, Name, Room_Number__c, Phone_Number__c, Email__c, 
             Meter_Number__c, Initial_Reading__c, Latest_Reading__c, 
             Status__c, Move_In_Date__c, Notes__c, CreatedDate
      FROM Tenant__c 
      ORDER BY Room_Number__c ASC
    `;
    const result = await querySalesforce(soql);
    const tenants = result.records || [];

    // Query pending dues per tenant
    let pendingMap = {};
    let countMap = {};
    try {
      const pendingSoql = `
        SELECT Tenant__c, Payment_Status__c, Total_Amount__c 
        FROM Meter_Reading__c
      `;
      const readingsRes = await querySalesforce(pendingSoql);
      (readingsRes.records || []).forEach((r) => {
        const tId = r.Tenant__c;
        countMap[tId] = (countMap[tId] || 0) + 1;
        if (r.Payment_Status__c === 'Pending') {
          pendingMap[tId] = (pendingMap[tId] || 0) + (Number(r.Total_Amount__c) || 0);
        }
      });
    } catch (_) {
      // Aggregation or reading query fallback
    }

    const enriched = tenants.map((t) => ({
      ...t,
      Pending_Dues__c: pendingMap[t.Id] || 0,
      Total_Readings__c: countMap[t.Id] || 0,
    }));

    return NextResponse.json({ tenants: enriched, source: 'salesforce' });
  } catch (err) {
    console.error('Error fetching tenants from Salesforce:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      roomNumber,
      phone,
      email,
      meterNumber,
      initialReading,
      moveInDate,
      notes,
    } = body;

    if (!name || !roomNumber) {
      return NextResponse.json(
        { error: 'Tenant Name and Room Number are required.' },
        { status: 400 }
      );
    }

    const payload = {
      Name: name.trim(),
      Room_Number__c: roomNumber.trim(),
      Phone_Number__c: phone?.trim() || null,
      Email__c: email?.trim() || null,
      Meter_Number__c: meterNumber?.trim() || null,
      Initial_Reading__c: Number(initialReading) || 0,
      Latest_Reading__c: Number(initialReading) || 0,
      Status__c: 'Active',
      Move_In_Date__c: moveInDate || new Date().toISOString().split('T')[0],
      Notes__c: notes?.trim() || null,
    };

    if (!isSalesforceConfigured()) {
      const created = mockStore.addTenant(payload);
      return NextResponse.json({ success: true, tenant: created, source: 'demo' });
    }

    const sfResult = await createSalesforceRecord('Tenant__c', payload);
    return NextResponse.json({
      success: true,
      id: sfResult.id,
      tenant: { Id: sfResult.id, ...payload },
      source: 'salesforce',
    });
  } catch (err) {
    console.error('Error creating tenant:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
