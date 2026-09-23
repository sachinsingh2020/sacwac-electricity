/**
 * In-memory fallback store used when Salesforce credentials are not yet configured in .env.local
 * Allows full local preview and testing of all features.
 */

let mockTenants = [
  {
    Id: 'demo-tenant-1',
    Name: 'Amit Sharma',
    Room_Number__c: 'Room 101',
    Phone_Number__c: '+91 9876543210',
    Email__c: 'amit.sharma@example.com',
    Meter_Number__c: 'MTR-101-A',
    Initial_Reading__c: 1250,
    Latest_Reading__c: 1410,
    Status__c: 'Active',
    Move_In_Date__c: '2026-01-10',
    Notes__c: 'First floor corner room with AC.',
  },
  {
    Id: 'demo-tenant-2',
    Name: 'Priya Verma',
    Room_Number__c: 'Room 102',
    Phone_Number__c: '+91 9123456780',
    Email__c: 'priya.v@example.com',
    Meter_Number__c: 'MTR-102-B',
    Initial_Reading__c: 890,
    Latest_Reading__c: 980,
    Status__c: 'Active',
    Move_In_Date__c: '2026-02-01',
    Notes__c: 'Ground floor room.',
  },
  {
    Id: 'demo-tenant-3',
    Name: 'Rahul Mehta',
    Room_Number__c: 'Room 201',
    Phone_Number__c: '+91 9988776655',
    Email__c: '',
    Meter_Number__c: 'MTR-201-C',
    Initial_Reading__c: 500,
    Latest_Reading__c: 500,
    Status__c: 'Active',
    Move_In_Date__c: '2026-03-15',
    Notes__c: 'New tenant moved in recently.',
  }
];

let mockReadings = [
  {
    Id: 'demo-mr-1',
    Name: 'MR-00001',
    Tenant__c: 'demo-tenant-1',
    Reading_DateTime__c: '2026-02-10T10:30:00.000Z',
    Previous_Reading__c: 1250,
    Current_Reading__c: 1320,
    Units_Consumed__c: 70,
    Rate_Per_Unit__c: 10,
    Total_Amount__c: 700,
    Payment_Status__c: 'Paid',
    Paid_Date__c: '2026-02-12',
    Meter_Image_URL__c: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    Notes__c: 'February bill - paid via UPI.',
  },
  {
    Id: 'demo-mr-2',
    Name: 'MR-00002',
    Tenant__c: 'demo-tenant-1',
    Reading_DateTime__c: '2026-03-10T11:15:00.000Z',
    Previous_Reading__c: 1320,
    Current_Reading__c: 1410,
    Units_Consumed__c: 90,
    Rate_Per_Unit__c: 10,
    Total_Amount__c: 900,
    Payment_Status__c: 'Pending',
    Paid_Date__c: null,
    Meter_Image_URL__c: '',
    Notes__c: 'March bill - pending.',
  },
  {
    Id: 'demo-mr-3',
    Name: 'MR-00003',
    Tenant__c: 'demo-tenant-2',
    Reading_DateTime__c: '2026-03-01T09:00:00.000Z',
    Previous_Reading__c: 890,
    Current_Reading__c: 980,
    Units_Consumed__c: 90,
    Rate_Per_Unit__c: 10,
    Total_Amount__c: 900,
    Payment_Status__c: 'Pending',
    Paid_Date__c: null,
    Meter_Image_URL__c: '',
    Notes__c: 'March bill.',
  }
];

export const mockStore = {
  getTenants: () => [...mockTenants],
  getTenantById: (id) => mockTenants.find((t) => t.Id === id) || null,
  addTenant: (tenantData) => {
    const newTenant = {
      Id: `demo-tenant-${Date.now()}`,
      Name: tenantData.Name,
      Room_Number__c: tenantData.Room_Number__c,
      Phone_Number__c: tenantData.Phone_Number__c || '',
      Email__c: tenantData.Email__c || '',
      Meter_Number__c: tenantData.Meter_Number__c || '',
      Initial_Reading__c: Number(tenantData.Initial_Reading__c) || 0,
      Latest_Reading__c: Number(tenantData.Initial_Reading__c) || 0,
      Status__c: tenantData.Status__c || 'Active',
      Move_In_Date__c: tenantData.Move_In_Date__c || new Date().toISOString().split('T')[0],
      Notes__c: tenantData.Notes__c || '',
    };
    mockTenants.unshift(newTenant);
    return newTenant;
  },
  updateTenant: (id, updates) => {
    const idx = mockTenants.findIndex((t) => t.Id === id);
    if (idx !== -1) {
      mockTenants[idx] = { ...mockTenants[idx], ...updates };
      return mockTenants[idx];
    }
    return null;
  },
  getReadingsByTenant: (tenantId) => {
    return mockReadings
      .filter((r) => r.Tenant__c === tenantId)
      .sort((a, b) => new Date(a.Reading_DateTime__c) - new Date(b.Reading_DateTime__c)); // bottom to top
  },
  addReading: (readingData) => {
    const newReading = {
      Id: `demo-mr-${Date.now()}`,
      Name: `MR-${String(mockReadings.length + 1).padStart(5, '0')}`,
      Tenant__c: readingData.Tenant__c,
      Reading_DateTime__c: readingData.Reading_DateTime__c || new Date().toISOString(),
      Previous_Reading__c: Number(readingData.Previous_Reading__c),
      Current_Reading__c: Number(readingData.Current_Reading__c),
      Units_Consumed__c: Number(readingData.Units_Consumed__c),
      Rate_Per_Unit__c: Number(readingData.Rate_Per_Unit__c),
      Total_Amount__c: Number(readingData.Total_Amount__c),
      Payment_Status__c: readingData.Payment_Status__c || 'Pending',
      Paid_Date__c: readingData.Paid_Date__c || null,
      Meter_Image_URL__c: readingData.Meter_Image_URL__c || '',
      Image_Public_Id__c: readingData.Image_Public_Id__c || '',
      Notes__c: readingData.Notes__c || '',
    };
    mockReadings.push(newReading);

    // Update tenant latest reading
    const tenant = mockTenants.find((t) => t.Id === readingData.Tenant__c);
    if (tenant) {
      tenant.Latest_Reading__c = newReading.Current_Reading__c;
    }

    return newReading;
  },
  updateReading: (id, updates) => {
    const idx = mockReadings.findIndex((r) => r.Id === id);
    if (idx !== -1) {
      mockReadings[idx] = { ...mockReadings[idx], ...updates };
      return mockReadings[idx];
    }
    return null;
  }
};
