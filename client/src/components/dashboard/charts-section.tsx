import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ScatterChart,
  Scatter
} from "recharts";

interface ChartsData {
  donationsData: Array<{ name: string; donations: number }>;
  bloodTypeData: Array<{ name: string; value: number }>;
  responseTimeData: Array<{ name: string; count: number }>;
  donorActivityData: Array<{ x: number; y: number; value: number }>;
}

interface ChartsSectionProps {
  donationsData: ChartsData['donationsData'];
  bloodTypeData: ChartsData['bloodTypeData'];
  responseTimeData: ChartsData['responseTimeData'];
  donorActivityData: ChartsData['donorActivityData'];
}

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#F97316', '#EC4899', '#06B6D4'];

export default function ChartsSection({ 
  donationsData, 
  bloodTypeData, 
  responseTimeData, 
  donorActivityData 
}: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Blood Donations Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Blood Donations Trend</CardTitle>
          <div className="flex space-x-2">
            <Button size="sm" variant="default" className="text-xs">7D</Button>
            <Button size="sm" variant="outline" className="text-xs">30D</Button>
            <Button size="sm" variant="outline" className="text-xs">90D</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={donationsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="donations" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Blood Type Distribution */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Blood Type Distribution</CardTitle>
          <Button size="sm" variant="outline" className="text-xs">
            Export Data
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bloodTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bloodTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Response Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Emergency Response Time</CardTitle>
          <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Donor Activity Heatmap */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Donor Activity Heatmap</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Real-time</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={donorActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" dataKey="x" name="hour" domain={[0, 23]} stroke="#6b7280" />
                <YAxis type="number" dataKey="y" name="day" domain={[0, 6]} stroke="#6b7280" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter dataKey="value" fill="#3B82F6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
