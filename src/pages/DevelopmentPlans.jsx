import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, Check, X, AlertCircle, Calendar, ChevronRight, UserCheck, Plus, 
  Search, Award, TrendingUp, Edit3, Save, Clock, ShieldCheck, HelpCircle, 
  ChevronDown, BookOpen, User, Users, SlidersHorizontal, MessageSquare
} from 'lucide-react';
import clsx from 'clsx';

export const DevelopmentPlans = () => {
  const { 
    currentUser, 
    users = [], 
    developmentPlans = [], 
    saveDevelopmentPlan, 
    updatePlanStatus,
    orgUnits = []
  } = useAuth();

  // Gestión de Pestañas Principales
  const [activeTab, setActiveTab] = useState('myPlan'); // 'myPlan', 'teamPlans', 'corporatePlans'
  
  // Selección de año de gestión
  const [selectedYear, setSelectedYear] = useState(2026);
  const years = [2024, 2025, 2026];

  // --- MODO EMPLEADO ---
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkills, setEditedSkills] = useState({}); // { skillId: { targetLevel, action70, action20, action10 } }

  // --- MODO MÁNAGER ---
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [managerCommentText, setManagerCommentText] = useState('');

  // --- MODO RRHH ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [orgFilter, setOrgFilter] = useState('Todos');

  // =========================================================================
  // 1. OBTENCIÓN DE DATOS Y CONEXIONES DE MIEMBROS DE EQUIPO Y PLANES
  // =========================================================================

  // Encontrar el plan del usuario actual para el año seleccionado
  const myPlan = useMemo(() => {
    return developmentPlans.find(p => p.employeeId === currentUser.id && p.year === selectedYear);
  }, [developmentPlans, currentUser.id, selectedYear]);

  // Colaboradores a cargo del mánager activo (equipo directo)
  const myReports = useMemo(() => {
    return users.filter(u => u.managerId === currentUser.id);
  }, [users, currentUser.id]);

  // Planes de desarrollo del equipo directo para el año seleccionado
  const teamPlans = useMemo(() => {
    const reportIds = myReports.map(r => r.id);
    return developmentPlans.filter(p => reportIds.includes(p.employeeId) && p.year === selectedYear);
  }, [developmentPlans, myReports, selectedYear]);

  // Colaborador seleccionado para revisión
  const selectedReportUser = useMemo(() => {
    return users.find(u => u.id === selectedReportId);
  }, [users, selectedReportId]);

  // Plan del colaborador seleccionado para revisión
  const selectedReportPlan = useMemo(() => {
    if (!selectedReportId) return null;
    return developmentPlans.find(p => p.employeeId === selectedReportId && p.year === selectedYear);
  }, [developmentPlans, selectedReportId, selectedYear]);

  // =========================================================================
  // 2. DETALLE DE HABILIDADES DEL ROL PARA CREACIÓN DE NUEVO PLAN
  // =========================================================================
  const userRoleSkills = useMemo(() => {
    return currentUser.skills || [];
  }, [currentUser]);

  // Inicializar modo edición con los datos del plan actual o los de las habilidades por defecto
  const handleStartEdit = () => {
    const skillsData = {};
    
    if (myPlan && myPlan.skills) {
      myPlan.skills.forEach(s => {
        skillsData[s.skillId] = {
          targetLevel: s.targetLevel || 3,
          action70: s.action70 || '',
          action20: s.action20 || '',
          action10: s.action10 || ''
        };
      });
    } else {
      userRoleSkills.forEach(s => {
        skillsData[s.id] = {
          targetLevel: Math.min((s.level || 1) + 1, 5),
          action70: '',
          action20: '',
          action10: ''
        };
      });
    }
    
    setEditedSkills(skillsData);
    setIsEditing(true);
  };

  // Guardar cambios en el plan (Borrador o Pendiente)
  const handleSavePlan = (submitForApproval = false) => {
    const formattedSkills = Object.entries(editedSkills).map(([skillId, fields]) => {
      const origSkill = userRoleSkills.find(s => s.id === skillId) || {};
      return {
        skillId,
        skillName: origSkill.name || skillId,
        targetLevel: Number(fields.targetLevel),
        action70: fields.action70,
        action20: fields.action20,
        action10: fields.action10
      };
    });

    const newPlan = {
      employeeId: currentUser.id,
      year: selectedYear,
      status: submitForApproval ? "Pendiente" : (myPlan?.status || "Borrador"),
      managerComment: myPlan?.managerComment || "",
      skills: formattedSkills
    };

    saveDevelopmentPlan(newPlan);
    setIsEditing(false);
  };

  // Inicializar un nuevo plan en blanco para el año actual
  const handleInitializeNewPlan = () => {
    const formattedSkills = userRoleSkills.map(s => ({
      skillId: s.id,
      skillName: s.name,
      targetLevel: Math.min((s.level || 1) + 1, 5),
      action70: "",
      action20: "",
      action10: ""
    }));

    const newPlan = {
      employeeId: currentUser.id,
      year: selectedYear,
      status: "Borrador",
      managerComment: "",
      skills: formattedSkills
    };

    saveDevelopmentPlan(newPlan);
    
    // Iniciar edición automáticamente
    const skillsData = {};
    formattedSkills.forEach(s => {
      skillsData[s.skillId] = {
        targetLevel: s.targetLevel,
        action70: "",
        action20: "",
        action10: ""
      };
    });
    setEditedSkills(skillsData);
    setIsEditing(true);
  };

  // =========================================================================
  // 3. FLUJO DE APROBACIÓN DEL MÁNAGER
  // =========================================================================
  const handleReviewAction = (status) => {
    if (!selectedReportPlan) return;
    updatePlanStatus(selectedReportPlan.id, status, managerCommentText);
    setManagerCommentText('');
    setSelectedReportId(null);
  };

  // =========================================================================
  // 4. MODO RRHH - CÁLCULOS Y FILTROS
  // =========================================================================
  const filteredPlansCorporate = useMemo(() => {
    return developmentPlans.filter(p => {
      // Filtrar por año
      if (p.year !== selectedYear) return false;

      const employee = users.find(u => u.id === p.employeeId);
      if (!employee) return false;

      // Filtrar por búsqueda de nombre
      if (searchQuery && !employee.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      // Filtrar por estado
      if (statusFilter !== 'Todos' && p.status !== statusFilter) return false;

      // Filtrar por Unidad Organizativa
      if (orgFilter !== 'Todos' && employee.orgUnitId !== orgFilter) return false;

      return true;
    });
  }, [developmentPlans, selectedYear, searchQuery, statusFilter, orgFilter, users]);

  // Metricas globales para RRHH
  const rrhhMetrics = useMemo(() => {
    const plansThisYear = developmentPlans.filter(p => p.year === selectedYear);
    const approved = plansThisYear.filter(p => p.status === 'Aprobado').length;
    const pending = plansThisYear.filter(p => p.status === 'Pendiente').length;
    const drafts = plansThisYear.filter(p => p.status === 'Borrador').length;
    const revision = plansThisYear.filter(p => p.status === 'Revision').length;
    
    let totalSkillsCount = 0;
    plansThisYear.forEach(p => { totalSkillsCount += p.skills?.length || 0; });
    const avgSkills = plansThisYear.length > 0 ? (totalSkillsCount / plansThisYear.length).toFixed(1) : 0;

    return {
      total: plansThisYear.length,
      approved,
      pending,
      drafts,
      revision,
      avgSkills
    };
  }, [developmentPlans, selectedYear]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-md border border-slate-100 rounded-3xl p-5 shadow-sm">
        <div className="text-left">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="text-[#007A33]" />
            <span>Desarrollo Individual (PDI)</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">Estructura tu itinerario competencial anual bajo el marco de desarrollo y aprendizaje 70-20-10.</p>
        </div>

        {/* SELECTOR DE AÑO DE GESTIÓN */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/40 p-1.5 rounded-2xl border border-slate-200/50">
          <Calendar size={14} className="text-slate-400 ml-2" />
          <select 
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(Number(e.target.value));
              setIsEditing(false);
              setSelectedReportId(null);
            }}
            className="bg-transparent border-none text-xs font-extrabold text-slate-700 dark:text-slate-350 pr-8 pl-1 cursor-pointer py-1"
          >
            {years.map(y => (
              <option key={y} value={y}>Ciclo {y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. PESTAÑAS DE VISTA SEGÚN PERFIL */}
      <div className="flex items-center gap-2 border-b border-slate-200/60 pb-1">
        <button
          onClick={() => { setActiveTab('myPlan'); setSelectedReportId(null); }}
          className={clsx(
            "pb-3 text-xs font-black transition-all border-b-2 px-3 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider",
            activeTab === 'myPlan'
              ? "border-[#007A33] text-[#007A33] dark:text-emerald-400"
              : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300"
          )}
        >
          <User size={14} /> Mi PDI
        </button>

        {myReports.length > 0 && (
          <button
            onClick={() => { setActiveTab('teamPlans'); setSelectedReportId(null); }}
            className={clsx(
              "pb-3 text-xs font-black transition-all border-b-2 px-3 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider",
              activeTab === 'teamPlans'
                ? "border-[#007A33] text-[#007A33] dark:text-emerald-400"
                : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300"
            )}
          >
            <Users size={14} /> Revisión de Equipo
            {teamPlans.filter(p => p.status === 'Pendiente').length > 0 && (
              <span className="bg-amber-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                {teamPlans.filter(p => p.status === 'Pendiente').length}
              </span>
            )}
          </button>
        )}

        {currentUser.profile === 'RRHH' && (
          <button
            onClick={() => { setActiveTab('corporatePlans'); setSelectedReportId(null); }}
            className={clsx(
              "pb-3 text-xs font-black transition-all border-b-2 px-3 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider",
              activeTab === 'corporatePlans'
                ? "border-[#007A33] text-[#007A33] dark:text-emerald-400"
                : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300"
            )}
          >
            <SlidersHorizontal size={14} /> Consola Corporativa (RRHH)
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA: MI PLAN (EMPLEADO) */}
      {/* ========================================================================= */}
      {activeTab === 'myPlan' && (
        <div className="space-y-6">
          {/* Cabecera del plan */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 rounded-3xl p-5 border border-slate-100 text-left">
            <div>
              <h3 className="text-base font-black text-slate-800 tracking-tight">Estado de mi Desarrollo en {selectedYear}</h3>
              <p className="text-slate-450 text-[11px] mt-0.5">Define los focos de aprendizaje y comparte la propuesta con tu responsable directo.</p>
            </div>
            
            {myPlan ? (
              <div className="flex items-center gap-3">
                <span className={clsx(
                  "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border shadow-3xs",
                  myPlan.status === 'Aprobado' && "bg-emerald-50 text-emerald-700 dark:text-emerald-350 border-emerald-250",
                  myPlan.status === 'Pendiente' && "bg-amber-50 text-amber-700 dark:text-amber-350 border-amber-250 animate-pulse",
                  myPlan.status === 'Borrador' && "bg-slate-100 text-slate-700 dark:text-slate-350 border-slate-200",
                  myPlan.status === 'Revision' && "bg-rose-50 text-rose-700 dark:text-rose-350 border-rose-250"
                )}>
                  {myPlan.status === 'Aprobado' && "✓ Aprobado por Manager"}
                  {myPlan.status === 'Pendiente' && "⏱ Pendiente de Aprobación"}
                  {myPlan.status === 'Borrador' && "✎ Borrador"}
                  {myPlan.status === 'Revision' && "⚠ Requiere Modificaciones"}
                </span>

                {!isEditing && (myPlan.status === 'Borrador' || myPlan.status === 'Revision') && (
                  <button 
                    onClick={handleStartEdit}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 size={13} /> Editar Plan
                  </button>
                )}
              </div>
            ) : (
              <button 
                onClick={handleInitializeNewPlan}
                className="px-4.5 py-2 bg-[#007A33] hover:bg-[#006028] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Crear Plan {selectedYear}
              </button>
            )}
          </div>

          {/* Feedback del Manager si requiere revisión o está aprobado */}
          {myPlan && myPlan.managerComment && (
            <div className="bg-slate-50 border-l-4 border-blue-500 rounded-2xl p-4.5 text-left flex gap-3.5 items-start">
              <MessageSquare className="text-blue-500 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Comentarios de tu Responsable</span>
                <p className="text-xs font-semibold text-slate-700 italic">"{myPlan.managerComment}"</p>
              </div>
            </div>
          )}

          {/* CUERPO DEL PLAN (LECTURA O EDICIÓN) */}
          {myPlan && (
            <div>
              {isEditing ? (
                // --- VISTA DE EDICIÓN ---
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {userRoleSkills.map(skill => {
                      const fields = editedSkills[skill.id] || { targetLevel: 3, action70: '', action20: '', action10: '' };
                      return (
                        <div key={skill.id} className="bg-white rounded-3xl p-5 border border-slate-100 text-left space-y-4 shadow-sm hover:border-blue-200 transition-all">
                          
                          {/* Fila superior: Info del Skill y Objetivo */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                            <div className="space-y-0.5">
                              <h4 className="font-extrabold text-slate-800 text-sm">{skill.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{skill.category} • Nivel Actual: {skill.level} / Requerido: {skill.required}</p>
                            </div>
                            
                            {/* Selector de nivel objetivo */}
                            <div className="flex items-center gap-2 shrink-0">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Objetivo:</label>
                              <select
                                value={fields.targetLevel}
                                onChange={(e) => {
                                  setEditedSkills(prev => ({
                                    ...prev,
                                    [skill.id]: { ...fields, targetLevel: Number(e.target.value) }
                                  }));
                                }}
                                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 cursor-pointer"
                              >
                                {[1, 2, 3, 4, 5].map(n => (
                                  <option key={n} value={n}>Nivel {n}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Campos 70-20-10 */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* 70% Experiencia */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-150 uppercase tracking-widest inline-block">70% Experiencia</label>
                              <p className="text-[9px] text-slate-400">Acciones en el puesto de trabajo diario (proyectos, retos).</p>
                              <textarea
                                value={fields.action70}
                                onChange={(e) => {
                                  setEditedSkills(prev => ({
                                    ...prev,
                                    [skill.id]: { ...fields, action70: e.target.value }
                                  }));
                                }}
                                placeholder="Ej: Liderar el refactor del módulo de autenticación con el nuevo estándar..."
                                rows={3}
                                className="w-full text-xs font-medium p-3 border border-slate-200 bg-white rounded-xl focus:border-blue-500 resize-none"
                              />
                            </div>

                            {/* 20% Exposición */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-150 uppercase tracking-widest inline-block">20% Exposición</label>
                              <p className="text-[9px] text-slate-400">Aprendizaje relacional (feedback, mentoring, shadowing).</p>
                              <textarea
                                value={fields.action20}
                                onChange={(e) => {
                                  setEditedSkills(prev => ({
                                    ...prev,
                                    [skill.id]: { ...fields, action20: e.target.value }
                                  }));
                                }}
                                placeholder="Ej: Shadowing mensual con el Arquitecto de Software y revisiones cruzadas..."
                                rows={3}
                                className="w-full text-xs font-medium p-3 border border-slate-200 bg-white rounded-xl focus:border-blue-500 resize-none"
                              />
                            </div>

                            {/* 10% Educación */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-150 uppercase tracking-widest inline-block">10% Educación</label>
                              <p className="text-[9px] text-slate-400">Formación reglada, lecturas estructuradas y certificaciones.</p>
                              <textarea
                                value={fields.action10}
                                onChange={(e) => {
                                  setEditedSkills(prev => ({
                                    ...prev,
                                    [skill.id]: { ...fields, action10: e.target.value }
                                  }));
                                }}
                                placeholder="Ej: Realizar el curso oficial de NestJS y obtener la certificación en la plataforma de Cajamar..."
                                rows={3}
                                className="w-full text-xs font-medium p-3 border border-slate-200 bg-white rounded-xl focus:border-blue-500 resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Acciones de edición */}
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSavePlan(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save size={13} /> Guardar Borrador
                    </button>
                    <button
                      onClick={() => handleSavePlan(true)}
                      className="px-5 py-2 bg-[#007A33] hover:bg-[#006028] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/10 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check size={13} /> Enviar a Aprobación
                    </button>
                  </div>
                </div>
              ) : (
                // --- VISTA DE LECTURA ---
                <div className="space-y-5">
                  {myPlan.skills && myPlan.skills.length > 0 ? (
                    myPlan.skills.map(s => {
                      const origSkill = userRoleSkills.find(sk => sk.id === s.skillId) || {};
                      return (
                        <div key={s.skillId} className="bg-white rounded-3xl p-5 border border-slate-100 text-left space-y-4 shadow-3xs hover:border-slate-200 transition-all">
                          {/* Info y Nivel */}
                          <div className="flex justify-between items-center border-b border-slate-100/50 pb-2">
                            <div>
                              <h4 className="font-extrabold text-slate-800 text-sm">{s.skillName}</h4>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Nivel Actual: {origSkill.level || 0} • Objetivo: {s.targetLevel}</p>
                            </div>

                            <span className="text-[10px] font-black px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-150 rounded-lg">
                              Nivel Objetivo: {s.targetLevel}
                            </span>
                          </div>

                          {/* Acciones */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                            {/* 70% */}
                            <div className="space-y-1 bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-2xl border border-slate-100">
                              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-150 uppercase tracking-widest block w-fit mb-1.5">70% Experiencia</span>
                              <p className="text-slate-700 font-medium leading-relaxed italic">{s.action70 || <span className="text-slate-400">Sin acciones descritas</span>}</p>
                            </div>

                            {/* 20% */}
                            <div className="space-y-1 bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-2xl border border-slate-100">
                              <span className="text-[9px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-150 uppercase tracking-widest block w-fit mb-1.5">20% Exposición</span>
                              <p className="text-slate-700 font-medium leading-relaxed italic">{s.action20 || <span className="text-slate-400">Sin acciones descritas</span>}</p>
                            </div>

                            {/* 10% */}
                            <div className="space-y-1 bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-2xl border border-slate-100">
                              <span className="text-[9px] font-black text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-150 uppercase tracking-widest block w-fit mb-1.5">10% Educación</span>
                              <p className="text-slate-700 font-medium leading-relaxed italic">{s.action10 || <span className="text-slate-400">Sin acciones descritas</span>}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl text-slate-400 flex flex-col items-center gap-2">
                      <HelpCircle size={28} className="opacity-30" />
                      <p className="text-xs font-bold">No hay habilidades configuradas en este plan.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA: REVISIÓN DE EQUIPO (MÁNAGER) */}
      {/* ========================================================================= */}
      {activeTab === 'teamPlans' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LADO IZQUIERDO: LISTA DE COLABORADORES */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-5 border border-slate-100 space-y-4 text-left shadow-sm">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Mi Equipo Directivo</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Visualiza y aprueba las propuestas competenciales anuales.</p>
            </div>

            <div className="space-y-2">
              {myReports.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">No tienes colaboradores asignados directamente.</p>
              ) : (
                myReports.map(report => {
                  const plan = developmentPlans.find(p => p.employeeId === report.id && p.year === selectedYear);
                  const isSelected = selectedReportId === report.id;
                  
                  return (
                    <button
                      key={report.id}
                      onClick={() => {
                        setSelectedReportId(report.id);
                        setManagerCommentText(plan?.managerComment || '');
                      }}
                      className={clsx(
                        "w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer group",
                        isSelected 
                          ? "border-blue-500 bg-blue-50/50" 
                          : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <img src={report.avatar} alt="" className="w-8 h-8 rounded-full border object-cover" />
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">{report.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-0.5">{report.role}</p>
                        </div>
                      </div>

                      {/* Estado del plan */}
                      <span className={clsx(
                        "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0",
                        plan?.status === 'Aprobado' && "bg-emerald-50 text-emerald-700",
                        plan?.status === 'Pendiente' && "bg-amber-50 text-amber-700 animate-pulse border border-amber-200",
                        plan?.status === 'Borrador' && "bg-slate-100 text-slate-400",
                        plan?.status === 'Revision' && "bg-rose-50 text-rose-700",
                        !plan && "bg-slate-100 text-slate-350"
                      )}>
                        {plan ? (plan.status === 'Revision' ? 'Modificación' : plan.status) : 'Sin Plan'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* LADO DERECHO: DETALLE DEL PLAN SELECCIONADO Y ACCIONES */}
          <div className="lg:col-span-2">
            {selectedReportUser ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 text-left">
                {/* Cabecera del colaborador */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <img src={selectedReportUser.avatar} alt="" className="w-10 h-10 rounded-full border object-cover shadow-sm" />
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">PDI de: {selectedReportUser.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{selectedReportUser.role} • Ciclo Anual {selectedYear}</p>
                    </div>
                  </div>

                  <span className={clsx(
                    "text-[10px] font-black px-2.5 py-1 rounded-full uppercase border shadow-3xs",
                    selectedReportPlan?.status === 'Aprobado' && "bg-emerald-50 text-emerald-700 border-emerald-250",
                    selectedReportPlan?.status === 'Pendiente' && "bg-amber-50 text-amber-700 border-amber-250 animate-pulse",
                    selectedReportPlan?.status === 'Borrador' && "bg-slate-100 text-slate-400 border-slate-200",
                    selectedReportPlan?.status === 'Revision' && "bg-rose-50 text-rose-700 border-rose-250",
                    !selectedReportPlan && "bg-slate-50 text-slate-400"
                  )}>
                    {selectedReportPlan ? `Estado: ${selectedReportPlan.status}` : 'Sin plan creado'}
                  </span>
                </div>

                {/* Listado de habilidades del colaborador */}
                {selectedReportPlan ? (
                  <div className="space-y-4">
                    {selectedReportPlan.skills?.map(s => (
                      <div key={s.skillId} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                          <span className="font-extrabold text-slate-800 text-xs">{s.skillName}</span>
                          <span className="text-[9px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-150 rounded-md">
                            Objetivo: Nivel {s.targetLevel}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
                          <div>
                            <span className="text-[8px] font-black text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded uppercase block w-fit mb-1">70% Experiencia</span>
                            <p className="text-slate-600 font-medium italic">"{s.action70 || 'No descrita'}"</p>
                          </div>
                          <div>
                            <span className="text-[8px] font-black text-blue-700 bg-blue-50 px-1 py-0.2 rounded uppercase block w-fit mb-1">20% Exposición</span>
                            <p className="text-slate-600 font-medium italic">"{s.action20 || 'No descrita'}"</p>
                          </div>
                          <div>
                            <span className="text-[8px] font-black text-purple-700 bg-purple-50 px-1 py-0.2 rounded uppercase block w-fit mb-1">10% Educación</span>
                            <p className="text-slate-600 font-medium italic">"{s.action10 || 'No descrita'}"</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Formulario de Aprobación/Revisión */}
                    <div className="border-t border-slate-100 pt-4 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Comentarios del Evaluador (Feedback)</label>
                        <textarea
                          value={managerCommentText}
                          onChange={(e) => setManagerCommentText(e.target.value)}
                          placeholder="Añade feedback del plan, recomendaciones de formación o focos de interés..."
                          rows={3}
                          className="w-full text-xs font-semibold p-3 border border-slate-200 bg-slate-50/50 rounded-xl focus:border-blue-500 resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleReviewAction('Revision')}
                          className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50/50 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
                        >
                          <X size={13} /> Solicitar Cambios
                        </button>
                        <button
                          onClick={() => handleReviewAction('Aprobado')}
                          className="px-5 py-2 bg-[#007A33] hover:bg-[#006028] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1"
                        >
                          <Check size={13} /> Aprobar Plan
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <p className="text-xs text-slate-450 italic py-10 text-center">El colaborador no ha generado un plan para {selectedYear}.</p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 border border-slate-100 text-slate-400 flex flex-col items-center justify-center gap-2 h-72 shadow-sm">
                <Users size={32} className="opacity-20" />
                <h4 className="text-xs font-bold text-slate-700">Sin Selección</h4>
                <p className="text-[10px] text-slate-400 max-w-xs text-center">Selecciona un miembro de tu equipo en la barra lateral para revisar el detalle de su plan anual.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA: CONSOLA CORPORATIVA (RRHH) */}
      {/* ========================================================================= */}
      {activeTab === 'corporatePlans' && (
        <div className="space-y-6">
          
          {/* Tarjetas métricas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 text-left shadow-3xs">
              <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block">Planes Creados</span>
              <span className="text-lg font-black text-slate-800 block mt-1">{rrhhMetrics.total}</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 text-left shadow-3xs">
              <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest block">Planes Aprobados</span>
              <span className="text-lg font-black text-emerald-600 block mt-1">{rrhhMetrics.approved}</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 text-left shadow-3xs">
              <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest block">Pendientes de Firma</span>
              <span className="text-lg font-black text-amber-500 block mt-1">{rrhhMetrics.pending}</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 text-left shadow-3xs">
              <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest block">En Revisión</span>
              <span className="text-lg font-black text-rose-500 block mt-1">{rrhhMetrics.revision}</span>
            </div>
            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 text-left shadow-3xs">
              <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest block">Media Skills / Plan</span>
              <span className="text-lg font-black text-blue-600 block mt-1">{rrhhMetrics.avgSkills}</span>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col md:flex-row gap-4 items-center justify-between text-xs">
            <div className="relative w-full md:w-80 text-left">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Buscar por colaborador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* Filtro Estado */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-450 text-[10px] uppercase tracking-wider">Estado:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  <option value="Todos">Todos</option>
                  <option value="Borrador">Borrador</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Revision">Revision</option>
                </select>
              </div>

              {/* Filtro Dirección/Oficina */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-450 text-[10px] uppercase tracking-wider">Unidad:</span>
                <select
                  value={orgFilter}
                  onChange={(e) => setOrgFilter(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-xl font-bold cursor-pointer max-w-[180px]"
                >
                  <option value="Todos">Todas las Unidades</option>
                  {orgUnits.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Listado General */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 font-black text-slate-450 uppercase tracking-widest text-[9px]">Colaborador</th>
                    <th className="p-4 font-black text-slate-450 uppercase tracking-widest text-[9px]">Puesto de Trabajo</th>
                    <th className="p-4 font-black text-slate-450 uppercase tracking-widest text-[9px]">Unidad Organizativa</th>
                    <th className="p-4 font-black text-slate-450 uppercase tracking-widest text-[9px]">Focos de Skill</th>
                    <th className="p-4 font-black text-slate-450 uppercase tracking-widest text-[9px]">Estado</th>
                    <th className="p-4 font-black text-slate-450 uppercase tracking-widest text-[9px]">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlansCorporate.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-slate-400 italic">No se encontraron planes con los criterios seleccionados para el ciclo {selectedYear}.</td>
                    </tr>
                  ) : (
                    filteredPlansCorporate.map(plan => {
                      const employee = users.find(u => u.id === plan.employeeId);
                      if (!employee) return null;
                      
                      const unit = orgUnits.find(o => o.id === employee.orgUnitId);
                      const unitName = unit ? unit.name : 'N/A';

                      return (
                        <tr key={plan.id} className="border-b last:border-none hover:bg-slate-50/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={employee.avatar} alt="" className="w-7.5 h-7.5 rounded-full object-cover border" />
                              <span className="font-extrabold text-slate-800">{employee.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 font-semibold">{employee.role}</td>
                          <td className="p-4 text-slate-500 font-semibold truncate max-w-[180px]" title={unitName}>{unitName}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-150 rounded-full font-black font-mono">
                              {plan.skills?.length || 0} Skills
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={clsx(
                              "text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block",
                              plan.status === 'Aprobado' && "bg-emerald-50 text-emerald-700",
                              plan.status === 'Pendiente' && "bg-amber-50 text-amber-700 animate-pulse border border-amber-200",
                              plan.status === 'Borrador' && "bg-slate-100 text-slate-500",
                              plan.status === 'Revision' && "bg-rose-50 text-rose-700"
                            )}>
                              {plan.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => {
                                setSelectedReportId(employee.id);
                                setManagerCommentText(plan.managerComment || '');
                                setActiveTab('teamPlans');
                              }}
                              className="text-blue-600 hover:text-blue-800 font-black cursor-pointer uppercase text-[9px] tracking-wider flex items-center gap-0.5 hover:underline"
                            >
                              <span>Ver</span> <ChevronRight size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
