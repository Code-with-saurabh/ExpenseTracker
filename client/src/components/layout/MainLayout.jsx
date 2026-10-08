import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-60">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main key={location.pathname} className="anim-page px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
