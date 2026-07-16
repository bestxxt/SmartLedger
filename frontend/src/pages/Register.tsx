import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/register', { name, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
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
          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-ink mb-4 italic">Subscribe</h1>
          <div className="w-full h-px bg-ink mb-2"></div>
          <div className="w-full h-0.5 bg-ink mb-4"></div>
          <p className="text-ink-light uppercase tracking-widest text-xs font-bold font-mono">Vol. I — New Registration</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-brick/10 border-2 border-brick text-brick font-mono text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-bold text-ink uppercase tracking-wider mb-2 font-mono">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="neo-input"
              placeholder="J. Doe Esq."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink uppercase tracking-wider mb-2 font-mono">Email Address</label>
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
            <label className="block text-sm font-bold text-ink uppercase tracking-wider mb-2 font-mono">Password</label>
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
            className="neo-button mt-4 uppercase tracking-widest text-sm disabled:opacity-50"
          >
            {loading ? 'Creating Record...' : 'Create Record'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-light mt-10 font-mono">
          Already a subscriber?{' '}
          <Link to="/login" className="font-bold text-ink underline underline-offset-4 decoration-2 hover:bg-ink hover:text-paper transition-colors px-1">
            Access Here
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
