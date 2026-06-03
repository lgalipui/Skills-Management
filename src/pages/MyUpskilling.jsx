import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockUsers, mockCourses } from '../data/mockData';
import { 
  BookOpen, AlertCircle, Clock, ChevronRight, CheckCircle2, 
  Award, Calendar, Shield, Filter, Search, GraduationCap, 
  FileText, Undo2
} from 'lucide-react';
import clsx from 'clsx';

// Historial de formaciones realizadas (Mock)
const COMPLETED_COURSES_MOCK = [
  { id: "h1", title: "Prevención del Blanqueo de Capitales y Financiación del Terrorismo", hours: 8, credits: 4, completedDate: "2026-02-15", cause: "Obligatorias", score: "Apto" },
  { id: "h2", title: "Código de Conducta y Ética Profesional", hours: 4, credits: 2, completedDate: "2026-05-10", cause: "Obligatorias", score: "Apto" },
  { id: "h3", title: "Curso de Iniciación a Node.js y Backend", hours: 12, credits: 6, completedDate: "2025-10-14", cause: "Upskilling", score: "Notable" },
  { id: "h4", title: "Arquitectura Cloud con AWS Solutions Architect", hours: 40, credits: 20, completedDate: "2025-12-05", cause: "Para new roles", score: "Sobresaliente" },
  { id: "h5", title: "React Ninja Bootcamp - Componentes y Rendimiento", hours: 24, credits: 12, completedDate: "2026-03-01", cause: "Por plan de desarrollo", score: "Sobresaliente" },
  { id: "h6", title: "Taller Práctico de Metodologías Ágiles y Scrum", hours: 10, credits: 5, completedDate: "2026-04-18", cause: "Upskilling", score: "Aprobado" },
  { id: "h7", title: "Seguridad de la Información y Directrices OWASP", hours: 6, credits: 3, completedDate: "2025-08-20", cause: "Obligatorias", score: "Apto" }
];

// Formaciones corporativas asignadas (Mock)
const CORPORATE_TRAININGS_MOCK = [
  { id: "corp-1", title: "Curso Básico de Ciberseguridad y Phishing 2026", hours: 6, credits: 3, deadline: "2026-08-31", cause: "Obligatorias", category: "Seguridad", priority: "Alta" },
  { id: "corp-2", title: "Reglamento General de Protección de Datos (RGPD) en Banca", hours: 10, credits: 5, deadline: "2026-10-15", cause: "Obligatorias", category: "Legal", priority: "Crítica" },
  { id: "corp-3", title: "Sostenibilidad y Finanzas Verdes en Cajamar", hours: 4, credits: 2, deadline: "2026-12-15", cause: "Obligatorias", category: "RSC", priority: "Media" }
];

