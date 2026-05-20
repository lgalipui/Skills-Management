import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
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
    <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800">Mis Skills</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">Evalúa tu nivel actual frente a los requerimientos de tu rol.</p>
        </div>
        <Link 
          to="/myupskilling"
          className="px-4 py-2 bg-[#007A33] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/10 hover:bg-[#006028] transition-all inline-flex items-center justify-center shrink-0"
        >
          Ir a My Upskilling
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[520px]">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Radar de Competencias</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }}/>
                <Radar name="Tu Nivel" dataKey="Actual" stroke="#007A33" fill="#007A33" fillOpacity={0.4} />
                <Radar name="Nivel Requerido" dataKey="Requerido" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeDasharray="3 3" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills List Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[520px]">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Detalle de Skills</h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
            {currentUser.skills?.map(skill => {
              const gap = skill.required - skill.level;
              const hasGap = gap > 0;
              const isExceeding = gap < 0;

              return (
                <div key={skill.id} className="p-3.5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors group">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-[15px]">
                        {skill.name}
                        {hasGap && <ShieldAlert size={15} className="text-amber-500" />}
                        {!hasGap && <CheckCircle2 size={15} className="text-[#007A33]" />}
                      </h4>
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                        {skill.category}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-baseline gap-1 font-semibold">
                        <span className="text-slate-800 text-lg leading-none">{skill.level}</span>
                        <span className="text-slate-400 text-xs">/ 5</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1">Req: {skill.required}</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative mt-2">
                    <div className="overflow-hidden h-2 flex rounded-full bg-slate-100">
                      <div 
                        style={{ width: `${(skill.level / 5) * 100}%` }} 
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${
                          hasGap ? 'bg-amber-400' : isExceeding ? 'bg-blue-500' : 'bg-[#007A33]'
                        }`}
                      ></div>
                    </div>
                    {/* Required Marker */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-slate-800 rounded-full z-10 transform -translate-x-1/2"
                      style={{ left: `${(skill.required / 5) * 100}%` }}
                    ></div>
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
