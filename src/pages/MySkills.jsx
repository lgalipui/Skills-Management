import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Star, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const MySkills = () => {
  const { currentUser } = useAuth();

  // Prepare data for Recharts
  const radarData = currentUser.skills?.map(s => ({
    subject: s.name,
    Actual: s.level,
    Requerido: s.required,
    fullMark: 5,
  })) || [];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Mis Skills</h1>
          <p className="text-slate-500 mt-1">Evalúa tu nivel actual frente a los requerimientos de tu rol.</p>
        </div>
        <button className="px-6 py-2.5 bg-[#007A33] text-white rounded-xl font-medium shadow-lg hover:bg-[#006028] transition-colors">
          Auto-evaluación
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Radar de Competencias</h3>
          <div className="flex-1 min-h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                <Radar name="Tu Nivel" dataKey="Actual" stroke="#007A33" fill="#007A33" fillOpacity={0.4} />
                <Radar name="Nivel Requerido" dataKey="Requerido" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeDasharray="3 3" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills List Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Detalle de Skills</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {currentUser.skills?.map(skill => {
              const gap = skill.required - skill.level;
              const hasGap = gap > 0;
              const isExceeding = gap < 0;

              return (
                <div key={skill.id} className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors group">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        {skill.name}
                        {hasGap && <ShieldAlert size={16} className="text-amber-500" />}
                        {!hasGap && <CheckCircle2 size={16} className="text-[#007A33]" />}
                      </h4>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md mt-1 inline-block">
                        {skill.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <span className="text-slate-800 text-lg">{skill.level}</span>
                        <span className="text-slate-400">/ 5</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block text-slate-500">
                          Requerido: {skill.required}
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-slate-100">
                      <div 
                        style={{ width: `${(skill.level / 5) * 100}%` }} 
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${
                          hasGap ? 'bg-amber-400' : isExceeding ? 'bg-blue-500' : 'bg-[#007A33]'
                        }`}
                      ></div>
                      {/* Required Marker */}
                      <div 
                        className="absolute top-6 bottom-4 w-1 bg-slate-800 rounded-full z-10 transform -translate-x-1/2"
                        style={{ left: `${(skill.required / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
