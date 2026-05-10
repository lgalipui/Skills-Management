import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockRoles } from '../data/mockData';
import { Search, Heart, Map, Briefcase, Filter, ChevronRight, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export const MyNewRoles = () => {
  const { currentUser, favoriteRoles, toggleFavoriteRole } = useAuth();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [familyFilter, setFamilyFilter] = useState('Todas');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const userFavs = favoriteRoles[currentUser.id] || [];

  // Ponderaciones
  const getWeight = (priority) => {
    if (priority === 'Crítica') return 3;
    if (priority === 'Primaria') return 2;
    return 1;
  };

  // Calcular afinidad
  const rolesWithProximity = useMemo(() => {
    return mockRoles.map(role => {
      if (!role.requiredSkills || role.requiredSkills.length === 0) return { ...role, proximity: 0, skillDetails: [] };
      
      let maxScore = 0;
      let userScore = 0;
      const skillDetails = [];

      role.requiredSkills.forEach(rs => {
        const weight = getWeight(rs.priority);
        maxScore += rs.level * weight;
        
        const userSkill = currentUser.skills.find(us => us.name === rs.name);
        const uLevel = userSkill ? userSkill.level : 0;
        
        userScore += Math.min(uLevel, rs.level) * weight;
        
        skillDetails.push({
          name: rs.name,
          required: rs.level,
          actual: uLevel,
          priority: rs.priority,
          isCovered: uLevel >= rs.level,
          gap: rs.level - uLevel
        });
      });

      const proximity = maxScore === 0 ? 0 : Math.round((userScore / maxScore) * 100);
      
      return { ...role, proximity, skillDetails };
    }).sort((a, b) => b.proximity - a.proximity);
  }, [currentUser, mockRoles]);

  // Extraer familias únicas para el filtro
  const families = ['Todas', ...new Set(mockRoles.map(r => r.family).filter(Boolean))];

  // Aplicar filtros
  const filteredRoles = rolesWithProximity.filter(role => {
    if (familyFilter !== 'Todas' && role.family !== familyFilter) return false;
    if (showFavoritesOnly && !userFavs.includes(role.id)) return false;
    return true;
  });

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* PANEL IZQUIERDO: Lista de Roles */}
      <div className="w-full md:w-1/3 flex flex-col bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Map className="text-[#007A33]" /> Explorador de Roles
          </h1>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
              <Filter size={16} className="text-slate-400" />
              <select 
                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                value={familyFilter}
                onChange={(e) => setFamilyFilter(e.target.value)}
              >
                {families.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            
            <button 
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={clsx(
                "w-full py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border",
                showFavoritesOnly 
                  ? "bg-rose-50 text-rose-600 border-rose-200" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              <Heart size={16} className={showFavoritesOnly ? "fill-current" : ""} /> 
              {showFavoritesOnly ? "Viendo solo favoritos" : "Mostrar favoritos"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredRoles.length === 0 ? (
            <div className="text-center p-8 text-slate-500">No se encontraron roles con estos filtros.</div>
          ) : (
            filteredRoles.map(role => {
              const isSelected = selectedRole?.id === role.id;
              const isFav = userFavs.includes(role.id);
              
              return (
                <div 
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={clsx(
                    "p-4 rounded-2xl cursor-pointer transition-all border",
                    isSelected 
                      ? "bg-[#007A33]/5 border-[#007A33]/30 shadow-sm" 
                      : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={clsx("font-bold text-lg leading-tight", isSelected ? "text-[#007A33]" : "text-slate-800")}>
                      {role.title}
                    </h3>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavoriteRole(currentUser.id, role.id); }}
                      className={clsx("p-1.5 rounded-full hover:bg-slate-100 transition-colors", isFav ? "text-rose-500" : "text-slate-300")}
                    >
                      <Heart size={18} className={isFav ? "fill-current" : ""} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                      {role.family}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">
                      Nivel: {role.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={clsx("h-full rounded-full transition-all duration-1000", 
                          role.proximity >= 80 ? "bg-[#007A33]" : role.proximity >= 50 ? "bg-amber-400" : "bg-rose-400"
                        )}
                        style={{ width: `${role.proximity}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{role.proximity}% Afinidad</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PANEL DERECHO: Detalle del Rol */}
      <div className="w-full md:w-2/3 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {!selectedRole ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <Briefcase size={64} className="mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-slate-600">Selecciona un rol</h2>
            <p>Explora los roles de la izquierda para ver tu nivel de afinidad detallado y las skills que necesitas desarrollar para alcanzar tu próximo paso profesional.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
            {/* Cabecera Detalle */}
            <div className="p-8 border-b border-slate-100 relative overflow-hidden bg-slate-900 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#007A33] opacity-20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-emerald-400 font-bold text-sm tracking-wider uppercase mb-1 block">
                      {selectedRole.family}
                    </span>
                    <h2 className="text-3xl font-bold">{selectedRole.title}</h2>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                    <span className="block text-3xl font-bold text-emerald-400">{selectedRole.proximity}%</span>
                    <span className="text-xs font-medium text-slate-300">Match</span>
                  </div>
                </div>
                <p className="text-slate-300 text-lg max-w-2xl">{selectedRole.description}</p>
              </div>
            </div>

            {/* Análisis de Skills */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Análisis de Competencias</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Skills Cubiertas */}
                <div>
                  <h4 className="flex items-center gap-2 font-bold text-[#007A33] mb-4">
                    <CheckCircle2 size={20} /> Skills Cubiertas
                  </h4>
                  <div className="space-y-3">
                    {selectedRole.skillDetails.filter(s => s.isCovered).length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No tienes skills cubiertas para este rol.</p>
                    ) : (
                      selectedRole.skillDetails.filter(s => s.isCovered).map(skill => (
                        <div key={skill.name} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-emerald-900 block">{skill.name}</span>
                            <span className="text-xs text-emerald-600 font-medium">Prioridad {skill.priority}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-sm text-emerald-800 font-bold">Nivel {skill.actual}</span>
                            <span className="text-xs text-emerald-600">Requerido {skill.required}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Skills a Desarrollar */}
                <div>
                  <h4 className="flex items-center gap-2 font-bold text-amber-600 mb-4">
                    <AlertTriangle size={20} /> Gaps a Desarrollar
                  </h4>
                  <div className="space-y-3">
                    {selectedRole.skillDetails.filter(s => !s.isCovered).length === 0 ? (
                      <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-bold text-center border border-emerald-200">
                        ¡Estás listo para este rol! No hay brechas.
                      </div>
                    ) : (
                      selectedRole.skillDetails.filter(s => !s.isCovered).map(skill => (
                        <div key={skill.name} className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex justify-between items-center relative overflow-hidden group">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                          <div>
                            <span className="font-bold text-amber-900 block">{skill.name}</span>
                            <span className="text-xs text-amber-700 font-medium">Prioridad {skill.priority}</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-sm text-amber-800 font-bold">Tienes: {skill.actual}</span>
                            <span className="text-xs font-bold text-rose-600">Falta: +{skill.gap} puntos</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* CTA Final */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <p className="text-sm text-slate-500">¿Quieres prepararte para este rol?</p>
              <button 
                onClick={() => navigate('/myupskilling')}
                className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                Generar Plan de Reskilling <ArrowRight size={18} />
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