export const MyUpskilling = () => {
  const { currentUser, developmentPlans = [] } = useAuth();
  const isManager = currentUser.profile === 'Manager' || currentUser.profile === 'RRHH';

  // Encontrar subordinados si es Manager
  const teamMembers = mockUsers.filter(u => u.managerId === currentUser.id);
  const [selectedUser, setSelectedUser] = useState(isManager && teamMembers.length > 0 ? teamMembers[0] : currentUser);

  // Selector de pestañas: 'gaps' (Brechas/Upskilling), 'corporate' (Corporativas), 'pdi' (PDP/Plan Desarrollo), 'history' (Históricos)
  const [activeTab, setActiveTab] = useState('gaps');

  // Estados de filtros para históricos (Pestaña 4)
  const [historyCategory, setHistoryCategory] = useState('Todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Local state para aprobaciones de mánager para simular interactividad
  const [courseStatuses, setCourseStatuses] = useState(
    mockCourses.reduce((acc, course) => {
      acc[course.id] = course.status;
      return acc;
    }, {})
  );

  const toggleApproval = (courseId, currentStatus) => {
    setCourseStatuses(prev => ({
      ...prev,
      [courseId]: currentStatus === 'Pendiente' ? 'Aprobado' : 'Pendiente'
    }));
  };

  // Cambiar usuario activo basado en selector
  const activeUser = isManager ? selectedUser : currentUser;

  // Encontrar el PDI del usuario activo para 2026
  const activeUserPlan = useMemo(() => {
    return developmentPlans.find(p => p.employeeId === activeUser.id && p.year === 2026);
  }, [developmentPlans, activeUser.id]);

  // Calcular brechas
  const skillsWithGaps = useMemo(() => {
    return (activeUser.skills || [])
      .filter(s => s.required > s.level)
      .map(s => ({ ...s, gap: s.required - s.level }))
      .sort((a, b) => b.gap - a.gap); // Ordenar por brecha mayor
  }, [activeUser.skills]);

  const totalGaps = skillsWithGaps.length;
  const progressPercentage = totalGaps === 0 ? 100 : 40; 

  const getCoursesForSkill = (skillName) => {
    return mockCourses.filter(c => c.skills.includes(skillName));
  };

  // Calcular estadísticas dinámicas (Último Año, Trimestre y Mes a partir de COMPLETED_COURSES_MOCK)
  // Nota: Consideramos como fecha base el 3 de Junio de 2026 (ADDITIONAL_METADATA)
  const stats = useMemo(() => {
    const today = new Date("2026-06-03");
    let monthCount = 0;
    let quarterCount = 0;
    let yearCount = 0;
    let totalCredits = 0;

    COMPLETED_COURSES_MOCK.forEach(c => {
      const compDate = new Date(c.completedDate);
      const diffTime = today - compDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays >= 0) {
        if (diffDays <= 30) monthCount++;
        if (diffDays <= 90) quarterCount++;
        if (diffDays <= 365) {
          yearCount++;
          totalCredits += c.credits;
        }
      }
    });

    return {
      monthCount,
      quarterCount,
      yearCount,
      totalCredits
    };
  }, []);

  // Filtrar históricos (Pestaña 4)
  const filteredHistory = useMemo(() => {
    return COMPLETED_COURSES_MOCK.filter(c => {
      if (historyCategory !== 'Todos' && c.cause !== historyCategory) return false;
      if (startDate && c.completedDate < startDate) return false;
      if (endDate && c.completedDate > endDate) return false;
      return true;
    });
  }, [historyCategory, startDate, endDate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      
      {/* 1. CABECERA */}
      <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md border border-slate-100 dark:border-slate-800/40 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="text-[#007A33]" />
            <span>MyUpskilling & Capacitación</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-0.5">Explora tus brechas competenciales, formaciones corporativas y tu plan anual de desarrollo.</p>
        </div>

        {isManager && teamMembers.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-900/40 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shrink-0">
            <span className="text-[10px] font-black text-slate-450 dark:text-slate-400 pl-2 uppercase tracking-wider">Ver Plan de:</span>
            <select 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer"
              value={activeUser.id}
              onChange={(e) => setSelectedUser(mockUsers.find(u => u.id === parseInt(e.target.value)))}
            >
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. ESTADÍSTICAS SUPERIORES DE FORMACIÓN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tarjeta 1: Créditos Anuales */}
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-4.5 rounded-3xl border border-slate-100 dark:border-slate-800/40 shadow-3xs flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block">Créditos Anuales</span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100 block mt-1">
                {stats.totalCredits} <span className="text-xs font-semibold text-slate-400">/ 40 target</span>
              </span>
            </div>
            <div className="w-8.5 h-8.5 bg-emerald-50 dark:bg-emerald-950/20 text-[#007A33] rounded-xl flex items-center justify-center border border-emerald-150 dark:border-emerald-800/20">
              <Award size={16} />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#007A33] h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((stats.totalCredits / 40) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-450 dark:text-slate-400">
              <span>{Math.round((stats.totalCredits / 40) * 100)}% Completado</span>
              <span>Meta: 40 Cr</span>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Formaciones Realizadas en Periodos */}
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-4.5 rounded-3xl border border-slate-100 dark:border-slate-800/40 shadow-3xs flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block">Realizadas en Ciclos</span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100 block mt-1">{stats.yearCount}</span>
            </div>
            <div className="w-8.5 h-8.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl flex items-center justify-center border border-blue-150 dark:border-blue-800/20">
              <CheckCircle2 size={16} />
            </div>
          </div>
          
          <div className="flex justify-between text-[9px] font-black text-slate-500 border-t border-slate-100/50 dark:border-slate-800/40 pt-2">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block font-bold">Último Mes</span>
              <span className="text-slate-700 dark:text-slate-350 font-extrabold text-xs">{stats.monthCount} curso</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block font-bold">Último Trim.</span>
              <span className="text-slate-700 dark:text-slate-350 font-extrabold text-xs">{stats.quarterCount} cursos</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block font-bold">Último Año</span>
              <span className="text-slate-700 dark:text-slate-350 font-extrabold text-xs">{stats.yearCount} cursos</span>
            </div>
          </div>
        </div>

        {/* Tarjeta 3: Pendientes */}
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-4.5 rounded-3xl border border-slate-100 dark:border-slate-800/40 shadow-3xs flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block">Pendientes de Firma</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-450 block mt-1">
                {CORPORATE_TRAININGS_MOCK.length + totalGaps}
              </span>
            </div>
            <div className="w-8.5 h-8.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-xl flex items-center justify-center border border-amber-150 dark:border-amber-800/20">
              <Clock size={16} />
            </div>
          </div>
          
          <div className="text-[9px] font-bold text-slate-450 dark:text-slate-400 leading-tight">
            {CORPORATE_TRAININGS_MOCK.length} Corporativas asignadas y {totalGaps} brechas de rol por cubrir.
          </div>
        </div>

        {/* Tarjeta 4: Horas Acumuladas */}
        <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-4.5 rounded-3xl border border-slate-100 dark:border-slate-800/40 shadow-3xs flex flex-col justify-between h-[120px]">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block">Horas de Formación</span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100 block mt-1">
                {COMPLETED_COURSES_MOCK.reduce((acc, c) => acc + c.hours, 0)} <span className="text-xs font-bold text-slate-400">h</span>
              </span>
            </div>
            <div className="w-8.5 h-8.5 bg-purple-50 dark:bg-purple-950/20 text-purple-600 rounded-xl flex items-center justify-center border border-purple-150 dark:border-purple-800/20">
              <BookOpen size={16} />
            </div>
          </div>
          
          <div className="text-[9px] font-bold text-slate-450 dark:text-slate-400 leading-tight">
            Tiempo de aprendizaje acreditado en tu expediente profesional.
          </div>
        </div>
      </div>

      {/* 3. TABS SELECTOR */}
      <div className="flex items-center gap-1 border-b border-slate-200/60 dark:border-slate-800/40 pb-1">
        <button
          onClick={() => setActiveTab('gaps')}
          className={clsx(
            "pb-3 text-xs font-black transition-all border-b-2 px-3.5 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider",
            activeTab === 'gaps'
              ? "border-[#007A33] text-[#007A33] dark:text-emerald-450"
              : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-350"
          )}
        >
          <GraduationCap size={14} /> Brechas de Rol
        </button>

        <button
          onClick={() => setActiveTab('corporate')}
          className={clsx(
            "pb-3 text-xs font-black transition-all border-b-2 px-3.5 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider",
            activeTab === 'corporate'
              ? "border-[#007A33] text-[#007A33] dark:text-emerald-450"
              : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-350"
          )}
        >
          <Shield size={14} /> Formaciones Corporativas
        </button>

        <button
          onClick={() => setActiveTab('pdi')}
          className={clsx(
            "pb-3 text-xs font-black transition-all border-b-2 px-3.5 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider",
            activeTab === 'pdi'
              ? "border-[#007A33] text-[#007A33] dark:text-emerald-450"
              : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-350"
          )}
        >
          <FileText size={14} /> Plan de Desarrollo (PDI)
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={clsx(
            "pb-3 text-xs font-black transition-all border-b-2 px-3.5 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider",
            activeTab === 'history'
              ? "border-[#007A33] text-[#007A33] dark:text-emerald-450"
              : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-350"
          )}
        >
          <Calendar size={14} /> Histórico de Formaciones
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: BRECHAS DE ROL (LO QUE HABÍA ANTES) */}
      {/* ========================================================================= */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          {/* Barra de Progreso del Itinerario */}
          <div className="bg-white/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 rounded-3xl p-5 shadow-3xs">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Progreso del Itinerario de Rol</h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Formación requerida para cubrir brechas competenciales.</p>
              </div>
              <span className="text-xl font-extrabold text-[#007A33] dark:text-emerald-450">{progressPercentage}%</span>
            </div>
            
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#007A33] dark:bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {totalGaps === 0 ? (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 rounded-3xl p-10 text-center">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/20 text-[#007A33] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 mb-1">¡Excelente Perfil!</h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 max-w-sm mx-auto leading-relaxed">
                Actualmente no tienes brechas competenciales críticas. Explora el catálogo libre para seguir creciendo.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {skillsWithGaps.map(skill => {
                const priorityLevel = skill.gap >= 2 ? "Crítica" : "Normal";
                const suggestedCourses = getCoursesForSkill(skill.name);
                
                return (
                  <div key={skill.id} className="bg-white dark:bg-slate-900/40 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/40 overflow-hidden">
                    {/* Fila Cabecera de Skill */}
                    <div className={clsx(
                      "px-6 py-4 border-b flex justify-between items-center bg-gradient-to-r transition-all duration-300",
                      skill.gap >= 2 
                        ? "from-amber-500/10 via-amber-500/2 to-transparent border-amber-500/15" 
                        : "from-slate-500/5 via-slate-500/1 to-transparent border-slate-100/10"
                    )}>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-200">{skill.name}</h2>
                          <span className={clsx(
                            "text-[8px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider border",
                            skill.gap >= 2 
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                              : "bg-slate-500/10 text-slate-450 border-slate-500/20"
                          )}>
                            Prioridad {priorityLevel}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Nivel actual: <strong className="text-slate-700 dark:text-slate-300">{skill.level}</strong> → Requerido: <strong className="text-slate-700 dark:text-slate-300">{skill.required}</strong>
                        </p>
                      </div>
                      {skill.gap >= 2 && <AlertCircle className="text-amber-500 opacity-60" size={20} />}
                    </div>

                    {/* Contenido: Cursos recomendados */}
                    <div className="p-6 bg-white dark:bg-slate-900/10">
                      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                        <BookOpen size={13} /> Cursos Recomendados
                      </h3>
                      
                      {suggestedCourses.length === 0 ? (
                        <p className="text-slate-450 italic text-xs">No hay cursos disponibles para esta competencia por el momento.</p>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {suggestedCourses.map(course => (
                            <div key={course.id} className="flex border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group bg-slate-50/20 dark:bg-slate-900/5">
                              <div className="w-24 h-auto shrink-0 overflow-hidden relative">
                                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                              </div>
                              <div className="p-3.5 flex flex-col flex-1 text-left min-w-0">
                                <div className="flex justify-between items-start mb-1 gap-2">
                                  <span className="text-[9px] font-extrabold text-[#007A33] dark:text-emerald-450 bg-emerald-500/8 dark:bg-emerald-500/12 px-1.5 py-0.2 rounded border border-emerald-500/15">Objetivo: Nivel {Math.min(skill.level + 1, skill.required)}</span>
                                  <span className="flex items-center gap-0.5 text-[9px] text-slate-450 font-bold shrink-0">
                                    <Clock size={11} /> {course.duration}
                                  </span>
                                </div>
                                <h4 className="font-extrabold text-slate-800 dark:text-slate-200 leading-tight text-xs my-1 line-clamp-2">{course.title}</h4>
                                
                                <div className="mt-auto pt-2 border-t border-slate-100/60 dark:border-slate-800/40 flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className={clsx("text-xs font-black", course.cost > 0 ? "text-slate-650 dark:text-slate-350" : "text-[#007A33] dark:text-emerald-400")}>
                                      {course.cost > 0 ? `${course.cost}€` : "Gratuito"}
                                    </span>
                                    {course.cost > 0 && (
                                      <span className={clsx(
                                        "text-[8px] font-black uppercase tracking-wider mt-0.5",
                                        courseStatuses[course.id] === 'Aprobado' ? "text-[#007A33]" : "text-amber-500"
                                      )}>
                                        {courseStatuses[course.id]}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {isManager && course.cost > 0 ? (
                                    <button 
                                      onClick={() => toggleApproval(course.id, courseStatuses[course.id])}
                                      className={clsx(
                                        "text-[9px] font-black px-2.5 py-1 rounded-lg transition-all border flex items-center gap-0.5 cursor-pointer",
                                        courseStatuses[course.id] === 'Pendiente' 
                                          ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100" 
                                          : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                                      )}
                                    >
                                      {courseStatuses[course.id] === 'Pendiente' ? 'Aprobar' : <><CheckCircle2 size={11}/> Aprobado</>}
                                    </button>
                                  ) : (
                                    <button className="w-6.5 h-6.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center hover:bg-[#007A33] dark:hover:bg-emerald-650 hover:text-white transition-colors cursor-pointer">
                                      <ChevronRight size={14} />
                                    </button>
                                  )}
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
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: FORMACIONES CORPORATIVAS ASIGNADAS */}
      {/* ========================================================================= */}
      {activeTab === 'corporate' && (
        <div className="space-y-4">
          <div className="bg-white/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 rounded-3xl p-5 shadow-3xs text-left">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Formaciones Corporativas Obligatorias</h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Módulos obligatorios asignados para cumplir con normativas legales, de seguridad y ética de la entidad.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CORPORATE_TRAININGS_MOCK.map(course => (
              <div key={course.id} className="bg-white dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/40 text-left flex flex-col justify-between shadow-3xs relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className={clsx(
                      "text-[8px] font-black px-1.5 py-0.2 rounded border uppercase tracking-wider",
                      course.priority === 'Crítica' ? "bg-rose-500/10 text-rose-500 border-rose-500/25 animate-pulse" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      Prioridad {course.priority}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{course.category}</span>
                  </div>

                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm leading-snug line-clamp-2">{course.title}</h4>
                  
                  <div className="flex items-center gap-3 text-[10px] text-slate-450 dark:text-slate-400 font-semibold pt-1">
                    <span className="flex items-center gap-1"><Clock size={11} /> {course.hours} horas</span>
                    <span>•</span>
                    <span>{course.credits} créditos</span>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100/60 dark:border-slate-800/40 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold">Fecha Límite:</span>
                    <strong className="text-slate-650 dark:text-slate-350 text-[11px]">{new Date(course.deadline).toLocaleDateString()}</strong>
                  </div>
                  
                  <button className="px-3.5 py-1.5 bg-[#007A33] hover:bg-[#006028] text-white text-[10px] font-bold rounded-xl shadow-md transition-all cursor-pointer">
                    Iniciar Módulo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: FORMACIONES ASIGNADAS EN EL PLAN DE DESARROLLO (PDI) */}
      {/* ========================================================================= */}
      {activeTab === 'pdi' && (
        <div className="space-y-4">
          <div className="bg-white/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 rounded-3xl p-5 shadow-3xs text-left">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Mi Plan de Desarrollo Activo (PDP)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Acciones de formación asociadas bajo el marco de desarrollo competencial 70-20-10 para el ciclo {activeUserPlan?.year || 2026}.</p>
          </div>

          {activeUserPlan && activeUserPlan.skills && activeUserPlan.skills.length > 0 ? (
            <div className="space-y-4">
              {activeUserPlan.skills.map(s => (
                <div key={s.skillId} className="bg-white dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/40 text-left space-y-3.5 shadow-3xs">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/40 pb-2.5">
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{s.skillName}</h4>
                    <span className="text-[10px] font-black px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-150 dark:border-blue-850 rounded-lg">
                      Objetivo: Nivel {s.targetLevel}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* 70% */}
                    <div className="space-y-1 p-3 bg-slate-50/50 dark:bg-slate-950/15 rounded-2xl border border-slate-100 dark:border-slate-850">
                      <span className="text-[8px] font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.2 rounded border border-emerald-150 dark:border-emerald-850 uppercase tracking-widest block w-fit mb-1">70% Experiencia (Diario)</span>
                      <p className="text-slate-700 dark:text-slate-300 italic font-medium">"{s.action70 || 'Sin acciones descritas'}"</p>
                    </div>
                    
                    {/* 20% */}
                    <div className="space-y-1 p-3 bg-slate-50/50 dark:bg-slate-950/15 rounded-2xl border border-slate-100 dark:border-slate-850">
                      <span className="text-[8px] font-black text-blue-700 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.2 rounded border border-blue-150 dark:border-blue-850 uppercase tracking-widest block w-fit mb-1">20% Exposición (Social)</span>
                      <p className="text-slate-700 dark:text-slate-300 italic font-medium">"{s.action20 || 'Sin acciones descritas'}"</p>
                    </div>
                    
                    {/* 10% */}
                    <div className="space-y-1 p-3 bg-slate-50/50 dark:bg-slate-950/15 rounded-2xl border border-slate-100 dark:border-slate-850">
                      <span className="text-[8px] font-black text-purple-700 bg-purple-50 dark:bg-purple-950/30 px-1.5 py-0.2 rounded border border-purple-150 dark:border-purple-850 uppercase tracking-widest block w-fit mb-1">10% Educación (Cursos)</span>
                      <p className="text-slate-700 dark:text-slate-300 italic font-medium">"{s.action10 || 'Sin acciones descritas'}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 rounded-3xl text-slate-400">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No hay un Plan de Desarrollo Individual aprobado para el ciclo 2026.</p>
              <p className="text-xs text-slate-450 mt-1">Crea un plan en la sección "Planes de Desarrollo" para vincular tus objetivos competenciales.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 4: HISTÓRICO DE FORMACIONES REALIZADAS CON FILTROS */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          
          {/* Cabecera Informativa */}
          <div className="bg-white/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 rounded-3xl p-5 shadow-3xs text-left">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Histórico de Capacitación Acreditada</h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Consulta tu historial de cursos y formaciones completadas en la entidad.</p>
          </div>

          {/* Panel de Filtros Multivariable */}
          <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xs p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40 shadow-3xs flex flex-col lg:flex-row gap-4 items-center justify-between text-xs">
            <div className="flex flex-wrap items-center gap-3.5 w-full lg:w-auto">
              
              {/* Filtro Causa */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-bold text-slate-450 dark:text-slate-500 text-[10px] uppercase tracking-wider">Causa:</span>
                <select
                  value={historyCategory}
                  onChange={(e) => setHistoryCategory(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold cursor-pointer text-slate-700 dark:text-slate-350 focus:outline-none"
                >
                  <option value="Todos">Todos</option>
                  <option value="Obligatorias">Obligatorias</option>
                  <option value="Por plan de desarrollo">Por plan de desarrollo</option>
                  <option value="Upskilling">Upskilling</option>
                  <option value="Para new roles">Para new roles</option>
                </select>
              </div>

              {/* Filtro Fecha Inicio */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-bold text-slate-450 dark:text-slate-500 text-[10px] uppercase tracking-wider">Desde:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
                />
              </div>

              {/* Filtro Fecha Fin */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-bold text-slate-450 dark:text-slate-500 text-[10px] uppercase tracking-wider">Hasta:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
                />
              </div>
            </div>

            {/* Limpiar Filtros */}
            {(historyCategory !== 'Todos' || startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setHistoryCategory('Todos');
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs w-full lg:w-auto"
              >
                Limpiar Filtros
              </button>
            )}
          </div>

          {/* Tabla de Resultados del Histórico */}
          <div className="bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-850">
                    <th className="p-4 font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest text-[9px]">Curso Realizado</th>
                    <th className="p-4 font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest text-[9px] text-center">Duración</th>
                    <th className="p-4 font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest text-[9px] text-center">Créditos</th>
                    <th className="p-4 font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest text-[9px]">Fecha Acreditación</th>
                    <th className="p-4 font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest text-[9px]">Causa / Origen</th>
                    <th className="p-4 font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest text-[9px] text-center">Calificación</th>
                    <th className="p-4 font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest text-[9px]">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-400 dark:text-slate-500 italic bg-slate-50/20 dark:bg-slate-900/5">
                        No se encontraron registros de formación con los criterios seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map(course => (
                      <tr key={course.id} className="border-b last:border-none border-slate-150 dark:border-slate-850 hover:bg-slate-50/30 dark:hover:bg-slate-900/5 transition-colors">
                        <td className="p-4">
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">{course.title}</span>
                        </td>
                        <td className="p-4 text-center text-slate-600 dark:text-slate-400 font-semibold">{course.hours}h</td>
                        <td className="p-4 text-center font-mono font-bold text-slate-850 dark:text-slate-200">
                          {course.credits} Cr
                        </td>
                        <td className="p-4 text-slate-500 dark:text-slate-450 font-bold">
                          {new Date(course.completedDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className={clsx(
                            "text-[8px] font-black px-2 py-0.5 rounded-full uppercase border shadow-3xs",
                            course.cause === 'Obligatorias' && "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-150 dark:border-rose-900/30",
                            course.cause === 'Por plan de desarrollo' && "bg-purple-50 dark:bg-purple-950/20 text-purple-750 dark:text-purple-300 border-purple-150 dark:border-purple-900/30",
                            course.cause === 'Upskilling' && "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border-emerald-150 dark:border-emerald-900/30",
                            course.cause === 'Para new roles' && "bg-blue-50 dark:bg-blue-950/20 text-blue-750 dark:text-blue-300 border-blue-150 dark:border-blue-900/30"
                          )}>
                            {course.cause}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 px-2 py-0.5 rounded-md">
                            {course.score}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/30 rounded-full px-2.5 py-0.5 uppercase">
                            ✓ Realizado
                          </span>
                        </td>
                      </tr>
                    ))
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
