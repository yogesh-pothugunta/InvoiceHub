import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 8) return toast.error('Min 8 characters');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, { password: form.password });
      setDone(true);
      toast.success('Password reset successful!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0b0f, #0f1117)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#0d0e18', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}>
        {!done ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔑</div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px' }}>Reset Password</h1>
              <p style={{ fontSize: '13px', color: '#475569' }}>Enter your new password</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>New Password</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" required minLength={8}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Confirm Password</label>
                <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat password" required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '8px' }}>Password Reset!</h2>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>Your password has been updated successfully</p>
            <button onClick={() => navigate('/login')}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Login Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
