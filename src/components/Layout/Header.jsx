import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { currentUser, switchUser, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();

  const handleProfileChange = (e) => {
    const newProfile = e.target.value;
    switchUser(newProfile);
    if (newProfile === 'RRHH') {
      navigate('/talentscout');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="h-20 bg-[var(--bg-header)] border-b border-[var(--border-header)] backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 transition-all duration-300">
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-[var(--text-accent)]">
          Hola, {currentUser.name.split(' ')[0]} <span className="text-2xl inline-block origin-[70%_70%] hover:animate-wave cursor-default">👋</span>
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Aquí está el resumen de tus competencias y desarrollo.</p>
      </div>
      
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleDarkMode}
          className="p-2 text-slate-400 dark:text-slate-300 hover:text-[#007A33] dark:hover:text-emerald-450 transition-all rounded-full hover:bg-emerald-50 dark:hover:bg-white/5 border border-transparent dark:border-white/5 shadow-2xs hover:scale-105 duration-200 shrink-0"
          title={darkMode ? "Activar Modo Día" : "Activar Modo Noche"}
        >
          {darkMode ? <Sun size={20} className="text-amber-400 fill-amber-400" /> : <Moon size={20} />}
        </button>

        <button className="relative p-2 text-slate-400 hover:text-[#007A33] transition-colors rounded-full hover:bg-emerald-50">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-8">
          <span className="text-sm text-slate-500 font-medium whitespace-nowrap">Simular Perfil:</span>
          <select 
            className="text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A33] focus:border-transparent cursor-pointer shadow-sm hover:border-emerald-300 transition-colors"
            value={currentUser.profile}
            onChange={handleProfileChange}
          >
            <option value="Employee">Empleado (Ana G.)</option>
            <option value="Manager">Manager (Carlos M.)</option>
            <option value="RRHH">RRHH (Elena R.)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
