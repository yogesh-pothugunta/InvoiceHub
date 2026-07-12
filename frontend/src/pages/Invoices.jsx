import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceAPI } from '../utils/api';
import toast from 'react-hot-toast';

const statusColors = {
  paid: { bg: 'rgba(34,197,94,0.1)', color: '#4ade80', border: 'rgba(34,197,94,0.2)' },
  sent: { bg: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'rgba(99,102,241,0.2)' },
  draft: { bg: 'rgba(100,116,139,0.1)', color: '#64748b', border: 'rgba(100,116,139,0.2)' },
  overdue: { bg: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'rgba(239,68,68,0.2)' },
  cancelled: { bg: 'rgba(100,116,139,0.1)', color: '#64748b', border: 'rgba(100,116,139,0.2)' },
};

const Pill = ({ status }) => {
  const s = statusColors[status] || statusColors.draft;
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>;
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoiceAPI.getAll({ search, status, page, limit: 10 });
      setInvoices(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load invoices'); }
    finally { setLoading(false); }
  }, [search, status, page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this invoice?')) return;
    try { await invoiceAPI.delete(id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Cannot delete'); }
  };

  const handleDownloadPDF = async (id, num, e) => {
    e.stopPropagation();
    try {
      const res = await invoiceAPI.downloadPDF(id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `${num}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF failed'); }
  };

  const handleExportCSV = async () => {
    try {
      const res = await invoiceAPI.exportCSV({ status });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'invoices.csv'; a.click();
      toast.success('Exported!');
    } catch { toast.error('Export failed'); }
  };

  const inputStyle = { padding: '9px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none' };

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' }}>Invoices</h1>
          <p style={{ fontSize: '13px', color: '#475569' }}>{pagination.total || 0} total invoices</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} style={{ ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>📥 Export CSV</button>
          <button onClick={() => navigate('/invoices/new')} style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 15px rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>✦ New Invoice</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by client or invoice #..." style={{ ...inputStyle, flex: 1 }} />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#0d0e18', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
              {['Invoice #', 'Client', 'Amount', 'Issue Date', 'Due Date', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', color: '#334155', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#334155' }}>Loading...</td></tr>}
            {!loading && invoices.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#334155', fontSize: '13px' }}>
                No invoices found. <span onClick={() => navigate('/invoices/new')} style={{ color: '#6366f1', cursor: 'pointer' }}>Create one!</span>
              </td></tr>
            )}
            {invoices.map(inv => (
              <tr key={inv._id} onClick={() => navigate(`/invoices/${inv._id}`)}
                style={{ cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 16px', fontWeight: '500', color: '#818cf8' }}>{inv.invoiceNumber}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: '500', color: '#e2e8f0' }}>{inv.clientSnapshot?.name}</div>
                  <div style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>{inv.clientSnapshot?.email}</div>
                </td>
                <td style={{ padding: '14px 16px', fontWeight: '600', color: '#f1f5f9' }}>₹{inv.total?.toLocaleString('en-IN')}</td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{new Date(inv.issueDate).toLocaleDateString('en-IN')}</td>
                <td style={{ padding: '14px 16px', color: '#475569' }}>{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                <td style={{ padding: '14px 16px' }}><Pill status={inv.status} /></td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                    <button onClick={e => handleDownloadPDF(inv._id, inv.invoiceNumber, e)} title="PDF" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</button>
                    <button onClick={e => { e.stopPropagation(); navigate(`/invoices/${inv._id}/edit`); }} title="Edit" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏️</button>
                    <button onClick={e => handleDelete(inv._id, e)} title="Delete" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pagination.pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '12px', color: '#334155' }}>Page {pagination.page} of {pagination.pages}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: page === 1 ? '#334155' : '#94a3b8', cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>← Prev</button>
              <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: page === pagination.pages ? '#334155' : '#94a3b8', cursor: page === pagination.pages ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
