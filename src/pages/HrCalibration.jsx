import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockSkillDetails } from '../data/mockData';
import { HrCalibrationDashboard } from '../components/HrCalibration/HrCalibrationDashboard';
import { 
  Scale, Users, Award, AlertCircle, Sparkles, X, Check, Eye, HelpCircle, 
  Info, BarChart3, ChevronRight, FileSignature, ArrowRight
} from 'lucide-react';
import clsx from 'clsx';

const SCALE = [
  { value: 1, label: "Iniciado" },
  { value: 2, label: "Intermedio" },
  { value: 3, label: "Alto" },
  { value: 4, label: "Experto" }
];

export const HrCalibration = () => {
  const { 
    users = [], 
    reviewConfigs = [], 
    peerReviews = [],
    peerNominations = [],
    orgUnits = [],
    rolesData = [],
    roleFamilies = [],
    getWorkflowForSkill
  } = useAuth();

  // --- TABS DEL PANEL ---
  const [activePanelTab, setActivePanelTab] = useState('calibration'); // 'calibration' or 'dashboard'

  // --- FILTROS ---
  const [selectedCampaignId, setSelectedCampaignId] = useState(() => {
    // Seleccionar última campaña por defecto
    return reviewConfigs.length > 0 ? reviewConfigs[reviewConfigs.length - 1].id : '';
  });
  const [selectedOrgUnitId, setSelectedOrgUnitId] = useState('Todas');
  const [selectedRoleFamily, setSelectedRoleFamily] = useState('Todas');
  const [selectedRoleId, setSelectedRoleId] = useState('Todos');
  const [selectedManagerId, setSelectedManagerId] = useState('Todos');

  // --- ESTADO DE CALIBRACIONES DE LA SESIÓN (SIMULACIÓN DE BASE DE DATOS) ---
  // Pre-cargamos datos realistas para simular un proceso de calibración vivo e interactivo
  const [calibratedUsersData, setCalibratedUsersData] = useState({
    // Ana García
    1: {
      status: 'Calibrando',
      ratings: { s1: 3, s2: 3, s3: 2, s7: 3, s8: 3 },
      comments: {
        s1: 'Ana demuestra un dominio excelente de React en el día a día. Es referente técnica del equipo en la parte cliente.',
        s2: 'Buen entendimiento del flujo backend, aunque debe profundizar en patrones de microservicios y escalado.',
        s3: 'Excelente actitud ágil, fomenta el feedback continuo en el equipo.',
        s7: 'SQL sólido a nivel de desarrollo, pero requiere apoyo en consultas de alta concurrencia.',
        s8: 'Excelente capacidad de comunicación, muy clara y asertiva.'
      },
      potential: 'Alto',
      nextProposedRole: 'Tech Lead / Referente Técnico',
      potentialComments: 'Ana ha demostrado una curva de aprendizaje excepcional en React y ha tomado iniciativa en las ceremonias ágiles. Muestra fuerte potencial para asumir responsabilidades de Tech Lead en el próximo año.'
    },
    // Javier Ruiz
    5: {
      status: 'Finalizado',
      ratings: { s2: 4, s7: 4, s3: 3, s4: 3 },
      comments: {},
      potential: 'Medio',
      nextProposedRole: 'Tech Lead / Arquitecto',
      potentialComments: 'Desempeño técnico excepcional y gran madurez para asumir responsabilidades de liderazgo y arquitectura.'
    },
    // Laura Gómez
    4: {
      status: 'Autoevaluado',
      ratings: {},
      comments: {},
      potential: 'Bajo',
      nextProposedRole: '',
      potentialComments: ''
    },
    // David Castro
    11: {
      status: 'Calibrado',
      ratings: { s1: 4, s7: 3, s6: 3 },
      comments: {},
      potential: 'Medio',
      nextProposedRole: 'Banca Digital Lead',
      potentialComments: 'Buen perfil enfocado a negocio digital con gran capacidad de adaptación.'
    }
  });

  // --- MODALS DE DIÁLOGO ---
  const [activeCalibratingUser, setActiveCalibratingUser] = useState(null); // Usuario que se está calibrando
  const [activeViewingUser, setActiveViewingUser] = useState(null);       // Usuario del que se ve el detalle (consulta)
  const [expandedSkillCommentsId, setExpandedSkillCommentsId] = useState(null); // Skill con justificaciones desplegadas en modal

  // Formulario temporal de calibración en el modal
  const [tempCalibrationForm, setTempCalibrationForm] = useState({
    ratings: {},
    comments: {},
    potential: 'Medio',
    nextProposedRole: '',
    potentialComments: ''
  });

  // --- DETERMINAR CAMPAÑA SELECCIONADA ---
  const selectedCampaign = useMemo(() => {
    return reviewConfigs.find(c => c.id === selectedCampaignId) || reviewConfigs[0];
  }, [reviewConfigs, selectedCampaignId]);

  // --- OBTENER ROLES DISPONIBLES EN FUNCIÓN DE LA FAMILIA SELECCIONADA ---
  const filteredRolesList = useMemo(() => {
    if (selectedRoleFamily === 'Todas') return rolesData;
    return rolesData.filter(r => r.family === selectedRoleFamily);
  }, [rolesData, selectedRoleFamily]);

  // --- OBTENER LISTA DE MÁNAGERS ---
  const managersList = useMemo(() => {
    const managerIds = new Set(users.map(u => u.managerId).filter(Boolean));
    return users.filter(u => managerIds.has(u.id));
  }, [users]);

  // --- ASIGNACIÓN DE DESEMPEÑO Y POTENCIAL POR DEFECTO PARA LA 9-BOX ---
  // Mapa de posicionamientos base de los empleados para la demo de 9-box
  const baseTalentMapping = useMemo(() => {
    return {
      1: { performance: 'Medio', potential: 'Alto' },   // Ana García
      2: { performance: 'Alto', potential: 'Alto' },    // Carlos Martínez (Mánager)
      3: { performance: 'Alto', potential: 'Medio' },   // Elena Rodríguez (RRHH)
      4: { performance: 'Bajo', potential: 'Bajo' },    // Laura Gómez
      5: { performance: 'Alto', potential: 'Medio' },   // Javier Ruiz
      6: { performance: 'Medio', potential: 'Medio' },  // Sofía Ramos
      7: { performance: 'Alto', potential: 'Alto' },    // Miguel Hernández
      8: { performance: 'Medio', potential: 'Bajo' },   // Lucía Sanz
      9: { performance: 'Alto', potential: 'Alto' },    // Daniel Alarcón
      10: { performance: 'Alto', potential: 'Medio' },  // Marta Ortiz
      11: { performance: 'Bajo', potential: 'Medio' }   // David Castro
    };
  }, []);

  // --- CÁLCULO DE PROGRESOS Y CALIFICACIONES DE CADA COLABORADOR ---
  const employeesData = useMemo(() => {
    return users.map(u => {
      const calibrationState = calibratedUsersData[u.id] || {};
      
      // Resolver unidad organizativa
      const unit = orgUnits.find(o => o.id === u.orgUnitId);
      const unitName = unit ? unit.name : 'Sin asignar';

      // Resolver familia de roles del colaborador
      const roleDetails = rolesData.find(ro => ro.title === u.role);
      const roleFamily = roleDetails ? roleDetails.family : 'Otras';

      // Determinar estado de progreso
      let currentProgress = 'Lanzado';
      if (calibrationState.status) {
        currentProgress = calibrationState.status;
      } else {
        // Fallbacks inteligentes basados en los perfiles
        if (u.id === 1) currentProgress = 'Evaluación 360°';
        else if (u.id === 4) currentProgress = 'Autoevaluado';
        else if (u.id === 5) currentProgress = 'Finalizado';
        else if (u.id === 6) currentProgress = 'Lanzado';
        else if (u.id === 10) currentProgress = 'Autoevaluado';
        else if (u.id === 11) currentProgress = 'Calibrado';
      }

      // Notas base mockeadas para cada skill
      const autoEvalMock = { s1: 4, s2: 2, s3: 3, s7: 2, s8: 3 };
      const managerEvalMock = { s1: 3, s2: 3, s3: 2, s7: 3, s8: 3 };
      const peerEvalMock = { s1: 3, s2: 3, s3: 2, s7: 3, s8: 2 };

      // Resolver calificaciones medias
      const skills = u.skills || [];
      let sumAuto = 0, sumManager = 0, sumPeer = 0;
      let count = 0;

      skills.forEach(s => {
        sumAuto += autoEvalMock[s.id] || 3;
        sumManager += managerEvalMock[s.id] || 3;
        sumPeer += peerEvalMock[s.id] || 2.5;
        count++;
      });

      const avgAuto = count > 0 ? parseFloat((sumAuto / count).toFixed(1)) : 0;
      const avgManager = count > 0 ? parseFloat((sumManager / count).toFixed(1)) : 0;
      const avgPeer = count > 0 ? parseFloat((sumPeer / count).toFixed(1)) : 0;

      // Desviación de autoevaluación (over/under rating)
      const selfAssessmentBias = count > 0 ? parseFloat((avgAuto - avgManager).toFixed(1)) : 0;

      // Desempeño y Potencial
      const potential = calibrationState.potential || baseTalentMapping[u.id]?.potential || 'Medio';
      const performance = baseTalentMapping[u.id]?.performance || 'Medio';

      return {
        ...u,
        unitName,
        roleFamily,
        progress: currentProgress,
        avgAuto,
        avgManager,
        avgPeer,
        selfAssessmentBias,
        potential,
        performance,
        skills,
        campaign: selectedCampaign ? selectedCampaign.name : 'Campaña Primavera 2026'
      };
    });
  }, [users, calibratedUsersData, orgUnits, rolesData, baseTalentMapping, selectedCampaign]);

  // --- COLABORADORES FILTRADOS ---
  const filteredEmployees = useMemo(() => {
    return employeesData.filter(emp => {
      // 1. Filtrar por perfil (solo mostramos empleados rasos y managers intermedios bajo evaluación, no directores de RRHH)
      if (emp.profile === 'RRHH') return false;

      // 2. Filtrar por Unidad Organizativa
      if (selectedOrgUnitId !== 'Todas') {
        // Soporta buscar en la rama jerárquica (la unidad misma o sus hijas)
        const unit = orgUnits.find(o => o.id === selectedOrgUnitId);
        if (unit) {
          const validIds = [selectedOrgUnitId];
          // Buscar hijas directas
          orgUnits.forEach(o => {
            if (o.parentId === selectedOrgUnitId) {
              validIds.push(o.id);
              // Subhijas
              orgUnits.forEach(sub => {
                if (sub.parentId === o.id) validIds.push(sub.id);
              });
            }
          });
          if (!validIds.includes(emp.orgUnitId)) return false;
        }
      }

      // 3. Filtrar por Familia de Roles
      if (selectedRoleFamily !== 'Todas') {
        if (emp.roleFamily !== selectedRoleFamily) return false;
      }

      // 4. Filtrar por Rol Específico
      if (selectedRoleId !== 'Todos') {
        const targetRole = rolesData.find(r => r.id === selectedRoleId);
        if (targetRole && emp.role !== targetRole.title) return false;
      }

      // 5. Filtrar por Mánager Evaluador
      if (selectedManagerId !== 'Todos') {
        if (emp.managerId !== Number(selectedManagerId)) return false;
      }

      return true;
    });
  }, [employeesData, selectedOrgUnitId, selectedRoleFamily, selectedRoleId, selectedManagerId, orgUnits, rolesData]);

  // --- ESTADÍSTICAS DEL PANEL FILTRADO ---
  const stats = useMemo(() => {
    const total = filteredEmployees.length;
    if (total === 0) return { participation: 0, completion: 0, bias: 0, total: 0 };

    const participating = filteredEmployees.filter(e => e.progress !== 'Lanzado').length;
    const completed = filteredEmployees.filter(e => e.progress === 'Calibrado' || e.progress === 'Finalizado').length;
    
    // Sesgo de calibración (desviación entre evaluación manager y calibración final aplicada)
    let totalBias = 0;
    let countCalibrated = 0;
    filteredEmployees.forEach(e => {
      const calibrationState = calibratedUsersData[e.id];
      if (calibrationState && calibrationState.ratings) {
        let sumD = 0;
        let cD = 0;
        Object.entries(calibrationState.ratings).forEach(([skillId, calVal]) => {
          const managerVal = 3; // Nivel manager mockeado estándar
          sumD += Math.abs(calVal - managerVal);
          cD++;
        });
        if (cD > 0) {
          totalBias += (sumD / cD);
          countCalibrated++;
        }
      }
    });

    const avgBias = countCalibrated > 0 ? parseFloat((totalBias / countCalibrated).toFixed(1)) : 0.4;

    return {
      total,
      participation: Math.round((participating / total) * 100),
      completion: Math.round((completed / total) * 100),
      bias: avgBias
    };
  }, [filteredEmployees, calibratedUsersData]);

  // --- CONSTRUCCIÓN DE LA 9-BOX ---
  // Estructura de las 9 celdas
  const nineBoxGrid = useMemo(() => {
    const grid = {
      'Alto-Bajo': { name: 'Profesional Especialista / Clave', color: 'bg-indigo-50 border-indigo-200 text-indigo-800', employees: [] },
      'Alto-Medio': { name: 'Alto Crecimiento / Futuro Líder', color: 'bg-emerald-50 border-emerald-200 text-emerald-800', employees: [] },
      'Alto-Alto': { name: 'Estrella / Talento Clave', color: 'bg-purple-100 border-purple-300 text-purple-900 font-extrabold shadow-sm', employees: [] },
      
      'Medio-Bajo': { name: 'Profesional Consolidado', color: 'bg-slate-50 border-slate-200 text-slate-700', employees: [] },
      'Medio-Medio': { name: 'Profesional Clave / Núcleo', color: 'bg-blue-50 border-blue-200 text-blue-800', employees: [] },
      'Medio-Alto': { name: 'Alto Potencial / Promesa', color: 'bg-teal-50 border-teal-200 text-teal-800', employees: [] },
      
      'Bajo-Bajo': { name: 'Dilema / Desempeño Insuficiente', color: 'bg-rose-50 border-rose-200 text-rose-800', employees: [] },
      'Bajo-Medio': { name: 'Enigma / Desarrollo Técnico', color: 'bg-amber-50 border-amber-200 text-amber-800', employees: [] },
      'Bajo-Alto': { name: 'Enigma Potencial / Esfuerzo Requerido', color: 'bg-orange-50 border-orange-200 text-orange-850', employees: [] }
    };

    filteredEmployees.forEach(emp => {
      // Y-X (Potencial-Desempeño)
      const key = `${emp.potential}-${emp.performance}`;
      if (grid[key]) {
        grid[key].employees.push(emp);
      }
    });

    return grid;
  }, [filteredEmployees]);

  // --- MANIPULADORES DE MODALS ---

  // Abrir calibración para empleado
  const handleOpenCalibration = (emp) => {
    const calibrationState = calibratedUsersData[emp.id] || {};
    
    // Inicializar valores temporales
    const initialRatings = {};
    const initialComments = {};

    emp.skills.forEach(s => {
      initialRatings[s.id] = calibrationState.ratings?.[s.id] || 3; // manager rating o por defecto 3
      initialComments[s.id] = calibrationState.comments?.[s.id] || '';
    });

    setTempCalibrationForm({
      ratings: initialRatings,
      comments: initialComments,
      potential: calibrationState.potential || emp.potential || 'Medio',
      nextProposedRole: calibrationState.nextProposedRole || '',
      potentialComments: calibrationState.potentialComments || ''
    });

    setActiveCalibratingUser(emp);
    setExpandedSkillCommentsId(null);
  };

  // Guardar Calibración
  const handleSaveCalibration = () => {
    if (!activeCalibratingUser) return;

    setCalibratedUsersData(prev => ({
      ...prev,
      [activeCalibratingUser.id]: {
        status: 'Calibrado',
        ratings: tempCalibrationForm.ratings,
        comments: tempCalibrationForm.comments,
        potential: tempCalibrationForm.potential,
        nextProposedRole: tempCalibrationForm.nextProposedRole,
        potentialComments: tempCalibrationForm.potentialComments
      }
    }));

    setActiveCalibratingUser(null);
    alert(`Calibración del expediente de ${activeCalibratingUser.name} guardada con éxito.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 animate-in fade-in duration-500">
      
      {/* CABECERA GESTIÓN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Scale size={110} className="text-[#007A33]" />
        </div>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 text-[#007A33] rounded-lg">
              <Scale size={20} className="stroke-[2.5]" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-800">Panel de Calibración Global de RRHH</h1>
          </div>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-xl">
            Herramienta unificada de calibración para Directores de Talento. Modera valoraciones del comité, contrasta evidencias cualitativas lado a lado y proyecta el mapa de talento 9-Box en vivo.
          </p>
        </div>

        {/* CAMPAÑA SELECTOR */}
        <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl shrink-0 flex items-center gap-3 h-fit relative z-10">
          <div className="space-y-0.5">
            <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Campaña de Evaluación</p>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="bg-transparent border-0 font-extrabold text-xs text-slate-800 focus:ring-0 focus:outline-none p-0 pr-6 select-none cursor-pointer"
            >
              {reviewConfigs.map(camp => (
                <option key={camp.id} value={camp.id}>{camp.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABS DE SELECCIÓN DE VISTA */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/60 gap-6">
        <button
          onClick={() => setActivePanelTab('calibration')}
          className={clsx(
            "pb-3 text-sm font-black transition-all border-b-2 px-1 flex items-center gap-2 cursor-pointer",
            activePanelTab === 'calibration'
              ? "border-[#007A33] text-[#007A33] dark:text-emerald-400"
              : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300"
          )}
        >
          <Scale size={16} /> Calibración
        </button>
        <button
          onClick={() => setActivePanelTab('dashboard')}
          className={clsx(
            "pb-3 text-sm font-black transition-all border-b-2 px-1 flex items-center gap-2 cursor-pointer",
            activePanelTab === 'dashboard'
              ? "border-[#007A33] text-[#007A33] dark:text-emerald-400"
              : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300"
          )}
        >
          <BarChart3 size={16} /> Dashboard calibración
        </button>
      </div>

      {activePanelTab === 'calibration' ? (
        <>
          {/* FILTROS MULTIDIMENSIONALES */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-3xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Selector Unidad Organizativa */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Users size={12} className="text-[#007A33]" /> Unidad Organizativa
          </label>
          <select
            value={selectedOrgUnitId}
            onChange={(e) => {
              setSelectedOrgUnitId(e.target.value);
            }}
            className="w-full bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#007A33] transition-colors"
          >
            <option value="Todas">Todas las unidades</option>
            {orgUnits.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.name} ({unit.type})</option>
            ))}
          </select>
        </div>

        {/* Selector Familia de Roles */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Award size={12} className="text-purple-600" /> Familia de Roles
          </label>
          <select
            value={selectedRoleFamily}
            onChange={(e) => {
              setSelectedRoleFamily(e.target.value);
              setSelectedRoleId('Todos'); // Limpiar rol específico al cambiar de familia
            }}
            className="w-full bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#007A33] transition-colors"
          >
            <option value="Todas">Todas las familias</option>
            {roleFamilies.map(fam => (
              <option key={fam.id} value={fam.name}>{fam.name}</option>
            ))}
            <option value="Otras">Otras familias (Tecnología / Negocio)</option>
          </select>
        </div>

        {/* Selector Roles Específicos */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Sparkles size={12} className="text-blue-500" /> Roles Profesionales
          </label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#007A33] transition-colors"
          >
            <option value="Todos">Todos los roles</option>
            {filteredRolesList.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>

        {/* Selector Mánager Evaluador */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Users size={12} className="text-[#007A33]" /> Mánager Evaluador
          </label>
          <select
            value={selectedManagerId}
            onChange={(e) => setSelectedManagerId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#007A33] transition-colors"
          >
            <option value="Todos">Todos los mánagers</option>
            {managersList.map(mgr => (
              <option key={mgr.id} value={mgr.id}>{mgr.name} ({mgr.role})</option>
            ))}
          </select>
        </div>
      </div>

      {/* SECCIÓN ESTADÍSTICAS GENERALES DE BÚSQUEDA */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Filtro Activo', value: `${filteredEmployees.length} colaboradores`, desc: 'En perímetro seleccionado', icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Participación', value: `${stats.participation}%`, desc: 'Han iniciado autoevaluación', icon: Award, color: 'text-amber-600 bg-amber-50' },
          { label: 'Expedientes Calibrados', value: `${stats.completion}%`, desc: 'Calibración firmada o cerrada', icon: FileSignature, color: 'text-[#007A33] bg-emerald-50' },
          { label: 'Sesgo Calibración Medio', value: `${stats.bias} pts`, desc: 'Calibrado final vs. Mánager', icon: Scale, color: 'text-purple-600 bg-purple-50' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-3xs flex items-center gap-3">
              <div className={clsx("p-2.5 rounded-2xl shrink-0", item.color)}>
                <Icon size={18} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none">{item.label}</p>
                <h4 className="text-sm font-black text-slate-800 mt-1 leading-none">{item.value}</h4>
                <p className="text-[9px] text-slate-500 mt-1 leading-none">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* VISTA PRINCIPAL: LISTADO & 9-BOX */}
      <div className="space-y-6">
        
        {/* LISTADO DE COLABORADORES */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
              <span>Fichas de Colaboradores Seleccionados</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {filteredEmployees.length}
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto flex-1">
            {filteredEmployees.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-450 border border-slate-100">
                  <Info size={20} />
                </div>
                <h4 className="text-xs font-black text-slate-800">No hay empleados bajo estos criterios</h4>
                <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                  Asegúrate de comprobar los filtros activos o prueba seleccionando otra unidad organizativa.
                </p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">
                    <th className="p-3.5 pl-5">Colaborador</th>
                    <th className="p-3.5">Unidad</th>
                    <th className="p-3.5 text-center">Auto / Mán / Peer</th>
                    <th className="p-3.5 text-center">Desviación (Autoeval)</th>
                    <th className="p-3.5 text-center">Estado</th>
                    <th className="p-3.5 pr-5 text-right">Calibración</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {filteredEmployees.map(emp => {
                    return (
                      <tr key={emp.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center gap-2.5">
                            <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full border border-slate-200 shadow-3xs object-cover" />
                            <div>
                              <p className="font-extrabold text-slate-800 leading-tight">{emp.name}</p>
                              <p className="text-[9px] text-slate-400 font-semibold leading-none mt-1">{emp.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-600 leading-tight max-w-[120px] truncate" title={emp.unitName}>
                            {emp.unitName}
                          </p>
                          <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5 block">
                            {emp.roleFamily}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] font-black">
                            <span className="text-[#007A33]" title="Autoevaluación Media">{emp.avgAuto}</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-blue-700" title="Mánager Media">{emp.avgManager}</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-amber-700" title="Media Colegas">{emp.avgPeer}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={clsx(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                            emp.selfAssessmentBias > 0.5 
                              ? "bg-rose-50 border-rose-100 text-rose-700 font-extrabold"
                              : emp.selfAssessmentBias < -0.5 
                                ? "bg-amber-50 border-amber-100 text-amber-700 font-extrabold"
                                : "bg-emerald-50 border-emerald-100 text-[#007A33]"
                          )}>
                            {emp.selfAssessmentBias > 0 ? `+${emp.selfAssessmentBias}` : emp.selfAssessmentBias} pts
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={clsx(
                            "text-[8px] font-extrabold uppercase px-2.5 py-1 rounded-full border shadow-3xs tracking-wider",
                            emp.progress === 'Lanzado' ? "bg-slate-50 text-slate-400 border-slate-200" :
                            emp.progress === 'Autoevaluado' ? "bg-orange-50 text-orange-700 border-orange-200" :
                            emp.progress === 'Evaluación 360°' ? "bg-amber-50 text-amber-700 border-amber-200" :
                            emp.progress === 'Calibrado' ? "bg-purple-100 text-purple-700 border-purple-200 font-black animate-pulse" :
                            "bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold"
                          )}>
                            {emp.progress}
                          </span>
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => setActiveViewingUser(emp)}
                              className="p-1.5 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-500 hover:text-blue-700 rounded-xl transition-all cursor-pointer shadow-3xs"
                              title="Ver ficha de consulta de calificaciones y comentarios"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => handleOpenCalibration(emp)}
                              className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-black transition-all cursor-pointer shadow-sm hover:scale-102 flex items-center gap-1"
                              title="Calibrar competencias, potencial y desarrollo del empleado"
                            >
                              <Scale size={11} /> Calibrar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* MATRIZ 9-BOX DE TALENTO */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-1 mb-5">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
              <span>9-Box: Mapeo de Talento Global</span>
              <span className="bg-purple-50 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-200">
                {filteredEmployees.length} posicionados
              </span>
            </h3>
            <p className="text-[10px] text-slate-450 leading-normal">
              Posicionamiento de potencial vs. desempeño para el conjunto de empleados seleccionados (permite hasta 25 personas en pantalla).
            </p>
          </div>

          {/* PROTECCIÓN DE VOLUMEN (UMBRAL > 25 EMPLEADOS) */}
          {filteredEmployees.length > 25 ? (
            <div className="p-6 bg-purple-50/40 border border-purple-200 rounded-3xl text-center space-y-4 my-2 animate-in zoom-in-95 duration-300">
              <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <AlertCircle size={20} className="stroke-[2.5]" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xs font-black text-purple-950">Visualización 9-Box Bloqueada</h4>
                <p className="text-[10px] text-purple-900 leading-normal max-w-[340px] mx-auto">
                  Has seleccionado **{filteredEmployees.length}** colaboradores. La matriz se bloquea temporalmente al superar las **25 personas** para prevenir saturación visual y asegurar la claridad del análisis de talento.
                </p>
              </div>
              <p className="text-[9px] text-purple-500 italic max-w-[300px] mx-auto">
                💡 Por favor, utiliza los filtros superiores (Unidad Organizativa, Familia o Rol) para refinar a un grupo más acotado.
              </p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-10 border-2 border-dashed border-slate-150 rounded-3xl text-center text-slate-400 text-[11px] font-semibold">
              Filtra colaboradores para ver su distribución en el 9-Box.
            </div>
          ) : (
            // DETALLE DE LA 9-BOX (HASTA 25 COLABORADORES)
            <div className="space-y-3 animate-in fade-in duration-400">
              {/* Grid 3x3 de la 9-Box de ancho completo */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                {/* 1. Fila de Potencial Alto */}
                {['Alto-Bajo', 'Alto-Medio', 'Alto-Alto'].map(key => {
                  const cell = nineBoxGrid[key];
                  return (
                    <div key={key} className={clsx("p-3 rounded-xl border min-h-[120px] flex flex-col justify-between transition-all hover:shadow-2xs", cell.color)}>
                      <p className="text-[7.5px] font-black uppercase tracking-wider leading-none text-slate-450" title={cell.name}>
                        {cell.name}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {cell.employees.map(emp => (
                          <div 
                            key={emp.id} 
                            onClick={() => setActiveViewingUser(emp)}
                            className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-3xs cursor-pointer hover:scale-110 transition-all group relative shrink-0"
                            title={`${emp.name} (Potencial: ${emp.potential} - Desempeño: ${emp.performance})`}
                          >
                            <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                            <span className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold rounded px-1.5 py-0.5 whitespace-nowrap mb-1 z-30">
                              {emp.name.split(' ')[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] font-black text-right block self-end mt-2">
                        {cell.employees.length || '-'}
                      </span>
                    </div>
                  );
                })}

                {/* 2. Fila de Potencial Medio */}
                {['Medio-Bajo', 'Medio-Medio', 'Medio-Alto'].map(key => {
                  const cell = nineBoxGrid[key];
                  return (
                    <div key={key} className={clsx("p-3 rounded-xl border min-h-[120px] flex flex-col justify-between transition-all hover:shadow-2xs", cell.color)}>
                      <p className="text-[7.5px] font-black uppercase tracking-wider leading-none text-slate-450" title={cell.name}>
                        {cell.name}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {cell.employees.map(emp => (
                          <div 
                            key={emp.id} 
                            onClick={() => setActiveViewingUser(emp)}
                            className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-3xs cursor-pointer hover:scale-110 transition-all group relative shrink-0"
                            title={`${emp.name} (Potencial: ${emp.potential} - Desempeño: ${emp.performance})`}
                          >
                            <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                            <span className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold rounded px-1.5 py-0.5 whitespace-nowrap mb-1 z-30">
                              {emp.name.split(' ')[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] font-black text-right block self-end mt-2">
                        {cell.employees.length || '-'}
                      </span>
                    </div>
                  );
                })}

                {/* 3. Fila de Potencial Bajo */}
                {['Bajo-Bajo', 'Bajo-Medio', 'Bajo-Alto'].map(key => {
                  const cell = nineBoxGrid[key];
                  return (
                    <div key={key} className={clsx("p-3 rounded-xl border min-h-[120px] flex flex-col justify-between transition-all hover:shadow-2xs", cell.color)}>
                      <p className="text-[7.5px] font-black uppercase tracking-wider leading-none text-slate-455" title={cell.name}>
                        {cell.name}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {cell.employees.map(emp => (
                          <div 
                            key={emp.id} 
                            onClick={() => setActiveViewingUser(emp)}
                            className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-3xs cursor-pointer hover:scale-110 transition-all group relative shrink-0"
                            title={`${emp.name} (Potencial: ${emp.potential} - Desempeño: ${emp.performance})`}
                          >
                            <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                            <span className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold rounded px-1.5 py-0.5 whitespace-nowrap mb-1 z-30">
                              {emp.name.split(' ')[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] font-black text-right block self-end mt-2">
                        {cell.employees.length || '-'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Leyenda rápida 9-box */}
              <div className="flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest px-1 pt-2 border-t border-slate-100">
                <span>Eje X: Desempeño (Bajo, Medio, Alto)</span>
                <span>Eje Y: Potencial (Bajo, Medio, Alto)</span>
              </div>
            </div>
          )}
        </div>
      </div>

        </>
      ) : (
        <HrCalibrationDashboard 
          filteredEmployees={filteredEmployees} 
          calibratedUsersData={calibratedUsersData} 
          handleOpenCalibration={handleOpenCalibration} 
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CALIBRACIÓN INTERACTIVA (EDICIÓN) */}
      {/* ========================================================================= */}
      {activeCalibratingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-98 duration-300">
            {/* Cabecera Modal */}
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={activeCalibratingUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow-sm" />
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                    Calibrando a: {activeCalibratingUser.name}
                    <span className="text-[9px] bg-purple-600/30 text-purple-200 font-extrabold px-2 py-0.5 rounded-full border border-purple-500/20 uppercase tracking-wider">
                      Moderación RRHH
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold leading-none mt-1">{activeCalibratingUser.role} · {activeCalibratingUser.unitName}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveCalibratingUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo Modal */}
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              
              {/* Info descriptiva */}
              <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-start gap-2.5">
                <Sparkles size={16} className="text-purple-650 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-black text-purple-950">Ajuste definitivo de Competencias 360°</p>
                  <p className="text-[9.5px] text-purple-900 leading-normal mt-0.5">
                    Modera los niveles de Ana según las propuestas basadas en la ponderación de mánager y colegas. Despliega **"Ver Justificaciones"** para consultar el soporte documental aportado por cada rol evaluado.
                  </p>
                </div>
              </div>

              {/* Matriz de Calibración de Habilidades */}
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">
                      <th className="p-3 w-44">Competencia</th>
                      <th className="p-3 text-center">Auto</th>
                      <th className="p-3 text-center">Mánager</th>
                      <th className="p-3 text-center">Colegas (Peers)</th>
                      <th className="p-3 text-center bg-emerald-50/40 text-[#007A33]">Propuesta</th>
                      <th className="p-3 text-center w-52">Nivel Calibrado Final</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {(activeCalibratingUser.skills || []).map((skill) => {
                      const details = mockSkillDetails[skill.name] || {};
                      
                      // Mocking de niveles iniciales para contraste
                      const autoEvalMock = { s1: 4, s2: 2, s3: 3, s7: 2, s8: 3 };
                      const managerValMock = { s1: 3, s2: 3, s3: 2, s7: 3, s8: 3 };
                      const peerValMock = { s1: 3, s2: 3, s3: 2, s7: 3, s8: 2 };

                      const autoVal = autoEvalMock[skill.id] || 3;
                      const managerVal = managerValMock[skill.id] || 3;
                      const peerVal = peerValMock[skill.id] || 2.5;

                      // Calcular propuesta ponderada
                      const config = getWorkflowForSkill(activeCalibratingUser, skill);
                      let proposal = managerVal;
                      if (config.workflowType === 'self_manager_peers' && peerVal > 0) {
                        const mW = config.managerWeight !== undefined ? config.managerWeight : 70;
                        const pW = config.peerWeight !== undefined ? config.peerWeight : 30;
                        proposal = parseFloat(((mW * managerVal + pW * peerVal) / 100).toFixed(1));
                      }

                      const isExpanded = expandedSkillCommentsId === skill.id;

                      return (
                        <React.Fragment key={skill.id}>
                          {/* Fila principal */}
                          <tr className="border-b border-slate-100 hover:bg-slate-50/30">
                            <td className="p-3">
                              <p className="font-extrabold text-slate-800 leading-tight">{skill.name}</p>
                              <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide leading-none">{skill.category}</span>
                              <div className="mt-1">
                                <button 
                                  type="button"
                                  onClick={() => setExpandedSkillCommentsId(isExpanded ? null : skill.id)}
                                  className={clsx(
                                    "inline-flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded-md border cursor-pointer transition-all",
                                    isExpanded 
                                      ? "bg-purple-50 text-purple-700 border-purple-200" 
                                      : "bg-white text-slate-500 border-slate-200 hover:border-purple-300 hover:text-purple-600"
                                  )}
                                >
                                  <span>💬 {isExpanded ? 'Ocultar Justificaciones' : 'Ver Justificaciones'}</span>
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <span className="inline-flex w-6 h-6 rounded-full bg-emerald-50 text-[#007A33] border border-emerald-100 items-center justify-center font-bold text-[11px]">
                                {autoVal}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="inline-flex w-6 h-6 rounded-full bg-blue-50 text-blue-700 border border-blue-100 items-center justify-center font-bold text-[11px]">
                                {managerVal}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="inline-flex w-6 h-6 rounded-full bg-amber-50 text-amber-700 border border-amber-100 items-center justify-center font-bold text-[11px]">
                                {peerVal}
                              </span>
                            </td>
                            <td className="p-3 text-center bg-emerald-50/20 font-black text-sm text-[#007A33]">
                              {proposal}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col gap-1.5 items-center">
                                <div className="flex gap-1 justify-center">
                                  {SCALE.map(s => {
                                    const isSelected = tempCalibrationForm.ratings[skill.id] === s.value;
                                    return (
                                      <button
                                        key={s.value}
                                        type="button"
                                        onClick={() => setTempCalibrationForm(prev => ({
                                          ...prev,
                                          ratings: { ...prev.ratings, [skill.id]: s.value }
                                        }))}
                                        className={clsx(
                                          "w-8 h-8 rounded-lg border font-bold transition-all text-xs cursor-pointer",
                                          isSelected 
                                            ? "bg-purple-600 border-purple-600 text-white shadow-md scale-105" 
                                            : "bg-white border-slate-200 text-slate-600 hover:bg-purple-50 hover:border-purple-300"
                                        )}
                                      >
                                        {s.value}
                                      </button>
                                    );
                                  })}
                                </div>
                                <textarea
                                  rows={1}
                                  value={tempCalibrationForm.comments[skill.id] || ''}
                                  onChange={(e) => {
                                    const text = e.target.value;
                                    setTempCalibrationForm(prev => ({
                                      ...prev,
                                      comments: { ...prev.comments, [skill.id]: text }
                                    }));
                                  }}
                                  placeholder="Añadir comentario..."
                                  className="w-full px-2 py-1 rounded-lg border border-purple-200 bg-white text-[10px] font-semibold text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-slate-400 leading-normal"
                                />
                              </div>
                            </td>
                          </tr>

                          {/* Fila Justificaciones Desplegada */}
                          {isExpanded && (
                            <tr className="bg-purple-50/10">
                              <td colSpan={6} className="p-3.5 border-b border-slate-200">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[11px] leading-relaxed">
                                  {/* Auto-eval */}
                                  <div className="p-2.5 bg-white border border-slate-150 rounded-xl space-y-1">
                                    <p className="text-[9px] font-extrabold text-[#007A33] uppercase flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      Empleado (Autoeval)
                                    </p>
                                    <p className="text-slate-600 italic">
                                      "{details.description ? `He aplicado activamente esta habilidad resolviendo hitos complejos del rol.` : 'Nivel consolidado basándome en los objetivos trimestrales.'}"
                                    </p>
                                  </div>

                                  {/* Manager */}
                                  <div className="p-2.5 bg-white border border-slate-150 rounded-xl space-y-1">
                                    <p className="text-[9px] font-extrabold text-blue-700 uppercase flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                      Mánager (Visado)
                                    </p>
                                    <p className="text-slate-650 italic">
                                      "Se desenvuelve perfectamente en las tareas asignadas, operando con criterio profesional sólido."
                                    </p>
                                  </div>

                                  {/* Peers */}
                                  <div className="p-2.5 bg-white border border-slate-150 rounded-xl space-y-1">
                                    <p className="text-[9px] font-extrabold text-amber-700 uppercase flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                      Colegas (Promedio)
                                    </p>
                                    <p className="text-slate-650 italic">
                                      "Siempre disponible para resolver dudas con total transparencia y agilidad."
                                    </p>
                                  </div>

                                  {/* RRHH Calibrado (Comentario final editable) */}
                                  <div className="p-2.5 bg-purple-50/30 border border-purple-200 rounded-xl space-y-1.5">
                                    <p className="text-[9px] font-extrabold text-purple-800 uppercase flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                      Calibración / Comité (Comentario)
                                    </p>
                                    <textarea
                                      rows={3}
                                      value={tempCalibrationForm.comments[skill.id] || ''}
                                      onChange={(e) => {
                                        const text = e.target.value;
                                        setTempCalibrationForm(prev => ({
                                          ...prev,
                                          comments: { ...prev.comments, [skill.id]: text }
                                        }));
                                      }}
                                      placeholder="Escribe aquí la justificación o evidencias de la nota calibrada..."
                                      className="w-full px-2 py-1.5 rounded-lg border border-purple-200 bg-white text-[10px] font-semibold text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 leading-normal"
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* SECCIÓN EXCLUSIVA DE POTENCIAL & PLAN DE CARRERA */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-purple-600 stroke-[2.5]" />
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Valoración de Potencial & Proyección de Carrera</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-purple-50/20 p-5 rounded-3xl border border-purple-100/50">
                  {/* Selector de Potencial */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-700">Nivel de Potencial *</label>
                    <div className="flex flex-col gap-2">
                      {[
                        { val: 'Bajo', label: 'Bajo (Limitado)', desc: 'Desempeña bien su rol actual, crecimiento vertical limitado.' },
                        { val: 'Medio', label: 'Medio (Crecimiento)', desc: 'Capacidad para asumir roles de mayor nivel a medio plazo (1-2 años).' },
                        { val: 'Alto', label: 'Alto (Estrella / Clave)', desc: 'Alta adaptabilidad; listo para puestos críticos de alta responsabilidad.' }
                      ].map(item => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setTempCalibrationForm(prev => ({ ...prev, potential: item.val }))}
                          className={clsx(
                            "p-3 rounded-2xl border text-left transition-all cursor-pointer",
                            tempCalibrationForm.potential === item.val
                              ? "bg-purple-600 border-purple-700 text-white shadow-md"
                              : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                          )}
                        >
                          <p className="text-[11px] font-extrabold">{item.label}</p>
                          <p className={clsx(
                            "text-[8px] mt-0.5 leading-normal",
                            tempCalibrationForm.potential === item.val ? "text-purple-200" : "text-slate-400"
                          )}>
                            {item.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Siguiente rol propuesto y comentarios */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-700">Siguiente Rol Propuesto / Promoción</label>
                      <input
                        type="text"
                        value={tempCalibrationForm.nextProposedRole}
                        onChange={(e) => setTempCalibrationForm(prev => ({ ...prev, nextProposedRole: e.target.value }))}
                        placeholder="Ej: Tech Lead, Referente Técnico, Arquitecto de Software..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-700">Justificación de Potencial y Plan de Sucesión *</label>
                      <textarea
                        rows={4}
                        value={tempCalibrationForm.potentialComments}
                        onChange={(e) => setTempCalibrationForm(prev => ({ ...prev, potentialComments: e.target.value }))}
                        placeholder="Redacta la argumentación del comité para la calibración del 9-Box y planes de movilidad..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveCalibratingUser(null)}
                className="px-5 py-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCalibration}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Check size={14} /> Guardar Calibración
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONSULTA DETALLE DE EVALUACIÓN (LÓGICA LECTURA) */}
      {/* ========================================================================= */}
      {activeViewingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-98 duration-300">
            {/* Cabecera Consulta */}
            <div className="p-5 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={activeViewingUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-3xs" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">
                    Ficha de Calificaciones: {activeViewingUser.name}
                  </h3>
                  <p className="text-[10px] text-slate-450 font-bold leading-none mt-1">{activeViewingUser.role} · {activeViewingUser.unitName}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveViewingUser(null)}
                className="text-slate-450 hover:text-slate-700 p-1 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo Consulta */}
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              
              {/* Skills Table List */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1 border-l-2 border-blue-500">Desglose de Competencias</h4>
                
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">
                        <th className="p-3 pl-5">Competencia</th>
                        <th className="p-3 text-center">Familia</th>
                        <th className="p-3 text-center">Requerido (Req)</th>
                        <th className="p-3 text-center">Autoeval (Auto)</th>
                        <th className="p-3 text-center">Mánager</th>
                        <th className="p-3 text-center">Colegas (Peers)</th>
                        <th className="p-3 text-center bg-purple-50 text-purple-800">Calibrado Final</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {(activeViewingUser.skills || []).map((skill) => {
                        const calibrationState = calibratedUsersData[activeViewingUser.id] || {};
                        const finalScore = calibrationState.ratings?.[skill.id] || 3;
                        const reqScore = skill.required || 3;

                        // Mocking de niveles iniciales para contraste en el desglose de consulta
                        const autoEvalMock = { s1: 4, s2: 2, s3: 3, s7: 2, s8: 3 };
                        const managerValMock = { s1: 3, s2: 3, s3: 2, s7: 3, s8: 3 };
                        const peerValMock = { s1: 3, s2: 3, s3: 2, s7: 3, s8: 2 };

                        const autoVal = autoEvalMock[skill.id] || 3;
                        const managerVal = managerValMock[skill.id] || 3;
                        const peerVal = peerValMock[skill.id] || 2.5;

                        return (
                          <tr key={skill.id} className="border-b border-slate-100 hover:bg-slate-50/30">
                            <td className="p-3 pl-5">
                              <p className="font-extrabold text-slate-800 leading-tight">{skill.name}</p>
                              {calibrationState.comments?.[skill.id] && (
                                <p className="text-[9.5px] text-slate-500 italic mt-0.5 leading-snug">
                                  💬 "{calibrationState.comments[skill.id]}"
                                </p>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <span className={clsx(
                                "text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase border",
                                skill.category === 'Soft Skill' ? "bg-sky-50 text-sky-700 border-sky-100" :
                                skill.category === 'Metodología' ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-[#007A33] border-emerald-100"
                              )}>
                                {skill.category}
                              </span>
                            </td>
                            <td className="p-3 text-center font-bold text-slate-500">
                              {reqScore}
                            </td>
                            <td className="p-3 text-center">
                              <span className="inline-flex w-6 h-6 rounded-full bg-emerald-50 text-[#007A33] border border-emerald-100 items-center justify-center font-bold text-[10px]">
                                {autoVal}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="inline-flex w-6 h-6 rounded-full bg-blue-50 text-blue-700 border border-blue-100 items-center justify-center font-bold text-[10px]">
                                {managerVal}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="inline-flex w-6 h-6 rounded-full bg-amber-50 text-amber-700 border border-amber-100 items-center justify-center font-bold text-[10px]">
                                {peerVal > 0 ? peerVal : '-'}
                              </span>
                            </td>
                            <td className="p-3 text-center bg-purple-50 font-black text-sm text-purple-700">
                              <span className="inline-flex w-6 h-6 rounded-full bg-purple-100 text-purple-800 items-center justify-center">
                                {finalScore}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expediente Potencial */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1 border-l-2 border-purple-600">Expediente de Potencial y Sucesión</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Potencial</p>
                    <p className="text-base font-black text-purple-700 mt-1">{activeViewingUser.potential}</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Siguiente Rol Objetivo</p>
                    <p className="text-xs font-black text-slate-800 mt-1.5">
                      {calibratedUsersData[activeViewingUser.id]?.nextProposedRole || 'No especificado'}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Estado en 9-Box</p>
                    <p className="text-xs font-semibold text-slate-600 mt-1.5">
                      {activeViewingUser.potential === 'Alto' ? '⭐ Talento Estrella / Clave' :
                       activeViewingUser.potential === 'Medio' ? '🚀 Alto Crecimiento Profesional' : '💼 Profesional Clave'}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl sm:col-span-3 space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Comentarios Justificativos de Talento</p>
                    <p className="text-slate-600 italic leading-normal">
                      "{calibratedUsersData[activeViewingUser.id]?.potentialComments || 'Expediente cerrado sin valoraciones adicionales en el plan de carrera.'}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Consulta */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveViewingUser(null)}
                className="px-5 py-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cerrar Ficha
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetUser = activeViewingUser;
                  setActiveViewingUser(null);
                  handleOpenCalibration(targetUser);
                }}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Scale size={14} /> Editar Calibración
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
