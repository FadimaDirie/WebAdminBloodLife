import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, AlertTriangle, Users, Link as LinkIcon, Download } from "lucide-react";
import { downloadReport } from "@/lib/download-utils";

const reports = [
  {
    title: "Donation Analytics",
    description: "Comprehensive donation trends",
    lastGenerated: "2 hours ago",
    icon: BarChart3,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    type: "pdf"
  },
  {
    title: "Emergency Response",
    description: "Response time analysis",
    lastGenerated: "4 hours ago",
    icon: AlertTriangle,
    bgColor: "bg-red-100",
    iconColor: "text-red-600",
    type: "excel"
  },
  {
    title: "Donor Engagement",
    description: "Donor activity patterns",
    lastGenerated: "1 day ago",
    icon: Users,
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
    type: "csv"
  },
  {
    title: "Blockchain Audit",
    description: "Transaction verification",
    lastGenerated: "3 days ago",
    icon: LinkIcon,
    bgColor: "bg-gray-100",
    iconColor: "text-gray-600",
    type: "pdf"
  }
];

export default function ReportsSection() {
  const handleDownload = (reportTitle: string, type: string) => {
    downloadReport(reportTitle, type);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Generate Reports</CardTitle>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            Schedule Report
          </Button>
          <Button size="sm">
            Generate Now
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.map((report, index) => {
            const Icon = report.icon;
            return (
              <div 
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 ${report.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${report.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{report.title}</h4>
                    <p className="text-sm text-gray-500">{report.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Last generated: {report.lastGenerated}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs"
                    onClick={() => handleDownload(report.title, report.type)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download {report.type.toUpperCase()}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
