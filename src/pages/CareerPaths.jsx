import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockRoles } from '../data/mockData';
import { 
  Map, GitFork, Plus, HelpCircle, ArrowRight, Eye, Info, User, Award, Compass, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

// Grid layout coordinates for standard roles
const BOARD_ROLES = [
  { id: "r1", title: "Analista Programador", rowIndex: 0, colIndex: 0, level: "Junior", family: "Ingeniería de Software" },
  { id: "r-model", title: "Especialista en Modelos", rowIndex: 0, colIndex: 2, level: "Junior", family: "Metodología" },
  { id: "r2", title: "Senior Developer", rowIndex: 1, colIndex: 1, level: "Senior", family: "Ingeniería de Software" },
  { id: "r3", title: "Tech Lead", rowIndex: 2, colIndex: 0, level: "Lead", family: "Management Técnico" },
  { id: "r5", title: "Agile Coach", rowIndex: 2, colIndex: 2, level: "Lead", family: "Metodología" },
  { id: "r4", title: "Arquitecto de Software", rowIndex: 3, colIndex: 1, level: "Expert", family: "Arquitectura" },
  { id: "r-director", title: "Director de Tecnología", rowIndex: 4, colIndex: 1, level: "Director", family: "Management Técnico" }
];

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

export const CareerPaths = () => {
  const { 
    currentUser, 
    rolesData = [], 
    careerPaths = [], 
    progressionCriteria = [],
    employeeDossier
  } = useAuth();

  // El empleado siempre parte de su rol asignado (r1 para Ana G. en la demo)
  const selectedBaseRoleId = 'r1';
  const [hoveredTransition, setHoveredTransition] = useState(null); // { from, to, affinity, gaps }
  const [selectedTransitionDetail, setSelectedTransitionDetail] = useState(null); // { fromId, toId }

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

  // Unificar roles estáticos de la visualización y roles dinámicos del maestro
  const allAvailableRoles = useMemo(() => {
    const list = [...BOARD_ROLES];
    rolesData.forEach(r => {
      const existing = list.find(x => x.id === r.id);
      if (existing) {
        existing.requiredSkills = r.requiredSkills;
        existing.description = r.description;
      } else {
        let rowIndex = 0;
        if (r.level === 'Senior') rowIndex = 1;
        else if (r.level === 'Lead') rowIndex = 2;
        else if (r.level === 'Expert') rowIndex = 3;
        else if (r.level === 'Director') rowIndex = 4;

        list.push({
          id: r.id,
          title: r.title,
          rowIndex,
          colIndex: 1,
          level: r.level,
          family: r.family,
          description: r.description,
          requiredSkills: r.requiredSkills
        });
      }
    });

    const rModel = list.find(x => x.id === 'r-model');
    if (rModel && !rModel.requiredSkills) {
      rModel.requiredSkills = [
        { name: "Agile", level: 3, priority: "Crítica" },
        { name: "Comunicación", level: 4, priority: "Primaria" }
      ];
      rModel.description = "Especialista enfocado en la modelización matemática y flujos de metodologías.";
    }

    const rDirector = list.find(x => x.id === 'r-director');
    if (rDirector && !rDirector.requiredSkills) {
      rDirector.requiredSkills = [
        { name: "Liderazgo", level: 5, priority: "Crítica" },
        { name: "Comunicación", level: 5, priority: "Crítica" },
        { name: "Arquitectura Cloud", level: 4, priority: "Secundaria" }
      ];
      rDirector.description = "Responsable de la dirección estratégica y técnica del área de desarrollo.";
    }

    return list;
  }, [rolesData]);

  const selectedBaseRole = useMemo(() => {
    return allAvailableRoles.find(r => r.id === selectedBaseRoleId);
  }, [selectedBaseRoleId, allAvailableRoles]);

  const calculateAffinity = (roleA, roleB) => {
    if (!roleA || !roleB) return 0;
    if (!roleB.requiredSkills || roleB.requiredSkills.length === 0) return 100;

    let maxScore = 0;
    let overlapScore = 0;

    roleB.requiredSkills.forEach(rs => {
      const weight = rs.priority === 'Crítica' ? 3 : rs.priority === 'Primaria' ? 2 : 1;
      maxScore += rs.level * weight;

      const matchA = roleA.requiredSkills?.find(s => s.name === rs.name);
      const levelA = matchA ? matchA.level : 0;
      overlapScore += Math.min(levelA, rs.level) * weight;
    });

    return maxScore === 0 ? 0 : Math.round((overlapScore / maxScore) * 100);
  };

  const getGapDetails = (roleA, roleB) => {
    if (!roleA || !roleB || !roleB.requiredSkills) return [];
    return roleB.requiredSkills.map(rs => {
      const matchA = roleA.requiredSkills?.find(s => s.name === rs.name);
      const levelA = matchA ? matchA.level : 0;
      return {
        name: rs.name,
        required: rs.level,
        actual: levelA,
        gap: Math.max(0, rs.level - levelA)
      };
    }).filter(g => g.gap > 0);
  };

  const connections = useMemo(() => {
    const list = [];
    const path = careerPaths.find(p => p.fromRoleId === selectedBaseRoleId);
    if (!path) return [];

    const fromRole = allAvailableRoles.find(r => r.id === path.fromRoleId);
    if (!fromRole) return [];

    path.transitions.forEach(t => {
      const toRole = allAvailableRoles.find(r => r.id === t.toRoleId);
      if (!toRole) return;

      const autoAffinity = calculateAffinity(fromRole, toRole);
      const affinity = t.affinityOverride !== null && t.affinityOverride !== undefined ? t.affinityOverride : autoAffinity;

      // Geometría y coordenadas exactas para r1 y sus transiciones en el lienzo
      let x1 = 180;
      let y1 = 480;
      let x2 = 520;
      let y2 = 280;

      if (t.toRoleId === 'r2') {
        x2 = 180;
        y2 = 180;
      } else if (t.toRoleId === 'r5') {
        x2 = 520;
        y2 = 480;
      } else if (t.toRoleId === 'r3') {
        x2 = 520;
        y2 = 180;
      }

      const gaps = getGapDetails(fromRole, toRole);

      list.push({
        fromId: fromRole.id,
        fromTitle: fromRole.title,
        toId: toRole.id,
        toTitle: toRole.title,
        x1, y1, x2, y2,
        type: t.type,
        horizon: t.horizon,
        affinity,
        gaps
      });
    });
    return list;
  }, [careerPaths, allAvailableRoles, selectedBaseRoleId]);

  // Filtrar las conexiones directas que parten de mi rol para listarlas en el panel
  const directSteps = useMemo(() => {
    return connections.filter(c => c.fromId === selectedBaseRoleId);
  }, [connections, selectedBaseRoleId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto p-1 bg-transparent">
      
      {/* CABECERA GIGANTE PREMIUM */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-100/80 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#007A33] border border-emerald-100 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            Mi Desarrollo
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none flex items-center gap-2">
            <Compass className="text-[#007A33]" /> MyItineraries
          </h1>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
            Explora las rutas formales y alternativas de crecimiento diseñadas para tu rol en Cajamar. Analiza las brechas de competencias y convalidaciones para planificar tu próximo gran paso.
          </p>
        </div>
      </div>

      {/* DISEÑO PRINCIPAL EN DOS COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL IZQUIERDO: ASISTENTE PERSONAL DEL EMPLEADO */}
        <div className="space-y-6 lg:col-span-1">
          
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100/80 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="text-[#007A33]" size={18} />
              <h3 className="font-bold text-slate-800 text-base">Plan de Carrera Activo</h3>
            </div>
            
            <div className="space-y-2.5 text-left text-xs">
              <p className="text-slate-650 leading-relaxed">
                Hola **{currentUser.name}**, tu rol actual es **{currentUser.role}** en el departamento de **{currentUser.department}**. 
              </p>
              <p className="text-slate-450 leading-relaxed">
                Recursos Humanos ha trazado formalmente tu mapa de alternativas de desarrollo en la organización.
              </p>
            </div>

            {/* Alternativas Directas Listadas */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-left">
              <h4 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider flex items-center gap-1">
                <Star size={11} className="text-amber-500 fill-amber-500" /> Tus Alternativas Directas
              </h4>
              
              {directSteps.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No tienes alternativas directas definidas en el itinerario actual.</p>
              ) : (
                <div className="space-y-2">
                  {directSteps.map(step => (
                    <div 
                      key={step.toId} 
                      onClick={() => setSelectedTransitionDetail({ fromId: step.fromId, toId: step.toId })}
                      className="p-2.5 bg-slate-50 hover:bg-emerald-50/40 border border-slate-100 hover:border-emerald-100 rounded-xl transition-all cursor-pointer flex justify-between items-center group"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-xs leading-tight group-hover:text-[#007A33] transition-colors">{step.toTitle}</p>
                        <p className="text-[9px] text-slate-400 capitalize mt-0.5">{step.type} • {step.horizon === 'short' ? 'Corto plazo' : 'Medio/Largo plazo'}</p>
                      </div>
                      <span className="font-mono font-bold text-[10px] bg-slate-200/60 group-hover:bg-emerald-100 group-hover:text-[#007A33] px-2 py-0.5 rounded transition-all shrink-0">
                        {step.affinity}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2.5 text-left shadow-2xs">
              <h4 className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Leyenda de Itinerarios</h4>
              <div className="space-y-2 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-3 bg-sky-200 dark:bg-sky-500/20 border border-sky-400 dark:border-sky-400/40 rounded-sm inline-block shrink-0"></span>
                  <span>Tu Rol de Origen (Base)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-3 bg-slate-200 dark:bg-slate-700/50 border border-slate-400 dark:border-slate-500/40 rounded-sm inline-block shrink-0"></span>
                  <span>Movimiento Lateral (Rotación)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-3 bg-blue-100 dark:bg-blue-500/20 border border-blue-300 dark:border-blue-400/40 rounded-sm inline-block shrink-0"></span>
                  <span>Movimiento Vertical (Promoción)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-3 bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-300 dark:border-indigo-400/40 rounded-sm inline-block shrink-0"></span>
                  <span>Movimiento Diagonal (Cross-Functional)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/myskills"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:underline"
              >
                Consultar Mi Perfil de Competencias <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* DETALLES DE TRANSICIÓN AL HACER HOVER */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100/80 min-h-40 flex flex-col justify-center">
            {hoveredTransition ? (
              <div className="space-y-3 animate-in fade-in duration-300 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Detalles del Movimiento</span>
                  <span className="font-mono font-bold text-xs bg-purple-100 text-purple-750 px-2 py-0.5 rounded-md border border-purple-200">
                    {hoveredTransition.affinity}% Match
                  </span>
                </div>
                <h4 className="font-black text-slate-800 text-sm leading-tight">
                  De {hoveredTransition.fromTitle} <br/>
                  <span className="text-slate-400 font-medium text-xs font-normal">➔</span> {hoveredTransition.toTitle}
                </h4>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-bold">Brecha de Competencias (Gaps)</p>
                  
                  {hoveredTransition.gaps.length === 0 ? (
                    <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-center font-semibold">
                      ✓ ¡Tienes todas las skills necesarias cubiertas!
                    </p>
                  ) : (
                    <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                      {hoveredTransition.gaps.map(g => (
                        <div key={g.name} className="flex justify-between items-center text-xs p-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                          <span className="font-semibold text-slate-700">{g.name}</span>
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.2 rounded-md font-semibold">
                            Falta: +{g.gap}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <HelpCircle size={32} className="opacity-20 text-slate-500" />
                <p className="max-w-xs leading-normal">
                  Pasa el ratón sobre las flechas o haz clic en los porcentajes flotantes para ver el análisis de gaps de competencias y requisitos de progreso.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: EL MAPA GRÁFICO GRID CON SVG */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/10 backdrop-blur-md rounded-3xl p-6 shadow-xs border border-slate-100/80 dark:border-slate-800/40 flex flex-col overflow-x-auto">
          
          <div className="mb-4 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-1.5">
              <Map size={18} className="text-[#007A33]" /> Mapa Interactivo de Itinerarios
            </h3>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 italic">Área: Tecnología de la Información</span>
          </div>

          {/* TABLERO COORDINADO GIGANTE (viewBox 900 x 600) */}
          <div className="relative border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden bg-slate-50/20 dark:bg-slate-950/25 shrink-0 w-[840px] h-[580px] select-none shadow-inner">
            
            {/* SVG OVERLAY PARA FLECHAS VECTORIALES */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-10" 
              viewBox="0 0 900 600"
            >
              <defs>
                <marker
                  id="arrow-vertical"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
                </marker>
                <marker
                  id="arrow-lateral"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                </marker>
                <marker
                  id="arrow-diagonal"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
                </marker>
              </defs>

              {connections.map((c) => {
                const markerId = `url(#arrow-${c.type})`;
                const strokeColor = c.type === 'vertical' ? '#3b82f6' : c.type === 'diagonal' ? '#6366f1' : '#64748b';

                let x1 = c.x1;
                let y1 = c.y1;
                let x2 = c.x2;
                let y2 = c.y2;

                if (c.type === 'vertical') {
                  y1 = c.y1 - 39;
                  y2 = c.y2 + 39;
                } else if (c.type === 'diagonal') {
                  x1 = c.x1 + 110;
                  y1 = c.y1 - 20;
                  x2 = c.x2 - 110;
                  y2 = c.y2 + 20;
                } else {
                  x1 = c.x1 + 110;
                  x2 = c.x2 - 110;
                }

                const pathD = c.type === 'vertical'
                  ? `M ${x1} ${y1} L ${x2} ${y2}`
                  : `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;

                return (
                  <g 
                    key={`${c.fromId}-${c.toId}`}
                    className="pointer-events-auto cursor-pointer group"
                    onMouseEnter={() => setHoveredTransition(c)}
                    onMouseLeave={() => setHoveredTransition(null)}
                    onClick={() => setSelectedTransitionDetail({ fromId: c.fromId, toId: c.toId })}
                  >
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="20"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={hoveredTransition?.fromId === c.fromId && hoveredTransition?.toId === c.toId ? "4" : "2"}
                      strokeDasharray={c.type === 'lateral' ? "5,5" : "none"}
                      markerEnd={markerId}
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}
            </svg>

            {/* PÍLDORAS FLOTANTES DE AFINIDAD */}
            {connections.map((c) => {
              const midX = (c.x1 + c.x2) / 2;
              const midY = (c.y1 + c.y2) / 2;

              let pillBg = 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700';
              if (c.type === 'vertical') {
                pillBg = 'bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
              } else if (c.type === 'diagonal') {
                pillBg = 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-850 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
              }
              const isHovered = hoveredTransition?.fromId === c.fromId && hoveredTransition?.toId === c.toId;

              return (
                <div
                  key={`pill-${c.fromId}-${c.toId}`}
                  onMouseEnter={() => setHoveredTransition(c)}
                  onMouseLeave={() => setHoveredTransition(null)}
                  onClick={() => setSelectedTransitionDetail({ fromId: c.fromId, toId: c.toId })}
                  className={clsx(
                    "absolute -translate-x-1/2 -translate-y-1/2 z-20 px-2 py-0.5 rounded-md border text-[9px] font-black font-mono shadow-xs transition-all cursor-pointer pointer-events-auto",
                    pillBg,
                    isHovered ? "scale-115 ring-2 ring-purple-400" : ""
                  )}
                  style={{ left: `${(midX / 900) * 100}%`, top: `${(midY / 600) * 100}%` }}
                >
                  {c.affinity}%
                </div>
              );
            })}

            {/* TARJETAS DE ROLES */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              {BOARD_ROLES.map((role) => {
                const isBase = role.id === selectedBaseRoleId;
                const isTargetOfSelected = connections.some(c => c.fromId === selectedBaseRoleId && c.toId === role.id);

                let cardBorder = "border-slate-100 dark:border-slate-750";
                let cardBg = "bg-white dark:bg-slate-900/40 dark:backdrop-blur-md";
                let titleColor = "text-slate-800 dark:text-slate-100";

                if (isBase) {
                  cardBorder = "border-emerald-500 dark:border-emerald-500/80 shadow-emerald-100/50 shadow-md ring-2 ring-emerald-100 dark:ring-emerald-900/30";
                  cardBg = "bg-emerald-50/70 dark:bg-emerald-950/40 backdrop-blur-2xs dark:backdrop-blur-md";
                  titleColor = "text-emerald-950 dark:text-emerald-300";
                } else if (isTargetOfSelected) {
                  const transition = connections.find(c => c.fromId === selectedBaseRoleId && c.toId === role.id);
                  if (transition?.type === 'vertical') {
                    cardBorder = "border-blue-300 dark:border-blue-500/80 shadow-blue-50 shadow-xs";
                    cardBg = "bg-blue-50/50 dark:bg-blue-950/40 backdrop-blur-2xs dark:backdrop-blur-md";
                    titleColor = "text-blue-950 dark:text-blue-300";
                  } else if (transition?.type === 'diagonal') {
                    cardBorder = "border-indigo-300 dark:border-indigo-500/80 shadow-indigo-50 shadow-xs";
                    cardBg = "bg-indigo-50/50 dark:bg-indigo-950/40 backdrop-blur-2xs dark:backdrop-blur-md";
                    titleColor = "text-indigo-950 dark:text-indigo-300";
                  } else {
                    cardBorder = "border-slate-350 dark:border-slate-700 shadow-xs";
                    cardBg = "bg-slate-50 dark:bg-slate-900/40 dark:backdrop-blur-md";
                    titleColor = "text-slate-900 dark:text-slate-100";
                  }
                }

                // Obtener coordenadas adaptadas al layout relativo
                let rx = (role.colIndex * 300) + 150;
                let ry = 600 - (role.rowIndex * 120 + 60);

                if (role.id === selectedBaseRoleId) {
                  rx = 180; ry = 480;
                } else if (isTargetOfSelected) {
                  const transition = connections.find(c => c.fromId === selectedBaseRoleId && c.toId === role.id);
                  if (transition.type === 'vertical') {
                    rx = 180; ry = 180;
                  } else if (transition.type === 'lateral') {
                    const lateralConns = connections.filter(c => c.fromId === selectedBaseRoleId && c.type === 'lateral');
                    const idx = lateralConns.findIndex(c => c.toId === role.id);
                    rx = 520 + Math.max(0, idx) * 260; ry = 480;
                  } else if (transition.type === 'diagonal') {
                    const diagonalConns = connections.filter(c => c.fromId === selectedBaseRoleId && c.type === 'diagonal');
                    const idx = diagonalConns.findIndex(c => c.toId === role.id);
                    rx = 520 + Math.max(0, idx) * 260; ry = 180;
                  }
                }

                // Renderizar únicamente si participa de la consulta
                if (!isBase && !isTargetOfSelected) return null;

                return (
                  <div
                    key={role.id}
                    className={clsx(
                      "absolute w-[220px] h-[78px] -translate-x-1/2 -translate-y-1/2 p-3 rounded-2xl border transition-all duration-200 flex flex-col justify-between pointer-events-auto cursor-pointer text-left hover:scale-102 hover:shadow-md",
                      cardBorder,
                      cardBg
                    )}
                    style={{ 
                      left: `${(rx / 900) * 100}%`, 
                      top: `${(ry / 600) * 100}%` 
                    }}
                    onClick={() => {
                      setSelectedTransitionDetail({ fromId: selectedBaseRoleId, toId: role.id });
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className={clsx("font-extrabold text-[11px] leading-tight line-clamp-2 pr-2", titleColor)}>
                        {role.title}
                      </h4>
                      {isBase && (
                        <span className="text-[8px] font-extrabold px-1.5 py-0.2 bg-[#007A33] text-white border border-emerald-600 rounded uppercase tracking-wider scale-90 shrink-0">
                          Mi Rol
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[9px] font-bold text-slate-450 dark:text-slate-300 capitalize bg-slate-100/60 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-700/50 px-1.5 py-0.2 rounded-md">
                        {role.family.split(' ')[0]}
                      </span>
                      <span className="text-[8px] font-extrabold text-slate-350 dark:text-slate-500 font-mono">
                        {role.id.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

      {/* MODAL DETALLADO DE CRITERIOS Y REQUISITOS DE PROGRESO */}
      {selectedTransitionDetail && (() => {
        const fromRole = allAvailableRoles.find(r => r.id === selectedTransitionDetail.fromId);
        const toRole = allAvailableRoles.find(r => r.id === selectedTransitionDetail.toId);
        if (!fromRole || !toRole) return null;

        const connection = connections.find(c => c.fromId === fromRole.id && c.toId === toRole.id) || {
          affinity: calculateAffinity(fromRole, toRole),
          gaps: getGapDetails(fromRole, toRole),
          horizon: 'short',
          type: 'vertical'
        };

        const criteriaForm = getCriteriaForDestination(toRole.id);

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
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-150 animate-in zoom-in-95 duration-200 flex flex-col p-6 space-y-5 relative">
              
              <button 
                onClick={() => setSelectedTransitionDetail(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer animate-in duration-100"
                title="Cerrar ventana"
              >
                <Plus className="rotate-45" size={20} />
              </button>

              <div className="space-y-1 pr-8 text-left">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-750 border border-purple-100 rounded-full text-[9px] font-black uppercase tracking-wider">
                  Requisitos de Carrera
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight flex items-center gap-1.5 flex-wrap">
                  <span>{fromRole.title}</span>
                  <span className="text-slate-350">➔</span>
                  <span className="text-[#007A33]">{toRole.title}</span>
                </h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Movimiento {connection.type === 'lateral' ? 'Horizontal (Rotación)' : connection.type === 'diagonal' ? 'Diagonal' : 'Vertical (Promoción)'} • Plazo: {connection.horizon === 'short' ? 'Corto Plazo' : 'Largo Plazo'} • Afinidad Global: <strong className="text-[#007A33]">{connection.affinity}%</strong>
                </p>
              </div>

              {/* COLUMNA UNIFICADA: VISTA DE CUMPLIMIENTO */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-extrabold text-[#007A33] uppercase tracking-widest flex items-center gap-1">
                    <Award size={12} /> Tu Estado de Cumplimiento
                  </h4>
                  <span className="text-[9px] font-extrabold text-[#007A33] bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded-md">Expediente Al Día</span>
                </div>

                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                  
                  {/* Roles Previos Requeridos o Recomendados */}
                  {criteriaForm.enablePreviousRoles && criteriaForm.previousRoles?.map(prev => {
                    const matchingRole = allAvailableRoles.find(r => r.id === prev.roleId);
                    const title = matchingRole ? matchingRole.title : prev.roleId;
                    
                    // Comprobar cumplimiento contra el dossier de Ana
                    const isCurrent = prev.roleId === selectedBaseRoleId;
                    const actualYears = isCurrent ? employeeDossier.yearsInRole : 0;
                    const satisfies = actualYears >= prev.minYears;
                    const isRequired = prev.type === 'required';

                    return (
                      <div key={prev.roleId} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {satisfies ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">✓</span>
                          ) : isRequired ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-xs font-black">✗</span>
                          ) : (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-black">⚠️</span>
                          )}
                        </div>
                        <div className="text-xs min-w-0 text-left">
                          <p className="font-bold text-slate-700 leading-tight">
                            Rol previo {isRequired ? 'Requerido' : 'Recomendado'}: <span className="font-extrabold text-slate-800">{title}</span>
                          </p>
                          <p className="text-[10px] text-slate-450 mt-0.5">
                            Tienes: <strong>{actualYears} años</strong> vs Exigido: <strong>{prev.minYears} años</strong>
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {criteriaForm.enablePreviousRoles && criteriaForm.previousRoles?.length === 0 && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs text-slate-400">
                      ℹ No se exigen roles previos obligatorios o recomendados para esta transición.
                    </div>
                  )}

                  {/* 2. Antigüedad en la Entidad */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {!criteriaForm.enableMinYearsInEntity ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-[10px] font-black">✓</span>
                      ) : satisfiesEntityYears ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">✓</span>
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-black">⚠️</span>
                      )}
                    </div>
                    <div className="text-xs min-w-0 text-left">
                      <p className="font-bold text-slate-700 leading-tight">Antigüedad en Cajamar</p>
                      {!criteriaForm.enableMinYearsInEntity ? (
                        <p className="text-[10px] text-slate-400 mt-0.5">Criterio no exigido para esta transición.</p>
                      ) : (
                        <p className="text-[10px] text-slate-450 mt-0.5">
                          Tienes: <strong>{employeeDossier.yearsInEntity} años</strong> vs Requerido: <strong>{criteriaForm.minYearsInEntity} años</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 3. Años de Experiencia Total */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {!criteriaForm.enableMinYearsExperience ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-[10px] font-black">✓</span>
                      ) : satisfiesExpYears ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">✓</span>
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-black">⚠️</span>
                      )}
                    </div>
                    <div className="text-xs min-w-0 text-left">
                      <p className="font-bold text-slate-700 leading-tight">Años de Experiencia Total</p>
                      {!criteriaForm.enableMinYearsExperience ? (
                        <p className="text-[10px] text-slate-400 mt-0.5">Criterio no exigido para esta transición.</p>
                      ) : (
                        <p className="text-[10px] text-slate-450 mt-0.5">
                          Tienes: <strong>{employeeDossier.totalExperienceYears} años</strong> vs Requerido: <strong>{criteriaForm.minYearsExperience} años</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4. Condiciones de Desempeño */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {!criteriaForm.enablePerformance ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-[10px] font-black">✓</span>
                      ) : satisfiesPerformance ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">✓</span>
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-black">⚠️</span>
                      )}
                    </div>
                    <div className="text-xs min-w-0 text-left">
                      <p className="font-bold text-slate-700 leading-tight">Historial de Desempeño</p>
                      {!criteriaForm.enablePerformance ? (
                        <p className="text-[10px] text-slate-400 mt-0.5">Criterio no exigido para esta transición.</p>
                      ) : (
                        <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">
                          Mínimo: <strong>{criteriaForm.reqPerformanceLevel}</strong> por <strong>{criteriaForm.reqPerformanceYears} años</strong>. <br/>
                          Tu dossier: {employeeDossier.performanceHistory.map(h => `${h.year} (${h.rating})`).join(', ')}.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 5. Valoración de Potencial */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {!criteriaForm.enablePotential ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-[10px] font-black">✓</span>
                      ) : satisfiesPotential ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">✓</span>
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-xs font-black">✗</span>
                      )}
                    </div>
                    <div className="text-xs min-w-0 text-left">
                      <p className="font-bold text-slate-700 leading-tight">Valoración de Potencial</p>
                      {!criteriaForm.enablePotential ? (
                        <p className="text-[10px] text-slate-400 mt-0.5">Criterio no exigido para esta transición.</p>
                      ) : (
                        <p className="text-[10px] text-slate-450 mt-0.5">
                          Tienes: <strong>{employeeDossier.potentialAssessment}</strong> vs Requerido: <strong>{criteriaForm.reqPotentialLevel}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 6. Brecha de Habilidades */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-left">
                    <p className="font-bold text-slate-700 text-xs leading-tight">Brecha de Competencias</p>
                    {connection.gaps.length === 0 ? (
                      <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                        ✓ Todas las competencias requeridas están cubiertas al nivel solicitado.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-[9px] text-slate-400">Skills pendientes del rol de destino:</p>
                        <div className="flex flex-wrap gap-1">
                          {connection.gaps.map(g => (
                            <span key={g.name} className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-md font-semibold">
                              {g.name} (+{g.gap})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 7. Certificaciones de Flexibilidad de Mercado */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-left">
                    <p className="font-bold text-slate-700 text-xs leading-tight">Flexibilidad y Acreditaciones de Mercado</p>
                    
                    {!criteriaForm.enableMarketConditions || criteriaForm.acceptedMarketConditions?.length === 0 ? (
                      <p className="text-[9px] text-slate-400 italic">No se exigen o no se han definido equivalencias de mercado para flexibilizar este itinerario.</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[9px] text-slate-450 leading-relaxed font-medium">
                          Puedes acelerar la transición o convalidar brechas técnicas aportando alguna de estas certificaciones aceptadas por la entidad:
                        </p>
                        <div className="space-y-1">
                          {criteriaForm.acceptedMarketConditions.map(cond => {
                            const match = ACCREDITATIONS_CATALOG.find(a => a.id === cond);
                            const hasIt = employeeDossier.marketCertifications.includes(cond);
                            return (
                              <div key={cond} className="flex justify-between items-center text-[9px] p-1 bg-white border border-slate-100 rounded-md">
                                <span className="font-medium text-slate-650 pr-2 truncate">{match ? match.label.split(' (')[0] : cond}</span>
                                {hasIt ? (
                                  <span className="text-[8px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm border border-emerald-100 shrink-0">Posees (✓ Acreditado)</span>
                                ) : (
                                  <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-150 shrink-0">Pendiente (No aportado)</span>
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

            </div>
          </div>
        );
      })()}

    </div>
  );
};
