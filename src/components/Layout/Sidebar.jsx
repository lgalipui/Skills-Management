import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  User, 
  Users, 
  GraduationCap, 
  Award, 
  TrendingUp, 
  Briefcase, 
  Search, 
  Settings 
} from 'lucide-react';
import clsx from 'clsx';

export const Sidebar = () => {
  const { currentUser } = useAuth();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/myskills', label: 'MySkills', icon: User, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/skills-review', label: 'Skills Review', icon: Users, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/myupskilling', label: 'MyUpskilling', icon: GraduationCap, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/mybadges', label: 'MyBadges', icon: Award, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/mynewroles', label: 'MyNewRoles', icon: TrendingUp, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/myopportunities', label: 'MyOpportunities', icon: Briefcase, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/talentscout', label: 'Internal Talent Scout', icon: Search, roles: ['RRHH'] },
    { path: '/admin', label: 'Gestión Maestros', icon: Settings, roles: ['RRHH'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(currentUser.profile));

  return (
    <aside className="w-72 bg-[#005021] text-white min-h-screen flex flex-col shadow-2xl relative z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
          <Award className="text-[#007A33]" size={20} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Cajamar<span className="font-light opacity-80">Skills</span>
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-emerald-200/50 uppercase tracking-wider mb-4">Navegación</p>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-white/10 text-white font-medium shadow-[inset_4px_0_0_0_rgba(255,255,255,1)]" 
                  : "text-emerald-100/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={20} className="transition-transform group-hover:scale-110 duration-300" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 bg-black/10 mt-auto border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2">
          <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-emerald-400 shadow-lg object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
            <p className="text-xs text-emerald-200 truncate">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
