import { Button } from "@/components/ui/button";
import { Download, BarChart2, AlertTriangle, Users, Link2 } from "lucide-react";

const reports = [
  {
    icon: <BarChart2 className="w-7 h-7 text-blue-500" />, // Donation Analytics
    title: "Donation Analytics",
    desc: "Comprehensive donation trends",
    last: "2 hours ago",
    download: "PDF",
  },
  {
    icon: <AlertTriangle className="w-7 h-7 text-red-400" />, // Emergency Response
    title: "Emergency Response",
    desc: "Response time analysis",
    last: "4 hours ago",
    download: "EXCEL",
  },
  {
    icon: <Users className="w-7 h-7 text-green-500" />, // Donor Engagement
    title: "Donor Engagement",
    desc: "Donor activity patterns",
    last: "1 day ago",
    download: "CSV",
  },
  {
    icon: <Link2 className="w-7 h-7 text-gray-500" />, // Blockchain Audit
    title: "Blockchain Audit",
    desc: "Transaction verification",
    last: "3 days ago",
    download: "PDF",
  },
];

export default function ReportsSection() {
  return (
    <div className="bg-white/80 border border-red-100 rounded-2xl p-8 shadow-xl mt-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Generate Reports</h2>
        <div className="flex gap-3">
          <Button variant="outline" className="font-semibold border-red-200 text-red-600 hover:bg-red-50">Schedule Report</Button>
          <Button className="bg-gradient-to-r from-red-500 to-red-400 text-white font-bold shadow hover:from-red-600 hover:to-red-500">Generate Now</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((r, i) => (
          <div key={i} className="bg-white rounded-xl shadow border border-red-100 p-6 flex flex-col justify-between min-h-[240px]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200">
                {r.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{r.title}</h3>
                <p className="text-sm text-gray-500">{r.desc}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              <div className="text-xs text-gray-500">Last generated: <span className="font-semibold text-gray-700">{r.last}</span></div>
              <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download {r.download}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
