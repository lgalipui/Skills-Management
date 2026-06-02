import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockRoles } from '../data/mockData';
import { 
  Map, GitFork, Plus, Trash2, HelpCircle, ArrowRight, Eye, Check, Edit3, Settings, 
  Play, Info, Search, ZoomIn, ZoomOut, Maximize2, Sliders, Award, BookOpen, AlertCircle, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

// Default static coordinate layouts as fallbacks for standard roles
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

export const HrCareerManagement = () => {
  const { 
    currentUser, 
    rolesData = [], 
    careerPaths = [], 
    saveCareerTransition, 
    deleteCareerTransition,
    progressionCriteria = [],
    saveProgressionCriteria,
    employeeDossier
  } = useAuth();

  // Gestión de Pestañas
  const [activeTab, setActiveTab] = useState('itinerarios'); // 'itinerarios' | 'requisitos'

  // Rol Base Activo para el Lienzo (Tab 1)
  const [selectedBaseRoleId, setSelectedBaseRoleId] = useState('r1');

  // Modal de niveles del Rol Base
  const [isBaseRoleLevelsModalOpen, setIsBaseRoleLevelsModalOpen] = useState(false);

  // Estado para colapsar/expandir la leyenda flotante del lienzo
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Zoom y Paneado del Canvas
  const [zoomScale, setZoomScale] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panDragState, setPanDragState] = useState(null);

  // Arrastre de Nodos (Drag & Drop)
  const [dragState, setDragState] = useState(null);
  const [positionsByBaseRole, setPositionsByBaseRole] = useState(() => {
    const saved = localStorage.getItem('cajamar_positions_by_base_role_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error cargando posiciones de layout:", e);
      }
    }
    return {
      r1: {
        r1: { x: 180, y: 480 },
        r2: { x: 180, y: 180 }, // Vertical
        r5: { x: 520, y: 480 }, // Lateral
        r3: { x: 520, y: 180 }  // Diagonal
      },
      r2: {
        r2: { x: 180, y: 480 },
        r3: { x: 180, y: 180 }, // Vertical
        r4: { x: 520, y: 180 }  // Diagonal
      },
      r5: {
        r5: { x: 180, y: 480 },
        r3: { x: 520, y: 480 }  // Lateral
      }
    };
  });

  // Guardar coordenadas locales en LocalStorage
  useEffect(() => {
    localStorage.setItem('cajamar_positions_by_base_role_v2', JSON.stringify(positionsByBaseRole));
  }, [positionsByBaseRole]);

  // Selección de Rol de Destino en Pestaña 2 (Requisitos) - NO MÁS PAREJAS/TRANSICIONES
  const [selectedDestRoleId, setSelectedDestRoleId] = useState('r2');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  // Estado del Formulario de Criterios (Tab 2)
  const [criteriaForm, setCriteriaForm] = useState({
    minYearsInEntity: 1.0,
    minYearsExperience: 2.0,
    reqPerformanceYears: 1,
    reqPerformanceLevel: 'Alto',
    reqPotentialYears: 1,
    reqPotentialLevel: 'Alto Potencial',
    acceptedMarketConditions: [],
    previousRoles: [],
    enableMinYearsInEntity: true,
    enableMinYearsExperience: true,
    enablePerformance: true,
    enablePotential: true,
    enableMarketConditions: true,
    enablePreviousRoles: true
  });

  // Formulario rápido para añadir Rol Previo
  const [newPrevRoleForm, setNewPrevRoleForm] = useState({
    roleId: '',
    type: 'required',
    minYears: 1.0
  });

  // Formulario de Adición Rápida de Conexión (Tab 1 Sidebar)
  const [newTransitionForm, setNewTransitionForm] = useState({
    toRoleId: '',
    type: 'vertical',
    horizon: 'short',
    affinityOverride: ''
  });

  // Hover provisional sobre conexiones
  const [hoveredTransition, setHoveredTransition] = useState(null);

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

  const baseRoleLevels = useMemo(() => {
    if (!selectedBaseRole) return [];
    return allAvailableRoles.filter(r => r.title.toLowerCase() === selectedBaseRole.title.toLowerCase());
  }, [selectedBaseRole, allAvailableRoles]);

  // Filtrar el catálogo de roles por el buscador en Tab 2 (Izquierda)
  const filteredRoles = useMemo(() => {
    if (!roleSearchQuery.trim()) return allAvailableRoles;
    const query = roleSearchQuery.toLowerCase();
    return allAvailableRoles.filter(r => 
      r.title.toLowerCase().includes(query) || 
      r.level.toLowerCase().includes(query) ||
      r.family.toLowerCase().includes(query)
    );
  }, [allAvailableRoles, roleSearchQuery]);

  // Roles destinatarios aptos para añadir (no conectados todavía)
  const targetRoleOptions = useMemo(() => {
    const activePath = careerPaths.find(p => p.fromRoleId === selectedBaseRoleId) || { transitions: [] };
    const connectedIds = activePath.transitions.map(t => t.toRoleId);
    return allAvailableRoles.filter(r => r.id !== selectedBaseRoleId && !connectedIds.includes(r.id));
  }, [selectedBaseRoleId, allAvailableRoles, careerPaths]);

  // Funciones de cálculo matemático
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

  // Helper de posicionamiento geométrico inteligente por tipo de movimiento
  const getRolePosition = (roleId) => {
    const baseMap = positionsByBaseRole[selectedBaseRoleId] || {};
    if (baseMap[roleId]) {
      return baseMap[roleId];
    }
    
    // Si es el rol base, fijarlo estrictamente abajo a la izquierda
    if (roleId === selectedBaseRoleId) {
      return { x: 180, y: 480 };
    }
    
    // Obtener la transición asociada a este rol de destino
    const path = careerPaths.find(p => p.fromRoleId === selectedBaseRoleId);
    const transitions = path ? path.transitions : [];
    const t = transitions.find(x => x.toRoleId === roleId);
    if (!t) return { x: 520, y: 280 };

    if (t.type === 'vertical') {
      return { x: 180, y: 180 };
    }
    
    if (t.type === 'lateral') {
      const lateralConns = transitions.filter(x => x.type === 'lateral');
      const idx = lateralConns.findIndex(x => x.toRoleId === roleId);
      return { x: 520 + Math.max(0, idx) * 260, y: 480 };
    }
    
    if (t.type === 'diagonal') {
      const diagonalConns = transitions.filter(x => x.type === 'diagonal');
      const idx = diagonalConns.findIndex(x => x.toRoleId === roleId);
      return { x: 520 + Math.max(0, idx) * 260, y: 180 };
    }
    
    return { x: 520, y: 280 };
  };

  // Conexiones activas del Rol Base seleccionado
  const activeConnections = useMemo(() => {
    const list = [];
    const path = careerPaths.find(p => p.fromRoleId === selectedBaseRoleId);
    if (!path || !selectedBaseRole) return [];

    path.transitions.forEach((t) => {
      const toRole = allAvailableRoles.find(r => r.id === t.toRoleId);
      if (!toRole) return;

      const autoAffinity = calculateAffinity(selectedBaseRole, toRole);
      const affinity = t.affinityOverride !== null && t.affinityOverride !== undefined ? t.affinityOverride : autoAffinity;

      const posFrom = getRolePosition(selectedBaseRoleId);
      const posTo = getRolePosition(t.toRoleId);
      const gaps = getGapDetails(selectedBaseRole, toRole);

      list.push({
        fromId: selectedBaseRoleId,
        fromTitle: selectedBaseRole.title,
        toId: t.toRoleId,
        toTitle: toRole.title,
        x1: posFrom.x,
        y1: posFrom.y,
        x2: posTo.x,
        y2: posTo.y,
        type: t.type,
        horizon: t.horizon,
        affinity,
        gaps
      });
    });
    return list;
  }, [careerPaths, selectedBaseRoleId, selectedBaseRole, allAvailableRoles, positionsByBaseRole]);

  // Usabilidad: Si ya existe un vertical, no permitir añadir otro en Tab 1
  const hasVertical = useMemo(() => {
    return activeConnections.some(c => c.type === 'vertical');
  }, [activeConnections]);

  // Sincronizar por defecto el tipo si se restringe la adición vertical
  useEffect(() => {
    if (hasVertical && newTransitionForm.type === 'vertical') {
      setNewTransitionForm(prev => ({ ...prev, type: 'lateral' }));
    }
  }, [hasVertical, newTransitionForm.type]);

  // Manejo de Drag & Drop de nodos en el lienzo
  const handleNodePointerDown = (e, roleId) => {
    if (roleId === selectedBaseRoleId) return;
    
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    
    const pos = getRolePosition(roleId);
    setDragState({
      roleId,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y
    });
  };

  const handleNodePointerMove = (e) => {
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    e.stopPropagation();

    const dx = (e.clientX - dragState.startX) / zoomScale;
    const dy = (e.clientY - dragState.startY) / zoomScale;

    const newX = Math.max(20, Math.min(880, Math.round(dragState.initialX + dx)));
    const newY = Math.max(20, Math.min(580, Math.round(dragState.initialY + dy)));

    setPositionsByBaseRole(prev => {
      const baseMap = prev[selectedBaseRoleId] || {};
      return {
        ...prev,
        [selectedBaseRoleId]: {
          ...baseMap,
          [dragState.roleId]: { x: newX, y: newY }
        }
      };
    });
  };

  const handleNodePointerUp = (e) => {
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    e.stopPropagation();
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragState(null);
  };

  // Manejo de Paneo (Background Drag)
  const handleBgPointerDown = (e) => {
    if (e.target.closest('.role-card') || e.target.closest('button') || e.target.closest('select')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPanDragState({
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y
    });
  };

  const handleBgPointerMove = (e) => {
    if (!panDragState || panDragState.pointerId !== e.pointerId) return;
    const dx = e.clientX - panDragState.startX;
    const dy = e.clientY - panDragState.startY;
    setPanOffset({
      x: panDragState.initialPanX + dx,
      y: panDragState.initialPanY + dy
    });
  };

  const handleBgPointerUp = (e) => {
    if (!panDragState || panDragState.pointerId !== e.pointerId) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setPanDragState(null);
  };

  // Controles de Zoom
  const handleZoomIn = () => setZoomScale(prev => Math.min(1.5, prev + 0.1));
  const handleZoomOut = () => setZoomScale(prev => Math.max(0.5, prev - 0.1));
  const handleResetZoom = () => {
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Añadir alternativa de itinerario (Tab 1 Sidebar)
  const handleAddTransition = (e) => {
    e.preventDefault();
    if (!newTransitionForm.toRoleId) {
      alert('Por favor, selecciona un rol de destino.');
      return;
    }

    saveCareerTransition(selectedBaseRoleId, {
      toRoleId: newTransitionForm.toRoleId,
      type: newTransitionForm.type,
      horizon: newTransitionForm.horizon,
      affinityOverride: newTransitionForm.affinityOverride !== '' ? Number(newTransitionForm.affinityOverride) : null
    });

    let newCoords = { x: 520, y: 280 };
    if (newTransitionForm.type === 'vertical') {
      newCoords = { x: 180, y: 180 };
    } else if (newTransitionForm.type === 'lateral') {
      const lateralCount = activeConnections.filter(c => c.type === 'lateral').length;
      newCoords = { x: 520 + lateralCount * 260, y: 480 };
    } else if (newTransitionForm.type === 'diagonal') {
      const diagonalCount = activeConnections.filter(c => c.type === 'diagonal').length;
      newCoords = { x: 520 + diagonalCount * 260, y: 180 };
    }

    setPositionsByBaseRole(prev => {
      const baseMap = prev[selectedBaseRoleId] || {};
      return {
        ...prev,
        [selectedBaseRoleId]: {
          ...baseMap,
          [newTransitionForm.toRoleId]: newCoords
        }
      };
    });

    setNewTransitionForm(prev => ({
      ...prev,
      toRoleId: '',
      affinityOverride: ''
    }));
  };

  // Borrar conexión del itinerario
  const handleDeleteTransition = (toRoleId) => {
    if (confirm('¿Estás seguro de que deseas eliminar este rol de destino del itinerario de este rol base?')) {
      deleteCareerTransition(selectedBaseRoleId, toRoleId);
      
      setPositionsByBaseRole(prev => {
        const baseMap = { ...(prev[selectedBaseRoleId] || {}) };
        delete baseMap[toRoleId];
        return {
          ...prev,
          [selectedBaseRoleId]: baseMap
        };
      });
    }
  };

  // --- Lógica de Políticas de Progreso (Pestaña 2) - CENTRADA EN EL ROL DE DESTINO ---
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

  // Cargar criterios cuando cambia el Rol de Destino seleccionado en la Pestaña 2
  useEffect(() => {
    if (selectedDestRoleId) {
      const criteria = getCriteriaForDestination(selectedDestRoleId);
      setCriteriaForm({
        minYearsInEntity: criteria.minYearsInEntity,
        minYearsExperience: criteria.minYearsExperience,
        reqPerformanceYears: criteria.reqPerformanceYears,
        reqPerformanceLevel: criteria.reqPerformanceLevel,
        reqPotentialYears: criteria.reqPotentialYears,
        reqPotentialLevel: criteria.reqPotentialLevel,
        acceptedMarketConditions: criteria.acceptedMarketConditions || [],
        previousRoles: criteria.previousRoles || [],
        enableMinYearsInEntity: criteria.enableMinYearsInEntity !== undefined ? criteria.enableMinYearsInEntity : true,
        enableMinYearsExperience: criteria.enableMinYearsExperience !== undefined ? criteria.enableMinYearsExperience : true,
        enablePerformance: criteria.enablePerformance !== undefined ? criteria.enablePerformance : true,
        enablePotential: criteria.enablePotential !== undefined ? criteria.enablePotential : true,
        enableMarketConditions: criteria.enableMarketConditions !== undefined ? criteria.enableMarketConditions : true,
        enablePreviousRoles: criteria.enablePreviousRoles !== undefined ? criteria.enablePreviousRoles : true
      });
      // Inicializar el formulario rápido de rol previo
      setNewPrevRoleForm({
        roleId: allAvailableRoles.find(r => r.id !== selectedDestRoleId)?.id || '',
        type: 'required',
        minYears: 1.0
      });
    }
  }, [selectedDestRoleId, progressionCriteria, allAvailableRoles]);

  // Guardar criterios de progreso
  const handleSaveCriteria = (e) => {
    e.preventDefault();
    if (!selectedDestRoleId) return;
    saveProgressionCriteria(selectedDestRoleId, criteriaForm);
    alert('Políticas y umbrales de progreso guardados con éxito para este Rol de Destino.');
  };

  // Añadir un rol previo al listado local de criterios
  const handleAddPrevRole = (e) => {
    e.preventDefault();
    if (!newPrevRoleForm.roleId) {
      alert('Por favor, selecciona un rol previo.');
      return;
    }
    
    // Evitar duplicados
    if (criteriaForm.previousRoles.some(p => p.roleId === newPrevRoleForm.roleId)) {
      alert('Este rol previo ya está en la lista de requisitos.');
      return;
    }

    setCriteriaForm(prev => ({
      ...prev,
      previousRoles: [...prev.previousRoles, {
        roleId: newPrevRoleForm.roleId,
        type: newPrevRoleForm.type,
        minYears: Number(newPrevRoleForm.minYears)
      }]
    }));
  };

  // Eliminar un rol previo del listado local de criterios
  const handleDeletePrevRole = (roleId) => {
    setCriteriaForm(prev => ({
      ...prev,
      previousRoles: prev.previousRoles.filter(p => p.roleId !== roleId)
    }));
  };

  // Roles aptos para agregar como previos (no el rol de destino en sí)
  const prevRoleOptions = useMemo(() => {
    return allAvailableRoles.filter(r => r.id !== selectedDestRoleId);
  }, [allAvailableRoles, selectedDestRoleId]);

  // Compliance de Ana García contra los requisitos del Rol de Destino seleccionado (Pestaña 2)
  const previewCompliance = useMemo(() => {
    if (!selectedDestRoleId) return null;

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

    // Compliance de Roles Previos
    const previousRolesCheck = criteriaForm.previousRoles.map(prev => {
      const isCurrent = prev.roleId === 'r1'; // Ana García está en Analista Programador (r1) en la simulación
      const actualYears = isCurrent ? employeeDossier.yearsInRole : 0;
      const satisfies = actualYears >= prev.minYears;
      return {
        ...prev,
        actualYears,
        satisfies
      };
    });

    return {
      satisfiesEntityYears,
      satisfiesExpYears,
      satisfiesPerformance,
      satisfiesPotential,
      previousRolesCheck
    };
  }, [selectedDestRoleId, criteriaForm, employeeDossier]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-7xl mx-auto p-1 bg-transparent">
      
      {/* CABECERA GIGANTE PREMIUM */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-100/80 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            Consola RRHH
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none flex items-center gap-2">
            <GitFork className="text-blue-600" /> Gestión de Carreras
          </h1>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
            Consola de modelización y administración del talento de Cajamar. Diseña rutas profesionales y establece los umbrales de progreso homologados para cada rol.
          </p>
        </div>

        {/* NAVEGACIÓN ENTRE LAS DOS PESTAÑAS */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/40 self-start md:self-center">
          <button
            onClick={() => setActiveTab('itinerarios')}
            className={clsx(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'itinerarios' 
                ? "bg-white text-blue-700 shadow-sm font-semibold" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Map size={14} /> Configurar Itinerarios
          </button>
          <button
            onClick={() => {
              setActiveTab('requisitos');
            }}
            className={clsx(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'requisitos' 
                ? "bg-white text-blue-700 shadow-sm font-semibold" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Sliders size={14} /> Configurar Requisitos
          </button>
        </div>
      </div>

      {/* CONTENIDO DE LA PESTAÑA 1: CONFIGURACIÓN VISUAL DE ITINERARIOS */}
      {activeTab === 'itinerarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* PANEL IZQUIERDO: CONFIGURADOR DE MOVIMIENTOS */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100/80 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Settings className="text-blue-600" size={18} />
                <h3 className="font-bold text-slate-800 text-base">Modelar Ruta</h3>
              </div>

              {/* Selector de Rol Base Fijo */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Rol Base de Origen
                </label>
                <select
                  value={selectedBaseRoleId}
                  onChange={(e) => {
                    setSelectedBaseRoleId(e.target.value);
                    handleResetZoom();
                  }}
                  className="w-full px-3 py-2.5 border-2 border-slate-100 bg-white rounded-xl text-xs font-bold text-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer shadow-2xs"
                >
                  {allAvailableRoles.map(r => (
                    <option key={r.id} value={r.id}>{r.title} ({r.level})</option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-400 leading-normal mt-1">
                  En cada consulta este rol base actúa como origen fijo abajo a la izquierda del lienzo.
                </p>
              </div>

              {/* Formulario Añadir Alternativa */}
              <form onSubmit={handleAddTransition} className="space-y-4 pt-4 border-t border-slate-100 text-left">
                <h4 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Añadir Alternativa de Carrera</h4>

                {/* Seleccionar Puesto Destino */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Rol de Destino *
                  </label>
                  {targetRoleOptions.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic bg-slate-50 p-2 rounded-xl border border-slate-100">
                      Ya has conectado todos los roles disponibles a este rol base.
                    </p>
                  ) : (
                    <select
                      required
                      value={newTransitionForm.toRoleId}
                      onChange={(e) => setNewTransitionForm(prev => ({ ...prev, toRoleId: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">Selecciona rol destino...</option>
                      {targetRoleOptions.map(r => (
                        <option key={r.id} value={r.id}>{r.title} ({r.level})</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Tipo de Movimiento */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Tipo Movimiento
                    </label>
                    <select
                      value={newTransitionForm.type}
                      onChange={(e) => setNewTransitionForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
                    >
                      {!hasVertical && <option value="vertical">Vertical (Ascenso)</option>}
                      <option value="lateral">Lateral (Rotación)</option>
                      <option value="diagonal">Diagonal</option>
                    </select>
                  </div>

                  {/* Horizonte Temporal */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Plazo Estimado
                    </label>
                    <select
                      value={newTransitionForm.horizon}
                      onChange={(e) => setNewTransitionForm(prev => ({ ...prev, horizon: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="short">Corto Plazo</option>
                      <option value="long">Largo Plazo</option>
                    </select>
                  </div>
                </div>

                {/* Sobrescribir Afinidad */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Porcentaje de Afinidad (%) <span className="text-[9px] text-slate-350 lowercase italic">(opcional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Auto-calcular mediante skills"
                    value={newTransitionForm.affinityOverride}
                    onChange={(e) => setNewTransitionForm(prev => ({ ...prev, affinityOverride: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-none bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={targetRoleOptions.length === 0}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer font-semibold"
                >
                  <Plus size={13} /> Añadir al Itinerario
                </button>
              </form>
            </div>

            {/* PANEL DETALLES DE TRANSICIÓN AL HACER HOVER */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100/80 min-h-40 flex flex-col justify-center">
              {hoveredTransition ? (
                <div className="space-y-3 animate-in fade-in duration-300 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-bold">Resumen Técnico</span>
                    <span className="font-mono font-bold text-xs bg-purple-100 text-purple-750 px-2 py-0.5 rounded-md border border-purple-200">
                      {hoveredTransition.affinity}% Match
                    </span>
                  </div>
                  <h4 className="font-black text-slate-800 text-xs leading-tight">
                    De {hoveredTransition.fromTitle} <br/>
                    <span className="text-slate-400 font-medium text-xs font-normal">➔</span> {hoveredTransition.toTitle}
                  </h4>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-bold">Brechas de Competencias</p>
                    {hoveredTransition.gaps.length === 0 ? (
                      <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-center font-semibold">
                        ✓ ¡Habilidades cubiertas!
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
                <div className="text-center py-6 text-slate-400 text-xs flex flex-col items-center justify-center gap-2 leading-relaxed">
                  <HelpCircle size={32} className="opacity-20 text-slate-500" />
                  <p className="max-w-xs leading-normal">
                    Pasa el ratón sobre los conectores SVG para analizar brechas de skills, o arrastra las cajas en el lienzo para estructurar tu diagrama.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* PANEL DERECHO: LIENZO GRÁFICO DINÁMICO CON ZOOM Y ARRASTRE */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-xs border border-slate-100/80 flex flex-col">
            
            <div className="mb-4 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                <Map size={18} className="text-blue-600" /> Mapa del Itinerario Local: <strong className="text-blue-700">{selectedBaseRole?.title}</strong>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 animate-pulse">Lienzo Activo</span>
                <span className="text-[10px] font-bold text-slate-400 italic">Tecnología de la Información</span>
              </div>
            </div>

            {/* CONTENEDOR DE LIENZO EDITABLE COMPLETO */}
            <div 
              className="relative w-full h-[580px] overflow-hidden bg-slate-50/20 dark:bg-slate-950/25 rounded-3xl border border-slate-200 shadow-inner select-none cursor-grab active:cursor-grabbing"
              onPointerDown={handleBgPointerDown}
              onPointerMove={handleBgPointerMove}
              onPointerUp={handleBgPointerUp}
            >
              {/* LIENZO TRANSFORMADO (CON ZOOM Y PANEO) */}
              <div 
                className="absolute w-[900px] h-[600px] rounded-3xl"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px)) scale(${zoomScale})`,
                  backgroundImage: 'radial-gradient(#E2E8F0 1.5px, transparent 1.5px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0',
                  pointerEvents: 'auto'
                }}
              >
                {/* SVG PARA TRAZAR LÍNEAS DE CONEXIÓN */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
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

                  {/* Dibujar Conexiones SVG */}
                  {activeConnections.map((c) => {
                    const strokeColor = c.type === 'vertical' ? '#3b82f6' : c.type === 'diagonal' ? '#6366f1' : '#64748b';
                    const markerId = `url(#arrow-${c.type})`;

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
                          strokeWidth={hoveredTransition?.toId === c.toId ? "4.5" : "2.5"}
                          strokeDasharray={c.type === 'lateral' ? "5,5" : "none"}
                          markerEnd={markerId}
                          className="transition-all duration-150"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* PÍLDORAS FLOTANTES DE AFINIDAD */}
                {activeConnections.map((c) => {
                  const midX = (c.x1 + c.x2) / 2;
                  const midY = (c.y1 + c.y2) / 2;

                  let pillBg = 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-350 dark:border-slate-700';
                  if (c.type === 'vertical') {
                    pillBg = 'bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                  } else if (c.type === 'diagonal') {
                    pillBg = 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-850 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
                  }

                  const isHovered = hoveredTransition?.toId === c.toId;

                  return (
                    <div
                      key={`pill-${c.fromId}-${c.toId}`}
                      onMouseEnter={() => setHoveredTransition(c)}
                      onMouseLeave={() => setHoveredTransition(null)}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => {
                        setActiveTab('requisitos');
                        setSelectedDestRoleId(c.toId);
                      }}
                      className={clsx(
                        "absolute -translate-x-1/2 -translate-y-1/2 z-20 px-2 py-0.5 rounded-md border text-[9px] font-black font-mono shadow-xs transition-all cursor-pointer pointer-events-auto",
                        pillBg,
                        isHovered ? "scale-115 ring-2 ring-purple-400" : ""
                      )}
                      style={{ left: `${midX}px`, top: `${midY}px` }}
                      title="Haz clic para configurar sus requisitos de destino"
                    >
                      {c.affinity}%
                    </div>
                  );
                })}

                {/* RENDERIZADO DE CAJAS */}
                {/* 1. Caja de Rol Base (LOCKED - CLICKABLE TO VIEW LEVELS) */}
                {selectedBaseRole && (() => {
                  const pos = getRolePosition(selectedBaseRoleId);
                  return (
                    <div
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => setIsBaseRoleLevelsModalOpen(true)}
                      className="role-card absolute w-[220px] h-[90px] -translate-x-1/2 -translate-y-1/2 p-3 rounded-2xl border border-emerald-300 dark:border-emerald-500/80 shadow-md ring-2 ring-emerald-100 dark:ring-emerald-900/30 bg-emerald-50/95 dark:bg-emerald-950/40 dark:backdrop-blur-md text-left select-none z-30 cursor-pointer hover:scale-102 hover:shadow-lg transition-all"
                      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                      title="Haz clic para explorar los niveles, habilidades y criterios requeridos de este rol"
                    >
                      <div className="flex justify-between items-start min-w-0">
                        <h4 className="font-extrabold text-[11px] leading-tight line-clamp-2 pr-2 text-emerald-950 dark:text-emerald-350">
                          {selectedBaseRole.title}
                        </h4>
                        <span className="text-[8px] font-extrabold px-1.5 py-0.2 bg-[#007A33] text-white border border-emerald-600 rounded uppercase tracking-wider scale-90 shrink-0">
                          Rol Base
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-1 border-t border-emerald-100 dark:border-emerald-900/30 pt-1">
                        {baseRoleLevels.map(lvl => (
                          <span key={lvl.id} className="text-[7px] font-black px-1 py-0.2 bg-emerald-100/80 dark:bg-emerald-900/40 border border-emerald-250 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 rounded uppercase tracking-wider scale-90 origin-left shrink-0">
                            {lvl.level}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 px-1.5 py-0.2 rounded-md">
                          {selectedBaseRole.family.split(' ')[0]}
                        </span>
                        <span className="text-[8px] font-extrabold text-emerald-600 dark:text-emerald-450 font-mono animate-pulse">
                          EXPLORAR ➔
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Cajas de Roles Destinos (ARRASTRABLES) */}
                {activeConnections.map((conn, index) => {
                  const roleObj = allAvailableRoles.find(r => r.id === conn.toId);
                  if (!roleObj) return null;

                  const pos = getRolePosition(conn.toId);
                  const isDragging = dragState?.roleId === conn.toId;

                  let borderStyle = "border-slate-200 bg-white dark:border-slate-750 dark:bg-slate-900/40 dark:backdrop-blur-md";
                  if (conn.type === 'vertical') {
                    borderStyle = "border-blue-300 bg-blue-50/30 dark:border-blue-500/80 dark:bg-blue-950/40 dark:backdrop-blur-md";
                  } else if (conn.type === 'diagonal') {
                    borderStyle = "border-indigo-300 bg-indigo-50/30 dark:border-indigo-500/80 dark:bg-indigo-950/40 dark:backdrop-blur-md";
                  } else {
                    borderStyle = "border-slate-350 bg-slate-50 dark:border-slate-750 dark:bg-slate-900/40 dark:backdrop-blur-md";
                  }

                  return (
                    <div
                      key={`card-${conn.toId}`}
                      className={clsx(
                        "absolute w-[220px] h-[78px] -translate-x-1/2 -translate-y-1/2 p-3 rounded-2xl border transition-shadow shadow-xs flex flex-col justify-between cursor-move text-left select-none group/node z-20",
                        isDragging ? "border-blue-500 shadow-lg scale-102 bg-blue-50/90 dark:bg-blue-950/80" : borderStyle
                      )}
                      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                      onPointerDown={(e) => handleNodePointerDown(e, conn.toId)}
                      onPointerMove={handleNodePointerMove}
                      onPointerUp={handleNodePointerUp}
                    >
                      {/* Botón de Eliminación Inline */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTransition(conn.toId);
                        }}
                        className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all border border-white z-40 scale-0 group-hover/node:scale-100"
                        title="Eliminar de la ruta"
                      >
                        <Trash2 size={12} />
                      </button>

                      <div className="flex justify-between items-start min-w-0">
                        <h4 className="font-extrabold text-[11px] leading-tight line-clamp-2 pr-2 text-slate-800 dark:text-slate-100">
                          {roleObj.title}
                        </h4>
                        <span className={clsx(
                          "text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider scale-90 shrink-0",
                          conn.type === 'vertical' ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" : conn.type === 'diagonal' ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300" : "bg-slate-200 text-slate-700 dark:bg-slate-800/40 dark:text-slate-350"
                        )}>
                          {conn.type === 'vertical' ? 'Vertical' : conn.type === 'diagonal' ? 'Diagonal' : 'Lateral'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[9px] font-bold text-slate-450 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 px-1.5 py-0.2 rounded-md">
                          {roleObj.family.split(' ')[0]}
                        </span>
                        <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 font-mono">
                          {conn.toId.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* LEYENDA DEL LIENZO FLOTANTE */}
              <div className="absolute top-4 left-4 z-30 pointer-events-auto">
                {!isLegendOpen ? (
                  <button
                    onClick={() => setIsLegendOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-[10px] font-black text-slate-650 dark:text-slate-350 hover:text-blue-600 dark:hover:text-blue-450 hover:border-blue-500 shadow-md cursor-pointer transition-all active:scale-95"
                    title="Mostrar leyenda de distribución"
                  >
                    <Info size={12} className="text-blue-600 dark:text-blue-400" />
                    <span>Leyenda</span>
                  </button>
                ) : (
                  <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-250 dark:border-slate-850 p-3.5 rounded-2xl shadow-xl text-left text-[10px] space-y-2 max-w-[210px] animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <span className="font-black text-slate-850 dark:text-slate-200 flex items-center gap-1">
                        <Info size={11} className="text-blue-600 dark:text-blue-400" /> Distribución Relativa
                      </span>
                      <button
                        onClick={() => setIsLegendOpen(false)}
                        className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Ocultar leyenda"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-slate-500 dark:text-slate-450 leading-normal">✓ <strong>Rol Base</strong>: Fijo abajo a la izquierda.</p>
                      <p className="text-slate-500 dark:text-slate-450 leading-normal">✓ <strong>Vertical</strong>: Arriba del rol base.</p>
                      <p className="text-slate-500 dark:text-slate-450 leading-normal">✓ <strong>Lateral</strong>: A la derecha al lado.</p>
                      <p className="text-slate-500 dark:text-slate-450 leading-normal">✓ <strong>Diagonal</strong>: En diagonal arriba-derecha.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* PANEL DE CONTROL DE ZOOM FLOTANTE */}
              <div className="absolute bottom-4 right-4 z-30 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-md flex items-center gap-2 pointer-events-auto">
                <button 
                  onClick={handleZoomOut} 
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Zoom Out (-)"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-[10px] font-extrabold font-mono text-slate-700 dark:text-slate-300 min-w-[35px] text-center">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button 
                  onClick={handleZoomIn} 
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Zoom In (+)"
                >
                  <ZoomIn size={14} />
                </button>
                <span className="w-px h-4 bg-slate-200"></span>
                <button 
                  onClick={handleResetZoom} 
                  className="p-1.5 text-slate-500 hover:text-slate-850 hover:bg-slate-100 rounded-lg cursor-pointer text-[10px] font-bold"
                  title="Restaurar Vista Original"
                >
                  <Maximize2 size={13} />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO DE LA PESTAÑA 2: CONFIGURACIÓN DE POLÍTICAS Y REQUISITOS (CENTRADOS EN DESTINO) */}
      {activeTab === 'requisitos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* COLUMNA 1: LISTADO Y BUSCADOR DE ROLES DE DESTINO */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-xs border border-slate-100/80 space-y-4 flex flex-col h-[700px]">
            
            <div className="space-y-1.5 text-left shrink-0">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                <Sliders size={18} className="text-blue-600" /> Roles del Catálogo
              </h3>
              <p className="text-slate-450 text-[11px]">Busca cualquier rol para configurar sus políticas corporativas de progresión como destino.</p>
            </div>

            {/* Barra de Búsqueda */}
            <div className="relative shrink-0 text-left">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Filtrar por título de rol..."
                value={roleSearchQuery}
                onChange={(e) => setRoleSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-none bg-slate-50/50"
              />
            </div>

            {/* Listado de Roles */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar text-left">
              {filteredRoles.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <AlertCircle size={24} className="mx-auto mb-2 opacity-30 text-slate-500" />
                  <p>No se encontraron roles con ese nombre.</p>
                </div>
              ) : (
                filteredRoles.map(role => {
                  const isSelected = selectedDestRoleId === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedDestRoleId(role.id)}
                      className={clsx(
                        "w-full p-3.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer block group flex flex-col justify-between",
                        isSelected 
                          ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-50" 
                          : "border-slate-100 bg-white hover:border-slate-250 hover:bg-slate-50/30"
                      )}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-800 text-[12px] truncate group-hover:text-blue-700 transition-colors leading-tight">{role.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{role.family}</p>
                        </div>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-650 rounded-full shrink-0">
                          {role.level}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* COLUMNA 2 Y 3: EDITOR INLINE SPLIT-SCREEN (TAB 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {selectedDestRoleId ? (() => {
              const destRole = allAvailableRoles.find(r => r.id === selectedDestRoleId);
              if (!destRole) return null;

              return (
                <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100/80 space-y-6 text-left h-[700px] flex flex-col overflow-y-auto custom-scrollbar">
                  
                  {/* Cabecera del Editor Inline */}
                  <div className="space-y-1.5 border-b border-slate-100 pb-4">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-100 rounded-full text-[9px] font-black uppercase tracking-wider">
                      Perfil de Requisitos de Destino
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight flex items-center gap-1.5 flex-wrap">
                      <span>Políticas de Progreso hacia:</span>
                      <span className="text-blue-600">{destRole.title}</span>
                    </h3>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Configura de forma centralizada las exigencias requeridas para acceder a este rol. Cualquier conexión de carrera que apunte a este rol heredará este perfil.
                    </p>
                  </div>

                  {/* Formulario en Grid Dividido */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-start">
                    
                    {/* Bloque Izquierdo: Criterios Organizativos Generales */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <h4 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest flex items-center gap-1 font-bold">
                          <Settings size={12} /> Criterios del Rol
                        </h4>
                      </div>

                      <form onSubmit={handleSaveCriteria} className="space-y-4 text-left">
                        
                        {/* Antigüedad en la entidad */}
                        <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={criteriaForm.enableMinYearsInEntity}
                              onChange={(e) => setCriteriaForm(prev => ({ ...prev, enableMinYearsInEntity: e.target.checked }))}
                              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 border-slate-350 cursor-pointer"
                            />
                            <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wider block font-bold">
                              Antigüedad en Cajamar (Años)
                            </span>
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            disabled={!criteriaForm.enableMinYearsInEntity}
                            value={criteriaForm.minYearsInEntity}
                            onChange={(e) => setCriteriaForm(prev => ({ ...prev, minYearsInEntity: Number(e.target.value) }))}
                            className={clsx(
                              "w-full px-3 py-1.5 border rounded-xl text-xs focus:border-blue-500 focus:outline-none font-semibold transition-all duration-155",
                              criteriaForm.enableMinYearsInEntity ? "bg-white text-slate-750 border-slate-200" : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            )}
                          />
                        </div>

                        {/* Experiencia total */}
                        <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={criteriaForm.enableMinYearsExperience}
                              onChange={(e) => setCriteriaForm(prev => ({ ...prev, enableMinYearsExperience: e.target.checked }))}
                              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 border-slate-350 cursor-pointer"
                            />
                            <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wider block font-bold">
                              Experiencia laboral general (Años)
                            </span>
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            disabled={!criteriaForm.enableMinYearsExperience}
                            value={criteriaForm.minYearsExperience}
                            onChange={(e) => setCriteriaForm(prev => ({ ...prev, minYearsExperience: Number(e.target.value) }))}
                            className={clsx(
                              "w-full px-3 py-1.5 border rounded-xl text-xs focus:border-blue-500 focus:outline-none font-semibold transition-all duration-155",
                              criteriaForm.enableMinYearsExperience ? "bg-white text-slate-750 border-slate-200" : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            )}
                          />
                        </div>

                        {/* Desempeño */}
                        <div className="space-y-2 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={criteriaForm.enablePerformance}
                              onChange={(e) => setCriteriaForm(prev => ({ ...prev, enablePerformance: e.target.checked }))}
                              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 border-slate-350 cursor-pointer"
                            />
                            <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wider block font-bold">
                              Calificación de Desempeño Mínimo
                            </span>
                          </label>
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <select
                                disabled={!criteriaForm.enablePerformance}
                                value={criteriaForm.reqPerformanceLevel}
                                onChange={(e) => setCriteriaForm(prev => ({ ...prev, reqPerformanceLevel: e.target.value }))}
                                className="w-full px-2 py-1.5 border bg-white rounded-xl text-[11px] focus:border-blue-500 focus:outline-none font-semibold cursor-pointer"
                              >
                                <option value="Medio">Medio</option>
                                <option value="Alto">Alto</option>
                                <option value="Excelente">Excelente</option>
                              </select>
                            </div>
                            <div>
                              <input
                                type="number"
                                min="1"
                                max="5"
                                placeholder="Años"
                                disabled={!criteriaForm.enablePerformance}
                                value={criteriaForm.reqPerformanceYears}
                                onChange={(e) => setCriteriaForm(prev => ({ ...prev, reqPerformanceYears: Number(e.target.value) }))}
                                className="w-full px-2 py-1.5 border rounded-xl text-[11px] focus:border-blue-500 focus:outline-none font-semibold"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Potencial */}
                        <div className="space-y-1.5 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={criteriaForm.enablePotential}
                              onChange={(e) => setCriteriaForm(prev => ({ ...prev, enablePotential: e.target.checked }))}
                              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 border-slate-350 cursor-pointer"
                            />
                            <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wider block font-bold">
                              Calificación de Potencial
                            </span>
                          </label>
                          <select
                            disabled={!criteriaForm.enablePotential}
                            value={criteriaForm.reqPotentialLevel}
                            onChange={(e) => setCriteriaForm(prev => ({ ...prev, reqPotentialLevel: e.target.value }))}
                            className="w-full px-3 py-1.5 border bg-white rounded-xl text-xs focus:border-blue-500 focus:outline-none font-semibold cursor-pointer"
                          >
                            <option value="Bajo">Bajo</option>
                            <option value="Medio">Medio</option>
                            <option value="Alto Potencial">Alto Potencial</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer font-semibold font-bold"
                        >
                          <Check size={14} /> Guardar Perfil de Destino
                        </button>
                      </form>
                    </div>

                    {/* Bloque Derecho: Roles Previos (NUEVO), Flexibilidad e Impacto de Prueba */}
                    <div className="space-y-5">
                      
                      {/* ROLES PREVIOS REQUERIDOS O RECOMENDADOS */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <h4 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest flex items-center gap-1 font-bold">
                            <BookOpen size={12} /> Roles Previos Requeridos
                          </h4>
                        </div>

                        <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={criteriaForm.enablePreviousRoles}
                              onChange={(e) => setCriteriaForm(prev => ({ ...prev, enablePreviousRoles: e.target.checked }))}
                              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 border-slate-350 cursor-pointer"
                            />
                            <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wider block font-bold">
                              Exigir Trayectoria de Roles Previos
                            </span>
                          </label>

                          {criteriaForm.enablePreviousRoles && (
                            <div className="space-y-3 text-left">
                              
                              {/* Listado de Roles Previos */}
                              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                                {criteriaForm.previousRoles.length === 0 ? (
                                  <p className="text-[9px] text-slate-400 italic">No se han definido roles previos para este destino.</p>
                                ) : (
                                  criteriaForm.previousRoles.map(prev => {
                                    const matchingObj = allAvailableRoles.find(r => r.id === prev.roleId);
                                    const title = matchingObj ? matchingObj.title : prev.roleId;
                                    const isRequired = prev.type === 'required';
                                    return (
                                      <div key={prev.roleId} className="flex justify-between items-center text-[9px] p-2 bg-white border border-slate-150 rounded-xl">
                                        <div className="min-w-0 pr-2">
                                          <div className="flex items-center gap-1 flex-wrap">
                                            <span className={clsx(
                                              "text-[7px] font-extrabold px-1 rounded uppercase tracking-wider leading-none",
                                              isRequired ? "bg-rose-100 text-rose-700 border border-rose-150" : "bg-amber-100 text-amber-800 border border-amber-200"
                                            )}>
                                              {isRequired ? 'Requerido' : 'Recomendado'}
                                            </span>
                                            <span className="font-bold text-slate-800 truncate max-w-[120px]">{title}</span>
                                          </div>
                                          <p className="text-[8px] text-slate-400 mt-0.5">Permanencia: <strong>{prev.minYears} años</strong></p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleDeletePrevRole(prev.roleId)}
                                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer shrink-0"
                                          title="Eliminar requisito previo"
                                        >
                                          <X size={12} />
                                        </button>
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              {/* Formulario Rápido Inline para Añadir Rol Previo */}
                              <form onSubmit={handleAddPrevRole} className="p-2.5 bg-white border border-slate-200 rounded-2xl space-y-2 text-left">
                                <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest leading-none">Añadir Requisito de Rol</p>
                                
                                <div className="space-y-1">
                                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Rol Previo</label>
                                  <select
                                    value={newPrevRoleForm.roleId}
                                    onChange={(e) => setNewPrevRoleForm(prev => ({ ...prev, roleId: e.target.value }))}
                                    className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded-xl text-[10px] text-slate-700 focus:outline-none font-semibold cursor-pointer"
                                  >
                                    <option value="">Selecciona rol...</option>
                                    {prevRoleOptions.map(r => (
                                      <option key={r.id} value={r.id}>{r.title} ({r.level})</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Tipo Relación</label>
                                    <select
                                      value={newPrevRoleForm.type}
                                      onChange={(e) => setNewPrevRoleForm(prev => ({ ...prev, type: e.target.value }))}
                                      className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded-xl text-[10px] text-slate-700 focus:outline-none font-semibold cursor-pointer"
                                    >
                                      <option value="required">Requerido</option>
                                      <option value="recommended">Recomendado</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Mínimo Años</label>
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0.5"
                                      value={newPrevRoleForm.minYears}
                                      onChange={(e) => setNewPrevRoleForm(prev => ({ ...prev, minYears: Number(e.target.value) }))}
                                      className="w-full px-2 py-1 border border-slate-200 rounded-xl text-[10px] focus:outline-none font-semibold"
                                    />
                                  </div>
                                </div>

                                <button
                                  type="submit"
                                  disabled={!newPrevRoleForm.roleId}
                                  className="w-full py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 disabled:bg-slate-100 disabled:text-slate-400 rounded-xl font-bold text-[9px] transition-all flex items-center justify-center gap-0.5 cursor-pointer font-bold border border-blue-150"
                                >
                                  <Plus size={11} /> Vincular Rol
                                </button>
                              </form>

                            </div>
                          )}

                        </div>
                      </div>

                      {/* Acreditaciones de Flexibilidad */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <h4 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest flex items-center gap-1 font-bold">
                            <Award size={12} /> Flexibilidad y Convalidación
                          </h4>
                        </div>

                        <div className="space-y-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={criteriaForm.enableMarketConditions}
                              onChange={(e) => setCriteriaForm(prev => ({ ...prev, enableMarketConditions: e.target.checked }))}
                              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 border-slate-350 cursor-pointer"
                            />
                            <span className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wider block font-bold">
                              Permitir Equivalencias de Mercado
                            </span>
                          </label>

                          {criteriaForm.enableMarketConditions && (
                            <div className="space-y-2 pt-1 text-left">
                              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                                {criteriaForm.acceptedMarketConditions?.length === 0 ? (
                                  <p className="text-[9px] text-slate-400 italic py-1">Ninguna acreditación homologada.</p>
                                ) : (
                                  criteriaForm.acceptedMarketConditions.map(condId => {
                                    const match = ACCREDITATIONS_CATALOG.find(a => a.id === condId);
                                    return (
                                      <span key={condId} className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-150 rounded-full shrink-0 font-bold">
                                        <span className="max-w-[120px] truncate">{match ? match.label.split(' (')[0] : condId}</span>
                                        <button
                                          type="button"
                                          onClick={() => toggleMarketCondition(condId)}
                                          className="hover:text-rose-600 focus:outline-none font-black text-[10px] ml-0.5 cursor-pointer"
                                        >
                                          ×
                                        </button>
                                      </span>
                                    );
                                  })
                                )}
                              </div>

                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) toggleMarketCondition(e.target.value);
                                }}
                                className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-xl text-xs text-slate-650 focus:border-blue-500 focus:outline-none font-semibold cursor-pointer"
                              >
                                <option value="">Añadir certificado homólogo...</option>
                                {ACCREDITATIONS_CATALOG.filter(a => !criteriaForm.acceptedMarketConditions?.includes(a.id)).map(opt => (
                                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Simulación de Impacto en vivo con Ana García */}
                      {previewCompliance && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                            <h4 className="text-[10px] font-extrabold text-[#007A33] uppercase tracking-widest flex items-center gap-1 font-bold">
                              <Eye size={12} /> Impacto de Políticas (Ana G.)
                            </h4>
                          </div>

                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                            
                            {/* Roles Previos Compliance */}
                            {criteriaForm.enablePreviousRoles && previewCompliance.previousRolesCheck.map(chk => {
                              const matchingRoleObj = allAvailableRoles.find(r => r.id === chk.roleId);
                              const title = matchingRoleObj ? matchingRoleObj.title : chk.roleId;
                              const isRequired = chk.type === 'required';
                              return (
                                <div key={chk.roleId} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                                  <div className="shrink-0 mt-0.5">
                                    {chk.satisfies ? (
                                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black">✓</span>
                                    ) : isRequired ? (
                                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-[9px] font-black">✗</span>
                                    ) : (
                                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[9px] font-black">⚠️</span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-left">
                                    <p className="font-bold text-slate-700">Rol previo {isRequired ? 'Requerido' : 'Recomendado'}: {title}</p>
                                    <p className="text-slate-450 mt-0.5">Ana: <strong>{chk.actualYears} años</strong> / Req: <strong>{chk.minYears} años</strong></p>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Antigüedad en Entidad */}
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                              <div className="shrink-0 mt-0.5">
                                {!criteriaForm.enableMinYearsInEntity ? (
                                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-[9px] font-black">✓</span>
                                ) : previewCompliance.satisfiesEntityYears ? (
                                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black">✓</span>
                                ) : (
                                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[9px] font-black">⚠️</span>
                                )}
                              </div>
                              <div className="text-[10px] text-left">
                                <p className="font-bold text-slate-700">Antigüedad Cajamar</p>
                                {criteriaForm.enableMinYearsInEntity ? (
                                  <p className="text-slate-450 mt-0.5">Ana: <strong>{employeeDossier.yearsInEntity} años</strong> / Req: <strong>{criteriaForm.minYearsInEntity} años</strong></p>
                                ) : (
                                  <p className="text-slate-400 mt-0.5">No exigido.</p>
                                )}
                              </div>
                            </div>

                            {/* Desempeño */}
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                              <div className="shrink-0 mt-0.5">
                                {!criteriaForm.enablePerformance ? (
                                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-[9px] font-black">✓</span>
                                ) : previewCompliance.satisfiesPerformance ? (
                                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black">✓</span>
                                ) : (
                                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[9px] font-black">⚠️</span>
                                )}
                              </div>
                              <div className="text-[10px] text-left">
                                <p className="font-bold text-slate-700">Desempeño Anual</p>
                                {criteriaForm.enablePerformance ? (
                                  <p className="text-slate-450 mt-0.5">Mínimo: <strong>{criteriaForm.reqPerformanceLevel}</strong> por <strong>{criteriaForm.reqPerformanceYears} años</strong></p>
                                ) : (
                                  <p className="text-slate-400 mt-0.5">No exigido.</p>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              );
            })() : (
              <div className="bg-white rounded-3xl p-12 shadow-xs border border-slate-100/80 text-center flex flex-col items-center justify-center h-[700px] text-slate-400 gap-3">
                <Sliders size={48} className="opacity-15 text-slate-500" />
                <h4 className="font-bold text-slate-750 text-sm">Configurador de Políticas y Requisitos</h4>
                <p className="max-w-xs text-xs leading-relaxed">
                  Selecciona un rol del catálogo de la izquierda para parametrizar sus criterios y umbrales correspondientes.
                </p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* MODAL: COMPARATIVA DE NIVELES DEL ROL BASE */}
      {isBaseRoleLevelsModalOpen && selectedBaseRole && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-150 animate-in zoom-in-95 duration-200 flex flex-col p-6 space-y-6 relative text-left">
            
            <button 
              onClick={() => setIsBaseRoleLevelsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
              title="Cerrar comparativa"
            >
              <Plus className="rotate-45" size={20} />
            </button>

            <div className="space-y-1.5 border-b border-slate-100 pb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-full text-[9px] font-black uppercase tracking-wider">
                Estructura Transversal de Niveles
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                Roles y Niveles para: <span className="text-emerald-700">{selectedBaseRole.title}</span>
              </h3>
              <p className="text-slate-400 text-xs">
                Visualización detallada de las habilidades de éxito requeridas y los criterios corporativos de progreso para cada nivel profesional definido en Cajamar.
              </p>
            </div>

            {/* Grid de niveles side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto pr-1 custom-scrollbar">
              {baseRoleLevels.map(lvlRole => {
                const criteria = getCriteriaForDestination(lvlRole.id);
                const hasSkills = lvlRole.requiredSkills && lvlRole.requiredSkills.length > 0;
                
                return (
                  <div key={lvlRole.id} className="bg-slate-50/50 rounded-2xl border border-slate-150 p-5 space-y-5 flex flex-col relative hover:border-emerald-300 transition-colors bg-slate-50/20 backdrop-blur-2xs shadow-2xs">
                    
                    {/* Cabecera del Nivel */}
                    <div className="space-y-1 text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-50 text-[#007A33] border border-emerald-100 rounded-full uppercase tracking-wider">
                          Nivel: {lvlRole.level}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 font-bold">{lvlRole.id.toUpperCase()}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm mt-1 leading-tight">{lvlRole.title}</h4>
                      <p className="text-[10px] text-slate-450 leading-relaxed font-medium mt-1">{lvlRole.description}</p>
                    </div>

                    {/* Habilidades Requeridas */}
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <h5 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest flex items-center gap-1 font-bold">
                        <Award size={12} /> Habilidades Requeridas
                      </h5>
                      {hasSkills ? (
                        <div className="flex flex-col gap-1.5">
                          {lvlRole.requiredSkills.map(sk => (
                            <div key={sk.name} className="flex justify-between items-center text-[11px] p-2 bg-white border border-slate-150 rounded-xl">
                              <span className="font-semibold text-slate-750">{sk.name}</span>
                              <div className="flex items-center gap-1">
                                <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded text-[9px] font-bold border border-emerald-150">Lv.{sk.level}</span>
                                <span className={clsx(
                                  "px-1 py-0.2 rounded text-[8px] font-bold border",
                                  sk.priority === 'Crítica' ? "bg-rose-50 text-rose-700 border-rose-100" :
                                  sk.priority === 'Primaria' ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-slate-50 text-slate-600 border-slate-200"
                                )}>
                                  {sk.priority}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic text-left">Sin habilidades configuradas para este nivel.</p>
                      )}
                    </div>

                    {/* Criterios de Progreso */}
                    <div className="space-y-2.5 border-t border-slate-100 pt-3 flex-1">
                      <h5 className="text-[10px] font-extrabold text-[#007A33] uppercase tracking-widest flex items-center gap-1 font-bold">
                        <Sliders size={12} /> Criterios de Entrada
                      </h5>
                      
                      <div className="space-y-1.5 text-[10px] text-left">
                        {/* Antigüedad en Entidad */}
                        {criteria.enableMinYearsInEntity ? (
                          <div className="flex justify-between p-1.5 bg-white border border-slate-100 rounded-lg">
                            <span className="text-slate-500 font-semibold">Antigüedad Cajamar:</span>
                            <strong className="text-slate-800">{criteria.minYearsInEntity} años</strong>
                          </div>
                        ) : null}

                        {/* Experiencia total */}
                        {criteria.enableMinYearsExperience ? (
                          <div className="flex justify-between p-1.5 bg-white border border-slate-100 rounded-lg">
                            <span className="text-slate-500 font-semibold">Experiencia general:</span>
                            <strong className="text-slate-800">{criteria.minYearsExperience} años</strong>
                          </div>
                        ) : null}

                        {/* Desempeño */}
                        {criteria.enablePerformance ? (
                          <div className="flex justify-between p-1.5 bg-white border border-slate-100 rounded-lg">
                            <span className="text-slate-500 font-semibold">Desempeño Mínimo:</span>
                            <strong className="text-slate-800">{criteria.reqPerformanceLevel} ({criteria.reqPerformanceYears}a)</strong>
                          </div>
                        ) : null}

                        {/* Potencial */}
                        {criteria.enablePotential ? (
                          <div className="flex justify-between p-1.5 bg-white border border-slate-100 rounded-lg">
                            <span className="text-slate-500 font-semibold">Potencial:</span>
                            <strong className="text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">{criteria.reqPotentialLevel}</strong>
                          </div>
                        ) : null}

                        {/* Roles Previos */}
                        {criteria.enablePreviousRoles && criteria.previousRoles.length > 0 ? (
                          <div className="space-y-1 pt-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Trayectoria Previa:</span>
                            <div className="space-y-1">
                              {criteria.previousRoles.map(pr => {
                                const matchedRole = allAvailableRoles.find(r => r.id === pr.roleId);
                                return (
                                  <div key={pr.roleId} className="flex justify-between items-center p-1.5 bg-white border border-slate-100 rounded-lg text-[9px]">
                                    <span className="font-semibold text-slate-650 truncate max-w-[120px]" title={matchedRole?.title || pr.roleId}>
                                      {matchedRole?.title || pr.roleId}
                                    </span>
                                    <span className={clsx(
                                      "px-1 py-0.2 rounded text-[7.5px] font-black font-mono shrink-0 uppercase tracking-wider",
                                      pr.type === 'required' ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-amber-50 text-amber-800 border-amber-200"
                                    )}>
                                      {pr.minYears}a • {pr.type === 'required' ? 'REQ' : 'REC'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}

                        {/* Acreditaciones */}
                        {criteria.enableMarketConditions && criteria.acceptedMarketConditions.length > 0 ? (
                          <div className="space-y-1 pt-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Homologaciones:</span>
                            <div className="flex flex-wrap gap-1">
                              {criteria.acceptedMarketConditions.map(condId => {
                                const match = ACCREDITATIONS_CATALOG.find(a => a.id === condId);
                                return (
                                  <span key={condId} className="inline-block text-[8px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-150 rounded" title={match?.label || condId}>
                                    {condId}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}

                        {/* Si no se exigen criterios */}
                        {!criteria.enableMinYearsInEntity && !criteria.enableMinYearsExperience && !criteria.enablePerformance && !criteria.enablePotential && (!criteria.enablePreviousRoles || criteria.previousRoles.length === 0) && (!criteria.enableMarketConditions || criteria.acceptedMarketConditions.length === 0) && (
                          <p className="text-[10px] text-slate-400 italic leading-relaxed text-left">Este nivel no requiere criterios adicionales de entrada.</p>
                        )}

                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
