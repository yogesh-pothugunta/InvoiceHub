import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, sub, color }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
    <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
    <p className={`text-2xl font-semibold ${color || 'text-gray-900'}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const statusColors = { paid: 'bg-green-100 text-green-700', sent: 'bg-blue-100 text-blue-700', draft: 'bg-gray-100 text-gray-600', overdue: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-400' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([dashboardAPI.getStats(), dashboardAPI.getRecent()])
      .then(([s, r]) => { setStats(s.data.data); setRecent(r.data.data); })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading dashboard...</div>;

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your invoice activity</p>
        </div>
        <button onClick={() => navigate('/invoices/new')} className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
          + New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Invoices" value={stats?.totalInvoices || 0} sub="All time" />
        <StatCard label="Total Revenue" value={fmt(stats?.totalRevenue)} sub="Collected" color="text-green-700" />
        <StatCard label="Pending Amount" value={fmt(stats?.pendingAmount)} sub="Unpaid + Overdue" color="text-orange-600" />
        <StatCard label="This Month" value={fmt(stats?.thisMonthRevenue)} sub={`Last: ${fmt(stats?.lastMonthRevenue)}`} color="text-blue-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Revenue — Last 6 Months</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.monthlyChart || []} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']} />
              <Bar dataKey="paid" fill="#185FA5" radius={[4,4,0,0]} name="Paid" />
              <Bar dataKey="total" fill="#BFDBFE" radius={[4,4,0,0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Status Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(stats?.statusBreakdown || {}).map(([status, data]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-800">{data.count}</span>
                  <span className="text-xs text-gray-400 ml-2">{fmt(data.total)}</span>
                </div>
              </div>
            ))}
          </div>
          {stats?.topClients?.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-gray-700 mb-3 mt-5">Top Clients</h2>
              <div className="space-y-2">
                {stats.topClients.slice(0,3).map(c => (
                  <div key={c._id} className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate">{c._id}</span>
                    <span className="text-gray-500 font-medium ml-2">{fmt(c.total)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent + Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-700">Recent Invoices</h2>
            <button onClick={() => navigate('/invoices')} className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recent?.recent?.length === 0 && <p className="text-sm text-gray-400 p-5 text-center">No invoices yet</p>}
            {recent?.recent?.map(inv => (
              <div key={inv._id} onClick={() => navigate(`/invoices/${inv._id}`)} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-blue-700">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{inv.clientSnapshot.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">₹{inv.total.toLocaleString('en-IN')}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[inv.status]}`}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-red-50 bg-red-50">
            <h2 className="text-sm font-semibold text-red-700">⚠️ Overdue Invoices</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recent?.overdue?.length === 0 && <p className="text-sm text-gray-400 p-5 text-center">No overdue invoices 🎉</p>}
            {recent?.overdue?.map(inv => (
              <div key={inv._id} onClick={() => navigate(`/invoices/${inv._id}`)} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-red-600">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{inv.clientSnapshot.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">₹{inv.total.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-red-500">Due {new Date(inv.dueDate).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
