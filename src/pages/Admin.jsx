import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, Plus, Edit2, ShieldAlert, Layers, BookOpen, Trash2, 
  Briefcase, GraduationCap, FileSpreadsheet, Search, Eye, X, 
  ChevronLeft, ChevronRight, SlidersHorizontal, Check, Info, Award
} from 'lucide-react';
import { mockRoles, mockOpportunities, mockCourses, mockSkills } from '../data/mockData';
import clsx from 'clsx';

export const Admin = () => {
  const { 
    currentUser, rolesData, setRolesData, levels, setLevels, roleFamilies, setRoleFamilies,
    reviewConfigs, saveReviewConfig, deleteReviewConfig
  } = useAuth();
  const [activeTab, setActiveTab] = useState('Familias');

  // --- ESTADO PARA CONFIGURACIONES 360 ---
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [configForm, setConfigForm] = useState({
    name: '',
    workflowType: 'self_manager_peers',
    minPeers: 2,
    maxPeers: 4,
    managerWeight: 70,
    peerWeight: 30,
    targeting: {
      roleFamily: 'Todas',
      skillFamily: 'Todas',
      skillCategory: 'Todas'
    }
  });

  // Estado local para simular CRUD en memoria
  const [opportunitiesData, setOpportunitiesData] = useState(mockOpportunities);
  const [coursesData, setCoursesData] = useState(mockCourses);

  // --- ESTADO PARA SKILLS ---
  const [isLargeDataset, setIsLargeDataset] = useState(true); // Activo por defecto para demostrar los 5.000
  const [allSkills, setAllSkills] = useState(mockSkills); // Contiene los 5.000 por defecto
  const [skillsSearch, setSkillsSearch] = useState('');
  const [skillsFamilyFilter, setSkillsFamilyFilter] = useState('Todos');
  const [skillsPage, setSkillsPage] = useState(1);
  const [skillsPerPage, setSkillsPerPage] = useState(10);
  
  // Detalle del skill seleccionado (Panel Lateral / Drawer)
  const [selectedSkill, setSelectedSkill] = useState(null);

  // Modal CRUD para Skills
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [skillForm, setSkillForm] = useState({
    name: '',
    family: 'Tecnología',
    description: '',
    levels: {
      1: '',
      2: '',
      3: '',
      4: ''
    }
  });

  // --- ESTADO PARA FAMILIAS (MAESTRO TABULADO) ---
  const [families, setFamilies] = useState([
    { id: 'FAM-1', name: 'Tecnología', color: 'emerald', description: 'Competencias técnicas asociadas al desarrollo de software, arquitectura cloud, ciberseguridad e infraestructura.' },
    { id: 'FAM-2', name: 'Habilidades Blandas', color: 'indigo', description: 'Competencias interpersonales, comunicación, liderazgo, negociación y trabajo en equipo.', isGlobalSoftSkill: true },
    { id: 'FAM-3', name: 'Metodología', color: 'blue', description: 'Marcos de trabajo ágiles, Scrum, Kanban, Design Thinking y metodologías de entrega de valor.' },
    { id: 'FAM-4', name: 'Negocio', color: 'amber', description: 'Conocimiento financiero, análisis de riesgos, banca minorista y desarrollo comercial.' },
    { id: 'FAM-5', name: 'Legal y Cumplimiento', color: 'rose', description: 'Prevención de blanqueo de capitales, protección de datos (RGPD) y cumplimiento normativo.' }
  ]);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [familyForm, setFamilyForm] = useState({
    name: '',
    color: 'emerald',
    description: '',
    isGlobalSoftSkill: false
  });

  // --- ESTADO PARA NIVELES (MAESTRO DINÁMICO) ---
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [levelForm, setLevelForm] = useState({
    name: '',
    description: ''
  });

  // --- ESTADO PARA FAMILIAS DE ROLES (MAESTRO DINÁMICO) ---
  const [isRoleFamilyModalOpen, setIsRoleFamilyModalOpen] = useState(false);
  const [editingRoleFamily, setEditingRoleFamily] = useState(null);
  const [roleFamilyForm, setRoleFamilyForm] = useState({
    name: '',
    color: 'blue',
    description: ''
  });

  // --- ESTADO PARA ROLES (MAESTRO DINÁMICO) ---
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    title: '',
    family: 'Ingeniería de Software',
    description: ''
  });
  const [rolesSearch, setRolesSearch] = useState('');
  const [rolesFamilyFilter, setRolesFamilyFilter] = useState('Todos');
  const [rolesPage, setRolesPage] = useState(1);
  const [rolesPerPage, setRolesPerPage] = useState(10);

  // --- ESTADO PARA MODAL PERFIL DE ÉXITO ---
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
  const [editingPerfilRole, setEditingPerfilRole] = useState(null);
  const [perfilForm, setPerfilForm] = useState({
    roleId: '',
    level: 'Junior',
    requiredSkills: []
  });
  const [tempSkill, setTempSkill] = useState({
    name: '',
    level: 3,
    priority: 'Primaria'
  });
  const [skillSearchQuery, setSkillSearchQuery] = useState('');

  // --- ESTADOS PARA MODAL DE VACANTES ---
  const [isVacanteModalOpen, setIsVacanteModalOpen] = useState(false);
  const [editingVacante, setEditingVacante] = useState(null);
  const [vacanteForm, setVacanteForm] = useState({
    title: '',
    department: 'Banca Digital',
    location: 'Madrid / Híbrido',
    description: '',
    requiredSkills: []
  });
  const [tempVacanteSkill, setTempVacanteSkill] = useState({
    name: '',
    level: 3
  });
  const [vacanteSkillSearchQuery, setVacanteSkillSearchQuery] = useState('');

  // --- ESTADOS PARA MODAL DE FORMACIONES ---
  const [isFormacionModalOpen, setIsFormacionModalOpen] = useState(false);
  const [editingFormacion, setEditingFormacion] = useState(null);
  const [formacionForm, setFormacionForm] = useState({
    title: '',
    type: 'Técnico',
    duration: '20h',
    cost: 0,
    targetLevel: 3,
    skills: [],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop'
  });
  const [tempFormacionSkillName, setTempFormacionSkillName] = useState('');

  if (currentUser.profile !== 'RRHH') {
    return <div className="p-8 text-center text-rose-500 font-bold">Acceso denegado. Exclusivo RRHH.</div>;
  }

  // Cambiar tamaño de dataset (Vista rápida vs masiva)
  const handleDatasetToggle = (large) => {
    setIsLargeDataset(large);
    if (large) {
      setAllSkills(mockSkills);
    } else {
      // Filtrar sólo las base (primeras 21 sin el carácter '#' en el nombre)
      const baseOnly = mockSkills.filter(s => !s.name.includes('#'));
      setAllSkills(baseOnly);
    }
    setSkillsPage(1);
  };

  // Filtrado ultra-eficiente en memoria
  const filteredSkills = allSkills.filter(skill => {
    // Filtro por familia
    if (skillsFamilyFilter !== 'Todos' && skill.family !== skillsFamilyFilter) {
      return false;
    }
    // Filtro de búsqueda global (Nombre, Descripción o Descriptivos de Nivel)
    if (skillsSearch.trim()) {
      const query = skillsSearch.toLowerCase();
      const matchesName = skill.name.toLowerCase().includes(query);
      const matchesDesc = skill.description.toLowerCase().includes(query);
      const matchesLevels = Object.values(skill.levels).some(lvl => lvl.toLowerCase().includes(query));
      return matchesName || matchesDesc || matchesLevels;
    }
    return true;
  });

  // Paginación local
  const totalSkillsPages = Math.ceil(filteredSkills.length / skillsPerPage) || 1;
  const startIndex = (skillsPage - 1) * skillsPerPage;
  const paginatedSkills = filteredSkills.slice(startIndex, startIndex + skillsPerPage);

  // --- FILTRADO Y PAGINACIÓN DE ROLES ---
  const filteredRoles = useMemo(() => {
    return rolesData.filter(role => {
      // Filtro por familia de roles
      if (rolesFamilyFilter !== 'Todos' && role.family !== rolesFamilyFilter) {
        return false;
      }
      // Filtro por búsqueda global (Título o Descripción)
      if (rolesSearch.trim()) {
        const query = rolesSearch.toLowerCase();
        const matchesTitle = role.title.toLowerCase().includes(query);
        const matchesDesc = (role.description || '').toLowerCase().includes(query);
        return matchesTitle || matchesDesc;
      }
      return true;
    });
  }, [rolesData, rolesFamilyFilter, rolesSearch]);

  const totalRolesPages = Math.ceil(filteredRoles.length / rolesPerPage) || 1;
  const rolesStartIndex = (rolesPage - 1) * rolesPerPage;
  const paginatedRoles = filteredRoles.slice(rolesStartIndex, rolesStartIndex + rolesPerPage);

  // CRUD Handlers de simulación
  const handleOpenAddSkill = () => {
    setEditingSkill(null);
    setSkillForm({
      name: '',
      family: 'Tecnología',
      description: '',
      levels: {
        1: 'Nivel Conceptual: Entiende la teoría básica y requiere guía.',
        2: 'Nivel Operativo: Resuelve tareas estándar con autonomía.',
        3: 'Nivel Avanzado: Domina casos complejos y mentoriza al equipo.',
        4: 'Nivel Experto: Define la estrategia global de la competencia.'
      }
    });
    setIsSkillModalOpen(true);
  };

  const handleOpenEditSkill = (skill, e) => {
    e.stopPropagation(); // Evitar abrir el drawer al hacer clic en editar
    setEditingSkill(skill);
    setSkillForm({
      name: skill.name,
      family: skill.family,
      description: skill.description,
      levels: { ...skill.levels }
    });
    setIsSkillModalOpen(true);
  };

  const handleSaveSkill = (e) => {
    e.preventDefault();
    if (!skillForm.name || !skillForm.description) {
      alert('Por favor, rellena todos los campos obligatorios.');
      return;
    }

    if (editingSkill) {
      // Editar
      setAllSkills(prev => prev.map(s => s.id === editingSkill.id ? { ...s, ...skillForm } : s));
      alert(`Skill "${skillForm.name}" actualizada con éxito.`);
    } else {
      // Crear nuevo
      const newSkill = {
        id: `s-${allSkills.length + 1}`,
        ...skillForm
      };
      setAllSkills(prev => [newSkill, ...prev]);
      alert(`Skill "${skillForm.name}" creada con éxito.`);
    }
    setIsSkillModalOpen(false);
  };

  const handleDeleteSkill = (skill, e) => {
    e.stopPropagation(); // Evitar abrir el drawer
    if (confirm(`¿Estás seguro de que deseas eliminar la skill "${skill.name}"?`)) {
      setAllSkills(prev => prev.filter(s => s.id !== skill.id));
      if (selectedSkill && selectedSkill.id === skill.id) {
        setSelectedSkill(null);
      }
      alert('Skill eliminada.');
    }
  };

  // CRUD Handlers para Familias
  const handleOpenAddFamily = () => {
    setEditingFamily(null);
    setFamilyForm({
      name: '',
      color: 'emerald',
      description: '',
      isGlobalSoftSkill: false
    });
    setIsFamilyModalOpen(true);
  };

  const handleOpenEditFamily = (family, e) => {
    e.stopPropagation();
    setEditingFamily(family);
    setFamilyForm({
      name: family.name,
      color: family.color,
      description: family.description,
      isGlobalSoftSkill: !!family.isGlobalSoftSkill
    });
    setIsFamilyModalOpen(true);
  };

  const handleSaveFamily = (e) => {
    e.preventDefault();
    if (!familyForm.name || !familyForm.description) {
      alert('Por favor, rellena todos los campos obligatorios.');
      return;
    }

    // Validar nombre único para evitar duplicados
    const isDuplicate = families.some(f => f.name.toLowerCase() === familyForm.name.toLowerCase() && (!editingFamily || f.id !== editingFamily.id));
    if (isDuplicate) {
      alert(`Ya existe una familia llamada "${familyForm.name}".`);
      return;
    }

    if (editingFamily) {
      // Si cambia el nombre de la familia, debemos actualizar las skills asociadas para mantener consistencia
      const oldName = editingFamily.name;
      const newName = familyForm.name;
      if (oldName !== newName) {
        setAllSkills(prev => prev.map(s => s.family === oldName ? { ...s, family: newName } : s));
      }
      setFamilies(prev => prev.map(f => f.id === editingFamily.id ? { ...f, ...familyForm } : f));
      alert(`Familia "${familyForm.name}" actualizada con éxito.`);
    } else {
      const newFam = {
        id: `FAM-${families.length + 1}`,
        ...familyForm
      };
      setFamilies(prev => [...prev, newFam]);
      alert(`Familia "${familyForm.name}" creada con éxito.`);
    }
    setIsFamilyModalOpen(false);
  };

  const handleDeleteFamily = (family, e) => {
    e.stopPropagation();
    const associatedCount = allSkills.filter(s => s.family === family.name).length;
    if (associatedCount > 0) {
      alert(`No se puede eliminar la familia "${family.name}" porque tiene ${associatedCount} habilidades asociadas.\nPor favor, cambia la familia de estas habilidades antes de eliminarla.`);
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar la familia de skills "${family.name}"?`)) {
      setFamilies(prev => prev.filter(f => f.id !== family.id));
      alert('Familia eliminada.');
    }
  };

  // CRUD Handlers para Niveles (Maestro Dinámico)
  const handleOpenAddLevel = () => {
    setEditingLevel(null);
    setLevelForm({
      name: '',
      description: ''
    });
    setIsLevelModalOpen(true);
  };

  const handleOpenEditLevel = (level, e) => {
    e.stopPropagation();
    setEditingLevel(level);
    setLevelForm({
      name: level.name,
      description: level.description
    });
    setIsLevelModalOpen(true);
  };

  const handleSaveLevel = (e) => {
    e.preventDefault();
    if (!levelForm.name || !levelForm.description) {
      alert('Por favor, rellena todos los campos obligatorios.');
      return;
    }

    // Validar nombre único para evitar duplicados
    const isDuplicate = levels.some(lvl => lvl.name.toLowerCase() === levelForm.name.toLowerCase() && (!editingLevel || lvl.id !== editingLevel.id));
    if (isDuplicate) {
      alert(`Ya existe un nivel llamado "${levelForm.name}".`);
      return;
    }

    if (editingLevel) {
      // Si cambia el nombre del nivel, debemos actualizar los roles asociados para mantener consistencia
      const oldName = editingLevel.name;
      const newName = levelForm.name;
      if (oldName !== newName) {
        setRolesData(prev => prev.map(r => r.level === oldName ? { ...r, level: newName } : r));
      }
      setLevels(prev => prev.map(lvl => lvl.id === editingLevel.id ? { ...lvl, ...levelForm } : lvl));
      alert(`Nivel "${levelForm.name}" actualizado con éxito.`);
    } else {
      const newLvl = {
        id: `LVL-${levels.length + 1}`,
        ...levelForm
      };
      setLevels(prev => [...prev, newLvl]);
      alert(`Nivel "${levelForm.name}" creado con éxito.`);
    }
    setIsLevelModalOpen(false);
  };

  const handleDeleteLevel = (level, e) => {
    e.stopPropagation();
    const associatedCount = rolesData.filter(r => r.level === level.name).length;
    if (associatedCount > 0) {
      alert(`No se puede eliminar el nivel "${level.name}" porque tiene ${associatedCount} roles asociados.\nPor favor, reasigna el nivel de estos roles antes de eliminarlo.`);
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar el nivel de roles "${level.name}"?`)) {
      setLevels(prev => prev.filter(lvl => lvl.id !== level.id));
      alert('Nivel de roles eliminado.');
    }
  };

  // CRUD Handlers para Familias de Roles (Maestro Dinámico)
  const handleOpenAddRoleFamily = () => {
    setEditingRoleFamily(null);
    setRoleFamilyForm({
      name: '',
      color: 'blue',
      description: ''
    });
    setIsRoleFamilyModalOpen(true);
  };

  const handleOpenEditRoleFamily = (roleFamily, e) => {
    e.stopPropagation();
    setEditingRoleFamily(roleFamily);
    setRoleFamilyForm({
      name: roleFamily.name,
      color: roleFamily.color,
      description: roleFamily.description
    });
    setIsRoleFamilyModalOpen(true);
  };

  const handleSaveRoleFamily = (e) => {
    e.preventDefault();
    if (!roleFamilyForm.name || !roleFamilyForm.description) {
      alert('Por favor, rellena todos los campos obligatorios.');
      return;
    }

    // Validar nombre único para evitar duplicados
    const isDuplicate = roleFamilies.some(rf => rf.name.toLowerCase() === roleFamilyForm.name.toLowerCase() && (!editingRoleFamily || rf.id !== editingRoleFamily.id));
    if (isDuplicate) {
      alert(`Ya existe una familia de roles llamada "${roleFamilyForm.name}".`);
      return;
    }

    if (editingRoleFamily) {
      // Si cambia el nombre de la familia de roles, debemos actualizar los roles asociados para mantener consistencia
      const oldName = editingRoleFamily.name;
      const newName = roleFamilyForm.name;
      if (oldName !== newName) {
        setRolesData(prev => prev.map(r => r.family === oldName ? { ...r, family: newName } : r));
      }
      setRoleFamilies(prev => prev.map(rf => rf.id === editingRoleFamily.id ? { ...rf, ...roleFamilyForm } : rf));
      alert(`Familia de roles "${roleFamilyForm.name}" actualizada con éxito.`);
    } else {
      const newRFam = {
        id: `RFAM-${roleFamilies.length + 1}`,
        ...roleFamilyForm
      };
      setRoleFamilies(prev => [...prev, newRFam]);
      alert(`Familia de roles "${roleFamilyForm.name}" creada con éxito.`);
    }
    setIsRoleFamilyModalOpen(false);
  };

  const handleDeleteRoleFamily = (roleFamily, e) => {
    e.stopPropagation();
    const associatedCount = rolesData.filter(r => r.family === roleFamily.name).length;
    if (associatedCount > 0) {
      alert(`No se puede eliminar la familia de roles "${roleFamily.name}" porque tiene ${associatedCount} roles asociados.\nPor favor, reasigna la familia de estos roles antes de eliminarla.`);
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar la familia de roles "${roleFamily.name}"?`)) {
      setRoleFamilies(prev => prev.filter(rf => rf.id !== roleFamily.id));
      alert('Familia de roles eliminada.');
    }
  };

  // --- CRUD HANDLERS PARA CONFIGURACIÓN 360 ---
  const handleOpenAddConfig = () => {
    setEditingConfig(null);
    setConfigForm({
      name: '',
      workflowType: 'self_manager_peers',
      minPeers: 2,
      maxPeers: 4,
      managerWeight: 70,
      peerWeight: 30,
      targeting: {
        roleFamily: 'Todas',
        skillFamily: 'Todas',
        skillCategory: 'Todas'
      }
    });
    setIsConfigModalOpen(true);
  };

  const handleOpenEditConfig = (config, e) => {
    e.stopPropagation();
    setEditingConfig(config);
    setConfigForm({
      name: config.name,
      workflowType: config.workflowType,
      minPeers: config.minPeers || 2,
      maxPeers: config.maxPeers || 4,
      managerWeight: config.managerWeight !== undefined ? config.managerWeight : 70,
      peerWeight: config.peerWeight !== undefined ? config.peerWeight : 30,
      targeting: { ...config.targeting }
    });
    setIsConfigModalOpen(true);
  };

  const handleDeleteConfig = (configId, e) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar esta regla de evaluación 360?')) {
      deleteReviewConfig(configId);
      alert('Regla de evaluación eliminada.');
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!configForm.name) {
      alert('Por favor, indica un nombre para la campaña.');
      return;
    }
    if (configForm.workflowType === 'self_manager_peers') {
      const sum = Number(configForm.managerWeight) + Number(configForm.peerWeight);
      if (sum !== 100) {
        alert(`La suma de las ponderaciones del Mánager y Colegas debe ser exactamente 100%. Actualmente suma ${sum}%.`);
        return;
      }
    }
    saveReviewConfig({
      id: editingConfig ? editingConfig.id : undefined,
      ...configForm
    });
    setIsConfigModalOpen(false);
    alert(editingConfig ? 'Regla actualizada con éxito.' : 'Nueva regla de evaluación 360 guardada con éxito.');
  };

  // CRUD Handlers para Roles (Maestro Dinámico)
  const handleOpenAddRole = () => {
    setEditingRole(null);
    setRoleForm({
      title: '',
      family: roleFamilies[0]?.name || 'Ingeniería de Software',
      description: ''
    });
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRole = (role, e) => {
    e.stopPropagation();
    setEditingRole(role);
    setRoleForm({
      title: role.title,
      family: role.family,
      description: role.description || ''
    });
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!roleForm.title || !roleForm.description) {
      alert('Por favor, rellena todos los campos obligatorios.');
      return;
    }

    // Validar nombre único para evitar duplicados
    const isDuplicate = rolesData.some(r => r.title.toLowerCase() === roleForm.title.toLowerCase() && (!editingRole || r.id !== editingRole.id));
    if (isDuplicate) {
      alert(`Ya existe un rol llamado "${roleForm.title}".`);
      return;
    }

    if (editingRole) {
      // Si cambia el nombre del rol, también mantenemos las skills requeridas y niveles del rol original
      setRolesData(prev => prev.map(r => r.id === editingRole.id ? { ...r, ...roleForm } : r));
      alert(`Rol "${roleForm.title}" actualizado con éxito.`);
    } else {
      const newRoleObj = {
        id: `r-${rolesData.length + 1}`,
        level: 'Junior', // Nivel por defecto
        requiredSkills: [], // Skills por defecto para perfil de éxito
        ...roleForm
      };
      setRolesData(prev => [...prev, newRoleObj]);
      alert(`Rol "${roleForm.title}" creado con éxito. Puedes configurar su Perfil de Éxito en la pestaña correspondiente.`);
    }
    setIsRoleModalOpen(false);
  };

  const handleDeleteRole = (role, e) => {
    e.stopPropagation();
    if (confirm(`¿Estás seguro de que deseas eliminar el rol "${role.title}"?`)) {
      setRolesData(prev => prev.filter(r => r.id !== role.id));
      alert('Rol eliminado.');
    }
  };

  // --- HANDLERS PARA PERFILES DE ÉXITO ---
  const handleOpenAddPerfil = () => {
    // Buscar un rol que no tenga skills configuradas aún para proponerlo por defecto
    const availableRole = rolesData.find(r => !r.requiredSkills || r.requiredSkills.length === 0) || rolesData[0];
    
    setEditingPerfilRole(null);
    setPerfilForm({
      roleId: availableRole ? availableRole.id : '',
      level: 'Junior',
      requiredSkills: []
    });
    setTempSkill({
      name: allSkills[0]?.name || '',
      level: 3,
      priority: 'Primaria'
    });
    setSkillSearchQuery('');
    setIsPerfilModalOpen(true);
  };

  const handleOpenEditPerfil = (role, e) => {
    if (e) e.stopPropagation();
    setEditingPerfilRole(role);
    setPerfilForm({
      roleId: role.id,
      level: role.level || 'Junior',
      requiredSkills: role.requiredSkills ? [...role.requiredSkills] : []
    });
    setTempSkill({
      name: allSkills[0]?.name || '',
      level: 3,
      priority: 'Primaria'
    });
    setSkillSearchQuery('');
    setIsPerfilModalOpen(true);
  };

  const handleSavePerfil = (e) => {
    if (e) e.preventDefault();
    if (!perfilForm.roleId) {
      alert('Por favor, selecciona un rol.');
      return;
    }

    const selectedBaseRole = rolesData.find(r => r.id === perfilForm.roleId);
    if (!selectedBaseRole) return;

    if (editingPerfilRole) {
      // Si estamos editando un perfil existente, actualizamos directamente esa fila concreta
      setRolesData(prev => prev.map(r => {
        if (r.id === editingPerfilRole.id) {
          return {
            ...r,
            level: perfilForm.level,
            requiredSkills: perfilForm.requiredSkills
          };
        }
        return r;
      }));
      alert(`Perfil de éxito para "${editingPerfilRole.title}" a nivel "${perfilForm.level}" guardado con éxito.`);
    } else {
      // Si es un nuevo registro, comprobamos si ya existe esa combinación de título y nivel
      const existingIdx = rolesData.findIndex(r => 
        r.title.toLowerCase() === selectedBaseRole.title.toLowerCase() && 
        r.level.toLowerCase() === perfilForm.level.toLowerCase()
      );

      if (existingIdx >= 0) {
        // Si ya existe la combinación, actualizamos sus habilidades requeridas
        setRolesData(prev => prev.map((r, idx) => {
          if (idx === existingIdx) {
            return {
              ...r,
              requiredSkills: perfilForm.requiredSkills
            };
          }
          return r;
        }));
        alert(`La combinación de "${selectedBaseRole.title}" a nivel "${perfilForm.level}" ya existía y ha sido actualizada con las nuevas habilidades.`);
      } else {
        // Si no existe, creamos un nuevo registro en el catálogo (Opción A)
        const nextIdNum = rolesData.reduce((max, r) => {
          const num = parseInt(r.id.replace(/\D/g, ''), 10);
          return isNaN(num) ? max : Math.max(max, num);
        }, 5) + 1;

        const newPerfil = {
          id: `r${nextIdNum}`,
          title: selectedBaseRole.title,
          family: selectedBaseRole.family,
          description: selectedBaseRole.description || `Perfil de éxito para el rol ${selectedBaseRole.title} a nivel ${perfilForm.level}.`,
          level: perfilForm.level,
          requiredSkills: perfilForm.requiredSkills
        };

        setRolesData(prev => [...prev, newPerfil]);
        alert(`Nuevo Perfil de Éxito creado con éxito: "${newPerfil.title}" a nivel "${newPerfil.level}".`);
      }
    }

    setIsPerfilModalOpen(false);
  };

  const handleClearPerfil = (role, e) => {
    if (e) e.stopPropagation();
    if (confirm(`¿Estás seguro de que deseas limpiar el perfil de éxito para el rol "${role.title}"?\nSe eliminarán todas las habilidades requeridas configuradas.`)) {
      setRolesData(prev => prev.map(r => r.id === role.id ? { ...r, requiredSkills: [], level: 'Junior' } : r));
      alert(`Perfil de éxito para "${role.title}" restablecido.`);
    }
  };

  // --- HANDLERS PARA VACANTES ---
  const handleOpenAddVacante = () => {
    setEditingVacante(null);
    setVacanteForm({
      title: '',
      department: 'Banca Digital',
      location: 'Madrid / Híbrido',
      description: '',
      requiredSkills: []
    });
    setTempVacanteSkill({
      name: allSkills[0]?.name || '',
      level: 3
    });
    setVacanteSkillSearchQuery('');
    setIsVacanteModalOpen(true);
  };

  const handleOpenEditVacante = (opp, e) => {
    if (e) e.stopPropagation();
    setEditingVacante(opp);
    setVacanteForm({
      title: opp.title,
      department: opp.department,
      location: opp.location,
      description: opp.description || '',
      requiredSkills: opp.requiredSkills ? [...opp.requiredSkills] : []
    });
    setTempVacanteSkill({
      name: allSkills[0]?.name || '',
      level: 3
    });
    setVacanteSkillSearchQuery('');
    setIsVacanteModalOpen(true);
  };

  const handleSaveVacante = (e) => {
    if (e) e.preventDefault();
    if (!vacanteForm.title.trim()) {
      alert('Por favor, introduce el título de la vacante.');
      return;
    }
    if (!vacanteForm.department.trim()) {
      alert('Por favor, introduce el departamento.');
      return;
    }

    if (editingVacante) {
      // Modificar existente
      setOpportunitiesData(prev => prev.map(opp => {
        if (opp.id === editingVacante.id) {
          return {
            ...opp,
            title: vacanteForm.title,
            department: vacanteForm.department,
            location: vacanteForm.location,
            description: vacanteForm.description,
            requiredSkills: vacanteForm.requiredSkills
          };
        }
        return opp;
      }));
      alert('Vacante modificada con éxito.');
    } else {
      // Crear nueva
      const newId = `o-${Date.now()}`;
      const newVacante = {
        id: newId,
        title: vacanteForm.title,
        department: vacanteForm.department,
        location: vacanteForm.location,
        description: vacanteForm.description,
        requiredSkills: vacanteForm.requiredSkills
      };
      setOpportunitiesData(prev => [newVacante, ...prev]);
      alert('Nueva vacante creada con éxito.');
    }
    setIsVacanteModalOpen(false);
  };

  const handleDeleteVacante = (opp, e) => {
    if (e) e.stopPropagation();
    if (confirm(`¿Estás seguro de que deseas eliminar la vacante "${opp.title}"?`)) {
      setOpportunitiesData(prev => prev.filter(o => o.id !== opp.id));
      alert('Vacante eliminada.');
    }
  };

  // --- HANDLERS PARA FORMACIONES ---
  const handleOpenAddFormacion = () => {
    setEditingFormacion(null);
    setFormacionForm({
      title: '',
      type: 'Técnico',
      duration: '20h',
      cost: 0,
      targetLevel: 3,
      skills: [],
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop'
    });
    setTempFormacionSkillName(allSkills[0]?.name || '');
    setIsFormacionModalOpen(true);
  };

  const handleOpenEditFormacion = (course, e) => {
    if (e) e.stopPropagation();
    setEditingFormacion(course);
    setFormacionForm({
      title: course.title,
      type: course.type,
      duration: course.duration,
      cost: course.cost,
      targetLevel: course.targetLevel,
      skills: course.skills ? [...course.skills] : [],
      image: course.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop'
    });
    setTempFormacionSkillName(allSkills[0]?.name || '');
    setIsFormacionModalOpen(true);
  };

  const handleSaveFormacion = (e) => {
    if (e) e.preventDefault();
    if (!formacionForm.title.trim()) {
      alert('Por favor, introduce el título del curso.');
      return;
    }
    if (!formacionForm.duration.trim()) {
      alert('Por favor, introduce la duración.');
      return;
    }

    if (editingFormacion) {
      // Modificar existente
      setCoursesData(prev => prev.map(c => {
        if (c.id === editingFormacion.id) {
          return {
            ...c,
            title: formacionForm.title,
            type: formacionForm.type,
            duration: formacionForm.duration,
            cost: Number(formacionForm.cost),
            targetLevel: Number(formacionForm.targetLevel),
            skills: formacionForm.skills
          };
        }
        return c;
      }));
      alert('Formación modificada con éxito.');
    } else {
      // Crear nueva
      const newId = `c-${Date.now()}`;
      const newFormacion = {
        id: newId,
        title: formacionForm.title,
        type: formacionForm.type,
        duration: formacionForm.duration,
        cost: Number(formacionForm.cost),
        targetLevel: Number(formacionForm.targetLevel),
        skills: formacionForm.skills,
        image: formacionForm.image,
        status: 'Pendiente'
      };
      setCoursesData(prev => [newFormacion, ...prev]);
      alert('Nueva formación creada con éxito.');
    }
    setIsFormacionModalOpen(false);
  };

  const handleDeleteFormacion = (course, e) => {
    if (e) e.stopPropagation();
    if (confirm(`¿Estás seguro de que deseas eliminar la formación "${course.title}"?`)) {
      setCoursesData(prev => prev.filter(c => c.id !== course.id));
      alert('Formación eliminada.');
    }
  };

  // Helpers visuales para Badges
  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'Crítica': return <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Crítica</span>;
      case 'Primaria': return <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Primaria</span>;
      default: return <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Secundaria</span>;
    }
  };

  // Badge para Familias de Skills dinámico
  const getFamilyBadge = (familyName) => {
    const fam = families.find(f => f.name === familyName);
    const color = fam ? fam.color : 'slate';
    
    switch (color) {
      case 'emerald':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
      case 'indigo':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
      case 'blue':
        return <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
      case 'amber':
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
      case 'rose':
        return <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
      case 'violet':
        return <span className="bg-violet-50 text-violet-700 border border-violet-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
      case 'teal':
        return <span className="bg-teal-50 text-teal-700 border border-teal-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
      default:
        return <span className="bg-slate-50 text-slate-700 border border-slate-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
    }
  };

  // Badge para Familias de Roles dinámico
  const getRoleFamilyBadge = (familyName) => {
    const fam = roleFamilies.find(rf => rf.name === familyName);
    const color = fam ? fam.color : 'slate';
    
    switch (color) {
      case 'emerald':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
      case 'indigo':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
      case 'blue':
        return <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
      case 'amber':
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
      case 'rose':
        return <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
      case 'violet':
        return <span className="bg-violet-50 text-violet-700 border border-violet-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
      case 'teal':
        return <span className="bg-teal-50 text-teal-700 border border-teal-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
      default:
        return <span className="bg-slate-50 text-slate-700 border border-slate-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">{familyName}</span>;
    }
  };

  const getRoleSuccessSkills = (roleId) => {
    const roleObj = rolesData.find(r => r.id === roleId);
    if (!roleObj || !roleObj.requiredSkills) return [];
    return roleObj.requiredSkills.map((rs, idx) => {
      const matchingSkill = allSkills.find(s => s.name === rs.name);
      return {
        skillId: matchingSkill ? matchingSkill.id : `s-temp-${idx}`,
        skillName: rs.name,
        minLevel: rs.level,
        priority: rs.priority === 'Crítica' || rs.priority === 'Primaria'
      };
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 flex items-center gap-3">
        <div className="w-11 h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg shrink-0">
          <Settings size={22} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">Gestión de Maestros</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5 leading-normal">Configuración global del catálogo de Skills, Familias de Skills, Perfiles de Éxito, Familias de Roles y Niveles de Cajamar.</p>
        </div>
      </div>

      {/* NAVEGACIÓN PESTAÑAS */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto custom-scrollbar pb-1">
        {[
          { id: 'Familias', label: 'Familias de Skills', icon: Layers },
          { id: 'Skills', label: 'Skills', icon: BookOpen },
          { id: 'FamiliasRoles', label: 'Familias de Roles', icon: Layers },
          { id: 'Roles', label: 'Roles', icon: Briefcase },
          { id: 'PerfilExito', label: 'Perfil de Éxito', icon: ShieldAlert },
          { id: 'Niveles', label: 'Niveles', icon: SlidersHorizontal },
          { id: 'Vacantes', label: 'Vacantes', icon: Briefcase },
          { id: 'Formaciones', label: 'Formaciones', icon: GraduationCap }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "pb-2.5 px-3 text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all relative shrink-0",
                isActive ? "text-[#007A33]" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon size={15} /> {tab.label}
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#007A33] rounded-t-full"></div>}
            </button>
          );
        })}
      </div>

      {/* CONTENIDO PESTAÑAS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* TAB HEADER */}
        <div className="py-3 px-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-base md:text-lg font-extrabold text-slate-800">
            Directorio de {
              activeTab === 'Familias' ? 'Familias de Skills' : 
              activeTab === 'Niveles' ? 'Niveles de Roles' : 
              activeTab === 'FamiliasRoles' ? 'Familias de Roles' : 
              activeTab === 'Roles' ? 'Roles' : 
              activeTab === 'PerfilExito' ? 'Perfiles de Éxito' : 
              activeTab
            }
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (activeTab === 'Skills') {
                  // Simular carga de 1000 skills desde un excel
                  const extra = generateMockSkills(1000).map((s, idx) => ({
                    ...s,
                    id: `s-xls-${idx + 10000}`,
                    name: `${s.name.split('#')[0]} (Importado Excel) #${idx}`
                  }));
                  setAllSkills(prev => [...prev, ...extra]);
                  alert('¡Simulación completada! Se han cargado e indexado 1.000 nuevos registros de skills desde el archivo Excel en 12ms.');
                } else if (activeTab === 'Familias') {
                  alert('¡Simulación completada! Carga de familias de skills desde Excel verificada.');
                } else if (activeTab === 'Niveles') {
                  alert('¡Simulación completada! Carga de niveles de roles desde Excel verificada.');
                } else if (activeTab === 'FamiliasRoles') {
                  alert('¡Simulación completada! Carga de familias de roles desde Excel verificada.');
                } else if (activeTab === 'Roles') {
                  alert('¡Simulación completada! Carga de roles desde Excel verificada.');
                } else if (activeTab === 'PerfilExito') {
                  alert('¡Simulación completada! Carga de perfiles de éxito desde Excel verificada.');
                } else {
                  alert('Simulando carga de datos desde Excel...');
                }
              }}
              className="bg-white border border-emerald-600 text-emerald-700 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <FileSpreadsheet size={14} /> Cargar Excel
            </button>
            <button 
              onClick={() => {
                if (activeTab === 'Skills') {
                  handleOpenAddSkill();
                } else if (activeTab === 'Familias') {
                  handleOpenAddFamily();
                } else if (activeTab === 'Niveles') {
                  handleOpenAddLevel();
                } else if (activeTab === 'FamiliasRoles') {
                  handleOpenAddRoleFamily();
                } else if (activeTab === 'Roles') {
                  handleOpenAddRole();
                } else if (activeTab === 'PerfilExito') {
                  handleOpenAddPerfil();
                } else if (activeTab === 'Vacantes') {
                  handleOpenAddVacante();
                } else if (activeTab === 'Formaciones') {
                  handleOpenAddFormacion();
                } else {
                  alert(`Añadir registro simulado para Directorio de ${activeTab}`);
                }
              }}
              className="bg-[#007A33] text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-[#006028] transition-colors cursor-pointer"
            >
              <Plus size={14} /> Nuevo Registro
            </button>
          </div>
        </div>

        {/* FILTROS Y CONTROLES: SKILLS */}
        {activeTab === 'Skills' && (
          <div className="py-3 px-5 border-b border-slate-100 bg-white space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              
              {/* Buscador */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2 text-slate-400" size={15} />
                <input 
                  type="text"
                  placeholder="Buscar skill, descripción, niveles..."
                  value={skillsSearch}
                  onChange={(e) => {
                    setSkillsSearch(e.target.value);
                    setSkillsPage(1);
                  }}
                  className="w-full pl-9 pr-9 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-[#007A33] focus:ring-1 focus:ring-[#007A33]/30 focus:outline-none transition-all shadow-sm"
                />
                {skillsSearch && (
                  <button 
                    onClick={() => { setSkillsSearch(''); setSkillsPage(1); }}
                    className="absolute right-2.5 top-1.5 p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filtro de familia, volumen y estadísticas */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                
                {/* Selector de Familia */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Familia:</span>
                  <select
                    value={skillsFamilyFilter}
                    onChange={(e) => {
                      setSkillsFamilyFilter(e.target.value);
                      setSkillsPage(1);
                    }}
                    className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold text-[11px] focus:border-[#007A33] focus:outline-none transition-colors"
                  >
                    <option value="Todos">Todas las familias</option>
                    {families.map(fam => (
                      <option key={fam.id} value={fam.name}>{fam.name}</option>
                    ))}
                  </select>
                </div>

                {/* Conmutador de volumen (50 vs 5.000) */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => handleDatasetToggle(false)}
                    className={clsx(
                      "px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                      !isLargeDataset ? "bg-white text-slate-800 shadow-xs" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Base (21)
                  </button>
                  <button
                    onClick={() => handleDatasetToggle(true)}
                    className={clsx(
                      "px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer",
                      isLargeDataset ? "bg-[#007A33] text-white shadow-xs" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Masivo (5.000)
                  </button>
                </div>

              </div>

            </div>

            {/* Fila de estadísticas rápidas y badges */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between sm:items-center text-xs text-slate-500 border-t border-slate-50 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-600">Resultados:</span>
                <span className="bg-emerald-50 text-[#007A33] px-2.5 py-0.5 rounded-md font-mono font-bold border border-emerald-100">
                  {filteredSkills.length.toLocaleString('es-ES')}
                </span>
                <span className="text-slate-400">skills encontrados</span>
                {skillsSearch && (
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                    Filtro: "{skillsSearch}"
                  </span>
                )}
                {skillsFamilyFilter !== 'Todos' && (
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                    Familia: {skillsFamilyFilter}
                  </span>
                )}
              </div>

              {isLargeDataset && (
                <div className="flex items-center gap-1.5 text-[#007A33] font-bold">
                  <Check size={14} className="stroke-[2.5]" /> Alto Rendimiento Activo (Memoized)
                </div>
              )}
            </div>
          </div>
        )}

        {/* TABLA: SKILLS */}
        {activeTab === 'Skills' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-200">
                  <th className="py-2 pl-4 w-20">ID</th>
                  <th className="py-2 w-72">Familia / Nombre</th>
                  <th className="py-2 w-auto">Descripción del Skill</th>
                  <th className="py-2 w-40 text-center">Descriptivo</th>
                  <th className="py-2 text-center pr-4 w-32">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
                {paginatedSkills.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-16 text-center text-slate-400">
                      <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 border border-slate-100 shadow-inner">
                        <Search size={24} />
                      </div>
                      <p className="font-semibold text-slate-500 mb-1">No se encontraron registros</p>
                      <p className="text-xs text-slate-400">Prueba ajustando los filtros o restableciendo la búsqueda.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedSkills.map(skill => (
                    <tr 
                      key={skill.id} 
                      onClick={() => setSelectedSkill(skill)}
                      className="hover:bg-[#007A33]/5 transition-colors cursor-pointer group"
                    >
                      {/* ID */}
                      <td className="py-1.5 pl-4 font-mono text-xs text-slate-400">{skill.id}</td>
                      
                      {/* Nombre y Familia */}
                      <td className="py-1.5 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800 group-hover:text-[#007A33] transition-colors leading-tight">
                            {skill.name}
                          </span>
                          {(skill.isGlobalSoftSkill || families.find(f => f.name === skill.family)?.isGlobalSoftSkill) && (
                            <span className="bg-purple-100 text-purple-750 border border-purple-200 px-1.5 py-0.2 rounded text-[9px] font-extrabold tracking-wider uppercase">
                              Global
                            </span>
                          )}
                        </div>
                        <div className="mt-1">{getFamilyBadge(skill.family)}</div>
                      </td>
                      
                      {/* Descripción */}
                      <td className="py-1.5 px-3 text-slate-600 text-xs leading-normal">
                        <p className="line-clamp-2" title={skill.description}>
                          {skill.description}
                        </p>
                      </td>
                      
                      {/* Descriptivo (Rúbrica de niveles) */}
                      <td className="py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedSkill(skill)}
                          className="mx-auto bg-slate-150 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs border border-slate-200 transition-all cursor-pointer"
                        >
                          <Eye size={12} /> Ver Niveles
                        </button>
                      </td>
                      
                      {/* Acciones */}
                      <td className="py-1.5 pr-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={(e) => handleOpenEditSkill(skill, e)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar Skill"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteSkill(skill, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar Skill"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* CONTROL DE PAGINACIÓN */}
            {filteredSkills.length > 0 && (
              <div className="py-3 px-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Filas por página y conteo */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>
                    Mostrando <strong className="text-slate-800">{(startIndex + 1).toLocaleString('es-ES')}</strong> a <strong className="text-slate-800">{Math.min(startIndex + skillsPerPage, filteredSkills.length).toLocaleString('es-ES')}</strong> de <strong className="text-slate-800">{filteredSkills.length.toLocaleString('es-ES')}</strong> skills
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <span>Ver:</span>
                    <select
                      value={skillsPerPage}
                      onChange={(e) => {
                        setSkillsPerPage(Number(e.target.value));
                        setSkillsPage(1);
                      }}
                      className="bg-white border border-slate-200 text-slate-700 px-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                    </select>
                  </div>
                </div>

                {/* Botones de navegación */}
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={skillsPage === 1}
                    onClick={() => setSkillsPage(1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                    title="Primera Página"
                  >
                    <ChevronLeft size={16} className="stroke-[2.5]" />
                  </button>
                  <button
                    disabled={skillsPage === 1}
                    onClick={() => setSkillsPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors text-xs font-bold cursor-pointer"
                  >
                    Anterior
                  </button>
                  
                  {/* Selector rápido de página */}
                  <span className="px-3 text-xs font-semibold text-slate-500">
                    Pág. <strong className="text-slate-800">{skillsPage}</strong> de <strong className="text-slate-800">{totalSkillsPages}</strong>
                  </span>

                  <button
                    disabled={skillsPage === totalSkillsPages}
                    onClick={() => setSkillsPage(prev => Math.min(prev + 1, totalSkillsPages))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors text-xs font-bold cursor-pointer"
                  >
                    Siguiente
                  </button>
                  <button
                    disabled={skillsPage === totalSkillsPages}
                    onClick={() => setSkillsPage(totalSkillsPages)}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                    title="Última Página"
                  >
                    <ChevronRight size={16} className="stroke-[2.5]" />
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TABLA: ROLES (CATÁLOGO MASTER) */}
        {activeTab === 'Roles' && (
          <>
            {/* FILTROS Y CONTROLES: ROLES */}
            <div className="py-3 px-5 border-b border-slate-100 bg-white space-y-3">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                
                {/* Buscador */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-2.5 top-2 text-slate-400" size={15} />
                  <input 
                    type="text"
                    placeholder="Buscar rol por nombre o descripción..."
                    value={rolesSearch}
                    onChange={(e) => {
                      setRolesSearch(e.target.value);
                      setRolesPage(1);
                    }}
                    className="w-full pl-9 pr-9 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-[#007A33] focus:ring-1 focus:ring-[#007A33]/30 focus:outline-none transition-all shadow-sm"
                  />
                  {rolesSearch && (
                    <button 
                      onClick={() => { setRolesSearch(''); setRolesPage(1); }}
                      className="absolute right-2.5 top-1.5 p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filtro de familia de roles */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                  
                  {/* Selector de Familia */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Familia:</span>
                    <select
                      value={rolesFamilyFilter}
                      onChange={(e) => {
                        setRolesFamilyFilter(e.target.value);
                        setRolesPage(1);
                      }}
                      className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold text-[11px] focus:border-[#007A33] focus:outline-none transition-colors"
                    >
                      <option value="Todos">Todas las familias</option>
                      {roleFamilies.map(rfam => (
                        <option key={rfam.id} value={rfam.name}>{rfam.name}</option>
                      ))}
                    </select>
                  </div>

                </div>

              </div>

              {/* Fila de estadísticas rápidas */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between sm:items-center text-xs text-slate-500 border-t border-slate-50 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-600">Resultados:</span>
                  <span className="bg-emerald-50 text-[#007A33] px-2.5 py-0.5 rounded-md font-mono font-bold border border-emerald-100">
                    {filteredRoles.length.toLocaleString('es-ES')}
                  </span>
                  <span className="text-slate-400">roles encontrados</span>
                  {rolesSearch && (
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                      Filtro: "{rolesSearch}"
                    </span>
                  )}
                  {rolesFamilyFilter !== 'Todos' && (
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                      Familia: {rolesFamilyFilter}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-200">
                    <th className="py-2 pl-4 w-24">ID</th>
                    <th className="py-2 w-60">Nombre del Rol</th>
                    <th className="py-2">Descripción del Rol</th>
                    <th className="py-2 w-48">Familia de Roles</th>
                    <th className="py-2 text-center pr-4 w-32">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
                  {paginatedRoles.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-16 text-center text-slate-400">
                        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 border border-slate-100 shadow-inner">
                          <Search size={24} />
                        </div>
                        <p className="font-semibold text-slate-500 mb-1">No se encontraron roles</p>
                        <p className="text-xs text-slate-400">Prueba ajustando los filtros o restableciendo la búsqueda.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedRoles.map(role => (
                      <tr key={role.id} className="hover:bg-[#007A33]/5 transition-colors group">
                        <td className="py-1.5 pl-4 font-mono text-xs text-slate-400">{role.id}</td>
                        <td className="py-1.5 px-3">
                          <div className="font-bold text-slate-800 group-hover:text-[#007A33] transition-colors leading-tight">
                            {role.title}
                          </div>
                        </td>
                        <td className="py-1.5 px-3 text-slate-600 text-xs leading-normal animate-in fade-in">
                          {role.description || 'Sin descripción asignada.'}
                        </td>
                        <td className="py-1.5 px-3">
                          <div className="flex items-center">
                            {getRoleFamilyBadge(role.family)}
                          </div>
                        </td>
                        <td className="py-1.5 pr-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={(e) => handleOpenEditRole(role, e)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar Rol"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteRole(role, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar Rol"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* CONTROL DE PAGINACIÓN DE ROLES */}
            {filteredRoles.length > 0 && (
              <div className="py-3 px-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Filas por página y conteo */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>
                    Mostrando <strong className="text-slate-800">{(rolesStartIndex + 1).toLocaleString('es-ES')}</strong> a <strong className="text-slate-800">{Math.min(rolesStartIndex + rolesPerPage, filteredRoles.length).toLocaleString('es-ES')}</strong> de <strong className="text-slate-800">{filteredRoles.length.toLocaleString('es-ES')}</strong> roles
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <span>Ver:</span>
                    <select
                      value={rolesPerPage}
                      onChange={(e) => {
                        setRolesPerPage(Number(e.target.value));
                        setRolesPage(1);
                      }}
                      className="bg-white border border-slate-200 text-slate-700 px-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                    </select>
                  </div>
                </div>

                {/* Botones de navegación */}
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={rolesPage === 1}
                    onClick={() => setRolesPage(1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                    title="Primera Página"
                  >
                    <ChevronLeft size={16} className="stroke-[2.5]" />
                  </button>
                  <button
                    disabled={rolesPage === 1}
                    onClick={() => setRolesPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors text-xs font-bold cursor-pointer"
                  >
                    Anterior
                  </button>
                  
                  {/* Selector rápido de página */}
                  <span className="px-3 text-xs font-semibold text-slate-500">
                    Pág. <strong className="text-slate-800">{rolesPage}</strong> de <strong className="text-slate-800">{totalRolesPages}</strong>
                  </span>

                  <button
                    disabled={rolesPage === totalRolesPages}
                    onClick={() => setRolesPage(prev => Math.min(prev + 1, totalRolesPages))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors text-xs font-bold cursor-pointer"
                  >
                    Siguiente
                  </button>
                  <button
                    disabled={rolesPage === totalRolesPages}
                    onClick={() => setRolesPage(totalRolesPages)}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                    title="Última Página"
                  >
                    <ChevronRight size={16} className="stroke-[2.5]" />
                  </button>
                </div>

              </div>
            )}
          </>
        )}

        {/* TABLA: PERFIL DE ÉXITO */}
        {activeTab === 'PerfilExito' && (
          <>
            {/* FILTROS Y CONTROLES: PERFIL DE ÉXITO */}
            <div className="py-3 px-5 border-b border-slate-100 bg-white space-y-3">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                
                {/* Buscador */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-2.5 top-2 text-slate-400" size={15} />
                  <input 
                    type="text"
                    placeholder="Buscar rol por nombre o descripción..."
                    value={rolesSearch}
                    onChange={(e) => {
                      setRolesSearch(e.target.value);
                      setRolesPage(1);
                    }}
                    className="w-full pl-9 pr-9 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-[#007A33] focus:ring-1 focus:ring-[#007A33]/30 focus:outline-none transition-all shadow-sm"
                  />
                  {rolesSearch && (
                    <button 
                      onClick={() => { setRolesSearch(''); setRolesPage(1); }}
                      className="absolute right-2.5 top-1.5 p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filtro de familia de roles */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                  
                  {/* Selector de Familia */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Familia:</span>
                    <select
                      value={rolesFamilyFilter}
                      onChange={(e) => {
                        setRolesFamilyFilter(e.target.value);
                        setRolesPage(1);
                      }}
                      className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold text-[11px] focus:border-[#007A33] focus:outline-none transition-colors"
                    >
                      <option value="Todos">Todas las familias</option>
                      {roleFamilies.map(rfam => (
                        <option key={rfam.id} value={rfam.name}>{rfam.name}</option>
                      ))}
                    </select>
                  </div>

                </div>

              </div>

              {/* Fila de estadísticas rápidas */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between sm:items-center text-xs text-slate-500 border-t border-slate-50 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-600">Resultados:</span>
                  <span className="bg-emerald-50 text-[#007A33] px-2.5 py-0.5 rounded-md font-mono font-bold border border-emerald-100">
                    {filteredRoles.length.toLocaleString('es-ES')}
                  </span>
                  <span className="text-slate-400">roles encontrados</span>
                  {rolesSearch && (
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                      Filtro: "{rolesSearch}"
                  </span>
                  )}
                  {rolesFamilyFilter !== 'Todos' && (
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                      Familia: {rolesFamilyFilter}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-200">
                    <th className="py-2 pl-4">ID</th>
                    <th className="py-2">Título del Rol</th>
                    <th className="py-2">Familia</th>
                    <th className="py-2">Nivel</th>
                    <th className="py-2 w-1/3">Skills Requeridas (Prioridad)</th>
                    <th className="py-2 text-center pr-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {paginatedRoles.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-slate-400">
                        <div className="w-11 h-11 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-300 border border-slate-100 shadow-inner">
                          <Search size={20} />
                        </div>
                        <p className="font-semibold text-slate-500 mb-0.5">No se encontraron roles</p>
                        <p className="text-xs text-slate-400">Prueba ajustando los filtros o restableciendo la búsqueda.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedRoles.map(role => (
                      <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-1.5 pl-4 font-mono text-slate-400">{role.id}</td>
                        <td className="py-1.5 px-3">
                          <div className="font-bold text-slate-800 leading-tight">{role.title}</div>
                        </td>
                        <td className="py-1.5 px-3">{getRoleFamilyBadge(role.family)}</td>
                        <td className="py-1.5 px-3">
                          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {role.level}
                          </span>
                        </td>
                        <td className="py-1.5 px-3">
                          {getRoleSuccessSkills(role.id).length === 0 ? (
                            <span className="text-xs text-slate-400 italic">Sin skills de éxito configuradas.</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {getRoleSuccessSkills(role.id).map(rsk => (
                                <div key={rsk.skillId} className="flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-xs shadow-2xs">
                                  <span className="font-medium text-slate-800">{rsk.skillName}</span>
                                  <span className="bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded text-[10px] font-bold border border-emerald-100">Lv.{rsk.minLevel}</span>
                                  {rsk.priority && (
                                    <span className="bg-amber-50 text-amber-700 px-1 py-0.2 rounded text-[9px] font-bold border border-amber-100">Prio</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-1.5 pr-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={(e) => handleOpenEditPerfil(role, e)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Configurar Perfil de Éxito"
                            >
                              <Settings size={14} />
                            </button>
                            <button 
                              onClick={(e) => handleClearPerfil(role, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" 
                              title="Limpiar Perfil"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* CONTROL DE PAGINACIÓN DE PERFIL DE ÉXITO */}
            {filteredRoles.length > 0 && (
              <div className="py-3 px-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Filas por página y conteo */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>
                    Mostrando <strong className="text-slate-800">{(rolesStartIndex + 1).toLocaleString('es-ES')}</strong> a <strong className="text-slate-800">{Math.min(rolesStartIndex + rolesPerPage, filteredRoles.length).toLocaleString('es-ES')}</strong> de <strong className="text-slate-800">{filteredRoles.length.toLocaleString('es-ES')}</strong> roles
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <span>Ver:</span>
                    <select
                      value={rolesPerPage}
                      onChange={(e) => {
                        setRolesPerPage(Number(e.target.value));
                        setRolesPage(1);
                      }}
                      className="bg-white border border-slate-200 text-slate-700 px-2 py-1.5 rounded-lg text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                    </select>
                  </div>
                </div>

                {/* Botones de navegación */}
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={rolesPage === 1}
                    onClick={() => setRolesPage(1)}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                    title="Primera Página"
                  >
                    <ChevronLeft size={16} className="stroke-[2.5]" />
                  </button>
                  <button
                    disabled={rolesPage === 1}
                    onClick={() => setRolesPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors text-xs font-bold cursor-pointer"
                  >
                    Anterior
                  </button>
                  
                  {/* Selector rápido de página */}
                  <span className="px-3 text-xs font-semibold text-slate-500">
                    Pág. <strong className="text-slate-800">{rolesPage}</strong> de <strong className="text-slate-800">{totalRolesPages}</strong>
                  </span>

                  <button
                    disabled={rolesPage === totalRolesPages}
                    onClick={() => setRolesPage(prev => Math.min(prev + 1, totalRolesPages))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors text-xs font-bold cursor-pointer"
                  >
                    Siguiente
                  </button>
                  <button
                    disabled={rolesPage === totalRolesPages}
                    onClick={() => setRolesPage(totalRolesPages)}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
                    title="Última Página"
                  >
                    <ChevronRight size={16} className="stroke-[2.5]" />
                  </button>
                </div>

              </div>
            )}
          </>
        )}

        {/* TABLA: VACANTES */}
        {activeTab === 'Vacantes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-200">
                  <th className="py-2 pl-4">ID</th>
                  <th className="py-2 px-3">Título / Dpto</th>
                  <th className="py-2 px-3">Ubicación</th>
                  <th className="py-2 px-3 w-1/3">Skills Requeridas</th>
                  <th className="py-2 text-center pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {opportunitiesData.map(opp => (
                  <tr key={opp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-1.5 pl-4 font-mono text-slate-400">{opp.id}</td>
                    <td className="py-1.5 px-3">
                      <div className="font-bold text-slate-800 leading-tight">{opp.title}</div>
                      <div className="text-xs text-slate-500 leading-tight">{opp.department}</div>
                    </td>
                    <td className="py-1.5 px-3 text-slate-600 leading-tight">{opp.location}</td>
                    <td className="py-1.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {opp.requiredSkills?.map(rs => (
                          <div key={rs.name} className="flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-xs shadow-2xs">
                            <span className="font-medium text-slate-800">{rs.name}</span>
                            <span className="bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded text-[10px] font-bold border border-emerald-100">Lv.{rs.level}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-1.5 pr-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={(e) => handleOpenEditVacante(opp, e)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar Vacante"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteVacante(opp, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar Vacante"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLA: FORMACIONES */}
        {activeTab === 'Formaciones' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-200">
                  <th className="py-2 pl-4">ID</th>
                  <th className="py-2 px-3">Curso</th>
                  <th className="py-2 px-3">Tipo / Duración</th>
                  <th className="py-2 px-3">Target Lvl</th>
                  <th className="py-2 px-3">Coste</th>
                  <th className="py-2 text-center pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {coursesData.map(course => (
                  <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-1.5 pl-4 font-mono text-slate-400">{course.id}</td>
                    <td className="py-1.5 px-3">
                      <div className="font-bold text-slate-800 leading-tight">{course.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-1 leading-tight">
                        {course.skills?.map(s => (
                          <span key={s} className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-1.5 px-3">
                      <div className="font-medium text-slate-600 leading-tight">{course.type}</div>
                      <div className="text-xs text-slate-400 leading-tight">{course.duration}</div>
                    </td>
                    <td className="py-1.5 px-3">
                      <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-xs font-bold border border-emerald-100">
                        Nivel {course.targetLevel}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 font-semibold text-slate-600">
                      {course.cost > 0 ? `${course.cost}€` : 'Gratuito'}
                    </td>
                    <td className="py-1.5 pr-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={(e) => handleOpenEditFormacion(course, e)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar Formación"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteFormacion(course, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar Formación"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLA: FAMILIAS */}
        {activeTab === 'Familias' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-200">
                  <th className="py-2 pl-4 w-24">ID</th>
                  <th className="py-2 px-3 w-60">Familia de Skills</th>
                  <th className="py-2 px-3">Descripción de la Familia de Skills</th>
                  <th className="py-2 px-3 w-36 text-center">Global?</th>
                  <th className="py-2 px-3 w-36 text-center">Skills Asociadas</th>
                  <th className="py-2 text-center pr-4 w-32">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
                {families.map(fam => {
                  const associatedCount = allSkills.filter(s => s.family === fam.name).length;
                  return (
                    <tr key={fam.id} className="hover:bg-[#007A33]/5 transition-colors group">
                      <td className="py-1.5 pl-4 font-mono text-xs text-slate-400">{fam.id}</td>
                      <td className="py-1.5 px-3">
                        <div className="flex items-center">
                          {getFamilyBadge(fam.name)}
                        </div>
                      </td>
                      <td className="py-1.5 px-3 text-slate-600 text-xs leading-relaxed">
                        {fam.description}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        {fam.isGlobalSoftSkill ? (
                          <span className="bg-purple-100 text-purple-750 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shadow-2xs">
                            Global
                          </span>
                        ) : (
                          <span className="text-slate-350 text-xs italic">-</span>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <span className="bg-emerald-50 text-[#007A33] border border-emerald-100 text-xs font-mono font-bold px-2 py-0.5 rounded-md">
                          {associatedCount.toLocaleString('es-ES')}
                        </span>
                      </td>
                      <td className="py-1.5 pr-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={(e) => handleOpenEditFamily(fam, e)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar Familia"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteFamily(fam, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar Familia"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLA: NIVELES */}
        {activeTab === 'Niveles' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-200">
                  <th className="py-2 pl-4 w-24">ID</th>
                  <th className="py-2 px-3 w-60">Nivel de Rol</th>
                  <th className="py-2 px-3">Descripción del Nivel de Rol</th>
                  <th className="py-2 px-3 w-44 text-center">Roles Asociados</th>
                  <th className="py-2 text-center pr-4 w-32">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
                {levels.map(lvl => {
                  const associatedCount = rolesData.filter(r => r.level === lvl.name).length;
                  return (
                    <tr key={lvl.id} className="hover:bg-[#007A33]/5 transition-colors group">
                      <td className="py-1.5 pl-4 font-mono text-xs text-slate-400">{lvl.id}</td>
                      <td className="py-1.5 px-3">
                        <div className="flex items-center">
                          <span className="bg-emerald-50 text-[#007A33] border border-emerald-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                            {lvl.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-1.5 px-3 text-slate-600 text-xs leading-relaxed">
                        {lvl.description}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <span className="bg-emerald-50 text-[#007A33] border border-emerald-100 text-xs font-mono font-bold px-2 py-0.5 rounded-md">
                          {associatedCount.toLocaleString('es-ES')}
                        </span>
                      </td>
                      <td className="py-1.5 pr-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={(e) => handleOpenEditLevel(lvl, e)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar Nivel"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteLevel(lvl, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar Nivel"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TABLA: FAMILIAS DE ROLES */}
        {activeTab === 'FamiliasRoles' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-200">
                  <th className="py-2 pl-4 w-24">ID</th>
                  <th className="py-2 px-3 w-60">Familia de Roles</th>
                  <th className="py-2 px-3">Descripción de la Familia de Roles</th>
                  <th className="py-2 px-3 w-44 text-center">Roles Asociados</th>
                  <th className="py-2 text-center pr-4 w-32">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
                {roleFamilies.map(rfam => {
                  const associatedCount = rolesData.filter(r => r.family === rfam.name).length;
                  return (
                    <tr key={rfam.id} className="hover:bg-[#007A33]/5 transition-colors group">
                      <td className="py-1.5 pl-4 font-mono text-xs text-slate-400">{rfam.id}</td>
                      <td className="py-1.5 px-3">
                        <div className="flex items-center">
                          {getRoleFamilyBadge(rfam.name)}
                        </div>
                      </td>
                      <td className="py-1.5 px-3 text-slate-600 text-xs leading-relaxed">
                        {rfam.description}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <span className="bg-emerald-50 text-[#007A33] border border-emerald-100 text-xs font-mono font-bold px-2 py-0.5 rounded-md">
                          {associatedCount.toLocaleString('es-ES')}
                        </span>
                      </td>
                      <td className="py-1.5 pr-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={(e) => handleOpenEditRoleFamily(rfam, e)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar Familia de Roles"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteRoleFamily(rfam, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar Familia de Roles"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* DRAWER LATERAL DE DETALLE DE SKILL */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedSkill(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          ></div>
          
          {/* Panel */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-[#007A33] rounded-xl flex items-center justify-center border border-emerald-100">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Detalle del Skill</h3>
                  <span className="text-xs font-mono text-slate-400">{selectedSkill.id}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSkill(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Familia y Nombre */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getFamilyBadge(selectedSkill.family)}
                  {(selectedSkill.isGlobalSoftSkill || families.find(f => f.name === selectedSkill.family)?.isGlobalSoftSkill) && (
                    <span className="bg-purple-100 text-purple-750 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase shadow-sm">
                      Habilidad Global
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                  {selectedSkill.name}
                </h2>
              </div>
              
              {/* Descripción */}
              <div className="space-y-2 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Info size={14} /> Descripción General
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedSkill.description}
                </p>
              </div>
              
              {/* Descriptivo de niveles */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal size={14} /> Rúbrica de Niveles (Descriptivo)
                </h4>
                
                <div className="relative border-l-2 border-emerald-100 pl-6 ml-3 space-y-6">
                  {[1, 2, 3, 4].map(lvl => (
                    <div key={lvl} className="relative group">
                      
                      {/* Bullet indicador */}
                      <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-emerald-500 bg-white flex items-center justify-center transition-all group-hover:scale-125 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      </span>
                      
                      {/* Tarjeta de nivel */}
                      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs hover:shadow-md hover:border-emerald-100 transition-all">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-[#007A33] bg-emerald-50 px-2 py-0.5 rounded-md">
                            Nivel {lvl}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {lvl === 1 ? 'Básico' : lvl === 2 ? 'Autónomo' : lvl === 3 ? 'Avanzado' : 'Experto'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {selectedSkill.levels[lvl]}
                        </p>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={(e) => handleOpenEditSkill(selectedSkill, e)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                <Edit2 size={16} /> Editar Registro
              </button>
              <button 
                onClick={() => setSelectedSkill(null)}
                className="flex-1 bg-[#007A33] text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center hover:bg-[#006028] transition-colors shadow-md cursor-pointer"
              >
                Cerrar Panel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL CRUD: AÑADIR / EDITAR SKILL */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setIsSkillModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          ></div>
          
          {/* Card */}
          <form 
            onSubmit={handleSaveSkill}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingSkill ? `Editar Skill: ${editingSkill.id}` : 'Nuevo Registro de Skill'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsSkillModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Form Fields */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
              
              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Nombre de la Skill *
                </label>
                <input 
                  type="text"
                  required
                  value={skillForm.name}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Análisis de Riesgo Crediticio"
                  className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors bg-white"
                />
              </div>

              {/* Familia */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Familia de Skill *
                </label>
                <select
                  value={skillForm.family}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, family: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-slate-100 bg-white rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors cursor-pointer"
                >
                  {families.map(fam => (
                    <option key={fam.id} value={fam.name}>{fam.name}</option>
                  ))}
                </select>
              </div>
              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Descripción General *
                </label>
                <textarea 
                  required
                  rows={3}
                  value={skillForm.description}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describa brevemente el objetivo y alcance de esta competencia..."
                  className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors resize-none bg-white"
                />
              </div>

              {/* Descriptivos por Nivel */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Descriptivos por Nivel (Rúbrica)
                </h4>

                {[1, 2, 3, 4].map(lvl => (
                  <div key={lvl} className="flex gap-3 items-start">
                    <div className="bg-emerald-50 text-[#007A33] w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border border-emerald-100 mt-1 flex-shrink-0">
                      N.{lvl}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="text"
                        required
                        value={skillForm.levels[lvl]}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSkillForm(prev => ({
                            ...prev,
                            levels: { ...prev.levels, [lvl]: val }
                          }));
                        }}
                        placeholder={`Descriptor del Nivel ${lvl}...`}
                        className="w-full px-3 py-1.5 border-2 border-slate-100 rounded-xl text-xs focus:border-[#007A33] focus:outline-none transition-colors bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
              <button 
                type="button"
                onClick={() => setIsSkillModalOpen(false)}
                className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-[#007A33] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#006028] transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={16} /> Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CRUD: AÑADIR / EDITAR FAMILIA */}
      {isFamilyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setIsFamilyModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          ></div>
          
          {/* Card */}
          <form 
            onSubmit={handleSaveFamily}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingFamily ? `Editar Familia: ${editingFamily.id}` : 'Nuevo Registro de Familia de Skills'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsFamilyModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Form Fields */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
              
              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Nombre de la Familia de Skills *
                </label>
                <input 
                  type="text"
                  required
                  value={familyForm.name}
                  onChange={(e) => setFamilyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Metodología Agile"
                  className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors bg-white"
                />
              </div>

              {/* Color Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Color / Estilo del Badge *
                </label>
                <div className="flex gap-2.5 flex-wrap pt-1">
                  {[
                    { key: 'emerald', label: 'Verde (Emerald)', bg: 'bg-emerald-500 border-emerald-600 text-white' },
                    { key: 'indigo', label: 'Soft Indigo', bg: 'bg-indigo-500 border-indigo-600 text-white' },
                    { key: 'blue', label: 'Azul (Blue)', bg: 'bg-blue-500 border-blue-600 text-white' },
                    { key: 'amber', label: 'Ámbar (Amber)', bg: 'bg-amber-500 border-amber-600 text-white' },
                    { key: 'rose', label: 'Rosa/Rojo (Rose)', bg: 'bg-rose-500 border-rose-600 text-white' },
                    { key: 'violet', label: 'Violeta', bg: 'bg-violet-500 border-violet-600 text-white' },
                    { key: 'teal', label: 'Turquesa (Teal)', bg: 'bg-teal-500 border-teal-600 text-white' }
                  ].map(opt => {
                    const isSelected = familyForm.color === opt.key;
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => setFamilyForm(prev => ({ ...prev, color: opt.key }))}
                        className={clsx(
                          "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5",
                          isSelected 
                            ? `${opt.bg} shadow-md scale-105` 
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {isSelected && <Check size={12} className="stroke-[3]" />}
                        {opt.label.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Descripción de la Familia de Skills *
                </label>
                <textarea 
                  required
                  rows={3}
                  value={familyForm.description}
                  onChange={(e) => setFamilyForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describa brevemente el alcance de esta familia de skills..."
                  className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors resize-none bg-white"
                />
              </div>

              {/* Checkbox Global */}
              <div className="flex items-center gap-2 p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
                <input
                  type="checkbox"
                  id="isGlobalSoftSkillFamily"
                  checked={!!familyForm.isGlobalSoftSkill}
                  onChange={(e) => setFamilyForm(prev => ({ ...prev, isGlobalSoftSkill: e.target.checked }))}
                  className="w-4 h-4 text-purple-650 border-slate-350 rounded focus:ring-purple-500 accent-purple-650 cursor-pointer"
                />
                <label htmlFor="isGlobalSoftSkillFamily" className="text-xs font-bold text-purple-950 cursor-pointer select-none">
                  ¿Es Global? (Se evalúa transversalmente en toda la entidad)
                </label>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
              <button 
                type="button"
                onClick={() => setIsFamilyModalOpen(false)}
                className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-[#007A33] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#006028] transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={16} /> Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}


      {/* MODAL CRUD: AÑADIR / EDITAR NIVEL */}
      {isLevelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setIsLevelModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          ></div>
          
          {/* Card */}
          <form 
            onSubmit={handleSaveLevel}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingLevel ? `Editar Nivel: ${editingLevel.id}` : 'Nuevo Registro de Nivel de Rol'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsLevelModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Form Fields */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
              
              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Nombre del Nivel de Rol *
                </label>
                <input 
                  type="text"
                  required
                  value={levelForm.name}
                  onChange={(e) => setLevelForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Junior Associate, Principal Lead, etc."
                  className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors bg-white"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Descripción del Nivel de Rol *
                </label>
                <textarea 
                  required
                  rows={3}
                  value={levelForm.description}
                  onChange={(e) => setLevelForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describa brevemente las expectativas y responsabilidades de este nivel..."
                  className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors resize-none bg-white"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
              <button 
                type="button"
                onClick={() => setIsLevelModalOpen(false)}
                className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-[#007A33] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#006028] transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={16} /> Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CRUD: AÑADIR / EDITAR FAMILIA DE ROLES */}
      {isRoleFamilyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setIsRoleFamilyModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          ></div>
          
          {/* Card */}
          <form 
            onSubmit={handleSaveRoleFamily}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingRoleFamily ? `Editar Familia de Roles: ${editingRoleFamily.id}` : 'Nuevo Registro de Familia de Roles'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsRoleFamilyModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Form Fields */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
              
              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Nombre de la Familia de Roles *
                </label>
                <input 
                  type="text"
                  required
                  value={roleFamilyForm.name}
                  onChange={(e) => setRoleFamilyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Ingeniería de Software, Ciberseguridad, etc."
                  className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors bg-white"
                />
              </div>

              {/* Color Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Color / Estilo del Badge *
                </label>
                <div className="flex gap-2.5 flex-wrap pt-1">
                  {[
                    { key: 'emerald', label: 'Verde (Emerald)', bg: 'bg-emerald-500 border-emerald-600 text-white' },
                    { key: 'indigo', label: 'Soft Indigo', bg: 'bg-indigo-500 border-indigo-600 text-white' },
                    { key: 'blue', label: 'Azul (Blue)', bg: 'bg-blue-500 border-blue-600 text-white' },
                    { key: 'amber', label: 'Ámbar (Amber)', bg: 'bg-amber-500 border-amber-600 text-white' },
                    { key: 'rose', label: 'Rosa/Rojo (Rose)', bg: 'bg-rose-500 border-rose-600 text-white' },
                    { key: 'violet', label: 'Violeta', bg: 'bg-violet-500 border-violet-600 text-white' },
                    { key: 'teal', label: 'Turquesa (Teal)', bg: 'bg-teal-500 border-teal-600 text-white' }
                  ].map(opt => {
                    const isSelected = roleFamilyForm.color === opt.key;
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => setRoleFamilyForm(prev => ({ ...prev, color: opt.key }))}
                        className={clsx(
                          "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5",
                          isSelected 
                            ? `${opt.bg} shadow-md scale-105` 
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {isSelected && <Check size={12} className="stroke-[3]" />}
                        {opt.label.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Descripción de la Familia de Roles *
                </label>
                <textarea 
                  required
                  rows={3}
                  value={roleFamilyForm.description}
                  onChange={(e) => setRoleFamilyForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describa brevemente el alcance de esta familia de roles..."
                  className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors resize-none bg-white"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
              <button 
                type="button"
                onClick={() => setIsRoleFamilyModalOpen(false)}
                className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-[#007A33] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#006028] transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={16} /> Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CRUD: AÑADIR / EDITAR ROL */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setIsRoleModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          ></div>
          
          {/* Card */}
          <form 
            onSubmit={handleSaveRole}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingRole ? `Editar Rol: ${editingRole.id}` : 'Nuevo Registro de Rol'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Form Fields */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
              
              {/* Nombre del Rol */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Nombre del Rol *
                </label>
                <input 
                  type="text"
                  required
                  value={roleForm.title}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Senior Software Engineer"
                  className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors bg-white"
                />
              </div>

              {/* Familia de Roles */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Familia de Roles *
                </label>
                <select
                  value={roleForm.family}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, family: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-slate-100 bg-white rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors cursor-pointer"
                >
                  {roleFamilies.map(rfam => (
                    <option key={rfam.id} value={rfam.name}>{rfam.name}</option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Descripción del Rol *
                </label>
                <textarea 
                  required
                  rows={4}
                  value={roleForm.description}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describa brevemente las responsabilidades del rol y su aporte de valor..."
                  className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors resize-none bg-white"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
              <button 
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-[#007A33] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#006028] transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={16} /> Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CRUD: CONFIGURAR / CREAR PERFIL DE ÉXITO */}
      {isPerfilModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setIsPerfilModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          ></div>
          
          {/* Card */}
          <form 
            onSubmit={handleSavePerfil}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <ShieldAlert size={20} className="text-[#007A33]" />
                {editingPerfilRole ? `Configurar Perfil de Éxito: ${editingPerfilRole.title}` : 'Nuevo Perfil de Éxito'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsPerfilModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Form Fields */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar bg-white">
              
              {/* Bloque: Configuración Básica (Rol y Nivel) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Selector de Rol */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Seleccionar Rol *
                  </label>
                  {editingPerfilRole ? (
                    <div className="px-4 py-2.5 border border-slate-100 bg-slate-50 rounded-xl text-sm font-bold text-slate-700">
                      {editingPerfilRole.title}
                    </div>
                  ) : (
                    <select
                      value={perfilForm.roleId}
                      onChange={(e) => setPerfilForm(prev => ({ ...prev, roleId: e.target.value }))}
                      className="w-full px-4 py-2.5 border-2 border-slate-100 bg-white rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="" disabled>Seleccione un rol...</option>
                      {/* Filtramos por nombres únicos para simplificar la selección del rol genérico en el catálogo de perfiles */}
                      {Array.from(new Set(rolesData.map(r => r.title))).map(title => {
                        const r = rolesData.find(x => x.title === title);
                        return (
                          <option key={r.id} value={r.id}>{r.title} ({r.family})</option>
                        );
                      })}
                    </select>
                  )}
                </div>

                {/* Selector de Nivel de Rol */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Nivel Profesional *
                  </label>
                  <select
                    value={perfilForm.level}
                    onChange={(e) => setPerfilForm(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-slate-100 bg-white rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors cursor-pointer"
                  >
                    {levels.map(lvl => (
                      <option key={lvl.id} value={lvl.name}>{lvl.name} - {lvl.description.split(',')[0]}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Subformulario: Añadir Habilidad Requerida */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={14} /> Añadir Habilidad Requerida al Perfil
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  
                  {/* Buscador y Dropdown de Skill */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Habilidad *</label>
                    <div className="relative">
                      <select
                        value={tempSkill.name}
                        onChange={(e) => setTempSkill(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-3 pr-8 py-2.5 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:border-[#007A33] cursor-pointer"
                      >
                        <option value="" disabled>Seleccione una habilidad...</option>
                        {allSkills
                          .filter(s => {
                            // No mostrar skills ya asignadas al perfil
                            return !perfilForm.requiredSkills.some(rs => rs.name === s.name);
                          })
                          .slice(0, 100) // Limitar a las primeras 100 para no saturar el DOM
                          .map(s => (
                            <option key={s.name} value={s.name}>{s.name} ({s.family})</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  {/* Selector de Nivel de Skill (1-4) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nivel Mínimo Requerido</label>
                    <select
                      value={tempSkill.level}
                      onChange={(e) => setTempSkill(prev => ({ ...prev, level: Number(e.target.value) }))}
                      className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:border-[#007A33] cursor-pointer"
                    >
                      <option value={1}>1 - Conceptual (Teoría básica)</option>
                      <option value={2}>2 - Operativo (Autonomía básica)</option>
                      <option value={3}>3 - Avanzado (Dominio experto)</option>
                      <option value={4}>4 - Experto (Referente global)</option>
                    </select>
                  </div>

                  {/* Selector de Prioridad (Crítica, Primaria, Secundaria) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prioridad</label>
                    <select
                      value={tempSkill.priority}
                      onChange={(e) => setTempSkill(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:border-[#007A33] cursor-pointer"
                    >
                      <option value="Crítica">Crítica (Imprescindible)</option>
                      <option value="Primaria">Primaria (Importante)</option>
                      <option value="Secundaria">Secundaria (Deseable)</option>
                    </select>
                  </div>

                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!tempSkill.name) {
                        alert('Por favor, selecciona una habilidad válida.');
                        return;
                      }
                      // Validar duplicados
                      if (perfilForm.requiredSkills.some(rs => rs.name === tempSkill.name)) {
                        alert('Esta habilidad ya ha sido añadida a este perfil.');
                        return;
                      }
                      setPerfilForm(prev => ({
                        ...prev,
                        requiredSkills: [...prev.requiredSkills, { ...tempSkill }]
                      }));
                      // Limpiar / resetear tempSkill
                      const remainingSkills = allSkills.filter(s => {
                        return s.name !== tempSkill.name && !perfilForm.requiredSkills.some(rs => rs.name === s.name);
                      });
                      setTempSkill({
                        name: remainingSkills[0]?.name || '',
                        level: 3,
                        priority: 'Primaria'
                      });
                    }}
                    className="bg-[#007A33] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#006028] transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Añadir Habilidad
                  </button>
                </div>
              </div>

              {/* Listado de Habilidades Requeridas */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Habilidades en el Perfil de Éxito ({perfilForm.requiredSkills.length})
                </div>

                {perfilForm.requiredSkills.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs">
                    No se han añadido habilidades requeridas todavía. Utilice el selector superior para añadir competencias.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                    {perfilForm.requiredSkills.map((rs, index) => (
                      <div key={rs.name} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                        
                        {/* Habilidad Nombre */}
                        <div className="flex-1">
                          <span className="font-bold text-slate-800 text-sm">{rs.name}</span>
                        </div>

                        {/* Interactive Level Indicators (Dots) */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Nivel:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map(val => {
                              const active = rs.level >= val;
                              return (
                                <button
                                  type="button"
                                  key={val}
                                  onClick={() => {
                                    setPerfilForm(prev => ({
                                      ...prev,
                                      requiredSkills: prev.requiredSkills.map((item, idx) => 
                                        idx === index ? { ...item, level: val } : item
                                      )
                                    }));
                                  }}
                                  className={clsx(
                                    "w-3.5 h-3.5 rounded-full transition-all cursor-pointer",
                                    active ? "bg-[#007A33] hover:bg-[#006028]" : "bg-slate-100 hover:bg-slate-200 border border-slate-200"
                                  )}
                                  title={`Nivel ${val}`}
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* Priority Selector Badge */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Prioridad:</span>
                          <select
                            value={rs.priority}
                            onChange={(e) => {
                              const newPriority = e.target.value;
                              setPerfilForm(prev => ({
                                ...prev,
                                requiredSkills: prev.requiredSkills.map((item, idx) => 
                                  idx === index ? { ...item, priority: newPriority } : item
                                )
                              }));
                            }}
                            className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold text-[10px] focus:outline-none cursor-pointer"
                          >
                            <option value="Crítica">Crítica</option>
                            <option value="Primaria">Primaria</option>
                            <option value="Secundaria">Secundaria</option>
                          </select>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setPerfilForm(prev => ({
                              ...prev,
                              requiredSkills: prev.requiredSkills.filter((_, idx) => idx !== index)
                            }));
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Quitar Habilidad"
                        >
                          <Trash2 size={14} />
                        </button>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
              <button 
                type="button"
                onClick={() => setIsPerfilModalOpen(false)}
                className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-[#007A33] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#006028] transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={16} /> Guardar Perfil de Éxito
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CRUD: CREAR / EDITAR VACANTE */}
      {isVacanteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setIsVacanteModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          ></div>
          
          {/* Card */}
          <form 
            onSubmit={handleSaveVacante}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Briefcase size={20} className="text-[#007A33]" />
                {editingVacante ? `Modificar Vacante: ${editingVacante.title}` : 'Nueva Vacante'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsVacanteModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Form Fields */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar bg-white">
              
              {/* Bloque: Configuración Básica (Título, Dpto y Ubicación) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Título de la vacante */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Título de la Vacante *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Senior Frontend Developer"
                    value={vacanteForm.title}
                    onChange={(e) => setVacanteForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-slate-100 bg-white rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors"
                  />
                </div>

                {/* Departamento */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Departamento / Área *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Banca Digital, Infraestructura"
                    value={vacanteForm.department}
                    onChange={(e) => setVacanteForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-slate-100 bg-white rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors"
                  />
                </div>

                {/* Ubicación */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Ubicación *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Madrid / Híbrido, Remoto"
                    value={vacanteForm.location}
                    onChange={(e) => setVacanteForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-slate-100 bg-white rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors"
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Descripción del Puesto
                  </label>
                  <textarea
                    placeholder="Describe los requisitos, responsabilidades y contexto de la vacante..."
                    rows={3}
                    value={vacanteForm.description}
                    onChange={(e) => setVacanteForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-slate-100 bg-white rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors resize-none"
                  />
                </div>

              </div>

              {/* Subformulario: Añadir Habilidad Requerida */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={14} /> Añadir Habilidad Requerida a la Vacante
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                  
                  {/* Buscador y Dropdown de Skill */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Habilidad *</label>
                    <div className="relative">
                      <select
                        value={tempVacanteSkill.name}
                        onChange={(e) => setTempVacanteSkill(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-3 pr-8 py-2.5 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:border-[#007A33] cursor-pointer"
                      >
                        <option value="" disabled>Seleccione una habilidad...</option>
                        {allSkills
                          .filter(s => {
                            // No mostrar skills ya asignadas
                            return !vacanteForm.requiredSkills.some(rs => rs.name === s.name);
                          })
                          .slice(0, 100)
                          .map(s => (
                            <option key={s.name} value={s.name}>{s.name} ({s.family})</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  {/* Selector de Nivel de Skill (1-5) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nivel Requerido</label>
                    <select
                      value={tempVacanteSkill.level}
                      onChange={(e) => setTempVacanteSkill(prev => ({ ...prev, level: Number(e.target.value) }))}
                      className="w-full px-3 py-2.5 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:border-[#007A33] cursor-pointer"
                    >
                      <option value={1}>1 - Conceptual (Teoría básica)</option>
                      <option value={2}>2 - Operativo (Autonomía básica)</option>
                      <option value={3}>3 - Avanzado (Dominio experto)</option>
                      <option value={4}>4 - Experto (Referente global)</option>
                      <option value={5}>5 - Master (Líder / Creador)</option>
                    </select>
                  </div>

                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!tempVacanteSkill.name) {
                        alert('Por favor, selecciona una habilidad válida.');
                        return;
                      }
                      if (vacanteForm.requiredSkills.some(rs => rs.name === tempVacanteSkill.name)) {
                        alert('Esta habilidad ya ha sido añadida a la vacante.');
                        return;
                      }
                      setVacanteForm(prev => ({
                        ...prev,
                        requiredSkills: [...prev.requiredSkills, { ...tempVacanteSkill }]
                      }));
                      // Resetear tempVacanteSkill
                      const remainingSkills = allSkills.filter(s => {
                        return s.name !== tempVacanteSkill.name && !vacanteForm.requiredSkills.some(rs => rs.name === s.name);
                      });
                      setTempVacanteSkill({
                        name: remainingSkills[0]?.name || '',
                        level: 3
                      });
                    }}
                    className="bg-[#007A33] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#006028] transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Añadir Habilidad
                  </button>
                </div>
              </div>

              {/* Listado de Habilidades Requeridas */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Habilidades Requeridas ({vacanteForm.requiredSkills.length})
                </div>

                {vacanteForm.requiredSkills.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
                    No hay habilidades seleccionadas para esta vacante todavía.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {vacanteForm.requiredSkills.map((rs, index) => (
                      <div 
                        key={rs.name} 
                        className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl shadow-2xs hover:border-slate-200 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700 leading-tight">{rs.name}</span>
                          <span className="text-[10px] text-emerald-700 font-bold mt-0.5">Lv.{rs.level}</span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setVacanteForm(prev => ({
                              ...prev,
                              requiredSkills: prev.requiredSkills.filter((_, idx) => idx !== index)
                            }));
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Quitar Habilidad"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
              <button 
                type="button"
                onClick={() => setIsVacanteModalOpen(false)}
                className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-[#007A33] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#006028] transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={16} /> Guardar Vacante
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CRUD: CREAR / EDITAR FORMACIÓN */}
      {isFormacionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={() => setIsFormacionModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          ></div>
          
          {/* Card */}
          <form 
            onSubmit={handleSaveFormacion}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <GraduationCap size={20} className="text-[#007A33]" />
                {editingFormacion ? `Modificar Formación: ${editingFormacion.title}` : 'Nueva Formación'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsFormacionModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Form Fields */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar bg-white">
              
              {/* Bloque: Configuración Básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Título de la formación */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Título del Curso / Formación *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Certificación AWS Solutions Architect"
                    value={formacionForm.title}
                    onChange={(e) => setFormacionForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-slate-100 bg-white rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors"
                  />
                </div>

                {/* Tipo de Formación */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Tipo de Formación *
                  </label>
                  <select
                    value={formacionForm.type}
                    onChange={(e) => setFormacionForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-slate-100 bg-white rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Técnico">Técnico</option>
                    <option value="Soft Skill">Soft Skill</option>
                    <option value="Metodología">Metodología</option>
                    <option value="Negocio">Negocio</option>
                  </select>
                </div>

                {/* Duración */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Duración *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 40h, 15h, 60h"
                    value={formacionForm.duration}
                    onChange={(e) => setFormacionForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-slate-100 bg-white rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors"
                  />
                </div>

                {/* Coste */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Coste (€) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0 para Gratuito"
                    value={formacionForm.cost}
                    onChange={(e) => setFormacionForm(prev => ({ ...prev, cost: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-slate-100 bg-white rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors"
                  />
                </div>

                {/* Nivel Recomendado */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Nivel Recomendado (Target Lvl) *
                  </label>
                  <select
                    value={formacionForm.targetLevel}
                    onChange={(e) => setFormacionForm(prev => ({ ...prev, targetLevel: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 border-2 border-slate-100 bg-white rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value={1}>Nivel 1 - Básico / Conceptual</option>
                    <option value={2}>Nivel 2 - Autónomo / Operativo</option>
                    <option value={3}>Nivel 3 - Avanzado / Experto</option>
                    <option value={4}>Nivel 4 - Experto / Referente</option>
                    <option value={5}>Nivel 5 - Líder / Master</option>
                  </select>
                </div>

                {/* Imagen del Curso */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    URL de Imagen del Curso (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formacionForm.image}
                    onChange={(e) => setFormacionForm(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-slate-100 bg-white rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors"
                  />
                </div>

              </div>

              {/* Subformulario: Añadir Habilidad Desarrollada */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={14} /> Asociar Habilidad a la Formación
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  
                  {/* Selector de Skill */}
                  <div className="space-y-1 md:col-span-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Habilidad *</label>
                    <select
                      value={tempFormacionSkillName}
                      onChange={(e) => setTempFormacionSkillName(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:border-[#007A33] cursor-pointer"
                    >
                      <option value="" disabled>Seleccione una habilidad...</option>
                      {allSkills
                        .filter(s => {
                          // No mostrar skills ya asociadas
                          return !formacionForm.skills.includes(s.name);
                        })
                        .slice(0, 100)
                        .map(s => (
                          <option key={s.name} value={s.name}>{s.name} ({s.family})</option>
                        ))
                      }
                    </select>
                  </div>

                  {/* Botón Añadir */}
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!tempFormacionSkillName) {
                          alert('Por favor, selecciona una habilidad válida.');
                          return;
                        }
                        if (formacionForm.skills.includes(tempFormacionSkillName)) {
                          alert('Esta habilidad ya está asociada a la formación.');
                          return;
                        }
                        setFormacionForm(prev => ({
                          ...prev,
                          skills: [...prev.skills, tempFormacionSkillName]
                        }));
                        // Resetear tempFormacionSkillName a otra habilidad disponible
                        const remainingSkills = allSkills.filter(s => {
                          return s.name !== tempFormacionSkillName && !formacionForm.skills.includes(s.name);
                        });
                        setTempFormacionSkillName(remainingSkills[0]?.name || '');
                      }}
                      className="w-full bg-[#007A33] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#006028] transition-colors shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} /> Añadir
                    </button>
                  </div>
                </div>
              </div>

              {/* Listado de Habilidades Asociadas */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Habilidades Desarrolladas por la Formación ({formacionForm.skills.length})
                </div>

                {formacionForm.skills.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
                    No hay habilidades seleccionadas para esta formación todavía.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formacionForm.skills.map((skillName, index) => (
                      <div 
                        key={skillName} 
                        className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl shadow-2xs hover:border-slate-200 transition-colors"
                      >
                        <span className="text-xs font-bold text-slate-700 leading-tight">{skillName}</span>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setFormacionForm(prev => ({
                              ...prev,
                              skills: prev.skills.filter((_, idx) => idx !== index)
                            }));
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Quitar Habilidad"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
              <button 
                type="button"
                onClick={() => setIsFormacionModalOpen(false)}
                className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-[#007A33] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#006028] transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={16} /> Guardar Formación
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
