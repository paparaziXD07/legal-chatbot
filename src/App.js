import React, { useState, useEffect } from 'react';
import './App.css';

import Navbar           from './components/Navbar';
import ChatView         from './components/ChatView';
import LawView          from './components/LawView';
import FaqView          from './components/FaqView';
import DashboardView    from './components/DashboardView';
import AdminLawManagementView from './components/AdminLawManagementView';
import AdminChatHistoryView from './components/AdminChatHistoryView';
import Footer           from './components/Footer';
import AdminLoginModal  from './components/AdminLoginModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [lawSearchTarget, setLawSearchTarget] = useState('');

  useEffect(() => {
    const savedIsAdmin = localStorage.getItem('isAdmin') === 'true';
    if (savedIsAdmin) {
      setIsAdmin(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
  };

  const handleNavigateToLaw = (targetSection = '') => {
    setLawSearchTarget(targetSection);
    setActiveTab('law');
  };

  const renderView = () => {
    switch (activeTab) {
      case 'chat':
        return null; // Handled by ChatView component
      case 'law':
        return (
          <LawView
            isAdmin={isAdmin}
            initialSearch={lawSearchTarget}
            onNavigateToLawManagement={() => setActiveTab('admin-laws')}
          />
        );
      case 'admin-laws':
        return <AdminLawManagementView isAdmin={isAdmin} onOpenLoginModal={() => setIsLoginModalOpen(true)} />;
      case 'faq':
        return <FaqView isAdmin={isAdmin} />;
      case 'dash':
        return <DashboardView isAdmin={isAdmin} onNavigateToHistory={() => setActiveTab('history')} onOpenLoginModal={() => setIsLoginModalOpen(true)} />;
      case 'history':
        return <AdminChatHistoryView isAdmin={isAdmin} onOpenLoginModal={() => setIsLoginModalOpen(true)} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab !== 'law') {
            setLawSearchTarget('');
          }
          setActiveTab(tab);
        }}
        isAdmin={isAdmin}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      <main style={{ animation: 'fade .25s ease' }} key={activeTab}>
        {renderView()}
      </main>

      <Footer />

      {/* Floating Pop Chat component & main chat hero mounted persistently */}
      <ChatView
        activeTab={activeTab}
        onNavigateToLaw={handleNavigateToLaw}
      />

      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => setIsAdmin(true)}
      />
    </div>
  );
}

