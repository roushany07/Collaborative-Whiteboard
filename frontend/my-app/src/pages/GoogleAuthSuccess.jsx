import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/store';
import api from '../api/axios';

export default function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      
      api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(({ data }) => {
        setAuth(data, token);
        navigate('/dashboard');
      })
      .catch(() => {
        navigate('/login');
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Logging in with Google...</div>
    </div>
  );
}
