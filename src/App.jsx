import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { MySkills } from './pages/MySkills';
import { SkillsReview } from './pages/SkillsReview';
import { PeerNomination } from './pages/PeerNomination';
import { MyUpskilling } from './pages/MyUpskilling';
import { MyBadges } from './pages/MyBadges';
import { MyNewRoles } from './pages/MyNewRoles';
import { MyOpportunities } from './pages/MyOpportunities';
import { TalentScout } from './pages/TalentScout';
import { Admin } from './pages/Admin';
import { WorkforceManagement } from './pages/WorkforceManagement';
import { HrDashboard } from './pages/HrDashboard';
import { OtherSkills } from './pages/OtherSkills';
import { Placeholder } from './pages/Placeholder';
import { SkillsReviewConfig } from './pages/SkillsReviewConfig';
import { CareerPaths } from './pages/CareerPaths';
import { HrCareerManagement } from './pages/HrCareerManagement';
import { HrCalibration } from './pages/HrCalibration';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/myskills" element={<MySkills />} />
            <Route path="/peer-nomination" element={<PeerNomination />} />
            <Route path="/skills-review" element={<SkillsReview />} />
            <Route path="/myupskilling" element={<MyUpskilling />} />
            <Route path="/mybadges" element={<MyBadges />} />
            <Route path="/mynewroles" element={<MyNewRoles />} />
            <Route path="/myopportunities" element={<MyOpportunities />} />
            <Route path="/talentscout" element={<TalentScout />} />
            <Route path="/workforce" element={<WorkforceManagement />} />
            <Route path="/hr-dashboard" element={<HrDashboard />} />
            <Route path="/otherskills" element={<OtherSkills />} />
            <Route path="/career-paths" element={<CareerPaths />} />
            <Route path="/hr-careers" element={<HrCareerManagement />} />
            <Route path="/hr-calibration" element={<HrCalibration />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/config-360" element={<SkillsReviewConfig />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
