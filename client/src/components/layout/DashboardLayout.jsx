import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { TopBar } from './TopBar.jsx';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] p-4 md:p-6 lg:p-10 flex items-center justify-center transition-colors duration-500">
      
      {/* Outer Dashboard Card Wrapper */}
      <div className="w-full max-w-[1600px] h-[90vh] min-h-[800px] bg-white dark:bg-[#0F0F0F] rounded-[32px] md:rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-none flex overflow-hidden border border-transparent dark:border-white/[0.04]">
        
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full bg-[#f8fcf9] dark:bg-[#0a0a0a] relative">
          
          <TopBar />
          
          {/* Scrollable Page Content */}
          <div className="flex-1 overflow-y-auto w-full">
            <Outlet />
          </div>

        </main>
      </div>

    </div>
  );
};
