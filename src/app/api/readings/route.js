import { NextResponse } from 'next/server';
import {
  isSalesforceConfigured,
  createSalesforceRecord,
  updateSalesforceRecord,
} from '@/lib/salesforce';
import { mockStore } from '@/lib/mockStore';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      tenantId,
      previousReading,
      currentReading,
      ratePerUnit,
      readingDateTime,
      paymentStatus = 'Pending',
      meterImageUrl = '',
      imagePublicId = '',
      notes = '',
    } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required.' }, { status: 400 });
    }

    const prev = Number(previousReading);
    const curr = Number(currentReading);
    const rate = Number(ratePerUnit);

    if (isNaN(curr) || curr < 0) {
      return NextResponse.json({ error: 'Valid current reading is required.' }, { status: 400 });
    }

    if (curr < prev) {
      return NextResponse.json(
        { error: `Current reading (${curr}) cannot be less than previous reading (${prev}).` },
        { status: 400 }
      );
    }

    const unitsConsumed = Math.round((curr - prev) * 100) / 100;
    const totalAmount = Math.round((unitsConsumed * rate) * 100) / 100;
    const entryDateTime = readingDateTime || new Date().toISOString();

    const readingPayload = {
      Tenant__c: tenantId,
      Previous_Reading__c: prev,
      Current_Reading__c: curr,
      Units_Consumed__c: unitsConsumed,
      Rate_Per_Unit__c: rate,
      Total_Amount__c: totalAmount,
      Payment_Status__c: paymentStatus,
      Paid_Date__c: paymentStatus === 'Paid' ? new Date().toISOString().split('T')[0] : null,
      Reading_DateTime__c: entryDateTime,
      Meter_Image_URL__c: meterImageUrl || null,
      Image_Public_Id__c: imagePublicId || null,
      Notes__c: notes?.trim() || null,
    };

    if (!isSalesforceConfigured()) {
      const created = mockStore.addReading(readingPayload);
      return NextResponse.json({ success: true, reading: created, source: 'demo' });
    }

    // 1. Create Meter_Reading__c record in Salesforce
    const sfReadingRes = await createSalesforceRecord('Meter_Reading__c', readingPayload);

    // 2. Update Latest_Reading__c on Tenant__c
    try {
      await updateSalesforceRecord('Tenant__c', tenantId, {
        Latest_Reading__c: curr,
      });
    } catch (updateErr) {
      console.warn('Could not update Tenant Latest_Reading__c:', updateErr);
    }

    return NextResponse.json({
      success: true,
      id: sfReadingRes.id,
      reading: { Id: sfReadingRes.id, ...readingPayload },
      source: 'salesforce',
    });
  } catch (err) {
    console.error('Error creating meter reading:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
