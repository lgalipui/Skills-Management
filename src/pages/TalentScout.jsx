import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Trophy, BarChart2, X, PlusCircle, UserCheck, CheckCircle2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import clsx from 'clsx';

export const TalentScout = () => {
  const { users, currentUser } = useAuth();
  
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillLevels, setSkillLevels] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [areaFilter, setAreaFilter] = useState('Todas');
  
  const [selectedToCompare, setSelectedToCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Extract unique areas
  const areas = ['Todas', ...new Set(users.filter(u => u.profile !== 'RRHH').map(u => u.department))];

  // Extract all unique skills across all users in the dataset
  const allUniqueSkills = useMemo(() => {
    const skillSet = new Set();
    users.forEach(u => {
      if (u.skills) {
        u.skills.forEach(s => skillSet.add(s.name));
      }
    });
    return Array.from(skillSet).sort();
  }, [users]);

  // Filter skills for the multiselect dropdown
  const filteredDropdownSkills = useMemo(() => {
    return allUniqueSkills.filter(skill => 
      skill.toLowerCase().includes(searchVal.toLowerCase()) &&
      !selectedSkills.includes(skill)
    );
  }, [allUniqueSkills, searchVal, selectedSkills]);

  const addSkill = (skill) => {
    setSelectedSkills(prev => [...prev, skill]);
    setSkillLevels(prev => ({ ...prev, [skill]: 1 })); // Initialize required level at 1
    setSearchVal('');
  };

  const removeSkill = (skill) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
    setSkillLevels(prev => {
      const copy = { ...prev };
      delete copy[skill];
      return copy;
    });
  };

  // Buscador y Matching Score
  const searchResults = useMemo(() => {
    return users
      .filter(u => u.profile !== 'RRHH') // Excluir perfiles HR
      .map(user => {
        let score = 0;
        let meetsCriteria = true;

        if (areaFilter !== 'Todas' && user.department !== areaFilter) {
          meetsCriteria = false;
        }

        if (selectedSkills.length > 0) {
          let totalScore = 0;
          let hasAll = true;

          for (const filterSkill of selectedSkills) {
            const userSkill = user.skills?.find(s => s.name.toLowerCase() === filterSkill.toLowerCase());
            const requiredLevel = skillLevels[filterSkill] || 1;
            if (!userSkill || userSkill.level < requiredLevel) {
              hasAll = false;
              break;
            } else {
              totalScore += (userSkill.level / 5) * 100;
            }
          }

          if (!hasAll) {
            meetsCriteria = false;
          } else {
            score = totalScore / selectedSkills.length;
          }
        } else {
          // Si no hay filtro de skill, ordenamos por nivel promedio global
          const avgLevel = user.skills?.reduce((acc, s) => acc + s.level, 0) / (user.skills?.length || 1) || 0;
          score = (avgLevel / 5) * 100;
        }

        return { ...user, matchScore: Math.round(score), meetsCriteria };
      })
      .filter(u => u.meetsCriteria)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [users, selectedSkills, skillLevels, areaFilter]);

  const top3 = searchResults.slice(0, 3);
  const restOfResults = searchResults.slice(3);

  const toggleCompare = (userId) => {
    if (selectedToCompare.includes(userId)) {
      setSelectedToCompare(prev => prev.filter(id => id !== userId));
    } else {
      if (selectedToCompare.length < 3) {
        setSelectedToCompare(prev => [...prev, userId]);
      }
    }
  };

  // Preparar datos para el RadarChart
  const compareData = useMemo(() => {
    if (selectedToCompare.length === 0) return [];
    
    const selectedUsers = users.filter(u => selectedToCompare.includes(u.id));
    
    // Get all unique skills among selected users
    const allSkills = new Set();
    selectedUsers.forEach(u => u.skills?.forEach(s => allSkills.add(s.name)));
    
    return Array.from(allSkills).map(skillName => {
      const dataPoint = { subject: skillName };
      selectedUsers.forEach((user, idx) => {
        const userSkill = user.skills?.find(s => s.name === skillName);
        dataPoint[`Candidato${idx + 1}`] = userSkill ? userSkill.level : 0;
        dataPoint[`name${idx + 1}`] = user.name;
      });
      return dataPoint;
    });
  }, [selectedToCompare, users]);

  const colors = ['#007A33', '#F59E0B', '#3B82F6'];

  if (currentUser.profile !== 'RRHH') {
    return <div className="p-8 text-center text-rose-500 font-bold">Acceso denegado. Exclusivo RRHH.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER & SEARCH FORM */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 relative">
        {/* Decorative background clipped separately */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#007A33] opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="p-8 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <Search className="text-[#007A33]" size={28} /> Internal Talent Scout
              </h1>
              <p className="text-slate-500 mt-1">Busca y descubre el talento oculto dentro de la organización.</p>
            </div>
            
            <button 
              disabled={selectedToCompare.length === 0}
              onClick={() => setShowCompareModal(true)}
              className={clsx(
                "px-6 py-3 font-bold rounded-xl shadow-md transition-all flex items-center gap-2",
                selectedToCompare.length > 0 
                  ? "bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1" 
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              <BarChart2 size={20} />
              Comparar ({selectedToCompare.length}/3)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            {/* MULTISELECT SKILLS FILTER (takes up 2 columns now!) */}
            <div className="md:col-span-2 relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Competencias / Skills requeridas (y nivel mínimo individual)</label>
              
              {isDropdownOpen && (
                <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)}></div>
              )}
              
              <div 
                onClick={() => setIsDropdownOpen(true)}
                className="w-full min-h-[46px] px-3 py-1.5 border border-slate-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-[#007A33] focus-within:border-transparent flex flex-wrap gap-1.5 items-center cursor-text relative z-30 transition-all duration-200"
              >
                {selectedSkills.map(skill => (
                  <span 
                    key={skill} 
                    className="bg-[#007A33]/10 text-[#007A33] border border-[#007A33]/20 pl-2.5 pr-1.5 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1.5 select-none animate-in zoom-in-95 duration-100"
                    onClick={(e) => e.stopPropagation()} // Prevent opening dropdown when clicking pill itself
                  >
                    {skill}
                    
                    {/* Inline specific level selector for this skill */}
                    <select
                      value={skillLevels[skill] || 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSkillLevels(prev => ({ ...prev, [skill]: val }));
                      }}
                      className="bg-[#007A33]/10 hover:bg-[#007A33]/20 border-none rounded px-1 py-0.2 text-[10px] font-black text-[#007A33] outline-none cursor-pointer transition-colors"
                      title="Nivel mínimo requerido para este skill"
                    >
                      <option value={1} className="bg-white text-slate-700">L1</option>
                      <option value={2} className="bg-white text-slate-700">L2</option>
                      <option value={3} className="bg-white text-slate-700">L3</option>
                      <option value={4} className="bg-white text-slate-700">L4</option>
                      <option value={5} className="bg-white text-slate-700">L5</option>
                    </select>

                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSkill(skill);
                      }}
                      className="p-0.5 rounded-full hover:bg-[#007A33]/20 text-[#007A33] transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input 
                  type="text" 
                  placeholder={selectedSkills.length === 0 ? "Ej. React, Agile, SQL..." : "Añadir competencia..."}
                  className="flex-1 min-w-[120px] bg-transparent outline-none border-none text-xs font-medium py-1 text-slate-700 placeholder:text-slate-400"
                  value={searchVal}
                  onChange={e => {
                    setSearchVal(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                />
              </div>
              
              {isDropdownOpen && filteredDropdownSkills.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto custom-scrollbar p-1.5 animate-in slide-in-from-top-2 duration-150">
                  {filteredDropdownSkills.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addSkill(skill);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-[#007A33]/5 hover:text-[#007A33] transition-colors flex items-center justify-between group"
                    >
                      {skill}
                      <PlusCircle size={14} className="text-slate-400 group-hover:text-[#007A33] transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Área Organizativa</label>
              <select 
                className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#007A33] outline-none text-sm font-medium h-[46px]"
                value={areaFilter}
                onChange={e => setAreaFilter(e.target.value)}
              >
                {areas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTADOS TOP 3 */}
      {top3.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Trophy className="text-amber-500" /> Candidatos Destacados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {top3.map((user, idx) => {
              const isSelected = selectedToCompare.includes(user.id);
              const rankColor = idx === 0 ? "border-amber-400 bg-amber-50" : idx === 1 ? "border-slate-300 bg-slate-50" : "border-orange-300 bg-orange-50";
              const rankBadge = idx === 0 ? "bg-amber-400 text-white" : idx === 1 ? "bg-slate-300 text-slate-700" : "bg-orange-300 text-orange-900";

              return (
                <div key={user.id} className={clsx("rounded-3xl p-6 relative shadow-md transition-all hover:-translate-y-1 border-2 flex flex-col", rankColor)}>
                  <div className={clsx("absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg", rankBadge)}>
                    #{idx + 1}
                  </div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-4 border-white shadow-sm" />
                    <div className="text-right">
                      <span className="block text-2xl font-bold text-slate-800">{user.matchScore}%</span>
                      <span className="text-xs font-bold uppercase text-slate-500">Match</span>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg text-slate-800 leading-tight">{user.name}</h3>
                  <p className="text-sm text-slate-500 mb-2">{user.role}</p>

                  {/* Render Levels for Selected Skills */}
                  {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {selectedSkills.map(skillName => {
                        const s = user.skills?.find(sk => sk.name.toLowerCase() === skillName.toLowerCase());
                        const reqL = skillLevels[skillName] || 1;
                        return (
                          <span key={skillName} className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#007A33]/10 text-[#007A33] border border-[#007A33]/20 flex items-center gap-1">
                            {skillName}: <span className="font-black text-slate-700">L{s?.level || 0}</span><span className="text-slate-400 font-bold">/L{reqL}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  
                  <button 
                    onClick={() => toggleCompare(user.id)}
                    className={clsx(
                      "w-full py-2 rounded-xl font-bold text-sm transition-colors border flex justify-center items-center gap-2 mt-auto",
                      isSelected 
                        ? "bg-slate-800 text-white border-slate-800" 
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    {isSelected ? <><UserCheck size={16}/> Seleccionado</> : <><PlusCircle size={16}/> Añadir a comparativa</>}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* RESTO DE RESULTADOS */}
      {restOfResults.length > 0 && (
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Otros perfiles que encajan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {restOfResults.map(user => {
              const isSelected = selectedToCompare.includes(user.id);
              return (
                <div key={user.id} className="border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight truncate">{user.name}</h4>
                      <p className="text-xs text-slate-500 mb-1">{user.matchScore}% Match</p>
                      
                      {/* Levels for Selected Skills */}
                      {selectedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedSkills.map(skillName => {
                            const s = user.skills?.find(sk => sk.name.toLowerCase() === skillName.toLowerCase());
                            const reqL = skillLevels[skillName] || 1;
                            return (
                              <span key={skillName} className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-150">
                                {skillName}: L{s?.level || 0}/L{reqL}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleCompare(user.id)}
                    className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
                      isSelected ? "bg-[#007A33] text-white shadow-md" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    )}
                  >
                    {isSelected ? <CheckCircle2 size={16} /> : <PlusCircle size={16} />}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {searchResults.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center">
          <Filter size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-600">No hay resultados</h2>
          <p className="text-slate-500 mt-2">Prueba a rebajar los niveles requeridos o buscar otras competencias.</p>
        </div>
      )}

      {/* MODAL DE COMPARATIVA RADAR */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCompareModal(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl relative z-10 flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 className="text-[#007A33]" /> Comparativa de Talento
              </h2>
              <button onClick={() => setShowCompareModal(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 p-8 flex flex-col md:flex-row gap-8 overflow-y-auto custom-scrollbar">
              
              {/* LEYENDA CANDIDATOS */}
              <div className="w-full md:w-1/3 space-y-4">
                <h3 className="font-bold text-slate-400 uppercase tracking-wider text-sm mb-4">Candidatos Seleccionados</h3>
                {selectedToCompare.map((id, idx) => {
                  const user = users.find(u => u.id === id);
                  return (
                    <div key={id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                      <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: colors[idx] }}></div>
                      <img src={user.avatar} className="w-10 h-10 rounded-full" alt="avatar"/>
                      <div>
                        <p className="font-bold text-sm text-slate-800 leading-tight">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.role}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* GRÁFICO RADAR */}
              <div className="w-full md:w-2/3 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={compareData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94A3B8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value, name, props) => {
                        // Rescatamos el nombre real del candidato desde el payload
                        const candidateIndex = name.replace('Candidato', '');
                        const realName = props.payload[`name${candidateIndex}`];
                        return [value, realName];
                      }}
                    />
                    
                    {selectedToCompare.map((id, idx) => (
                      <Radar
                        key={id}
                        name={`Candidato${idx + 1}`}
                        dataKey={`Candidato${idx + 1}`}
                        stroke={colors[idx]}
                        fill={colors[idx]}
                        fillOpacity={0.3}
                      />
                    ))}
                    <Legend 
                      formatter={(value) => {
                         const candidateIndex = value.replace('Candidato', '');
                         const realName = compareData[0] ? compareData[0][`name${candidateIndex}`] : value;
                         return <span style={{ color: '#475569', fontWeight: 600 }}>{realName}</span>;
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
