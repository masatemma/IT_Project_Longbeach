import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import Navbar from './components/navbar';
import Admin from './pages/admin';

const RedirectToAdmin = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate('/admin');
  }, [navigate]);

  return null;
};

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<RedirectToAdmin />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
};

export default App;
