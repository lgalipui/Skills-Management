import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { 
  Star, 
  ShieldAlert, 
  CheckCircle2, 
  Cpu, 
  Sparkles, 
  Award, 
  Info,
  HelpCircle
} from 'lucide-react';

export const MySkills = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('technical'); // 'technical' o 'soft'

  const userSkills = currentUser?.skills || [];

  // Clasificación de Habilidades
  const technicalSkills = useMemo(() => {
    return userSkills.filter(s => s && (s.category === 'Técnica' || s.category === 'Metodología'));
  }, [userSkills]);

  const softSkills = useMemo(() => {
    return userSkills.filter(s => s && s.category === 'Soft Skill');
  }, [userSkills]);

  // Habilidades de la pestaña activa
  const filteredSkills = useMemo(() => {
    return activeTab === 'technical' ? technicalSkills : softSkills;
  }, [activeTab, technicalSkills, softSkills]);

  // Datos para gráficos
  const radarData = useMemo(() => {
    return filteredSkills.map(s => ({
      subject: s.name,
      Actual: Number(s.level) || 0,
      Requerido: Number(s.required) || 0,
      fullMark: 5,
    }));
  }, [filteredSkills]);

  const barData = useMemo(() => {
    return filteredSkills.map(s => ({
      name: s.name,
      'Tu Nivel': Number(s.level) || 0,
      'Requerido': Number(s.required) || 0,
    }));
  }, [filteredSkills]);

  // Cálculo de estadísticas rápidas de la pestaña
  const stats = useMemo(() => {
    if (filteredSkills.length === 0) return { total: 0, covered: 0, gaps: 0 };
    let covered = 0;
    let gaps = 0;
    filteredSkills.forEach(s => {
      if (s.level >= s.required) {
        covered++;
      } else {
        gaps++;
      }
    });
    return {
      total: filteredSkills.length,
      covered,
      gaps
    };
  }, [filteredSkills]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Mis Skills</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">Evalúa tu nivel actual frente a los requerimientos de tu rol.</p>
        </div>
        <Link 
          to="/myupskilling"
          className="px-4.5 py-2.5 bg-[#007A33] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/10 hover:bg-[#006028] transition-all inline-flex items-center justify-center shrink-0 gap-1.5"
        >
          <span>Ir a My Upskilling</span>
        </Link>
      </div>

      {/* 2. PANELES DE CONTROL / PESTAÑAS ESTATISTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Pestaña Técnica / Funcional */}
        <button
          onClick={() => setActiveTab('technical')}
          className={`flex items-center justify-between p-4.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
            activeTab === 'technical'
              ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/20'
              : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl transition-colors ${
              activeTab === 'technical' ? 'bg-[#007A33] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
            }`}>
              <Cpu size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Habilidades</span>
              <span className="text-sm font-black text-slate-800 block mt-0.5">Técnicas y Funcionales</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xl font-black ${activeTab === 'technical' ? 'text-[#007A33]' : 'text-slate-500'}`}>
              {technicalSkills.length}
            </span>
            <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Competencias</span>
          </div>
        </button>

        {/* Pestaña Soft / Transversal */}
        <button
          onClick={() => setActiveTab('soft')}
          className={`flex items-center justify-between p-4.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
            activeTab === 'soft'
              ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/20'
              : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl transition-colors ${
              activeTab === 'soft' ? 'bg-[#007A33] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
            }`}>
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Habilidades</span>
              <span className="text-sm font-black text-slate-800 block mt-0.5">Soft y Transversales</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xl font-black ${activeTab === 'soft' ? 'text-[#007A33]' : 'text-slate-500'}`}>
              {softSkills.length}
            </span>
            <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Competencias</span>
          </div>
        </button>

      </div>

      {/* 3. RESUMEN DE ESTADO DE LA CATEGORÍA */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Info size={14} className="text-[#007A33] shrink-0" />
          <span className="text-xs font-bold text-slate-600">
            {activeTab === 'technical' 
              ? 'Estas competencias definen el conocimiento tecnológico, metodologías y especialidad funcional de tu rol actual.' 
              : 'Estas habilidades son de carácter conductual, relacional y transversal, vitales para el liderazgo y colaboración.'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-slate-100 py-1 px-2.5 rounded-lg shadow-xs">
            <CheckCircle2 size={13} className="text-[#007A33]" />
            <span className="text-[10px] font-bold text-slate-500">Cubiertas: <strong className="text-slate-800">{stats.covered}</strong></span>
          </div>
          {stats.gaps > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-100 py-1 px-2.5 rounded-lg shadow-xs">
              <ShieldAlert size={13} className="text-amber-500" />
              <span className="text-[10px] font-bold text-slate-500">Brechas: <strong className="text-slate-800">{stats.gaps}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* 4. SECCIÓN DE ANÁLISIS DE DATOS Y LISTADO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LADO IZQUIERDO: GRÁFICO ADAPTATIVO */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[520px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">
                {filteredSkills.length >= 3 ? 'Radar de Competencias' : 'Comparativa de Niveles'}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Visualización del perfil en la categoría seleccionada</p>
            </div>
            
            {filteredSkills.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-1.5 bg-[#007A33] rounded-sm" />
                  <span className="text-[8px] font-extrabold text-slate-400 uppercase">Tu Nivel</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-1.5 bg-blue-500 rounded-sm" />
                  <span className="text-[8px] font-extrabold text-slate-400 uppercase">Requerido</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 w-full min-h-0 flex items-center justify-center">
            {filteredSkills.length === 0 ? (
              <div className="text-center space-y-3 p-6 max-w-sm">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto border border-dashed border-slate-200">
                  <HelpCircle size={22} />
                </div>
                <h4 className="text-xs font-bold text-slate-700">Sin Competencias</h4>
                <p className="text-[10px] text-slate-400">No se han registrado habilidades de esta categoría para tu rol actual en la base de datos de Cajamar.</p>
              </div>
            ) : filteredSkills.length >= 3 ? (
              // Radar de Competencias (Para >= 3 Habilidades)
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="var(--border-card)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Radar name="Tu Nivel" dataKey="Actual" stroke="#007A33" fill="#007A33" fillOpacity={0.4} />
                  <Radar name="Nivel Requerido" dataKey="Requerido" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeDasharray="3 3" />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              // Gráfico de Barras Comparativo (Para 1 o 2 Habilidades)
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-card)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }} />
                  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="Tu Nivel" fill="#007A33" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="Requerido" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* LADO DERECHO: LISTADO DETALLADO */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[520px]">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">Detalle de Skills</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Puntuación real y objetivo de nivel de habilidades</p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2 mt-4 custom-scrollbar min-h-0">
            {filteredSkills.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <p className="text-xs font-bold text-slate-400">No hay detalles disponibles para mostrar.</p>
              </div>
            ) : (
              filteredSkills.map(skill => {
                if (!skill) return null;
                const gap = (Number(skill.required) || 0) - (Number(skill.level) || 0);
                const hasGap = gap > 0;
                const isExceeding = gap < 0;

                return (
                  <div key={skill.id} className="p-3 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all duration-200 group">
                    <div className="flex justify-between items-center mb-1.5">
                      <div>
                        <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs md:text-sm">
                          {skill.name}
                          {hasGap && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100 flex items-center gap-0.5">
                              <ShieldAlert size={10} />
                              <span>Pendiente (-{gap})</span>
                            </span>
                          )}
                          {!hasGap && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-emerald-50 text-[#007A33] rounded-full border border-emerald-100 flex items-center gap-0.5">
                              <CheckCircle2 size={10} />
                              <span>Cubierto{isExceeding && ` (+${Math.abs(gap)})`}</span>
                            </span>
                          )}
                        </h4>
                        <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mt-1 inline-block uppercase tracking-wider">
                          {skill.category}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-end shrink-0">
                        <div className="flex items-baseline gap-0.5 font-bold">
                          <span className="text-slate-800 text-base leading-none">{skill.level}</span>
                          <span className="text-slate-400 text-[10px]">/ 5</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-400 mt-1">Requerido: {skill.required}</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative mt-2">
                      <div className="overflow-hidden h-1.5 flex rounded-full bg-slate-100">
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
                        title={`Nivel requerido: ${skill.required}`}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
