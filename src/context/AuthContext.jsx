import React, { createContext, useContext, useState } from 'react';
import { mockUsers as initialUsers, mockBadgesCatalog as initialBadges, mockRoles } from '../data/mockData';

const AuthContext = createContext();

const initialOrgUnits = [
  { id: 'org-1', name: 'Dirección General de Negocio', type: 'Dirección General', parentId: null },
  { id: 'org-2', name: 'Subdirección General de Tecnología', type: 'Subdirección General', parentId: 'org-1' },
  // Divisiones (Nivel 3)
  { id: 'org-div-1', name: 'Dirección de División de Ingeniería de Sistemas', type: 'Dirección de División', parentId: 'org-2' },
  { id: 'org-div-2', name: 'Dirección de División de Canales Digitales', type: 'Dirección de División', parentId: 'org-2' },
  // Áreas (Nivel 4)
  { id: 'org-3', name: 'Dirección de Área de Desarrollo Core', type: 'Dirección de Área', parentId: 'org-div-1' },
  { id: 'org-3-2', name: 'Dirección de Área de Innovación y Frontend', type: 'Dirección de Área', parentId: 'org-div-2' },
  // Oficinas (Nivel 5)
  { id: 'org-4', name: 'Oficina de Soluciones de Canales', type: 'Oficina', parentId: 'org-3-2' },
  { id: 'org-5', name: 'Oficina de Core Bancario', type: 'Oficina', parentId: 'org-3' },
  
  // Personas y Cultura
  { id: 'org-6', name: 'Dirección General de Personas y Cultura', type: 'Dirección General', parentId: null },
  { id: 'org-7', name: 'Subdirección de Gestión de Talento', type: 'Subdirección General', parentId: 'org-6' },
  // Divisiones
  { id: 'org-div-3', name: 'Dirección de División de Cultura y Aprendizaje', type: 'Dirección de División', parentId: 'org-7' },
  // Áreas
  { id: 'org-8', name: 'Dirección de Área de Selección y Desarrollo', type: 'Dirección de Área', parentId: 'org-div-3' },
  // Oficinas
  { id: 'org-9', name: 'Oficina de Planificación de Plantilla', type: 'Oficina', parentId: 'org-8' }
];

const mapInitialUsers = (rawUsers) => {
  return rawUsers.map(u => {
    if (u.id === 1) {
      return { ...u, orgUnitId: 'org-4', level: 'Junior' };
    }
    if (u.id === 2) {
      return { ...u, orgUnitId: 'org-3', level: 'Lead' };
    }
    if (u.id === 3) {
      return { ...u, orgUnitId: 'org-8', level: 'Senior' };
    }
    if (u.id === 4) {
      return { ...u, orgUnitId: 'org-4', level: 'Junior' };
    }
    if (u.id === 5) {
      return { ...u, orgUnitId: 'org-5', level: 'Senior' };
    }
    if (u.id === 6) {
      return { ...u, orgUnitId: 'org-3', level: 'Senior' };
    }
    if (u.id === 7) {
      return { ...u, orgUnitId: 'org-div-1', level: 'Lead' };
    }
    if (u.id === 8) {
      return { ...u, orgUnitId: 'org-9', level: 'Junior' };
    }
    if (u.id === 9) {
      return { ...u, orgUnitId: 'org-div-2', level: 'Lead' };
    }
    if (u.id === 10) {
      return { ...u, orgUnitId: 'org-4', level: 'Senior' };
    }
    if (u.id === 11) {
      return { ...u, orgUnitId: 'org-4', level: 'Junior' };
    }
    return { ...u, orgUnitId: null, level: 'Junior' };
  });
};

