import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      const user = JSON.parse(decodeURIComponent(userStr));
      localStorage.setItem('ih_token', token);
      localStorage.setItem('ih_user', JSON.stringify(user));
      updateUser(user);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0b0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center', color: '#475569' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔐</div>
        <div>Signing you in...</div>
      </div>
    </div>
  );
}
