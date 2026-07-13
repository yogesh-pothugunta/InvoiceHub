import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{ background: '#0d0e18', borderRadius: '14px', padding: '20px', border: `1px solid ${color}40`, position: 'relative', overflow: 'hidden', boxShadow: `0 4px 20px ${color}20` }}>
    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: color, borderRadius: '50%', opacity: 0.15 }} />
    <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
    <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{label}</div>
    <div style={{ fontSize: '26px', fontWeight: '700', color: '#f1f5f9', marginBottom: '6px' }}>{value}</div>
    {sub && <div style={{ fontSize: '11px', color: '#334155' }}>{sub}</div>}
  </div>
);

const statusColors = {
  paid: { bg: 'rgba(34,197,94,0.1)', color: '#4ade80', border: 'rgba(34,197,94,0.2)' },
  sent: { bg: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'rgba(99,102,241,0.2)' },
  draft: { bg: 'rgba(100,116,139,0.1)', color: '#64748b', border: 'rgba(100,116,139,0.2)' },
  overdue: { bg: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'rgba(239,68,68,0.2)' },
  cancelled: { bg: 'rgba(100,116,139,0.1)', color: '#64748b', border: 'rgba(100,116,139,0.2)' },
};

const Pill = ({ status }) => {
  const s = statusColors[status] || statusColors.draft;
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#e2e8f0' }}>
        <div style={{ color: '#64748b', marginBottom: '4px' }}>{label}</div>
        <div style={{ color: '#818cf8', fontWeight: '500' }}>₹{(payload[0]?.value || 0).toLocaleString('en-IN')}</div>
      </div>
    );
  }
  return null;
};

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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#334155', flexDirection: 'column', gap: '12px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: '13px' }}>Loading dashboard...</div>
    </div>
  );

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' }}>Dashboard</h1>
          <p style={{ fontSize: '13px', color: '#475569' }}>Overview of your invoice activity</p>
        </div>
        <button onClick={() => navigate('/invoices/new')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
          ✦ New Invoice
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon="💰" label="Total Revenue" value={fmt(stats?.totalRevenue)} sub="All time collected" color="#22c55e" />
        <StatCard icon="⏳" label="Pending" value={fmt(stats?.pendingAmount)} sub="Awaiting payment" color="#f59e0b" />
        <StatCard icon="🧾" label="Total Invoices" value={stats?.totalInvoices || 0} sub="All time" color="#6366f1" />
        <StatCard icon="📅" label="This Month" value={fmt(stats?.thisMonthRevenue)} sub={`Last: ${fmt(stats?.lastMonthRevenue)}`} color="#8b5cf6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Chart */}
        <div style={{ background: '#0d0e18', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>Revenue — Last 6 Months</span>
            <span style={{ fontSize: '11px', color: '#334155', background: 'rgba(99,102,241,0.1)', padding: '3px 8px', borderRadius: '6px', color: '#818cf8' }}>Monthly</span>
          </div>
          <div style={{ padding: '20px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats?.monthlyChart || []} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#334155' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#334155' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Bar dataKey="total" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status */}
        <div style={{ background: '#0d0e18', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>Status Breakdown</span>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(stats?.statusBreakdown || {}).map(([status, data]) => {
              const s = statusColors[status] || statusColors.draft;
              const total = Object.values(stats?.statusBreakdown || {}).reduce((a, b) => a + b.count, 0);
              const pct = total > 0 ? (data.count / total) * 100 : 0;
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#e2e8f0' }}>{data.count}</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent + Overdue */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#0d0e18', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>Recent Invoices</span>
            <button onClick={() => navigate('/invoices')} style={{ fontSize: '12px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>View all →</button>
          </div>
          <div>
            {recent?.recent?.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: '#334155', fontSize: '13px' }}>No invoices yet</div>}
            {recent?.recent?.map(inv => (
              <div key={inv._id} onClick={() => navigate(`/invoices/${inv._id}`)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#818cf8' }}>{inv.invoiceNumber}</div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{inv.clientSnapshot?.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#e2e8f0' }}>₹{inv.total?.toLocaleString('en-IN')}</div>
                  <div style={{ marginTop: '4px' }}><Pill status={inv.status} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#0d0e18', borderRadius: '14px', border: '1px solid rgba(239,68,68,0.15)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(239,68,68,0.1)', background: 'rgba(239,68,68,0.04)' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#f87171' }}>⚠️ Overdue Invoices</span>
          </div>
          <div>
            {recent?.overdue?.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: '#334155', fontSize: '13px' }}>No overdue invoices 🎉</div>}
            {recent?.overdue?.map(inv => (
              <div key={inv._id} onClick={() => navigate(`/invoices/${inv._id}`)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#f87171' }}>{inv.invoiceNumber}</div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{inv.clientSnapshot?.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#e2e8f0' }}>₹{inv.total?.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '11px', color: '#f87171', marginTop: '2px' }}>Due {new Date(inv.dueDate).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
