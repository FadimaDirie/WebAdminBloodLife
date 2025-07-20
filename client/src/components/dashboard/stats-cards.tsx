import { Card, CardContent } from "@/components/ui/card";
import { Activity, AlertTriangle, Users, Link } from "lucide-react";

interface Stats {
  todayDonations: number;
  emergencyRequests: number;
  activeDonors: number;
  blockchainTxs: number;
}

interface StatsCardsProps {
  stats: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Donations Today",
      value: stats.todayDonations.toLocaleString(),
      change: "+12.5%",
      changeText: "from yesterday",
      icon: Activity,
      bgColor: "bg-gradient-to-br from-red-400 to-red-300",
      iconColor: "text-red-600",
      changeColor: "text-red-600"
    },
    {
      title: "Emergency Requests",
      value: stats.emergencyRequests.toString(),
      change: "3 Critical",
      changeText: "need immediate attention",
      icon: AlertTriangle,
      bgColor: "bg-gradient-to-br from-red-500 to-red-400",
      iconColor: "text-white",
      changeColor: "text-red-600"
    },
    {
      title: "Active Donors",
      value: stats.activeDonors.toLocaleString(),
      change: "+5.2%",
      changeText: "this month",
      icon: Users,
      bgColor: "bg-gradient-to-br from-red-400 to-red-300",
      iconColor: "text-red-600",
      changeColor: "text-red-600"
    },
    {
      title: "Blockchain Transactions",
      value: stats.blockchainTxs.toLocaleString(),
      change: "Network Status:",
      changeText: "Active",
      icon: Link,
      bgColor: "bg-gradient-to-br from-red-400 to-red-300",
      iconColor: "text-red-600",
      changeColor: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border-0 shadow-lg rounded-2xl bg-white hover:scale-[1.02] transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-red-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-bold ${card.changeColor}`}>{card.change}</span>
                <span className="text-sm text-gray-500 ml-2">{card.changeText}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
