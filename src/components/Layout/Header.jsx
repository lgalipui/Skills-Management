import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell } from 'lucide-react';

export const Header = () => {
  const { currentUser, switchUser } = useAuth();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-slate-800">
          Hola, {currentUser.name.split(' ')[0]} <span className="text-2xl inline-block origin-[70%_70%] hover:animate-wave cursor-default">👋</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">Aquí está el resumen de tus competencias y desarrollo.</p>
      </div>
      
      <div className="flex items-center gap-8">
        <button className="relative p-2 text-slate-400 hover:text-[#007A33] transition-colors rounded-full hover:bg-emerald-50">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-8">
          <span className="text-sm text-slate-500 font-medium whitespace-nowrap">Simular Perfil:</span>
          <select 
            className="text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A33] focus:border-transparent cursor-pointer shadow-sm hover:border-emerald-300 transition-colors"
            value={currentUser.profile}
            onChange={(e) => switchUser(e.target.value)}
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