const initialReviewConfigs = [
  {
    id: "camp-1",
    name: "Campaña Primavera 2026",
    year: 2026,
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    targeting: {
      roleFamily: "Todas",
      roleLevel: "Todas",
      skillFamily: "Todas"
    },
    rules: [
      {
        id: "rule-1",
        name: "Skills Técnicas (Responsable)",
        workflowType: "self_manager",
        minPeers: 2,
        maxPeers: 4,
        managerWeight: 100,
        peerWeight: 0,
        targeting: {
          skillFamily: "Tecnología"
        }
      },
      {
        id: "rule-2",
        name: "Habilidades Blandas Corporativas (360)",
        workflowType: "self_manager_peers",
        minPeers: 2,
        maxPeers: 3,
        managerWeight: 60,
        peerWeight: 40,
        targeting: {
          skillFamily: "Habilidades Blandas"
        }
      }
    ]
  }
];

const initialPeerNominations = [
  {
    id: "nom-1",
    employeeId: 1, // Ana García
    cycleId: "2026-Q2",
    nominatedPeers: [
      { peerId: 4, status: "Approved", suggestedBy: "Employee" }, // Laura Gómez
      { peerId: 5, status: "Approved", suggestedBy: "Employee" }  // Javier Ruiz
    ],
    status: "Confirmed" // Draft, PendingManager, Confirmed
  }
];

