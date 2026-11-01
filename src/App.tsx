/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { CalendarView } from './components/calendar/CalendarView';
import { StudyPlannerView } from './components/study-planner/StudyPlannerView';
import { AIPlannerView } from './components/ai-planner/AIPlannerView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthPages } from './components/auth/AuthPages';
import { TaskModal } from './components/tasks/TaskModal';
import { StudySessionModal } from './components/study-planner/StudySessionModal';
import { ToastContainer } from './components/ui/Toast';

import { DemoWalkthroughBar } from './components/demo/DemoWalkthroughBar';

const AppContent: React.FC = () => {
  const { currentRoute, isAuthenticated } = useApp();

  // If user is accessing auth routes or not authenticated
  const isAuthRoute =
    currentRoute === 'login' ||
    currentRoute === 'signup' ||
    currentRoute === 'forgot-password' ||
    !isAuthenticated;

  if (isAuthRoute) {
    return (
      <>
        <AuthPages />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <DemoWalkthroughBar />
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentRoute === 'dashboard' && <DashboardView />}
          {currentRoute === 'tasks' && <TasksView />}
          {currentRoute === 'calendar' && <CalendarView />}
          {currentRoute === 'study-planner' && <StudyPlannerView />}
          {currentRoute === 'ai-planner' && <AIPlannerView />}
          {currentRoute === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <TaskModal />
      <StudySessionModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
