export const mockDashboardData = {
  stats: {
    todayDonations: 247,
    emergencyRequests: 12,
    activeDonors: 1847,
    blockchainTxs: 89421,
  },
  
  emergencyAlerts: [
    {
      id: "1",
      message: "Critical Blood Requests Active",
      count: 3
    }
  ],

  donationsChart: [
    { name: 'Mon', donations: 12 },
    { name: 'Tue', donations: 19 },
    { name: 'Wed', donations: 15 },
    { name: 'Thu', donations: 25 },
    { name: 'Fri', donations: 22 },
    { name: 'Sat', donations: 18 },
    { name: 'Sun', donations: 24 },
  ],

  bloodTypeDistribution: [
    { name: 'A+', value: 30 },
    { name: 'O-', value: 15 },
    { name: 'B+', value: 25 },
    { name: 'AB+', value: 10 },
    { name: 'A-', value: 8 },
    { name: 'B-', value: 7 },
    { name: 'AB-', value: 5 },
    { name: 'O+', value: 12 },
  ],

  responseTime: [
    { name: '< 5 min', count: 45 },
    { name: '5-10 min', count: 35 },
    { name: '10-15 min', count: 15 },
    { name: '15-20 min', count: 8 },
    { name: '20+ min', count: 2 },
  ],

  donorActivity: [
    { x: 8, y: 1, value: 10 },
    { x: 9, y: 1, value: 15 },
    { x: 10, y: 1, value: 8 },
    { x: 11, y: 2, value: 12 },
    { x: 12, y: 2, value: 25 },
    { x: 13, y: 2, value: 18 },
    { x: 14, y: 3, value: 5 },
    { x: 15, y: 3, value: 20 },
    { x: 16, y: 3, value: 14 },
  ],

  bloodInventory: [
    {
      type: 'A+',
      name: 'Type A+ Blood',
      units: 342,
      percentage: 78,
      level: 'good' as const
    },
    {
      type: 'O-',
      name: 'Type O- Blood',
      units: 89,
      percentage: 23,
      level: 'critical' as const
    },
    {
      type: 'B+',
      name: 'Type B+ Blood',
      units: 156,
      percentage: 45,
      level: 'medium' as const
    },
    {
      type: 'AB+',
      name: 'Type AB+ Blood',
      units: 298,
      percentage: 89,
      level: 'good' as const
    },
  ],

  criticalRequests: [
    {
      type: 'O- Blood',
      urgency: 'URGENT',
      hospital: 'General Hospital',
      time: '2 mins ago'
    },
    {
      type: 'A+ Blood',
      urgency: 'HIGH',
      hospital: 'Metro Medical Center',
      time: '8 mins ago'
    },
    {
      type: 'B- Blood',
      urgency: 'MEDIUM',
      hospital: 'City Hospital',
      time: '15 mins ago'
    },
  ],

  blockchainActivity: [
    {
      type: 'Donation Verified',
      hash: '0x7a3d...8e9f',
      time: '2s'
    },
    {
      type: 'Request Matched',
      hash: '0x2b8c...4d1a',
      time: '5s'
    },
    {
      type: 'Transfer Initiated',
      hash: '0x9f2e...6c7b',
      time: '12s'
    },
  ],

  donations: [
    {
      id: '1',
      donor: {
        name: 'John Smith',
        id: 'ID: #D001234',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32'
      },
      bloodType: 'A+',
      date: '2024-01-15 10:30 AM',
      location: 'Downtown Center',
      status: 'Verified' as const,
      txHash: '0x7a3d...8e9f'
    },
    {
      id: '2',
      donor: {
        name: 'Emily Johnson',
        id: 'ID: #D001235',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32'
      },
      bloodType: 'O-',
      date: '2024-01-15 09:15 AM',
      location: 'Metro Center',
      status: 'Processing' as const,
      txHash: '0x2b8c...4d1a'
    },
    {
      id: '3',
      donor: {
        name: 'Michael Chen',
        id: 'ID: #D001236',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32'
      },
      bloodType: 'B+',
      date: '2024-01-15 08:45 AM',
      location: 'Eastside Clinic',
      status: 'Verified' as const,
      txHash: '0x9f2e...6c7b'
    },
    {
      id: '4',
      donor: {
        name: 'Sarah Wilson',
        id: 'ID: #D001237',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32'
      },
      bloodType: 'AB-',
      date: '2024-01-15 08:00 AM',
      location: 'North Clinic',
      status: 'Pending' as const,
      txHash: '0x1a4b...9c8d'
    },
    {
      id: '5',
      donor: {
        name: 'David Brown',
        id: 'ID: #D001238',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32'
      },
      bloodType: 'O+',
      date: '2024-01-14 16:30 PM',
      location: 'South Center',
      status: 'Verified' as const,
      txHash: '0x3e7f...2b5a'
    },
    {
      id: '6',
      donor: {
        name: 'Lisa Martinez',
        id: 'ID: #D001239',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32'
      },
      bloodType: 'A-',
      date: '2024-01-14 15:45 PM',
      location: 'West Branch',
      status: 'Processing' as const,
      txHash: '0x8d2c...6f4e'
    },
    {
      id: '7',
      donor: {
        name: 'Robert Garcia',
        id: 'ID: #D001240',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32'
      },
      bloodType: 'B-',
      date: '2024-01-14 14:30 PM',
      location: 'Central Hub',
      status: 'Verified' as const,
      txHash: '0x5b9a...1e3c'
    },
    {
      id: '8',
      donor: {
        name: 'Jennifer Lee',
        id: 'ID: #D001241',
        avatar: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32'
      },
      bloodType: 'AB+',
      date: '2024-01-14 13:15 PM',
      location: 'University Clinic',
      status: 'Verified' as const,
      txHash: '0x4f8e...7a2d'
    },
    {
      id: '9',
      donor: {
        name: 'Mark Thompson',
        id: 'ID: #D001242',
        avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32'
      },
      bloodType: 'O-',
      date: '2024-01-14 12:00 PM',
      location: 'Community Center',
      status: 'Processing' as const,
      txHash: '0x6c1b...9d5f'
    },
    {
      id: '10',
      donor: {
        name: 'Amanda Davis',
        id: 'ID: #D001243',
        avatar: 'https://images.unsplash.com/photo-1488508872907-592763824245?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32'
      },
      bloodType: 'A+',
      date: '2024-01-14 11:30 AM',
      location: 'Regional Hospital',
      status: 'Verified' as const,
      txHash: '0x2e4a...8c6b'
    },
  ]
};