const initialPeerReviews = [
  {
    id: "prev-1",
    nominationId: "nom-1",
    evaluatorPeerId: 5, // Javier Ruiz
    skillEvaluations: [
      { skillId: "s1", level: 3 }, // React
      { skillId: "s2", level: 3 }  // Node.js
    ]
  }
];

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => mapInitialUsers(initialUsers));
  const [badgesCatalog, setBadgesCatalog] = useState(initialBadges);
  
  // Estados para Evaluaciones 360 y Peer Reviews
  const [reviewConfigs, setReviewConfigs] = useState(initialReviewConfigs);
  const [peerNominations, setPeerNominations] = useState(initialPeerNominations);
  const [peerReviews, setPeerReviews] = useState(initialPeerReviews);

  // Estados para Itinerarios de Carrera (Career Paths)
  const [careerPaths, setCareerPaths] = useState([
    {
      fromRoleId: "r1", // Analista Programador
      transitions: [
        { toRoleId: "r2", type: "vertical", horizon: "short", affinityOverride: 64 }, // Senior Developer
        { toRoleId: "r5", type: "lateral", horizon: "short", affinityOverride: 58 },  // Agile Coach
        { toRoleId: "r3", type: "diagonal", horizon: "long", affinityOverride: 45 }   // Tech Lead
      ]
    },
    {
      fromRoleId: "r2", // Senior Developer
      transitions: [
        { toRoleId: "r3", type: "vertical", horizon: "short", affinityOverride: 70 }, // Tech Lead
        { toRoleId: "r4", type: "diagonal", horizon: "long", affinityOverride: 55 }   // Arquitecto de Software
      ]
    },
    {
      fromRoleId: "r5", // Agile Coach
      transitions: [
        { toRoleId: "r3", type: "lateral", horizon: "long", affinityOverride: 50 } // Tech Lead
      ]
    }
  ]);

  // Estado para Criterios de Progreso de Carrera (Progression Criteria - Indexados por Rol de Destino)
  const [progressionCriteria, setProgressionCriteria] = useState([
    {
      toRoleId: "r2",   // Senior Developer
      minYearsInEntity: 2.0,
      minYearsExperience: 3.0,
      reqPerformanceYears: 2,
      reqPerformanceLevel: "Alto",
      reqPotentialYears: 1,
      reqPotentialLevel: "Alto Potencial",
      acceptedMarketConditions: ["AWS", "EnglishB2", "ScrumMaster"],
      previousRoles: [
        { roleId: "r1", type: "required", minYears: 1.0 } // Requiere Analista Programador por 1.0 años
      ]
    },
    {
      toRoleId: "r6",   // Analista Programador - Senior
      minYearsInEntity: 2.0,
      minYearsExperience: 3.0,
      reqPerformanceYears: 2,
      reqPerformanceLevel: "Alto",
      reqPotentialYears: 1,
      reqPotentialLevel: "Alto Potencial",
      acceptedMarketConditions: ["AWS", "EnglishB2", "PythonCert"],
      previousRoles: [
        { roleId: "r1", type: "required", minYears: 1.0 }
      ]
    },
    {
      toRoleId: "r7",   // Analista Programador - Lead
      minYearsInEntity: 3.0,
      minYearsExperience: 4.5,
      reqPerformanceYears: 2,
      reqPerformanceLevel: "Excelente",
      reqPotentialYears: 1,
      reqPotentialLevel: "Alto Potencial",
      acceptedMarketConditions: ["ScrumMaster", "AWS"],
      previousRoles: [
        { roleId: "r6", type: "required", minYears: 1.5 }
      ]
    },
    {
      toRoleId: "r5",   // Agile Coach
      minYearsInEntity: 3.0,
      minYearsExperience: 4.0,
      reqPerformanceYears: 1,
      reqPerformanceLevel: "Alto",
      reqPotentialYears: 1,
      reqPotentialLevel: "Alto Potencial",
      acceptedMarketConditions: ["ScrumMaster", "EnglishB2"],
      previousRoles: [
        { roleId: "r1", type: "recommended", minYears: 2.0 } // Recomienda Analista Programador por 2.0 años
      ]
    }
  ]);

  // Expediente de simulación del empleado para comparar con los umbrales de carrera
  const [employeeDossier, setEmployeeDossier] = useState({
    userId: 1, // Ana García
    yearsInRole: 1.2,
    yearsInEntity: 2.5,
    totalExperienceYears: 4.0,
    performanceHistory: [
      { year: 2024, rating: "Alto" },
      { year: 2025, rating: "Excelente" }
    ],
    potentialAssessment: "Alto Potencial",
    marketCertifications: ["AWS", "EnglishB2"],
  });

  // Inicializamos con Ana (Employee) referenciando el estado en memoria
  const [currentUserProfile, setCurrentUserProfile] = useState('Employee');

  // Maestros globales compartidos
  const [orgUnits, setOrgUnits] = useState(initialOrgUnits);
  const [rolesData, setRolesData] = useState(mockRoles);
  const [levels, setLevels] = useState([
    { id: 'LVL-1', name: 'Junior', description: 'Profesionales en etapa inicial de desarrollo, requieren supervisión y foco en aprender los estándares.' },
    { id: 'LVL-2', name: 'Senior', description: 'Profesionales experimentados, autónomos en tareas complejas y capaces de mentorizar a perfiles junior.' },
    { id: 'LVL-3', name: 'Lead', description: 'Líderes técnicos o de equipo, responsables del diseño, arquitectura y coordinación técnica.' },
    { id: 'LVL-4', name: 'Expert', description: 'Referentes y especialistas de máxima competencia técnica, marcan la estrategia tecnológica global.' }
  ]);
  const [roleFamilies, setRoleFamilies] = useState([
    { id: 'RFAM-1', name: 'Ingeniería de Software', color: 'blue', description: 'Diseño, desarrollo, pruebas y mantenimiento de componentes de software.' },
    { id: 'RFAM-2', name: 'Management Técnico', color: 'indigo', description: 'Liderazgo técnico, gestión de proyectos y excelencia operativa de equipos.' },
    { id: 'RFAM-3', name: 'Arquitectura', color: 'rose', description: 'Definición de estándares de ingeniería, patrones de diseño y estrategia tecnológica global.' },
    { id: 'RFAM-4', name: 'Metodología', color: 'emerald', description: 'Optimización de procesos de entrega de valor, agilidad y mejora continua.' }
  ]);

  const switchUser = (profileType) => {
    setCurrentUserProfile(profileType);
  };

  const currentUser = users.find(u => u.profile === currentUserProfile);

  // MÉTODOS DE MUTACIÓN PARA LA DEMO

  // 1. Empleado se auto-inscribe en un badge
  const enrollBadge = (userId, badgeId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        // Evitar duplicados
        if (u.badges.some(b => b.badgeId === badgeId)) return u;
        return {
          ...u,
          badges: [...u.badges, { badgeId, date: new Date().toISOString().split('T')[0], status: "En progreso" }]
        };
      }
      return u;
    }));
  };

  // 2. Mánager valida un badge
  const validateBadge = (userId, badgeId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          badges: u.badges.map(b => b.badgeId === badgeId ? { ...b, status: "Obtenido", date: new Date().toISOString().split('T')[0] } : b)
        };
      }
      return u;
    }));
  };

  // 3. RRHH crea un nuevo badge
  const createBadge = (newBadge) => {
    setBadgesCatalog(prev => [...prev, { ...newBadge, id: `b${prev.length + 1}` }]);
  };

  // 4. Empleado marca/desmarca un rol como favorito
  const [favoriteRoles, setFavoriteRoles] = useState({}); // { userId: [roleId1, roleId2] }

  const toggleFavoriteRole = (userId, roleId) => {
    setFavoriteRoles(prev => {
      const userFavs = prev[userId] || [];
      if (userFavs.includes(roleId)) {
        return { ...prev, [userId]: userFavs.filter(id => id !== roleId) };
      } else {
        return { ...prev, [userId]: [...userFavs, roleId] };
      }
    });
  };

  // 5. Empleado se inscribe a una vacante interna
  const [jobApplications, setJobApplications] = useState({}); // { userId: [oppId1] }

  const applyToJob = (userId, oppId) => {
    setJobApplications(prev => {
      const userApps = prev[userId] || [];
      if (userApps.includes(oppId)) return prev;
      return { ...prev, [userId]: [...userApps, oppId] };
    });
  };

  // Métodos CRUD de Empleados
  const addUser = (newUser) => {
    setUsers(prev => [
      ...prev,
      {
        ...newUser,
        id: prev.length > 0 ? Math.max(...prev.map(u => u.id)) + 1 : 1,
        skills: newUser.skills || [],
        badges: newUser.badges || []
      }
    ]);
  };

  const updateUser = (userId, updatedData) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedData } : u));
  };

  const deleteUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Habilidades Personalizadas
  const addCustomSkill = (userId, newSkill) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        if (u.skills.some(s => s && s.name.toLowerCase() === newSkill.name.toLowerCase())) return u;
        const skillId = `custom-${Date.now()}`;
        return {
          ...u,
          skills: [...u.skills, { ...newSkill, id: skillId, isCustom: true }]
        };
      }
      return u;
    }));
  };

  const updateCustomSkillLevel = (userId, skillId, newLevel, isVerified = false) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          skills: u.skills.map(s => s && s.id === skillId ? { ...s, level: Number(newLevel), isVerified: isVerified || s.isVerified } : s)
        };
      }
      return u;
    }));
  };

  const deleteCustomSkill = (userId, skillId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          skills: u.skills.filter(s => s && s.id !== skillId)
        };
      }
      return u;
    }));
  };

  // Métodos CRUD de Unidades Organizativas
  const addOrgUnit = (newUnit) => {
    setOrgUnits(prev => {
      const numericIds = prev.map(o => parseInt(o.id.replace('org-', '')) || 0);
      const nextNum = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
      return [
        ...prev,
        {
          ...newUnit,
          id: `org-${nextNum}`
        }
      ];
    });
  };

  const updateOrgUnit = (unitId, updatedData) => {
    setOrgUnits(prev => prev.map(o => o.id === unitId ? { ...o, ...updatedData } : o));
  };

  const deleteOrgUnit = (unitId) => {
    setOrgUnits(prev => prev.filter(o => o.id !== unitId));
  };

  // --- MÉTODOS DE EVALUACIÓN 360 Y PEER REVIEWS ---

  const getWorkflowForSkill = (user, skill) => {
    if (!user || !skill) return { workflowType: "self_manager", managerWeight: 100, peerWeight: 0 };
    
    // Simulación: usaremos una fecha fija que represente el ciclo de evaluación actual (Mayo 2026)
    // o simplemente buscaremos la campaña activa que contenga la fecha actual.
    // Para asegurar que la demo en memoria siempre funcione, si no hay campaña activa por fecha,
    // usamos la primera campaña disponible.
    const todayStr = "2026-05-15"; // Fecha fija para que la demo de Mayo 2026 siempre resuelva activa
    
    // Resolver la familia de skills robustamente si no viene en el objeto skill
    let resolvedSkillFamily = skill.family;
    if (!resolvedSkillFamily) {
      const name = skill.name;
      if (name === "Agile") resolvedSkillFamily = "Metodología";
      else if (name === "Comunicación" || name === "Liderazgo") resolvedSkillFamily = "Habilidades Blandas";
      else if (name === "Gestión de Talento") resolvedSkillFamily = "Negocio";
      else resolvedSkillFamily = "Tecnología";
    }

    const activeCampaigns = reviewConfigs.filter(c => {
      // 1. Verificar Fechas
      if (c.startDate && c.endDate) {
        if (todayStr < c.startDate || todayStr > c.endDate) return false;
      }

      // 2. Verificar Segmentación de la Campaña (Targeting a nivel de campaña)
      if (c.targeting) {
        const matchFamily = !c.targeting.skillFamily || c.targeting.skillFamily === 'Todas' || c.targeting.skillFamily === resolvedSkillFamily;
        
        const userRoleDetails = rolesData.find(ro => ro.title === user.role);
        const matchRoleFamily = !c.targeting.roleFamily || c.targeting.roleFamily === 'Todas' || (userRoleDetails?.family === c.targeting.roleFamily);
        
        const matchRoleLevel = !c.targeting.roleLevel || c.targeting.roleLevel === 'Todas' || (user.level && user.level === c.targeting.roleLevel);

        if (!matchFamily || !matchRoleFamily || !matchRoleLevel) return false;
      }

      return true;
    });

    const campaignsToSearch = activeCampaigns.length > 0 ? activeCampaigns : reviewConfigs;

    // Buscamos a través de todas las reglas de las campañas candidatas
    for (const campaign of campaignsToSearch) {
      if (!campaign.rules) continue;
      
      const matchingRule = campaign.rules.find(r => {
        // Match strictly by skill family targeting
        return !r.targeting || !r.targeting.skillFamily || r.targeting.skillFamily === 'Todas' || r.targeting.skillFamily === resolvedSkillFamily;
      });

      if (matchingRule) {
        return matchingRule;
      }
    }

    // Flujo por defecto si no hay coincidencias
    return {
      workflowType: "self_manager",
      managerWeight: 100,
      peerWeight: 0,
      minPeers: 2,
      maxPeers: 4
    };
  };

  // 2. Guardar o actualizar campaña de Skill Review
  const saveReviewConfig = (campaignData) => {
    setReviewConfigs(prev => {
      if (campaignData.id) {
        return prev.map(c => c.id === campaignData.id ? { ...c, ...campaignData } : c);
      } else {
        const numericIds = prev.map(c => parseInt(c.id.replace('camp-', '')) || 0);
        const nextIdNum = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
        return [...prev, { ...campaignData, id: `camp-${nextIdNum}`, rules: campaignData.rules || [] }];
      }
    });
  };

  // 3. Eliminar campaña de Skill Review
  const deleteReviewConfig = (campaignId) => {
    setReviewConfigs(prev => prev.filter(c => c.id !== campaignId));
  };

  // 4. Guardar o actualizar regla dentro de una campaña
  const saveCampaignRule = (campaignId, ruleData) => {
    setReviewConfigs(prev => prev.map(campaign => {
      if (campaign.id !== campaignId) return campaign;
      
      let updatedRules = [];
      const currentRules = campaign.rules || [];
      
      if (ruleData.id) {
        // Edit existing rule
        updatedRules = currentRules.map(r => r.id === ruleData.id ? { ...r, ...ruleData } : r);
      } else {
        // Add new rule
        const numericIds = currentRules.map(r => parseInt(r.id.replace('rule-', '')) || 0);
        const nextIdNum = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
        updatedRules = [...currentRules, { ...ruleData, id: `rule-${nextIdNum}` }];
      }
      
      return { ...campaign, rules: updatedRules };
    }));
  };

  // 5. Eliminar regla dentro de una campaña
  const deleteCampaignRule = (campaignId, ruleId) => {
    setReviewConfigs(prev => prev.map(campaign => {
      if (campaign.id !== campaignId) return campaign;
      return {
        ...campaign,
        rules: (campaign.rules || []).filter(r => r.id !== ruleId)
      };
    }));
  };

  // 4. Empleado propone/envía su lista de colegas
  const submitPeerNomination = (employeeId, peersList) => {
    setPeerNominations(prev => {
      const existingIdx = prev.findIndex(n => n.employeeId === employeeId);
      const nominationData = {
        employeeId,
        cycleId: "2026-Q2",
        nominatedPeers: peersList.map(p => ({
          peerId: Number(p.peerId),
          status: p.status || "Pending",
          suggestedBy: p.suggestedBy || "Employee"
        })),
        status: "PendingManager"
      };
      if (existingIdx >= 0) {
        return prev.map((n, idx) => idx === existingIdx ? { ...n, ...nominationData } : n);
      } else {
        return [...prev, { ...nominationData, id: `nom-${prev.length + 1}` }];
      }
    });
  };

  // 5. Mánager aprueba / modifica la lista de colegas de su colaborador
  const approvePeerNomination = (employeeId, approvedList) => {
    setPeerNominations(prev => {
      return prev.map(n => {
        if (n.employeeId === employeeId) {
          return {
            ...n,
            nominatedPeers: approvedList.map(p => ({
              peerId: Number(p.peerId),
              status: "Approved",
              suggestedBy: p.suggestedBy || "Employee"
            })),
            status: "Confirmed"
          };
        }
        return n;
      });
    });
  };

  // 7. Gestión de Itinerarios de Carrera (CRUD)
  const saveCareerTransition = (fromRoleId, transitionData) => {
    setCareerPaths(prev => {
      const existingPathIdx = prev.findIndex(p => p.fromRoleId === fromRoleId);
      const newTransition = {
        toRoleId: transitionData.toRoleId,
        type: transitionData.type || "vertical",
        horizon: transitionData.horizon || "short",
        affinityOverride: transitionData.affinityOverride !== undefined && transitionData.affinityOverride !== "" && transitionData.affinityOverride !== null
          ? Number(transitionData.affinityOverride) 
          : null
      };

      if (existingPathIdx >= 0) {
        return prev.map((p, idx) => {
          if (idx === existingPathIdx) {
            const existingTransIdx = p.transitions.findIndex(t => t.toRoleId === transitionData.toRoleId);
            let updatedTransitions;
            if (existingTransIdx >= 0) {
              updatedTransitions = p.transitions.map((t, tIdx) => tIdx === existingTransIdx ? { ...t, ...newTransition } : t);
            } else {
              updatedTransitions = [...p.transitions, newTransition];
            }
            return { ...p, transitions: updatedTransitions };
          }
          return p;
        });
      } else {
        return [...prev, { fromRoleId, transitions: [newTransition] }];
      }
    });
  };

  const deleteCareerTransition = (fromRoleId, toRoleId) => {
    setCareerPaths(prev => {
      return prev.map(p => {
        if (p.fromRoleId === fromRoleId) {
          return {
            ...p,
            transitions: p.transitions.filter(t => t.toRoleId !== toRoleId)
          };
        }
        return p;
      }).filter(p => p.transitions.length > 0);
    });
  };

  const saveProgressionCriteria = (toRoleId, criteriaData) => {
    setProgressionCriteria(prev => {
      const existingIdx = prev.findIndex(c => c.toRoleId === toRoleId);
      const updatedItem = {
        toRoleId,
        minYearsInEntity: criteriaData.minYearsInEntity !== undefined ? Number(criteriaData.minYearsInEntity) : 0,
        minYearsExperience: criteriaData.minYearsExperience !== undefined ? Number(criteriaData.minYearsExperience) : 0,
        reqPerformanceYears: criteriaData.reqPerformanceYears !== undefined ? Number(criteriaData.reqPerformanceYears) : 0,
        reqPerformanceLevel: criteriaData.reqPerformanceLevel || "Alto",
        reqPotentialYears: criteriaData.reqPotentialYears !== undefined ? Number(criteriaData.reqPotentialYears) : 0,
        reqPotentialLevel: criteriaData.reqPotentialLevel || "Alto Potencial",
        acceptedMarketConditions: criteriaData.acceptedMarketConditions || [],
        previousRoles: criteriaData.previousRoles || [],
        enableMinYearsInEntity: criteriaData.enableMinYearsInEntity !== undefined ? !!criteriaData.enableMinYearsInEntity : true,
        enableMinYearsExperience: criteriaData.enableMinYearsExperience !== undefined ? !!criteriaData.enableMinYearsExperience : true,
        enablePerformance: criteriaData.enablePerformance !== undefined ? !!criteriaForm.enablePerformance : true, // wait, criteriaData.enablePerformance is safer
        enablePotential: criteriaData.enablePotential !== undefined ? !!criteriaData.enablePotential : true,
        enableMarketConditions: criteriaData.enableMarketConditions !== undefined ? !!criteriaData.enableMarketConditions : true,
        enablePreviousRoles: criteriaData.enablePreviousRoles !== undefined ? !!criteriaData.enablePreviousRoles : true
      };
      
      // Let's use criteriaData.enablePerformance for safety
      updatedItem.enablePerformance = criteriaData.enablePerformance !== undefined ? !!criteriaData.enablePerformance : true;

      if (existingIdx >= 0) {
        return prev.map((item, idx) => idx === existingIdx ? updatedItem : item);
      } else {
        return [...prev, updatedItem];
      }
    });
  };

  // 6. Colega envía su evaluación sobre un empleado
  const submitPeerAssessment = (evaluatorId, targetEmployeeId, skillRatings) => {
    setPeerNominations(prevNom => {
      const nomination = prevNom.find(n => n.employeeId === targetEmployeeId);
      if (!nomination) return prevNom;

      setPeerReviews(prevRev => {
        const existingIdx = prevRev.findIndex(r => r.nominationId === nomination.id && r.evaluatorPeerId === evaluatorId);
        const reviewData = {
          nominationId: nomination.id,
          evaluatorPeerId: evaluatorId,
          skillEvaluations: Object.entries(skillRatings).map(([skillId, level]) => ({
            skillId,
            level: Number(level)
          }))
        };
        if (existingIdx >= 0) {
          return prevRev.map((r, idx) => idx === existingIdx ? { ...r, ...reviewData } : r);
        } else {
          return [...prevRev, { ...reviewData, id: `prev-${prevRev.length + 1}` }];
        }
      });
      return prevNom;
    });
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      switchUser, 
      users, 
      setUsers,
      badgesCatalog,
      favoriteRoles,
      jobApplications,
      enrollBadge,
      validateBadge,
      createBadge,
      toggleFavoriteRole,
      applyToJob,
      orgUnits,
      setOrgUnits,
      rolesData,
      setRolesData,
      levels,
      setLevels,
      roleFamilies,
      setRoleFamilies,
      addUser,
      updateUser,
      deleteUser,
      addCustomSkill,
      updateCustomSkillLevel,
      deleteCustomSkill,
      addOrgUnit,
      updateOrgUnit,
      deleteOrgUnit,
      reviewConfigs,
      setReviewConfigs,
      peerNominations,
      setPeerNominations,
      peerReviews,
      setPeerReviews,
      getWorkflowForSkill,
      saveReviewConfig,
      deleteReviewConfig,
      saveCampaignRule,
      deleteCampaignRule,
      submitPeerNomination,
      approvePeerNomination,
      submitPeerAssessment,
      careerPaths,
      setCareerPaths,
      saveCareerTransition,
      deleteCareerTransition,
      progressionCriteria,
      saveProgressionCriteria,
      employeeDossier,
      setEmployeeDossier
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
