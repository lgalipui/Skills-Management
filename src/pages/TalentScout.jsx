import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Trophy, BarChart2, X, PlusCircle, UserCheck } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import clsx from 'clsx';

export const TalentScout = () => {
  const { users, currentUser } = useAuth();
  
  const [skillFilter, setSkillFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState(1);
  const [areaFilter, setAreaFilter] = useState('Todas');
  
  const [selectedToCompare, setSelectedToCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Extract unique areas
  const areas = ['Todas', ...new Set(users.filter(u => u.profile !== 'RRHH').map(u => u.department))];

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

        if (skillFilter.trim() !== '') {
          const targetSkill = user.skills.find(s => s.name.toLowerCase().includes(skillFilter.toLowerCase()));
          if (!targetSkill) {
            meetsCriteria = false;
          } else {
            // Puntuamos cuánto supera el mínimo requerido
            if (targetSkill.level < levelFilter) {
              meetsCriteria = false;
            } else {
              score = ((targetSkill.level / 5) * 100);
            }
          }
        } else {
          // Si no hay filtro de skill, ordenamos por nivel promedio global
          const avgLevel = user.skills.reduce((acc, s) => acc + s.level, 0) / (user.skills.length || 1);
          score = (avgLevel / 5) * 100;
        }

        return { ...user, matchScore: Math.round(score), meetsCriteria };
      })
      .filter(u => u.meetsCriteria)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [users, skillFilter, levelFilter, areaFilter]);

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
    selectedUsers.forEach(u => u.skills.forEach(s => allSkills.add(s.name)));
    
    return Array.from(allSkills).map(skillName => {
      const dataPoint = { subject: skillName };
      selectedUsers.forEach((user, idx) => {
        const userSkill = user.skills.find(s => s.name === skillName);
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
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#007A33] opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        
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
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Competencia / Skill</label>
              <input 
                type="text" 
                placeholder="Ej. React, Agile, SQL..."
                className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#007A33] outline-none"
                value={skillFilter}
                onChange={e => setSkillFilter(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nivel Mínimo: {levelFilter}</label>
              <input 
                type="range" 
                min="1" max="5" step="1"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#007A33] mt-3"
                value={levelFilter}
                onChange={e => setLevelFilter(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-xs text-slate-400 font-medium mt-2 px-1">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Área Organizativa</label>
              <select 
                className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#007A33] outline-none"
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
                <div key={user.id} className={clsx("rounded-3xl p-6 relative shadow-md transition-all hover:-translate-y-1 border-2", rankColor)}>
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
                  <p className="text-sm text-slate-500 mb-4">{user.role}</p>

                  <button 
                    onClick={() => toggleCompare(user.id)}
                    className={clsx(
                      "w-full py-2 rounded-xl font-bold text-sm transition-colors border flex justify-center items-center gap-2",
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
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{user.name}</h4>
                      <p className="text-xs text-slate-500">{user.matchScore}% Match</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleCompare(user.id)}
                    className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
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
          <p className="text-slate-500 mt-2">Prueba a rebajar el nivel mínimo o buscar otra competencia.</p>
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
