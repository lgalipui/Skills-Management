import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Users, Search, Plus, Edit2, Trash2, ShieldAlert,
  ChevronLeft, ChevronRight, ChevronDown, Check, X, Info, GitFork, Network,
  Briefcase, Award, TrendingUp, HelpCircle, FileSpreadsheet,
  Download, Upload, AlertCircle
} from 'lucide-react';
import clsx from 'clsx';

export const WorkforceManagement = () => {
  const { 
    currentUser, 
    users, 
    orgUnits, 
    rolesData, 
    levels, 
    roleFamilies,
    addUser, 
    updateUser, 
    deleteUser, 
    addOrgUnit, 
    updateOrgUnit, 
    deleteOrgUnit 
  } = useAuth();

  // Control de acceso para perfiles que no sean de RRHH
  if (!currentUser || currentUser.profile !== 'RRHH') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/60 backdrop-blur-md border border-slate-100 rounded-3xl shadow-xl max-w-2xl mx-auto my-12 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-md border border-rose-100">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Acceso Restringido</h2>
        <p className="text-slate-500 mt-4 max-w-md mx-auto leading-relaxed">
          Esta sección contiene información confidencial de personal y está restringida únicamente para administradores de <strong>Recursos Humanos (RRHH)</strong>.
        </p>
        <div className="mt-8 p-6 bg-slate-50/80 rounded-2xl border border-slate-150 inline-flex flex-col items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulación de Perfil</span>
          <span className="text-sm text-slate-600 leading-relaxed">
            Por favor, cambia el perfil de simulación en el selector de la cabecera superior a <strong>RRHH (Elena R.)</strong> para acceder de inmediato.
          </span>
        </div>
      </div>
    );
  }

  // --- ESTADOS DE PESTAÑAS ---
  const [activeTab, setActiveTab] = useState('empleados'); // 'empleados' o 'organizacion'

  // --- ESTADOS DE FILTROS (PESTAÑA EMPLEADOS) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Todos');
  const [selectedLevel, setSelectedLevel] = useState('Todos');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('Todos');

  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Restablecer a la página 1 cuando cambia algún filtro de empleados
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedLevel, selectedOrgFilter]);

  // --- ESTADO DE FILTRO (PESTAÑA ORGANIZACIÓN) ---
  const [selectedOrgUnitId, setSelectedOrgUnitId] = useState(null);
  const [includeSubunits, setIncludeSubunits] = useState(true);
  const [orgViewMode, setOrgViewMode] = useState('columnas'); // 'columnas' o 'arbol'

  // --- ESTADOS DE CONTROL DE EXPANSIÓN DE ÁRBOL ---
  const [expandedNodes, setExpandedNodes] = useState({ 'org-1': true, 'org-6': true });

  // --- ESTADOS DE ALERTAS DE INTEGRIDAD ---
  const [integrityError, setIntegrityError] = useState(null);

  // --- ESTADOS DE MODALES ---
  // Modal de Empleado
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: '',
    level: 'Junior',
    profile: 'Employee',
    orgUnitId: '',
    managerId: ''
  });

  // Modal de Unidad Organizativa
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [orgParent, setOrgParent] = useState(null);
  const [orgForm, setOrgForm] = useState({
    name: '',
    type: 'Dirección General',
    parentId: null
  });

  // Modal de Importación Masiva (Excel / CSV)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importType, setImportType] = useState('empleados'); // 'empleados' o 'organizacion'
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // --- MÉTODOS DEL ÁRBOL ---
  const toggleNode = (nodeId, e) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Encontrar descendientes recursivos
  const getDescendantIds = (units, parentId) => {
    const children = units.filter(u => u.parentId === parentId);
    let ids = children.map(c => c.id);
    children.forEach(c => {
      ids = [...ids, ...getDescendantIds(units, c.id)];
    });
    return ids;
  };

  // Breadcrumb para la unidad
  const getUnitBreadcrumb = (unitId) => {
    if (!unitId) return 'Sin asignar';
    const path = [];
    let current = orgUnits.find(u => u.id === unitId);
    while (current) {
      path.unshift(current.name);
      current = orgUnits.find(u => u.id === current.parentId);
    }
    return path.join(' > ');
  };

  // Abreviar el tipo de unidad
  const getUnitTypeLabel = (type) => {
    switch (type) {
      case 'Dirección General': return 'DG';
      case 'Subdirección General': return 'SG';
      case 'Dirección de División': return 'DD';
      case 'Dirección de Área': return 'DA';
      case 'Oficina': return 'Oficina';
      default: return '';
    }
  };

  // Color de badge por tipo de unidad
  const getUnitTypeStyles = (type) => {
    switch (type) {
      case 'Dirección General': return 'bg-emerald-50 text-[#007A33] border-emerald-200';
      case 'Subdirección General': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Dirección de División': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Dirección de Área': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Oficina': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  // Color de badge de Familia de Rol
  const getRoleFamilyColorStyles = (roleTitle) => {
    const role = rolesData.find(r => r.title === roleTitle);
    if (!role) return 'bg-slate-50 text-slate-700 border-slate-200';
    
    const family = roleFamilies.find(f => f.name === role.family);
    const color = family ? family.color : 'blue';

    switch (color) {
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'indigo': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'rose': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'amber': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // --- FILTRADO DE LA PLANTILLA DE EMPLEADOS ---
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 1. Filtro por búsqueda de texto
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        user.name.toLowerCase().includes(searchLower) || 
        (user.email && user.email.toLowerCase().includes(searchLower));

      // 2. Filtro por Rol
      const matchesRole = selectedRole === 'Todos' || user.role === selectedRole;

      // 3. Filtro por Nivel
      const matchesLevel = selectedLevel === 'Todos' || user.level === selectedLevel;

      // 4. Filtro por Unidad Organizativa en empleados
      let matchesOrg = true;
      if (selectedOrgFilter !== 'Todos') {
        const descendantIds = [selectedOrgFilter, ...getDescendantIds(orgUnits, selectedOrgFilter)];
        matchesOrg = descendantIds.includes(user.orgUnitId);
      }

      return matchesSearch && matchesRole && matchesLevel && matchesOrg;
    });
  }, [users, orgUnits, searchTerm, selectedRole, selectedLevel, selectedOrgFilter]);

  // --- CÁLCULOS DE PAGINACIÓN ---
  const totalPages = useMemo(() => {
    return Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  }, [filteredUsers, itemsPerPage]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const range = 1; // Number of pages to show around current page
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - range && i <= currentPage + range)
      ) {
        pages.push(i);
      } else if (
        pages[pages.length - 1] !== '...'
      ) {
        pages.push('...');
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  // --- EMPLEADOS FILTRADOS PARA LA UNIDAD SELECCIONADA EN LA PESTAÑA ORGANIZACIÓN ---
  const orgEmployeesFiltered = useMemo(() => {
    if (!selectedOrgUnitId) return [];
    
    if (includeSubunits) {
      const descendantIds = [selectedOrgUnitId, ...getDescendantIds(orgUnits, selectedOrgUnitId)];
      return users.filter(u => descendantIds.includes(u.orgUnitId));
    } else {
      return users.filter(u => u.orgUnitId === selectedOrgUnitId);
    }
  }, [users, orgUnits, selectedOrgUnitId, includeSubunits]);

  // --- LINAGE DE SELECCIÓN COMPUTADO REACTIVAMENTE (Ancestros) ---
  const activePathIds = useMemo(() => {
    const path = [];
    if (!selectedOrgUnitId) return path;
    let current = orgUnits.find(u => u.id === selectedOrgUnitId);
    while (current) {
      path.push(current.id);
      current = orgUnits.find(u => u.id === current.parentId);
    }
    return path;
  }, [orgUnits, selectedOrgUnitId]);

  const activeDG = useMemo(() => {
    const id = activePathIds.find(id => orgUnits.find(u => u.id === id)?.type === 'Dirección General');
    return id ? orgUnits.find(u => u.id === id) : null;
  }, [activePathIds, orgUnits]);

  const activeSG = useMemo(() => {
    const id = activePathIds.find(id => orgUnits.find(u => u.id === id)?.type === 'Subdirección General');
    return id ? orgUnits.find(u => u.id === id) : null;
  }, [activePathIds, orgUnits]);

  const activeDD = useMemo(() => {
    const id = activePathIds.find(id => orgUnits.find(u => u.id === id)?.type === 'Dirección de División');
    return id ? orgUnits.find(u => u.id === id) : null;
  }, [activePathIds, orgUnits]);

  const activeDA = useMemo(() => {
    const id = activePathIds.find(id => orgUnits.find(u => u.id === id)?.type === 'Dirección de Área');
    return id ? orgUnits.find(u => u.id === id) : null;
  }, [activePathIds, orgUnits]);

  // --- DATOS ESTADÍSTICOS EN TIEMPO REAL ---
  const stats = useMemo(() => {
    const total = users.length;
    const assigned = users.filter(u => u.orgUnitId).length;
    const unassigned = total - assigned;
    const avgSkills = total > 0 ? (users.reduce((acc, curr) => acc + (curr.skills?.length || 0), 0) / total).toFixed(1) : 0;
    
    return { total, assigned, unassigned, avgSkills };
  }, [users]);

  // --- PREVENCIÓN DE BUCLES EN EL SELECTOR DE MÁNAGER ---
  const wouldCreateCycle = (proposedManagerId, currentUserId) => {
    if (!proposedManagerId || !currentUserId) return false;
    if (parseInt(proposedManagerId) === parseInt(currentUserId)) return true;
    
    let current = users.find(u => u.id === parseInt(proposedManagerId));
    while (current) {
      if (current.managerId === parseInt(currentUserId)) return true;
      current = users.find(u => u.id === current.managerId);
    }
    return false;
  };

  // --- CONTROLADORES CRUD DE EMPLEADOS ---
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      email: '',
      role: rolesData[0]?.title || '',
      level: levels[0]?.name || 'Junior',
      profile: 'Employee',
      orgUnitId: selectedOrgFilter !== 'Todos' ? selectedOrgFilter : '',
      managerId: ''
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email || '',
      role: user.role || '',
      level: user.level || 'Junior',
      profile: user.profile || 'Employee',
      orgUnitId: user.orgUnitId || '',
      managerId: user.managerId ? String(user.managerId) : ''
    });
    setIsUserModalOpen(true);
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => {
      const updated = { ...prev, [name]: value };
      // Autogenerar email a partir del nombre
      if (name === 'name') {
        const cleanedName = value.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
          .trim()
          .replace(/\s+/g, '.');
        updated.email = cleanedName ? `${cleanedName}@cajamar.com` : '';
      }
      return updated;
    });
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!userForm.name.trim()) return;

    const data = {
      ...userForm,
      managerId: userForm.managerId ? parseInt(userForm.managerId) : null,
      orgUnitId: userForm.orgUnitId || null
    };

    if (editingUser) {
      // Validar ciclo de mánager
      if (data.managerId && wouldCreateCycle(data.managerId, editingUser.id)) {
        alert("Error de integridad: La asignación de mánager crea una relación circular.");
        return;
      }
      updateUser(editingUser.id, data);
    } else {
      addUser(data);
    }
    setIsUserModalOpen(false);
  };

  const handleDeleteUserClick = (userId, userName) => {
    if (window.confirm(`¿Estás seguro de que deseas dar de baja al empleado "${userName}"?`)) {
      deleteUser(userId);
    }
  };

  // --- CONTROLADORES CRUD DE UNIDADES ORGANIZATIVAS ---
  const handleOpenAddOrg = (parentUnit = null) => {
    setEditingOrg(null);
    setOrgParent(parentUnit);
    
    // Determinar el tipo de unidad según el nivel del padre
    let type = 'Dirección General';
    if (parentUnit) {
      if (parentUnit.type === 'Dirección General') type = 'Subdirección General';
      else if (parentUnit.type === 'Subdirección General') type = 'Dirección de División';
      else if (parentUnit.type === 'Dirección de División') type = 'Dirección de Área';
      else if (parentUnit.type === 'Dirección de Área') type = 'Oficina';
    }

    setOrgForm({
      name: '',
      type,
      parentId: parentUnit ? parentUnit.id : null
    });
    setIsOrgModalOpen(true);
  };

  const handleOpenEditOrg = (unit) => {
    setEditingOrg(unit);
    setOrgParent(orgUnits.find(u => u.id === unit.parentId));
    setOrgForm({
      name: unit.name,
      type: unit.type,
      parentId: unit.parentId
    });
    setIsOrgModalOpen(true);
  };

  const handleSaveOrg = (e) => {
    e.preventDefault();
    if (!orgForm.name.trim()) return;

    if (editingOrg) {
      updateOrgUnit(editingOrg.id, { 
        name: orgForm.name,
        parentId: orgForm.parentId
      });
    } else {
      addOrgUnit(orgForm);
    }
    setIsOrgModalOpen(false);
  };

  const handleDeleteOrgClick = (unit) => {
    // 1. Validar si tiene subunidades
    const hasChildren = orgUnits.some(u => u.parentId === unit.id);
    if (hasChildren) {
      setIntegrityError({
        title: 'Error de Borrado Seguro',
        message: `No es posible eliminar "${unit.name}" porque contiene subunidades activas en el árbol organizativo. Debes eliminar primero sus subunidades o reubicarlas.`
      });
      return;
    }

    // 2. Validar si tiene empleados asignados
    const hasEmployees = users.some(u => u.orgUnitId === unit.id);
    if (hasEmployees) {
      const assigned = users.filter(u => u.orgUnitId === unit.id).map(u => u.name).join(', ');
      setIntegrityError({
        title: 'Error de Integridad Referencial',
        message: `No es posible eliminar "${unit.name}" porque tiene empleados activamente asignados: [${assigned}]. Debes reasignar a estos empleados a otra unidad antes de proceder.`
      });
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar la unidad organizativa "${unit.name}"?`)) {
      deleteOrgUnit(unit.id);
      if (selectedOrgUnitId === unit.id) {
        setSelectedOrgUnitId(null);
      }
    }
  };

  // --- LÓGICA DE CARGA MASIVA (CSV EXCEL SIMULADO) ---
  const handleOpenImportModal = (type) => {
    setImportType(type);
    setImportText('');
    setImportError('');
    setImportSuccessMsg('');
    setIsImportModalOpen(true);
  };

  const loadExampleImportText = () => {
    if (importType === 'empleados') {
      setImportText(
        `Nombre, Rol, Nivel, Email, ID Unidad, ID Mánager\n` +
        `Laura López, Senior Developer, Senior, laura.lopez@cajamar.com, org-4, 2\n` +
        `Rubén Díaz, Tech Lead, Lead, ruben.diaz@cajamar.com, org-3, 3\n` +
        `María Gómez, Analista Programador, Junior, maria.gomez@cajamar.com, org-5, 2`
      );
    } else {
      setImportText(
        `Nombre, Tipo, ID Padre\n` +
        `Dirección de Área de Ciberseguridad, Dirección de Área, org-2\n` +
        `Oficina de Seguridad Móvil, Oficina, org-3\n` +
        `Oficina de Prevención del Fraude, Oficina, org-3`
      );
    }
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    setImportError('');
    setImportSuccessMsg('');

    if (!importText.trim()) {
      setImportError('Por favor, ingresa o pega datos estructurados CSV para realizar la importación.');
      return;
    }

    const lines = importText.split('\n');
    let importedCount = 0;
    const errors = [];

    if (importType === 'empleados') {
      // Formato: Nombre, Rol, Nivel, Email, ID Unidad, ID Mánager
      lines.forEach((line, index) => {
        if (index === 0 && (line.toLowerCase().includes('nombre') || line.toLowerCase().includes('rol'))) {
          return; // Saltarse la cabecera
        }
        if (!line.trim()) return;

        const parts = line.split(',').map(p => p.trim());
        if (parts.length < 3) {
          errors.push(`Línea ${index + 1}: Columnas insuficientes (Nombre, Rol, Nivel requeridos).`);
          return;
        }

        const [name, role, level, email, orgUnitId, managerId] = parts;

        if (!name) {
          errors.push(`Línea ${index + 1}: Nombre es obligatorio.`);
          return;
        }

        const cleanedName = name.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .trim()
          .replace(/\s+/g, '.');
        const finalEmail = email || `${cleanedName}@cajamar.com`;

        addUser({
          name,
          role: role || rolesData[0]?.title || '',
          level: level || 'Junior',
          email: finalEmail,
          orgUnitId: orgUnitId || null,
          managerId: managerId ? parseInt(managerId) : null,
          profile: 'Employee',
          skills: [],
          badges: []
        });
        importedCount++;
      });
    } else {
      // Formato: Nombre, Tipo, ID Padre
      lines.forEach((line, index) => {
        if (index === 0 && (line.toLowerCase().includes('nombre') || line.toLowerCase().includes('tipo'))) {
          return; // Saltarse la cabecera
        }
        if (!line.trim()) return;

        const parts = line.split(',').map(p => p.trim());
        if (parts.length < 2) {
          errors.push(`Línea ${index + 1}: Columnas insuficientes (Nombre, Tipo requeridos).`);
          return;
        }

        const [name, type, parentId] = parts;

        if (!name || !type) {
          errors.push(`Línea ${index + 1}: Nombre y Tipo de unidad obligatorios.`);
          return;
        }

        const allowedTypes = ['Dirección General', 'Subdirección General', 'Dirección de División', 'Dirección de Área', 'Oficina'];
        if (!allowedTypes.includes(type)) {
          errors.push(`Línea ${index + 1}: Tipo "${type}" no permitido. Debe ser Dirección General, Subdirección General, Dirección de División, Dirección de Área o Oficina.`);
          return;
        }

        addOrgUnit({
          name,
          type,
          parentId: parentId || null
        });
        importedCount++;
      });
    }

    if (errors.length > 0) {
      setImportError(errors.slice(0, 3).join(' | ') + (errors.length > 3 ? ` ...y ${errors.length - 3} errores más` : ''));
    } else {
      setImportSuccessMsg(`¡Carga Masiva Exitosa! Se han importado correctamente ${importedCount} registros al estado en memoria.`);
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportSuccessMsg('');
        setImportText('');
      }, 2000);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Simular lectura de archivo
      loadExampleImportText();
    }
  };

  // --- RENDERIZADO DEL ÁRBOL (RECURSIVO INTERACTIVO) ---
  const renderTree = (nodes) => {
    return (
      <ul className="space-y-1 pl-4 border-l border-slate-100 ml-2">
        {nodes.map(node => {
          const children = orgUnits.filter(u => u.parentId === node.id);
          const hasChildren = children.length > 0;
          const isExpanded = expandedNodes[node.id];
          const isSelected = selectedOrgUnitId === node.id;
          const assignedCount = users.filter(u => u.orgUnitId === node.id).length;
          
          return (
            <li key={node.id} className="group/item">
              <div 
                className={clsx(
                  "flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-250 cursor-pointer select-none",
                  isSelected 
                    ? "bg-emerald-50 border border-emerald-155 shadow-[0_2px_8px_rgba(16,185,129,0.06)]" 
                    : "hover:bg-slate-50/60 border border-transparent"
                )}
                onClick={() => setSelectedOrgUnitId(node.id === selectedOrgUnitId ? null : node.id)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <button 
                    onClick={(e) => toggleNode(node.id, e)}
                    className={clsx(
                      "p-0.5 rounded hover:bg-slate-200/50 text-slate-400 transition-colors shrink-0",
                      !hasChildren && "opacity-0 cursor-default pointer-events-none"
                    )}
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  <div className={clsx(
                    "w-6 h-6 rounded-lg flex items-center justify-center shadow-sm shrink-0 border",
                    node.type === 'Dirección General' && 'bg-emerald-50 text-[#007A33] border-emerald-200',
                    node.type === 'Subdirección General' && 'bg-blue-50 text-blue-650 border-blue-200',
                    node.type === 'Dirección de División' && 'bg-indigo-50 text-indigo-650 border-indigo-200',
                    node.type === 'Dirección de Área' && 'bg-purple-50 text-purple-650 border-purple-200',
                    node.type === 'Oficina' && 'bg-amber-50 text-amber-600 border-amber-250'
                  )}>
                    {node.type === 'Dirección General' && <Building2 size={12} />}
                    {node.type === 'Subdirección General' && <GitFork size={12} />}
                    {node.type === 'Dirección de División' && <TrendingUp size={12} />}
                    {node.type === 'Dirección de Área' && <Network size={12} />}
                    {node.type === 'Oficina' && <Briefcase size={12} />}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-700 truncate">
                      {node.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={clsx(
                        "text-[9px] px-1 py-0.1 rounded border font-medium uppercase tracking-wider",
                        getUnitTypeStyles(node.type)
                      )}>
                        {getUnitTypeLabel(node.type)}
                      </span>
                      {assignedCount > 0 && (
                        <span className="text-[9px] text-slate-400 font-medium">
                          • {assignedCount} {assignedCount === 1 ? 'empleado' : 'empleados'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones en Hover */}
                <div className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1 transition-opacity shrink-0 ml-4">
                  {node.type !== 'Oficina' && (
                    <button 
                      title="Añadir Subunidad"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddOrg(node);
                      }}
                      className="p-1 text-slate-400 hover:text-[#007A33] hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                    >
                      <Plus size={12} />
                    </button>
                  )}
                  <button 
                    title="Renombrar Unidad"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditOrg(node);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                    title="Eliminar Unidad"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOrgClick(node);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {hasChildren && isExpanded && renderTree(children)}
            </li>
          );
        })}
      </ul>
    );
  };

  const rootUnits = orgUnits.filter(u => u.parentId === null);

  // --- MILLER COLUMNS RENDER HELPER ---
  const renderColumn = (levelTitle, shortLabel, units, activeUnit, parentUnit, badgeStyles) => {
    // Verificar si el padre está seleccionado para habilitar la columna
    // Excepto para Dirección General que no tiene padre
    const isEnabled = levelTitle === 'Dirección General' || !!parentUnit;

    return (
      <div 
        className={clsx(
          "flex-1 min-w-[240px] max-w-[280px] h-[360px] bg-slate-50/50 rounded-2xl border flex flex-col overflow-hidden transition-all duration-300",
          isEnabled 
            ? "border-slate-200 shadow-sm" 
            : "border-slate-100 opacity-40 select-none pointer-events-none"
        )}
      >
        {/* Cabecera de Columna */}
        <div className="px-3.5 py-3 bg-white border-b border-slate-150 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={clsx(
              "text-[9px] px-1 py-0.2 rounded border font-extrabold uppercase shrink-0 tracking-wider",
              badgeStyles
            )}>
              {shortLabel}
            </span>
            <h3 className="text-xs font-extrabold text-slate-700 truncate" title={levelTitle}>
              {levelTitle}
            </h3>
          </div>
          
          {isEnabled && levelTitle !== 'Oficina' && (
            <button 
              type="button"
              title={`Añadir ${levelTitle}`}
              onClick={() => handleOpenAddOrg(parentUnit)}
              className="p-1 text-slate-400 hover:text-[#007A33] hover:bg-emerald-50 rounded-lg transition-colors border border-slate-150 hover:border-emerald-200 shadow-2xs shrink-0"
            >
              <Plus size={13} />
            </button>
          )}
        </div>

        {/* Listado de Unidades */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
          {!isEnabled ? (
            <div className="h-full flex items-center justify-center text-center p-4">
              <span className="text-[10px] text-slate-400 italic font-medium leading-relaxed">
                Selecciona una {levelTitle === 'Subdirección General' ? 'Dirección General' : 
                               levelTitle === 'Dirección de División' ? 'Subdirección General' : 
                               levelTitle === 'Dirección de Área' ? 'Dirección de División' : 
                               'Dirección de Área'} para habilitar este nivel.
              </span>
            </div>
          ) : units.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-150 rounded-xl bg-white/40">
              <span className="text-[10px] text-slate-400 font-semibold mb-2">No hay unidades</span>
              {levelTitle !== 'Oficina' && (
                <button
                  type="button"
                  onClick={() => handleOpenAddOrg(parentUnit)}
                  className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-[#007A33] font-bold text-[9px] rounded-lg transition-all shadow-2xs"
                >
                  Crear primera
                </button>
              )}
            </div>
          ) : (
            units.map(unit => {
              const isSelected = selectedOrgUnitId === unit.id;
              const isSubpath = activePathIds.includes(unit.id);
              const assignedCount = users.filter(u => u.orgUnitId === unit.id).length;

              return (
                <div 
                  key={unit.id}
                  onClick={() => setSelectedOrgUnitId(unit.id)}
                  className={clsx(
                    "group px-3 py-2.5 rounded-xl border transition-all duration-250 cursor-pointer flex flex-col gap-1.5 shadow-2xs",
                    isSelected 
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-[0_2px_6px_rgba(16,185,129,0.06)]"
                      : isSubpath
                        ? "bg-slate-55 bg-slate-50/85 border-slate-250 text-slate-700 shadow-2xs"
                        : "bg-white hover:bg-slate-50/60 border-slate-150 hover:border-slate-250 text-slate-650"
                  )}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className={clsx(
                      "text-[10px] font-bold leading-tight break-words flex-1 pr-1",
                      (isSelected || isSubpath) ? "text-slate-800 font-extrabold" : "text-slate-700 font-semibold"
                    )}>
                      {unit.name}
                    </span>
                    
                    {/* Botones inline en hover */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity shrink-0">
                      <button 
                        type="button"
                        title="Editar"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditOrg(unit);
                        }}
                        className="p-0.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-150 rounded transition-colors"
                      >
                        <Edit2 size={9} />
                      </button>
                      <button 
                        type="button"
                        title="Eliminar"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrgClick(unit);
                        }}
                        className="p-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-150 rounded transition-colors"
                      >
                        <Trash2 size={9} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="text-[9px] text-slate-400 font-semibold">
                      {assignedCount > 0 ? `${assignedCount} emp.` : '0 emp.'}
                    </span>
                    {isSubpath && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#007A33] shrink-0 animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderDetailPanel = () => {
    if (selectedOrgUnitId) {
      const unit = orgUnits.find(o => o.id === selectedOrgUnitId);
      if (!unit) return null;
      
      return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6 animate-in fade-in duration-200">
          {/* Cabecera del detalle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Ficha de la Unidad</span>
              <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2.5 truncate">
                <span className={clsx(
                  "text-xs px-2 py-0.5 rounded border uppercase tracking-wider font-semibold",
                  getUnitTypeStyles(unit.type)
                )}>
                  {unit.type}
                </span>
                {unit.name}
              </h2>
              <div className="text-xs text-slate-450 mt-1.5 truncate">
                <span className="font-semibold text-slate-500">Ruta:</span> {getUnitBreadcrumb(unit.id)}
              </div>
            </div>

            {/* Acciones directas de la unidad */}
            <div className="flex items-center gap-2 shrink-0">
              <button 
                type="button"
                onClick={() => handleOpenEditOrg(unit)}
                className="px-3.5 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-150 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Edit2 size={13} /> Renombrar
              </button>
              <button 
                type="button"
                onClick={() => handleDeleteOrgClick(unit)}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-150 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 size={13} /> Eliminar
              </button>
            </div>
          </div>

          {/* Lista de empleados asociados a la consulta */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users size={16} className="text-[#007A33]" /> Dotación de Personal
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
                  {orgEmployeesFiltered.length}
                </span>
              </h3>
            </div>

            {/* Tabla interna de dotación */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-1 w-[35%] min-w-[150px]">Trabajador</th>
                    <th className="pb-3 w-[25%] min-w-[120px]">Rol</th>
                    <th className="pb-3 w-[15%] min-w-[80px]">Nivel</th>
                    <th className="pb-3 w-[25%] min-w-[125px]">Unidad Específica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orgEmployeesFiltered.length > 0 ? (
                    orgEmployeesFiltered.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 pl-1">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img 
                              src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} 
                              alt={user.name} 
                              className="rounded-full border border-slate-100 object-cover shrink-0" 
                              style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px' }}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-800 truncate" title={user.name}>{user.name}</span>
                              <span className="text-[9px] text-slate-450 truncate" title={user.email}>{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={clsx(
                            "inline-block px-2 py-0.5 text-[9px] font-bold rounded-full border uppercase tracking-wider truncate max-w-full",
                            getRoleFamilyColorStyles(user.role)
                          )} title={user.role}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="inline-block px-1.5 py-0.3 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[9px] font-semibold">
                            {user.level}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-[10px] text-slate-550 font-medium truncate block" title={orgUnits.find(o => o.id === user.orgUnitId)?.name || 'Sin Asignar'}>
                            {orgUnits.find(o => o.id === user.orgUnitId)?.name || 'Sin Asignar'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400 text-xs">
                        Esta unidad no cuenta con empleados asignados bajo los criterios de consulta actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm flex flex-col items-center text-center justify-center space-y-4 min-h-[300px]">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 border border-slate-150 rounded-2xl flex items-center justify-center shadow-inner">
            <Network size={32} />
          </div>
          <div className="max-w-md">
            <h3 className="text-md font-extrabold text-slate-800">Ficha Informativa de Estructura</h3>
            <p className="text-slate-450 text-xs mt-2 leading-relaxed">
              Haz clic sobre cualquier nodo de la jerarquía organizativa en el explorador de columnas o árbol izquierdo para cargar sus métricas de dotación de personal, reubicarlo, renombrarlo o dar de alta subunidades dinámicas.
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cabecera de Página */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-emerald-50/50 to-transparent opacity-50 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 text-[#007A33] rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Users size={12} /> Portal de Administración
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gestión de Plantilla y Org.</h1>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-xl">
            Herramienta unificada de administración de recursos humanos para modelar la estructura organizativa de Cajamar e indexar la plantilla de personal.
          </p>
        </div>

        {/* Pestanas del menu principal */}
        <div className="relative z-10 flex bg-slate-100 p-1.5 rounded-2xl shrink-0">
          <button 
            onClick={() => setActiveTab('empleados')}
            className={clsx(
              "px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2",
              activeTab === 'empleados'
                ? "bg-[#007A33] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
            )}
          >
            <Users size={16} /> Maestro Empleados
          </button>
          <button 
            onClick={() => setActiveTab('organizacion')}
            className={clsx(
              "px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2",
              activeTab === 'organizacion'
                ? "bg-[#007A33] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
            )}
          >
            <Building2 size={16} /> Maestro Organización
          </button>
        </div>
      </div>

      {/* Sección de Alertas de Integridad Referencial */}
      {integrityError && (
        <div className="bg-rose-50 border-2 border-rose-200 text-rose-800 rounded-3xl p-6 shadow-sm flex items-start gap-4 animate-in slide-in-from-top duration-300">
          <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
            <AlertCircle size={22} />
          </div>
          <div className="flex-1">
            <h4 className="font-extrabold text-base">{integrityError.title}</h4>
            <p className="text-sm mt-1 leading-relaxed text-rose-700">{integrityError.message}</p>
          </div>
          <button 
            onClick={() => setIntegrityError(null)}
            className="p-1 hover:bg-rose-100 rounded-lg transition-colors text-rose-500 hover:text-rose-800"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* RENDERIZADO CONDICIONAL DE PESTAÑAS */}
      
      {/* ========================================================================= */}
      {/* 1. PESTAÑA: MAESTRO DE EMPLEADOS                                          */}
      {/* ========================================================================= */}
      {activeTab === 'empleados' && (
        <div className="space-y-6">
          {/* Panel de Estadísticas en Tarjetas Glassmorphic */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <Users size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Plantilla</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.total}</h3>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <Network size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asignados a Org</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.assigned}</h3>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <HelpCircle size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sin Asignar Org</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.unassigned}</h3>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <Award size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Promedio Skills</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.avgSkills}</h3>
              </div>
            </div>
          </div>

          {/* Directorio de Personal */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <Users size={18} className="text-[#007A33]" /> Directorio de Plantilla
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                    {filteredUsers.length}
                  </span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">Busca, filtra y actualiza la información y encuadre organizativo de los trabajadores.</p>
              </div>

              {/* Acciones principales de la pestaña */}
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => handleOpenImportModal('empleados')}
                  className="px-4 py-2.5 bg-emerald-50 text-[#007A33] border border-emerald-100 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all flex items-center gap-2 shadow-sm"
                >
                  <FileSpreadsheet size={15} /> Carga Masiva (Excel)
                </button>
                <button 
                  onClick={handleOpenAddUser}
                  className="px-4 py-2.5 bg-[#007A33] text-white rounded-xl font-bold text-xs hover:bg-[#006028] shadow-md shadow-emerald-600/10 transition-all flex items-center gap-2"
                >
                  <Plus size={15} /> Nuevo Empleado
                </button>
              </div>
            </div>

            {/* Fila de Filtros Cruzados y Búsqueda */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
              {/* Buscador de texto */}
              <div className="relative md:col-span-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={15} />
                </span>
                <input 
                  type="text" 
                  placeholder="Buscar por nombre/email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A33]"
                />
              </div>

              {/* Rol */}
              <div>
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A33] cursor-pointer"
                >
                  <option value="Todos">Todos los Roles</option>
                  {rolesData.map(r => (
                    <option key={r.id} value={r.title}>{r.title}</option>
                  ))}
                </select>
              </div>

              {/* Nivel */}
              <div>
                <select 
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A33] cursor-pointer"
                >
                  <option value="Todos">Todos los Niveles</option>
                  {levels.map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
              </div>

              {/* Unidad Organizativa */}
              <div>
                <select 
                  value={selectedOrgFilter}
                  onChange={(e) => setSelectedOrgFilter(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A33] cursor-pointer"
                >
                  <option value="Todos">Estructuras (Todos)</option>
                  {orgUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {getUnitTypeLabel(unit.type)} • {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabla de Empleados */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2 pr-4 w-[22%] min-w-[185px]">Empleado</th>
                    <th className="pb-3 pr-4 w-[21%] min-w-[165px]">Rol / P. Éxito</th>
                    <th className="pb-3 pr-4 w-[11%] min-w-[85px]">Nivel</th>
                    <th className="pb-3 pr-4 w-[25%] min-w-[200px]">Estructura Organizativa</th>
                    <th className="pb-3 pr-4 w-[15%] min-w-[125px]">Mánager</th>
                    <th className="pb-3 text-right pr-2 w-[6%] min-w-[60px]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map(user => {
                      const manager = users.find(u => u.id === user.managerId);
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                          {/* Empleado info */}
                          <td className="py-4 pl-2 pr-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <img 
                                src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} 
                                alt={user.name} 
                                className="rounded-full border border-slate-200 object-cover shrink-0" 
                                style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }}
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-800 truncate" title={user.name}>{user.name}</span>
                                <span className="text-[10px] text-slate-400 truncate" title={user.email || 'sin-email@cajamar.com'}>{user.email || 'sin-email@cajamar.com'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Rol (Badge) */}
                          <td className="py-4 pr-4">
                            <span className={clsx(
                              "inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wide truncate max-w-full",
                              getRoleFamilyColorStyles(user.role)
                            )} title={user.role || 'Sin Rol'}>
                              {user.role || 'Sin Rol'}
                            </span>
                          </td>

                          {/* Nivel */}
                          <td className="py-4 pr-4">
                            <span className="inline-block px-2 py-0.5 bg-slate-105 text-slate-700 border border-slate-200 rounded-md text-[10px] font-bold">
                              {user.level || 'Junior'}
                            </span>
                          </td>

                          {/* Rama de Unidad Organizativa */}
                          <td className="py-4 pr-4">
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-700 truncate" title={orgUnits.find(o => o.id === user.orgUnitId)?.name || 'Sin Asignar'}>
                                {orgUnits.find(o => o.id === user.orgUnitId)?.name || 'Sin Asignar'}
                              </span>
                              <span className="text-slate-400 truncate mt-0.5" style={{ fontSize: '8px', lineHeight: '1.2' }} title={getUnitBreadcrumb(user.orgUnitId)}>
                                {getUnitBreadcrumb(user.orgUnitId)}
                              </span>
                            </div>
                          </td>

                          {/* Manager */}
                          <td className="py-4 pr-4">
                            {manager ? (
                              <div className="flex items-center gap-2 min-w-0">
                                <img 
                                  src={manager.avatar} 
                                  alt={manager.name} 
                                  className="rounded-full object-cover shrink-0 border border-slate-100" 
                                  style={{ width: '24px', height: '24px', minWidth: '24px', minHeight: '24px' }}
                                />
                                <span className="text-xs font-medium text-slate-650 truncate" title={manager.name}>
                                  {manager.name.split(' ')[0]} {manager.name.split(' ')[1] || ''}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Sin manager</span>
                            )}
                          </td>

                          {/* Acciones */}
                          <td className="py-4 text-right pr-2">
                            <div className="flex items-center justify-end gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                              <button 
                                onClick={() => handleOpenEditUser(user)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all"
                                title="Editar empleado"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button 
                                onClick={() => handleDeleteUserClick(user.id, user.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                                title="Dar de baja"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <Users size={32} className="text-slate-350" />
                          <span>No se encontraron empleados.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer de Paginación */}
            {filteredUsers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 mt-4">
                {/* Stats */}
                <div className="text-xs text-slate-400 font-medium">
                  Mostrando <span className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> de <span className="font-bold text-slate-700">{filteredUsers.length}</span> empleados
                </div>

                {/* Controles de página */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                    title="Página anterior"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {pageNumbers.map((page, idx) => {
                    if (page === '...') {
                      return (
                        <span key={`ell-${idx}`} className="px-2 text-slate-400 font-semibold text-xs select-none">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        type="button"
                        key={`page-${page}`}
                        onClick={() => setCurrentPage(page)}
                        className={clsx(
                          "w-8 h-8 rounded-xl text-xs font-bold transition-all border",
                          currentPage === page
                            ? "bg-[#007A33] border-[#007A33] text-white shadow-md shadow-emerald-600/10"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                    title="Página siguiente"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Selector itemsPerPage */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registros por página:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A33] cursor-pointer font-semibold"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PESTAÑA: MAESTRO DE ORGANIZACIÓN                                        */}
      {/* ========================================================================= */}
      {activeTab === 'organizacion' && (
        <div className="space-y-6">
          {/* Barra de Control Superior: Alternancia de Vistas */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-455 uppercase tracking-wider">Visualización:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOrgViewMode('columnas')}
                  className={clsx(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer",
                    orgViewMode === 'columnas'
                      ? "bg-white text-slate-800 shadow-xs border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-850"
                  )}
                >
                  <Network size={14} className="text-[#007A33]" />
                  Miller Columns (Explorador)
                </button>
                <button
                  type="button"
                  onClick={() => setOrgViewMode('arbol')}
                  className={clsx(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer",
                    orgViewMode === 'arbol'
                      ? "bg-white text-slate-800 shadow-xs border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-850"
                  )}
                >
                  <GitFork size={14} className="text-blue-600" />
                  Árbol Tradicional
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Botón de Carga Masiva */}
              <button 
                type="button"
                onClick={() => handleOpenImportModal('organizacion')}
                className="px-4 py-2 bg-emerald-50 text-[#007A33] border border-emerald-100 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all flex items-center gap-2 shadow-xs"
              >
                <FileSpreadsheet size={15} /> Carga Masiva
              </button>
            </div>
          </div>

          {/* RENDERIZADO SEGÚN MODO DE VISUALIZACIÓN */}
          {orgViewMode === 'columnas' ? (
            <div className="space-y-6">
              {/* VISTA DE COLUMNAS MILLER */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                      <Network size={20} className="text-[#007A33]" /> Explorador de Niveles por Columnas
                    </h2>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Navega en cascada y visualiza de forma limpia la estructura en 5 niveles.
                    </p>
                  </div>
                  
                  {selectedOrgUnitId && (
                    <button 
                      type="button"
                      onClick={() => setSelectedOrgUnitId(null)}
                      className="px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold transition-all shrink-0"
                    >
                      Limpiar Filtro
                    </button>
                  )}
                </div>

                {/* Contenedor de 5 Columnas Horizontal Scrollable */}
                <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin max-w-full">
                  {/* Columna 1: Dirección General */}
                  {renderColumn('Dirección General', 'DG', rootUnits, activeDG, null, 'bg-emerald-50 text-[#007A33] border-emerald-250')}

                  {/* Columna 2: Subdirección General */}
                  {renderColumn(
                    'Subdirección General', 
                    'SG', 
                    activeDG ? orgUnits.filter(u => u.type === 'Subdirección General' && u.parentId === activeDG.id) : [], 
                    activeSG, 
                    activeDG,
                    'bg-blue-50 text-blue-650 border-blue-200'
                  )}

                  {/* Columna 3: Dirección de División */}
                  {renderColumn(
                    'Dirección de División', 
                    'DD', 
                    activeSG ? orgUnits.filter(u => u.type === 'Dirección de División' && u.parentId === activeSG.id) : [], 
                    activeDD, 
                    activeSG,
                    'bg-indigo-50 text-indigo-650 border-indigo-200'
                  )}

                  {/* Columna 4: Dirección de Área */}
                  {renderColumn(
                    'Dirección de Área', 
                    'DA', 
                    activeDD ? orgUnits.filter(u => u.type === 'Dirección de Área' && u.parentId === activeDD.id) : [], 
                    activeDA, 
                    activeDD,
                    'bg-purple-50 text-purple-650 border-purple-200'
                  )}

                  {/* Columna 5: Oficina */}
                  {renderColumn(
                    'Oficina', 
                    'Oficina', 
                    activeDA ? orgUnits.filter(u => u.type === 'Oficina' && u.parentId === activeDA.id) : [], 
                    orgUnits.find(u => u.id === selectedOrgUnitId && u.type === 'Oficina') || null, 
                    activeDA,
                    'bg-amber-50 text-amber-650 border-amber-250'
                  )}
                </div>

                {/* Filtro en Columnas */}
                <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 select-none cursor-pointer flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={includeSubunits} 
                      onChange={(e) => setIncludeSubunits(e.target.checked)}
                      className="rounded text-[#007A33] focus:ring-[#007A33] w-3.5 h-3.5" 
                    />
                    Incluir subunidades del nodo activo en la consulta de dotación inferior
                  </label>
                </div>
              </div>

              {/* Ficha de Detalles y Dotación (Abajo en Columnas) */}
              <div className="w-full">
                {renderDetailPanel()}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* VISTA TRADICIONAL DE ÁRBOL */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-md font-extrabold text-slate-800 flex items-center gap-2">
                      <Network size={18} className="text-[#007A33]" /> Estructura Jerárquica (Árbol)
                    </h2>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Define unidades y organigramas a través del árbol interactivo.
                    </p>
                  </div>
                </div>

                {/* Crear Unidad Raíz y Controles */}
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => handleOpenAddOrg(null)}
                    className="w-full py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Nueva Dirección General
                  </button>
                  {selectedOrgUnitId && (
                    <button 
                      type="button"
                      onClick={() => setSelectedOrgUnitId(null)}
                      className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold transition-all shrink-0"
                    >
                      Limpiar Filtro
                    </button>
                  )}
                </div>

                {/* Filtro en árbol */}
                <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 select-none cursor-pointer flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={includeSubunits} 
                      onChange={(e) => setIncludeSubunits(e.target.checked)}
                      className="rounded text-[#007A33] focus:ring-[#007A33] w-3.5 h-3.5" 
                    />
                    Incluir subunidades en la consulta
                  </label>
                </div>

                {/* Renderizado del árbol de estructura */}
                <div className="overflow-y-auto max-h-[500px] pr-2">
                  {rootUnits.length > 0 ? (
                    <div className="space-y-1 pl-0">
                      {rootUnits.map(rootNode => {
                        const children = orgUnits.filter(u => u.parentId === rootNode.id);
                        const hasChildren = children.length > 0;
                        const isExpanded = expandedNodes[rootNode.id];
                        const isSelected = selectedOrgUnitId === rootNode.id;
                        const assignedCount = users.filter(u => u.orgUnitId === rootNode.id).length;

                        return (
                          <div key={rootNode.id} className="group/root space-y-1">
                            <div 
                              className={clsx(
                                "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer select-none",
                                isSelected 
                                  ? "bg-emerald-50 border border-emerald-150 shadow-[0_2px_8px_rgba(16,185,129,0.06)]" 
                                  : "hover:bg-slate-50/60 border border-transparent"
                              )}
                              onClick={() => setSelectedOrgUnitId(rootNode.id === selectedOrgUnitId ? null : rootNode.id)}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <button 
                                  type="button"
                                  onClick={(e) => toggleNode(rootNode.id, e)}
                                  className={clsx(
                                    "p-0.5 rounded hover:bg-slate-200/50 text-slate-400 transition-colors shrink-0",
                                    !hasChildren && "opacity-0 cursor-default pointer-events-none"
                                  )}
                                >
                                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>

                                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#007A33] border border-emerald-250 flex items-center justify-center shadow-sm shrink-0">
                                  <Building2 size={14} />
                                </div>

                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-bold text-slate-800 truncate">
                                    {rootNode.name}
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={clsx(
                                      "text-[9px] px-1 py-0.1 rounded border font-medium uppercase tracking-wider",
                                      getUnitTypeStyles(rootNode.type)
                                    )}>
                                      {getUnitTypeLabel(rootNode.type)}
                                    </span>
                                    {assignedCount > 0 && (
                                      <span className="text-[9px] text-slate-400 font-medium">
                                        • {assignedCount} {assignedCount === 1 ? 'empleado' : 'empleados'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Hover Actions */}
                              <div className="opacity-0 group-hover/root:opacity-100 flex items-center gap-1 transition-opacity shrink-0 ml-4">
                                <button 
                                  type="button"
                                  title="Añadir Subunidad"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAddOrg(rootNode);
                                  }}
                                  className="p-1 text-slate-400 hover:text-[#007A33] hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                                >
                                  <Plus size={12} />
                                </button>
                                <button 
                                  type="button"
                                  title="Renombrar Unidad"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditOrg(rootNode);
                                  }}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button 
                                  type="button"
                                  title="Eliminar Unidad"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOrgClick(rootNode);
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            {hasChildren && isExpanded && renderTree(children)}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-3xl text-slate-450 text-xs">
                      Sin jerarquía de organización creada.
                    </div>
                  )}
                </div>
              </div>

              {/* Panel Derecho: Detalles en Árbol */}
              <div className="lg:col-span-7 space-y-6">
                {renderDetailPanel()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL CRUD: EMPLEADO --- */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Cabecera */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-extrabold text-slate-800">
                {editingUser ? `Editar Empleado: ${editingUser.name}` : 'Registrar Nuevo Empleado'}
              </h3>
              <button 
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Nombre y Apellidos</label>
                <input 
                  type="text" 
                  name="name"
                  value={userForm.name}
                  onChange={handleUserFormChange}
                  required
                  placeholder="Ej. Laura López"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A33] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Email Corporativo</label>
                <input 
                  type="email" 
                  name="email"
                  value={userForm.email}
                  onChange={handleUserFormChange}
                  required
                  readOnly
                  placeholder="Se autogenera del nombre"
                  className="w-full text-sm bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Perfil de Sistema</label>
                  <select 
                    name="profile"
                    value={userForm.profile}
                    onChange={handleUserFormChange}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A33]"
                  >
                    <option value="Employee">Empleado</option>
                    <option value="Manager">Mánager</option>
                    <option value="RRHH">RRHH</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Nivel Profesional</label>
                  <select 
                    name="level"
                    value={userForm.level}
                    onChange={handleUserFormChange}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A33]"
                  >
                    {levels.map(lvl => (
                      <option key={lvl.id} value={lvl.name}>{lvl.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Rol / Perfil de Éxito</label>
                <select 
                  name="role"
                  value={userForm.role}
                  onChange={handleUserFormChange}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A33]"
                >
                  {rolesData.map(role => (
                    <option key={role.id} value={role.title}>{role.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Unidad Organizativa</label>
                <select 
                  name="orgUnitId"
                  value={userForm.orgUnitId}
                  onChange={handleUserFormChange}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A33]"
                >
                  <option value="">Sin Asignar</option>
                  {orgUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {getUnitTypeLabel(unit.type)} • {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Mánager Directo</label>
                <select 
                  name="managerId"
                  value={userForm.managerId}
                  onChange={handleUserFormChange}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A33]"
                >
                  <option value="">Sin Mánager Directo</option>
                  {users
                    .filter(u => !editingUser || u.id !== editingUser.id) // Excluir al propio usuario
                    .map(u => {
                      const isCircular = editingUser && wouldCreateCycle(u.id, editingUser.id);
                      return (
                        <option 
                          key={u.id} 
                          value={u.id}
                          disabled={isCircular}
                        >
                          {u.name} ({u.role}) {isCircular ? '• [Crea Bucle]' : ''}
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Botones del pie */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-slate-500 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#007A33] text-white rounded-xl text-sm font-semibold hover:bg-[#006028] shadow-md shadow-emerald-600/10 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL CRUD: UNIDAD ORGANIZATIVA --- */}
      {isOrgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Cabecera */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-extrabold text-slate-800">
                {editingOrg ? `Editar Unidad: ${editingOrg.name}` : 'Añadir Unidad Organizativa'}
              </h3>
              <button 
                onClick={() => setIsOrgModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveOrg} className="p-6 space-y-4">
              {orgParent && !editingOrg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-100 flex items-start gap-2">
                  <Info size={16} className="text-[#007A33] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Unidad Superior:</span> {orgParent.name} ({getUnitTypeLabel(orgParent.type)})
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Nombre de la Unidad</label>
                <input 
                  type="text" 
                  name="name"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Ej. Oficina de Soluciones de Canales"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A33] transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Tipo de Unidad</label>
                <input 
                  type="text" 
                  value={orgForm.type}
                  readOnly
                  className="w-full text-sm bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  El tipo de unidad se determina de forma jerárquica estricta para garantizar la coherencia organizativa de Cajamar.
                </span>
              </div>

              {orgForm.type !== 'Dirección General' && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Unidad Superior (Padre)</label>
                  <select 
                    value={orgForm.parentId || ''}
                    onChange={(e) => setOrgForm(prev => ({ ...prev, parentId: e.target.value || null }))}
                    required
                    className="w-full text-sm bg-slate-55 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007A33]"
                  >
                    <option value="" disabled>Selecciona una unidad superior...</option>
                    {orgUnits
                      .filter(u => {
                        let parentType = '';
                        if (orgForm.type === 'Subdirección General') parentType = 'Dirección General';
                        else if (orgForm.type === 'Dirección de División') parentType = 'Subdirección General';
                        else if (orgForm.type === 'Dirección de Área') parentType = 'Dirección de División';
                        else if (orgForm.type === 'Oficina') parentType = 'Dirección de Área';
                        return u.type === parentType;
                      })
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Botones del pie */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsOrgModalOpen(false)}
                  className="px-4 py-2 text-slate-500 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#007A33] text-white rounded-xl text-sm font-semibold hover:bg-[#006028] shadow-md shadow-emerald-600/10 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE CARGA MASIVA (EXCEL SIMULADO) --- */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Cabecera */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#005021] text-white">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet size={22} className="text-emerald-355 text-emerald-300" />
                <div>
                  <h3 className="text-base font-extrabold leading-tight">
                    Carga Masiva: {importType === 'empleados' ? 'Maestro de Empleados' : 'Maestro de Organización'}
                  </h3>
                  <p className="text-[10px] text-emerald-100 font-medium mt-0.5">Soporta formatos estándar de hojas de cálculo (Excel / CSV)</p>
                </div>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario / Contenido */}
            <form onSubmit={handleImportSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 flex flex-col">
              {/* Notificación de Éxito */}
              {importSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
                  <Check size={18} className="text-emerald-600 shrink-0" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}

              {/* Notificación de Error */}
              {importError && (
                <div className="p-4 bg-rose-50 border border-rose-250 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
                  <AlertCircle size={18} className="text-rose-600 shrink-0" />
                  <span className="flex-1 leading-relaxed">{importError}</span>
                </div>
              )}

              {/* Drag and Drop Zone */}
              <div 
                className={clsx(
                  "border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center gap-2",
                  dragActive ? "border-[#007A33] bg-emerald-50/20" : "border-slate-200 hover:bg-slate-50/50",
                  importText && "py-4"
                )}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={loadExampleImportText}
              >
                <Upload size={32} className="text-slate-400 animate-bounce" />
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Arrastra tu hoja de cálculo aquí o selecciona el archivo</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Soporta .xlsx, .csv y formato de portapapeles.</span>
                </div>
                <button 
                  type="button"
                  className="mt-2 text-[10px] text-[#007A33] font-bold hover:underline"
                >
                  O haz clic para autocargar plantilla de demostración
                </button>
              </div>

              {/* Textarea para Datos CSV */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wider">Datos CSV Estructurados</label>
                  <button 
                    type="button" 
                    onClick={loadExampleImportText} 
                    className="text-[10px] text-[#007A33] font-bold hover:underline flex items-center gap-1"
                  >
                    Cargar Ejemplo de Plantilla
                  </button>
                </div>
                <textarea 
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={
                    importType === 'empleados'
                      ? "Nombre, Rol, Nivel, Email, ID Unidad, ID Mánager\nLaura López, Senior Developer, Senior, laura@cajamar.com, org-4, 2"
                      : "Nombre, Tipo, ID Padre\nDirección de Área de Ciberseguridad, Dirección de Área, org-2"
                  }
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-1 focus:outline-none focus:ring-2 focus:ring-[#007A33] min-h-[140px] leading-relaxed resize-none"
                />
              </div>

              {/* Instrucciones de formato */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                <h4 className="text-[11px] font-extrabold text-slate-750 flex items-center gap-1.5">
                  <Info size={14} className="text-[#007A33]" /> Formato e Instrucciones de la Plantilla
                </h4>
                <ul className="text-[10px] text-slate-500 space-y-1 pl-4 list-disc leading-relaxed">
                  {importType === 'empleados' ? (
                    <>
                      <li><strong>Nombre:</strong> Obligatorio. Texto libre de nombre y apellidos.</li>
                      <li><strong>Rol:</strong> Texto. Debe coincidir con un rol del catálogo (ej. <em>Analista Programador</em>).</li>
                      <li><strong>Nivel:</strong> Texto. Junior, Senior, Lead o Expert.</li>
                      <li><strong>Email:</strong> Opcional. Si se deja en blanco se autocalcula de forma corporativa.</li>
                      <li><strong>ID Unidad:</strong> Opcional. ID de la estructura a asignar (ej. <em>org-4</em>).</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Nombre:</strong> Obligatorio. Nombre de la unidad (ej. <em>Oficina Comercial</em>).</li>
                      <li><strong>Tipo:</strong> Obligatorio. Dirección General, Subdirección General, Dirección de División, Dirección de Área o Oficina.</li>
                      <li><strong>ID Padre:</strong> Opcional. ID de la unidad de nivel superior de la que cuelga (ej. <em>org-2</em>).</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2.5 text-slate-500 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#007A33] text-white rounded-xl text-xs font-bold hover:bg-[#006028] shadow-md shadow-emerald-600/10 transition-colors"
                >
                  Procesar e Importar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
