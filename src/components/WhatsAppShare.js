'use client';
import { Share2 } from 'lucide-react';

export default function WhatsAppShare({ tenant, reading }) {
  if (!reading || !tenant) return null;

  const dateStr = reading.Reading_DateTime__c
    ? new Date(reading.Reading_DateTime__c).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN');

  const text = `⚡ *Electricity Bill - ${tenant.Room_Number__c}*
Tenant: *${tenant.Name}*
Date: ${dateStr}
---------------------------------
• Previous Reading: ${reading.Previous_Reading__c} units
• Current Reading: ${reading.Current_Reading__c} units
• Units Consumed: *${reading.Units_Consumed__c} units*
• Rate per Unit: ₹${reading.Rate_Per_Unit__c}
---------------------------------
💰 *Total Amount Due: ₹${reading.Total_Amount__c}*
Status: *${reading.Payment_Status__c || 'Pending'}*
${reading.Meter_Image_URL__c ? `\n📸 Meter Proof Photo: ${reading.Meter_Image_URL__c}` : ''}
${reading.Notes__c ? `\nNote: ${reading.Notes__c}` : ''}

Please clear the dues at your earliest convenience. Thank you!`;

  const handleShare = () => {
    const phone = tenant.Phone_Number__c ? tenant.Phone_Number__c.replace(/[^0-9]/g, '') : '';
    const whatsappUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleShare}
      title="Send Bill via WhatsApp"
      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95 transition-all flex items-center gap-1 text-[11px] font-semibold border border-emerald-200"
    >
      <Share2 className="w-3.5 h-3.5" />
      <span>WhatsApp</span>
    </button>
  );
}
