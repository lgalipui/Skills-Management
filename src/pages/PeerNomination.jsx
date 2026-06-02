import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Plus, Trash2, Search, Check, AlertCircle, RotateCcw, Play, CheckCircle2, ChevronRight, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const PeerNomination = () => {
  const { 
    users = [], 
    reviewConfigs = [], 
    peerNominations = [], 
    peerReviews = [],
    rolesData = [],
    getWorkflowForSkill,
    submitPeerNomination,
    approvePeerNomination,
    setPeerNominations,
    setPeerReviews
  } = useAuth();

  // --- SIMULADOR DE ROLES INTERACTIVO ---
  const [simulationMode, setSimulationMode] = useState('Employee'); // 'Employee', 'Manager'

  // El usuario que está operando en la pantalla
  const currentUser = useMemo(() => {
    if (simulationMode === 'Employee') return users.find(u => u.id === 1) || users[0];
    return users.find(u => u.id === 2) || users[1]; // Mánager (Carlos M.)
  }, [simulationMode, users]);

  // Habilidades evaluadas (se evalúan las de Ana García, ID 1)
  const evaluatedUser = useMemo(() => users.find(u => u.id === 1) || users[0], [users]);
  const skillsToEvaluate = evaluatedUser.skills || [];

  // Resolver Campaña Activa basada en el targeting de Ana
  const activeCampaign = useMemo(() => {
    const todayStr = "2026-05-15"; // Fecha de la demo
    return reviewConfigs.find(c => {
      if (c.startDate && c.endDate) {
        if (todayStr < c.startDate || todayStr > c.endDate) return false;
      }
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

  // Determinar si requiere Nominación de Colegas
  const needsPeerNomination = useMemo(() => {
    return skillsToEvaluate.some(skill => {
      const config = getWorkflowForSkill(evaluatedUser, skill);
      return config.workflowType === 'self_manager_peers';
    });
  }, [skillsToEvaluate, evaluatedUser, getWorkflowForSkill]);

  // Búsqueda de colegas para nominación
  const [peerSearchQuery, setPeerSearchQuery] = useState('');
  const [selectedPeers, setSelectedPeers] = useState([]);

  // Nominación activa para Ana García (ID 1)
  const activeNomination = useMemo(() => {
    return peerNominations.find(n => n.employeeId === 1);
  }, [peerNominations]);

  // Filtrar colegas seleccionables (colegas del departamento de Tecnología que no son Ana)
  const selectablePeers = useMemo(() => {
    return users.filter(u => u.id !== 1 && u.profile === 'Employee' && u.department === 'Tecnología');
  }, [users]);

  // Resultados de búsqueda del Empleado
  const filteredPeerResults = useMemo(() => {
    if (!peerSearchQuery.trim()) return [];
    return selectablePeers.filter(u => 
      u.name.toLowerCase().includes(peerSearchQuery.toLowerCase()) &&
      !selectedPeers.some(p => p.id === u.id)
    );
  }, [peerSearchQuery, selectablePeers, selectedPeers]);

  // Mánager sugiere/añade colega
  const [managerPeerSearch, setManagerPeerSearch] = useState('');
  const [managerPeersList, setManagerPeersList] = useState([]);

  // Actualizar lista local de mánager cuando cambie la nominación activa
  useEffect(() => {
    if (activeNomination) {
      setManagerPeersList(activeNomination.nominatedPeers || []);
    }
  }, [activeNomination]);

  const filteredManagerPeerResults = useMemo(() => {
    if (!managerPeerSearch.trim()) return [];
    return selectablePeers.filter(u => 
      u.name.toLowerCase().includes(managerPeerSearch.toLowerCase()) &&
      !managerPeersList.some(p => p.peerId === u.id)
    );
  }, [managerPeerSearch, selectablePeers, managerPeersList]);

  // Reiniciar flujo de simulación 360
  const handleResetProcess = () => {
    setPeerNominations(prev => prev.map(n => n.employeeId === 1 ? { ...n, nominatedPeers: [], status: 'Draft' } : n));
    setPeerReviews(prev => prev.filter(r => r.nominationId !== 'nom-1'));
    setSelectedPeers([]);
    setSimulationMode('Employee');
    alert('Simulación 360 de Ana García reiniciada con éxito. Ahora puedes volver a proponer colegas desde el principio.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto p-1 bg-transparent min-h-[85vh]">
      
      {/* CABECERA GIGANTE PREMIUM */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-100/80 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-750 border border-purple-100 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            Evaluación 360º
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
            Nominación de Peers
          </h1>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
            Propón o aprueba evaluadores colegas para el ciclo de valoración de competencias transversales y calibración de talento.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 p-2 border border-slate-100 rounded-2xl shadow-2xs">
          <Users size={16} className="text-[#007A33]" />
          <span className="text-xs font-mono font-bold text-[#007A33]">{activeCampaign ? activeCampaign.name : 'Campaña Primavera 2026'}</span>
        </div>
      </div>

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
            Alterna el rol activo para simular y experimentar el flujo de nominación de colegas de **Ana García**.
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
              { key: 'Manager', label: 'Mánager (Carlos M.)', color: 'hover:bg-blue-600 hover:text-white', activeClass: 'bg-blue-600 text-white shadow-md' }
            ].map(role => (
              <button
                key={role.key}
                onClick={() => {
                  setSimulationMode(role.key);
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

      {/* 2. CONTENIDO PRINCIPAL DE LA SIMULACIÓN */}

      {/* MODO EMPLEADO (ANA GARCÍA) */}
      {simulationMode === 'Employee' && (
        <div className="space-y-6">
          
          {(!activeNomination || activeNomination.status === 'Draft' || activeNomination.status === 'Pending') && needsPeerNomination ? (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-[#007A33] rounded-xl">
                    <Users size={20} />
                  </div>
                  <h2 className="text-xl font-black text-slate-800">1. Proponer tus Evaluadores Colegas</h2>
                </div>
                <p className="text-slate-400 text-xs md:text-sm mt-1">
                  Tu perfil requiere la evaluación de tus Habilidades Globales por parte de pares. Selecciona a tus colegas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Selector y buscador */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Buscar compañeros de Tecnología
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={peerSearchQuery}
                        onChange={(e) => setPeerSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border-2 border-slate-150 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {filteredPeerResults.length > 0 && (
                    <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 max-h-56 overflow-y-auto custom-scrollbar shadow-sm bg-white animate-in slide-in-from-top-2 duration-200">
                      {filteredPeerResults.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full border border-slate-100 object-cover" />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.role}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPeers(prev => [...prev, p]);
                              setPeerSearchQuery('');
                            }}
                            className="text-[10px] font-extrabold text-[#007A33] bg-emerald-50 hover:bg-[#007A33] hover:text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Plus size={10} /> Nominar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-start gap-2.5">
                    <AlertCircle size={16} className="text-[#007A33] shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[#005021] leading-relaxed font-semibold">
                      Debes seleccionar entre **2 y 4 colegas** de tu misma área o que colaboren frecuentemente contigo. La lista final será validada y visada por tu mánager.
                    </p>
                  </div>
                </div>

                {/* Colegas propuestos */}
                <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100 space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Tu propuesta de evaluadores</h3>

                  {selectedPeers.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border-2 border-dashed border-slate-200">
                      No has nominado a ningún colega aún. Usa el buscador lateral.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1 animate-in fade-in duration-200">
                      {selectedPeers.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-xs">
                          <div className="flex items-center gap-2.5">
                            <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.role}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedPeers(prev => prev.filter(x => x.id !== p.id))}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedPeers.length < 2 || selectedPeers.length > 4) {
                          alert(`Por favor, nomina entre 2 y 4 colegas. Actualmente has seleccionado ${selectedPeers.length}.`);
                          return;
                        }
                        submitPeerNomination(1, selectedPeers.map(p => ({ peerId: p.id, status: 'Pending', suggestedBy: 'Employee' })));
                        alert('Propuesta de colegas enviada con éxito a Carlos Martínez.');
                      }}
                      disabled={selectedPeers.length < 2 || selectedPeers.length > 4}
                      className="bg-[#007A33] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#006028] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-1 cursor-pointer"
                    >
                      Enviar Propuesta al Mánager <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeNomination && activeNomination.status === 'PendingManager' ? (
            /* Nominación Pendiente de Aprobación por Manager */
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4 max-w-2xl mx-auto text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                <AlertCircle size={22} />
              </div>
              <h2 className="text-lg font-black text-slate-800">Propuesta de Colegas Enviada</h2>
              <p className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
                Tu propuesta de evaluadores 360 se encuentra actualmente **pendiente de validación** por parte de tu responsable **Carlos Martínez**.
              </p>
              
              <div className="bg-white p-4 rounded-2xl border border-slate-100 max-w-md mx-auto space-y-2.5">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left">Colegas Propuestos</h4>
                <div className="space-y-2">
                  {activeNomination.nominatedPeers.map(p => {
                    const peerObj = users.find(u => u.id === p.peerId);
                    if (!peerObj) return null;
                    return (
                      <div key={p.peerId} className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl">
                        <img src={peerObj.avatar} alt={peerObj.name} className="w-7 h-7 rounded-full object-cover" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800 leading-tight">{peerObj.name}</p>
                          <p className="text-[9px] text-slate-400">{peerObj.role}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 text-xs font-bold text-blue-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100 inline-block">
                💡 Pista demo: Alterna arriba en la consola al rol de **Mánager (Carlos M.)** para visar la lista.
              </div>
            </div>
          ) : activeNomination && activeNomination.status === 'Confirmed' ? (
            /* Nominación ya Confirmada y Validada por Manager */
            <div className="p-8 bg-white rounded-3xl border border-emerald-100 shadow-sm space-y-6 max-w-2xl mx-auto text-center">
              <div className="w-14 h-14 bg-emerald-150 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={30} className="stroke-[2.5]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800">¡Nominación Confirmada y Aprobada!</h2>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
                  La lista definitiva de colegas evaluadores ya ha sido visada y autorizada por tu responsable **Carlos Martínez**.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                {activeNomination.nominatedPeers.map(p => {
                  const peerObj = users.find(u => u.id === p.peerId);
                  if (!peerObj) return null;
                  return (
                    <div key={p.peerId} className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-2xs">
                      <img src={peerObj.avatar} alt={peerObj.name} className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                      <div className="text-left">
                        <p className="text-xs font-extrabold text-slate-800 leading-tight">{peerObj.name}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{peerObj.role}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-3">
                <p className="text-xs font-medium text-slate-400">
                  Ya puedes proceder a calificar tu autoevaluación de competencias en el portal principal.
                </p>
                <Link
                  to="/skills-review"
                  className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#007A33] text-white rounded-xl font-bold text-sm hover:bg-[#006028] transition-all shadow-md cursor-pointer hover:scale-102"
                >
                  Ir a Realizar Mi Evaluación <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-100">
              No se requiere nominación de colegas bajo las reglas de la campaña activa en este momento.
            </div>
          )}
        </div>
      )}

      {/* MODO MÁNAGER (CARLOS MARTÍNEZ) */}
      {simulationMode === 'Manager' && (
        <div className="space-y-6">
          {activeNomination && activeNomination.status === 'PendingManager' ? (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                  <Users size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-800">Revisar y Validar Colegas de Ana García</h2>
              </div>
              <p className="text-slate-400 text-xs">
                Ana García ha solicitado una evaluación 360 y ha propuesto los siguientes colegas. Revisa, aprueba, elimina o añade más colegas según estimes oportuno.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Lista Propuesta con Acciones */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Propuesta actual para visar</h3>
                  <div className="space-y-2">
                    {managerPeersList.map(p => {
                      const peerObj = users.find(u => u.id === p.peerId);
                      if (!peerObj) return null;
                      return (
                        <div key={p.peerId} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-2xs animate-in fade-in duration-200">
                          <div className="flex items-center gap-2.5">
                            <img src={peerObj.avatar} alt={peerObj.name} className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{peerObj.name}</p>
                              <p className="text-[10px] text-slate-400">{peerObj.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={clsx(
                              "text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border",
                              p.suggestedBy === 'Manager' ? "bg-blue-50 text-blue-700 border-blue-150" : "bg-emerald-50 text-emerald-700 border-emerald-150"
                            )}>
                              {p.suggestedBy === 'Manager' ? 'Sugerido Mág' : 'Propuesto Emp'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setManagerPeersList(prev => prev.filter(x => x.peerId !== p.peerId));
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Buscador de Mánager para añadir o sugerir */}
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      ¿Quieres añadir o sustituir a algún colega?
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                      <input
                        type="text"
                        placeholder="Sugerir colega..."
                        value={managerPeerSearch}
                        onChange={(e) => setManagerPeerSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:outline-none bg-white font-medium"
                      />
                    </div>
                  </div>

                  {filteredManagerPeerResults.length > 0 && (
                    <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-40 overflow-y-auto custom-scrollbar shadow-xs bg-white animate-in slide-in-from-top-2 duration-150">
                      {filteredManagerPeerResults.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-2">
                            <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full object-cover" />
                            <div>
                              <p className="text-[11px] font-bold text-slate-800">{p.name}</p>
                              <p className="text-[9px] text-slate-400">{p.role}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setManagerPeersList(prev => [...prev, { peerId: p.id, status: 'Pending', suggestedBy: 'Manager' }]);
                              setManagerPeerSearch('');
                            }}
                            className="text-[9px] font-extrabold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded transition-all cursor-pointer"
                          >
                            + Añadir
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (managerPeersList.length < 2) {
                          alert('Deben haber al menos 2 colegas autorizados para la evaluación.');
                          return;
                        }
                        approvePeerNomination(1, managerPeersList);
                        alert('Lista de evaluadores aprobada con éxito. Ana García ya puede realizar su autoevaluación.');
                      }}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-md flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={13} /> Visar y Aprobar Evaluadores
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeNomination && activeNomination.status === 'Confirmed' ? (
            /* Nominaciones confirmadas en vista de manager */
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm max-w-2xl mx-auto text-center space-y-6">
              <div className="w-14 h-14 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Check size={30} className="stroke-[3]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-800">¡Colegas Visados y Aprobados!</h2>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
                  Has autorizado exitosamente la lista de evaluadores para **Ana García**.
                </p>
              </div>

              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl max-w-md mx-auto space-y-2.5">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left">Lista Oficial Aprobada</h4>
                <div className="space-y-2">
                  {activeNomination.nominatedPeers.map(p => {
                    const peerObj = users.find(u => u.id === p.peerId);
                    if (!peerObj) return null;
                    return (
                      <div key={p.peerId} className="flex items-center justify-between p-2 bg-white rounded-xl shadow-2xs border border-slate-100/50">
                        <div className="flex items-center gap-2.5">
                          <img src={peerObj.avatar} alt={peerObj.name} className="w-7 h-7 rounded-full object-cover" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-slate-800 leading-tight">{peerObj.name}</p>
                            <p className="text-[9px] text-slate-400">{peerObj.role}</p>
                          </div>
                        </div>
                        <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-150">
                          Confirmado
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-3">
                <p className="text-xs font-medium text-slate-400">
                  Ahora los colegas y tú podréis calificar las competencias en el portal de revisiones.
                </p>
                <Link
                  to="/skills-review"
                  className="inline-flex items-center gap-1.5 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md cursor-pointer hover:scale-102"
                >
                  Ir a Consola de Calibración de Manager <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Users size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Sin Solicitudes Pendientes</h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                Ana García no tiene ninguna propuesta de colegas pendiente de visar en este momento.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 inline-block">
                💡 Pista demo: Alterna arriba en la consola al rol de **Empleado (Ana G.)** para proponer evaluadores.
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
