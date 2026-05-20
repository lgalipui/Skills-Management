import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockSkillDetails } from '../data/mockData';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { CheckCircle2, ChevronRight, ChevronLeft, ShieldAlert, FileSignature } from 'lucide-react';
import clsx from 'clsx';

const SCALE = [
  { value: 1, label: "Iniciado" },
  { value: 2, label: "Intermedio" },
  { value: 3, label: "Alto" },
  { value: 4, label: "Experto" }
];

export const SkillsReview = () => {
  const { currentUser } = useAuth();
  const skillsToEvaluate = currentUser.skills || [];

  const [step, setStep] = useState(1);
  const [autoEval, setAutoEval] = useState({});
  const [managerEval, setManagerEval] = useState({});
  const [calibratedEval, setCalibratedEval] = useState({});

  // Validaciones
  const isStep1Complete = skillsToEvaluate.every(s => autoEval[s.id]);
  const isStep2Complete = skillsToEvaluate.every(s => managerEval[s.id]);
  const isStep3Complete = skillsToEvaluate.every(s => calibratedEval[s.id]);

  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  // Datos para el Radar cuando llegamos al paso 4
  const radarData = skillsToEvaluate.map(s => ({
    subject: s.name,
    Auto: autoEval[s.id] || 0,
    Manager: managerEval[s.id] || 0,
    Calibrado: calibratedEval[s.id] || 0,
    fullMark: 4
  }));

  const StepIndicator = ({ number, title, active, completed }) => (
    <div className="flex flex-col items-center relative z-10">
      <div className={clsx(
        "w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm border-2 transition-all duration-300",
        active ? "bg-[#007A33] border-emerald-150 text-white shadow-md shadow-emerald-600/20" : 
        completed ? "bg-white border-[#007A33] text-[#007A33]" : "bg-slate-50 border-slate-200 text-slate-400"
      )}>
        {completed && !active ? <CheckCircle2 size={16} /> : number}
      </div>
      <span className={clsx(
        "text-xs font-bold mt-2 whitespace-nowrap",
        active ? "text-[#007A33]" : completed ? "text-slate-800" : "text-slate-400"
      )}>
        {title}
      </span>
    </div>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-2 relative overflow-hidden">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 relative z-10">Evaluación 360</h1>
        <p className="text-slate-400 text-xs md:text-sm mt-0.5 relative z-10">Proceso de revisión de competencias y calibración de nivel.</p>
        
        {/* Stepper Visual */}
        <div className="mt-6 mb-1 relative z-10">
          <div className="absolute top-[18px] left-10 right-10 h-0.5 bg-slate-100 -z-10"></div>
          <div 
            className="absolute top-[18px] left-10 h-0.5 bg-[#007A33] transition-all duration-500 -z-10"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
          <div className="flex justify-between px-4">
            <StepIndicator number={1} title="Autoevaluación" active={step === 1} completed={step > 1} />
            <StepIndicator number={2} title="Evaluación Manager" active={step === 2} completed={step > 2} />
            <StepIndicator number={3} title="Calibración" active={step === 3} completed={step > 3} />
          </div>
        </div>
      </div>

      {/* Contenido del Paso */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100">
        
        {/* PASO 1: Autoevaluación */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Autoevaluación (Empleado)</h2>
              {currentUser.profile !== 'Employee' && (
                <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center gap-1 font-medium">
                  <ShieldAlert size={14} /> Estás simulando el rol de Empleado
                </span>
              )}
            </div>
            
            <p className="text-slate-500 mb-8">
              Evalúa tu nivel actual en cada competencia usando la escala del 1 (Iniciado) al 4 (Experto).
            </p>

            <div className="space-y-6">
              {skillsToEvaluate.map(skill => {
                const details = mockSkillDetails[skill.name] || {};
                return (
                <div key={skill.id} className="p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors bg-slate-50/50">
                  <div className="mb-4">
                    <h4 className="font-bold text-slate-800">{skill.name}</h4>
                    {details.description && (
                      <p className="text-sm text-slate-500 mt-1">{details.description}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {SCALE.map(s => (
                      <label 
                        key={s.value} 
                        className={clsx(
                          "flex flex-col items-center justify-start p-4 rounded-xl border-2 cursor-pointer transition-all text-center h-full",
                          autoEval[skill.id] === s.value 
                            ? "border-[#007A33] bg-emerald-50 text-[#007A33] shadow-sm" 
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                        )}
                      >
                        <input 
                          type="radio" 
                          name={`auto_${skill.id}`} 
                          value={s.value} 
                          className="sr-only"
                          onChange={() => setAutoEval(prev => ({ ...prev, [skill.id]: s.value }))}
                          checked={autoEval[skill.id] === s.value}
                        />
                        <span className="text-xl font-bold mb-1">{s.value}</span>
                        <span className="text-sm font-semibold mb-2">{s.label}</span>
                        {details.levels && details.levels[s.value] && (
                          <span className={clsx(
                            "text-[11px] leading-snug mt-auto pt-2", 
                            autoEval[skill.id] === s.value ? "text-emerald-700 font-medium" : "text-slate-500"
                          )}>
                            {details.levels[s.value]}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              );})}
            </div>
          </div>
        )}

        {/* PASO 2: Evaluación Manager */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Evaluación Manager</h2>
              {currentUser.profile !== 'Manager' && (
                <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center gap-1 font-medium">
                  <ShieldAlert size={14} /> Estás simulando el rol de Manager
                </span>
              )}
            </div>
            
            <p className="text-slate-500 mb-8">
              Evalúa las competencias del empleado. Puedes ver su autoevaluación como referencia.
            </p>

            <div className="space-y-6">
              {skillsToEvaluate.map(skill => {
                const details = mockSkillDetails[skill.name] || {};
                return (
                <div key={skill.id} className="p-5 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors bg-slate-50/50">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
                    <div>
                      <h4 className="font-bold text-slate-800">{skill.name}</h4>
                      {details.description && (
                        <p className="text-sm text-slate-500 mt-1">{details.description}</p>
                      )}
                    </div>
                    <div className="text-xs font-medium bg-emerald-100 text-[#007A33] px-3 py-1.5 rounded-full shrink-0 h-fit">
                      Autoevaluación: Nivel {autoEval[skill.id]} ({SCALE.find(x => x.value === autoEval[skill.id])?.label})
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {SCALE.map(s => (
                      <label 
                        key={s.value} 
                        className={clsx(
                          "flex flex-col items-center justify-start p-4 rounded-xl border-2 cursor-pointer transition-all text-center h-full",
                          managerEval[skill.id] === s.value 
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" 
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                        )}
                      >
                        <input 
                          type="radio" 
                          name={`manager_${skill.id}`} 
                          value={s.value} 
                          className="sr-only"
                          onChange={() => setManagerEval(prev => ({ ...prev, [skill.id]: s.value }))}
                          checked={managerEval[skill.id] === s.value}
                        />
                        <span className="text-xl font-bold mb-1">{s.value}</span>
                        <span className="text-sm font-semibold mb-2">{s.label}</span>
                        {details.levels && details.levels[s.value] && (
                          <span className={clsx(
                            "text-[11px] leading-snug mt-auto pt-2",
                            managerEval[skill.id] === s.value ? "text-blue-700 font-medium" : "text-slate-500"
                          )}>
                            {details.levels[s.value]}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              );})}
            </div>
          </div>
        )}

        {/* PASO 3: Calibración */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Calibración Final</h2>
            <p className="text-slate-500 mb-8">
              Revisa la nota del Empleado vs Manager y decide el "Nivel Calibrado" final.
            </p>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-semibold text-slate-600">Competencia</th>
                    <th className="p-4 font-semibold text-slate-600 text-center">Auto</th>
                    <th className="p-4 font-semibold text-slate-600 text-center">Manager</th>
                    <th className="p-4 font-semibold text-slate-600">Nivel Calibrado Final</th>
                  </tr>
                </thead>
                <tbody>
                  {skillsToEvaluate.map(skill => (
                    <tr key={skill.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="p-4 font-medium text-slate-800">{skill.name}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex w-8 h-8 rounded-full bg-emerald-100 text-[#007A33] items-center justify-center font-bold">
                          {autoEval[skill.id]}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex w-8 h-8 rounded-full bg-blue-100 text-blue-700 items-center justify-center font-bold">
                          {managerEval[skill.id]}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {SCALE.map(s => (
                            <button
                              key={s.value}
                              onClick={() => setCalibratedEval(prev => ({ ...prev, [skill.id]: s.value }))}
                              className={clsx(
                                "w-10 h-10 rounded-lg border font-bold transition-all",
                                calibratedEval[skill.id] === s.value 
                                  ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/30" 
                                  : "bg-white border-slate-200 text-slate-600 hover:border-purple-300 hover:bg-purple-50"
                              )}
                            >
                              {s.value}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PASO 4: Resultados (Radar) */}
        {step === 4 && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex w-20 h-20 bg-emerald-100 text-[#007A33] rounded-full items-center justify-center mb-4 shadow-lg shadow-emerald-100">
                <FileSignature size={40} />
              </div>
              <h2 className="text-3xl font-bold text-slate-800">Evaluación Completada</h2>
              <p className="text-slate-500 mt-2">La calibración final se ha firmado y registrado exitosamente.</p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 max-w-4xl mx-auto flex flex-col items-center">
              <h3 className="text-xl font-bold text-slate-800 mb-6 w-full text-center">Resultados de Evaluación 360</h3>
              <div className="w-full h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    
                    <Radar name="Auto" dataKey="Auto" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Manager" dataKey="Manager" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Calibrado" dataKey="Calibrado" stroke="#9333ea" fill="#9333ea" fillOpacity={0.4} strokeWidth={3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <button 
                onClick={() => { setStep(1); setAutoEval({}); setManagerEval({}); setCalibratedEval({}); }}
                className="text-slate-500 hover:text-[#007A33] font-medium"
              >
                Comenzar nueva evaluación
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {step < 4 && (
          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className={clsx(
                "px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all",
                step === 1 ? "opacity-0 cursor-default" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              <ChevronLeft size={18} /> Atrás
            </button>
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={(step === 1 && !isStep1Complete) || (step === 2 && !isStep2Complete)}
                className="px-6 py-2.5 bg-[#007A33] text-white rounded-xl font-medium shadow-lg shadow-emerald-600/20 hover:bg-[#006028] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#007A33] disabled:shadow-none"
              >
                Siguiente <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isStep3Complete}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium shadow-lg shadow-purple-600/30 hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Firmar y Cerrar Evaluación <FileSignature size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
