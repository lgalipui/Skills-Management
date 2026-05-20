import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockCourses, mockOpportunities, mockSkills } from '../data/mockData';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  GraduationCap, 
  Award, 
  ArrowUpRight, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  Briefcase,
  HelpCircle,
  Plus,
  X
} from 'lucide-react';

export const HrDashboard = () => {
  const { users = [], orgUnits = [], badgesCatalog = [] } = useAuth() || {};
  
  // Estados para filtros
  const [selectedOrgUnitId, setSelectedOrgUnitId] = useState('all');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('Todas');
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState('all');
  const [activeHeatmapCell, setActiveHeatmapCell] = useState(null); // { unitId, skillName }

  const isBadgeInWindow = (badgeDate, horizon) => {
    if (!badgeDate) return false;
    const refDate = '2026-05-20'; // Fecha de referencia del mock
    if (horizon === 'all') return true;
    if (horizon === 'MTD') return badgeDate >= '2026-05-01' && badgeDate <= refDate;
    if (horizon === 'QTD') return badgeDate >= '2026-04-01' && badgeDate <= refDate;
    if (horizon === 'YTD') return badgeDate >= '2026-01-01' && badgeDate <= refDate;
    if (horizon === 'T12M') return badgeDate >= '2025-05-20' && badgeDate <= refDate;
    return true;
  };

  // Nombres dinámicos de unidades organizativas
  const selectedUnitName = useMemo(() => {
    if (selectedOrgUnitId === 'all') return 'Toda la Organización';
    return (orgUnits || []).find(u => u && u.id === selectedOrgUnitId)?.name || 'Unidad Seleccionada';
  }, [selectedOrgUnitId, orgUnits]);

  const activeUnitName = useMemo(() => {
    if (!activeHeatmapCell) return '';
    return (orgUnits || []).find(o => o && o.id === activeHeatmapCell.unitId)?.name || 'Unidad';
  }, [activeHeatmapCell, orgUnits]);

  // 1. Helper recursivo para obtener todas las subunidades descendientes de una unidad (para consolidar métricas)
  const getDescendantOrgUnitIds = useMemo(() => {
    const getChildren = (id) => {
      const units = orgUnits || [];
      const children = units.filter(u => u && u.parentId === id);
      let ids = [id];
      children.forEach(child => {
        if (child && child.id) {
          ids = [...ids, ...getChildren(child.id)];
        }
      });
      return ids;
    };
    
    return (id) => {
      const units = orgUnits || [];
      if (id === 'all') return units.map(u => u && u.id).filter(Boolean);
      return getChildren(id);
    };
  }, [orgUnits]);

  // 2. Filtrar usuarios según la unidad organizativa seleccionada (consolidando hijos recursivamente)
  const filteredUsers = useMemo(() => {
    const safeUsers = users || [];
    if (selectedOrgUnitId === 'all') return safeUsers;
    const allowedIds = getDescendantOrgUnitIds(selectedOrgUnitId) || [];
    return safeUsers.filter(u => u && allowedIds.includes(u.orgUnitId));
  }, [users, selectedOrgUnitId, getDescendantOrgUnitIds]);

  // 3. Obtener lista de subunidades de primer nivel de la selección para el desglose de la matriz
  const childUnitsForMatrix = useMemo(() => {
    const units = orgUnits || [];
    if (selectedOrgUnitId === 'all') {
      // Si está todo seleccionado, mostramos las Direcciones Generales y Divisiones Principales
      return units.filter(u => u && (u.parentId === null || u.type === 'Dirección de División'));
    }
    // Mostramos la unidad seleccionada y todas sus subunidades de primer nivel
    return units.filter(u => u && (u.id === selectedOrgUnitId || u.parentId === selectedOrgUnitId));
  }, [orgUnits, selectedOrgUnitId]);

  // 4. Competencias clave seleccionadas para la analítica del Heatmap (se pueden personalizar dinámicamente)
  const [coreSkills, setCoreSkills] = useState(['React', 'Node.js', 'Agile', 'SQL', 'Liderazgo', 'Comunicación', 'Gestión de Talento', 'Arquitectura Cloud']);
  const [searchSkillQuery, setSearchSkillQuery] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  // 5. CÁLCULO DE METRICAS GLOBALES (Reactivo a la unidad seleccionada y al periodo)
  const metrics = useMemo(() => {
    const safeFilteredUsers = filteredUsers || [];
    if (safeFilteredUsers.length === 0) {
      return { 
        coverageIndex: 0, 
        totalGaps: 0, 
        totalHours: 0, 
        mobilityRate: 0,
        totalEmployees: 0,
        totalRoles: 0,
        totalSkills: 0,
        improvedSkillsRate: 0,
        requestedVacancies: 0,
        avgSkillsPerRole: 0,
        avgCoursesPerEmployee: 0,
        skillReviewPercent: 0
      };
    }

    let totalRequiredSkills = 0;
    let metRequiredSkills = 0;
    let totalGaps = 0;
    let improvedSkillsCount = 0;

    safeFilteredUsers.forEach(user => {
      if (!user || !user.skills) return;
      user.skills.forEach(skill => {
        if (!skill) return;
        // Filtramos por categoría si procede
        if (selectedSkillCategory !== 'Todas' && skill.category !== selectedSkillCategory) return;

        totalRequiredSkills++;
        const skillLevel = Number(skill.level) || 0;
        const skillRequired = Number(skill.required) || 0;
        if (skillLevel >= skillRequired) {
          metRequiredSkills++;
        } else {
          totalGaps += (skillRequired - skillLevel);
        }

        // Una skill se cuenta como mejorada si supera el requerido y (si hay filtro temporal) se certificó en ese periodo
        let isImproved = skillLevel > skillRequired;
        if (selectedTimeHorizon !== 'all') {
          const hasBadgeInWindow = (user.badges || []).some(b => 
            b.status === 'Obtenido' && 
            isBadgeInWindow(b.date, selectedTimeHorizon) &&
            (badgesCatalog.find(cat => cat.id === b.badgeId)?.skillsValidated || []).includes(skill.name)
          );
          isImproved = isImproved && hasBadgeInWindow;
        }

        if (isImproved) {
          improvedSkillsCount++;
        }
      });
    });

    const coverageIndex = totalRequiredSkills > 0 
      ? Math.round((metRequiredSkills / totalRequiredSkills) * 100) 
      : 100;

    const improvedSkillsRate = totalRequiredSkills > 0
      ? Math.round((improvedSkillsCount / totalRequiredSkills) * 100)
      : 0;

    // Horas de formación calculadas dinámicamente según badges y cursos aprobados en el pool de usuarios en el periodo
    const totalHours = safeFilteredUsers.reduce((acc, user) => {
      const userBadges = user?.badges || [];
      const badgesCount = userBadges.filter(b => b && b.status === 'Obtenido' && isBadgeInWindow(b.date, selectedTimeHorizon)).length;
      return acc + (badgesCount * 12) + (selectedTimeHorizon === 'all' ? 6 : 0); // Simulación: 12 horas por insignia
    }, 0);

    // Tasa de movilidad: Porcentaje de vacantes con candidatos internos de alto matching (>75%)
    const safeOpportunities = mockOpportunities || [];
    const highMatches = safeOpportunities.filter(opp => {
      if (!opp) return false;
      const candidates = safeFilteredUsers.filter(u => u && u.profile !== 'RRHH');
      return candidates.some(c => {
        let matchCount = 0;
        const reqSkills = opp.requiredSkills || [];
        reqSkills.forEach(req => {
          if (!req) return;
          const userSkill = c.skills?.find(s => s && s.name === req.name);
          const userLevel = userSkill ? (Number(userSkill.level) || 0) : 0;
          const reqLevel = Number(req.level) || 0;
          if (userLevel >= reqLevel) matchCount++;
        });
        return reqSkills.length > 0 ? (matchCount / reqSkills.length) >= 0.75 : false;
      });
    }).length;

    const mobilityRate = safeOpportunities.length > 0
      ? Math.round((highMatches / safeOpportunities.length) * 100)
      : 0;

    const totalEmployees = safeFilteredUsers.length;
    const totalRoles = new Set(safeFilteredUsers.map(u => u.role).filter(Boolean)).size;
    const totalSkills = new Set(
      safeFilteredUsers.flatMap(u => u.skills || [])
        .filter(s => s && (selectedSkillCategory === 'Todas' || s.category === selectedSkillCategory))
        .map(s => s.name)
    ).size;

    // A. Número de vacantes solicitadas en el perímetro
    const activeOpportunities = mockOpportunities.filter(opp => {
      if (selectedOrgUnitId === 'all') return true;
      const oppDept = (opp.department || '').toLowerCase();
      const unitNameLower = selectedUnitName.toLowerCase();
      return unitNameLower.includes(oppDept) || oppDept.includes(unitNameLower);
    });
    const requestedVacancies = activeOpportunities.length > 0 
      ? activeOpportunities.length 
      : Math.max(1, Math.round(safeFilteredUsers.length * 0.1));

    // B. Habilidades medias por rol
    const activeRoles = Array.from(new Set(safeFilteredUsers.map(u => u.role).filter(Boolean)));
    let totalRequiredSkillsForRoles = 0;
    activeRoles.forEach(roleTitle => {
      const match = mockRoles.find(r => r && r.title === roleTitle);
      if (match && match.requiredSkills) {
        totalRequiredSkillsForRoles += match.requiredSkills.length;
      } else {
        totalRequiredSkillsForRoles += (roleTitle.length % 2 === 0 ? 3 : 4);
      }
    });
    const avgSkillsPerRole = activeRoles.length > 0
      ? parseFloat((totalRequiredSkillsForRoles / activeRoles.length).toFixed(1))
      : 3.5;

    // C. Número de cursos medios por empleado
    const totalBadgesAndCourses = safeFilteredUsers.reduce((sum, u) => {
      const badgesCount = (u.badges || []).length;
      const simulatedCourses = (u.id % 3) + 1; // 1, 2 o 3
      return sum + badgesCount + simulatedCourses;
    }, 0);
    const avgCoursesPerEmployee = safeFilteredUsers.length > 0
      ? parseFloat((totalBadgesAndCourses / safeFilteredUsers.length).toFixed(1))
      : 2.8;

    // D. % de empleados con Skill review
    const reviewedUsersCount = safeFilteredUsers.filter(u => {
      return (u.id % 2 === 0) || (u.badges && u.badges.length > 0);
    }).length;
    const skillReviewPercent = safeFilteredUsers.length > 0
      ? Math.round((reviewedUsersCount / safeFilteredUsers.length) * 100)
      : 75;

    return {
      coverageIndex,
      totalGaps,
      totalHours,
      mobilityRate,
      totalEmployees,
      totalRoles,
      totalSkills,
      improvedSkillsRate,
      requestedVacancies,
      avgSkillsPerRole,
      avgCoursesPerEmployee,
      skillReviewPercent
    };
  }, [filteredUsers, selectedSkillCategory, selectedTimeHorizon, selectedOrgUnitId, selectedUnitName, orgUnits]);

  // 6. CÓMPUTO DE LA MATRIZ DE CALOR (HEATMAP DATA)
  const heatmapData = useMemo(() => {
    const safeChildUnits = childUnitsForMatrix || [];
    const safeUsers = users || [];
    return safeChildUnits.map(unit => {
      if (!unit) return null;
      // Obtenemos todos los usuarios consolidados bajo esta subunidad
      const unitAllowedIds = getDescendantOrgUnitIds(unit.id) || [];
      const unitUsers = safeUsers.filter(u => u && unitAllowedIds.includes(u.orgUnitId));

      const skillsScores = {};
      coreSkills.forEach(skillName => {
        let totalLevel = 0;
        let count = 0;
        unitUsers.forEach(u => {
          if (!u) return;
          const s = u.skills?.find(sk => sk && sk.name === skillName);
          if (s) {
            totalLevel += Number(s.level) || 0;
            count++;
          }
        });
        skillsScores[skillName] = count > 0 ? parseFloat((totalLevel / count).toFixed(1)) : 0;
      });

      return {
        unitId: unit.id,
        unitName: unit.name,
        unitType: unit.type,
        employeeCount: unitUsers.length,
        scores: skillsScores
      };
    }).filter(Boolean);
  }, [childUnitsForMatrix, users, getDescendantOrgUnitIds]);

  // 7. CÓMPUTO DE LISTADO DE DETALLE PARA LA CELDA CLICADA
  const cellDetailList = useMemo(() => {
    if (!activeHeatmapCell) return null;
    const { unitId, skillName } = activeHeatmapCell;
    const allowedIds = getDescendantOrgUnitIds(unitId) || [];
    const safeUsers = users || [];
    const unitUsers = safeUsers.filter(u => u && allowedIds.includes(u.orgUnitId));

    return unitUsers.map(u => {
      if (!u) return null;
      const s = u.skills?.find(sk => sk && sk.name === skillName);
      return {
        id: u.id,
        name: u.name || '',
        role: u.role || '',
        avatar: u.avatar || '',
        currentLevel: s ? (Number(s.level) || 0) : 0,
        requiredLevel: s ? (Number(s.required) || 0) : 0
    }).filter(Boolean).sort((a, b) => b.currentLevel - a.currentLevel);
  }, [activeHeatmapCell, users, getDescendantOrgUnitIds]);

  // Helper para asignar color a la celda del Heatmap según su puntuación media
  const getHeatmapColor = (score) => {
    if (score === 0) return 'bg-slate-100/40 border-slate-200 text-slate-400';
    if (score < 2.0) return 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100';
    if (score < 3.5) return 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100';
    if (score < 4.5) return 'bg-emerald-50/70 border-emerald-200/60 text-[#007A33] hover:bg-emerald-100/70';
    return 'bg-[#007A33] border-[#005021] text-white hover:bg-[#006028]';
  };

  // 8. GRÁFICO COMPARATIVO DEMANDA VS OFERTA (PROMEDIOS GLOBALES)
  const skillsComparison = useMemo(() => {
    const safeFilteredUsers = filteredUsers || [];
    return coreSkills.map(skillName => {
      let totalCurrent = 0;
      let totalRequired = 0;
      let count = 0;

      safeFilteredUsers.forEach(u => {
        if (!u) return;
        const s = u.skills?.find(sk => sk && sk.name === skillName);
        if (s) {
          totalCurrent += Number(s.level) || 0;
          totalRequired += Number(s.required) || 0;
          count++;
        }
      });

      return {
        name: skillName,
        current: count > 0 ? parseFloat((totalCurrent / count).toFixed(1)) : 0,
        required: count > 0 ? parseFloat((totalRequired / count).toFixed(1)) : 0
      };
    });
  }, [filteredUsers]);

  // 9. INTELIGENCIA DE BRECHAS Y RECOMENDADOR DE CURSOS (SMART TRAINING)
  const trainingRecommendations = useMemo(() => {
    const gapsBySkill = {};
    const safeFilteredUsers = filteredUsers || [];
    safeFilteredUsers.forEach(u => {
      if (!u) return;
      u.skills?.forEach(s => {
        if (!s) return;
        const skillLevel = Number(s.level) || 0;
        const skillRequired = Number(s.required) || 0;
        if (skillLevel < skillRequired) {
          const diff = skillRequired - skillLevel;
          gapsBySkill[s.name] = (gapsBySkill[s.name] || 0) + diff;
        }
      });
    });

    const sortedGaps = Object.entries(gapsBySkill)
      .map(([name, gap]) => ({ name, gap }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 3);

    const safeCourses = mockCourses || [];
    return sortedGaps.map(item => {
      // Buscamos cursos en mockCourses que formen esta skill
      const matchingCourse = safeCourses.find(c => c && c.skills && c.skills.includes(item.name)) || {
        title: `Plan Formativo a Medida: Especialización en ${item.name}`,
        duration: '20h',
        cost: 0,
        targetLevel: 4
      };

      return {
        skillName: item.name,
        accumulatedGap: item.gap,
        courseTitle: matchingCourse.title,
        duration: matchingCourse.duration,
        cost: matchingCourse.cost,
        impactEstimate: Math.round(item.gap * 1.5 + 2) // Estimación de impacto en cobertura
      };
    });
  }, [filteredUsers]);

  // 10. TALENTO EN MOVILIDAD (RETENCIÓN E INTELIGENCIA INTERNA)
  const talentMobilityAlerts = useMemo(() => {
    const safeFilteredUsers = filteredUsers || [];
    const pool = safeFilteredUsers.filter(u => u && u.profile !== 'RRHH');
    const alerts = [];
    const safeOpportunities = mockOpportunities || [];

    pool.forEach(user => {
      if (!user) return;
      // 1. Detección de "Talento Oculto/Excedente": Empleados con habilidades significativamente por encima de lo requerido
      let surplusCount = 0;
      let topSkills = [];
      user.skills?.forEach(s => {
        if (!s) return;
        const skillLevel = Number(s.level) || 0;
        const skillRequired = Number(s.required) || 0;
        if (skillLevel >= 4 && (skillLevel - skillRequired) >= 1) {
          surplusCount++;
          topSkills.push(s.name);
        }
      });

      const userBadges = user.badges || [];
      const badgesCount = userBadges.filter(b => b && b.status === 'Obtenido').length;

      if (surplusCount >= 2 || badgesCount >= 2) {
        // Encontrar la mejor vacante abierta para este perfil
        let bestOpp = null;
        let maxMatch = 0;

        safeOpportunities.forEach(opp => {
          if (!opp) return;
          let matchPoints = 0;
          const reqSkills = opp.requiredSkills || [];
          reqSkills.forEach(req => {
            if (!req) return;
            const userSkill = user.skills?.find(s => s && s.name === req.name);
            if (userSkill) {
              const uLvl = Number(userSkill.level) || 0;
              const reqLvl = Number(req.level) || 0;
              // Si el nivel del usuario iguala o supera el de la vacante, sumamos
              if (uLvl >= reqLvl) matchPoints += 2.0;
              else if (uLvl >= reqLvl - 1) matchPoints += 1.0;
            }
          });
          const matchPercent = reqSkills.length > 0
            ? Math.round((matchPoints / (reqSkills.length * 2)) * 100)
            : 0;
          if (matchPercent > maxMatch) {
            maxMatch = matchPercent;
            bestOpp = opp;
          }
        });

        if (maxMatch >= 65 && bestOpp) {
          alerts.push({
            employee: user,
            badgesCount,
            topSkills: topSkills.slice(0, 2),
            bestOpportunity: bestOpp.title || 'Vacante Externa',
            matchingRate: maxMatch
          });
        }
      }
    });

    return alerts.slice(0, 3); // Top 3 alertas más relevantes
  }, [filteredUsers]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 text-slate-800 transition-all duration-300">
      
      {/* 1. CABECERA Y FILTROS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg text-[#007A33]">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Dashboard Dirección de Personas</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visión predictiva para <span className="font-bold text-[#007A33]">{selectedUnitName}</span> · Habilidades, brechas y movilidad inteligente
          </p>
        </div>
        
        {/* Selector de Unidad y Categorías */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Unidad:</span>
            <select
              value={selectedOrgUnitId}
              onChange={(e) => {
                setSelectedOrgUnitId(e.target.value);
                setActiveHeatmapCell(null); // Reset detail cell
              }}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#007A33]/20"
            >
              <option value="all">Toda la Organización</option>
              {(orgUnits || []).map(unit => {
                if (!unit || !unit.id) return null;
                return (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.type === 'Dirección General' ? 'DG' : unit.type === 'Subdirección General' ? 'SG' : unit.type === 'Dirección de División' ? 'DD' : unit.type === 'Dirección de Área' ? 'DA' : 'Oficina'})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Periodo:</span>
            <select
              value={selectedTimeHorizon}
              onChange={(e) => setSelectedTimeHorizon(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#007A33]/20"
            >
              <option value="all">Todo el Histórico</option>
              <option value="MTD">MTD (Mes en curso)</option>
              <option value="QTD">QTD (Trimestre en curso)</option>
              <option value="YTD">YTD (Año en curso)</option>
              <option value="T12M">T12M (Últimos 12 meses)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {['Todas', 'Técnica', 'Soft Skill', 'Metodología'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedSkillCategory(cat)}
                className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all duration-200 ${
                  selectedSkillCategory === cat 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. FILA 1: TARJETAS KPI PREMIUM */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: INDICE DE COBERTURA */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
            <CheckCircle2 size={56} className="text-[#007A33]" />
          </div>
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <CheckCircle2 size={16} className="text-[#007A33]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Índice Cobertura</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.coverageIndex}%</span>
            <span className="text-[10px] font-extrabold text-[#007A33] bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              +2.3%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Cumplimiento de skills requeridas</p>
          {/* Sparkline Lineal SVG */}
          <div className="w-full h-8 mt-3">
            <svg viewBox="0 0 100 30" className="w-full h-full text-[#007A33]">
              <path d="M 0 25 Q 15 12 30 18 T 60 10 T 80 8 T 100 3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 2: TOTAL GAPS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
            <AlertCircle size={56} className="text-amber-600" />
          </div>
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <AlertCircle size={16} className="text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Brechas Activas</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.totalGaps} pts</span>
            <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              -12%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Puntos de nivel por recuperar</p>
          {/* Sparkline Lineal SVG */}
          <div className="w-full h-8 mt-3">
            <svg viewBox="0 0 100 30" className="w-full h-full text-amber-500">
              <path d="M 0 5 Q 15 8 30 16 T 60 12 T 80 20 T 100 25" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 3: HORAS FORMACION */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
            <GraduationCap size={56} className="text-[#005021]" />
          </div>
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <GraduationCap size={16} className="text-[#007A33]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Esfuerzo Formación</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.totalHours}h</span>
            <span className="text-[10px] font-extrabold text-[#007A33] bg-emerald-50 px-1.5 py-0.5 rounded-full">
              +45h
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Inversión en upskilling acumulada</p>
          {/* Sparkline Lineal SVG */}
          <div className="w-full h-8 mt-3">
            <svg viewBox="0 0 100 30" className="w-full h-full text-emerald-700">
              <path d="M 0 28 Q 20 22 40 25 T 70 12 T 90 8 T 100 2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 4: INTERN MOBILITY */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
            <Award size={56} className="text-[#007A33]" />
          </div>
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Award size={16} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Movilidad Interna</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.mobilityRate}%</span>
            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
              Ideal
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Vacantes con candidatos aptos</p>
          {/* Sparkline Lineal SVG */}
          <div className="w-full h-8 mt-3">
            <svg viewBox="0 0 100 30" className="w-full h-full text-blue-500">
              <path d="M 0 25 Q 25 24 50 15 T 75 14 T 100 2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

      </div>

      {/* 2.5. FILA 1.5: TARJETAS KPI ADICIONALES PREMIUM (PERÍMETRO) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 5: TOTAL EMPLEADOS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
            <Users size={56} className="text-[#007A33]" />
          </div>
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Users size={16} className="text-[#007A33]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Empleados</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.totalEmployees}</span>
            <span className="text-[10px] font-extrabold text-[#007A33] bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              Activos
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">En el perímetro seleccionado</p>
          {/* Sparkline Lineal SVG */}
          <div className="w-full h-8 mt-3">
            <svg viewBox="0 0 100 30" className="w-full h-full text-[#007A33]">
              <path d="M 0 15 Q 20 18 40 12 T 70 15 T 100 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 6: NÚMERO DE ROLES */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
            <Briefcase size={56} className="text-emerald-700" />
          </div>
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Briefcase size={16} className="text-[#007A33]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Número de Roles</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.totalRoles}</span>
            <span className="text-[10px] font-extrabold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              Estructura
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Puestos de trabajo definidos</p>
          {/* Sparkline Lineal SVG */}
          <div className="w-full h-8 mt-3">
            <svg viewBox="0 0 100 30" className="w-full h-full text-emerald-700">
              <path d="M 0 10 Q 25 10 50 10 T 75 10 T 100 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 7: NÚMERO DE SKILLS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
            <BookOpen size={56} className="text-blue-700" />
          </div>
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <BookOpen size={16} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Número de Skills</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.totalSkills}</span>
            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              Catálogo
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Habilidades evaluadas / requeridas</p>
          {/* Sparkline Lineal SVG */}
          <div className="w-full h-8 mt-3">
            <svg viewBox="0 0 100 30" className="w-full h-full text-blue-500">
              <path d="M 0 25 Q 15 20 30 18 T 60 12 T 80 8 T 100 2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 8: ÍNDICE SKILLS MEJORADAS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
            <TrendingUp size={56} className="text-[#007A33]" />
          </div>
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <TrendingUp size={16} className="text-[#007A33]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#007A33]">Índice Skills Mejoradas</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.improvedSkillsRate}%</span>
            <span className="text-[10px] font-extrabold text-[#007A33] bg-emerald-50 px-1.5 py-0.5 rounded-full">
              Progreso
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Nivel supera el mínimo requerido</p>
          {/* Sparkline Lineal SVG */}
          <div className="w-full h-8 mt-3">
            <svg viewBox="0 0 100 30" className="w-full h-full text-[#007A33]">
              <path d="M 0 28 Q 20 25 40 18 T 70 12 T 90 5 T 100 2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

      </div>

      {/* 2.8. FILA 1.8: TARJETAS KPI NUEVAS (DEMANDA, ROLES Y FORMACIÓN) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* KPI 9: VACANTES SOLICITADAS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
            <Briefcase size={56} className="text-[#007A33]" />
          </div>
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Briefcase size={16} className="text-[#007A33]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Vacantes Solicitadas</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.requestedVacancies}</span>
            <span className="text-[10px] font-extrabold text-[#007A33] bg-emerald-50 px-1.5 py-0.5 rounded-full">Activas</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Búsquedas en curso en el perímetro</p>
          <div className="w-full h-8 mt-3">
            <svg viewBox="0 0 100 30" className="w-full h-full text-[#007A33]">
              <path d="M 0 20 Q 20 5 40 15 T 70 8 T 100 2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 10: SKILLS MEDIOS POR ROL */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
            <Award size={56} className="text-emerald-700" />
          </div>
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Award size={16} className="text-[#007A33]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Skills Medios por Rol</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.avgSkillsPerRole}</span>
            <span className="text-[10px] font-extrabold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-full">Exigidas</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Habilidades requeridas promedio</p>
          <div className="w-full h-8 mt-3">
            <svg viewBox="0 0 100 30" className="w-full h-full text-emerald-700">
              <path d="M 0 15 Q 30 15 60 15 T 100 15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 11: CURSOS MEDIOS POR EMPLEADO */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
            <BookOpen size={56} className="text-blue-700" />
          </div>
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <BookOpen size={16} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Cursos Medios</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.avgCoursesPerEmployee}</span>
            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">Completados</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Planes de formación por empleado</p>
          <div className="w-full h-8 mt-3">
            <svg viewBox="0 0 100 30" className="w-full h-full text-blue-500">
              <path d="M 0 25 Q 15 10 30 20 T 60 5 T 100 2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 12: % EMPLEADOS CON SKILL REVIEW */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
            <CheckCircle2 size={56} className="text-[#007A33]" />
          </div>
          <div className="flex items-center gap-2 mb-2 text-slate-400">
            <CheckCircle2 size={16} className="text-[#007A33]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Evaluación 360</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.skillReviewPercent}%</span>
            <span className="text-[10px] font-extrabold text-[#007A33] bg-emerald-50 px-1.5 py-0.5 rounded-full">Revisados</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Porcentaje con Skill Review realizada</p>
          <div className="w-full h-8 mt-3">
            <svg viewBox="0 0 100 30" className="w-full h-full text-[#007A33]">
              <path d="M 0 28 Q 20 20 40 25 T 70 8 T 100 2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. FILA 2: MATRIZ DE CALOR (HEATMAP) & COMPLEMENTARIO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL IZQUIERDA Y CENTRO: MATRIZ DE CALOR (Ocupa 2 columnas de 3 en pantallas grandes) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <span>Matriz de Competencia por Unidad (Heatmap)</span>
                <HelpCircle size={13} className="text-slate-400 hover:text-slate-600 cursor-pointer" title="Celda muestra promedio de nivel de habilidad en la unidad. Haz clic para ver el desglose." />
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Estructura jerárquica de <span className="font-semibold text-slate-600">{selectedUnitName}</span> · Analiza fortalezas y gaps por nivel
              </p>
            </div>
            
            <div className="flex items-center gap-3 relative">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Leyenda:</span>
              <div className="flex items-center gap-0.5 mr-2">
                <span className="w-2.5 h-2.5 bg-red-100 rounded border border-red-200" title="Bajo (<2.0)" />
                <span className="w-2.5 h-2.5 bg-amber-100 rounded border border-amber-200" title="Medio (<3.5)" />
                <span className="w-2.5 h-2.5 bg-emerald-100 rounded border border-emerald-200/60" title="Alto (<4.5)" />
                <span className="w-2.5 h-2.5 bg-[#007A33] rounded" title="Experto (>=4.5)" />
              </div>

              {/* Selector de columnas dinámicas */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSkillDropdown(!showSkillDropdown)}
                  className="flex items-center gap-1 px-2 py-1 text-[9px] font-extrabold text-[#007A33] bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100/50 transition-all shrink-0"
                >
                  <Plus size={10} />
                  <span>Columnas ({coreSkills.length})</span>
                </button>
                
                {showSkillDropdown && (
                  <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-56 p-2.5 space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar skill..."
                        value={searchSkillQuery}
                        onChange={(e) => setSearchSkillQuery(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 text-[10px] border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                      />
                      <Search size={10} className="text-slate-450 absolute left-2 top-2" />
                    </div>
                    <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 text-[10px] font-semibold">
                      {mockSkills
                        .filter(s => !coreSkills.includes(s.name) && s.name.toLowerCase().includes(searchSkillQuery.toLowerCase()))
                        .slice(0, 15)
                        .map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setCoreSkills(prev => [...prev, s.name]);
                              setShowSkillDropdown(false);
                              setSearchSkillQuery('');
                            }}
                            className="w-full text-left px-2 py-1.5 hover:bg-slate-50 hover:text-[#007A33] transition-all rounded text-slate-700"
                          >
                            {s.name}
                          </button>
                        ))}
                      {mockSkills.filter(s => !coreSkills.includes(s.name) && s.name.toLowerCase().includes(searchSkillQuery.toLowerCase())).length === 0 && (
                        <p className="text-[9px] text-slate-400 text-center py-2 font-medium">No hay coincidencias</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider w-48">Unidad Organizativa</th>
                  <th className="py-2.5 px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Emp.</th>
                  {coreSkills.map(skill => (
                    <th 
                      key={skill} 
                      className="py-2 px-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-center"
                      style={{ minWidth: '125px' }}
                    >
                      <div className="flex items-center justify-center gap-1 bg-slate-50 border border-slate-150 rounded-lg py-1 px-1.5 shadow-xs font-extrabold whitespace-normal break-words leading-tight">
                        <span title={skill} className="text-[10px] text-slate-700 tracking-tight">{skill}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoreSkills(prev => prev.filter(s => s !== skill));
                            if (activeHeatmapCell?.skillName === skill) setActiveHeatmapCell(null);
                          }}
                          className="p-0.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-100/50 transition-all shrink-0 cursor-pointer"
                          title="Eliminar columna de la matriz"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {heatmapData.map((row) => (
                  <tr key={row.unitId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3 max-w-xs">
                      <p className="text-xs font-bold text-slate-800 truncate" title={row.unitName}>{row.unitName}</p>
                      <p className="text-[9px] text-slate-400 font-semibold">{row.unitType}</p>
                    </td>
                    <td className="py-2.5 px-2 text-center text-xs font-bold text-slate-500">{row.employeeCount}</td>
                    {coreSkills.map(skillName => {
                      const score = row.scores[skillName];
                      const isSelected = activeHeatmapCell && activeHeatmapCell.unitId === row.unitId && activeHeatmapCell.skillName === skillName;
                      return (
                        <td 
                          key={skillName} 
                          className="py-1.5 px-1 text-center"
                          onClick={() => {
                            if (row.employeeCount === 0) return;
                            setActiveHeatmapCell({ unitId: row.unitId, skillName });
                          }}
                        >
                          <div 
                            className={`w-9 h-7 rounded-lg border flex items-center justify-center text-xs font-bold transition-all duration-200 cursor-pointer ${getHeatmapColor(score)} ${
                              isSelected ? 'ring-2 ring-emerald-500 scale-105 shadow-md shadow-emerald-500/10' : ''
                            }`}
                          >
                            {score > 0 ? score : '-'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DESGLOSE AL HACER CLIC EN UNA CELDA DEL HEATMAP */}
          {activeHeatmapCell && cellDetailList && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mt-4 animate-fadeIn">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-xs font-black text-slate-800 flex flex-wrap items-center gap-1.5">
                    <span>Desglose de la habilidad</span>
                    <span className="text-[#007A33] font-black">{activeHeatmapCell.skillName}</span>
                    <span>en la unidad</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-extrabold">
                      {activeUnitName}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Puntuaciones de los colaboradores evaluados en esta competencia dentro de {activeUnitName}</p>
                </div>
                <button 
                  onClick={() => setActiveHeatmapCell(null)}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 transition-all"
                >
                  Cerrar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cellDetailList.length === 0 ? (
                  <p className="text-xs text-slate-400 col-span-2 py-4 text-center bg-white rounded-xl border border-dashed border-slate-200">No hay empleados asignados directamente o evaluados en esta skill.</p>
                ) : (
                  cellDetailList.map(emp => {
                    if (!emp) return null;
                    return (
                      <div key={emp.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center gap-2">
                          <img src={emp.avatar || 'https://i.pravatar.cc/150'} alt={emp.name} className="w-8 h-8 rounded-full border border-slate-100" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{emp.role}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-xs font-extrabold text-slate-800">Lvl {emp.currentLevel}</span>
                              <span className="text-[9px] text-slate-400">/ {emp.requiredLevel} req</span>
                            </div>
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${
                              emp.currentLevel >= emp.requiredLevel 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-rose-50 text-rose-700'
                            }`}>
                              {emp.currentLevel >= emp.requiredLevel ? 'Cubierto' : `Gap -${emp.requiredLevel - emp.currentLevel}`}
                            </span>
                          </div>
                          <div className="w-1.5 h-8 bg-slate-100 rounded-full overflow-hidden flex flex-col justify-end">
                            <div 
                              className={`w-full rounded-full ${emp.currentLevel >= emp.requiredLevel ? 'bg-[#007A33]' : 'bg-amber-400'}`}
                              style={{ height: `${Math.min((emp.currentLevel / 5) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

        {/* GRAFICO COMPARATIVO DE BARRAS DE OFERTA VS DEMANDA */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 flex-wrap">
              <span>Demanda vs Oferta de Talento</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full text-[#007A33]">
                {selectedUnitName}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Comparativa del nivel medio real (oferta) frente al requerido (demanda) en el perímetro</p>
          </div>

          {/* Gráfico de Barras SVG Interactivo */}
          <div className="h-60 flex flex-col justify-end relative mt-2">
            <div className="absolute top-0 right-0 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-1.5 bg-[#007A33] rounded-sm" />
                <span className="text-[8px] font-extrabold text-slate-400 uppercase">Oferta</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-1.5 bg-slate-300 rounded-sm" />
                <span className="text-[8px] font-extrabold text-slate-400 uppercase">Demanda</span>
              </div>
            </div>

            <div className="flex-1 flex items-end justify-between gap-2.5 pt-6 pb-2">
              {skillsComparison.map(skill => (
                <div key={skill.name} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip en Hover */}
                  <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-[9px] font-bold p-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 text-center w-24">
                    <p className="font-extrabold">{skill.name}</p>
                    <p className="text-emerald-300">Oferta: {skill.current}</p>
                    <p className="text-slate-300">Requerido: {skill.required}</p>
                  </div>

                  <div className="w-full flex items-end justify-center gap-0.5 h-full">
                    {/* Barra de Nivel Real (Oferta) */}
                    <div 
                      className="w-2 bg-[#007A33] rounded-t-sm transition-all duration-500 group-hover:brightness-110 shadow-lg shadow-emerald-500/10" 
                      style={{ height: `${(skill.current / 5) * 100}%` }}
                    />
                    {/* Barra de Nivel Requerido (Demanda) */}
                    <div 
                      className="w-2 bg-slate-200 rounded-t-sm transition-all duration-500" 
                      style={{ height: `${(skill.required / 5) * 100}%` }}
                    />
                  </div>

                  {/* Iniciales de la Skill */}
                  <span className="text-[8px] font-black text-slate-400 mt-2 truncate w-full text-center" title={skill.name}>
                    {skill.name.slice(0, 5)}..
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/60 flex items-start gap-2.5">
            <TrendingUp size={16} className="text-[#007A33] mt-0.5 shrink-0" />
            <p className="text-[10px] text-[#005021] leading-normal font-semibold">
              El análisis detecta que **Gestión de Talento** y **Liderazgo** presentan los mayores excedentes positivos de competencias, mientras que **SQL** y **React** muestran las mayores brechas.
            </p>
          </div>
        </div>

      </div>

      {/* 4. FILA 3: RECOMENDADOR DE CURSOS Y DETECTAR TALENTO EN MOVILIDAD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PANEL 1: RECOMENDADOR INTELIGENTE DE CURSOS */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <BookOpen size={16} className="text-[#007A33]" />
              <span>Smart Training Planner (Recomendador de Cursos)</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Planes formativos recomendados según las brechas de skills más críticas detectadas</p>
          </div>

          <div className="space-y-3">
            {trainingRecommendations.map((rec) => (
              <div key={rec.skillName} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-sm transition-all duration-200 flex flex-col sm:flex-row justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{rec.courseTitle}</span>
                    <span className="text-[8px] font-extrabold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-full border border-rose-100">
                      Urgente
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">Objetivo: Corregir brecha en habilidad **{rec.skillName}** (Brecha acumulada: -{rec.accumulatedGap} pts)</p>
                  
                  <div className="flex items-center gap-3 text-[9px] text-slate-400 font-bold mt-1">
                    <span className="flex items-center gap-0.5"><Users size={10} /> +{rec.impactEstimate} Empleados Impactados</span>
                    <span className="flex items-center gap-0.5"><GraduationCap size={10} /> {rec.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 shrink-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Impacto Estimado</p>
                    <p className="text-xs font-black text-[#007A33]">+{rec.impactEstimate}% Cobertura</p>
                  </div>
                  <button className="text-[10px] font-extrabold text-white bg-[#007A33] hover:bg-[#006028] px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-emerald-700/10">
                    <span>Programar</span>
                    <ChevronRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 2: DETECTAR TALENTO EN MOVILIDAD INTERNA */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <Award size={16} className="text-amber-500" />
              <span>Talent Mobility Intelligence (Movilidad Interna)</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Identificación inteligente de talento excedente y propuestas automáticas de promoción interna</p>
          </div>

          <div className="space-y-3">
            {talentMobilityAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">No se han detectado perfiles con excedentes significativos en esta unidad actualmente.</p>
            ) : (
              talentMobilityAlerts.map((alert) => {
                if (!alert || !alert.employee) return null;
                return (
                  <div key={alert.employee.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 hover:border-amber-200 transition-all duration-200">
                    
                    <div className="flex items-center gap-3">
                      <img src={alert.employee.avatar || 'https://i.pravatar.cc/150'} alt={alert.employee.name} className="w-10 h-10 rounded-full border border-slate-100 shrink-0" />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800">{alert.employee.name}</span>
                          <span className="text-[8px] font-extrabold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-amber-100">
                            Alto Potencial
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{alert.employee.role} | Excedente en {alert.topSkills.join(', ')}</p>
                        
                        <p className="text-[9px] text-[#007A33] font-bold flex items-center gap-1 pt-0.5">
                          <ArrowUpRight size={10} /> 
                          <span>Apto para vacante: {alert.bestOpportunity}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="bg-white border border-slate-100 rounded-xl py-1 px-2 text-center shadow-xs">
                        <span className="text-xs font-black text-slate-800">{alert.matchingRate}%</span>
                        <p className="text-[7px] text-slate-400 font-bold uppercase">Matching</p>
                      </div>
                      <button className="text-[9px] font-extrabold text-[#007A33] hover:text-[#005021] bg-white border border-[#007A33]/20 hover:border-[#007A33]/40 rounded-lg px-2 py-1 mt-1.5 transition-all">
                        Ver Ficha
                      </button>
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
