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

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => mapInitialUsers(initialUsers));
  const [badgesCatalog, setBadgesCatalog] = useState(initialBadges);
  
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
      deleteOrgUnit
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
