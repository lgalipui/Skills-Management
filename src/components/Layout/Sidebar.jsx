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
  Settings,
  BarChart3,
  Sparkles,
  SlidersHorizontal,
  UserCheck,
  GitFork,
  Map,
  Scale
} from 'lucide-react';
import clsx from 'clsx';

export const Sidebar = () => {
  const { currentUser, orgUnits } = useAuth();
  const userOrg = orgUnits?.find(o => o.id === currentUser.orgUnitId);
  const orgName = userOrg ? userOrg.name : '';
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/myskills', label: 'MySkills', icon: User, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/myupskilling', label: 'MyUpskilling', icon: GraduationCap, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/career-paths', label: 'MyItineraries', icon: Map, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/myopportunities', label: 'MyOpportunities', icon: Briefcase, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/mynewroles', label: 'MyNewRoles', icon: TrendingUp, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/otherskills', label: 'OtherSkills', icon: Sparkles, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/mybadges', label: 'MyBadges', icon: Award, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/peer-nomination', label: 'Nominación de Peers', icon: UserCheck, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/skills-review', label: 'Skills Review', icon: Users, roles: ['Employee', 'Manager', 'RRHH'] },
    { path: '/talentscout', label: 'Internal Talent Scout', icon: Search, roles: ['RRHH'] },
    { path: '/hr-dashboard', label: 'Dashboard RRHH', icon: BarChart3, roles: ['RRHH'] },
    { path: '/config-360', label: 'Configuración Skill Review', icon: SlidersHorizontal, roles: ['RRHH'] },
    { path: '/hr-calibration', label: 'Panel de Calibración', icon: Scale, roles: ['RRHH'] },
    { path: '/hr-careers', label: 'Gestión de Carreras', icon: GitFork, roles: ['RRHH'] },
    { path: '/workforce', label: 'Gestión de Plantilla', icon: Users, roles: ['RRHH'] },
    { path: '/admin', label: 'Gestión Maestros', icon: Settings, roles: ['RRHH'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(currentUser.profile));

  return (
    <aside className="w-64 bg-[#0c101d]/90 dark:bg-[#0c101d]/60 backdrop-blur-xl border-r border-white/5 text-white min-h-screen flex flex-col shadow-2xl relative z-20 transition-all duration-300">
      <div className="p-4 flex items-center gap-2.5 border-b border-white/5">
        <div className="w-8 h-8 bg-[rgba(255,255,255,0.1)] rounded-lg flex items-center justify-center shadow-md shrink-0 border border-white/10">
          <Award className="text-emerald-400" size={18} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          Talent<span className="font-light opacity-80">by Skills</span>
        </h1>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Navegación</p>
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all duration-200 group relative overflow-hidden text-xs",
                isActive 
                  ? "bg-[rgba(255,255,255,0.1)] text-emerald-400 font-semibold shadow-[inset_3px_0_0_0_#10b981]" 
                  : "text-slate-400 hover:bg-[rgba(255,255,255,0.05)] hover:text-slate-100"
              )}
            >
              <Icon size={17} className="transition-transform group-hover:scale-110 duration-300 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-3 bg-black/25 mt-auto border-t border-white/5">
        <div className="flex items-center gap-2.5 px-1 py-0.5">
          <img src={currentUser.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-emerald-500/50 shadow-md object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate leading-tight">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-none">{currentUser.role}</p>
            {orgName && (
              <p className="text-[9px] text-slate-500 truncate mt-1 leading-none" title={orgName}>
                {orgName}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
