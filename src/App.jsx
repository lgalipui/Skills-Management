import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { MySkills } from './pages/MySkills';
import { SkillsReview } from './pages/SkillsReview';
import { MyUpskilling } from './pages/MyUpskilling';
import { MyBadges } from './pages/MyBadges';
import { MyNewRoles } from './pages/MyNewRoles';
import { MyOpportunities } from './pages/MyOpportunities';
import { TalentScout } from './pages/TalentScout';
import { Admin } from './pages/Admin';
import { Placeholder } from './pages/Placeholder';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/myskills" element={<MySkills />} />
            <Route path="/skills-review" element={<SkillsReview />} />
            <Route path="/myupskilling" element={<MyUpskilling />} />
            <Route path="/mybadges" element={<MyBadges />} />
            <Route path="/mynewroles" element={<MyNewRoles />} />
            <Route path="/myopportunities" element={<MyOpportunities />} />
            <Route path="/talentscout" element={<TalentScout />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
