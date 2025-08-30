/**
 * Professional Dashboard - Matching Reference Design
 * Enterprise-grade analytics dashboard with modern blue styling
 */

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  Eye,
  Download,
  MoreHorizontal,
  Calendar,
  Filter,
  MapPin,
  Star,
  User
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  indicator: 'green' | 'red' | 'orange' | 'blue';
  trend?: string;
}

function StatCard({ title, value, subtitle, indicator, trend }: StatCardProps) {
  const indicatorColors = {
    green: 'bg-green-500',
    red: 'bg-red-500', 
    orange: 'bg-orange-500',
    blue: 'bg-blue-500'
  };

  const trendColors = {
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    orange: 'text-orange-600 bg-orange-50', 
    blue: 'text-blue-600 bg-blue-50'
  };

  return (
    <Card className="relative overflow-hidden animate-slide-in-up hover-lift">
      {/* Top colored indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${indicatorColors[indicator]}`} />
      
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
          {trend && (
            <div className={`px-2 py-1 rounded-md text-xs font-medium ${trendColors[indicator]}`}>
              {trend}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface TransactionItemProps {
  user: {
    name: string;
    avatar: string;
    date: string;
  };
  amount: string;
  status: 'positive' | 'negative';
}

function TransactionItem({ user, amount, status }: TransactionItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className="font-medium text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${status === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
          {status === 'positive' ? '+' : ''}{amount}
        </p>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  user: string;
  action: string;
  time: string;
  type: 'photo' | 'team' | 'project';
}

function ActivityItem({ user, action, time, type }: ActivityItemProps) {
  const icons = {
    photo: '📸',
    team: '👥', 
    project: '📁'
  };

  return (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs">
        {icons[type]}
      </div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium text-gray-900">{user}</span>
          <span className="text-gray-600"> {action}</span>
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}

export function ProfessionalDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">General Report</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>2 May 2022 - 2 Jun 2022</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            <Button size="sm">
              <Filter className="w-4 h-4" />
              Reload Data
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Item Sales"
            value="4.710"
            subtitle="Total Sales"
            indicator="green"
            trend="2.1%"
          />
          <StatCard
            title="New Orders"
            value="3.721"
            subtitle="Orders"
            indicator="red"
            trend="-1.3%"
          />
          <StatCard
            title="Total Products"
            value="2.149"
            subtitle="Products"
            indicator="orange"
          />
          <StatCard
            title="Unique Visitor"
            value="152.040"
            subtitle="Visitors"
            indicator="green"
            trend="8.1%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Report Chart */}
          <Card className="lg:col-span-2 animate-slide-in-up stagger-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sales Report</CardTitle>
              <Button variant="ghost" size="sm">
                Show More
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">$15,000</p>
                  <p className="text-sm text-gray-500">This Month</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-2xl font-bold">$10,000</p>
                  <p className="text-sm text-gray-500">Last Month</p>
                </div>
              </div>
              
              {/* Simulated Chart Area */}
              <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Sales Chart Visualization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="animate-slide-in-up stagger-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transactions</CardTitle>
              <Button variant="ghost" size="sm">
                View More
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              <TransactionItem
                user={{ name: 'Richard Gore', avatar: '', date: '12 November 2021' }}
                amount="+$103"
                status="positive"
              />
              <TransactionItem
                user={{ name: 'Tom Hanks', avatar: '', date: '12 November 2020' }}
                amount="+$66"
                status="positive"
              />
              <TransactionItem
                user={{ name: 'Arnold Schwarzenegger', avatar: '', date: '03 July 2020' }}
                amount="+$67"
                status="positive"
              />
              <TransactionItem
                user={{ name: 'Vin Diesel', avatar: '', date: '13 May 2022' }}
                amount="-$67"
                status="negative"
              />
              <TransactionItem
                user={{ name: 'Robert De Niro', avatar: '', date: '21 July 2021' }}
                amount="+$90"
                status="positive"
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Top Seller & Sales Report Charts */}
          <Card className="animate-slide-in-up stagger-3">
            <CardHeader>
              <CardTitle>Weekly Top Seller</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Pie Chart Simulation */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-orange-100 rounded-lg flex items-center justify-center mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 relative">
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">Chart</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    17-30 Years old
                  </span>
                  <span className="font-medium">62%</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    31-50 Years old
                  </span>
                  <span className="font-medium">33%</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    50+ Years old
                  </span>
                  <span className="font-medium">10%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-in-up stagger-4">
            <CardHeader>
              <CardTitle>Sales Report</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Donut Chart Simulation */}
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                <div className="w-32 h-32 rounded-full border-8 border-blue-500 relative">
                  <div className="absolute top-0 right-0 w-16 h-16 border-8 border-orange-500 rounded-full"></div>
                  <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">68%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    17-30 Years old
                  </span>
                  <span className="font-medium">62%</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    31-50 Years old
                  </span>
                  <span className="font-medium">33%</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    50+ Years old
                  </span>
                  <span className="font-medium">10%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="animate-slide-in-up stagger-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activities</CardTitle>
              <Button variant="ghost" size="sm">
                Show More
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              <ActivityItem
                user="Sylvester Stallone"
                action="Has joined the team"
                time="07:00 PM"
                type="team"
              />
              <ActivityItem
                user="Matt Damon"
                action="Added 3 new photos"
                time="07:00 PM"
                type="photo"
              />
              <ActivityItem
                user="Catherine Zeta-Jones"
                action="Has changed Epic Pro project description"
                time="07:00 PM"
                type="project"
              />
              <ActivityItem
                user="Vin Diesel"
                action="Updated profile"
                time="07:00 PM"
                type="team"
              />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Official Store */}
          <Card className="animate-slide-in-up stagger-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Official Store</CardTitle>
              <Button variant="ghost" size="sm">
                <MapPin className="w-4 h-4" />
                Filter by city
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                256 Official stores in 21 countries, click the marker to see location details.
              </p>
              <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Interactive Map</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Best Sellers */}
          <Card className="animate-slide-in-up stagger-7">
            <CardHeader>
              <CardTitle>Weekly Best Sellers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                  <div>
                    <p className="font-medium">Richard Gore</p>
                    <p className="text-sm text-gray-500">12 November 2021</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    157 Sales
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg"></div>
                  <div>
                    <p className="font-medium">Tom Hanks</p>
                    <p className="text-sm text-gray-500">10 November 2020</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    157 Sales
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}