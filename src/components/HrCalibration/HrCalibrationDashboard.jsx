import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, 
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Legend, Cell 
} from 'recharts';
import { 
  Users, Scale, Award, Sparkles, TrendingUp, AlertCircle, X, 
  ChevronRight, Info, Eye, BarChart3, HelpCircle 
} from 'lucide-react';
import clsx from 'clsx';

// Mapeo estático de notas base mockeadas para simulación detallada de habilidades
const AUTO_EVAL_MOCK = { s1: 4, s2: 2, s3: 3, s7: 2, s8: 3 };
const MANAGER_EVAL_MOCK = { s1: 3, s2: 3, s3: 2, s7: 3, s8: 3 };
const PEER_EVAL_MOCK = { s1: 3, s2: 3, s3: 2, s7: 3, s8: 2 };

// Mapeo estático de nombres de mánager por ID de usuario
const MANAGER_NAMES = {
  2: "Carlos Martínez",
  3: "Elena Rodríguez",
  13: "Luis Miguel García"
};

export const HrCalibrationDashboard = ({ filteredEmployees = [], calibratedUsersData = {}, handleOpenCalibration }) => {
  // --- SUB-TABS INTERNAS DEL DASHBOARD ---
  const [activeSubTab, setActiveSubTab] = useState('evaluados'); // 'evaluados', 'evaluadores', 'gaps'

  // --- FILTRO DE CATEGORÍA DE SKILLS PARA EL RANKING DE GAPS ---
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('Todas'); // 'Todas', 'Técnica', 'Soft Skill', 'Metodología'

  // --- ESTADO PARA LA FICHA DETALLADA (DRAWER LATERAL) ---
  const [selectedColab, setSelectedColab] = useState(null);

  // --- BUSCADOR DE COLABORADOR EN LA TABLA INTERNA ---
  const [tableSearchQuery, setTableSearchQuery] = useState('');

  // =========================================================================
  // 1. CÁLCULO DE MÉTRICAS Y KPIS GLOBALES EN EL PERÍMETRO FILTRADO
  // =========================================================================
  const stats = useMemo(() => {
    const totalColabs = filteredEmployees.length;
    let totalSkillsEvaluated = 0;
    let matchingSkills = 0;
    let totalBiasSum = 0;
    let biasCount = 0;

    filteredEmployees.forEach(emp => {
      const calibrationState = calibratedUsersData[emp.id] || {};
      const skills = emp.skills || [];
      totalSkillsEvaluated += skills.length;

      skills.forEach(skill => {
        const autoVal = AUTO_EVAL_MOCK[skill.id] || 3;
        const managerVal = calibrationState.ratings?.[skill.id] || MANAGER_EVAL_MOCK[skill.id] || 3;

        if (autoVal === managerVal) {
          matchingSkills++;
        }

        totalBiasSum += (managerVal - autoVal);
        biasCount++;
      });
    });

    const coincidenceRate = totalSkillsEvaluated > 0 
      ? Math.round((matchingSkills / totalSkillsEvaluated) * 100) 
      : 0;

    const avgBias = biasCount > 0 
      ? parseFloat((totalBiasSum / biasCount).toFixed(2)) 
      : 0;

    return {
      colabs: totalColabs,
      skills: totalSkillsEvaluated,
      coincidence: coincidenceRate,
      bias: avgBias
    };
  }, [filteredEmployees, calibratedUsersData]);

  // =========================================================================
  // 2. MIGRACIÓN Y CÁLCULO DE GRÁFICOS - SUBTAB 1: EVALUADOS
  // =========================================================================
  
  // A. Distribución normalizada respecto al requerimiento
  const distributionData = useMemo(() => {
    return filteredEmployees.map((emp, idx) => {
      const calibrationState = calibratedUsersData[emp.id] || {};
      const skills = emp.skills || [];
      
      let sumGap = 0;
      let count = 0;

      skills.forEach(s => {
        const reqScore = s.required || 3;
        const managerVal = calibrationState.ratings?.[s.id] || MANAGER_EVAL_MOCK[s.id] || 3;
        sumGap += (managerVal - reqScore);
        count++;
      });

      const avgGap = count > 0 ? parseFloat((sumGap / count).toFixed(2)) : 0;

      return {
        index: idx + 1,
        id: emp.id,
        name: emp.name,
        role: emp.role,
        gap: avgGap,
        avatar: emp.avatar,
        emp: emp
      };
    });
  }, [filteredEmployees, calibratedUsersData]);

  // B. Alineamiento de Calificación Individual (Auto vs Manager)
  const alignmentData = useMemo(() => {
    return filteredEmployees.map((emp, idx) => {
      const calibrationState = calibratedUsersData[emp.id] || {};
      const skills = emp.skills || [];

      let sumAuto = 0;
      let sumManager = 0;
      let count = 0;

      skills.forEach(s => {
        sumAuto += AUTO_EVAL_MOCK[s.id] || 3;
        sumManager += calibrationState.ratings?.[s.id] || MANAGER_EVAL_MOCK[s.id] || 3;
        count++;
      });

      const avgAuto = count > 0 ? parseFloat((sumAuto / count).toFixed(2)) : 0;
      const avgManager = count > 0 ? parseFloat((sumManager / count).toFixed(2)) : 0;

      return {
        index: idx + 1,
        id: emp.id,
        name: emp.name,
        avgAuto,
        avgManager,
        managerName: MANAGER_NAMES[emp.managerId] || `Mánager ${emp.managerId}`,
        emp: emp
      };
    });
  }, [filteredEmployees, calibratedUsersData]);

  // C. Tabla de colaboradores internos filtrados
  const tableFilteredColabs = useMemo(() => {
    const list = filteredEmployees.map(emp => {
      const calibrationState = calibratedUsersData[emp.id] || {};
      const skills = emp.skills || [];
      
      let matching = 0;
      let totalGaps = 0;
      let count = 0;

      skills.forEach(s => {
        const reqScore = s.required || 3;
        const autoVal = AUTO_EVAL_MOCK[s.id] || 3;
        const managerVal = calibrationState.ratings?.[s.id] || MANAGER_EVAL_MOCK[s.id] || 3;

        if (autoVal === managerVal) matching++;
        totalGaps += (managerVal - reqScore);
        count++;
      });

      const coincidencePct = count > 0 ? Math.round((matching / count) * 100) : 0;
      const avgGap = count > 0 ? parseFloat((totalGaps / count).toFixed(2)) : 0;

      return {
        ...emp,
        coincidencePct,
        avgGap
      };
    });

    if (!tableSearchQuery.trim()) return list;
    const query = tableSearchQuery.toLowerCase();
    return list.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.id.toString().includes(query) ||
      item.role.toLowerCase().includes(query)
    );
  }, [filteredEmployees, calibratedUsersData, tableSearchQuery]);

  // =========================================================================
  // 3. MIGRACIÓN Y CÁLCULO DE GRÁFICOS - SUBTAB 2: EVALUADORES
  // =========================================================================
  
  // A. Matriz 2D X-Y: Calificación Mánager (X) vs. Sesgo Mánager (Y)
  const managerMatrixData = useMemo(() => {
    const managerGroups = {};

    filteredEmployees.forEach(emp => {
      const mId = emp.managerId;
      if (!mId) return;

      const calibrationState = calibratedUsersData[emp.id] || {};
      const skills = emp.skills || [];

      if (!managerGroups[mId]) {
        managerGroups[mId] = {
          id: mId,
          name: MANAGER_NAMES[mId] || `Mánager ${mId}`,
          respSum: 0,
          autoSum: 0,
          count: 0
        };
      }

      skills.forEach(s => {
        const autoVal = AUTO_EVAL_MOCK[s.id] || 3;
        const managerVal = calibrationState.ratings?.[s.id] || MANAGER_EVAL_MOCK[s.id] || 3;

        managerGroups[mId].respSum += managerVal;
        managerGroups[mId].autoSum += autoVal;
        managerGroups[mId].count++;
      });
    });

    return Object.values(managerGroups).map(g => {
      const avgResp = g.count > 0 ? parseFloat((g.respSum / g.count).toFixed(2)) : 0;
      const avgAuto = g.count > 0 ? parseFloat((g.autoSum / g.count).toFixed(2)) : 0;
      const avgBias = parseFloat((avgResp - avgAuto).toFixed(2));

      return {
        id: g.id,
        name: g.name,
        avgResp,
        avgBias,
        count: g.count
      };
    });
  }, [filteredEmployees, calibratedUsersData]);

  // B. Distribución del grado de coincidencia por responsable
  const managerCoincidenceData = useMemo(() => {
    const managerGroups = {};

    filteredEmployees.forEach(emp => {
      const mId = emp.managerId;
      if (!mId) return;

      const calibrationState = calibratedUsersData[emp.id] || {};
      const skills = emp.skills || [];

      if (!managerGroups[mId]) {
        managerGroups[mId] = {
          id: mId,
          name: MANAGER_NAMES[mId] || `Mánager ${mId}`,
          coincide: 0,
          managerHigher: 0,
          autoHigher: 0,
          total: 0
        };
      }

      skills.forEach(s => {
        const autoVal = AUTO_EVAL_MOCK[s.id] || 3;
        const managerVal = calibrationState.ratings?.[s.id] || MANAGER_EVAL_MOCK[s.id] || 3;

        if (autoVal === managerVal) {
          managerGroups[mId].coincide++;
        } else if (managerVal > autoVal) {
          managerGroups[mId].managerHigher++;
        } else {
          managerGroups[mId].autoHigher++;
        }
        managerGroups[mId].total++;
      });
    });

    return Object.values(managerGroups).map(g => {
      const coincidePct = g.total > 0 ? Math.round((g.coincide / g.total) * 100) : 0;
      const managerHigherPct = g.total > 0 ? Math.round((g.managerHigher / g.total) * 100) : 0;
      const autoHigherPct = g.total > 0 ? Math.round((g.autoHigher / g.total) * 100) : 0;

      return {
        id: g.id,
        name: g.name,
        coincide: coincidePct,
        managerHigher: managerHigherPct,
        autoHigher: autoHigherPct
      };
    });
  }, [filteredEmployees, calibratedUsersData]);

  // C. Heatmap Responsable × Capacidad (Grid de React)
  const heatmapData = useMemo(() => {
    // 1. Extraer mánagers únicos
    const managers = Array.from(new Set(filteredEmployees.map(e => e.managerId).filter(Boolean)));
    
    // 2. Extraer habilidades únicas
    const skillsSet = new Set();
    filteredEmployees.forEach(e => {
      (e.skills || []).forEach(s => skillsSet.add(s.name));
    });
    const skillsList = Array.from(skillsSet);

    // 3. Cruzar datos
    const matrix = managers.map(mId => {
      const row = {
        managerId: mId,
        managerName: MANAGER_NAMES[mId] || `Mánager ${mId}`,
        scores: {}
      };

      skillsList.forEach(sName => {
        let sum = 0, count = 0;

        filteredEmployees.forEach(emp => {
          if (emp.managerId === mId) {
            const calibrationState = calibratedUsersData[emp.id] || {};
            const skillObj = (emp.skills || []).find(s => s.name === sName);
            if (skillObj) {
              const managerVal = calibrationState.ratings?.[skillObj.id] || MANAGER_EVAL_MOCK[skillObj.id] || 3;
              sum += managerVal;
              count++;
            }
          }
        });

        row.scores[sName] = count > 0 ? parseFloat((sum / count).toFixed(1)) : null;
      });

      return row;
    });

    return {
      managers: matrix,
      skills: skillsList
    };
  }, [filteredEmployees, calibratedUsersData]);

  // =========================================================================
  // 4. MIGRACIÓN Y CÁLCULO DE GRÁFICOS - SUBTAB 3: GAPS & COHORTE
  // =========================================================================
  
  // A. Radar de perfil competencial global de la cohorte
  const cohortRadarData = useMemo(() => {
    const skillsMap = {};

    filteredEmployees.forEach(emp => {
      const calibrationState = calibratedUsersData[emp.id] || {};
      const skills = emp.skills || [];

      skills.forEach(s => {
        if (!skillsMap[s.id]) {
          skillsMap[s.id] = {
            id: s.id,
            name: s.name,
            reqSum: 0,
            autoSum: 0,
            respSum: 0,
            count: 0
          };
        }

        skillsMap[s.id].reqSum += s.required || 3;
        skillsMap[s.id].autoSum += AUTO_EVAL_MOCK[s.id] || 3;
        skillsMap[s.id].respSum += calibrationState.ratings?.[s.id] || MANAGER_EVAL_MOCK[s.id] || 3;
        skillsMap[s.id].count++;
      });
    });

    return Object.values(skillsMap).map(s => ({
      name: s.name.length > 22 ? s.name.substring(0, 20) + '...' : s.name,
      Requerido: parseFloat((s.reqSum / s.count).toFixed(1)),
      Autoevaluación: parseFloat((s.autoSum / s.count).toFixed(1)),
      Mánager: parseFloat((s.respSum / s.count).toFixed(1))
    }));
  }, [filteredEmployees, calibratedUsersData]);

  // B. Ranking de Brechas por Competencia (Filtrado por Categoría)
  const skillsBreachRankingData = useMemo(() => {
    const skillsMap = {};

    filteredEmployees.forEach(emp => {
      const calibrationState = calibratedUsersData[emp.id] || {};
      const skills = emp.skills || [];

      skills.forEach(s => {
        // Filtrar por categoría real si corresponde
        if (selectedSkillCategory !== 'Todas' && s.category !== selectedSkillCategory) {
          return;
        }

        if (!skillsMap[s.id]) {
          skillsMap[s.id] = {
            id: s.id,
            name: s.name,
            reqSum: 0,
            respSum: 0,
            count: 0
          };
        }

        skillsMap[s.id].reqSum += s.required || 3;
        skillsMap[s.id].respSum += calibrationState.ratings?.[s.id] || MANAGER_EVAL_MOCK[s.id] || 3;
        skillsMap[s.id].count++;
      });
    });

    return Object.values(skillsMap)
      .map(s => {
        const avgReq = s.reqSum / s.count;
        const avgResp = s.respSum / s.count;
        const gap = parseFloat((avgResp - avgReq).toFixed(2));
        return {
          name: s.name.length > 25 ? s.name.substring(0, 23) + '...' : s.name,
          gap: gap
        };
      })
      .sort((a, b) => a.gap - b.gap); // Ordenar de mayor brecha negativa a exceso positivo
  }, [filteredEmployees, calibratedUsersData, selectedSkillCategory]);

  // C. Distribución de niveles por rol
  const roleLevelsData = useMemo(() => {
    const roleMap = {};

    filteredEmployees.forEach(emp => {
      const r = emp.role;
      const calibrationState = calibratedUsersData[emp.id] || {};
      const skills = emp.skills || [];

      if (!roleMap[r]) {
        roleMap[r] = {
          role: r,
          iniciado: 0,
          intermedio: 0,
          alto: 0,
          experto: 0
        };
      }

      skills.forEach(s => {
        const val = calibrationState.ratings?.[s.id] || MANAGER_EVAL_MOCK[s.id] || 3;
        if (val <= 1.4) roleMap[r].iniciado++;
        else if (val <= 2.4) roleMap[r].intermedio++;
        else if (val <= 3.4) roleMap[r].alto++;
        else roleMap[r].experto++;
      });
    });

    return Object.values(roleMap);
  }, [filteredEmployees, calibratedUsersData]);

  // --- LÓGICA DE APERTURA DEL DETALLE ---
  const handleOpenColabDetails = (emp) => {
    const calibrationState = calibratedUsersData[emp.id] || {};
    const skills = emp.skills || [];
    
    let matching = 0;
    let totalGaps = 0;
    let count = 0;

    const listSkillsMapped = skills.map(s => {
      const reqVal = s.required || 3;
      const autoVal = AUTO_EVAL_MOCK[s.id] || 3;
      const managerVal = calibrationState.ratings?.[s.id] || MANAGER_EVAL_MOCK[s.id] || 3;
      const gap = managerVal - reqVal;

      if (autoVal === managerVal) matching++;
      totalGaps += gap;
      count++;

      return {
        ...s,
        autoVal,
        managerVal,
        gap
      };
    });

    const coincidencePct = count > 0 ? Math.round((matching / count) * 100) : 0;
    const avgGap = count > 0 ? parseFloat((totalGaps / count).toFixed(2)) : 0;

    setSelectedColab({
      ...emp,
      coincidencePct,
      avgGap,
      skillsList: listSkillsMapped,
      managerName: MANAGER_NAMES[emp.managerId] || `Mánager ${emp.managerId}`
    });
  };

  // --- COMPONENTES AUXILIARES ---
  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md p-3 rounded-2xl border border-slate-750/30 text-white text-[11px] font-bold shadow-xl space-y-1">
          <p className="font-extrabold text-sm text-emerald-450">{data.name}</p>
          <p className="text-slate-300 font-semibold">{data.role}</p>
          <div className="border-t border-slate-800/80 my-1.5 pt-1.5 flex justify-between gap-6">
            <span className="text-slate-400">Expectación Gap:</span>
            <span className={clsx(
              "font-extrabold", 
              data.gap > 0 ? "text-emerald-400" : data.gap < 0 ? "text-rose-400" : "text-slate-300"
            )}>
              {data.gap > 0 ? `+${data.gap}` : data.gap} pts
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomAlignmentTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md p-3 rounded-2xl border border-slate-750/30 text-white text-[11px] font-bold shadow-xl space-y-1">
          <p className="font-extrabold text-sm text-purple-400">{data.name}</p>
          <p className="text-slate-400 text-[9.5px] font-semibold">{data.managerName}</p>
          <div className="border-t border-slate-800/80 my-1.5 pt-1.5 space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Media Autoevaluación:</span>
              <span className="text-emerald-400 font-extrabold">{data.avgAuto}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Media Mánager/Comité:</span>
              <span className="text-blue-450 font-extrabold">{data.avgManager}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-800/40 pt-1 mt-1">
              <span className="text-slate-400">Desviación (Sesgo):</span>
              <span className={clsx(
                "font-extrabold",
                (data.avgManager - data.avgAuto) > 0 ? "text-emerald-400" : (data.avgManager - data.avgAuto) < 0 ? "text-rose-400" : "text-slate-300"
              )}>
                {parseFloat((data.avgManager - data.avgAuto).toFixed(2))} pts
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomManagerMatrixTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md p-3 rounded-2xl border border-slate-750/30 text-white text-[11px] font-bold shadow-xl space-y-1">
          <p className="font-extrabold text-sm text-sky-400">{data.name}</p>
          <div className="border-t border-slate-800/80 my-1.5 pt-1.5 space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Nota Promedio Otorgada:</span>
              <span className="text-blue-450 font-extrabold">{data.avgResp}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Sesgo Medio (Manager - Auto):</span>
              <span className={clsx(
                "font-extrabold",
                data.avgBias > 0.15 ? "text-emerald-400" : data.avgBias < -0.15 ? "text-rose-400" : "text-slate-300"
              )}>
                {data.avgBias > 0 ? `+${data.avgBias}` : data.avgBias} pts
              </span>
            </div>
            <div className="text-[9px] text-slate-500 italic mt-1 leading-none text-right">
              En base a {data.count} valoraciones
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-750/30 text-white text-[11px] font-bold shadow-xl space-y-1.5 min-w-[170px]">
          <p className="font-extrabold text-xs text-sky-400 border-b border-slate-800/60 pb-1.5 uppercase tracking-wide">{label}</p>
          <div className="space-y-1 pt-0.5">
            {payload.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-350 font-semibold uppercase text-[9px] tracking-wider">{item.name}:</span>
                </div>
                <span className="font-extrabold text-xs" style={{ color: item.color }}>{item.value} skills</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBreachTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md p-3 rounded-2xl border border-slate-750/30 text-white text-[11px] font-bold shadow-xl space-y-1">
          <p className="font-extrabold text-xs text-purple-400">{data.name}</p>
          <div className="border-t border-slate-800/60 my-1.5 pt-1.5 flex justify-between gap-6">
            <span className="text-slate-400 font-semibold">Brecha Promedio:</span>
            <span className={clsx(
              "font-black text-xs",
              data.gap > 0 ? "text-emerald-450" : data.gap < 0 ? "text-rose-400" : "text-slate-300"
            )}>
              {data.gap > 0 ? `+${data.gap}` : data.gap} pts
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TARJETAS DE ESTADÍSTICAS / KPIS DEL DASHBOARD DE AUDITORÍA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Colaboradores Activos', value: stats.colabs, desc: 'En perímetro seleccionado', icon: Users, color: 'text-blue-600 bg-blue-50/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/15' },
          { label: 'Evaluaciones Procesadas', value: stats.skills, desc: 'Competencias × Colaborador', icon: Award, color: 'text-purple-600 bg-purple-50/60 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/15' },
          { label: 'Grado Coincidencia Exacta', value: `${stats.coincidence}%`, desc: 'Auto-evaluación vs Mánager', icon: Sparkles, color: 'text-[#007A33] bg-emerald-50/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/15' },
          { label: 'Sesgo General Evaluaciones', value: `${stats.bias > 0 ? '+' : ''}${stats.bias}`, desc: 'Desviación promedio (Mánager-Auto)', icon: Scale, color: clsx(
            'text-slate-650 bg-slate-100/60 dark:bg-slate-800/20 dark:text-slate-300 dark:border-slate-800/40',
            stats.bias > 0.15 && 'text-emerald-600 bg-emerald-50/50 dark:bg-emerald-500/10 dark:text-emerald-450 dark:border-emerald-500/15',
            stats.bias < -0.15 && 'text-rose-600 bg-rose-50/50 dark:bg-rose-500/10 dark:text-rose-450 dark:border-rose-500/15'
          )}
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white/80 dark:bg-slate-900/10 dark:backdrop-blur-md p-4.5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-3xs flex items-center gap-3.5">
              <div className={clsx("p-2.5 rounded-2xl shrink-0 border border-transparent", item.color)}>
                <Icon size={18} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none">{item.label}</p>
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1 leading-none">{item.value}</h4>
                <p className="text-[9px] text-slate-500 mt-1 leading-none">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. SUB-TABS INTERNAS DEL AUDIT DASHBOARD */}
      <div className="flex bg-slate-100/50 dark:bg-slate-900/45 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/45 w-fit">
        {[
          { id: 'evaluados', label: '🎯 Calibración Evaluados' },
          { id: 'evaluadores', label: '👤 Calibración de Evaluadores' },
          { id: 'gaps', label: '📊 Gap de Skills' }
        ].map(btn => (
          <button
            key={btn.id}
            onClick={() => setActiveSubTab(btn.id)}
            className={clsx(
              "px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer",
              activeSubTab === btn.id
                ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-2xs border border-slate-200/40 dark:border-slate-700/25"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* 3. CONTENIDOS DE LAS SUB-TABS */}
      
      {/* ========================================================================= */}
      {/* SUBTAB 1: CALIBRACIÓN EVALUADOS */}
      {/* ========================================================================= */}
      {activeSubTab === 'evaluados' && (
        <div className="space-y-6">
          {filteredEmployees.length === 0 ? (
            <div className="p-14 bg-white/70 dark:bg-slate-900/10 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/40 text-center space-y-2">
              <AlertCircle className="mx-auto text-slate-400" size={32} />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No hay colaboradores en el perímetro actual.</p>
              <p className="text-[9.5px] text-slate-400">Ajusta los filtros superiores para cargar el censo.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* A. Distribución normalizada respecto al requerimiento */}
                <div className="bg-white/80 dark:bg-slate-900/10 dark:backdrop-blur-md p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-xs flex flex-col justify-between">
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Distribución de Evaluaciones (Normalizado)</h4>
                      <div className="group relative">
                        <HelpCircle size={14} className="text-slate-400 cursor-pointer hover:text-slate-650" />
                        <span className="hidden group-hover:block absolute right-0 bottom-full bg-slate-950 text-white text-[8px] rounded p-2 w-48 mb-1 leading-normal z-30 shadow-md">
                          Cada punto representa a un colaborador en relación con su nivel requerido medio. 
                          Valores &gt; 0 indican superación del perfil; &lt; 0 indican brecha de conocimiento.
                        </span>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-450">Desviación promedio de la calificación de cada colaborador frente a la expectativa media de su nivel (0 = expectativa cumplida).</p>
                  </div>

                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: -25 }}>
                        <XAxis type="number" dataKey="index" name="Colaborador" domain={[0, distributionData.length + 1]} tick={false} stroke="var(--border-card)" />
                        <YAxis type="number" dataKey="gap" name="Expectación Gap" domain={[-2.5, 2.5]} ticks={[-2, -1, 0, 1, 2]} stroke="var(--border-card)" tick={{ fill: 'currentColor' }} className="text-slate-500 dark:text-slate-400 font-semibold text-[9px]" />
                        <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter data={distributionData} onClick={(node) => handleOpenColabDetails(node.emp)}>
                          {distributionData.map((entry, index) => {
                            const isPositive = entry.gap >= 0;
                            return (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={isPositive ? 'var(--color-primary)' : 'url(#coralGradient)'} 
                                className="cursor-pointer hover:scale-120 transition-all stroke-white/20 dark:stroke-slate-950/20 stroke-1"
                                r={7}
                              />
                            );
                          })}
                        </Scatter>
                        {/* Definir gradiente para brechas negativas */}
                        <defs>
                          <linearGradient id="coralGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" />
                            <stop offset="100%" stopColor="#e11d48" />
                          </linearGradient>
                        </defs>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* B. Alineamiento de Calificación Individual */}
                <div className="bg-white/80 dark:bg-slate-900/10 dark:backdrop-blur-md p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-xs flex flex-col justify-between">
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Alineamiento de Calificación Individual</h4>
                      <div className="group relative">
                        <HelpCircle size={14} className="text-slate-400 cursor-pointer hover:text-slate-650" />
                        <span className="hidden group-hover:block absolute right-0 bottom-full bg-slate-950 text-white text-[8px] rounded p-2 w-48 mb-1 leading-normal z-30 shadow-md">
                          Muestra el contraste directo del promedio de Autoevaluación frente al promedio del Mánager para cada colaborador del perímetro.
                        </span>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-450">Autoevaluación (media verde) vs. Revisión del Responsable / Comité (media azul) de forma contrastada por colaborador.</p>
                  </div>

                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: -25 }}>
                        <XAxis type="number" dataKey="index" domain={[0, alignmentData.length + 1]} tick={false} stroke="var(--border-card)" />
                        <YAxis type="number" dataKey="avgManager" domain={[1, 4]} ticks={[1, 2, 3, 4]} stroke="var(--border-card)" tick={{ fill: 'currentColor' }} className="text-slate-500 dark:text-slate-400 font-semibold text-[9px]" />
                        <Tooltip content={<CustomAlignmentTooltip />} />
                        
                        {/* Auto-evaluación */}
                        <Scatter data={alignmentData} dataKey="avgAuto" fill="#10b981" r={5} shape="circle" />
                        
                        {/* Manager */}
                        <Scatter data={alignmentData} dataKey="avgManager" fill="#2563eb" r={6} shape="circle" onClick={(node) => handleOpenColabDetails(node.emp)} className="cursor-pointer" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex items-center gap-4.5 justify-center text-[9px] font-black text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-100/50 dark:border-slate-800/40">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                      <span>Autoevaluación</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block"></span>
                      <span>Mánager / Comité</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* C. Tabla de colaboradores de la cohorte */}
              <div className="bg-white/80 dark:bg-slate-900/10 dark:backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-xs flex flex-col overflow-hidden">
                <div className="p-5 border-b border-slate-150/40 dark:border-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                    <span>Colaboradores en Cohorte Activa</span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-slate-200/20">
                      {tableFilteredColabs.length}
                    </span>
                  </h4>
                  <div className="w-full sm:w-64">
                    <input 
                      type="text" 
                      placeholder="Filtrar por ID, Nombre o Rol..." 
                      value={tableSearchQuery}
                      onChange={(e) => setTableSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/25 border border-slate-200/60 dark:border-slate-800/50 text-xs font-bold text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:border-[#007A33] transition-colors"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-950/25 border-b border-slate-150/40 dark:border-slate-800/40 text-[9px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                        <th className="p-3.5 pl-6">ID / Colaborador</th>
                        <th className="p-3.5">Rol Profesional</th>
                        <th className="p-3.5">Unidad</th>
                        <th className="p-3.5 text-center">Coincidencia</th>
                        <th className="p-3.5 text-center">Brecha Media</th>
                        <th className="p-3.5 text-center w-24">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {tableFilteredColabs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-450 italic">No hay registros que coincidan con la búsqueda.</td>
                        </tr>
                      ) : (
                        tableFilteredColabs.map(emp => (
                          <tr key={emp.id} className="border-b border-slate-100/50 dark:border-slate-800/40 hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                            <td className="p-3.5 pl-6">
                              <div className="flex items-center gap-3">
                                <img src={emp.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200/60 dark:border-slate-700/50" />
                                <div>
                                  <span className="font-extrabold text-slate-800 dark:text-slate-200 block">{emp.name}</span>
                                  <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wide leading-none">{emp.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 text-slate-650 dark:text-slate-350 font-bold">{emp.role}</td>
                            <td className="p-3.5 text-slate-600 dark:text-slate-400">{emp.unitName}</td>
                            <td className="p-3.5 text-center">
                              <span className={clsx(
                                "text-[9px] font-black px-2 py-0.5 rounded-full border",
                                emp.coincidencePct >= 70 ? "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/15" :
                                emp.coincidencePct >= 40 ? "bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/15" :
                                "bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/15"
                              )}>
                                {emp.coincidencePct}%
                              </span>
                            </td>
                            <td className="p-3.5 text-center">
                              <span className={clsx(
                                "font-extrabold",
                                emp.avgGap > 0 ? "text-emerald-600 dark:text-emerald-400" : 
                                emp.avgGap < 0 ? "text-rose-600 dark:text-rose-450" : 
                                "text-slate-500 dark:text-slate-400"
                              )}>
                                {emp.avgGap > 0 ? `+${emp.avgGap}` : emp.avgGap} pts
                              </span>
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => handleOpenColabDetails(emp)}
                                className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#007A33] dark:hover:border-emerald-500 text-slate-500 dark:text-slate-400 hover:text-[#007A33] dark:hover:text-emerald-400 rounded-xl transition-all cursor-pointer shadow-3xs"
                                title="Ver ficha detallada"
                              >
                                <Eye size={12} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: CALIBRACIÓN DE EVALUADORES */}
      {/* ========================================================================= */}
      {activeSubTab === 'evaluadores' && (
        <div className="space-y-6">
          {managerMatrixData.length === 0 ? (
            <div className="p-14 bg-white/70 dark:bg-slate-900/10 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/40 text-center space-y-2">
              <AlertCircle className="mx-auto text-slate-400" size={32} />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No hay datos suficientes de mánagers.</p>
            </div>
          ) : (
            <>
              {/* Fila superior de gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* A. Matriz de Calibración de Evaluadores */}
                <div className="bg-white/80 dark:bg-slate-900/10 dark:backdrop-blur-md p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-xs flex flex-col justify-between">
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Matriz de Calibración (Alineamiento vs Sesgo)</h4>
                      <div className="group relative">
                        <HelpCircle size={14} className="text-slate-400 cursor-pointer hover:text-slate-650" />
                        <span className="hidden group-hover:block absolute right-0 bottom-full bg-slate-950 text-white text-[8px] rounded p-2 w-48 mb-1 leading-normal z-30 shadow-md">
                          Cada punto representa a un Manager. El eje X muestra el promedio absoluto de sus calificaciones y el eje Y muestra su desviación (sesgo) promedio frente a la autoevaluación de sus colaboradores. Permite identificar rigidez o benevolencia de un vistazo.
                        </span>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-450">Puntuación promedio del Manager (X) vs. Sesgo promedio Manager-Colaborador (Y).</p>
                  </div>

                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: -25 }}>
                        <XAxis type="number" dataKey="avgResp" domain={[1.5, 4]} ticks={[2, 3, 4]} stroke="var(--border-card)" tick={{ fill: 'currentColor' }} className="text-slate-550 dark:text-slate-450 font-bold text-[9px]" />
                        <YAxis type="number" dataKey="avgBias" domain={[-1.5, 1.5]} ticks={[-1, -0.5, 0, 0.5, 1]} stroke="var(--border-card)" tick={{ fill: 'currentColor' }} className="text-slate-550 dark:text-slate-450 font-bold text-[9px]" />
                        <Tooltip content={<CustomManagerMatrixTooltip />} />
                        <Scatter data={managerMatrixData} fill="#8b5cf6" r={8} className="stroke-white/20 dark:stroke-slate-950/20 stroke-1" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* B. Coincidencia por evaluador */}
                <div className="bg-white/80 dark:bg-slate-900/10 dark:backdrop-blur-md p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-xs flex flex-col justify-between">
                  <div className="space-y-1 mb-4">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Distribución del Grado de Coincidencia</h4>
                    <p className="text-[9px] text-slate-450">Porcentaje de evaluaciones por manager que coinciden exactamente con la autoevaluación, son más altas o más bajas.</p>
                  </div>

                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={managerCoincidenceData} margin={{ top: 10, right: 10, bottom: 10, left: -30 }}>
                        <XAxis dataKey="name" stroke="var(--border-card)" tick={{ fill: 'currentColor' }} className="text-slate-650 dark:text-slate-300 font-bold text-[8.5px]" />
                        <YAxis stroke="var(--border-card)" tick={{ fill: 'currentColor' }} className="text-slate-500 dark:text-slate-400 text-[9px]" unit="%" />
                        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                        
                        <Bar dataKey="autoHigher" name="Auto Mayor" stackId="a" fill="#f43f5e" />
                        <Bar dataKey="coincide" name="Coinciden" stackId="a" fill="#10b981" />
                        <Bar dataKey="managerHigher" name="Mánager Mayor" stackId="a" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* C. Mapa de Calor Responsable × Capacidad (Grid de React) */}
              <div className="bg-white/80 dark:bg-slate-900/10 dark:backdrop-blur-md p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-xs">
                <div className="space-y-1 mb-5">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Mapa de Calor: Responsable × Capacidad (Evaluación Manager)</h4>
                  <p className="text-[9px] text-slate-450">Nivel medio otorgado por cada Responsable en cada competencia de su equipo. Colores más intensos representan notas más elevadas.</p>
                </div>

                {heatmapData.skills.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 italic p-6 text-center">Sin datos competenciales para construir el mapa.</p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-950/25 border-b border-slate-150/40 dark:border-slate-800/40 text-[8px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                          <th className="p-3 w-40 min-w-40 border-r border-slate-150/40 dark:border-slate-800/40">Responsable</th>
                          {heatmapData.skills.map((sName, idx) => (
                            <th key={idx} className="p-3 text-center min-w-24 text-[7.5px]" title={sName}>
                              {sName.length > 15 ? sName.substring(0, 13) + '...' : sName}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {heatmapData.managers.map((mgr, mIdx) => (
                          <tr key={mIdx} className="border-b border-slate-100/50 dark:border-slate-800/40 hover:bg-slate-50/10 dark:hover:bg-slate-850/5">
                            <td className="p-3 font-extrabold text-slate-800 dark:text-slate-200 border-r border-slate-150/40 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-950/10">
                              {mgr.managerName}
                            </td>
                            {heatmapData.skills.map((sName, sIdx) => {
                              const score = mgr.scores[sName];
                              let cellBg = "bg-slate-100/10 dark:bg-slate-900/10";
                              let cellText = "text-slate-400 dark:text-slate-650";

                              if (score !== null) {
                                if (score < 2) {
                                  cellBg = "bg-rose-500/10 border border-rose-500/10";
                                  cellText = "text-rose-600 dark:text-rose-400 font-extrabold";
                                } else if (score < 3) {
                                  cellBg = "bg-amber-500/15 border border-amber-500/10";
                                  cellText = "text-amber-600 dark:text-amber-400 font-extrabold";
                                } else if (score < 3.8) {
                                  cellBg = "bg-blue-500/15 border border-blue-500/10";
                                  cellText = "text-blue-600 dark:text-blue-400 font-extrabold";
                                } else {
                                  cellBg = "bg-emerald-500/20 border border-emerald-500/15";
                                  cellText = "text-emerald-600 dark:text-emerald-450 font-black";
                                }
                              }

                              return (
                                <td key={sIdx} className={clsx("p-3 text-center transition-all", cellBg, cellText)} title={`${mgr.managerName} - ${sName}: ${score || 'Sin datos'}`}>
                                  {score !== null ? score : '-'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: GAP DE SKILLS */}
      {/* ========================================================================= */}
      {activeSubTab === 'gaps' && (
        <div className="space-y-6">
          {cohortRadarData.length === 0 ? (
            <div className="p-14 bg-white/70 dark:bg-slate-900/10 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/40 text-center space-y-2">
              <AlertCircle className="mx-auto text-slate-400" size={32} />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Sin datos competenciales suficientes.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* A. Radar de Perfil Competencial Global */}
                <div className="bg-white/80 dark:bg-slate-900/10 dark:backdrop-blur-md p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-xs flex flex-col justify-between">
                  <div className="space-y-1 mb-4">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Radar Competencial Global de la Cohorte</h4>
                    <p className="text-[9px] text-slate-450">Comparación de la media del nivel Requerido frente a la Autoevaluación y la calificación del Mánager.</p>
                  </div>

                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="45%" outerRadius="68%" data={cohortRadarData}>
                        <PolarGrid stroke="var(--border-card)" />
                        <PolarAngleAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'currentColor' }} className="text-slate-700 dark:text-slate-200 font-bold text-[8.5px]" />
                        <PolarRadiusAxis angle={30} domain={[1, 4]} stroke="var(--border-card)" tick={{ fill: 'currentColor' }} className="text-slate-500 dark:text-slate-400 font-semibold text-[8px]" />
                        
                        <Radar name="Requerido" dataKey="Requerido" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.08} />
                        <Radar name="Autoevaluación" dataKey="Autoevaluación" stroke="#10b981" fill="#10b981" fillOpacity={0.12} />
                        <Radar name="Mánager / Comité" dataKey="Mánager" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} />
                        
                        <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* B. Ranking de Brechas por Competencia */}
                <div className="bg-white/80 dark:bg-slate-900/10 dark:backdrop-blur-md p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-xs flex flex-col justify-between">
                  <div className="space-y-1.5 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Ranking de Brechas Competenciales</h4>
                      
                      {/* Selectores de categorías reales */}
                      <div className="flex flex-wrap gap-1 bg-slate-50 dark:bg-slate-950/20 p-0.5 rounded-xl border border-slate-250/20 dark:border-slate-800/30">
                        {['Todas', 'Técnica', 'Soft Skill', 'Metodología'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedSkillCategory(cat)}
                            className={clsx(
                              "px-2 py-1 rounded-lg text-[8.5px] font-black transition-all cursor-pointer",
                              selectedSkillCategory === cat
                                ? "bg-white dark:bg-slate-800 text-[#007A33] dark:text-emerald-400 shadow-3xs"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                          >
                            {cat === 'Todas' ? 'Todas' : cat.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-450">Brecha promedio (Evaluación Mánager/Comité − Requerido). Valores &lt; 0 indican déficit de desarrollo.</p>
                  </div>

                  <div className="h-64 w-full">
                    {skillsBreachRankingData.length === 0 ? (
                      <p className="text-xs font-bold text-slate-450 italic p-10 text-center">No hay competencias en esta categoría para el censo filtrado.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={skillsBreachRankingData} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
                          <XAxis type="number" domain={[-1.5, 1.5]} ticks={[-1, -0.5, 0, 0.5, 1]} stroke="var(--border-card)" tick={{ fill: 'currentColor' }} className="text-slate-500 dark:text-slate-400 font-semibold text-[9px]" />
                          <YAxis type="category" dataKey="name" stroke="var(--border-card)" tick={{ fill: 'currentColor' }} className="text-slate-800 dark:text-slate-200 font-bold text-[9px]" width={120} />
                          <Tooltip content={<CustomBreachTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                          
                          <Bar dataKey="gap" name="Brecha Competencial">
                            {skillsBreachRankingData.map((entry, index) => {
                              const isNegative = entry.gap < 0;
                              return <Cell key={`cell-${index}`} fill={isNegative ? '#f43f5e' : '#10b981'} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>

              {/* C. Distribución de niveles por rol */}
              <div className="bg-white/80 dark:bg-slate-900/10 dark:backdrop-blur-md p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-xs flex flex-col justify-between">
                <div className="space-y-1 mb-4">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Distribución de Niveles por Rol Profesional</h4>
                  <p className="text-[9px] text-slate-450">Recuento del número de habilidades en cada nivel (Iniciado, Intermedio, Alto, Experto) evaluadas en cada puesto.</p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roleLevelsData} margin={{ top: 10, right: 10, bottom: 10, left: -30 }} barSize={36}>
                      <XAxis dataKey="role" stroke="var(--border-card)" tick={{ fill: 'currentColor' }} className="text-slate-650 dark:text-slate-300 font-bold text-[8.5px]" />
                      <YAxis stroke="var(--border-card)" tick={{ fill: 'currentColor' }} className="text-slate-500 dark:text-slate-400 text-[9px]" />
                      <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                      
                      <Bar dataKey="iniciado" name="Iniciado" stackId="a" fill="#e2e8f0" />
                      <Bar dataKey="intermedio" name="Intermedio" stackId="a" fill="#93c5fd" />
                      <Bar dataKey="alto" name="Alto" stackId="a" fill="#a78bfa" />
                      <Bar dataKey="experto" name="Experto" stackId="a" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL DETALLE DE FICHA INDIVIDUAL (SIDE DRAW DRAWER) */}
      {/* ========================================================================= */}
      {selectedColab && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0c101d] rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800/40 shadow-2xl overflow-hidden animate-in zoom-in-98 duration-300">
            {/* Cabecera Modal */}
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-850">
              <div className="flex items-center gap-3">
                <img src={selectedColab.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow-sm" />
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-white">
                    Ficha de Calibración: {selectedColab.name}
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                      {selectedColab.id}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold leading-none mt-1">{selectedColab.role} · {selectedColab.unitName}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedColab(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo Modal */}
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              
              {/* Tarjetas de Estadísticas Internas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Manager Directo</span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1 block">{selectedColab.managerName}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Coincidencia de Puntuación</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{selectedColab.coincidencePct}%</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Brecha Promedio General</span>
                  <span className={clsx(
                    "text-xs font-black mt-1 block",
                    selectedColab.avgGap > 0 ? "text-emerald-600 dark:text-emerald-400" :
                    selectedColab.avgGap < 0 ? "text-rose-600 dark:text-rose-450" : "text-slate-500 dark:text-slate-400"
                  )}>
                    {selectedColab.avgGap > 0 ? `+${selectedColab.avgGap}` : selectedColab.avgGap} pts
                  </span>
                </div>
              </div>

              {/* Contenido Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Izquierda: Radar Chart del Colaborador */}
                <div className="lg:col-span-5 bg-slate-50/50 dark:bg-slate-900/5 p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/45 flex flex-col justify-between h-72">
                  <h5 className="text-[9.5px] font-black text-slate-500 uppercase tracking-widest pl-1.5 border-l-2 border-purple-500">Perfil de Competencias Individual</h5>
                  
                  <div className="h-60 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={selectedColab.skillsList.map(s => ({
                        name: s.name.length > 15 ? s.name.substring(0, 13) + '...' : s.name,
                        Requerido: s.required,
                        Auto: s.autoVal,
                        Manager: s.managerVal
                      }))}>
                        <PolarGrid stroke="var(--border-card)" />
                        <PolarAngleAxis dataKey="name" stroke="var(--text-secondary)" style={{ fontSize: '7.5px', fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[1, 4]} stroke="var(--border-card)" style={{ fontSize: '7.5px' }} />
                        
                        <Radar name="Requerido" dataKey="Requerido" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.06} />
                        <Radar name="Auto" dataKey="Auto" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                        <Radar name="Mánager" dataKey="Manager" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Derecha: Tabla detallada de habilidades y brechas */}
                <div className="lg:col-span-7 bg-white dark:bg-transparent rounded-2xl border border-slate-200/60 dark:border-slate-800/45 overflow-hidden">
                  <div className="max-h-72 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950/25 border-b border-slate-150/40 dark:border-slate-800/40 text-[8px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                          <th className="p-3 pl-4">Habilidad</th>
                          <th className="p-3 text-center">Requerido</th>
                          <th className="p-3 text-center">Auto</th>
                          <th className="p-3 text-center">Mánager</th>
                          <th className="p-3 text-center">Brecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedColab.skillsList.map(skill => (
                          <tr key={skill.id} className="border-b border-slate-100/50 dark:border-slate-800/40 hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                            <td className="p-3 pl-4">
                              <span className="font-extrabold text-slate-800 dark:text-slate-200 block">{skill.name}</span>
                              <span className="text-[7.5px] text-slate-400 font-extrabold uppercase tracking-wide leading-none">{skill.category}</span>
                            </td>
                            <td className="p-3 text-center text-slate-500 font-bold">{skill.required}</td>
                            <td className="p-3 text-center text-emerald-600 dark:text-emerald-450 font-semibold">{skill.autoVal}</td>
                            <td className="p-3 text-center text-blue-600 dark:text-blue-400 font-semibold">{skill.managerVal}</td>
                            <td className="p-3 text-center">
                              <span className={clsx(
                                "font-extrabold px-1.5 py-0.5 rounded-md text-[10px]",
                                skill.gap > 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                                skill.gap < 0 ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" :
                                "bg-slate-50 text-slate-500 dark:bg-slate-850 dark:text-slate-400"
                              )}>
                                {skill.gap > 0 ? `+${skill.gap}` : skill.gap}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border-t border-slate-100/50 dark:border-slate-800/45 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedColab(null)}
                className="px-5 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cerrar Ficha
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetEmp = selectedColab;
                  setSelectedColab(null);
                  handleOpenCalibration(targetEmp);
                }}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Scale size={14} /> Editar Calibración
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
