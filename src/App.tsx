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
import { AttendanceView } from './components/academics/AttendanceView';
import { ExamsView } from './components/academics/ExamsView';
import { CodingPracticeView } from './components/academics/CodingPracticeView';
import { NotesView } from './components/academics/NotesView';
import { CareerView } from './components/career/CareerView';
import { ProjectsTeamworkView } from './components/student-life/ProjectsTeamworkView';
import { CampusClubsView } from './components/student-life/CampusClubsView';
import { FocusTimerView } from './components/student-life/FocusTimerView';
import { BudgetView } from './components/student-life/BudgetView';
import { PersonalOrganizerView } from './components/student-life/PersonalOrganizerView';
import { AuthPages } from './components/auth/AuthPages';
import { TaskModal } from './components/tasks/TaskModal';
import { StudySessionModal } from './components/study-planner/StudySessionModal';
import { ToastContainer } from './components/ui/Toast';

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
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentRoute === 'dashboard' && <DashboardView />}
          {currentRoute === 'tasks' && <TasksView />}
          {currentRoute === 'calendar' && <CalendarView />}
          {currentRoute === 'study-planner' && <StudyPlannerView />}
          {currentRoute === 'ai-planner' && <AIPlannerView />}
          {currentRoute === 'attendance' && <AttendanceView />}
          {currentRoute === 'exams' && <ExamsView />}
          {currentRoute === 'coding-practice' && <CodingPracticeView />}
          {currentRoute === 'notes' && <NotesView />}
          {currentRoute === 'career' && <CareerView />}
          {currentRoute === 'projects-teamwork' && <ProjectsTeamworkView />}
          {currentRoute === 'campus-life' && <CampusClubsView />}
          {currentRoute === 'focus-timer' && <FocusTimerView />}
          {currentRoute === 'budget' && <BudgetView />}
          {currentRoute === 'personal-organizer' && <PersonalOrganizerView />}
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
