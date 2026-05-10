import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Plus, Edit2, ShieldAlert, Layers, BookOpen, Trash2 } from 'lucide-react';
import { mockRoles } from '../data/mockData';
import clsx from 'clsx';

export const Admin = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Roles');

  // Estado local para simular CRUD de Roles en memoria
  const [rolesData, setRolesData] = useState(mockRoles);

  if (currentUser.profile !== 'RRHH') {
    return <div className="p-8 text-center text-rose-500 font-bold">Acceso denegado. Exclusivo RRHH.</div>;
  }

  // Helpers visuales para Badges
  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'Crítica': return <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Crítica</span>;
      case 'Primaria': return <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Primaria</span>;
      default: return <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Secundaria</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
          <Settings size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestión de Maestros</h1>
          <p className="text-slate-500">Configuración global del catálogo de Skills, Roles y Categorías de Cajamar.</p>
        </div>
      </div>

      {/* NAVEGACIÓN PESTAÑAS */}
      <div className="flex gap-4 border-b border-slate-200">
        {[
          { id: 'Skills', icon: BookOpen },
          { id: 'Roles', icon: ShieldAlert },
          { id: 'Categorías', icon: Layers }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "pb-4 px-4 text-sm font-bold flex items-center gap-2 transition-all relative",
                isActive ? "text-[#007A33]" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon size={18} /> {tab.id}
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#007A33] rounded-t-full"></div>}
            </button>
          );
        })}
      </div>

      {/* CONTENIDO PESTAÑAS */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* TAB HEADER */}
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Directorio de {activeTab}</h2>
          <button className="bg-[#007A33] text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md hover:bg-[#006028] transition-colors">
            <Plus size={16} /> Nuevo Registro
          </button>
        </div>

        {/* TABLA: ROLES (La única que implementaremos con detalle visual para la demo) */}
        {activeTab === 'Roles' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-xs uppercase tracking-wider font-bold text-slate-400 border-b border-slate-200">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Título del Rol</th>
                  <th className="p-4">Familia</th>
                  <th className="p-4">Nivel</th>
                  <th className="p-4 w-1/3">Skills Requeridas (Prioridad)</th>
                  <th className="p-4 text-center pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {rolesData.map(role => (
                  <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-mono text-slate-400">{role.id}</td>
                    <td className="p-4 font-bold text-slate-800">{role.title}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                        {role.family}
                      </span>
                    </td>
                    <td className="p-4">{role.level}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {role.requiredSkills?.map(rs => (
                          <div key={rs.name} className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs shadow-sm">
                            <span className="font-semibold text-slate-700">{rs.name}</span>
                            <span className="text-slate-400">Lv.{rs.level}</span>
                            {getPriorityBadge(rs.priority)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MOCK DE LAS OTRAS PESTAÑAS */}
        {activeTab !== 'Roles' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              {activeTab === 'Skills' ? <BookOpen size={32}/> : <Layers size={32}/>}
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">Tabla de {activeTab}</h3>
            <p className="text-slate-400 text-sm">El diseño de esta tabla sigue el mismo patrón que la pestaña de Roles. <br/>(Simulado para este prototipo).</p>
          </div>
        )}

      </div>
    </div>
  );
};
