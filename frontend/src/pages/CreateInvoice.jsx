
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceAPI, clientAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const today = new Date().toISOString().split('T')[0];
const future30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '500', color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const cardStyle = { background: '#0d0e18', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', marginBottom: '16px' };

export default function CreateInvoice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');

  const [form, setForm] = useState({
    issueDate: today,
    dueDate: future30,
    taxRate: user?.defaultTax || 18,
    currency: user?.currency || '₹ INR',
    status: 'draft',
    notes: '',
    terms: 'Payment due within 30 days.',
    isRecurring: false,
    recurringInterval: 'monthly'
  });

  const [clientSnap, setClientSnap] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    gst: '',
    address: ''
  });

  const [items, setItems] = useState([
    { description: '', quantity: 1, rate: 0 }
  ]);

  useEffect(() => {
    clientAPI.getAll({ limit: 100 })
      .then(res => setClients(res.data.data))
      .catch(() => {});
  }, []);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setCS = (k, v) => setClientSnap(s => ({ ...s, [k]: v }));

  const handleClientSelect = (id) => {
    setSelectedClient(id);
    const c = clients.find(c => c._id === id);

    if (c) {
      setClientSnap({
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        company: c.company || '',
        gst: c.gst || '',
        address: [
          c.address?.street,
          c.address?.city,
          c.address?.state,
          c.address?.pincode
        ].filter(Boolean).join(', ')
      });
    }
  };

  const setItem = (idx, k, v) =>
    setItems(items =>
      items.map((it, i) =>
        i === idx ? { ...it, [k]: v } : it
      )
    );

  const addItem = () =>
    setItems(i => [
      ...i,
      { description: '', quantity: 1, rate: 0 }
    ]);

  const removeItem = (idx) =>
    setItems(i => i.filter((_, j) => j !== idx));

  const subtotal = items.reduce(
    (s, it) =>
      s +
      (parseFloat(it.quantity) || 0) *
      (parseFloat(it.rate) || 0),
    0
  );

  const taxAmount =
    subtotal * (parseFloat(form.taxRate) || 0) / 100;

  const total = subtotal + taxAmount;
  const sym = form.currency.split(' ')[0];

  const handleSubmit = async (status) => {
    if (!clientSnap.name || !clientSnap.email)
      return toast.error('Client name and email required');

    if (items.every(it => !it.description))
      return toast.error('Add at least one item');

    setLoading(true);

    try {
      await invoiceAPI.create({
        clientId: selectedClient || undefined,
        clientSnapshot: clientSnap,
        items: items.filter(it => it.description),
        dueDate: form.dueDate,
        issueDate: form.issueDate,
        taxRate: parseFloat(form.taxRate),
        currency: form.currency,
        notes: form.notes,
        terms: form.terms,
        status
      });

      toast.success(
        status === 'draft'
          ? 'Saved as draft!'
          : 'Invoice created!'
      );

      navigate('/invoices');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed'
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>← Back</button>
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#f1f5f9' }}>New Invoice</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* LEFT */}
        <div>
          <div style={cardStyle}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '16px' }}>Client Details</div>
            {clients.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Select Existing Client</label>
                <select value={selectedClient} onChange={e => handleClientSelect(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">-- Or enter manually --</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[['name', 'Client Name *', 'text'], ['email', 'Email *', 'email'], ['phone', 'Phone', 'text'], ['company', 'Company', 'text'], ['gst', 'GST Number', 'text'], ['address', 'Address', 'text']].map(([k, l, t]) => (
                <div key={k} style={{ gridColumn: k === 'address' || k === 'name' ? '1/-1' : 'auto' }}>
                  <label style={labelStyle}>{l}</label>
                  <input type={t} value={clientSnap[k]} onChange={e => setCS(k, e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '16px' }}>Invoice Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={labelStyle}>Issue Date</label><input type="date" value={form.issueDate} onChange={e => setF('issueDate', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Due Date</label><input type="date" value={form.dueDate} onChange={e => setF('dueDate', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Tax Rate (%)</label><input type="number" value={form.taxRate} onChange={e => setF('taxRate', e.target.value)} min="0" max="100" style={inputStyle} /></div>
              <div><label style={labelStyle}>Currency</label>
                <select value={form.currency} onChange={e => setF('currency', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option>₹ INR</option><option>$ USD</option><option>€ EUR</option><option>£ GBP</option>
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Notes</label><textarea value={form.notes} onChange={e => setF('notes', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'none' }} placeholder="Any notes for the client..." /></div>
              <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Terms</label><textarea value={form.terms} onChange={e => setF('terms', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'none' }} /></div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div style={cardStyle}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '16px' }}>Line Items</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: '8px', marginBottom: '8px' }}>
              {['Description', 'Qty', 'Rate', 'Amount', ''].map((h, i) => (
                <div key={i} style={{ fontSize: '11px', color: '#334155', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i > 1 ? 'right' : 'left' }}>{h}</div>
              ))}
            </div>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 90px 32px', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <input placeholder="Item / Service" value={item.description} onChange={e => setItem(idx, 'description', e.target.value)} style={inputStyle} />
                <input type="number" min="0" value={item.quantity} onChange={e => setItem(idx, 'quantity', e.target.value)} style={{ ...inputStyle, textAlign: 'center' }} />
                <input type="number" min="0" value={item.rate} onChange={e => setItem(idx, 'rate', e.target.value)} style={{ ...inputStyle, textAlign: 'right' }} />
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#e2e8f0', textAlign: 'right' }}>{sym}{((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)).toLocaleString('en-IN')}</div>
                {items.length > 1 && <button onClick={() => removeItem(idx)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>}
              </div>
            ))}
            <button onClick={addItem} style={{ fontSize: '13px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: '20px' }}>+ Add Item</button>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
              {[['Subtotal', `${sym}${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`], [`Tax (${form.taxRate}%)`, `${sym}${taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                  <span>{l}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '600', color: '#818cf8', borderTop: '1px solid rgba(99,102,241,0.2)', paddingTop: '12px', marginTop: '4px' }}>
                <span>Total</span>
                <span>{sym}{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => handleSubmit('draft')} disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                💾 Save Draft
              </button>
              <button onClick={() => handleSubmit('sent')} disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
                {loading ? 'Saving...' : '📤 Create & Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
