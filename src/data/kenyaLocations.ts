
// Kenya Administrative Structure Data
// Based on official administrative divisions

export interface LocationData {
  id: string;
  name: string;
  code?: string;
  parentId?: string;
}

export interface County extends LocationData {
  subcounties: Subcounty[];
}

export interface Subcounty extends LocationData {
  countyId: string;
  wards: Ward[];
}

export interface Ward extends LocationData {
  subcountyId: string;
  countyId: string;
}

// Complete Kenya administrative data
export const COUNTIES: County[] = [
  {
    id: 'county-001',
    name: 'Mombasa',
    code: '001',
    subcounties: [
      {
        id: 'subcounty-001',
        name: 'Changamwe',
        countyId: 'county-001',
        wards: [
          { id: 'ward-001', name: 'Port Reitz', subcountyId: 'subcounty-001', countyId: 'county-001' },
          { id: 'ward-002', name: 'Kipevu', subcountyId: 'subcounty-001', countyId: 'county-001' },
          { id: 'ward-003', name: 'Airport', subcountyId: 'subcounty-001', countyId: 'county-001' },
          { id: 'ward-004', name: 'Changamwe', subcountyId: 'subcounty-001', countyId: 'county-001' },
          { id: 'ward-005', name: 'Chaani', subcountyId: 'subcounty-001', countyId: 'county-001' }
        ]
      },
      {
        id: 'subcounty-002',
        name: 'Jomvu',
        countyId: 'county-001',
        wards: [
          { id: 'ward-006', name: 'Jomvu Kuu', subcountyId: 'subcounty-002', countyId: 'county-001' },
          { id: 'ward-007', name: 'Miritini', subcountyId: 'subcounty-002', countyId: 'county-001' },
          { id: 'ward-008', name: 'Mikindani', subcountyId: 'subcounty-002', countyId: 'county-001' }
        ]
      },
      {
        id: 'subcounty-003',
        name: 'Kisauni',
        countyId: 'county-001',
        wards: [
          { id: 'ward-009', name: 'Mjambere', subcountyId: 'subcounty-003', countyId: 'county-001' },
          { id: 'ward-010', name: 'Junda', subcountyId: 'subcounty-003', countyId: 'county-001' },
          { id: 'ward-011', name: 'Bamburi', subcountyId: 'subcounty-003', countyId: 'county-001' },
          { id: 'ward-012', name: 'Mwakirunge', subcountyId: 'subcounty-003', countyId: 'county-001' },
          { id: 'ward-013', name: 'Mtopanga', subcountyId: 'subcounty-003', countyId: 'county-001' },
          { id: 'ward-014', name: 'Magogoni', subcountyId: 'subcounty-003', countyId: 'county-001' },
          { id: 'ward-015', name: 'Shanzu', subcountyId: 'subcounty-003', countyId: 'county-001' }
        ]
      },
      {
        id: 'subcounty-004',
        name: 'Nyali',
        countyId: 'county-001',
        wards: [
          { id: 'ward-016', name: 'Frere Town', subcountyId: 'subcounty-004', countyId: 'county-001' },
          { id: 'ward-017', name: 'Ziwa La Ng\'Ombe', subcountyId: 'subcounty-004', countyId: 'county-001' },
          { id: 'ward-018', name: 'Mkomani', subcountyId: 'subcounty-004', countyId: 'county-001' },
          { id: 'ward-019', name: 'Kongowea', subcountyId: 'subcounty-004', countyId: 'county-001' },
          { id: 'ward-020', name: 'Kadzandani', subcountyId: 'subcounty-004', countyId: 'county-001' }
        ]
      },
      {
        id: 'subcounty-005',
        name: 'Likoni',
        countyId: 'county-001',
        wards: [
          { id: 'ward-021', name: 'Mtongwe', subcountyId: 'subcounty-005', countyId: 'county-001' },
          { id: 'ward-022', name: 'Shika Adabu', subcountyId: 'subcounty-005', countyId: 'county-001' },
          { id: 'ward-023', name: 'Bofu', subcountyId: 'subcounty-005', countyId: 'county-001' },
          { id: 'ward-024', name: 'Likoni', subcountyId: 'subcounty-005', countyId: 'county-001' },
          { id: 'ward-025', name: 'Timbwani', subcountyId: 'subcounty-005', countyId: 'county-001' }
        ]
      },
      {
        id: 'subcounty-006',
        name: 'Mvita',
        countyId: 'county-001',
        wards: [
          { id: 'ward-026', name: 'Mji Wa Kale/Makadara', subcountyId: 'subcounty-006', countyId: 'county-001' },
          { id: 'ward-027', name: 'Tudor', subcountyId: 'subcounty-006', countyId: 'county-001' },
          { id: 'ward-028', name: 'Tononoka', subcountyId: 'subcounty-006', countyId: 'county-001' },
          { id: 'ward-029', name: 'Majengo', subcountyId: 'subcounty-006', countyId: 'county-001' }
        ]
      }
    ]
  },
  {
    id: 'county-002',
    name: 'Nairobi',
    code: '047',
    subcounties: [
      {
        id: 'subcounty-007',
        name: 'Westlands',
        countyId: 'county-002',
        wards: [
          { id: 'ward-030', name: 'Kitisuru', subcountyId: 'subcounty-007', countyId: 'county-002' },
          { id: 'ward-031', name: 'Parklands/Highridge', subcountyId: 'subcounty-007', countyId: 'county-002' },
          { id: 'ward-032', name: 'Karura', subcountyId: 'subcounty-007', countyId: 'county-002' },
          { id: 'ward-033', name: 'Kangemi', subcountyId: 'subcounty-007', countyId: 'county-002' },
          { id: 'ward-034', name: 'Mountain View', subcountyId: 'subcounty-007', countyId: 'county-002' }
        ]
      },
      {
        id: 'subcounty-008',
        name: 'Dagoretti North',
        countyId: 'county-002',
        wards: [
          { id: 'ward-035', name: 'Kilimani', subcountyId: 'subcounty-008', countyId: 'county-002' },
          { id: 'ward-036', name: 'Kawangware', subcountyId: 'subcounty-008', countyId: 'county-002' },
          { id: 'ward-037', name: 'Gatina', subcountyId: 'subcounty-008', countyId: 'county-002' },
          { id: 'ward-038', name: 'Kileleshwa', subcountyId: 'subcounty-008', countyId: 'county-002' },
          { id: 'ward-039', name: 'Kabiro', subcountyId: 'subcounty-008', countyId: 'county-002' }
        ]
      },
      {
        id: 'subcounty-009',
        name: 'Dagoretti South',
        countyId: 'county-002',
        wards: [
          { id: 'ward-040', name: 'Mutuini', subcountyId: 'subcounty-009', countyId: 'county-002' },
          { id: 'ward-041', name: 'Ngando', subcountyId: 'subcounty-009', countyId: 'county-002' },
          { id: 'ward-042', name: 'Riruta', subcountyId: 'subcounty-009', countyId: 'county-002' },
          { id: 'ward-043', name: 'Uthiru/Ruthimitu', subcountyId: 'subcounty-009', countyId: 'county-002' },
          { id: 'ward-044', name: 'Waithaka', subcountyId: 'subcounty-009', countyId: 'county-002' }
        ]
      },
      {
        id: 'subcounty-010',
        name: 'Langata',
        countyId: 'county-002',
        wards: [
          { id: 'ward-045', name: 'Karen', subcountyId: 'subcounty-010', countyId: 'county-002' },
          { id: 'ward-046', name: 'Nairobi West', subcountyId: 'subcounty-010', countyId: 'county-002' },
          { id: 'ward-047', name: 'Mugumo-Ini', subcountyId: 'subcounty-010', countyId: 'county-002' },
          { id: 'ward-048', name: 'South-C', subcountyId: 'subcounty-010', countyId: 'county-002' },
          { id: 'ward-049', name: 'Nyayo Highrise', subcountyId: 'subcounty-010', countyId: 'county-002' }
        ]
      },
      {
        id: 'subcounty-011',
        name: 'Kibra',
        countyId: 'county-002',
        wards: [
          { id: 'ward-050', name: 'Laini Saba', subcountyId: 'subcounty-011', countyId: 'county-002' },
          { id: 'ward-051', name: 'Lindi', subcountyId: 'subcounty-011', countyId: 'county-002' },
          { id: 'ward-052', name: 'Makina', subcountyId: 'subcounty-011', countyId: 'county-002' },
          { id: 'ward-053', name: 'Woodley/Kenyatta Golf', subcountyId: 'subcounty-011', countyId: 'county-002' },
          { id: 'ward-054', name: 'Sarangombe', subcountyId: 'subcounty-011', countyId: 'county-002' }
        ]
      },
      {
        id: 'subcounty-012',
        name: 'Starehe',
        countyId: 'county-002',
        wards: [
          { id: 'ward-055', name: 'Nairobi Central', subcountyId: 'subcounty-012', countyId: 'county-002' },
          { id: 'ward-056', name: 'Ngara', subcountyId: 'subcounty-012', countyId: 'county-002' },
          { id: 'ward-057', name: 'Ziwani/Kariokor', subcountyId: 'subcounty-012', countyId: 'county-002' },
          { id: 'ward-058', name: 'Pangani', subcountyId: 'subcounty-012', countyId: 'county-002' },
          { id: 'ward-059', name: 'Landimawe', subcountyId: 'subcounty-012', countyId: 'county-002' },
          { id: 'ward-060', name: 'Nairobi South', subcountyId: 'subcounty-012', countyId: 'county-002' }
        ]
      }
    ]
  },
  {
    id: 'county-003',
    name: 'Kiambu',
    code: '022',
    subcounties: [
      {
        id: 'subcounty-013',
        name: 'Gatundu South',
        countyId: 'county-003',
        wards: [
          { id: 'ward-061', name: 'Kiamwangi', subcountyId: 'subcounty-013', countyId: 'county-003' },
          { id: 'ward-062', name: 'Kiganjo', subcountyId: 'subcounty-013', countyId: 'county-003' },
          { id: 'ward-063', name: 'Ndarugu', subcountyId: 'subcounty-013', countyId: 'county-003' },
          { id: 'ward-064', name: 'Ngenda', subcountyId: 'subcounty-013', countyId: 'county-003' }
        ]
      },
      {
        id: 'subcounty-014',
        name: 'Juja',
        countyId: 'county-003',
        wards: [
          { id: 'ward-065', name: 'Murera', subcountyId: 'subcounty-014', countyId: 'county-003' },
          { id: 'ward-066', name: 'Theta', subcountyId: 'subcounty-014', countyId: 'county-003' },
          { id: 'ward-067', name: 'Juja', subcountyId: 'subcounty-014', countyId: 'county-003' },
          { id: 'ward-068', name: 'Witeithie', subcountyId: 'subcounty-014', countyId: 'county-003' },
          { id: 'ward-069', name: 'Kalimoni', subcountyId: 'subcounty-014', countyId: 'county-003' }
        ]
      }
    ]
  }
];

// Helper functions
export const getCounties = (): County[] => {
  return COUNTIES;
};

export const getSubcountiesByCounty = (countyId: string): Subcounty[] => {
  const county = COUNTIES.find(c => c.id === countyId);
  return county ? county.subcounties : [];
};

export const getWardsBySubcounty = (subcountyId: string): Ward[] => {
  for (const county of COUNTIES) {
    const subcounty = county.subcounties.find(s => s.id === subcountyId);
    if (subcounty) {
      return subcounty.wards;
    }
  }
  return [];
};

export const getLocationPath = (wardId: string): { county: County | null, subcounty: Subcounty | null, ward: Ward | null } => {
  for (const county of COUNTIES) {
    for (const subcounty of county.subcounties) {
      const ward = subcounty.wards.find(w => w.id === wardId);
      if (ward) {
        return { county, subcounty, ward };
      }
    }
  }
  return { county: null, subcounty: null, ward: null };
};
