import { NextResponse } from 'next/server';
import {
  isSalesforceConfigured,
  updateSalesforceRecord,
  deleteSalesforceRecord,
} from '@/lib/salesforce';
import { mockStore } from '@/lib/mockStore';

export async function PATCH(request, { params }) {
  const { id } = params;

  try {
    const body = await request.json();
    const { paymentStatus } = body;

    const updates = {
      Payment_Status__c: paymentStatus,
      Paid_Date__c: paymentStatus === 'Paid' ? new Date().toISOString().split('T')[0] : null,
    };

    if (!isSalesforceConfigured()) {
      const updated = mockStore.updateReading(id, updates);
      return NextResponse.json({ success: true, reading: updated, source: 'demo' });
    }

    await updateSalesforceRecord('Meter_Reading__c', id, updates);
    return NextResponse.json({ success: true, id, updates, source: 'salesforce' });
  } catch (err) {
    console.error('Error updating meter reading:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    if (!isSalesforceConfigured()) {
      return NextResponse.json({ success: true, source: 'demo' });
    }

    await deleteSalesforceRecord('Meter_Reading__c', id);
    return NextResponse.json({ success: true, source: 'salesforce' });
  } catch (err) {
    console.error('Error deleting meter reading:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
