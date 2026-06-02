import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockRoles, mockCourses } from '../data/mockData';
import { Search, Heart, Map, Briefcase, Filter, ChevronRight, CheckCircle2, AlertTriangle, ArrowRight, X, BookOpen, Clock, Award } from 'lucide-react';
import clsx from 'clsx';

const ACCREDITATIONS_CATALOG = [
  { id: "AWS", label: "AWS Solutions Architect (Amazon Cloud)" },
  { id: "ScrumMaster", label: "Scrum Alliance - Scrum Master Cert." },
  { id: "PMP", label: "Project Management Professional (PMI-PMP)" },
  { id: "CajamarAcademy", label: "Cajamar Tech Academy - Formación Avanzada" },
  { id: "EnglishB2", label: "Acreditación Oficial de Inglés B2/C1" },
  { id: "AzureArch", label: "Microsoft Certified: Azure Solutions Architect" },
  { id: "GCPArch", label: "Google Cloud Certified: Professional Cloud Architect" },
  { id: "PythonCert", label: "PCAP – Certified Associate in Python Programming" },
  { id: "SafeAgilist", label: "SAFe Agilist Certification (Scaled Agile)" },
  { id: "CISSP", label: "CISSP - Certified Information Systems Security Professional" }
];

export const MyNewRoles = () => {
  const { 
    currentUser, 
    favoriteRoles, 
    toggleFavoriteRole,
    progressionCriteria = [],
    employeeDossier,
    rolesData = []
  } = useAuth();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [familyFilter, setFamilyFilter] = useState('Todas');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userFavs = favoriteRoles[currentUser.id] || [];

  const currentUserRoleId = useMemo(() => {
    if (!currentUser) return 'r1';
    const rolesList = rolesData.length ? rolesData : mockRoles;
    const match = rolesList.find(r => 
      r.title.toLowerCase() === currentUser.role.toLowerCase() && 
      r.level.toLowerCase() === currentUser.level.toLowerCase()
    );
    const fallback = match || rolesList.find(r => r.title.toLowerCase() === currentUser.role.toLowerCase());
    return fallback ? fallback.id : 'r1';
  }, [currentUser, rolesData]);

  const detailContainerRef = useRef(null);

  useEffect(() => {
    if (detailContainerRef.current) {
      detailContainerRef.current.scrollTop = 0;
    }
  }, [selectedRole]);

  const getCriteriaForDestination = (toRoleId) => {
    const match = progressionCriteria.find(c => c.toRoleId === toRoleId);
    const base = match || {
      toRoleId: toRoleId,
      minYearsInEntity: 1.0,
      minYearsExperience: 2.0,
      reqPerformanceYears: 1,
      reqPerformanceLevel: "Alto",
      reqPotentialYears: 1,
      reqPotentialLevel: "Alto Potencial",
      acceptedMarketConditions: ["AWS", "EnglishB2", "ScrumMaster", "CajamarAcademy"],
      previousRoles: []
    };
    return {
      ...base,
      enableMinYearsInEntity: base.enableMinYearsInEntity !== undefined ? base.enableMinYearsInEntity : true,
      enableMinYearsExperience: base.enableMinYearsExperience !== undefined ? base.enableMinYearsExperience : true,
      enablePerformance: base.enablePerformance !== undefined ? base.enablePerformance : true,
      enablePotential: base.enablePotential !== undefined ? base.enablePotential : true,
      enableMarketConditions: base.enableMarketConditions !== undefined ? base.enableMarketConditions : true,
      enablePreviousRoles: base.enablePreviousRoles !== undefined ? base.enablePreviousRoles : true,
      previousRoles: base.previousRoles || []
    };
  };

  const getCoursesForSkill = (skillName) => {
    return mockCourses.filter(c => c.skills.includes(skillName));
  };

  // Ponderaciones
  const getWeight = (priority) => {
    if (priority === 'Crítica') return 3;
    if (priority === 'Primaria') return 2;
    return 1;
  };

  // Calcular afinidad
  const rolesWithProximity = useMemo(() => {
    const rolesList = rolesData.length ? rolesData : mockRoles;
    return rolesList.map(role => {
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
  }, [currentUser, rolesData]);

  // Extraer familias únicas para el filtro
  const families = useMemo(() => {
    const rolesList = rolesData.length ? rolesData : mockRoles;
    return ['Todas', ...new Set(rolesList.map(r => r.family).filter(Boolean))];
  }, [rolesData]);

  // Aplicar filtros
  const filteredRoles = rolesWithProximity.filter(role => {
    if (role.title.toLowerCase() === currentUser.role.toLowerCase()) return false;
    if (familyFilter !== 'Todas' && role.family !== familyFilter) return false;
    if (showFavoritesOnly && !userFavs.includes(role.id)) return false;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = role.title.toLowerCase().includes(query);
      const matchFamily = role.family ? role.family.toLowerCase().includes(query) : false;
      const matchId = role.id ? role.id.toLowerCase().includes(query) : false;
      if (!matchTitle && !matchFamily && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
           {/* PANEL IZQUIERDO: Lista de Roles */}
      <div className="w-full md:w-1/3 flex flex-col bg-white dark:bg-slate-900/10 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/40 overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Map className="text-emerald-500" /> Explorador de Roles
          </h1>
          
          <div className="space-y-3">
            {/* Buscador de Roles Individuales */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <Search size={16} className="text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar por rol o palabra clave..." 
                className="w-full bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 cursor-pointer">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <Filter size={16} className="text-slate-400 dark:text-slate-500" />
              <select 
                className="w-full bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                value={familyFilter}
                onChange={(e) => setFamilyFilter(e.target.value)}
              >
                {families.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            
            <button 
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={clsx(
                "w-full py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border cursor-pointer",
                showFavoritesOnly 
                  ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border-rose-200 dark:border-rose-800/40" 
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
              )}
            >
              <Heart size={16} className={showFavoritesOnly ? "fill-current" : ""} /> 
              {showFavoritesOnly ? "Viendo solo favoritos" : "Mostrar favoritos"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredRoles.length === 0 ? (
            <div className="text-center p-8 text-slate-500 dark:text-slate-450">No se encontraron roles con estos filtros o término de búsqueda.</div>
          ) : (
            filteredRoles.map(role => {
              const isSelected = selectedRole?.id === role.id;
              const isFav = userFavs.includes(role.id);
              
              return (
                <div 
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={clsx(
                    "p-4 rounded-2xl cursor-pointer transition-all border text-left",
                    isSelected 
                      ? "bg-emerald-500/10 border-emerald-500/30 dark:border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/20" 
                      : "bg-white dark:bg-slate-900/20 border-slate-100 dark:border-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={clsx("font-bold text-lg leading-tight", isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200")}>
                      {role.title}
                    </h3>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavoriteRole(currentUser.id, role.id); }}
                      className={clsx("p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer", isFav ? "text-rose-500" : "text-slate-300 dark:text-slate-600")}
                    >
                      <Heart size={18} className={isFav ? "fill-current" : ""} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 rounded-md">
                      {role.family}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800/40 rounded-md">
                      Nivel: {role.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={clsx("h-full rounded-full transition-all duration-1000", 
                          role.proximity >= 80 ? "bg-emerald-500" : role.proximity >= 50 ? "bg-amber-400" : "bg-rose-400"
                        )}
                        style={{ width: `${role.proximity}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{role.proximity}% Afinidad</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PANEL DERECHO: Detalle del Rol */}
      <div className="w-full md:w-2/3 bg-white dark:bg-slate-900/10 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/40 overflow-hidden flex flex-col">
        {!selectedRole ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-450 dark:text-slate-500 p-8 text-center bg-transparent">
            <Briefcase size={64} className="mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-slate-650 dark:text-slate-400">Selecciona un rol</h2>
            <p className="text-slate-500 dark:text-slate-550 max-w-sm mt-1">Explora los roles de la izquierda o introduce un término en el buscador para ver tu nivel de afinidad detallado y las skills que necesitas desarrollar para alcanzar tu próximo paso profesional.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
            {/* Cabecera Detalle */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden bg-slate-900 dark:bg-slate-950 text-white text-left">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-emerald-400 font-bold text-sm tracking-wider uppercase mb-1 block">
                      {selectedRole.family}
                    </span>
                    <h2 className="text-3xl font-bold text-white">{selectedRole.title}</h2>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                    <span className="block text-3xl font-bold text-emerald-400">{selectedRole.proximity}%</span>
                    <span className="text-xs font-medium text-slate-300">Match</span>
                  </div>
                </div>
                <p className="text-slate-300 text-base max-w-2xl">{selectedRole.description}</p>
              </div>
            </div>

            {/* Análisis de Skills y Requisitos */}
            <div ref={detailContainerRef} className="flex-1 overflow-y-auto p-8 custom-scrollbar text-left space-y-8">
              
              {/* SECCIÓN 1: REQUISITOS DE CARRERA Y CUMPLIMIENTO */}
              {(() => {
                const criteriaForm = getCriteriaForDestination(selectedRole.id);

                // Check Compliance of Ana García
                const satisfiesEntityYears = !criteriaForm.enableMinYearsInEntity || employeeDossier.yearsInEntity >= criteriaForm.minYearsInEntity;
                const satisfiesExpYears = !criteriaForm.enableMinYearsExperience || employeeDossier.totalExperienceYears >= criteriaForm.minYearsExperience;

                const ratingWeights = { "Bajo": 1, "Medio": 2, "Alto": 3, "Excelente": 4 };
                const reqPerfWeight = ratingWeights[criteriaForm.reqPerformanceLevel] || 2;
                const matchingPerfYears = employeeDossier.performanceHistory.filter(h => {
                  const w = ratingWeights[h.rating] || 2;
                  return w >= reqPerfWeight;
                }).length;
                const satisfiesPerformance = !criteriaForm.enablePerformance || matchingPerfYears >= criteriaForm.reqPerformanceYears;

                const reqPotWeight = ratingWeights[criteriaForm.reqPotentialLevel === 'Alto Potencial' ? 'Alto' : criteriaForm.reqPotentialLevel] || 1;
                const actualPotWeight = ratingWeights[employeeDossier.potentialAssessment === 'Alto Potencial' ? 'Alto' : employeeDossier.potentialAssessment] || 1;
                const satisfiesPotential = !criteriaForm.enablePotential || actualPotWeight >= reqPotWeight;

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Requisitos de Progreso y Dossier</h3>
                      <span className="text-[9px] font-extrabold text-[#007A33] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/30 px-1.5 py-0.2 rounded-md">Expediente Al Día</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      
                      {/* Roles Previos Requeridos o Recomendados */}
                      {criteriaForm.enablePreviousRoles && criteriaForm.previousRoles?.map(prev => {
                        const matchingRole = (rolesData.length ? rolesData : mockRoles).find(r => r.id === prev.roleId);
                        const title = matchingRole ? matchingRole.title : prev.roleId;
                        
                        // Comprobar cumplimiento contra el dossier
                        const isCurrent = prev.roleId === currentUserRoleId;
                        const actualYears = isCurrent ? employeeDossier.yearsInRole : 0;
                        const satisfies = actualYears >= prev.minYears;
                        const isRequired = prev.type === 'required';

                        return (
                          <div key={prev.roleId} className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800/40 flex items-start gap-3 lg:col-span-2">
                            <div className="mt-0.5 shrink-0">
                              {satisfies ? (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-350 text-xs font-black">✓</span>
                              ) : isRequired ? (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-350 text-xs font-black">✗</span>
                              ) : (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-350 text-xs font-black">⚠️</span>
                              )}
                            </div>
                            <div className="text-xs min-w-0 text-left">
                              <p className="font-bold text-slate-700 dark:text-slate-350 leading-tight">
                                Rol previo {isRequired ? 'Requerido' : 'Recomendado'}: <span className="font-extrabold text-slate-800 dark:text-slate-200">{title}</span>
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1">
                                Tienes: <strong>{actualYears} años</strong> vs Exigido: <strong>{prev.minYears} años</strong>
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {criteriaForm.enablePreviousRoles && criteriaForm.previousRoles?.length === 0 && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800/40 flex items-start gap-3 lg:col-span-2">
                          <div className="text-xs min-w-0 text-slate-550 dark:text-slate-400">
                            ℹ️ No se exigen roles previos obligatorios o recomendados para esta transición.
                          </div>
                        </div>
                      )}

                      {/* 1. Antigüedad en la Entidad */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800/40 flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {!criteriaForm.enableMinYearsInEntity ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black">✓</span>
                          ) : satisfiesEntityYears ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-350 text-xs font-black">✓</span>
                          ) : (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-350 text-xs font-black">⚠️</span>
                          )}
                        </div>
                        <div className="text-xs min-w-0">
                          <p className="font-bold text-slate-700 dark:text-slate-350 leading-tight">Antigüedad en Cajamar</p>
                          {!criteriaForm.enableMinYearsInEntity ? (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Criterio no exigido para esta transición.</p>
                          ) : (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Tienes: <strong>{employeeDossier.yearsInEntity} años</strong> vs Requerido: <strong>{criteriaForm.minYearsInEntity} años</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 2. Años de Experiencia Total */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800/40 flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {!criteriaForm.enableMinYearsExperience ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black">✓</span>
                          ) : satisfiesExpYears ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-350 text-xs font-black">✓</span>
                          ) : (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-350 text-xs font-black">⚠️</span>
                          )}
                        </div>
                        <div className="text-xs min-w-0">
                          <p className="font-bold text-slate-700 dark:text-slate-350 leading-tight">Años de Experiencia Total</p>
                          {!criteriaForm.enableMinYearsExperience ? (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Criterio no exigido para esta transición.</p>
                          ) : (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Tienes: <strong>{employeeDossier.totalExperienceYears} años</strong> vs Requerido: <strong>{criteriaForm.minYearsExperience} años</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 3. Condiciones de Desempeño */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800/40 flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {!criteriaForm.enablePerformance ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black">✓</span>
                          ) : satisfiesPerformance ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-350 text-xs font-black">✓</span>
                          ) : (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-350 text-xs font-black">⚠️</span>
                          )}
                        </div>
                        <div className="text-xs min-w-0">
                          <p className="font-bold text-slate-700 dark:text-slate-350 leading-tight">Historial de Desempeño</p>
                          {!criteriaForm.enablePerformance ? (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Criterio no exigido para esta transición.</p>
                          ) : (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                              Mínimo: <strong>{criteriaForm.reqPerformanceLevel}</strong> por <strong>{criteriaForm.reqPerformanceYears} años</strong>. <br/>
                              Tu dossier: {employeeDossier.performanceHistory.map(h => `${h.rating}`).join(', ')}.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 4. Valoración de Potencial */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800/40 flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {!criteriaForm.enablePotential ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black">✓</span>
                          ) : satisfiesPotential ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-350 text-xs font-black">✓</span>
                          ) : (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-350 text-xs font-black">✗</span>
                          )}
                        </div>
                        <div className="text-xs min-w-0">
                          <p className="font-bold text-slate-700 dark:text-slate-350 leading-tight">Valoración de Potencial</p>
                          {!criteriaForm.enablePotential ? (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Criterio no exigido para esta transición.</p>
                          ) : (
                            <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5">
                              Tienes: <strong>{employeeDossier.potentialAssessment}</strong> vs Requerido: <strong>{criteriaForm.reqPotentialLevel}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 5. Acreditaciones Aceptadas */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800/40 flex flex-col gap-2 lg:col-span-2">
                        <p className="font-bold text-slate-700 dark:text-slate-350 text-xs leading-tight">Flexibilidad y Acreditaciones de Mercado</p>
                        
                        {!criteriaForm.enableMarketConditions || criteriaForm.acceptedMarketConditions?.length === 0 ? (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">No se exigen o no se han definido equivalencias de mercado para flexibilizar este itinerario.</p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              Puedes acelerar la transición o convalidar brechas técnicas aportando alguna de estas certificaciones aceptadas:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {criteriaForm.acceptedMarketConditions.map(cond => {
                                const match = ACCREDITATIONS_CATALOG.find(a => a.id === cond);
                                const hasIt = employeeDossier.marketCertifications.includes(cond);
                                return (
                                  <div key={cond} className="flex justify-between items-center text-[10px] p-2 bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-750 rounded-lg">
                                    <span className="font-medium text-slate-650 dark:text-slate-300 pr-2 truncate">{match ? match.label.split(' (')[0] : cond}</span>
                                    {hasIt ? (
                                      <span className="text-[8px] font-extrabold text-[#007A33] dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800/30 shrink-0">Acreditado</span>
                                    ) : (
                                      <span className="text-[8px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md border border-amber-150 dark:border-amber-700/40 shrink-0">Pendiente</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* SECCIÓN 2: ANÁLISIS DE COMPETENCIAS */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Análisis de Competencias</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Skills Cubiertas */}
                <div>
                  <h4 className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-450 mb-4">
                    <CheckCircle2 size={20} /> Skills Cubiertas
                  </h4>
                  <div className="space-y-3">
                    {selectedRole.skillDetails.filter(s => s.isCovered).length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-450 italic">No tienes skills cubiertas para este rol.</p>
                    ) : (
                      selectedRole.skillDetails.filter(s => s.isCovered).map(skill => (
                        <div key={skill.name} className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800/40 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden group">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/80"></div>
                          <div className="pl-2 text-left">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block text-base leading-tight">{skill.name}</span>
                            <span className={clsx(
                              "inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-1.5 uppercase tracking-wide",
                              skill.priority === 'Crítica' ? "bg-rose-100/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-250/30 dark:border-rose-800/20" :
                              skill.priority === 'Primaria' ? "bg-amber-100/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-250/30 dark:border-amber-800/20" :
                              "bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200/30 dark:border-slate-700/20"
                            )}>
                              {skill.priority}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="block text-sm text-[#007A33] dark:text-emerald-400 font-extrabold">Nivel {skill.actual}</span>
                            <span className="text-xs text-slate-450 dark:text-slate-500">Requerido {skill.required}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Skills a Desarrollar */}
                <div>
                  <h4 className="flex items-center gap-2 font-bold text-rose-500 dark:text-rose-400 mb-4">
                    <AlertTriangle size={20} /> Gaps a Desarrollar
                  </h4>
                  <div className="space-y-3">
                    {selectedRole.skillDetails.filter(s => !s.isCovered).length === 0 ? (
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-sm font-bold text-center border border-emerald-250 dark:border-emerald-800/30">
                        ¡Estás listo para este rol! No hay brechas.
                      </div>
                    ) : (
                      selectedRole.skillDetails.filter(s => !s.isCovered).map(skill => (
                        <div key={skill.name} className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800/40 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden group">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/80"></div>
                          <div className="pl-2 text-left">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block text-base leading-tight">{skill.name}</span>
                            <span className={clsx(
                              "inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-1.5 uppercase tracking-wide",
                              skill.priority === 'Crítica' ? "bg-rose-100/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-250/30 dark:border-rose-800/20" :
                              skill.priority === 'Primaria' ? "bg-amber-100/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-250/30 dark:border-amber-800/20" :
                              "bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200/30 dark:border-slate-700/20"
                            )}>
                              {skill.priority}
                            </span>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1.5">
                            <span className="block text-xs text-slate-500 dark:text-slate-400">Tienes: <strong>{skill.actual}</strong> / {skill.required}</span>
                            <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-900/30 shrink-0">
                              Falta: +{skill.gap}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* CTA Final */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex justify-between items-center">
              <p className="text-sm text-slate-500 dark:text-slate-450">¿Quieres prepararte para este rol?</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 dark:hover:bg-slate-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                Generar Plan de Reskilling <ArrowRight size={18} />
              </button>
            </div>

          </div>
        )}
      </div>

      {/* MODAL PLAN DE RESKILLING */}
      {isModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0c101d] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border dark:border-slate-800/80">
            
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
              <div className="text-left">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Plan de Reskilling</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">Objetivo: <strong className="text-slate-700 dark:text-emerald-400">{selectedRole.title}</strong></p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-355 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white dark:bg-[#0c101d] text-left">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/40 rounded-2xl p-6 mb-8 flex items-start gap-4">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-xs text-amber-500">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 dark:text-amber-300 text-lg">Afinidad actual: {selectedRole.proximity}%</h3>
                  <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
                    Para estar completamente preparado para este rol, necesitas desarrollar las siguientes competencias. Aquí tienes nuestra propuesta formativa.
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {selectedRole.skillDetails.filter(s => !s.isCovered).map(skill => {
                  const suggestedCourses = getCoursesForSkill(skill.name);
                  
                  return (
                    <div key={skill.name} className="bg-white dark:bg-slate-900/10 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/40 overflow-hidden">
                      <div className="px-8 py-5 border-b bg-slate-50 dark:bg-slate-950/30 border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{skill.name}</h2>
                            <span className={clsx(
                              "text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide",
                              skill.gap >= 2 ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400" : "bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-350"
                            )}>
                              Prioridad {skill.priority}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-450 mt-1">
                            Nivel actual: <strong className="text-slate-700 dark:text-slate-350">{skill.actual}</strong> → Requerido: <strong className="text-slate-700 dark:text-slate-300">{skill.required}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="p-8 bg-white dark:bg-transparent">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <BookOpen size={16} /> Cursos Recomendados
                        </h3>
                        
                        {suggestedCourses.length === 0 ? (
                          <p className="text-slate-500 dark:text-slate-450 italic text-sm">No hay cursos disponibles para esta competencia por el momento.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {suggestedCourses.map(course => (
                              <div key={course.id} className="flex border border-slate-100 dark:border-slate-800/40 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group bg-slate-50/30 dark:bg-slate-900/20">
                                <div className="w-24 md:w-32 h-auto shrink-0 overflow-hidden relative">
                                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                                </div>
                                <div className="p-4 flex flex-col flex-1">
                                  <div className="flex justify-between items-start mb-1 gap-2">
                                    <span className="text-[10px] md:text-xs font-semibold text-[#007A33] dark:text-emerald-450 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/10 dark:border-emerald-800/30">
                                      Objetivo: Nivel {Math.min(skill.actual + 1, skill.required)}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] md:text-xs text-slate-500 dark:text-slate-450 font-medium">
                                      <Clock size={12} /> {course.duration}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-slate-800 dark:text-slate-200 leading-tight my-2 line-clamp-2 text-sm md:text-base">{course.title}</h4>
                                  
                                  <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
                                    <span className={clsx("text-sm font-bold", course.cost > 0 ? "text-slate-700 dark:text-slate-300" : "text-emerald-600 dark:text-emerald-400")}>
                                      {course.cost > 0 ? `${course.cost}€` : "Gratuito"}
                                    </span>
                                    <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-350 flex items-center justify-center hover:bg-[#007A33] dark:hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer">
                                      <ChevronRight size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/30 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
