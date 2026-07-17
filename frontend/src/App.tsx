import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Archive from './pages/Archive';
import Entities from './pages/Entities';
import Settings from './pages/Settings';
import Statistics from './pages/Statistics';
import Layout from './components/Layout';

function AnimatedAuthRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleUnauthorized = () => {
      navigate('/login');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate]);
  
  // If we are on login or register, we use the auth routes with full page animation
  if (location.pathname === '/login' || location.pathname === '/register') {
    return <AnimatedAuthRoutes />;
  }

  // Otherwise, we use the main layout
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/entities" element={<Entities />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/statistics" element={<Statistics />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
