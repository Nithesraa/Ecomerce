import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerOverview } from '../dashboardSlice.js';
import { DollarSign, Package, ShoppingCart, TrendingUp, Eye, MousePointerClick, Percent } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../analytics/analyticsApi.js';

export const DashboardOverview = () => {
  const dispatch = useDispatch();
  const { overview, loading } = useSelector((state) => state.dashboard);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    dispatch(fetchSellerOverview());
    analyticsApi.getDashboardMetrics().then(res => setMetrics(res)).catch(err => console.error(err));
  }, [dispatch]);

  if (loading || !overview) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-8 h-8 border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { name: 'Total Revenue', value: `$${overview.totalRevenue.toFixed(2)}`, icon: DollarSign, trend: '+12.5%' },
    { name: 'Total Orders', value: overview.totalOrders, icon: ShoppingCart, trend: '+5.2%' },
    { name: 'Active Products', value: overview.activeProducts, icon: Package, trend: '+2.1%' },
    { name: 'Avg. Order Value', value: `$${(overview.totalRevenue / (overview.totalOrders || 1)).toFixed(2)}`, icon: TrendingUp, trend: '+8.4%' },
  ];

  // Mock data for the chart since the backend overview might not have timeseries data yet.
  const chartData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back. Here's what's happening with your store today.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white dark:bg-[#111] p-6 border border-gray-200 dark:border-white/[0.05] rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-900 dark:text-white" />
                </div>
                <span className="text-sm font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.name}</h3>
              <p className="text-xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* AI Insights Section */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Percent className="w-6 h-6" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Conversion Rate</h3>
              </div>
              <p className="text-[60px] font-black leading-none mb-2">{metrics.conversionRate}%</p>
              <p className="text-sm font-bold tracking-wider text-white/70">From {metrics.viewCount} views to {metrics.purchaseCount} purchases</p>
            </div>
            <div className="mt-8">
              <p className="text-sm font-bold bg-white/20 px-3 py-2 rounded inline-block">AI Insights Active</p>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white dark:bg-[#111] p-6 border border-gray-200 dark:border-white/[0.05] rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Top Viewed Products</h3>
            </div>
            <div className="flex flex-col gap-4">
              {metrics.topViewed.length === 0 && <p className="text-sm text-gray-400">No views recorded yet.</p>}
              {metrics.topViewed.map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-100 dark:border-white/[0.05] pb-3 last:border-0 last:pb-0">
                  <span className="text-md font-bold text-gray-900 dark:text-white truncate pr-4">{item.title}</span>
                  <span className="text-md font-black text-blue-500">{item.views} views</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 bg-white dark:bg-[#111] p-6 border border-gray-200 dark:border-white/[0.05] rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <MousePointerClick className="w-5 h-5 text-green-500" />
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Most Added to Cart</h3>
            </div>
            <div className="flex flex-col gap-4">
              {metrics.topCarted.length === 0 && <p className="text-sm text-gray-400">No cart additions yet.</p>}
              {metrics.topCarted.map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-100 dark:border-white/[0.05] pb-3 last:border-0 last:pb-0">
                  <span className="text-md font-bold text-gray-900 dark:text-white truncate pr-4">{item.title}</span>
                  <span className="text-md font-black text-green-500">{item.adds} adds</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="bg-white dark:bg-[#111] p-6 border border-gray-200 dark:border-white/[0.05] rounded-2xl shadow-sm h-[400px]">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(val) => `$${val}`} dx={-10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
