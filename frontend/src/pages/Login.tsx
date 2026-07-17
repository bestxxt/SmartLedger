import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api';
import { useUserStore } from '../store/useUserStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuthToken = useUserStore(state => state.setAuthToken);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/login', { email, password });
      setAuthToken(response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-paper flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Decorative lines */}
      <div className="absolute top-0 bottom-0 left-8 w-px bg-ink/10"></div>
      <div className="absolute top-0 bottom-0 right-8 w-px bg-ink/10"></div>
      <div className="absolute top-8 left-0 right-0 h-px bg-ink/10"></div>
      <div className="absolute bottom-8 left-0 right-0 h-px bg-ink/10"></div>

      <div className="w-full max-w-md bg-paper border-4 border-ink p-8 sm:p-12 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] relative z-10">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
            <h1 className="text-4xl sm:text-5xl font-bold font-serif text-ink italic m-0">The Ledger</h1>
          </div>
          <div className="w-full h-px bg-ink mb-2"></div>
          <div className="w-full h-0.5 bg-ink mb-4"></div>
          <p className="text-ink-light  tracking-widest text-xs font-bold font-mono">Vol. I — Account Access</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-brick/10 border-2 border-brick text-brick font-mono text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-bold text-ink  tracking-wider mb-2 font-mono">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="neo-input"
              placeholder="reader@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink  tracking-wider mb-2 font-mono">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="neo-input"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="neo-button mt-4  tracking-widest text-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>

        <div className="mt-10 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ink/30"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-paper text-ink-light font-mono italic">or proceed with</span>
          </div>
        </div>

        <div className="mt-8">
          <button className="w-full flex items-center justify-center gap-3 bg-white border-2 border-ink text-ink font-bold font-mono py-3 rounded-none hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-y-px active:shadow-none">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 grayscale opacity-80" />
            GOOGLE
          </button>
        </div>

        <p className="text-center text-sm text-ink-light mt-10 font-mono">
          New subscriber?{' '}
          <Link to="/register" className="font-bold text-ink underline underline-offset-4 decoration-2 hover:bg-ink hover:text-paper transition-colors px-1">
            Subscribe Now
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
