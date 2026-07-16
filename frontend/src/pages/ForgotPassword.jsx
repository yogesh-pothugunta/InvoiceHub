import { useState } from 'react';
import { authAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0b0f, #0f1117)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#0d0e18', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' }}>
        {!sent ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔐</div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px' }}>Forgot Password?</h1>
              <p style={{ fontSize: '13px', color: '#475569' }}>Enter your email — we'll send a reset link</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', outline: 'none' }} />
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: '12px' }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button type="button" onClick={() => navigate('/login')}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Back to Login
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '8px' }}>Check your email!</h2>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>Reset link sent to <strong style={{ color: '#818cf8' }}>{email}</strong></p>
            <button onClick={() => navigate('/login')}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
