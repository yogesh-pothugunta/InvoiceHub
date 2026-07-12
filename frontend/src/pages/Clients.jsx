import { useState, useEffect, useCallback } from 'react';
import { clientAPI } from '../utils/api';
import toast from 'react-hot-toast';

const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '500', color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const empty = { name: '', email: '', phone: '', company: '', gst: '', address: { street: '', city: '', state: '', pincode: '', country: 'India' }, notes: '' };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await clientAPI.getAll({ search, limit: 50 }); setClients(res.data.data); }
    catch { toast.error('Failed to load clients'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (c) => { setEditing(c._id); setForm({ ...c, address: c.address || empty.address }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    setSaving(true);
    try {
      if (editing) { await clientAPI.update(editing, form); toast.success('Client updated'); }
      else { await clientAPI.create(form); toast.success('Client added'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    try { await clientAPI.delete(id); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setAddr = (k, v) => setForm(f => ({ ...f, address: { ...f.address, [k]: v } }));

  const avatarColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' }}>Clients</h1>
          <p style={{ fontSize: '13px', color: '#475569' }}>{clients.length} clients</p>
        </div>
        <button onClick={openAdd} style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
          + Add Client
        </button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
        style={{ ...inputStyle, width: '100%', marginBottom: '20px', maxWidth: '400px' }} />

      {loading && <div style={{ textAlign: 'center', color: '#334155', padding: '40px' }}>Loading...</div>}
      {!loading && clients.length === 0 && <div style={{ textAlign: 'center', color: '#334155', padding: '40px', fontSize: '13px' }}>No clients yet. Add your first client!</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {clients.map((c, i) => (
          <div key={c._id} style={{ background: '#0d0e18', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', transition: 'border-color 0.2s', cursor: 'default' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '600', color: '#fff' }}>
                {c.name[0].toUpperCase()}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => openEdit(c)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏️</button>
                <button onClick={() => handleDelete(c._id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑️</button>
              </div>
            </div>
            <div style={{ fontSize: '15px', fontWeight: '500', color: '#f1f5f9', marginBottom: '2px' }}>{c.name}</div>
            {c.company && <div style={{ fontSize: '12px', color: '#475569', marginBottom: '2px' }}>{c.company}</div>}
            <div style={{ fontSize: '12px', color: '#475569' }}>{c.email}</div>
            {c.phone && <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>{c.phone}</div>}
            <div style={{ display: 'flex', gap: '16px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', color: '#334155' }}>
              <span>📄 {c.totalInvoices || 0} invoices</span>
              <span>💰 ₹{(c.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#0d0e18', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '28px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,0.6)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '20px' }}>{editing ? 'Edit Client' : 'Add Client'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[['name', 'Name *'], ['email', 'Email *'], ['phone', 'Phone'], ['company', 'Company'], ['gst', 'GST Number']].map(([k, l]) => (
                <div key={k} style={{ gridColumn: k === 'name' || k === 'email' ? '1/-1' : 'auto' }}>
                  <label style={labelStyle}>{l}</label>
                  <input value={form[k] || ''} onChange={e => setF(k, e.target.value)} style={inputStyle} />
                </div>
              ))}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ ...labelStyle, marginTop: '4px' }}>Address</label>
              </div>
              {[['street', 'Street', '1/-1'], ['city', 'City', ''], ['state', 'State', ''], ['pincode', 'Pincode', ''], ['country', 'Country', '']].map(([k, l, col]) => (
                <div key={k} style={{ gridColumn: col || 'auto' }}>
                  <label style={labelStyle}>{l}</label>
                  <input value={form.address?.[k] || ''} onChange={e => setAddr(k, e.target.value)} style={inputStyle} />
                </div>
              ))}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={form.notes || ''} onChange={e => setF('notes', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                {saving ? 'Saving...' : 'Save Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
