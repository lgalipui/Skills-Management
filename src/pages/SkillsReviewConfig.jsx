import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { SlidersHorizontal, Plus, Edit2, Trash2, X, Check, Info, Settings, Calendar, Award, ShieldAlert, Layers, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

export const SkillsReviewConfig = () => {
  const { 
    currentUser, 
    roleFamilies = [], 
    reviewConfigs = [], 
    saveReviewConfig, 
    deleteReviewConfig,
    saveCampaignRule,
    deleteCampaignRule
  } = useAuth();

  // Familias de Skills fijadas para el targeting en Cajamar
  const skillFamilies = [
    { id: 'FAM-1', name: 'Tecnología' },
    { id: 'FAM-2', name: 'Habilidades Blandas' },
    { id: 'FAM-3', name: 'Metodología' },
    { id: 'FAM-4', name: 'Negocio' },
    { id: 'FAM-5', name: 'Legal y Cumplimiento' }
  ];

  // Niveles de Rol para el targeting
  const roleLevels = ['Todas', 'Junior', 'Senior', 'Lead', 'Expert'];

  // --- ESTADO LOCAL SELECCIÓN DE CAMPAÑA PARA REGLAS ---
  const [expandedCampaignId, setExpandedCampaignId] = useState(null);

  // --- ESTADO LOCAL CRUD CAMPAÑAS ---
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    year: 2026,
    startDate: '',
    endDate: '',
    targeting: {
      roleFamily: 'Todas',
      roleLevel: 'Todas',
      skillFamily: 'Todas'
    }
  });

  // --- ESTADO LOCAL CRUD REGLAS ---
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleCampaignId, setRuleCampaignId] = useState(null);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    workflowType: 'self_manager_peers',
    minPeers: 2,
    maxPeers: 4,
    managerWeight: 70,
    peerWeight: 30,
    targeting: {
      skillFamily: 'Todas'
    }
  });

  if (currentUser.profile !== 'RRHH') {
    return <div className="p-8 text-center text-rose-500 font-bold">Acceso denegado. Exclusivo RRHH.</div>;
  }

  // --- HANDLERS CAMPAÑA ---
  const handleOpenAddCampaign = () => {
    setEditingCampaign(null);
    setCampaignForm({
      name: '',
      year: new Date().getFullYear(),
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      targeting: {
        roleFamily: 'Todas',
        roleLevel: 'Todas',
        skillFamily: 'Todas'
      }
    });
    setIsCampaignModalOpen(true);
  };

  const handleOpenEditCampaign = (campaign, e) => {
    e.stopPropagation();
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      year: campaign.year || 2026,
      startDate: campaign.startDate || '',
      endDate: campaign.endDate || '',
      targeting: campaign.targeting ? { ...campaign.targeting } : { roleFamily: 'Todas', roleLevel: 'Todas', skillFamily: 'Todas' }
    });
    setIsCampaignModalOpen(true);
  };

  const handleDeleteCampaign = (campaignId, e) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar esta campaña de Skill Review junto con todas sus reglas?')) {
      deleteReviewConfig(campaignId);
      if (expandedCampaignId === campaignId) {
        setExpandedCampaignId(null);
      }
      alert('Campaña eliminada con éxito.');
    }
  };

  const handleSaveCampaign = (e) => {
    e.preventDefault();
    if (!campaignForm.name) {
      alert('Por favor, indica un nombre para la campaña.');
      return;
    }
    if (!campaignForm.startDate || !campaignForm.endDate) {
      alert('Por favor, introduce las fechas de inicio y fin.');
      return;
    }
    if (campaignForm.startDate > campaignForm.endDate) {
      alert('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    saveReviewConfig({
      id: editingCampaign ? editingCampaign.id : undefined,
      ...campaignForm,
      rules: editingCampaign ? editingCampaign.rules : []
    });

    setIsCampaignModalOpen(false);
    alert(editingCampaign ? 'Campaña actualizada con éxito.' : 'Nueva campaña creada con éxito.');
  };

  // --- HANDLERS REGLAS ---
  const handleOpenAddRule = (campaignId, e) => {
    e.stopPropagation();
    setRuleCampaignId(campaignId);
    setEditingRule(null);
    setRuleForm({
      name: '',
      workflowType: 'self_manager_peers',
      minPeers: 2,
      maxPeers: 4,
      managerWeight: 70,
      peerWeight: 30,
      targeting: {
        skillFamily: 'Todas'
      }
    });
    setIsRuleModalOpen(true);
  };

  const handleOpenEditRule = (campaignId, rule, e) => {
    e.stopPropagation();
    setRuleCampaignId(campaignId);
    setEditingRule(rule);
    setRuleForm({
      name: rule.name,
      workflowType: rule.workflowType,
      minPeers: rule.minPeers || 2,
      maxPeers: rule.maxPeers || 4,
      managerWeight: rule.managerWeight !== undefined ? rule.managerWeight : 70,
      peerWeight: rule.peerWeight !== undefined ? rule.peerWeight : 30,
      targeting: { ...rule.targeting }
    });
    setIsRuleModalOpen(true);
  };

  const handleDeleteRule = (campaignId, ruleId, e) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar esta regla de segmentación?')) {
      deleteCampaignRule(campaignId, ruleId);
      alert('Regla eliminada.');
    }
  };

  const handleSaveRule = (e) => {
    e.preventDefault();
    if (!ruleForm.name) {
      alert('Por favor, indica un nombre para la regla.');
      return;
    }
    if (ruleForm.workflowType === 'self_manager_peers') {
      const sum = Number(ruleForm.managerWeight) + Number(ruleForm.peerWeight);
      if (sum !== 100) {
        alert(`La suma de las ponderaciones del Mánager y Colegas debe ser exactamente 100%. Actualmente suma ${sum}%.`);
        return;
      }
    }

    // Adapt weight defaults based on workflow type
    const finalRuleForm = { ...ruleForm };
    if (ruleForm.workflowType === 'self_manager') {
      finalRuleForm.managerWeight = 100;
      finalRuleForm.peerWeight = 0;
    } else if (ruleForm.workflowType === 'manager_only') {
      finalRuleForm.managerWeight = 100;
      finalRuleForm.peerWeight = 0;
    }

    saveCampaignRule(ruleCampaignId, {
      id: editingRule ? editingRule.id : undefined,
      ...finalRuleForm
    });

    setIsRuleModalOpen(false);
    alert(editingRule ? 'Regla de la campaña actualizada con éxito.' : 'Nueva regla de segmentación añadida.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto p-1">
      
      {/* CABECERA */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <SlidersHorizontal size={22} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">Configuración Skill Review</h1>
            <p className="text-xs md:text-sm text-slate-505 mt-0.5 leading-normal">
              Gestión de campañas de evaluación, asignaciones temporales y reglas dinámicas por tipología de skill y nivel.
            </p>
          </div>
        </div>

        <button 
          onClick={handleOpenAddCampaign}
          className="bg-[#007A33] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-[#006028] transition-colors cursor-pointer shrink-0 h-fit"
        >
          <Plus size={15} /> Nueva Campaña Skill Review
        </button>
      </div>

      {/* EXPLICACIÓN METODOLÓGICA */}
      <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-3xl p-5 flex items-start gap-3.5 max-w-5xl">
        <Info className="text-[#007A33] shrink-0 mt-0.5" size={18} />
        <div className="text-xs space-y-1.5">
          <p className="font-extrabold text-[#005021] text-sm">¿Cómo configurar reglas de evaluación para tus competencias?</p>
          <p className="text-emerald-950 leading-relaxed">
            Ahora puedes definir que las <strong>skills de habilidades blandas (Soft Skills)</strong> tengan un proceso <strong>360 Completo</strong> (con nominaciones de colegas), mientras que las <strong>skills técnicas</strong> o especializadas no incluyan pares y sean evaluadas de forma <strong>exclusiva por el responsable/mánager</strong>. Todo esto se configura de forma integrada creando reglas segmentadas para cada campaña temporal.
          </p>
        </div>
      </div>

      {/* LISTADO DE CAMPAÑAS */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-800 px-1">Campañas Activas y Planificadas</h2>

        {reviewConfigs.map(campaign => {
          const isExpanded = expandedCampaignId === campaign.id;
          const rulesCount = campaign.rules?.length || 0;
          
          return (
            <div 
              key={campaign.id} 
              className={clsx(
                "bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs",
                isExpanded ? "border-[#007A33] ring-1 ring-[#007A33]/20" : "border-slate-150 hover:border-slate-350"
              )}
            >
              {/* CAMPAÑA BAR HEADER */}
              <div 
                onClick={() => setExpandedCampaignId(isExpanded ? null : campaign.id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-650 shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">{campaign.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 font-medium">
                      <span>Año: <strong className="text-slate-700">{campaign.year}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span>Inicio: <strong className="text-slate-700">{campaign.startDate}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span>Fin: <strong className="text-slate-700">{campaign.endDate}</strong></span>
                    </div>

                    {/* Campaign-level targeting display badges */}
                    {campaign.targeting && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pr-1">Target de Campaña:</span>
                        <span className="bg-[#007A33]/5 text-[#007A33] border border-[#007A33]/15 px-2 py-0.5 rounded text-[9px] font-bold">
                          Roles: {campaign.targeting.roleFamily || 'Todas'}
                        </span>
                        <span className="bg-[#007A33]/5 text-[#007A33] border border-[#007A33]/15 px-2 py-0.5 rounded text-[9px] font-bold">
                          Niveles: {campaign.targeting.roleLevel || 'Todas'}
                        </span>
                        <span className="bg-[#007A33]/5 text-[#007A33] border border-[#007A33]/15 px-2 py-0.5 rounded text-[9px] font-bold">
                          Habilidades: {campaign.targeting.skillFamily || 'Todas'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#007A33]/10 text-[#007A33] border border-[#007A33]/20">
                    {rulesCount} {rulesCount === 1 ? 'regla' : 'reglas'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => handleOpenEditCampaign(campaign, e)}
                      className="p-2 text-slate-450 hover:text-[#007A33] hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                      title="Editar Campaña"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteCampaign(campaign.id, e)}
                      className="p-2 text-slate-450 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Eliminar Campaña"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="text-slate-400 pl-1">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </div>

              {/* SECCIÓN DETALLE DE REGLAS (EXPANDIDO) */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-5 space-y-4 bg-white">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Reglas de Segmentación Internas</h4>
                    <button
                      onClick={(e) => handleOpenAddRule(campaign.id, e)}
                      className="bg-[#007A33]/15 text-[#007A33] hover:bg-[#007A33]/25 px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus size={13} /> Añadir Regla
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
                          <th className="py-2.5 px-4 w-48">Nombre de Regla</th>
                          <th className="py-2.5 px-4 w-36">Tipo de Flujo</th>
                          <th className="py-2.5 px-4 w-44">Ponderación (Manager / Peers)</th>
                          <th className="py-2.5 px-4">Familia de Skills</th>
                          <th className="py-2.5 text-center px-4 w-28">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700 bg-white">
                        {(campaign.rules || []).map(rule => (
                          <tr key={rule.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-800">{rule.name}</td>
                            <td className="py-3 px-4">
                              <span className={clsx(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                rule.workflowType === 'self_manager_peers' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                rule.workflowType === 'self_manager' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                "bg-blue-50 text-blue-700 border-blue-200"
                              )}>
                                {rule.workflowType === 'self_manager_peers' ? "360 Completa" :
                                 rule.workflowType === 'self_manager' ? "Auto + Manager" : "Solo Manager"}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-[11px] text-slate-650">
                              {rule.workflowType === 'self_manager_peers' ? `${rule.managerWeight}% Mánager / ${rule.peerWeight}% Peers` : '100% Mánager'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-[#007A33]/5 text-[#007A33] border border-[#007A33]/15 px-2.5 py-1 rounded text-[10px] font-extrabold">
                                {rule.targeting?.skillFamily || 'Todas'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button 
                                  onClick={(e) => handleOpenEditRule(campaign.id, rule, e)}
                                  className="p-1.5 text-slate-400 hover:text-[#007A33] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                  title="Editar Regla"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button 
                                  onClick={(e) => handleDeleteRule(campaign.id, rule.id, e)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar Regla"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {(!campaign.rules || campaign.rules.length === 0) && (
                          <tr>
                            <td colSpan="5" className="py-6 text-center text-slate-450 text-xs italic">
                              No hay reglas registradas en esta campaña. Las skills de los empleados se evaluarán bajo el flujo por defecto (Auto + Mánager).
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {reviewConfigs.length === 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center">
            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-650">No hay campañas de Skill Review</h3>
            <p className="text-slate-500 text-sm mt-1">Crea una nueva campaña temporal para empezar a estructurar tus flujos.</p>
          </div>
        )}
      </div>

      {/* MODAL CRUD: CREAR / EDITAR CAMPAÑA */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div 
            onClick={() => setIsCampaignModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          ></div>
          
          <form 
            onSubmit={handleSaveCampaign}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 animate-out duration-150"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">
                {editingCampaign ? `Editar Campaña: ${editingCampaign.id}` : 'Nueva Campaña de Skill Review'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsCampaignModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Fields */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Nombre de la Campaña *
                </label>
                <input 
                  type="text" 
                  required
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. Evaluación Anual Primavera 2026"
                  className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Año *
                  </label>
                  <select 
                    value={campaignForm.year}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-[#007A33] focus:outline-none bg-white font-medium"
                  >
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                    <option value={2028}>2028</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Fecha de Inicio *
                  </label>
                  <input 
                    type="date"
                    required
                    value={campaignForm.startDate}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:border-[#007A33] focus:outline-none bg-white font-medium h-[38px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Fecha de Fin de la Campaña *
                </label>
                <input 
                  type="date"
                  required
                  value={campaignForm.endDate}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:border-[#007A33] focus:outline-none bg-white font-medium h-[38px]"
                />
              </div>

              {/* Campaign-level targeting segment form controls */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                <span className="text-xs font-extrabold text-[#007A33] uppercase tracking-wider block">Segmentación Objetivo de la Campaña</span>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Familia de Roles Objetivo
                  </label>
                  <select
                    value={campaignForm.targeting?.roleFamily || 'Todas'}
                    onChange={(e) => setCampaignForm(prev => ({
                      ...prev,
                      targeting: { ...prev.targeting, roleFamily: e.target.value }
                    }))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:border-[#007A33] focus:outline-none bg-white font-medium"
                  >
                    <option value="Todas">Todas las Familias de Roles</option>
                    {roleFamilies.map(rfam => (
                      <option key={rfam.id} value={rfam.name}>{rfam.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Nivel de Rol Objetivo
                    </label>
                    <select
                      value={campaignForm.targeting?.roleLevel || 'Todas'}
                      onChange={(e) => setCampaignForm(prev => ({
                        ...prev,
                        targeting: { ...prev.targeting, roleLevel: e.target.value }
                      }))}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs focus:border-[#007A33] focus:outline-none bg-white font-medium"
                    >
                      {roleLevels.map(lvl => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Familia de Skills Objetivo
                    </label>
                    <select
                      value={campaignForm.targeting?.skillFamily || 'Todas'}
                      onChange={(e) => setCampaignForm(prev => ({
                        ...prev,
                        targeting: { ...prev.targeting, skillFamily: e.target.value }
                      }))}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs focus:border-[#007A33] focus:outline-none bg-white font-medium"
                    >
                      <option value="Todas">Todas las Habilidades</option>
                      {skillFamilies.map(fam => (
                        <option key={fam.id} value={fam.name}>{fam.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
              <button 
                type="button"
                onClick={() => setIsCampaignModalOpen(false)}
                className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-[#007A33] text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-[#006028] transition-colors shadow-md flex items-center gap-1 cursor-pointer"
              >
                <Check size={14} /> Guardar Campaña
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CRUD: CREAR / EDITAR REGLA */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div 
            onClick={() => setIsRuleModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          ></div>
          
          <form 
            onSubmit={handleSaveRule}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">
                {editingRule ? `Editar Regla: ${editingRule.id}` : 'Nueva Regla de Segmentación'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Form Fields */}
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar bg-white">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Nombre de la Regla *
                </label>
                <input 
                  type="text" 
                  required
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. Habilidades Blandas Corporativas"
                  className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors bg-white font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Tipo de Flujo de Trabajo *
                </label>
                <select
                  value={ruleForm.workflowType}
                  onChange={(e) => setRuleForm(prev => ({ ...prev, workflowType: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors bg-white font-semibold"
                >
                  <option value="self_manager_peers">360 Completa (Auto + Manager + Peers)</option>
                  <option value="self_manager">Auto + Manager (Estándar)</option>
                  <option value="manager_only">Solo Manager</option>
                </select>
              </div>

              {ruleForm.workflowType === 'self_manager_peers' && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-655 uppercase tracking-wider">Ponderación de Notas</span>
                    <span className="text-[10px] font-bold text-[#007A33] bg-emerald-50 px-2 py-0.5 rounded-full">Suma: 100%</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Evaluación Mánager:</span>
                      <span className="text-[#007A33] font-extrabold">{ruleForm.managerWeight}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      step="5"
                      value={ruleForm.managerWeight}
                      onChange={(e) => {
                        const mVal = Number(e.target.value);
                        setRuleForm(prev => ({
                          ...prev,
                          managerWeight: mVal,
                          peerWeight: 100 - mVal
                        }));
                      }}
                      className="w-full accent-[#007A33]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Evaluación Colegas (Peers):</span>
                      <span className="text-blue-600 font-extrabold">{ruleForm.peerWeight}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      step="5"
                      value={ruleForm.peerWeight}
                      onChange={(e) => {
                        const pVal = Number(e.target.value);
                        setRuleForm(prev => ({
                          ...prev,
                          peerWeight: pVal,
                          managerWeight: 100 - pVal
                        }));
                      }}
                      className="w-full accent-blue-650"
                    />
                  </div>
                </div>
              )}

              {ruleForm.workflowType === 'self_manager_peers' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Mínimo de Colegas
                    </label>
                    <select
                      value={ruleForm.minPeers}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, minPeers: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors bg-white font-semibold"
                    >
                      <option value={2}>2 Colegas</option>
                      <option value={3}>3 Colegas</option>
                      <option value={4}>4 Colegas</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Máximo de Colegas
                    </label>
                    <select
                      value={ruleForm.maxPeers}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, maxPeers: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl text-sm focus:border-[#007A33] focus:outline-none transition-colors bg-white font-semibold"
                    >
                      <option value={3}>3 Colegas</option>
                      <option value={4}>4 Colegas</option>
                      <option value={5}>5 Colegas</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3">
                <span className="text-xs font-extrabold text-slate-655 uppercase tracking-wider block">Familia de Skills Objetivo</span>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Familia de Skills
                  </label>
                  <select
                    value={ruleForm.targeting?.skillFamily || 'Todas'}
                    onChange={(e) => setRuleForm(prev => ({
                      ...prev,
                      targeting: { skillFamily: e.target.value }
                    }))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:border-[#007A33] focus:outline-none bg-white font-medium"
                  >
                    <option value="Todas">Todas las Habilidades</option>
                    {skillFamilies.map(fam => (
                      <option key={fam.id} value={fam.name}>{fam.name}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
              <button 
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-[#007A33] text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-[#006028] transition-colors shadow-md flex items-center gap-1 cursor-pointer"
              >
                <Check size={14} /> Guardar Regla
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
