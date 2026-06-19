import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const [form, setForm] = useState({
    name: user?.name || '',
    company: {
      name: user?.company?.name || '',
      address: user?.company?.address || '',
      phone: user?.company?.phone || '',
      gst: user?.company?.gst || '',
      website: user?.company?.website || '',
    },
    bankDetails: {
      bankName: user?.bankDetails?.bankName || '',
      accountNumber: user?.bankDetails?.accountNumber || '',
      ifsc: user?.bankDetails?.ifsc || '',
      upiId: user?.bankDetails?.upiId || '',
    },
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

  const Section = ({ title, children }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );

  const Field = ({ label, value, onChange, type = 'text', full }) => (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Settings</h1>

      <Section title="👤 Personal Info">
        <Field label="Your Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} full />
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Email</label>
          <input value={user?.email} disabled className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
        </div>
      </Section>

      <Section title="🏢 Company Details">
        <Field label="Company Name" value={form.company.name} onChange={v => setC('name', v)} full />
        <Field label="Address" value={form.company.address} onChange={v => setC('address', v)} full />
        <Field label="Phone" value={form.company.phone} onChange={v => setC('phone', v)} />
        <Field label="GST Number" value={form.company.gst} onChange={v => setC('gst', v)} />
        <Field label="Website" value={form.company.website} onChange={v => setC('website', v)} full />
      </Section>

      <Section title="🏦 Bank Details (shown on PDF)">
        <Field label="Bank Name" value={form.bankDetails.bankName} onChange={v => setB('bankName', v)} />
        <Field label="Account Number" value={form.bankDetails.accountNumber} onChange={v => setB('accountNumber', v)} />
        <Field label="IFSC Code" value={form.bankDetails.ifsc} onChange={v => setB('ifsc', v)} />
        <Field label="UPI ID" value={form.bankDetails.upiId} onChange={v => setB('upiId', v)} />
      </Section>

      <Section title="⚙️ Invoice Preferences">
        <Field label="Invoice Prefix (e.g. INV, BILL)" value={form.invoicePrefix} onChange={v => setForm(f => ({ ...f, invoicePrefix: v }))} />
        <Field label="Default Tax (%)" value={form.defaultTax} onChange={v => setForm(f => ({ ...f, defaultTax: v }))} type="number" />
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Default Currency</label>
          <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>₹ INR</option><option>$ USD</option><option>€ EUR</option><option>£ GBP</option>
          </select>
        </div>
      </Section>

      <button onClick={handleSave} disabled={saving} className="w-full bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-60 mb-6">
        {saving ? 'Saving...' : '💾 Save All Settings'}
      </button>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">🔒 Change Password</h2>
        <div className="space-y-3">
          {[['currentPassword','Current Password'],['newPassword','New Password'],['confirm','Confirm New Password']].map(([k,l]) => (
            <div key={k}>
              <label className="block text-xs text-gray-500 mb-1">{l}</label>
              <input type="password" value={pw[k]} onChange={e => setPw(p => ({ ...p, [k]: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <button onClick={handleChangePw} disabled={changingPw} className="w-full border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-60 mt-1">
            {changingPw ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
