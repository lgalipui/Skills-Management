import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockOpportunities } from '../data/mockData';
import { Briefcase, Building, MapPin, Filter, Target, Send, Users, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

export const MyOpportunities = () => {
  const { currentUser, users, jobApplications, applyToJob } = useAuth();
  
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [deptFilter, setDeptFilter] = useState('Todos');
  const [skillFilter, setSkillFilter] = useState('');

  const isRRHH = currentUser.profile === 'RRHH';

  // Extract unique departments for filter
  const departments = ['Todos', ...new Set(mockOpportunities.map(o => o.department))];

  // Helper para calcular Match% para un usuario concreto contra una oportunidad
  const calculateMatch = (user, opportunity) => {
    if (!opportunity.requiredSkills || opportunity.requiredSkills.length === 0) return 0;
    let maxScore = 0;
    let userScore = 0;
    
    opportunity.requiredSkills.forEach(req => {
      maxScore += req.level;
      const userSkill = user.skills.find(s => s.name === req.name);
      const uLevel = userSkill ? userSkill.level : 0;
      userScore += Math.min(uLevel, req.level);
    });

    return maxScore === 0 ? 0 : Math.round((userScore / maxScore) * 100);
  };

  // Enhance opportunities with currentUser match
  const enhancedOpps = useMemo(() => {
    return mockOpportunities.map(opp => {
      const match = calculateMatch(currentUser, opp);
      return { ...opp, matchPercentage: match };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [currentUser]);

  // Filtrado
  const filteredOpps = enhancedOpps.filter(opp => {
    if (deptFilter !== 'Todos' && opp.department !== deptFilter) return false;
    if (skillFilter.trim() !== '') {
      const search = skillFilter.toLowerCase();
      const hasSkill = opp.requiredSkills.some(rs => rs.name.toLowerCase().includes(search));
      if (!hasSkill) return false;
    }
    return true;
  });

  // KPI
  const highMatchCount = enhancedOpps.filter(o => o.matchPercentage > 70).length;
  
  // Inscripciones del usuario actual
  const myApplications = jobApplications[currentUser.id] || [];

  // Datos para el gráfico si hay vacante seleccionada
  const chartData = useMemo(() => {
    if (!selectedOpp) return [];
    return selectedOpp.requiredSkills.map(req => {
      const userSkill = currentUser.skills.find(s => s.name === req.name);
      return {
        name: req.name,
        Requerido: req.level,
        Actual: userSkill ? userSkill.level : 0
      };
    });
  }, [selectedOpp, currentUser]);

  // Si es RRHH, calculamos el Top 5 para la vacante seleccionada
  const topCandidates = useMemo(() => {
    if (!isRRHH || !selectedOpp) return [];
    return users
      .filter(u => u.profile !== 'RRHH') // Excluimos a RRHH de ser candidato
      .map(user => ({
        ...user,
        match: calculateMatch(user, selectedOpp)
      }))
      .sort((a, b) => b.match - a.match)
      .slice(0, 5);
  }, [selectedOpp, users, isRRHH]);

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      
      {/* HEADER KPI */}
      <div className="bg-gradient-to-r from-slate-900 to-[#007A33] rounded-2xl py-3.5 px-6 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl font-black mb-0.5">Vacantes Internas</h1>
          <p className="text-xs md:text-sm text-emerald-100/90">Movilidad y nuevas oportunidades en la organización.</p>
        </div>
        {!isRRHH && (
          <div className="relative z-10 bg-white/10 backdrop-blur-md px-4.5 py-2.5 rounded-xl border border-white/20 flex items-center gap-3.5">
            <span className="text-3xl font-black text-emerald-400 leading-none">{highMatchCount}</span>
            <span className="text-[11px] font-extrabold text-slate-200 block text-left leading-tight">
              Vacantes con<br />&gt;70% Match
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3.5 h-[calc(100vh-14.5rem)]">
        
        {/* PANEL IZQUIERDO: Filtros y Lista */}
        <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          
          <div className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-[#007A33] transition-all">
              <Building size={13} className="text-slate-400 shrink-0" />
              <select 
                className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none py-0.5"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-[#007A33] transition-all">
              <Filter size={13} className="text-slate-400 shrink-0" />
              <input 
                type="text"
                placeholder="Filtrar por skill (ej. React)..."
                className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none py-0.5"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
            {filteredOpps.length === 0 ? (
              <div className="text-center p-4 text-xs text-slate-500">No hay vacantes que coincidan con los filtros.</div>
            ) : (
              filteredOpps.map(opp => {
                const isSelected = selectedOpp?.id === opp.id;
                return (
                  <div 
                    key={opp.id}
                    onClick={() => setSelectedOpp(opp)}
                    className={clsx(
                      "p-3 rounded-xl cursor-pointer transition-all border",
                      isSelected 
                        ? "bg-blue-50/50 border-blue-200 shadow-sm" 
                        : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1.5 gap-1.5">
                      <h3 className={clsx("font-extrabold text-xs md:text-sm leading-tight", isSelected ? "text-blue-700" : "text-slate-800")}>
                        {opp.title}
                      </h3>
                      {!isRRHH && (
                        <span className={clsx(
                          "text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0",
                          opp.matchPercentage >= 70 ? "bg-emerald-100 text-[#007A33]" : "bg-slate-100 text-slate-600"
                        )}>
                          {opp.matchPercentage}%
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 flex flex-col gap-1">
                      <span className="flex items-center gap-1.5"><Building size={12}/> {opp.department}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={12}/> {opp.location}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL DERECHO: Detalle y Gráfico */}
        <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative">
          {!selectedOpp ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <Briefcase size={40} className="mb-2.5 opacity-20" />
              <h2 className="text-sm font-bold text-slate-600">Selecciona una vacante</h2>
              <p className="text-[11px] max-w-xs mx-auto">Haz clic en una oportunidad para ver los detalles, comparar tus competencias y aplicar.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 duration-300">
              
              <div className="py-3 px-4 md:py-3.5 md:px-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start mb-2 gap-3">
                  <div>
                    <h2 className="text-base md:text-lg font-black text-slate-800 mb-0.5 leading-tight">{selectedOpp.title}</h2>
                    <div className="flex flex-wrap gap-3 text-[10px] font-semibold text-slate-500">
                      <span className="flex items-center gap-1"><Building size={12} className="text-[#007A33]"/> {selectedOpp.department}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} className="text-[#007A33]"/> {selectedOpp.location}</span>
                    </div>
                  </div>
                  {!isRRHH && myApplications.includes(selectedOpp.id) && (
                    <div className="bg-emerald-100 text-[#007A33] px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 border border-emerald-200 shrink-0">
                      <CheckCircle2 size={12} /> Inscrito
                    </div>
                  )}
                </div>
                <p className="text-[11px] md:text-xs text-slate-600 leading-relaxed">{selectedOpp.description}</p>
              </div>

              <div className="p-4 md:p-5 flex-1 flex flex-col min-h-0">
                {!isRRHH ? (
                  // VISTA EMPLEADO: GRÁFICO DE BARRAS
                  <div className="flex flex-col flex-1 min-h-0">
                    <h3 className="text-xs font-extrabold text-slate-800 mb-2 flex items-center gap-1.5 shrink-0">
                      <Target size={14} className="text-[#007A33]" /> Comparativa de Competencias
                    </h3>
                    
                    <div className="flex-1 w-full min-h-0 h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-card)" />
                          <XAxis type="number" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} stroke="var(--text-secondary)" fontSize={9} />
                          <YAxis dataKey="name" type="category" width={80} stroke="var(--text-primary)" fontWeight="bold" fontSize={9} />
                          <RechartsTooltip 
                            cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.05)', fontSize: 10}}
                          />
                          <Legend wrapperStyle={{paddingTop: '5px', fontSize: 10}} />
                          <Bar dataKey="Requerido" fill="var(--border-card-hover)" radius={[0, 3, 3, 0]} barSize={12} />
                          <Bar dataKey="Actual" fill="#007A33" radius={[0, 3, 3, 0]} barSize={12} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {!myApplications.includes(selectedOpp.id) && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end shrink-0">
                        <button 
                          onClick={() => applyToJob(currentUser.id, selectedOpp.id)}
                          className="px-4 py-2 bg-[#007A33] text-white font-bold rounded-xl shadow-md shadow-emerald-600/10 hover:bg-[#006028] transition-all flex items-center gap-1.5 text-xs"
                        >
                          <Send size={13} /> Inscribirse a la Vacante
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // VISTA RRHH: TOP 5 CANDIDATOS
                  <div className="flex flex-col flex-1 min-h-0">
                    <h3 className="text-xs font-extrabold text-slate-800 mb-3 flex items-center gap-1.5 shrink-0">
                      <Users size={14} className="text-[#007A33]" /> Top 5 Candidatos Internos (Match)
                    </h3>
                    
                    <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                      {topCandidates.map((cand, idx) => (
                        <div key={cand.id} className="flex items-center justify-between p-2.5 border border-slate-100 rounded-xl bg-white hover:border-[#007A33] transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 text-xs shrink-0">
                              #{idx + 1}
                            </div>
                            <img src={cand.avatar} alt="avatar" className="w-9 h-9 rounded-full border border-slate-100 shadow-sm shrink-0" />
                            <div>
                              <h4 className="font-bold text-xs text-slate-800 group-hover:text-[#007A33] transition-colors">{cand.name}</h4>
                              <p className="text-[10px] text-slate-500">{cand.role} · {cand.department}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={clsx(
                              "text-sm font-black",
                              cand.match >= 70 ? "text-[#007A33]" : "text-amber-500"
                            )}>
                              {cand.match}%
                            </span>
                            <span className="block text-[8px] text-slate-400 font-bold">Afinidad</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
