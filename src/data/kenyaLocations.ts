
// Kenya Administrative Structure Data
// Based on official IEBC constituency and ward data

export interface LocationData {
  id: string;
  name: string;
  code?: string;
  parentId?: string;
}

export interface County extends LocationData {
  constituencies: Constituency[];
}

export interface Constituency extends LocationData {
  countyId: string;
  wards: Ward[];
}

export interface Ward extends LocationData {
  constituencyId: string;
  countyId: string;
}

// Sample comprehensive data for major counties
export const COUNTIES: County[] = [
  {
    id: 'county-001',
    name: 'Nairobi City',
    code: '047',
    constituencies: [
      {
        id: 'const-001',
        name: 'Westlands',
        countyId: 'county-001',
        wards: [
          { id: 'ward-001', name: 'Kitisuru', constituencyId: 'const-001', countyId: 'county-001' },
          { id: 'ward-002', name: 'Parklands/Highridge', constituencyId: 'const-001', countyId: 'county-001' },
          { id: 'ward-003', name: 'Karura', constituencyId: 'const-001', countyId: 'county-001' },
          { id: 'ward-004', name: 'Kangemi', constituencyId: 'const-001', countyId: 'county-001' },
          { id: 'ward-005', name: 'Mountain View', constituencyId: 'const-001', countyId: 'county-001' }
        ]
      },
      {
        id: 'const-002',
        name: 'Dagoretti North',
        countyId: 'county-001',
        wards: [
          { id: 'ward-006', name: 'Kilimani', constituencyId: 'const-002', countyId: 'county-001' },
          { id: 'ward-007', name: 'Kawangware', constituencyId: 'const-002', countyId: 'county-001' },
          { id: 'ward-008', name: 'Gatina', constituencyId: 'const-002', countyId: 'county-001' },
          { id: 'ward-009', name: 'Kileleshwa', constituencyId: 'const-002', countyId: 'county-001' },
          { id: 'ward-010', name: 'Kabiro', constituencyId: 'const-002', countyId: 'county-001' }
        ]
      },
      {
        id: 'const-003',
        name: 'Langata',
        countyId: 'county-001',
        wards: [
          { id: 'ward-011', name: 'Karen', constituencyId: 'const-003', countyId: 'county-001' },
          { id: 'ward-012', name: 'Nairobi West', constituencyId: 'const-003', countyId: 'county-001' },
          { id: 'ward-013', name: 'Mugumo-ini', constituencyId: 'const-003', countyId: 'county-001' },
          { id: 'ward-014', name: 'South C', constituencyId: 'const-003', countyId: 'county-001' },
          { id: 'ward-015', name: 'Nyayo Highrise', constituencyId: 'const-003', countyId: 'county-001' }
        ]
      },
      {
        id: 'const-004',
        name: 'Starehe',
        countyId: 'county-001',
        wards: [
          { id: 'ward-016', name: 'Nairobi Central', constituencyId: 'const-004', countyId: 'county-001' },
          { id: 'ward-017', name: 'Ngara', constituencyId: 'const-004', countyId: 'county-001' },
          { id: 'ward-018', name: 'Pangani', constituencyId: 'const-004', countyId: 'county-001' },
          { id: 'ward-019', name: 'Ziwani/Kariokor', constituencyId: 'const-004', countyId: 'county-001' },
          { id: 'ward-020', name: 'Landimawe', constituencyId: 'const-004', countyId: 'county-001' }
        ]
      }
    ]
  },
  {
    id: 'county-002',
    name: 'Mombasa',
    code: '001',
    constituencies: [
      {
        id: 'const-005',
        name: 'Mvita',
        countyId: 'county-002',
        wards: [
          { id: 'ward-021', name: 'Mji Wa Kale/Makadara', constituencyId: 'const-005', countyId: 'county-002' },
          { id: 'ward-022', name: 'Tudor', constituencyId: 'const-005', countyId: 'county-002' },
          { id: 'ward-023', name: 'Tononoka', constituencyId: 'const-005', countyId: 'county-002' },
          { id: 'ward-024', name: 'Shimanzi/Ganjoni', constituencyId: 'const-005', countyId: 'county-002' },
          { id: 'ward-025', name: 'Majengo', constituencyId: 'const-005', countyId: 'county-002' }
        ]
      },
      {
        id: 'const-006',
        name: 'Changamwe',
        countyId: 'county-002',
        wards: [
          { id: 'ward-026', name: 'Port Reitz', constituencyId: 'const-006', countyId: 'county-002' },
          { id: 'ward-027', name: 'Kipevu', constituencyId: 'const-006', countyId: 'county-002' },
          { id: 'ward-028', name: 'Airport', constituencyId: 'const-006', countyId: 'county-002' },
          { id: 'ward-029', name: 'Changamwe', constituencyId: 'const-006', countyId: 'county-002' },
          { id: 'ward-030', name: 'Chaani', constituencyId: 'const-006', countyId: 'county-002' }
        ]
      }
    ]
  },
  {
    id: 'county-003',
    name: 'Kiambu',
    code: '022',
    constituencies: [
      {
        id: 'const-007',
        name: 'Kiambu',
        countyId: 'county-003',
        wards: [
          { id: 'ward-031', name: 'Township', constituencyId: 'const-007', countyId: 'county-003' },
          { id: 'ward-032', name: 'Riabai', constituencyId: 'const-007', countyId: 'county-003' },
          { id: 'ward-033', name: 'Ndumberi', constituencyId: 'const-007', countyId: 'county-003' },
          { id: 'ward-034', name: 'Cianda', constituencyId: 'const-007', countyId: 'county-003' },
          { id: 'ward-035', name: 'Karuri', constituencyId: 'const-007', countyId: 'county-003' }
        ]
      },
      {
        id: 'const-008',
        name: 'Juja',
        countyId: 'county-003',
        wards: [
          { id: 'ward-036', name: 'Murera', constituencyId: 'const-008', countyId: 'county-003' },
          { id: 'ward-037', name: 'Theta', constituencyId: 'const-008', countyId: 'county-003' },
          { id: 'ward-038', name: 'Juja', constituencyId: 'const-008', countyId: 'county-003' },
          { id: 'ward-039', name: 'Witeithie', constituencyId: 'const-008', countyId: 'county-003' },
          { id: 'ward-040', name: 'Kalimoni', constituencyId: 'const-008', countyId: 'county-003' }
        ]
      }
    ]
  },
  {
    id: 'county-004',
    name: 'Nakuru',
    code: '032',
    constituencies: [
      {
        id: 'const-009',
        name: 'Nakuru Town East',
        countyId: 'county-004',
        wards: [
          { id: 'ward-041', name: 'Biashara', constituencyId: 'const-009', countyId: 'county-004' },
          { id: 'ward-042', name: 'Flamingo', constituencyId: 'const-009', countyId: 'county-004' },
          { id: 'ward-043', name: 'Menengai West', constituencyId: 'const-009', countyId: 'county-004' },
          { id: 'ward-044', name: 'Crater', constituencyId: 'const-009', countyId: 'county-004' },
          { id: 'ward-045', name: 'Shaabab', constituencyId: 'const-009', countyId: 'county-004' }
        ]
      }
    ]
  },
  {
    id: 'county-005',
    name: 'Kisumu',
    code: '042',
    constituencies: [
      {
        id: 'const-010',
        name: 'Kisumu East',
        countyId: 'county-005',
        wards: [
          { id: 'ward-046', name: 'Railways', constituencyId: 'const-010', countyId: 'county-005' },
          { id: 'ward-047', name: 'Migosi', constituencyId: 'const-010', countyId: 'county-005' },
          { id: 'ward-048', name: 'Shaurimoyo Kaloleni', constituencyId: 'const-010', countyId: 'county-005' },
          { id: 'ward-049', name: 'Market Milimani', constituencyId: 'const-010', countyId: 'county-005' },
          { id: 'ward-050', name: 'Kondele', constituencyId: 'const-010', countyId: 'county-005' }
        ]
      }
    ]
  }
];

// Helper functions
export const getCounties = (): County[] => {
  return COUNTIES;
};

export const getConstituenciesByCounty = (countyId: string): Constituency[] => {
  const county = COUNTIES.find(c => c.id === countyId);
  return county ? county.constituencies : [];
};

export const getWardsByConstituency = (constituencyId: string): Ward[] => {
  for (const county of COUNTIES) {
    const constituency = county.constituencies.find(c => c.id === constituencyId);
    if (constituency) {
      return constituency.wards;
    }
  }
  return [];
};

export const getLocationPath = (wardId: string): { county: County | null, constituency: Constituency | null, ward: Ward | null } => {
  for (const county of COUNTIES) {
    for (const constituency of county.constituencies) {
      const ward = constituency.wards.find(w => w.id === wardId);
      if (ward) {
        return { county, constituency, ward };
      }
    }
  }
  return { county: null, constituency: null, ward: null };
};
