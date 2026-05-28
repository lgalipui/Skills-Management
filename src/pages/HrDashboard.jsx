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
  X,
  Compass,
  ShieldAlert,
  Target,
  Activity,
  FileText,
  RefreshCw,
  Sliders,
  Info
} from 'lucide-react';
import clsx from 'clsx';

export const HrDashboard = () => {
  const { users = [], orgUnits = [], badgesCatalog = [] } = useAuth() || {};
  
  // Estados para filtros globales
  const [selectedOrgUnitId, setSelectedOrgUnitId] = useState('all');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('Todas');
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState('all');
  const [activeHeatmapCell, setActiveHeatmapCell] = useState(null); // { unitId, skillName }
  
  // Estado para la Pestaña Activa
  const [activeTab, setActiveTab] = useState('plantilla');

  // Estado para el visor de Sucesión de Roles Críticos
  const [selectedCriticalRole, setSelectedCriticalRole] = useState('r2'); // Senior Developer por defecto

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

  // Helper recursivo para consolidar métricas de descendientes
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

  // Filtrar usuarios según la unidad organizativa seleccionada
  const filteredUsers = useMemo(() => {
    const safeUsers = users || [];
    if (selectedOrgUnitId === 'all') return safeUsers;
    const allowedIds = getDescendantOrgUnitIds(selectedOrgUnitId) || [];
    return safeUsers.filter(u => u && allowedIds.includes(u.orgUnitId));
  }, [users, selectedOrgUnitId, getDescendantOrgUnitIds]);

  // Obtener lista de subunidades para la matriz de calor
  const childUnitsForMatrix = useMemo(() => {
    const units = orgUnits || [];
    if (selectedOrgUnitId === 'all') {
      return units.filter(u => u && (u.parentId === null || u.type === 'Dirección de División'));
    }
    return units.filter(u => u && (u.id === selectedOrgUnitId || u.parentId === selectedOrgUnitId));
  }, [orgUnits, selectedOrgUnitId]);

  // Competencias clave del Heatmap
  const [coreSkills, setCoreSkills] = useState(['React', 'Node.js', 'Agile', 'SQL', 'Liderazgo', 'Comunicación', 'Gestión de Talento', 'Arquitectura Cloud']);
  const [searchSkillQuery, setSearchSkillQuery] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  // 1. CÁLCULO DE METRICAS GLOBALES Y CRUZADAS DE RRHH
  const metrics = useMemo(() => {
    const safeFilteredUsers = filteredUsers || [];
    const totalEmployees = safeFilteredUsers.length;
    
    if (totalEmployees === 0) {
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
        skillReviewPercent: 0,
        turnoverRate: 0,
        overskillingTurnover: 0,
        criticalSkillsTurnover: 0,
        taxonomyCoverage: 0,
        catalogObsolescence: 0,
        participationRate: 0,
        autoevalBias: 0,
        calibrationBias: 0,
        amplitudeFormativa: 0
      };
    }

    let totalRequiredSkills = 0;
    let metRequiredSkills = 0;
    let totalGaps = 0;
    let improvedSkillsCount = 0;
    let overskilledCount = 0;

    safeFilteredUsers.forEach(user => {
      if (!user || !user.skills) return;
      
      let userOverskilled = 0;
      user.skills.forEach(skill => {
        if (!skill) return;
        if (selectedSkillCategory !== 'Todas' && skill.category !== selectedSkillCategory) return;

        totalRequiredSkills++;
        const skillLevel = Number(skill.level) || 0;
        const skillRequired = Number(skill.required) || 0;
        
        if (skillLevel >= skillRequired) {
          metRequiredSkills++;
          if (skillLevel - skillRequired >= 2) {
            userOverskilled++;
          }
        } else {
          totalGaps += (skillRequired - skillLevel);
        }

        let isImproved = skillLevel > skillRequired;
        if (selectedTimeHorizon !== 'all') {
          const hasBadge = (user.badges || []).some(b => 
            b.status === 'Obtenido' && 
            isBadgeInWindow(b.date, selectedTimeHorizon) &&
            (badgesCatalog.find(cat => cat.id === b.badgeId)?.skillsValidated || []).includes(skill.name)
          );
          isImproved = isImproved && hasBadge;
        }

        if (isImproved) {
          improvedSkillsCount++;
        }
      });
      if (userOverskilled >= 2) overskilledCount++;
    });

    const coverageIndex = totalRequiredSkills > 0 
      ? Math.round((metRequiredSkills / totalRequiredSkills) * 100) 
      : 100;

    const improvedSkillsRate = totalRequiredSkills > 0
      ? Math.round((improvedSkillsCount / totalRequiredSkills) * 100)
      : 0;

    const totalHours = safeFilteredUsers.reduce((acc, user) => {
      const userBadges = user?.badges || [];
      const badgesCount = userBadges.filter(b => b && b.status === 'Obtenido' && isBadgeInWindow(b.date, selectedTimeHorizon)).length;
      return acc + (badgesCount * 12) + (selectedTimeHorizon === 'all' ? 6 : 0);
    }, 0);

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
      : Math.max(1, Math.round(totalEmployees * 0.1));

    // B. Habilidades medias por rol
    const activeRoles = Array.from(new Set(safeFilteredUsers.map(u => u.role).filter(Boolean)));
    let totalRequiredSkillsForRoles = 0;
    activeRoles.forEach(roleTitle => {
      totalRequiredSkillsForRoles += (roleTitle.length % 2 === 0 ? 3 : 4);
    });
    const avgSkillsPerRole = activeRoles.length > 0
      ? parseFloat((totalRequiredSkillsForRoles / activeRoles.length).toFixed(1))
      : 3.5;

    // C. Cursos medios
    const totalBadgesAndCourses = safeFilteredUsers.reduce((sum, u) => {
      const badgesCount = (u.badges || []).length;
      const simulatedCourses = (u.id % 3) + 1;
      return sum + badgesCount + simulatedCourses;
    }, 0);
    const avgCoursesPerEmployee = totalEmployees > 0
      ? parseFloat((totalBadgesAndCourses / totalEmployees).toFixed(1))
      : 2.8;

    // D. % de empleados con Skill review
    const reviewedUsersCount = safeFilteredUsers.filter(u => {
      return (u.id % 2 === 0) || (u.badges && u.badges.length > 0);
    }).length;
    const skillReviewPercent = totalEmployees > 0
      ? Math.round((reviewedUsersCount / totalEmployees) * 100)
      : 75;

    // --- NUEVAS METRICAS DETALLADAS SOLICITADAS POR EL USUARIO ---
    
    // Tasa de rotación general e indicadores cruzados
    const baseTurnover = 4.2; 
    const isTiPerimeter = selectedUnitName.toLowerCase().includes('tecnología') || selectedOrgUnitId === 'all';
    const turnoverRate = isTiPerimeter ? baseTurnover + 0.6 : baseTurnover - 0.4;
    
    // Cruce de rotación con Sobreskilling y Skills Críticos
    const overskillingTurnover = parseFloat((turnoverRate * 1.45).toFixed(1)); // Más alto por desmotivación/fuga
    const criticalSkillsTurnover = parseFloat((turnoverRate * 1.8).toFixed(1)); // Alta demanda en el mercado tecnológico

    // Cobertura de la taxonomía y obsolescencia del catálogo
    const taxonomyCoverage = 86.7; // 13 de 15 roles parametrizados
    const catalogObsolescence = 6.7; // 2 de 30 skills sin asignar

    // Reviews progreso
    const participationRate = 92; // 92% iniciaron o completaron
    const autoevalBias = 0.42; // Los empleados se evalúan en promedio +0.42 puntos por encima del mánager
    const calibrationBias = -0.25; // El comité calibra -0.25 puntos a la baja para alinear criterios

    // Formación
    const amplitudeFormativa = 68; // 68% realizó al menos un curso o insignia en el periodo

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
      skillReviewPercent,
      turnoverRate,
      overskillingTurnover,
      criticalSkillsTurnover,
      taxonomyCoverage,
      catalogObsolescence,
      participationRate,
      autoevalBias,
      calibrationBias,
      amplitudeFormativa
    };
  }, [filteredUsers, selectedSkillCategory, selectedTimeHorizon, selectedOrgUnitId, selectedUnitName, orgUnits, badgesCatalog]);

  // 2. CÓMPUTO DE LA MATRIZ DE CALOR (HEATMAP DATA)
  const heatmapData = useMemo(() => {
    const safeChildUnits = childUnitsForMatrix || [];
    const safeUsers = users || [];
    return safeChildUnits.map(unit => {
      if (!unit) return null;
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
  }, [childUnitsForMatrix, users, getDescendantOrgUnitIds, coreSkills]);

  // 3. CÓMPUTO DE LISTADO DE DETALLE PARA LA CELDA CLICADA
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
      };
    }).filter(Boolean).sort((a, b) => b.currentLevel - a.currentLevel);
  }, [activeHeatmapCell, users, getDescendantOrgUnitIds]);

  // Color de celda del Heatmap
  const getHeatmapColor = (score) => {
    if (score === 0) return 'bg-slate-100/40 border-slate-200 text-slate-400';
    if (score < 2.0) return 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100';
    if (score < 3.5) return 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100';
    if (score < 4.5) return 'bg-emerald-50/70 border-emerald-200/60 text-[#007A33] hover:bg-emerald-100/70';
    return 'bg-[#007A33] border-[#005021] text-white hover:bg-[#006028]';
  };

  // 4. GRÁFICO COMPARATIVO DEMANDA VS OFERTA (PROMEDIOS GLOBALES)
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
  }, [filteredUsers, coreSkills]);

  // 5. INTELIGENCIA DE BRECHAS Y RECOMENDADOR DE CURSOS (SMART TRAINING)
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
        impactEstimate: Math.round(item.gap * 1.5 + 2)
      };
    });
  }, [filteredUsers]);

  // 6. TALENTO EN MOVILIDAD (RETENCIÓN E INTELIGENCIA INTERNA)
  const talentMobilityAlerts = useMemo(() => {
    const safeFilteredUsers = filteredUsers || [];
    const pool = safeFilteredUsers.filter(u => u && u.profile !== 'RRHH');
    const alerts = [];
    const safeOpportunities = mockOpportunities || [];

    pool.forEach(user => {
      if (!user) return;
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

    return alerts.slice(0, 3);
  }, [filteredUsers, mockOpportunities]);

  // --- DATOS Y COMPUTACIÓN ESPECÍFICOS PARA LAS PESTAÑAS SOLICITADAS ---

  // 7. CÓMPUTO DE TOP 5 ROLES CON MAYOR GAP competencial (señalando si son críticos)
  const topGappedRoles = useMemo(() => {
    // Definimos qué roles en la estructura de Cajamar se consideran altamente estratégicos/críticos
    const CRITICAL_ROLES = ["Analista Programador", "Arquitecto de Software", "Tech Lead"];
    
    const roleStats = {};
    const safeFilteredUsers = filteredUsers || [];
    
    safeFilteredUsers.forEach(user => {
      if (!user || !user.role || !user.skills) return;
      if (!roleStats[user.role]) {
        roleStats[user.role] = { totalGap: 0, skillCount: 0, userCount: 0 };
      }
      roleStats[user.role].userCount++;
      user.skills.forEach(s => {
        const skillLevel = Number(s.level) || 0;
        const skillRequired = Number(s.required) || 0;
        if (skillLevel < skillRequired) {
          roleStats[user.role].totalGap += (skillRequired - skillLevel);
        }
        roleStats[user.role].skillCount++;
      });
    });

    return Object.entries(roleStats)
      .map(([roleName, stats]) => {
        const avgGap = stats.userCount > 0 ? parseFloat((stats.totalGap / stats.userCount).toFixed(1)) : 0;
        const isCritical = CRITICAL_ROLES.includes(roleName);
        return {
          name: roleName,
          avgGap,
          isCritical,
          totalGap: stats.totalGap
        };
      })
      .sort((a, b) => b.avgGap - a.avgGap)
      .slice(0, 5);
  }, [filteredUsers]);

  // 8. CÓMPUTO DE TOP 5 SKILLS CON MAYOR DÉFICIT
  const topDeficitSkills = useMemo(() => {
    const skillGaps = {};
    const safeFilteredUsers = filteredUsers || [];
    
    safeFilteredUsers.forEach(user => {
      if (!user || !user.skills) return;
      user.skills.forEach(s => {
        const skillLevel = Number(s.level) || 0;
        const skillRequired = Number(s.required) || 0;
        if (skillLevel < skillRequired) {
          const gap = skillRequired - skillLevel;
          if (!skillGaps[s.name]) {
            skillGaps[s.name] = { gap: 0, category: s.category || 'Técnica' };
          }
          skillGaps[s.name].gap += gap;
        }
      });
    });

    const CRITICAL_SKILLS = ["React", "Arquitectura Cloud", "Node.js", "Liderazgo"];

    return Object.entries(skillGaps)
      .map(([name, data]) => ({
        name,
        gap: data.gap,
        category: data.category,
        isCritical: CRITICAL_SKILLS.includes(name)
      }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 5);
  }, [filteredUsers]);

  // 9. CÓMPUTO DE DISTRIBUCIÓN POR NIVELES DE MADUREZ PROFESIONAL (ESTRUCTURA DE ROLES Y NIVELES)
  const roleLevelsStructure = useMemo(() => {
    const list = {};
    const safeFilteredUsers = filteredUsers || [];
    
    safeFilteredUsers.forEach(user => {
      if (!user || !user.role) return;
      if (!list[user.role]) {
        list[user.role] = { Junior: 0, Senior: 0, Lead: 0, Expert: 0, total: 0 };
      }
      
      // Clasificación simulada o extraída de su perfil / habilidades
      let lvl = "Junior";
      if (user.role.toLowerCase().includes('lead') || user.profile === 'Manager') lvl = "Lead";
      else if (user.role.toLowerCase().includes('senior')) lvl = "Senior";
      else if (user.role.toLowerCase().includes('arquitecto')) lvl = "Expert";
      
      list[user.role][lvl]++;
      list[user.role].total++;
    });

    return Object.entries(list).map(([roleName, counts]) => ({
      name: roleName,
      ...counts
    })).sort((a, b) => b.total - a.total);
  }, [filteredUsers]);

  // 10. LISTA DE SUCESORES RECOMENDADOS PARA ROL SELECCIONADO (TAB 7)
  const successionPlanningData = useMemo(() => {
    const criticalRolesList = [
      { id: "r2", title: "Senior Developer", family: "Ingeniería de Software" },
      { id: "r3", title: "Tech Lead", family: "Management Técnico" },
      { id: "r4", title: "Arquitecto de Software", family: "Arquitectura" },
      { id: "r5", title: "Agile Coach", family: "Metodología" }
    ];

    const safeUsers = users || [];
    const activeCriticalObj = criticalRolesList.find(r => r.id === selectedCriticalRole);
    if (!activeCriticalObj) return { criticalRolesList, successors: [] };

    // Filtramos candidatos internos de alto potencial
    const pool = safeUsers.filter(u => u.profile !== 'RRHH' && u.role !== activeCriticalObj.title);
    
    // Mapeo dinámico de requisitos según mockData (ej. simulamos para r2, r3, r4...)
    let simulatedReqs = ["React", "Agile"];
    if (selectedCriticalRole === 'r3') simulatedReqs = ["React", "Liderazgo", "Agile"];
    if (selectedCriticalRole === 'r4') simulatedReqs = ["Arquitectura Cloud", "React", "Node.js"];
    if (selectedCriticalRole === 'r5') simulatedReqs = ["Agile", "Comunicación", "Gestión de Talento"];

    const successors = pool.map(user => {
      let matchPoints = 0;
      let totalReqLevel = simulatedReqs.length * 4; // Promedio requerido 4

      simulatedReqs.forEach(reqName => {
        const uSkill = user.skills?.find(s => s.name === reqName);
        if (uSkill) {
          matchPoints += Math.min(uSkill.level, 4);
        }
      });

      const matchPercent = Math.round((matchPoints / totalReqLevel) * 100);
      
      // Tiempo de preparación simulado según match competencial
      let readiness = "Preparado (Ready Now)";
      let tagBg = "bg-emerald-50 border-emerald-150 text-emerald-700";
      if (matchPercent < 80) {
        readiness = "En desarrollo (1 - 2 años)";
        tagBg = "bg-amber-50 border-amber-150 text-amber-700";
      }
      if (matchPercent < 60) {
        readiness = "Planificación a largo plazo (>2 años)";
        tagBg = "bg-slate-50 border-slate-150 text-slate-700";
      }

      // Desempeño y Potencial simulados según su ID de usuario
      const perf = user.id % 2 === 0 ? "Alto (1a)" : "Excelente (2a)";
      const pot = user.id % 3 === 0 ? "Alto Potencial" : "Potencial Promedio";

      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        currentRole: user.role,
        matchPercent,
        readiness,
        tagBg,
        performance: perf,
        potential: pot
      };
    }).sort((a, b) => b.matchPercent - a.matchPercent).slice(0, 3);

    return {
      criticalRolesList,
      successors
    };
  }, [users, selectedCriticalRole]);

  // Lista de empleados clasificados en la matriz 9-Box (TAB 7)
  const nineBoxData = useMemo(() => {
    const safeFilteredUsers = filteredUsers || [];
    const pool = safeFilteredUsers.filter(u => u.profile !== 'RRHH');
    const boxes = {
      "Enigma / Gema Oculta": [],
      "Alto Crecimiento": [],
      "Talento Clave / Estrella": [],
      "Desarrollo Necesario": [],
      "Colaborador Core": [],
      "Profesional Clave": [],
      "Bajo Rendimiento": [],
      "Eficiente y Sólido": [],
      "Especialista Sólido": []
    };

    pool.forEach((user, idx) => {
      // Distribución determinista basada en el ID y longitud de nombre para simular la posición
      if (idx % 8 === 0) {
        boxes["Talento Clave / Estrella"].push(user);
      } else if (idx % 8 === 1) {
        boxes["Alto Crecimiento"].push(user);
      } else if (idx % 8 === 2) {
        boxes["Profesional Clave"].push(user);
      } else if (idx % 8 === 3) {
        boxes["Colaborador Core"].push(user);
      } else if (idx % 8 === 4) {
        boxes["Especialista Sólido"].push(user);
      } else if (idx % 8 === 5) {
        boxes["Eficiente y Sólido"].push(user);
      } else if (idx % 8 === 6) {
        boxes["Enigma / Gema Oculta"].push(user);
      } else if (idx % 8 === 7) {
        boxes["Desarrollo Necesario"].push(user);
      } else {
        boxes["Bajo Rendimiento"].push(user);
      }
    });

    return boxes;
  }, [filteredUsers]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 text-slate-800 transition-all duration-300">
      
      {/* 1. CABECERA Y FILTROS GLOBALES */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg text-[#007A33]">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Dashboard Dirección de Personas</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visión predictiva y analítica de competencias para <span className="font-bold text-[#007A33]">{selectedUnitName}</span>
          </p>
        </div>
        
        {/* Selectores Reactivos */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Unidad:</span>
            <select
              value={selectedOrgUnitId}
              onChange={(e) => {
                setSelectedOrgUnitId(e.target.value);
                setActiveHeatmapCell(null);
              }}
              className="text-xs font-extrabold bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#007A33]/20 text-slate-700 cursor-pointer shadow-2xs"
            >
              <option value="all">Toda la Organización</option>
              {(orgUnits || []).map(unit => {
                if (!unit || !unit.id) return null;
                return (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Periodo:</span>
            <select
              value={selectedTimeHorizon}
              onChange={(e) => setSelectedTimeHorizon(e.target.value)}
              className="text-xs font-extrabold bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#007A33]/20 text-slate-700 cursor-pointer shadow-2xs"
            >
              <option value="all">Todo el Histórico</option>
              <option value="MTD">MTD (Mes en curso)</option>
              <option value="QTD">QTD (Trimestre en curso)</option>
              <option value="YTD">YTD (Año en curso)</option>
              <option value="T12M">T12M (Últimos 12 meses)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            {['Todas', 'Técnica', 'Soft Skill', 'Metodología'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedSkillCategory(cat)}
                className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  selectedSkillCategory === cat 
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. PESTAÑAS DE NAVEGACIÓN PRINCIPAL RRHH */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 pb-px">
        {[
          { id: 'plantilla', label: 'Plantilla y Niveles', icon: Users },
          { id: 'roles_skills', label: 'Roles y Taxonomía', icon: Briefcase },
          { id: 'reviews', label: 'Progreso Skills Reviews', icon: FileText },
          { id: 'gaps', label: 'Brechas y Gaps', icon: Target },
          { id: 'upskilling', label: 'Impacto Desarrollo', icon: GraduationCap },
          { id: 'mobility', label: 'Talent Mobility', icon: Award },
          { id: 'succession', label: 'Sucesión y 9-Box', icon: Compass }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setActiveHeatmapCell(null);
              }}
              className={clsx(
                "flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-black transition-all cursor-pointer outline-none",
                isActive 
                  ? "border-[#007A33] text-[#007A33] bg-[#007A33]/3 rounded-t-2xl" 
                  : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              <Icon size={14} className={isActive ? "text-[#007A33]" : "text-slate-400"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. CONTENIDO DINÁMICO SEGÚN PESTAÑA ACTIVA */}

      {/* ==================== PESTAÑA 1: ESTADÍSTICAS DE PLANTILLA ==================== */}
      {activeTab === 'plantilla' && (
        <div className="space-y-6">
          {/* Fila superior de KPIs de la pestaña */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <Users size={56} className="text-[#007A33]" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Users size={16} className="text-[#007A33]" />
                <span className="text-[9px] font-black uppercase tracking-wider">FTEs Activos</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.totalEmployees}</span>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Colaboradores en plantilla</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <Activity size={56} className="text-blue-500" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Activity size={16} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-wider">Tasa Rotación</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.turnoverRate}%</span>
              <p className="text-[10px] text-slate-455 mt-1.5 font-medium">Bajas voluntarias del periodo</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <ShieldAlert size={56} className="text-amber-600" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <ShieldAlert size={16} className="text-amber-500" />
                <span className="text-[9px] font-black uppercase tracking-wider">Fuga Sobreskilled</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.overskillingTurnover}%</span>
                <span className="text-[8px] font-black text-amber-700 bg-amber-50 border border-amber-150 px-1 rounded-md uppercase">Riesgo</span>
              </div>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Rotación con competencias excedentes</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <AlertCircle size={56} className="text-rose-600" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <AlertCircle size={16} className="text-rose-500" />
                <span className="text-[9px] font-black uppercase tracking-wider">Rotación Skills Críticos</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.criticalSkillsTurnover}%</span>
                <span className="text-[8px] font-black text-rose-700 bg-rose-50 border border-rose-150 px-1 rounded-md uppercase">Alerta</span>
              </div>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Rotación en habilidades clave</p>
            </div>
          </div>

          {/* Gráfico principal: Estructura de Roles y Niveles */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs text-left">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-extrabold text-slate-800">Estructura de Roles y Niveles (Maturity Model)</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Distribución del volumen de colaboradores según su puesto y nivel competencial de madurez en Cajamar</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Rol Profesional</th>
                      <th className="py-2.5 px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center bg-slate-50/50">Junior</th>
                      <th className="py-2.5 px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Senior</th>
                      <th className="py-2.5 px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center bg-slate-50/50">Lead</th>
                      <th className="py-2.5 px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Expert</th>
                      <th className="py-2.5 px-3 text-[10px] font-extrabold text-[#007A33] uppercase tracking-wider text-center font-bold">Total FTEs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {roleLevelsStructure.map((row) => (
                      <tr key={row.name} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3 px-3 font-bold text-xs text-slate-800">{row.name}</td>
                        <td className="py-3 px-2 text-center text-xs font-semibold text-slate-500 bg-slate-50/50">{row.Junior || '-'}</td>
                        <td className="py-3 px-2 text-center text-xs font-semibold text-slate-500">{row.Senior || '-'}</td>
                        <td className="py-3 px-2 text-center text-xs font-semibold text-slate-500 bg-slate-50/50">{row.Lead || '-'}</td>
                        <td className="py-3 px-2 text-center text-xs font-semibold text-slate-500">{row.Expert || '-'}</td>
                        <td className="py-3 px-3 text-center text-xs font-black text-slate-700 bg-emerald-50/30 border-l border-emerald-50">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cruce de rotación por riesgo */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs text-left flex flex-col justify-between">
              <div className="space-y-1.5">
                <h3 className="text-sm font-extrabold text-slate-800">Cruce de Rotación y Riesgo</h3>
                <p className="text-[10px] text-slate-400">Análisis comparativo de fuga de talento según su perfil competencial en {selectedUnitName}</p>
              </div>

              <div className="space-y-4 py-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700">
                    <span>Rotación General en Plantilla</span>
                    <span className="font-extrabold">{metrics.turnoverRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-400 h-full rounded-full" style={{ width: `${(metrics.turnoverRate / 10) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700">
                    <span>Sobreskilling (Fuga por desajuste superior)</span>
                    <span className="text-amber-600 font-extrabold">{metrics.overskillingTurnover}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(metrics.overskillingTurnover / 10) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700">
                    <span>Competencias Críticas (Demanda del Mercado)</span>
                    <span className="text-rose-600 font-extrabold">{metrics.criticalSkillsTurnover}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(metrics.criticalSkillsTurnover / 10) * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-rose-50/50 border border-rose-100/50 p-3 rounded-2xl flex gap-2">
                <ShieldAlert className="text-rose-600 shrink-0 mt-0.5" size={14} />
                <p className="text-[10px] text-rose-900 leading-normal font-semibold">
                  **Alerta de Continuidad**: La rotación en empleados sobrecualificados y en skills críticas duplica la tasa general del área. Recomendamos revisar planes de carrera e itinerarios.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PESTAÑA 2: ESTADÍSTICAS DE ROLES Y SKILLS ==================== */}
      {activeTab === 'roles_skills' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <Briefcase size={56} className="text-[#007A33]" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Briefcase size={16} className="text-[#007A33]" />
                <span className="text-[9px] font-black uppercase tracking-wider">Roles en Catálogo</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.totalRoles}</span>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Perfiles del perímetro</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <BookOpen size={56} className="text-[#007A33]" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <BookOpen size={16} className="text-[#007A33]" />
                <span className="text-[9px] font-black uppercase tracking-wider">Skills Catalogadas</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.totalSkills}</span>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Habilidades bajo taxonomía</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <Target size={56} className="text-blue-600" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Target size={16} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-wider">Cobertura Taxonomía</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.taxonomyCoverage}%</span>
                <span className="text-[8px] font-black text-blue-700 bg-blue-50 border border-blue-150 px-1 rounded-md uppercase">Mapeada</span>
              </div>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Roles con perfiles de éxito asignados</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <RefreshCw size={56} className="text-rose-600" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <RefreshCw size={16} className="text-rose-500" />
                <span className="text-[9px] font-black uppercase tracking-wider">Obsolescencia Catálogo</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.catalogObsolescence}%</span>
                <span className="text-[8px] font-black text-rose-700 bg-rose-50 border border-rose-150 px-1 rounded-md uppercase">Inactivos</span>
              </div>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Skills sin asignar en últimos 12 meses</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clasificación de skills y cobertura */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs text-left">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-extrabold text-slate-800">Distribución de Habilidades por Tipología</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Clasificación porcentual del catálogo de competencias de Cajamar</p>
              </div>

              <div className="space-y-4 py-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700">
                    <span>Habilidades Técnicas</span>
                    <span>55%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-[#007A33] h-full rounded-full" style={{ width: '55%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700">
                    <span>Soft Skills (Competencias Transversales)</span>
                    <span>30%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700">
                    <span>Metodologías de Trabajo</span>
                    <span>15%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Auditoria del catálogo obsoleto */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs text-left flex flex-col justify-between">
              <div className="space-y-1.5">
                <h3 className="text-sm font-extrabold text-slate-800">Auditoría de Skills Obsoletas</h3>
                <p className="text-[10px] text-slate-400">Habilidades del catálogo sin asignar a roles ni cursos activos en 12 meses (Acción recomendada: Depurar)</p>
              </div>

              <div className="space-y-3.5 my-3">
                <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Legacy COBOL Development</p>
                    <p className="text-[9px] text-slate-400 font-semibold">Técnica · Última evaluación: Febrero 2025</p>
                  </div>
                  <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase">Archivar</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Gestión de Centralitas Manuales</p>
                    <p className="text-[9px] text-slate-400 font-semibold">Técnica · Última evaluación: Nunca</p>
                  </div>
                  <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase">Archivar</span>
                </div>
              </div>

              <div className="bg-blue-50/50 border border-blue-100/50 p-3 rounded-2xl flex gap-2">
                <HelpCircle className="text-[#007A33] shrink-0 mt-0.5" size={14} />
                <p className="text-[10px] text-[#005021] leading-normal font-semibold">
                  **Optimización**: El catálogo cuenta con un **86.7%** de cobertura óptima. Eliminar las skills obsoletas recomendadas mejorará los tiempos de calibración en la próxima campaña de Skills Reviews.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PESTAÑA 3: PROGRESO DE SKILLS REVIEWS ==================== */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <Activity size={56} className="text-[#007A33]" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Activity size={16} className="text-[#007A33]" />
                <span className="text-[9px] font-black uppercase tracking-wider">Participación Global</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.participationRate}%</span>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">De la campaña activa</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <CheckCircle2 size={56} className="text-[#007A33]" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <CheckCircle2 size={16} className="text-[#007A33]" />
                <span className="text-[9px] font-black uppercase tracking-wider">Cerradas y Calibradas</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.skillReviewPercent}%</span>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Evaluaciones definitivas</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <Sliders size={56} className="text-blue-600" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Sliders size={16} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-wider">Sesgo Autoevaluación</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-black text-slate-800">+{metrics.autoevalBias}</span>
                <span className="text-[8px] font-black text-blue-750 bg-blue-50 border border-blue-150 px-1 rounded-md uppercase">Over-rating</span>
              </div>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Autoeval vs Evaluación Mánager</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <Sliders size={56} className="text-rose-600" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Sliders size={16} className="text-rose-500" />
                <span className="text-[9px] font-black uppercase tracking-wider">Sesgo Calibración</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.calibrationBias}</span>
                <span className="text-[8px] font-black text-rose-700 bg-rose-50 border border-rose-150 px-1 rounded-md uppercase">Ajuste</span>
              </div>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Mánager vs Comité de Calibración</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Desglose exacto de procesos en estado */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs text-left">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-extrabold text-slate-800">Desglose de Evaluaciones por Estado</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Progreso exacto del flujo de calibración en la campaña anual de Skills Reviews</p>
              </div>

              <div className="space-y-3.5 py-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700">
                    <span>1. Lanzado (Campaña Activa)</span>
                    <span className="text-slate-500 font-extrabold">12%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-slate-350 h-full rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700">
                    <span>2. Autoevaluado (Por el empleado)</span>
                    <span className="text-indigo-600 font-extrabold">28%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '28%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700">
                    <span>3. Evaluación 360° (Feedback Pares / Mánager)</span>
                    <span className="text-blue-600 font-extrabold">35%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700">
                    <span>4. Calibrado (Comité Calificador)</span>
                    <span className="text-amber-600 font-extrabold">15%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700">
                    <span>5. Finalizado y Firmado</span>
                    <span className="text-emerald-700 font-extrabold">10%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#007A33] h-full rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Auditoria de Sesgos por Dirección */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs text-left flex flex-col justify-between">
              <div className="space-y-1.5">
                <h3 className="text-sm font-extrabold text-slate-800">Sesgos de Evaluación y Desviación</h3>
                <p className="text-[10px] text-slate-400">Auditoría interna de calibración por Dirección Técnica en la campaña actual</p>
              </div>

              <div className="overflow-x-auto my-3">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150">
                      <th className="py-2 px-2 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Dirección / Área</th>
                      <th className="py-2 px-2 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Sesgo Autoeval.</th>
                      <th className="py-2 px-2 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider text-center">Sesgo Calibración</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    <tr>
                      <td className="py-2 px-2">Tecnología de la Información</td>
                      <td className="py-2 px-2 text-center text-blue-600 font-bold">+0.48 pts</td>
                      <td className="py-2 px-2 text-center text-rose-600 font-bold">-0.32 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2">Sistemas y Soporte</td>
                      <td className="py-2 px-2 text-center text-blue-600 font-bold">+0.38 pts</td>
                      <td className="py-2 px-2 text-center text-rose-600 font-bold">-0.18 pts</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2">Arquitectura Técnica</td>
                      <td className="py-2 px-2 text-center text-blue-600 font-bold">+0.40 pts</td>
                      <td className="py-2 px-2 text-center text-rose-600 font-bold">-0.25 pts</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50/50 border border-blue-100/50 p-3 rounded-2xl flex gap-2">
                <Info className="text-[#007A33] shrink-0 mt-0.5" size={14} />
                <p className="text-[10px] text-[#005021] leading-normal font-semibold">
                  **Auditoría**: Los empleados de TI muestran el mayor sesgo de autoevaluación (+0.48), mitigado a través de las sesiones de calibración colectiva realizadas por los Managers y RRHH.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PESTAÑA 4: GAP DE SKILLS ==================== */}
      {activeTab === 'gaps' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Fila 1: KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <CheckCircle2 size={56} className="text-[#007A33]" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <CheckCircle2 size={16} className="text-[#007A33]" />
                <span className="text-[9px] font-black uppercase tracking-wider">Índice Cobertura</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.coverageIndex}%</span>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Cumplimiento de skills requeridas</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <AlertCircle size={56} className="text-amber-600" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <AlertCircle size={16} className="text-amber-500" />
                <span className="text-[9px] font-black uppercase tracking-wider">Brechas Activas</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.totalGaps} pts</span>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Puntos de nivel por recuperar</p>
            </div>

            {/* Top déficit skill general */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden text-left col-span-2">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <ShieldAlert size={56} className="text-rose-600" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <ShieldAlert size={16} className="text-rose-500" />
                <span className="text-[9px] font-black uppercase tracking-wider">Mayor Brecha Absoluta</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-black text-slate-800">{topDeficitSkills[0]?.name || 'N/D'}</span>
                <span className="text-[8px] font-black text-rose-700 bg-rose-50 border border-rose-150 px-1.5 rounded-md uppercase">Crítica</span>
              </div>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Acumula -{topDeficitSkills[0]?.gap || 0} puntos de nivel de diferencia</p>
            </div>
          </div>

          {/* Matriz de calor y barras */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="text-left">
                  <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <span>Matriz de Competencia por Unidad (Heatmap)</span>
                    <HelpCircle size={13} className="text-slate-400 hover:text-slate-600 cursor-pointer" title="Celda muestra promedio de nivel de habilidad en la unidad. Haz clic para ver el desglose." />
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Estructura jerárquica de <span className="font-semibold text-slate-600">{selectedUnitName}</span> · Analiza fortalezas y gaps por nivel
                  </p>
                </div>
                
                <div className="flex items-center gap-3 relative">
                  <div className="flex items-center gap-0.5 mr-2">
                    <span className="w-2.5 h-2.5 bg-red-100 rounded border border-red-200" title="Bajo (<2.0)" />
                    <span className="w-2.5 h-2.5 bg-amber-100 rounded border border-amber-200" title="Medio (<3.5)" />
                    <span className="w-2.5 h-2.5 bg-emerald-100 rounded border border-emerald-200/60" title="Alto (<4.5)" />
                    <span className="w-2.5 h-2.5 bg-[#007A33] rounded" title="Experto (>=4.5)" />
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowSkillDropdown(!showSkillDropdown)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-extrabold text-[#007A33] bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100/50 transition-all shrink-0 cursor-pointer"
                    >
                      <Plus size={10} />
                      <span>Skills ({coreSkills.length})</span>
                    </button>
                    
                    {showSkillDropdown && (
                      <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 w-56 p-2.5 space-y-2">
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
                        <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 text-[10px] font-semibold text-left">
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
                        <th key={skill} className="py-2 px-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-center w-28">
                          <div className="flex items-center justify-center gap-1 bg-slate-50 border border-slate-150 rounded-lg py-1 px-1.5 shadow-xs font-extrabold">
                            <span title={skill} className="text-[10px] text-slate-700 truncate max-w-16">{skill}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCoreSkills(prev => prev.filter(s => s !== skill));
                                if (activeHeatmapCell?.skillName === skill) setActiveHeatmapCell(null);
                              }}
                              className="p-0.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-100/50 transition-all shrink-0 cursor-pointer"
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
                        <td className="py-2.5 px-3 max-w-xs text-left">
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
                              <div className={clsx(
                                "w-9 h-7 rounded-lg border flex items-center justify-center text-xs font-bold transition-all duration-200 cursor-pointer",
                                getHeatmapColor(score),
                                isSelected ? 'ring-2 ring-emerald-500 scale-105 shadow-md shadow-emerald-500/10' : ''
                              )}>
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

              {/* Detalle del empleado al pulsar celda */}
              {activeHeatmapCell && cellDetailList && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mt-4 animate-fadeIn text-left">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 flex flex-wrap items-center gap-1.5">
                        <span>Colaboradores en</span>
                        <span className="text-[#007A33] font-black">{activeHeatmapCell.skillName}</span>
                        <span>en</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-extrabold">{activeUnitName}</span>
                      </h3>
                    </div>
                    <button onClick={() => setActiveHeatmapCell(null)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-1 transition-all">Cerrar</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cellDetailList.map(emp => (
                      <div key={emp.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center gap-2">
                          <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full border border-slate-100" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{emp.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-extrabold text-slate-800">Lvl {emp.currentLevel} / {emp.requiredLevel}</p>
                          <span className={clsx(
                            "text-[8px] font-extrabold px-1.5 py-0.5 rounded-full",
                            emp.currentLevel >= emp.requiredLevel ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          )}>
                            {emp.currentLevel >= emp.requiredLevel ? 'Cubierto' : `Gap -${emp.requiredLevel - emp.currentLevel}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Listados de brechas críticos */}
            <div className="space-y-6 text-left">
              {/* TOP 5 SKILLS CON MAYOR DEFICIT */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="text-rose-500" size={16} />
                    <span>Top 5 Habilidades con Mayor Déficit</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Habilidades más desatendidas acumuladas en la organización</p>
                </div>

                <div className="divide-y divide-slate-50">
                  {topDeficitSkills.map((sk, idx) => (
                    <div key={sk.name} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{sk.name}</p>
                          <p className="text-[9px] text-slate-400 font-semibold">{sk.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-black text-rose-650 font-mono">-{sk.gap} pts</span>
                        {sk.isCritical && (
                          <span className="text-[8px] font-black text-rose-700 bg-rose-50 border border-rose-100 px-1 rounded uppercase tracking-wide">Crítica</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOP 5 ROLES CON MAYOR GAP (Señalando críticos) */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Target className="text-[#007A33]" size={16} />
                    <span>Top 5 Roles con Mayor GAP de Skills</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Puestos profesionales con el mayor déficit competencial medio</p>
                </div>

                <div className="divide-y divide-slate-50">
                  {topGappedRoles.map((role, idx) => (
                    <div key={role.name} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                        <p className="text-xs font-bold text-slate-800 truncate">{role.name}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-black text-rose-650 font-mono">-{role.avgGap} / rol</span>
                        {role.isCritical ? (
                          <span className="text-[8px] font-black text-white bg-rose-500 border border-rose-600 px-1 rounded uppercase tracking-wide animate-pulse">CRÍTICO</span>
                        ) : (
                          <span className="text-[8px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-1 rounded uppercase tracking-wide">Soporte</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PESTAÑA 5: INFORMACIÓN SOBRE UPSKILLING ==================== */}
      {activeTab === 'upskilling' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <GraduationCap size={56} className="text-[#007A33]" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <GraduationCap size={16} className="text-[#007A33]" />
                <span className="text-[9px] font-black uppercase tracking-wider">Esfuerzo Upskilling</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.totalHours}h</span>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Horas de formación realizadas</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <BookOpen size={56} className="text-[#007A33]" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <BookOpen size={16} className="text-[#007A33]" />
                <span className="text-[9px] font-black uppercase tracking-wider">Amplitud Formativa</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.amplitudeFormativa}%</span>
                <span className="text-[8px] font-black text-emerald-700 bg-emerald-50 border border-emerald-150 px-1 rounded-md uppercase">Amplio</span>
              </div>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">FTEs con al menos un curso o badge</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <TrendingUp size={56} className="text-[#007A33]" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <TrendingUp size={16} className="text-[#007A33]" />
                <span className="text-[9px] font-black uppercase tracking-wider">Mejora Competencial</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.improvedSkillsRate}%</span>
                <span className="text-[8px] font-black text-blue-700 bg-blue-50 border border-blue-150 px-1 rounded-md uppercase">+1 lvl</span>
              </div>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Alumnos que aumentaron skill nivel</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <Award size={56} className="text-[#007A33]" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Award size={16} className="text-[#007A33]" />
                <span className="text-[9px] font-black uppercase tracking-wider">Ratio Cursos/Insignias</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.avgCoursesPerEmployee}</span>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Promedio completados por FTE</p>
            </div>
          </div>

          {/* Tabla de Smart Training */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4 text-left">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <BookOpen size={16} className="text-[#007A33]" />
                <span>Smart Training Planner (Recomendador de Cursos)</span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Planes formativos recomendados automáticamente según las brechas de skills más urgentes y críticas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trainingRecommendations.map((rec) => (
                <div key={rec.skillName} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-emerald-250 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-100 uppercase">Urgente</span>
                      <span className="text-[9px] font-bold text-slate-400">{rec.duration}</span>
                    </div>
                    <h4 className="text-xs font-black text-slate-800 leading-tight">{rec.courseTitle}</h4>
                    <p className="text-[10px] text-slate-450 font-medium">Corrige la brecha en **{rec.skillName}** (Déficit del área: -{rec.accumulatedGap} pts)</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">Proyección Cobertura</p>
                      <p className="text-xs font-black text-[#007A33]">+{rec.impactEstimate}% Cobertura</p>
                    </div>
                    <button className="text-[10px] font-extrabold text-white bg-[#007A33] hover:bg-[#006028] px-3.5 py-1.5 rounded-xl transition-colors shadow-md shadow-emerald-700/10 cursor-pointer">
                      Programar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== PESTAÑA 6: MARKETPLACE Y MOVILIDAD ==================== */}
      {activeTab === 'mobility' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <Briefcase size={56} className="text-[#007A33]" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Briefcase size={16} className="text-[#007A33]" />
                <span className="text-[9px] font-black uppercase tracking-wider">Vacantes Solicitadas</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.requestedVacancies}</span>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Búsquedas activas en el perímetro</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <Award size={56} className="text-[#007A33]" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Award size={16} className="text-[#007A33]" />
                <span className="text-[9px] font-black uppercase tracking-wider">Movilidad Interna</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-black text-slate-800">{metrics.mobilityRate}%</span>
                <span className="text-[8px] font-black text-[#007A33] bg-emerald-50 border border-emerald-150 px-1 rounded-md uppercase">Apto</span>
              </div>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Candidatos con alto match ({'>'}75%)</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden col-span-2">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <ArrowUpRight size={56} className="text-blue-600" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <ArrowUpRight size={16} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-wider">Tasa Cobertura Interna</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-slate-800">45%</span>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Vacantes del marketplace cubiertas por talento propio</p>
            </div>
          </div>

          {/* Listado de Talent Mobility alerts */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4 text-left">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                <Award size={16} className="text-[#007A33]" />
                <span>Talent Mobility Intelligence (Movilidad Interna)</span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Propuestas automáticas de promoción e identificación de talento oculto basado en matching de skills</p>
            </div>

            <div className="space-y-3">
              {talentMobilityAlerts.map((alert) => (
                <div key={alert.employee.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-emerald-250 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <img src={alert.employee.avatar} alt={alert.employee.name} className="w-10 h-10 rounded-full border border-slate-100 shrink-0" />
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">{alert.employee.name}</span>
                        <span className="text-[8px] font-extrabold bg-emerald-50 text-[#007A33] px-1.5 py-0.5 rounded-full border border-emerald-100 uppercase">Alto Potencial</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{alert.employee.role} | Sobreskilling en **{alert.topSkills.join(', ')}**</p>
                      <p className="text-[9px] text-[#007A33] font-black flex items-center gap-0.5 pt-0.5">
                        <ArrowUpRight size={10} />
                        <span>Apto para promoción a vacante: {alert.bestOpportunity}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-2.5 sm:pt-0 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-black text-slate-850">{alert.matchingRate}% match</span>
                    </div>
                    <button className="text-[10px] font-extrabold text-[#007A33] hover:text-[#005021] bg-white border border-[#007A33]/25 hover:border-[#007A33]/50 rounded-xl px-3 py-1.5 transition-all cursor-pointer">
                      Ver Ficha
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== PESTAÑA 7: SUCESIÓN Y TALENTO CRÍTICO ==================== */}
      {activeTab === 'succession' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <Compass size={56} className="text-[#007A33]" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Compass size={16} className="text-[#007A33]" />
                <span className="text-[9px] font-black uppercase tracking-wider">Roles Sin Sucesor</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-black text-slate-800">15%</span>
                <span className="text-[8px] font-black text-rose-700 bg-rose-50 border border-rose-150 px-1 rounded-md uppercase">Alerta</span>
              </div>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Roles críticos sin reemplazo mapeado</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <ShieldAlert size={56} className="text-[#007A33]" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <ShieldAlert size={16} className="text-amber-500" />
                <span className="text-[9px] font-black uppercase tracking-wider">Talento en Riesgo (HiPo)</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-slate-800">3 identificados</span>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Alto potencial y alto desempeño en TI</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs relative group overflow-hidden col-span-2">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-300">
                <Award size={56} className="text-blue-700" />
              </div>
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Award size={16} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-wider">Succession Readiness Index</span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-slate-800">82%</span>
              <p className="text-[10px] text-slate-450 mt-1.5 font-medium">Aptitud media de los sucesores mapeados</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visualizador 9-Box Grid */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs text-left space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Matriz 9-Box Dinámica (Cruce Desempeño vs Potencial)</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Ubicación del talento de {selectedUnitName} para planes de sucesión e identificación de HiPo</p>
              </div>

              {/* Grid 9-Box */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-150 p-2.5 rounded-2xl relative">
                
                {/* 1. Potencial Alto, Desempeño Bajo: Enigma */}
                <div className="bg-amber-50/50 border border-amber-250 p-2.5 rounded-xl h-28 flex flex-col justify-between">
                  <span className="text-[8px] font-black text-amber-800 uppercase">Enigma</span>
                  <div className="flex flex-wrap gap-1">
                    {nineBoxData["Enigma / Gema Oculta"]?.slice(0, 2).map(u => (
                      <span key={u.id} className="text-[7.5px] font-bold px-1.5 py-0.5 bg-white border border-amber-200 rounded text-slate-700">{u.name.split(' ')[0]}</span>
                    ))}
                  </div>
                </div>

                {/* 2. Potencial Alto, Desempeño Medio: Alto Crecimiento */}
                <div className="bg-emerald-50/30 border border-emerald-200 p-2.5 rounded-xl h-28 flex flex-col justify-between">
                  <span className="text-[8px] font-black text-emerald-800 uppercase">Alto Crecimiento</span>
                  <div className="flex flex-wrap gap-1">
                    {nineBoxData["Alto Crecimiento"]?.slice(0, 2).map(u => (
                      <span key={u.id} className="text-[7.5px] font-bold px-1.5 py-0.5 bg-white border border-emerald-250 rounded text-slate-700">{u.name.split(' ')[0]}</span>
                    ))}
                  </div>
                </div>

                {/* 3. Potencial Alto, Desempeño Alto: Talento Clave/Estrella */}
                <div className="bg-[#007A33]/5 border border-[#007A33] p-2.5 rounded-xl h-28 flex flex-col justify-between">
                  <span className="text-[8px] font-black text-[#007A33] uppercase">Estrella / Clave</span>
                  <div className="flex flex-wrap gap-1">
                    {nineBoxData["Talento Clave / Estrella"]?.slice(0, 2).map(u => (
                      <span key={u.id} className="text-[7.5px] font-bold px-1.5 py-0.5 bg-[#007A33] border border-[#005021] rounded text-white">{u.name.split(' ')[0]}</span>
                    ))}
                  </div>
                </div>

                {/* 4. Potencial Medio, Desempeño Bajo: Desarrollo */}
                <div className="bg-slate-100/70 border border-slate-200 p-2.5 rounded-xl h-28 flex flex-col justify-between">
                  <span className="text-[8px] font-black text-slate-500 uppercase">D. Necesario</span>
                  <div className="flex flex-wrap gap-1">
                    {nineBoxData["Desarrollo Necesario"]?.slice(0, 2).map(u => (
                      <span key={u.id} className="text-[7.5px] font-bold px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-700">{u.name.split(' ')[0]}</span>
                    ))}
                  </div>
                </div>

                {/* 5. Potencial Medio, Desempeño Medio: Colaborador Core */}
                <div className="bg-blue-50/20 border border-blue-200 p-2.5 rounded-xl h-28 flex flex-col justify-between">
                  <span className="text-[8px] font-black text-blue-800 uppercase">Colaborador Core</span>
                  <div className="flex flex-wrap gap-1">
                    {nineBoxData["Colaborador Core"]?.slice(0, 2).map(u => (
                      <span key={u.id} className="text-[7.5px] font-bold px-1.5 py-0.5 bg-white border border-blue-250 rounded text-slate-700">{u.name.split(' ')[0]}</span>
                    ))}
                  </div>
                </div>

                {/* 6. Potencial Medio, Desempeño Alto: Profesional Clave */}
                <div className="bg-emerald-50/20 border border-emerald-150 p-2.5 rounded-xl h-28 flex flex-col justify-between">
                  <span className="text-[8px] font-black text-[#007A33] uppercase">Prof. Clave</span>
                  <div className="flex flex-wrap gap-1">
                    {nineBoxData["Profesional Clave"]?.slice(0, 2).map(u => (
                      <span key={u.id} className="text-[7.5px] font-bold px-1.5 py-0.5 bg-white border border-emerald-250 rounded text-slate-700">{u.name.split(' ')[0]}</span>
                    ))}
                  </div>
                </div>

                {/* 7. Potencial Bajo, Desempeño Bajo: Bajo Rendimiento */}
                <div className="bg-rose-50/40 border border-rose-200 p-2.5 rounded-xl h-28 flex flex-col justify-between">
                  <span className="text-[8px] font-black text-rose-700 uppercase">B. Rendimiento</span>
                  <div className="flex flex-wrap gap-1">
                    {nineBoxData["Bajo Rendimiento"]?.slice(0, 2).map(u => (
                      <span key={u.id} className="text-[7.5px] font-bold px-1.5 py-0.5 bg-white border border-rose-250 rounded text-slate-700">{u.name.split(' ')[0]}</span>
                    ))}
                  </div>
                </div>

                {/* 8. Potencial Bajo, Desempeño Medio: Eficiente */}
                <div className="bg-slate-100/50 border border-slate-200 p-2.5 rounded-xl h-28 flex flex-col justify-between">
                  <span className="text-[8px] font-black text-slate-500 uppercase">Eficiente</span>
                  <div className="flex flex-wrap gap-1">
                    {nineBoxData["Eficiente y Sólido"]?.slice(0, 2).map(u => (
                      <span key={u.id} className="text-[7.5px] font-bold px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-700">{u.name.split(' ')[0]}</span>
                    ))}
                  </div>
                </div>

                {/* 9. Potencial Bajo, Desempeño Alto: Especialista Sólido */}
                <div className="bg-emerald-50/10 border border-slate-200 p-2.5 rounded-xl h-28 flex flex-col justify-between">
                  <span className="text-[8px] font-black text-emerald-800 uppercase">Especialista S.</span>
                  <div className="flex flex-wrap gap-1">
                    {nineBoxData["Especialista Sólido"]?.slice(0, 2).map(u => (
                      <span key={u.id} className="text-[7.5px] font-bold px-1.5 py-0.5 bg-white border border-slate-300 rounded text-slate-700">{u.name.split(' ')[0]}</span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Reemplazos de Roles Críticos */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs text-left flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-800">Sucesores para Roles Críticos</h3>
                <p className="text-[10px] text-slate-400">Selecciona un puesto estratégico para auditar sus candidatos de sucesión y encaje competencial</p>
              </div>

              {/* Selector de rol crítico */}
              <div className="flex gap-1.5 flex-wrap">
                {successionPlanningData.criticalRolesList.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedCriticalRole(r.id)}
                    className={clsx(
                      "text-[9px] font-extrabold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border",
                      selectedCriticalRole === r.id
                        ? "bg-[#007A33] border-[#005021] text-white"
                        : "bg-slate-50 border-slate-250 text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    {r.title}
                  </button>
                ))}
              </div>

              {/* Lista de sucesores */}
              <div className="space-y-2.5 flex-1 pt-1.5">
                {successionPlanningData.successors.map((suc, idx) => (
                  <div key={suc.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[9px] font-black text-slate-400 w-4">{idx + 1}º</span>
                      <img src={suc.avatar} alt={suc.name} className="w-8 h-8 rounded-full border border-slate-100 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{suc.name}</p>
                        <p className="text-[9px] text-slate-450 truncate">{suc.currentRole}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-[#007A33]">{suc.matchPercent}% Match</span>
                      <p className={clsx("text-[8px] font-black px-1.5 py-0.2 rounded border uppercase tracking-wide mt-0.5", suc.tagBg)}>{suc.readiness.split(' ')[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};