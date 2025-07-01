import { mockDashboardData } from './mock-data';

export const downloadReport = (reportTitle: string, format: string) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${reportTitle.replace(/\s+/g, '_')}_${timestamp}.${format}`;

  if (format === 'csv') {
    downloadCSV(reportTitle, filename);
  } else if (format === 'excel') {
    downloadExcel(reportTitle, filename);
  } else {
    downloadPDF(reportTitle, filename);
  }
};

const downloadCSV = (reportTitle: string, filename: string) => {
  let csvContent = '';
  
  if (reportTitle === 'Donation Analytics') {
    csvContent = generateDonationAnalyticsCSV();
  } else if (reportTitle === 'Emergency Response') {
    csvContent = generateEmergencyResponseCSV();
  } else if (reportTitle === 'Donor Engagement') {
    csvContent = generateDonorEngagementCSV();
  } else {
    csvContent = generateBlockchainAuditCSV();
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadExcel = (reportTitle: string, filename: string) => {
  // Simulate Excel download by creating a structured CSV with Excel-friendly formatting
  let content = '';
  
  if (reportTitle === 'Emergency Response') {
    content = `Emergency Response Analysis Report\n`;
    content += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    content += `Response Time,Count,Percentage\n`;
    mockDashboardData.responseTime.forEach(item => {
      const total = mockDashboardData.responseTime.reduce((sum, r) => sum + r.count, 0);
      const percentage = ((item.count / total) * 100).toFixed(1);
      content += `${item.name},${item.count},${percentage}%\n`;
    });
  }

  const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename.replace('.excel', '.csv'));
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadPDF = (reportTitle: string, filename: string) => {
  // Create a simple HTML report that can be printed as PDF
  const reportWindow = window.open('', '_blank');
  if (!reportWindow) return;

  let htmlContent = '';
  
  if (reportTitle === 'Donation Analytics') {
    htmlContent = generateDonationAnalyticsPDF();
  } else if (reportTitle === 'Blockchain Audit') {
    htmlContent = generateBlockchainAuditPDF();
  }

  reportWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${reportTitle} Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        .header { margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f3f4f6; }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; flex: 1; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      ${htmlContent}
      <script>window.print();</script>
    </body>
    </html>
  `);
  reportWindow.document.close();
};

const generateDonationAnalyticsCSV = () => {
  let csv = 'Date,Donations,Blood Type,Units\n';
  
  mockDashboardData.donationsChart.forEach(item => {
    csv += `${item.name},${item.donations},,\n`;
  });
  
  csv += '\nBlood Type Distribution\n';
  csv += 'Blood Type,Count,Percentage\n';
  
  const total = mockDashboardData.bloodTypeDistribution.reduce((sum, item) => sum + item.value, 0);
  mockDashboardData.bloodTypeDistribution.forEach(item => {
    const percentage = ((item.value / total) * 100).toFixed(1);
    csv += `${item.name},${item.value},${percentage}%\n`;
  });
  
  return csv;
};

const generateEmergencyResponseCSV = () => {
  let csv = 'Response Time Category,Count,Percentage\n';
  
  const total = mockDashboardData.responseTime.reduce((sum, item) => sum + item.count, 0);
  mockDashboardData.responseTime.forEach(item => {
    const percentage = ((item.count / total) * 100).toFixed(1);
    csv += `${item.name},${item.count},${percentage}%\n`;
  });
  
  return csv;
};

const generateDonorEngagementCSV = () => {
  let csv = 'Donor ID,Name,Blood Type,Last Donation,Status\n';
  
  mockDashboardData.donations.forEach(donation => {
    csv += `${donation.donor.id},${donation.donor.name},${donation.bloodType},${donation.date},${donation.status}\n`;
  });
  
  return csv;
};

const generateBlockchainAuditCSV = () => {
  let csv = 'Transaction Hash,Type,Timestamp,Status\n';
  
  mockDashboardData.blockchainActivity.forEach(activity => {
    csv += `${activity.hash},${activity.type},${activity.time},Verified\n`;
  });
  
  return csv;
};

const generateDonationAnalyticsPDF = () => {
  return `
    <div class="header">
      <h1>Donation Analytics Report</h1>
      <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Report Period:</strong> Last 7 days</p>
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <h3>Total Donations</h3>
        <p style="font-size: 24px; font-weight: bold; color: #3b82f6;">${mockDashboardData.stats.todayDonations}</p>
      </div>
      <div class="stat-card">
        <h3>Active Donors</h3>
        <p style="font-size: 24px; font-weight: bold; color: #10b981;">${mockDashboardData.stats.activeDonors}</p>
      </div>
    </div>
    
    <div class="section">
      <h2>Daily Donation Trends</h2>
      <table>
        <thead>
          <tr><th>Day</th><th>Donations</th></tr>
        </thead>
        <tbody>
          ${mockDashboardData.donationsChart.map(item => 
            `<tr><td>${item.name}</td><td>${item.donations}</td></tr>`
          ).join('')}
        </tbody>
      </table>
    </div>
    
    <div class="section">
      <h2>Blood Type Distribution</h2>
      <table>
        <thead>
          <tr><th>Blood Type</th><th>Count</th><th>Percentage</th></tr>
        </thead>
        <tbody>
          ${mockDashboardData.bloodTypeDistribution.map(item => {
            const total = mockDashboardData.bloodTypeDistribution.reduce((sum, i) => sum + i.value, 0);
            const percentage = ((item.value / total) * 100).toFixed(1);
            return `<tr><td>${item.name}</td><td>${item.value}</td><td>${percentage}%</td></tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
};

const generateBlockchainAuditPDF = () => {
  return `
    <div class="header">
      <h1>Blockchain Audit Report</h1>
      <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Total Transactions:</strong> ${mockDashboardData.stats.blockchainTxs}</p>
    </div>
    
    <div class="section">
      <h2>Recent Blockchain Activity</h2>
      <table>
        <thead>
          <tr><th>Transaction Hash</th><th>Type</th><th>Time</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${mockDashboardData.blockchainActivity.map(activity => 
            `<tr><td style="font-family: monospace;">${activity.hash}</td><td>${activity.type}</td><td>${activity.time}</td><td style="color: #10b981;">Verified</td></tr>`
          ).join('')}
        </tbody>
      </table>
    </div>
    
    <div class="section">
      <h2>Transaction Summary</h2>
      <p>All blockchain transactions have been verified and are immutable. The network is operating normally with consistent block times and gas usage within expected parameters.</p>
    </div>
  `;
};
