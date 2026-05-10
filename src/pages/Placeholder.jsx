import React from 'react';
import { useLocation } from 'react-router-dom';

export const Placeholder = () => {
  const location = useLocation();
  const pageName = location.pathname.substring(1).replace('-', ' ') || 'Dashboard';

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 text-center max-w-md">
        <div className="w-20 h-20 bg-emerald-50 text-[#007A33] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 capitalize mb-3">Módulo: {pageName}</h2>
        <p className="text-slate-500">
          Este módulo está en fase de diseño. Pronto podrás ver las funcionalidades de este apartado en el prototipo final.
        </p>
      </div>
    </div>
  );
};
