import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockSkillDetails } from '../data/mockData';
import { Link } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { 
  CheckCircle2, ChevronRight, ChevronLeft, ShieldAlert, FileSignature, 
  Users, Plus, Trash2, Search, Check, AlertCircle, Sparkles, Award, Play,
  RotateCcw
} from 'lucide-react';
import clsx from 'clsx';

const SCALE = [
  { value: 1, label: "Iniciado" },
  { value: 2, label: "Intermedio" },
  { value: 3, label: "Alto" },
  { value: 4, label: "Experto" }
];

export const SkillsReview = () => {
  const { 
    users = [], 
    reviewConfigs = [], 
    peerNominations = [], 
    peerReviews = [],
    rolesData = [],
    getWorkflowForSkill,
    submitPeerNomination,
    approvePeerNomination,
    submitPeerAssessment,
    setPeerNominations,
    setPeerReviews,
    currentUser: authCurrentUser,
    switchUser
  } = useAuth();

  // --- SIMULADOR DE ROLES INTERACTIVO ---
  // Permite simular los roles necesarios para experimentar la funcionalidad de extremo a extremo
  const [simulationMode, setSimulationMode] = useState('Employee'); // 'Employee', 'Manager', 'Peer'

  // El usuario que está operando en la pantalla
  const currentUser = useMemo(() => {
    if (simulationMode === 'Employee') return users.find(u => u.id === 1) || users[0];
    if (simulationMode === 'Manager') return users.find(u => u.id === 2) || users[1];
    return users.find(u => u.id === 5) || users[4]; // Javier Ruiz (Colega)
  }, [simulationMode, users]);

  // Sincronizar bi-direccionalmente con el perfil global del Header
  useEffect(() => {
    if (authCurrentUser) {
      if (authCurrentUser.profile === 'Manager' && simulationMode !== 'Manager') {
        setSimulationMode('Manager');
      } else if (authCurrentUser.profile === 'Employee' && simulationMode === 'Manager') {
        setSimulationMode('Employee');
      }
    }
  }, [authCurrentUser]);

  // Habilidades evaluadas (se evalúan las de Ana García, ID 1)
  const evaluatedUser = useMemo(() => users.find(u => u.id === 1) || users[0], [users]);
  const skillsToEvaluate = evaluatedUser.skills || [];

  const isGlobalSkill = (skill) => {
    return skill.category === 'Soft Skill' || 
           skill.category === 'Metodología' ||
           ['Comunicación', 'Liderazgo', 'Agile', 'Gestión de Talento'].includes(skill.name);
  };

  const { roleSkills, globalSkills } = useMemo(() => {
    const role = [];
    const global = [];
    skillsToEvaluate.forEach(s => {
      if (isGlobalSkill(s)) {
        global.push(s);
      } else {
        role.push(s);
      }
    });
    return { roleSkills: role, globalSkills: global };
  }, [skillsToEvaluate]);

  // 1. Resolver Campaña Activa basada en targeting
  const activeCampaign = useMemo(() => {
    const todayStr = "2026-05-15"; // Fecha de la demo
    return reviewConfigs.find(c => {
      // 1. Verificar Fechas
      if (c.startDate && c.endDate) {
        if (todayStr < c.startDate || todayStr > c.endDate) return false;
      }
      // 2. Verificar Segmentación de la Campaña
      if (c.targeting) {
        const userRoleDetails = rolesData.find(ro => ro.title === evaluatedUser.role);
        
        const matchRoleFamily = !c.targeting.roleFamily || c.targeting.roleFamily === 'Todas' || 
          (userRoleDetails && userRoleDetails.family === c.targeting.roleFamily);
        
        const matchRoleLevel = !c.targeting.roleLevel || c.targeting.roleLevel === 'Todas' || 
          (evaluatedUser.level && evaluatedUser.level === c.targeting.roleLevel);

        const matchSkillFamily = !c.targeting.skillFamily || c.targeting.skillFamily === 'Todas' || 
          (evaluatedUser.skills && evaluatedUser.skills.some(skill => {
            let skillFamily = skill.family;
            if (!skillFamily) {
              const name = skill.name;
              if (name === "Agile") skillFamily = "Metodología";
              else if (name === "Comunicación" || name === "Liderazgo") skillFamily = "Habilidades Blandas";
              else if (name === "Gestión de Talento") skillFamily = "Negocio";
              else skillFamily = "Tecnología";
            }
            return skillFamily === c.targeting.skillFamily;
          }));

        return matchRoleFamily && matchRoleLevel && matchSkillFamily;
      }
      return true;
    });
  }, [reviewConfigs, evaluatedUser, rolesData]);

  // 2. Determinar si requiere Nominación de Colegas
  const needsPeerNomination = useMemo(() => {
    return skillsToEvaluate.some(skill => {
      const config = getWorkflowForSkill(evaluatedUser, skill);
      return config.workflowType === 'self_manager_peers';
    });
  }, [skillsToEvaluate, evaluatedUser, getWorkflowForSkill]);

  const [step, setStep] = useState(1);
  const [autoEval, setAutoEval] = useState({ s1: 4, s2: 2, s3: 3, s7: 2, s8: 3 });
  const [managerEval, setManagerEval] = useState({ s1: 3, s2: 3, s3: 2, s7: 3, s8: 3 });
  const [calibratedEval, setCalibratedEval] = useState({});
  const [selectedPeers, setSelectedPeers] = useState([]);
  const [peerSearchQuery, setPeerSearchQuery] = useState('');
  const [potentialEval, setPotentialEval] = useState({
    level: 'Medio', // 'Bajo', 'Medio', 'Alto'
    comments: 'Ana ha demostrado una curva de aprendizaje excepcional en React y ha tomado iniciativa en las ceremonias ágiles. Muestra fuerte potencial para asumir responsabilidades de Tech Lead en el próximo año.',
    nextProposedRole: 'Tech Lead / Referente Técnico'
  });

  const [autoEvalComments, setAutoEvalComments] = useState({
    s1: 'He liderado la arquitectura frontend del proyecto principal en React, aplicando hooks complejos y optimizaciones.',
    s2: 'He trabajado en APIs básicas de Node y Express, pero aspiro a aprender NestJS este año.',
    s3: 'Participo activamente en dailies, sprint planning y retrospectivas como Scrum Master de respaldo.',
    s7: 'Consultas básicas y agregaciones en SQL. Falta experiencia en optimización de índices.',
    s8: 'Presentaciones claras y fluidas a stakeholders y equipo de negocio.'
  });

  const [managerEvalComments, setManagerEvalComments] = useState({
    s1: 'Ana demuestra un dominio excelente de React en el día a día. Es referente técnica del equipo en la parte cliente.',
    s2: 'Buen entendimiento del flujo backend, aunque debe profundizar en patrones de microservicios y escalado.',
    s3: 'Excelente actitud ágil, fomenta el feedback continuo en el equipo.',
    s7: 'SQL sólido a nivel de desarrollo, pero requiere apoyo en consultas de alta concurrencia.',
    s8: 'Excelente capacidad de comunicación, muy clara y asertiva.'
  });

  const [peerRatingsComments, setPeerRatingsComments] = useState({
    s1: 'Ana siempre ayuda al equipo con dudas complejas sobre React. Es súper generosa con su conocimiento.',
    s2: 'Ha aportado mucho en el desarrollo de nuestras APIs de Node de este trimestre.',
    s3: 'Su actitud en las ceremonias ágiles es de 10.',
    s7: 'SQL muy útil para resolver tareas del día a día.',
    s8: 'Muy agradable trabajar con ella, la comunicación es fácil y transparente.'
  });

  const [expandedCommentsSkillId, setExpandedCommentsSkillId] = useState(null);

  // Helper para renderizar tarjeta de skill en Autoevaluación o Evaluación Manager
  const renderSkillCard = (skill, mode = 'auto') => {
    const details = mockSkillDetails[skill.name] || {};
    const isAuto = mode === 'auto';
    const evalObj = isAuto ? autoEval : managerEval;
    const setEvalObj = isAuto ? setAutoEval : setManagerEval;
    const commentsObj = isAuto ? autoEvalComments : managerEvalComments;
    const setCommentsObj = isAuto ? setAutoEvalComments : setManagerEvalComments;
    const borderActiveColor = isAuto ? 'border-[#007A33] bg-emerald-50 text-[#007A33]' : 'border-blue-500 bg-blue-50 text-blue-700';
    const activeTextClass = isAuto ? 'text-emerald-700 font-semibold' : 'text-blue-700 font-semibold';
    
    return (
      <div key={skill.id} className={clsx(
        "p-5 rounded-2xl border transition-colors bg-slate-50/50",
        isAuto ? "border-slate-100 hover:border-emerald-200" : "border-slate-100 hover:border-blue-200"
      )}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
          <div>
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              {skill.name}
              <span className={clsx(
                "text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border",
                isGlobalSkill(skill) ? "bg-sky-50 text-sky-700 border-sky-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
              )}>
                {isGlobalSkill(skill) ? 'Global' : 'Rol'}
              </span>
            </h4>
            {details.description && (
              <p className="text-xs text-slate-500 mt-1">{details.description}</p>
            )}
          </div>
          {!isAuto && (
            <div className="text-[10px] font-extrabold bg-emerald-50 text-[#007A33] px-3 py-1.5 rounded-full shrink-0 h-fit border border-emerald-100">
              Autoevaluación: Nivel {autoEval[skill.id]} ({SCALE.find(x => x.value === autoEval[skill.id])?.label})
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {SCALE.map(s => (
            <label 
              key={s.value} 
              className={clsx(
                "flex flex-col items-center justify-start p-3.5 rounded-xl border-2 cursor-pointer transition-all text-center h-full",
                evalObj[skill.id] === s.value 
                  ? borderActiveColor + " shadow-sm scale-102" 
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              )}
            >
              <input 
                type="radio" 
                name={`${mode}_${skill.id}`} 
                value={s.value} 
                className="sr-only"
                onChange={() => setEvalObj(prev => ({ ...prev, [skill.id]: s.value }))}
                checked={evalObj[skill.id] === s.value}
              />
              <span className="text-lg font-black mb-0.5">{s.value}</span>
              <span className="text-[11px] font-extrabold mb-2">{s.label}</span>
              {details.levels && details.levels[s.value] && (
                <span className={clsx(
                  "text-[9px] leading-snug mt-auto pt-2 border-t border-slate-100 w-full", 
                  evalObj[skill.id] === s.value ? activeTextClass : "text-slate-400"
                )}>
                  {details.levels[s.value].slice(0, 70)}...
                </span>
              )}
            </label>
          ))}
        </div>

        {/* Campo de Comentarios Opcionales */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
            💬 Comentarios / Evidencias y Justificación (Opcional)
          </label>
          <textarea
            rows={2}
            value={commentsObj[skill.id] || ''}
            onChange={(e) => setCommentsObj(prev => ({ ...prev, [skill.id]: e.target.value }))}
            placeholder={isAuto ? "Añade una auto-justificación o evidencia sobre tu nivel..." : "Añade comentarios o feedback de mánager sobre esta competencia..."}
            className={clsx(
              "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1",
              isAuto ? "focus:border-[#007A33] focus:ring-[#007A33]" : "focus:border-blue-500 focus:ring-blue-500"
            )}
          />
        </div>
      </div>
    );
  };

  // Helper para el formulario del Peer
  const renderPeerSkillFormCard = (skill) => {
    const details = mockSkillDetails[skill.name] || {};
    return (
      <div key={skill.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs text-slate-800">{skill.name}</h4>
          <span className={clsx(
            "text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border",
            isGlobalSkill(skill) ? "bg-sky-50 text-sky-700 border-sky-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
          )}>
            {isGlobalSkill(skill) ? 'Global' : 'Rol'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">{details.description}</p>
        
        <div className="grid grid-cols-4 gap-2 pt-1.5">
          {SCALE.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setPeerRatingsForm(prev => ({ ...prev, [skill.id]: s.value }))}
              className={clsx(
                "py-2 px-3 border rounded-xl font-bold text-xs transition-all cursor-pointer flex flex-col items-center",
                peerRatingsForm[skill.id] === s.value 
                  ? "bg-amber-500 border-amber-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-650 hover:bg-amber-50/40 hover:border-amber-300"
              )}
            >
              <span className="text-sm font-black">{s.value}</span>
              <span className="text-[8px] uppercase tracking-wider font-bold mt-0.5">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Campo de Comentarios Opcionales para el Colega */}
        <div className="mt-3 space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
            💬 Comentarios / Ejemplos (Opcional)
          </label>
          <textarea
            rows={2}
            value={peerRatingsComments[skill.id] || ''}
            onChange={(e) => setPeerRatingsComments(prev => ({ ...prev, [skill.id]: e.target.value }))}
            placeholder="Añade ejemplos o feedback sobre el desempeño de Ana..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>
    );
  };

  // Helper para las filas de Calibración
  const renderCalibrationRow = (skill) => {
    const config = getWorkflowForSkill(evaluatedUser, skill);
    const peerAvg = getPeerAverageForSkill(skill.id);
    
    let rrhhProposal = managerEval[skill.id] || 0;
    if (config.workflowType === 'self_manager_peers' && peerAvg > 0) {
      const mW = config.managerWeight !== undefined ? config.managerWeight : 70;
      const pW = config.peerWeight !== undefined ? config.peerWeight : 30;
      rrhhProposal = parseFloat(((mW * (managerEval[skill.id] || 0) + pW * peerAvg) / 100).toFixed(1));
    }

    return (
      <tr key={skill.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
        <td className="p-3 font-bold text-slate-800">
          <p>{skill.name}</p>
          <span className="text-[8px] text-slate-400 font-extrabold uppercase">{skill.category}</span>
          <div className="mt-1">
            <button 
              type="button"
              onClick={() => setExpandedCommentsSkillId(expandedCommentsSkillId === skill.id ? null : skill.id)}
              className={clsx(
                "inline-flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded-md border transition-all cursor-pointer",
                expandedCommentsSkillId === skill.id 
                  ? "bg-purple-50 text-purple-700 border-purple-200" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-purple-300 hover:text-purple-600"
              )}
            >
              <span>💬 {expandedCommentsSkillId === skill.id ? 'Ocultar' : 'Ver Justificaciones'}</span>
            </button>
          </div>
        </td>
        <td className="p-3 text-center">
          <span className="inline-flex w-7 h-7 rounded-full bg-emerald-100 text-[#007A33] items-center justify-center font-black">
            {autoEval[skill.id] || '-'}
          </span>
        </td>
        <td className="p-3 text-center">
          <span className="inline-flex w-7 h-7 rounded-full bg-blue-100 text-blue-700 items-center justify-center font-black">
            {managerEval[skill.id] || '-'}
          </span>
        </td>
        <td className="p-3 text-center">
          {peerAvg > 0 ? (
            <div className="flex flex-col items-center">
              <span className="inline-flex w-7 h-7 rounded-full bg-amber-100 text-amber-700 items-center justify-center font-black">
                {peerAvg}
              </span>
              <span className="text-[7px] text-slate-400 font-bold tracking-tight mt-0.5">{activePeerReviews.length} eval</span>
            </div>
          ) : (
            <span className="text-slate-400 italic text-[10px]">Sin respuestas</span>
          )}
        </td>
        <td className="p-3 text-center bg-emerald-50/20 font-black text-sm text-[#007A33]">
          {rrhhProposal}
        </td>
        <td className="p-3">
          <div className="flex gap-1.5 justify-center">
            {SCALE.map(s => (
              <button
                key={s.value}
                onClick={() => setCalibratedEval(prev => ({ ...prev, [skill.id]: s.value }))}
                className={clsx(
                  "w-8 h-8 rounded-lg border font-bold transition-all text-xs cursor-pointer",
                  calibratedEval[skill.id] === s.value 
                    ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/30 scale-105" 
                    : "bg-white border-slate-200 text-slate-650 hover:border-purple-300 hover:bg-purple-50"
                )}
              >
                {s.value}
              </button>
            ))}
          </div>
        </td>
      </tr>
    );
  };

  // Helper para renderizar la fila de comentarios en Calibración
  const renderCalibrationCommentsRow = (skill) => {
    if (expandedCommentsSkillId !== skill.id) return null;
    return (
      <tr className="bg-purple-50/10">
        <td colSpan={6} className="p-4 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Auto-eval comment */}
            <div className="p-3 bg-white border border-slate-150 rounded-2xl space-y-1">
              <p className="text-[9px] font-extrabold text-[#007A33] uppercase tracking-wider flex items-center gap-1">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Empleado (Ana García)
              </p>
              <p className="text-slate-650 italic leading-relaxed pl-2.5">
                {autoEvalComments[skill.id] ? `"${autoEvalComments[skill.id]}"` : 'Sin justificación.'}
              </p>
            </div>

            {/* Manager comment */}
            <div className="p-3 bg-white border border-slate-150 rounded-2xl space-y-1">
              <p className="text-[9px] font-extrabold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
                Mánager (Carlos Martínez)
              </p>
              <p className="text-slate-655 italic leading-relaxed pl-2.5">
                {managerEvalComments[skill.id] ? `"${managerEvalComments[skill.id]}"` : 'Sin comentarios.'}
              </p>
            </div>

            {/* Peer comment */}
            <div className="p-3 bg-white border border-slate-150 rounded-2xl space-y-1">
              <p className="text-[9px] font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                Colegas (Promedio / Feedback)
              </p>
              <p className="text-slate-655 italic leading-relaxed pl-2.5">
                {peerRatingsComments[skill.id] ? `"${peerRatingsComments[skill.id]}"` : 'Sin comentarios de colegas.'}
              </p>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // Helper para las tarjetas de resultados consolidados finales
  const renderFinalResultCard = (s) => {
    const finalScore = calibratedEval[s.id] || 3;
    const reqScore = s.required || 3;
    return (
      <div key={s.id} className="p-3.5 bg-white border border-slate-100 rounded-2xl shadow-3xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">{s.name}</p>
            <p className="text-[9px] text-slate-400 font-semibold uppercase">{s.category}</p>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-sm font-black text-purple-700">{finalScore}</span>
              <span className="text-[10px] text-slate-400">/ {reqScore} req</span>
            </div>
            <span className={clsx(
              "text-[8px] font-extrabold px-1.5 py-0.5 rounded-full",
              finalScore >= reqScore ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            )}>
              {finalScore >= reqScore ? 'Habilidad Cubierta' : `Brecha: -${reqScore - finalScore}`}
            </span>
          </div>
        </div>
        
        {/* Feedback del Mánager / Comentario */}
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-[10px] text-left">
          <p className="font-extrabold text-slate-500 uppercase tracking-wider">💬 Feedback Calibrado / Mánager:</p>
          <p className="text-slate-600 italic">"{managerEvalComments[s.id] || 'Sin comentarios adicionales.'}"</p>
        </div>
      </div>
    );
  };

  // Búsqueda de colegas para nominación (limpiados y movidos a PeerNomination.jsx)

  // Reiniciar flujo de simulación 360
  const handleResetProcess = () => {
    setPeerNominations(prev => prev.map(n => n.employeeId === 1 ? { ...n, nominatedPeers: [], status: 'Draft' } : n));
    setPeerReviews(prev => prev.filter(r => r.nominationId !== 'nom-1'));
    setStep(1);
    setSelectedPeers([]);
    setPeerReviewSubmitted(false);
    setSimulationMode('Employee');
    setPotentialEval({
      level: 'Medio',
      comments: 'Ana ha demostrado una curva de aprendizaje excepcional en React y ha tomado iniciativa en las ceremonias ágiles. Muestra fuerte potencial para asumir responsabilidades de Tech Lead en el próximo año.',
      nextProposedRole: 'Tech Lead / Referente Técnico'
    });
    setAutoEvalComments({
      s1: 'He liderado la arquitectura frontend del proyecto principal en React, aplicando hooks complejos y optimizaciones.',
      s2: 'He trabajado en APIs básicas de Node y Express, pero aspiro a aprender NestJS este año.',
      s3: 'Participo activamente en dailies, sprint planning y retrospectivas como Scrum Master de respaldo.',
      s7: 'Consultas básicas y agregaciones en SQL. Falta experiencia en optimización de índices.',
      s8: 'Presentaciones claras y fluidas a stakeholders y equipo de negocio.'
    });
    setManagerEvalComments({
      s1: 'Ana demuestra un dominio excelente de React en el día a día. Es referente técnica del equipo en la parte cliente.',
      s2: 'Buen entendimiento del flujo backend, aunque debe profundizar en patrones de microservicios y escalado.',
      s3: 'Excelente actitud ágil, fomenta el feedback continuo en el equipo.',
      s7: 'SQL sólido a nivel de desarrollo, pero requiere apoyo en consultas de alta concurrencia.',
      s8: 'Excelente capacidad de comunicación, muy clara y asertiva.'
    });
    setPeerRatingsComments({
      s1: 'Ana siempre ayuda al equipo con dudas complejas sobre React. Es súper generosa con su conocimiento.',
      s2: 'Ha aportado mucho en el desarrollo de nuestras APIs de Node de este trimestre.',
      s3: 'Su actitud en las ceremonias ágiles es de 10.',
      s7: 'SQL muy útil para resolver tareas del día a día.',
      s8: 'Muy agradable trabajar con ella, la comunicación es fácil y transparente.'
    });
    setExpandedCommentsSkillId(null);
    alert('Simulación 360 de Ana García reiniciada con éxito. Ahora puedes volver a proponer colegas desde el principio.');
  };

  // Nominación activa para Ana García (ID 1)
  const activeNomination = useMemo(() => {
    return peerNominations.find(n => n.employeeId === 1);
  }, [peerNominations]);

  // Evaluaciones hechas por los colegas para Ana García
  const activePeerReviews = useMemo(() => {
    if (!activeNomination) return [];
    return peerReviews.filter(r => r.nominationId === activeNomination.id);
  }, [peerReviews, activeNomination]);

  // Filtrar colegas seleccionables (colegas del departamento de Tecnología que no son Ana)
  const selectablePeers = useMemo(() => {
    return users.filter(u => u.id !== 1 && u.profile === 'Employee' && u.department === 'Tecnología');
  }, [users]);

  // Resultados de búsqueda
  const filteredPeerResults = useMemo(() => {
    if (!peerSearchQuery.trim()) return [];
    return selectablePeers.filter(u => 
      u.name.toLowerCase().includes(peerSearchQuery.toLowerCase()) &&
      !selectedPeers.some(p => p.id === u.id)
    );
  }, [peerSearchQuery, selectablePeers, selectedPeers]);

  // Validaciones de pasos
  const isStep1Complete = skillsToEvaluate.every(s => autoEval[s.id]);
  const isStep2Complete = skillsToEvaluate.every(s => managerEval[s.id]);
  const isStep3Complete = skillsToEvaluate.every(s => calibratedEval[s.id]);

  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  // --- CÁLCULO DE PROMEDIOS DE COLEGAS (PEERS) ---
  const getPeerAverageForSkill = (skillId) => {
    if (activePeerReviews.length === 0) return 0;
    let sum = 0;
    let count = 0;
    activePeerReviews.forEach(rev => {
      const match = rev.skillEvaluations.find(se => se.skillId === skillId);
      if (match) {
        sum += match.level;
        count++;
      }
    });
    return count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
  };

  // --- DATOS PARA EL GRÁFICO RADAR (Paso 4) ---
  const radarData = useMemo(() => {
    return skillsToEvaluate.map(s => {
      const peerAvg = getPeerAverageForSkill(s.id);
      return {
        subject: s.name,
        Auto: autoEval[s.id] || 0,
        Manager: managerEval[s.id] || 0,
        Peer: peerAvg || 0,
        Calibrado: calibratedEval[s.id] || 0,
        fullMark: 4
      };
    });
  }, [skillsToEvaluate, autoEval, managerEval, activePeerReviews, calibratedEval]);

  // Formulario local para que el colega (Javier Ruiz) evalúe a Ana García
  const [peerRatingsForm, setPeerRatingsForm] = useState({ s1: 3, s2: 3, s3: 2, s7: 3, s8: 2 });
  const [peerReviewSubmitted, setPeerReviewSubmitted] = useState(false);

  // Sugerencias de mánager (limpiados y movidos a PeerNomination.jsx)

  // Stepper Visual
  const StepIndicator = ({ number, title, active, completed }) => (
    <div className="flex flex-col items-center relative z-10">
      <div className={clsx(
        "w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm border-2 transition-all duration-300",
        active ? "bg-[#007A33] border-emerald-150 text-white shadow-md shadow-emerald-600/20" : 
        completed ? "bg-white border-[#007A33] text-[#007A33]" : "bg-slate-50 border-slate-200 text-slate-400"
      )}>
        {completed && !active ? <CheckCircle2 size={16} /> : number}
      </div>
      <span className={clsx(
        "text-xs font-bold mt-2 whitespace-nowrap",
        active ? "text-[#007A33]" : completed ? "text-slate-800" : "text-slate-400"
      )}>
        {title}
      </span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto p-1">
      
      {/* 1. CONSOLA SUPERIOR DE SIMULACIÓN DE ROLES */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Play size={100} />
        </div>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400">Consola de Simulación Interactiva</h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Alterna el rol activo para simular y experimentar el flujo 360 completo de **Ana García**.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap relative z-10">
          <button
            onClick={handleResetProcess}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-[10px] sm:text-xs font-extrabold transition-all border border-slate-700 hover:border-slate-600 flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Reiniciar todo el flujo 360 de Ana García a estado inicial (Draft sin colegas propuestos)"
          >
            <RotateCcw size={12} className="text-slate-400" />
            <span>Reiniciar Simulación 360</span>
          </button>

          <div className="flex gap-2 bg-slate-800 p-1 rounded-2xl border border-slate-700 relative z-10 shrink-0">
            {[
              { key: 'Employee', label: 'Empleado (Ana G.)', color: 'hover:bg-emerald-600 hover:text-white', activeClass: 'bg-[#007A33] text-white shadow-md' },
              { key: 'Manager', label: 'Mánager (Carlos M.)', color: 'hover:bg-blue-600 hover:text-white', activeClass: 'bg-blue-600 text-white shadow-md' },
              { key: 'Peer', label: 'Colega / Peer (Javier R.)', color: 'hover:bg-amber-600 hover:text-white', activeClass: 'bg-amber-600 text-white shadow-md' }
            ].map(role => (
              <button
                key={role.key}
                onClick={() => {
                  setSimulationMode(role.key);
                  setPeerReviewSubmitted(false);
                  if (role.key === 'Employee') switchUser('Employee');
                  if (role.key === 'Manager') switchUser('Manager');
                }}
                className={clsx(
                  "text-[10px] sm:text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer",
                  simulationMode === role.key ? role.activeClass : `text-slate-300 ${role.color}`
                )}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. PANTALLA PRINCIPAL SEGÚN ROL SIMULADO */}

      {/* ROL: EMPLEADO (ANA GARCÍA) */}
      {simulationMode === 'Employee' && (
        <div className="space-y-6">
          
          {/* Si requiere nominación de colegas y aún no está Confirmada, bloqueamos y dirigimos al usuario a la nueva pantalla */}
          {(needsPeerNomination && (!activeNomination || activeNomination.status !== 'Confirmed')) ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm max-w-2xl mx-auto text-center space-y-6 animate-in fade-in duration-300">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Users size={28} className="stroke-[2.5]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Fase de Nominación de Peers</h2>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
                  Tu perfil cuenta con habilidades globales reguladas por el proceso **360 Completa**, lo que requiere que selecciones entre 2 y 4 evaluadores colegas.
                </p>
                <div className="pt-2">
                  <span className={clsx(
                    "text-[10px] font-extrabold px-3 py-1 rounded-full border shadow-2xs",
                    !activeNomination || activeNomination.status === 'Draft' 
                      ? "bg-slate-50 text-slate-500 border-slate-150"
                      : "bg-amber-50 text-amber-700 border-amber-150"
                  )}>
                    {!activeNomination || activeNomination.status === 'Draft' 
                      ? 'Estado: Sin proponer colegas' 
                      : 'Estado: Pendiente de aprobación del mánager'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-normal">
                Para poder iniciar tu Stepper de Autoevaluación, primero debes realizar la propuesta de evaluadores y ser visado por tu responsable.
              </p>
              <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-3">
                <Link
                  to="/peer-nomination"
                  className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#007A33] text-white rounded-xl font-bold text-sm hover:bg-[#006028] transition-all shadow-md cursor-pointer hover:scale-102"
                >
                  Ir a Nominación de Peers <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            // Workflow has been 'Confirmed', let Ana do standard 3-step evaluation
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Sparkles size={110} className="text-[#007A33]" />
                </div>
                <h1 className="text-xl md:text-2xl font-black text-slate-800">Evaluación 360</h1>
                <p className="text-slate-400 text-xs md:text-sm mt-0.5">Proceso de revisión de competencias y calibración de nivel.</p>
                
                {/* Stepper Visual */}
                <div className="mt-6 mb-1 relative z-10">
                  <div className="absolute top-[18px] left-10 right-10 h-0.5 bg-slate-100 -z-10"></div>
                  <div 
                    className="absolute top-[18px] left-10 h-0.5 bg-[#007A33] transition-all duration-500 -z-10"
                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                  ></div>
                  <div className="flex justify-between px-4">
                    <StepIndicator number={1} title="Autoevaluación" active={step === 1} completed={step > 1} />
                    <StepIndicator number={2} title="Evaluación Manager" active={step === 2} completed={step > 2} />
                    <StepIndicator number={3} title="Calibración" active={step === 3} completed={step > 3} />
                  </div>
                </div>
              </div>

              {/* Contenido del Paso */}
              <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100">
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-black text-slate-800">Autoevaluación (Ana García)</h2>
                      <span className="text-[10px] font-extrabold bg-emerald-50 text-[#007A33] px-2 py-0.5 rounded-full border border-emerald-100 uppercase">Fase Activa</span>
                    </div>
                    <p className="text-slate-500 text-xs">
                      Evalúa tu nivel actual en cada competencia usando la escala del 1 (Iniciado) al 4 (Experto).
                    </p>

                    <div className="space-y-8">
                      {/* --- SKILLS DEL ROL --- */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                            🛠️ Habilidades de Rol (Técnicas)
                          </h3>
                        </div>
                        {roleSkills.length === 0 ? (
                          <p className="text-xs text-slate-400 italic pl-1">No hay habilidades del rol asignadas.</p>
                        ) : (
                          <div className="space-y-5">
                            {roleSkills.map(skill => renderSkillCard(skill, 'auto'))}
                          </div>
                        )}
                      </div>

                      {/* --- SKILLS GLOBALES --- */}
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="flex h-2 w-2 rounded-full bg-sky-500" />
                            🌍 Habilidades Globales (Transversales)
                          </h3>
                        </div>
                        {globalSkills.length === 0 ? (
                          <p className="text-xs text-slate-400 italic pl-1">No hay habilidades globales asignadas.</p>
                        ) : (
                          <div className="space-y-5">
                            {globalSkills.map(skill => renderSkillCard(skill, 'auto'))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                      <FileSignature size={24} />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">Autoevaluación Completada</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Has completado tu autoevaluación. Para continuar con el proceso 360, tu mánager debe completar la evaluación y luego ambos procederán a la calibración final.
                    </p>
                    <p className="text-xs text-slate-400 italic">
                      💡 Pista de Simulación: Cambia el rol de simulación arriba a **Mánager (Carlos M.)** para realizar la evaluación de mánager y la calibración.
                    </p>
                  </div>
                )}

                {step === 3 && (
                  <div className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                      <Award size={24} />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">Fase de Calibración</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Esta fase la realiza tu mánager (Carlos Martínez) de forma colaborativa contigo para ajustar la calificación definitiva.
                    </p>
                    <p className="text-xs text-slate-400 italic">
                      💡 Pista de Simulación: Cambia el rol de simulación arriba a **Mánager (Carlos M.)** para acceder a la matriz de calibración y ver las notas de tus colegas en vivo.
                    </p>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between">
                  <button
                    onClick={handlePrev}
                    disabled={step === 1}
                    className={clsx(
                      "px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1 transition-all border cursor-pointer",
                      step === 1 ? "opacity-0 cursor-default" : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                    )}
                  >
                    <ChevronLeft size={16} /> Atrás
                  </button>
                  
                  {step === 1 && (
                    <button
                      onClick={handleNext}
                      disabled={!isStep1Complete}
                      className="px-5 py-2 bg-[#007A33] text-white rounded-xl font-bold text-xs hover:bg-[#006028] transition-all flex items-center gap-1 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Guardar y Continuar <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROL: MÁNAGER (CARLOS MARTÍNEZ) */}
      {simulationMode === 'Manager' && (
        <div className="space-y-6">
          
          {/* Panel de Aprobación de Peers de Ana García si está Pendiente */}
          {activeNomination && activeNomination.status === 'PendingManager' && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm max-w-2xl mx-auto text-center space-y-6 animate-in fade-in duration-300">
              <div className="w-14 h-14 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Users size={28} className="stroke-[2.5]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Nominaciones Pendientes de Validar</h2>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
                  Tu colaboradora **Ana García** ha propuesto sus evaluadores 360 y está esperando que los vises y apruebes.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-extrabold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-150 rounded-full shadow-2xs">
                    Estado: Esperando Visado de Responsable
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-normal">
                Para poder realizar su autoevaluación e iniciar la fase de calibración de manager, primero debes visar, agregar o rechazar evaluadores de su propuesta.
              </p>
              <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-3">
                <Link
                  to="/peer-nomination"
                  className="inline-flex items-center gap-1.5 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md cursor-pointer hover:scale-102"
                >
                  Ir a Visar Colegas de Ana <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* Stepper del Mánager para evaluar a Ana García */}
          {(!activeNomination || activeNomination.status === 'Confirmed') && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-2 relative overflow-hidden">
                <h1 className="text-xl md:text-2xl font-black text-slate-800">Consola de Evaluación de Manager</h1>
                <p className="text-slate-400 text-xs md:text-sm mt-0.5">Colaborador bajo evaluación: **Ana García** (Analista Programador).</p>
                
                {/* Stepper Visual */}
                <div className="mt-6 mb-1 relative z-10">
                  <div className="absolute top-[18px] left-10 right-10 h-0.5 bg-slate-100 -z-10"></div>
                  <div 
                    className="absolute top-[18px] left-10 h-0.5 bg-[#007A33] transition-all duration-500 -z-10"
                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                  ></div>
                  <div className="flex justify-between px-4">
                    <StepIndicator number={1} title="Autoevaluación" active={step === 1} completed={step > 1} />
                    <StepIndicator number={2} title="Evaluación Manager" active={step === 2} completed={step > 2} />
                    <StepIndicator number={3} title="Calibración" active={step === 3} completed={step > 3} />
                  </div>
                </div>
              </div>

              {/* Contenido del Paso */}
              <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100">
                {step === 1 && (
                  <div className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-emerald-100 text-[#007A33] rounded-full flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 size={24} />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">Autoevaluación de Ana Completada</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Ana García ya ha completado su autoevaluación. Puedes avanzar al Paso 2 para rellenar tu evaluación como responsable.
                    </p>
                    <button
                      onClick={() => setStep(2)}
                      className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-md cursor-pointer"
                    >
                      Ir a Evaluación Manager
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-black text-slate-800">Evaluación Mánager (Carlos Martínez)</h2>
                      <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 uppercase">Fase Activa</span>
                    </div>
                    <p className="text-slate-500 text-xs">
                      Evalúa las competencias de Ana García. Como referencia, se muestra su autoevaluación.
                    </p>

                    <div className="space-y-8">
                      {/* --- SKILLS DEL ROL --- */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                            🛠️ Habilidades de Rol (Técnicas)
                          </h3>
                        </div>
                        {roleSkills.length === 0 ? (
                          <p className="text-xs text-slate-400 italic pl-1">No hay habilidades del rol asignadas.</p>
                        ) : (
                          <div className="space-y-5">
                            {roleSkills.map(skill => renderSkillCard(skill, 'manager'))}
                          </div>
                        )}
                      </div>

                      {/* --- SKILLS GLOBALES --- */}
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="flex h-2 w-2 rounded-full bg-sky-500" />
                            🌍 Habilidades Globales (Transversales)
                          </h3>
                        </div>
                        {globalSkills.length === 0 ? (
                          <p className="text-xs text-slate-400 italic pl-1">No hay habilidades globales asignadas.</p>
                        ) : (
                          <div className="space-y-5">
                            {globalSkills.map(skill => renderSkillCard(skill, 'manager'))}
                          </div>
                        )}
                      </div>

                      {/* --- SECCIÓN 3: VALORACIÓN DEL POTENCIAL (EXCLUSIVO MÁNAGER) --- */}
                      <div className="mt-8 pt-6 border-t border-slate-200 space-y-5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                            <Award size={20} className="stroke-[2.5]" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider">3. Valoración del Potencial (Exclusivo Mánager)</h3>
                            <p className="text-slate-400 text-[10px]">Asigna el potencial y proyecta el plan de carrera del colaborador para el comité de calibración y 9-Box.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-purple-50/20 p-5 rounded-3xl border border-purple-100/50">
                          {/* Selector de Potencial */}
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                              Nivel de Potencial
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-col gap-2">
                              {[
                                { val: 'Bajo', label: 'Bajo (Limitado)', desc: 'Desempeña bien su rol actual, crecimiento vertical limitado.' },
                                { val: 'Medio', label: 'Medio (Crecimiento)', desc: 'Capacidad para asumir roles de mayor nivel a medio plazo (1-2 años).' },
                                { val: 'Alto', label: 'Alto (Estrella / Clave)', desc: 'Gran aprendizaje; preparado para roles críticos o alta responsabilidad.' }
                              ].map(item => (
                                <button
                                  key={item.val}
                                  type="button"
                                  onClick={() => setPotentialEval(prev => ({ ...prev, level: item.val }))}
                                  className={clsx(
                                    "p-3 rounded-2xl border text-left transition-all cursor-pointer",
                                    potentialEval.level === item.val
                                      ? "bg-purple-600 border-purple-700 text-white shadow-md shadow-purple-600/20"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                                  )}
                                >
                                  <p className="text-xs font-extrabold">{item.label}</p>
                                  <p className={clsx(
                                    "text-[9px] mt-0.5 leading-normal",
                                    potentialEval.level === item.val ? "text-purple-100" : "text-slate-400"
                                  )}>
                                    {item.desc}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Siguiente Rol Propuesto y Comentarios */}
                          <div className="md:col-span-2 space-y-4">
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-700">
                                Siguiente Rol Sugerido / Promoción
                              </label>
                              <input
                                type="text"
                                value={potentialEval.nextProposedRole}
                                onChange={(e) => setPotentialEval(prev => ({ ...prev, nextProposedRole: e.target.value }))}
                                placeholder="Ej: Tech Lead, Arquitecto de Software..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-700">
                                Comentarios de Desarrollo y Potencial
                                <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                rows={4}
                                value={potentialEval.comments}
                                onChange={(e) => setPotentialEval(prev => ({ ...prev, comments: e.target.value }))}
                                placeholder="Describe las fortalezas clave, adaptabilidad y velocidad de aprendizaje del colaborador..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-black text-slate-800 font-sans">Matriz de Calibración Final (360)</h2>
                      <span className="text-[10px] font-extrabold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-100 uppercase">Calibrando</span>
                    </div>
                    
                    <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-3xl flex items-start gap-3">
                      <Sparkles className="text-purple-600 shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-xs font-bold text-purple-950">Ponderaciones de Campaña Activas</p>
                        <p className="text-[10px] text-purple-900 leading-normal mt-0.5">
                          Para las competencias de tipo **Técnica**, la regla de RRHH asigna un **70% de peso al Mánager** y un **30% a los Colegas (Peers)**. Para **Soft Skills**, la relación es **60% / 40%**. El sistema calculará una nota propuesta consolidada automáticamente.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500">
                            <th className="p-3 w-40">Competencia</th>
                            <th className="p-3 text-center">Auto</th>
                            <th className="p-3 text-center">Mánager</th>
                            <th className="p-3 text-center">Colegas (Peers)</th>
                            <th className="p-3 text-center bg-emerald-50/40 text-[#007A33]">Propuesta RRHH</th>
                            <th className="p-3 w-56 text-center">Nivel Calibrado Final</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs">
                          {/* --- SECCIÓN: SKILLS DE ROL --- */}
                          <tr className="bg-slate-50/60 font-black text-slate-700">
                            <td colSpan={6} className="p-2.5 pl-3 border-y border-slate-200">
                              <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-800">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                🛠️ Habilidades de Rol (Puesto)
                              </span>
                            </td>
                          </tr>
                          {roleSkills.map(skill => (
                            <React.Fragment key={skill.id}>
                              {renderCalibrationRow(skill)}
                              {renderCalibrationCommentsRow(skill)}
                            </React.Fragment>
                          ))}

                          {/* --- SECCIÓN: SKILLS GLOBALES --- */}
                          <tr className="bg-slate-50/60 font-black text-slate-700">
                            <td colSpan={6} className="p-2.5 pl-3 border-y border-slate-200">
                              <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-sky-850">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-sky-500" />
                                🌍 Habilidades Globales (Transversales)
                              </span>
                            </td>
                          </tr>
                          {globalSkills.map(skill => (
                            <React.Fragment key={skill.id}>
                              {renderCalibrationRow(skill)}
                              {renderCalibrationCommentsRow(skill)}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* --- RESUMEN DE POTENCIAL EN CALIBRACIÓN --- */}
                    <div className="mt-6 p-5 bg-purple-50/30 border border-purple-100 rounded-3xl space-y-3">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-purple-705 stroke-[2.5]" />
                        <h4 className="text-xs font-black text-slate-850 uppercase tracking-wider">Valoración de Potencial Proyectada (Mánager)</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Nivel Evaluado</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={clsx(
                              "text-xs font-black px-2.5 py-0.5 rounded-full uppercase border",
                              potentialEval.level === 'Alto' ? "bg-purple-100 text-purple-700 border-purple-200" :
                              potentialEval.level === 'Medio' ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-700 border-slate-200"
                            )}>
                              {potentialEval.level}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Siguiente Rol Propuesto</p>
                          <p className="font-extrabold text-slate-850 mt-1">{potentialEval.nextProposedRole || 'Sin definir'}</p>
                        </div>

                        <div className="p-3 bg-white border border-slate-100 rounded-2xl md:col-span-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Acción 9-Box Estimada</p>
                          <p className="font-semibold text-slate-650 mt-1">
                            {potentialEval.level === 'Alto' ? '⭐ Talento Estrella / Clave' :
                             potentialEval.level === 'Medio' ? '🚀 Alto Crecimiento Profesional' : '💼 Profesional Clave (Consolidado)'}
                          </p>
                        </div>

                        <div className="p-3 bg-white border border-slate-100 rounded-2xl md:col-span-3">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Comentarios y Justificación</p>
                          <p className="text-slate-655 mt-1 italic leading-normal">"{potentialEval.comments}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between">
                  <button
                    onClick={handlePrev}
                    disabled={step === 1}
                    className={clsx(
                      "px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1 transition-all border cursor-pointer",
                      step === 1 ? "opacity-0 cursor-default" : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                    )}
                  >
                    <ChevronLeft size={16} /> Atrás
                  </button>
                  
                  {step === 2 && (
                    <button
                      onClick={handleNext}
                      disabled={!isStep2Complete}
                      className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-1 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Continuar a Calibración <ChevronRight size={16} />
                    </button>
                  )}

                  {step === 3 && (
                    <button
                      onClick={handleNext}
                      disabled={!isStep3Complete}
                      className="px-5 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <FileSignature size={15} /> Firmar y Cerrar Calibración
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROL: COLEGA / PEER (JAVIER RUIZ) */}
      {simulationMode === 'Peer' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <Users size={20} />
                </div>
                <h1 className="text-xl md:text-2xl font-black text-slate-800">Panel del Evaluador Colega (Peer Review)</h1>
              </div>
              <p className="text-slate-400 text-xs md:text-sm mt-1">
                Colaborador que solicita tu evaluación: **Ana García** (Analista Programador) · Campaña: **{activeCampaign ? activeCampaign.name : 'Campaña General'}**.
              </p>
            </div>

            {!peerReviewSubmitted ? (
              <div className="space-y-6">
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-950 leading-relaxed font-semibold">
                    **Nota sobre Confidencialidad**: Tu evaluación será sumada y promediada de forma anónima junto con las de otros colegas. Ana García **nunca verá tu puntuación individual**, sólo el promedio de todos los pares. Por favor, sé lo más honesto posible.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* --- SKILLS DEL ROL --- */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        🛠️ Habilidades de Rol (Técnicas)
                      </h3>
                    </div>
                    {roleSkills.length === 0 ? (
                      <p className="text-xs text-slate-400 italic pl-1">No hay habilidades de rol para evaluar.</p>
                    ) : (
                      <div className="space-y-4">
                        {roleSkills.map(skill => renderPeerSkillFormCard(skill))}
                      </div>
                    )}
                  </div>

                  {/* --- SKILLS GLOBALES --- */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-sky-500" />
                        🌍 Habilidades Globales (Transversales)
                      </h3>
                    </div>
                    {globalSkills.length === 0 ? (
                      <p className="text-xs text-slate-400 italic pl-1">No hay habilidades globales para evaluar.</p>
                    ) : (
                      <div className="space-y-4">
                        {globalSkills.map(skill => renderPeerSkillFormCard(skill))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      submitPeerAssessment(5, 1, peerRatingsForm);
                      setPeerReviewSubmitted(true);
                      alert('¡Muchas gracias! Tu feedback como colega sobre las competencias de Ana García ha sido registrado de forma anónima.');
                    }}
                    className="bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-amber-700 transition-all shadow-md flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={14} /> Enviar Evaluación como Colega
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-md mx-auto">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-base font-extrabold text-slate-800">Evaluación Enviada</h3>
                <p className="text-xs text-slate-500">
                  Tu feedback se ha promediado y guardado correctamente. Ya puedes volver al rol de **Empleado** o **Mánager** arriba para observar cómo ha impactado el promedio en el gráfico y la calibración.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. STEP 4: RESULTADO FINAL COMPARATIVO RADAR 360 (Firmado y Calibrado) */}
      {step === 4 && (
        <div className="space-y-6 animate-in zoom-in-98 duration-300">
          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-md text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex w-16 h-16 bg-purple-100 text-purple-700 rounded-full items-center justify-center shadow-lg shadow-purple-100">
              <FileSignature size={30} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Calibración 360 Firmada</h2>
              <p className="text-xs text-slate-500 mt-1">El proceso de evaluación de competencias de Ana García ha finalizado con éxito.</p>
            </div>
            <div className="flex justify-center gap-6 py-2 border-y border-slate-100 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Empleado</p>
                <p className="font-extrabold text-slate-700">Ana García</p>
              </div>
              <div className="border-l border-slate-200"></div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Mánager Calibrador</p>
                <p className="font-extrabold text-slate-700">Carlos Martínez</p>
              </div>
              <div className="border-l border-slate-200"></div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Ciclo Evaluado</p>
                <p className="font-extrabold text-[#007A33]">{activeCampaign ? activeCampaign.name : 'Campaña General'} ({needsPeerNomination ? '360º' : 'Auto-Mág'})</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Gráfico Radar */}
            <div className="md:col-span-2 bg-white rounded-3xl p-5 border border-slate-150 shadow-sm flex flex-col items-center">
              <h3 className="text-sm font-extrabold text-slate-800 mb-4 w-full text-center">Gráfico Comparativo de Competencias 360</h3>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0, 0, 0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                    
                    <Radar name="Auto" dataKey="Auto" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Manager" dataKey="Manager" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Media Colegas" dataKey="Peer" stroke="#d97706" fill="#d97706" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Calibrado Final" dataKey="Calibrado" stroke="#9333ea" fill="#9333ea" fillOpacity={0.35} strokeWidth={3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Listado consolidado final */}
            <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-150 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Calificaciones Consolidadas</h3>
              
              <div className="space-y-4">
                {/* --- SKILLS DE ROL --- */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest pl-1">🛠️ Skills de Rol</p>
                  {roleSkills.map(s => renderFinalResultCard(s))}
                </div>

                {/* --- SKILLS GLOBALES --- */}
                <div className="space-y-2 pt-2">
                  <p className="text-[10px] font-black text-sky-850 uppercase tracking-widest pl-1">🌍 Skills Globales</p>
                  {globalSkills.map(s => renderFinalResultCard(s))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-center">
                <button 
                  onClick={() => { 
                    setStep(1); 
                    setCalibratedEval({});
                  }}
                  className="text-[10px] font-extrabold text-slate-500 hover:text-[#007A33] transition-colors bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-xs cursor-pointer"
                >
                  Reiniciar y Volver a Calibrar
                </button>
              </div>
            </div>

          </div>

          {/* --- VALORACIÓN DEL POTENCIAL EN EL EXPEDIENTE FIRMADO --- */}
          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                <Award size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-850">Expediente de Potencial y Plan de Carrera</h3>
                <p className="text-slate-400 text-xs">Información oficial consolidada para planes de sucesión y movilidad.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Potencial Calibrado</p>
                  <p className="text-xl font-black text-purple-700 mt-1">{potentialEval.level}</p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-1">
                    {potentialEval.level === 'Alto' ? 'Crecimiento Vertical Rápido' :
                     potentialEval.level === 'Medio' ? 'Crecimiento Técnico / Rol' : 'Consolidación en Rol'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Siguiente Rol Objetivo</p>
                  <p className="text-xs font-black text-slate-800 mt-1.5">{potentialEval.nextProposedRole || 'No especificado'}</p>
                </div>
              </div>

              <div className="md:col-span-3 bg-slate-50/30 border border-slate-100 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Justificación del Comité y Mánager</h4>
                <div className="text-slate-655 text-xs italic bg-white p-4 rounded-xl border border-slate-100 leading-relaxed shadow-3xs">
                  "{potentialEval.comments}"
                </div>
                <div className="flex gap-4 text-[10px] text-slate-450 font-semibold pt-1">
                  <span>Firma Digital Mánager: ✓ CARLOS M.</span>
                  <span>Firma Digital RRHH: ✓ ELENA R.</span>
                  <span>Fecha de Cierre: 2026-05-28</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
