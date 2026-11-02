import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardAdmin } from './components/DashboardAdmin';
import { DashboardOfficer } from './components/DashboardOfficer';
import { DashboardInstitution } from './components/DashboardInstitution';
import { VerificationDesk } from './components/VerificationDesk';
import { FdrRegister } from './components/FdrRegister';
import { MaturityMonitoring } from './components/MaturityMonitoring';
import { RenewalsView } from './components/RenewalsView';
import { ReleasesView } from './components/ReleasesView';
import { InstitutionsView } from './components/InstitutionsView';
import { ReportsView } from './components/ReportsView';
import { AuditLogsView } from './components/AuditLogsView';
import { TechDocsView } from './components/TechDocsView';
import { SubmitFdrModal } from './components/SubmitFdrModal';

const MainLayout: React.FC = () => {
  const { currentView, currentUser, setCurrentView } = useApp();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // If view is 'submit-fdr', trigger modal and render institution dashboard underneath
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        if (currentUser.role === 'ADMIN') return <DashboardAdmin />;
        if (currentUser.role === 'OFFICER') return <DashboardOfficer />;
        return <DashboardInstitution />;

      case 'verification':
        return <VerificationDesk />;

      case 'fdrs':
        return <FdrRegister />;

      case 'maturity':
        return <MaturityMonitoring />;

      case 'renewals':
        return <RenewalsView />;

      case 'releases':
        return <ReleasesView />;

      case 'institutions':
        return <InstitutionsView />;

      case 'reports':
        return <ReportsView />;

      case 'audit':
        return <AuditLogsView />;

      case 'queries':
        return currentUser.role === 'INSTITUTION' ? <DashboardInstitution /> : <VerificationDesk />;

      case 'submit-fdr':
        return (
          <>
            <DashboardInstitution />
            <SubmitFdrModal
              isOpen={true}
              onClose={() => setCurrentView('dashboard')}
            />
          </>
        );

      case 'tech-docs':
        return <TechDocsView />;

      default:
        return <DashboardAdmin />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      {isSubmitModalOpen && (
        <SubmitFdrModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
