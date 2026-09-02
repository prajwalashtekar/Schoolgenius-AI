/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar, Header } from "./components/Navigation";
import { HomeDashboard } from "./components/HomeDashboard";
import { TutorDoubts } from "./components/TutorDoubts";
import { HomeworkSolver } from "./components/HomeworkSolver";
import { ScienceLab } from "./components/ScienceLab";
import { MathLab } from "./components/MathLab";
import { SocialLanguageLab } from "./components/SocialLanguageLab";
import { ExamEngine } from "./components/ExamEngine";
import { RevisionEngine } from "./components/RevisionEngine";
import { QuizGameSystem } from "./components/QuizGameSystem";
import { StudyPlanner } from "./components/StudyPlanner";
import { AnalyticsProgress } from "./components/AnalyticsProgress";
import { CodingLab } from "./components/CodingLab";
import { ProjectStudio } from "./components/ProjectStudio";
import { CareerExplorer } from "./components/CareerExplorer";
import { TeacherMode } from "./components/TeacherMode";
import { UserProfileView } from "./components/UserProfileView";
import { AIWhiteboardModal } from "./components/AIWhiteboardModal";
import { VoiceVivaModal } from "./components/VoiceVivaModal";
import { AuthModal } from "./components/AuthModal";

const MainAppContent: React.FC = () => {
  const { activeTab, isAuthModalOpen, setIsAuthModalOpen } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-[#F1F5F9] font-sans text-slate-800 overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Dark Navy Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Crisp White Top Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Scrollable Main Content Section */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#F1F5F9]">
          <div className="max-w-7xl mx-auto w-full">
            {activeTab === "HOME" && <HomeDashboard />}
            {activeTab === "DOUBTS" && <TutorDoubts />}
            {activeTab === "HOMEWORK" && <HomeworkSolver />}
            {activeTab === "SCIENCE LAB" && <ScienceLab />}
            {activeTab === "MATH LAB" && <MathLab />}
            {activeTab === "SOCIAL & LANG" && <SocialLanguageLab />}
            {activeTab === "EXAM" && <ExamEngine />}
            {activeTab === "REVISION" && <RevisionEngine />}
            {activeTab === "QUIZZES" && <QuizGameSystem />}
            {activeTab === "PLANNER" && <StudyPlanner />}
            {activeTab === "PROGRESS" && <AnalyticsProgress />}
            {activeTab === "CODING" && <CodingLab />}
            {activeTab === "PROJECTS" && <ProjectStudio />}
            {activeTab === "CAREER" && <CareerExplorer />}
            {activeTab === "TEACHER" && <TeacherMode />}
            {activeTab === "PROFILE" && <UserProfileView />}
          </div>
        </main>
      </div>

      {/* Interactive Global Modals */}
      <AIWhiteboardModal />
      <VoiceVivaModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
