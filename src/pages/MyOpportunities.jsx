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
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER KPI */}
      <div className="bg-gradient-to-r from-slate-900 to-[#007A33] rounded-3xl p-8 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-1">Vacantes Internas</h1>
          <p className="text-emerald-100">Movilidad y nuevas oportunidades en la organización.</p>
        </div>
        {!isRRHH && (
          <div className="relative z-10 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center">
            <span className="block text-4xl font-bold text-emerald-400">{highMatchCount}</span>
            <span className="text-sm font-medium text-slate-200">Vacantes con &gt;70% Match</span>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-16rem)]">
        
        {/* PANEL IZQUIERDO: Filtros y Lista */}
        <div className="w-full md:w-1/3 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-[#007A33] transition-all">
              <Building size={16} className="text-slate-400 shrink-0" />
              <select 
                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-[#007A33] transition-all">
              <Filter size={16} className="text-slate-400 shrink-0" />
              <input 
                type="text"
                placeholder="Filtrar por skill (ej. React)..."
                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredOpps.length === 0 ? (
              <div className="text-center p-8 text-slate-500">No hay vacantes que coincidan con los filtros.</div>
            ) : (
              filteredOpps.map(opp => {
                const isSelected = selectedOpp?.id === opp.id;
                return (
                  <div 
                    key={opp.id}
                    onClick={() => setSelectedOpp(opp)}
                    className={clsx(
                      "p-4 rounded-2xl cursor-pointer transition-all border",
                      isSelected 
                        ? "bg-blue-50/50 border-blue-200 shadow-sm" 
                        : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={clsx("font-bold leading-tight", isSelected ? "text-blue-700" : "text-slate-800")}>
                        {opp.title}
                      </h3>
                      {!isRRHH && (
                        <span className={clsx(
                          "text-xs font-bold px-2 py-1 rounded-md ml-2 shrink-0",
                          opp.matchPercentage >= 70 ? "bg-emerald-100 text-[#007A33]" : "bg-slate-100 text-slate-600"
                        )}>
                          {opp.matchPercentage}%
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex flex-col gap-1">
                      <span className="flex items-center gap-1"><Building size={12}/> {opp.department}</span>
                      <span className="flex items-center gap-1"><MapPin size={12}/> {opp.location}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL DERECHO: Detalle y Gráfico */}
        <div className="w-full md:w-2/3 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative">
          {!selectedOpp ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Briefcase size={64} className="mb-4 opacity-20" />
              <h2 className="text-xl font-bold text-slate-600">Selecciona una vacante</h2>
              <p>Haz clic en una oportunidad para ver los detalles, comparar tus competencias y aplicar.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 duration-300">
              
              <div className="p-8 border-b border-slate-100 bg-slate-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">{selectedOpp.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                      <span className="flex items-center gap-1"><Building size={16} className="text-[#007A33]"/> {selectedOpp.department}</span>
                      <span className="flex items-center gap-1"><MapPin size={16} className="text-[#007A33]"/> {selectedOpp.location}</span>
                    </div>
                  </div>
                  {!isRRHH && myApplications.includes(selectedOpp.id) && (
                    <div className="bg-emerald-100 text-[#007A33] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 border border-emerald-200">
                      <CheckCircle2 size={18} /> Inscrito
                    </div>
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed">{selectedOpp.description}</p>
              </div>

              <div className="p-8 flex-1">
                {!isRRHH ? (
                  // VISTA EMPLEADO: GRÁFICO DE BARRAS
                  <>
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Target size={20} className="text-[#007A33]" /> Comparativa de Competencias
                    </h3>
                    
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                          <XAxis type="number" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#94A3B8" />
                          <YAxis dataKey="name" type="category" width={120} stroke="#475569" fontWeight="bold" fontSize={12} />
                          <RechartsTooltip 
                            cursor={{fill: '#F1F5F9'}} 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                          />
                          <Legend wrapperStyle={{paddingTop: '20px'}} />
                          <Bar dataKey="Requerido" fill="#CBD5E1" radius={[0, 4, 4, 0]} barSize={20} />
                          <Bar dataKey="Actual" fill="#007A33" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {!myApplications.includes(selectedOpp.id) && (
                      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                        <button 
                          onClick={() => applyToJob(currentUser.id, selectedOpp.id)}
                          className="px-8 py-4 bg-[#007A33] text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-[#006028] transition-colors flex items-center gap-2 text-lg"
                        >
                          <Send size={20} /> Inscribirse a la Vacante
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  // VISTA RRHH: TOP 5 CANDIDATOS
                  <>
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Users size={20} className="text-[#007A33]" /> Top 5 Candidatos Internos (Match)
                    </h3>
                    
                    <div className="space-y-4">
                      {topCandidates.map((cand, idx) => (
                        <div key={cand.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-white hover:border-[#007A33] transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">
                              #{idx + 1}
                            </div>
                            <img src={cand.avatar} alt="avatar" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                            <div>
                              <h4 className="font-bold text-slate-800 group-hover:text-[#007A33] transition-colors">{cand.name}</h4>
                              <p className="text-xs text-slate-500">{cand.role} · {cand.department}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={clsx(
                              "text-xl font-bold",
                              cand.match >= 70 ? "text-[#007A33]" : "text-amber-500"
                            )}>
                              {cand.match}%
                            </span>
                            <span className="block text-xs text-slate-400 font-medium">Afinidad</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
