import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface BloodInventoryItem {
  type: string;
  name: string;
  units: number;
  percentage: number;
  level: 'critical' | 'low' | 'medium' | 'good';
}

interface BloodInventoryProps {
  inventory: BloodInventoryItem[];
}

export default function BloodInventory({ inventory }: BloodInventoryProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'low': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'good': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getLevelTextColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'low': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'good': return 'text-gray-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Blood Inventory Levels</CardTitle>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          Manage Inventory
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inventory.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-red-600">{item.type}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.units} units available</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-32">
                  <Progress 
                    value={item.percentage} 
                    className="h-2"
                  />
                </div>
                <span className={`text-sm font-medium ${getLevelTextColor(item.level)}`}>
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
