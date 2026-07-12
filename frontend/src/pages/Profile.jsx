import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '500', color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const cardStyle = { background: '#0d0e18', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', padding: '24px', marginBottom: '16px' };

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [form, setForm] = useState({
    name: user?.name || '',
    company: { name: user?.company?.name || '', address: user?.company?.address || '', phone: user?.company?.phone || '', gst: user?.company?.gst || '', website: user?.company?.website || '' },
    bankDetails: { bankName: user?.bankDetails?.bankName || '', accountNumber: user?.bankDetails?.accountNumber || '', ifsc: user?.bankDetails?.ifsc || '', upiId: user?.bankDetails?.upiId || '' },
    invoicePrefix: user?.invoicePrefix || 'INV',
    currency: user?.currency || '₹ INR',
    defaultTax: user?.defaultTax || 18,
  });

  const setC = (k, v) => setForm(f => ({ ...f, company: { ...f.company, [k]: v } }));
  const setB = (k, v) => setForm(f => ({ ...f, bankDetails: { ...f.bankDetails, [k]: v } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile saved!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleChangePw = async () => {
    if (pw.newPassword !== pw.confirm) return toast.error('Passwords do not match');
    if (pw.newPassword.length < 8) return toast.error('Min 8 characters');
    setChangingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed!');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setChangingPw(false); }
  };

  const Section = ({ title, icon, children }) => (
    <div style={cardStyle}>
      <div style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{icon}</span>{title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>{children}</div>
    </div>
  );

  const Field = ({ label, value, onChange, type = 'text', full, disabled }) => (
    <div style={{ gridColumn: full ? '1/-1' : 'auto' }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        style={{ ...inputStyle, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'text' }} />
    </div>
  );

  return (
    <div style={{ padding: '28px', maxWidth: '720px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' }}>Settings</h1>
        <p style={{ fontSize: '13px', color: '#475569' }}>Manage your account and company details</p>
      </div>

      {/* Profile Header */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '600', color: '#fff', flexShrink: 0 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#f1f5f9' }}>{user?.name}</div>
          <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>{user?.email}</div>
          {user?.company?.name && <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>{user.company.name}</div>}
        </div>
      </div>

      <Section title="Personal Info" icon="👤">
        <Field label="Your Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} full />
        <Field label="Email" value={user?.email || ''} onChange={() => {}} disabled full />
      </Section>

      <Section title="Company Details" icon="🏢">
        <Field label="Company Name" value={form.company.name} onChange={v => setC('name', v)} full />
        <Field label="Address" value={form.company.address} onChange={v => setC('address', v)} full />
        <Field label="Phone" value={form.company.phone} onChange={v => setC('phone', v)} />
        <Field label="GST Number" value={form.company.gst} onChange={v => setC('gst', v)} />
        <Field label="Website" value={form.company.website} onChange={v => setC('website', v)} full />
      </Section>

      <Section title="Bank Details" icon="🏦">
        <Field label="Bank Name" value={form.bankDetails.bankName} onChange={v => setB('bankName', v)} />
        <Field label="Account Number" value={form.bankDetails.accountNumber} onChange={v => setB('accountNumber', v)} />
        <Field label="IFSC Code" value={form.bankDetails.ifsc} onChange={v => setB('ifsc', v)} />
        <Field label="UPI ID" value={form.bankDetails.upiId} onChange={v => setB('upiId', v)} />
      </Section>

      <Section title="Invoice Preferences" icon="⚙️">
        <Field label="Invoice Prefix" value={form.invoicePrefix} onChange={v => setForm(f => ({ ...f, invoicePrefix: v }))} />
        <Field label="Default Tax (%)" value={form.defaultTax} onChange={v => setForm(f => ({ ...f, defaultTax: v }))} type="number" />
        <div style={{ gridColumn: '1/-1' }}>
          <label style={labelStyle}>Default Currency</label>
          <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
            style={{ ...inputStyle, cursor: 'pointer' }}>
            <option>₹ INR</option><option>$ USD</option><option>€ EUR</option><option>£ GBP</option>
          </select>
        </div>
      </Section>

      <button onClick={handleSave} disabled={saving}
        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: '16px', boxShadow: '0 4px 15px rgba(99,102,241,0.3)', opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Saving...' : '💾 Save All Settings'}
      </button>

      <div style={cardStyle}>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>🔒 Change Password</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirm', 'Confirm New Password']].map(([k, l]) => (
            <div key={k}>
              <label style={labelStyle}>{l}</label>
              <input type="password" value={pw[k]} onChange={e => setPw(p => ({ ...p, [k]: e.target.value }))} style={inputStyle} />
            </div>
          ))}
          <button onClick={handleChangePw} disabled={changingPw}
            style={{ padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: '4px', opacity: changingPw ? 0.7 : 1 }}>
            {changingPw ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
