/* ==========================================================================
   DASHBOARD BRAIN: Calibración de Competencias (app.js)
   Lógica reactiva con carga de datos, cálculo de métricas y ApexCharts.js
   ========================================================================== */

// --- MATRIZ DE CRITICIDAD POR ROL Y COMPETENCIA (Cajamar) ---
// Para cada rol, se calcula una partición de sus habilidades asociadas en:
// - Exactamente 6 "Críticas"
// - Hasta 18 "Primarias"
// - El resto "Secundarias"
const ROLE_SKILLS_PARTITION = {};

function initializeRoleSkillsPartition() {
  const roleSkills = {};
  
  // 1. Extraer todas las habilidades únicas reales asociadas a cada rol
  window.EVALUATIONS_DATA.forEach(d => {
    const r = d.rol_colaborador ? d.rol_colaborador.trim() : "";
    const s = d.capacidad ? d.capacidad.trim() : "";
    if (r && s) {
      if (!roleSkills[r]) roleSkills[r] = new Set();
      roleSkills[r].add(s);
    }
  });

  // Palabras clave prioritarias para ordenar y determinar las habilidades "Core" técnicas
  const corePriorityKeywords = [
    'metodología', 'auditoría', 'negocio', 'operacional', 'ética', 'cultura', 'planificación',
    'contabilidad', 'riesgo', 'ciberseguridad', 'tecnológico', 'dato', 'analítica', 'ia', 'inteligencia'
  ];

  function getSkillWeight(skillName) {
    const s = skillName.toLowerCase();
    let weight = 100;
    corePriorityKeywords.forEach((keyword, idx) => {
      if (s.includes(keyword)) {
        weight = Math.min(weight, idx); // Menor peso = mayor relevancia
      }
    });
    return weight;
  }

  // 2. Particionar habilidades de cada rol de forma precisa
  Object.keys(roleSkills).forEach(r => {
    const sortedSkills = Array.from(roleSkills[r]).sort((a, b) => {
      const wA = getSkillWeight(a);
      const wB = getSkillWeight(b);
      if (wA !== wB) return wA - wB; // Priorizar según palabras clave
      return a.localeCompare(b);    // Desempate alfabético
    });

    // Partición exacta: 6 críticas, hasta 18 primarias y el resto secundarias
    const criticas = sortedSkills.slice(0, 6);
    const primarias = sortedSkills.slice(6, 24);
    const secundarias = sortedSkills.slice(24);

    ROLE_SKILLS_PARTITION[r] = {
      criticas: criticas,
      primarias: primarias,
      secundarias: secundarias
    };
  });
  
  // Sincronizar el campo criticidad en el dataset global en memoria
  window.EVALUATIONS_DATA.forEach(row => {
    const r = row.rol_colaborador ? row.rol_colaborador.trim() : "";
    const s = row.capacidad ? row.capacidad.trim() : "";
    const part = ROLE_SKILLS_PARTITION[r];
    if (part) {
      if (part.criticas.includes(s)) row.criticidad = "Crítica";
      else if (part.primarias.includes(s)) row.criticidad = "Primaria";
      else row.criticidad = "Secundaria";
    } else {
      row.criticidad = "Secundaria";
    }
  });
  
  console.log("Matriz de criticidad inicializada para todos los roles con precisión.");
}

// Mapeo dinámico de categoría por rol y skill
function getSkillCategory(roleName, skillName) {
  const r = roleName ? roleName.trim() : "";
  const s = skillName ? skillName.trim() : "";
  const part = ROLE_SKILLS_PARTITION[r];
  if (!part) return 'secundarias'; // Fallback por defecto
  
  if (part.criticas.includes(s)) return 'criticas';
  if (part.primarias.includes(s)) return 'primarias';
  return 'secundarias';
}

// --- ESTADO GLOBAL DE LA APLICACIÓN ---
const APP_STATE = {
  currentCohort: "1",          // Cohorte activa: 1, 2, 3, 4 o 5
  activeTab: "tab-individual", // Pestaña activa (Detalle Individual por defecto)
  colabSearchQuery: "",        // Búsqueda de colaborador global
  selectedColabId: null,       // Colaborador seleccionado para la ficha
  chartInstances: {},          // Instancias activas de ApexCharts
  selectedSkillCategory: "criticas", // Categoría activa para el ranking de brechas (Críticas por defecto)
  
  // Base de Datos y Edición multitabla
  activeSubTab: "subtab-evaluaciones", // subtab-evaluaciones, subtab-colaboradores, subtab-roles
  pageSize: 100,
  
  // Sub-tab Evaluaciones
  evalSearchQuery: "",
  evalShowAll: false,
  evalPage: 1,
  
  // Sub-tab Colaboradores
  colabSearchQueryDb: "",
  colabPage: 1,
  
  // Sub-tab Roles
  rolesSearchQuery: "",
  rolesPage: 1
};

// --- INICIALIZADOR DE LA APLICACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("SkillCalibrate initialized. Loaded records:", window.EVALUATIONS_DATA ? window.EVALUATIONS_DATA.length : 0);

  if (!window.EVALUATIONS_DATA || window.EVALUATIONS_DATA.length === 0) {
    alert("Error: No se han podido cargar los datos de evaluación.");
    return;
  }

  // 1. Inicializar la matriz de criticidad por rol y habilidad en mock data
  initializeRoleSkillsPartition();

  // 2. Vincular los event listeners de los controles
  setupEventListeners();

  // 3. Cargar y renderizar la cohorte activa por defecto
  updateDashboard();
});

// --- VINCULACIÓN DE EVENTOS (LISTENERS) ---
function setupEventListeners() {
  // A. Selector de Cohorte
  const cohortSelector = document.getElementById("cohort-selector");
  if (cohortSelector) {
    cohortSelector.addEventListener("change", (e) => {
      APP_STATE.currentCohort = e.target.value;
      updateDashboard();
    });
  }

  // B. Navegación por Pestañas (Tabs)
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      
      // Quitar clases activas previas
      tabButtons.forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

      // Activar la nueva pestaña
      btn.classList.add("active");
      const targetContent = document.getElementById(tabId);
      if (targetContent) targetContent.classList.add("active");

      APP_STATE.activeTab = tabId;
      console.log("Changed tab to:", tabId);
      
      // Renderizar los gráficos específicos de la pestaña seleccionada para evitar lag de carga
      renderActiveTabCharts();
    });
  });

  // C. Buscador de Colaborador (Global Sidebar)
  const colabSearch = document.getElementById("colab-search");
  if (colabSearch) {
    colabSearch.addEventListener("input", (e) => {
      const query = e.target.value.trim().toUpperCase();
      APP_STATE.colabSearchQuery = query;

      // Si coincide exactamente con un colaborador del dataset completo, abrir su ficha
      const colabExists = window.EVALUATIONS_DATA.some(d => d.id_colaborador.toUpperCase() === query);
      if (colabExists) {
        openColabModal(query);
      }
    });
  }



  // E. Cerrar Ficha/Modal de Colaborador
  const btnCloseModal = document.getElementById("btn-close-modal");
  const modalOverlay = document.getElementById("colab-details-modal");
  if (btnCloseModal && modalOverlay) {
    const closeModal = () => {
      modalOverlay.classList.remove("active");
      APP_STATE.selectedColabId = null;
      
      // Limpiar fila activa en la tabla
      document.querySelectorAll("#colab-table-body tr").forEach(tr => tr.classList.remove("active-row"));
    };
    
    btnCloseModal.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // F. Buscador en la tabla de la Pestaña 3
  const tableSearch = document.getElementById("colab-table-search");
  if (tableSearch) {
    tableSearch.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      const rows = document.querySelectorAll("#colab-table-body tr");
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        if (text.includes(query)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  }

  // G. Botones de filtrado de categoría de habilidades
  const categoryButtons = document.querySelectorAll(".filter-tab-btn");
  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      APP_STATE.selectedSkillCategory = btn.getAttribute("data-category");
      console.log("Changed skill category to:", APP_STATE.selectedSkillCategory);
      renderChartCriticalGaps();
    });
  });

  // H. Eventos de la pestaña BBDD y Edición (Multitab Excel-Style)
  
  // Cambio de sub-pestaña interna
  const subTabButtons = document.querySelectorAll(".sub-tab-btn");
  subTabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      subTabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      APP_STATE.activeSubTab = btn.getAttribute("data-subtab");
      console.log("Changed subtab to:", APP_STATE.activeSubTab);
      renderDbTables();
    });
  });

  // --- SUBTAB A: EVALUACIONES EVENTOS ---
  const btnOpenEvalForm = document.getElementById("btn-open-eval-form");
  const btnCancelEvalAdd = document.getElementById("btn-cancel-eval-add");
  const addEvalFormPanel = document.getElementById("add-eval-form-panel");

  if (btnOpenEvalForm && addEvalFormPanel) {
    btnOpenEvalForm.addEventListener("click", () => {
      addEvalFormPanel.style.display = addEvalFormPanel.style.display === "none" ? "block" : "none";
    });
  }

  if (btnCancelEvalAdd && addEvalFormPanel) {
    btnCancelEvalAdd.addEventListener("click", () => {
      addEvalFormPanel.style.display = "none";
    });
  }

  // Guardar Evaluación
  const btnSaveEvalRecord = document.getElementById("btn-save-eval-record");
  if (btnSaveEvalRecord) {
    btnSaveEvalRecord.addEventListener("click", () => {
      const cId = document.getElementById("add-eval-colab-id").value.trim().toUpperCase();
      const cRole = document.getElementById("add-eval-colab-role").value.trim();
      const mId = document.getElementById("add-eval-manager-id").value.trim().toUpperCase();
      const sName = document.getElementById("add-eval-skill-name").value.trim();

      if (!cId || !cRole || !mId || !sName) {
        alert("Por favor, rellena todos los campos para añadir la evaluación.");
        return;
      }

      const reqStr = document.getElementById("add-eval-nivel-req").value;
      const autoStr = document.getElementById("add-eval-nivel-auto").value;
      const respStr = document.getElementById("add-eval-nivel-resp").value;
      const levelsMap = { "Básico": 1, "Intermedio": 2, "Avanzado": 3, "Experto": 4 };

      const newRec = {
        id_responsible: mId,
        id_colaborador: cId,
        rol_colaborador: cRole,
        capacidad: sName,
        criticidad: "",
        nivel_requerido_str: reqStr,
        nivel_requerido_num: levelsMap[reqStr] || 2,
        autoevaluacion_str: autoStr,
        autoevaluacion_num: levelsMap[autoStr] || 2,
        revision_responsable_str: respStr,
        revision_responsable_num: levelsMap[respStr] || 2,
        brecha: (levelsMap[respStr] || 2) - (levelsMap[reqStr] || 2),
        coincidencia: autoStr === respStr ? "Coinciden" : (levelsMap[autoStr] < levelsMap[respStr] ? "Autoevaluación baja" : "Autoevaluación alta")
      };

      window.EVALUATIONS_DATA.unshift(newRec);
      initializeRoleSkillsPartition();

      // Limpiar y ocultar
      document.getElementById("add-eval-colab-id").value = "";
      document.getElementById("add-eval-colab-role").value = "";
      document.getElementById("add-eval-manager-id").value = "";
      document.getElementById("add-eval-skill-name").value = "";
      if (addEvalFormPanel) addEvalFormPanel.style.display = "none";

      alert(`Evaluación para ${cId} guardada con éxito.`);
      updateDashboard();
    });
  }

  // Checkbox show all
  const chkShowAll = document.getElementById("chk-show-all-db");
  if (chkShowAll) {
    chkShowAll.addEventListener("change", (e) => {
      APP_STATE.evalShowAll = e.target.checked;
      APP_STATE.evalPage = 1;
      renderDbEvaluationsTable();
    });
  }

  // Search
  const evalSearch = document.getElementById("eval-table-search");
  if (evalSearch) {
    evalSearch.addEventListener("input", (e) => {
      APP_STATE.evalSearchQuery = e.target.value;
      APP_STATE.evalPage = 1;
      renderDbEvaluationsTable();
    });
  }

  // Pagination Prev/Next
  const btnEvalPrev = document.getElementById("btn-eval-prev-page");
  if (btnEvalPrev) {
    btnEvalPrev.addEventListener("click", () => {
      if (APP_STATE.evalPage > 1) {
        APP_STATE.evalPage--;
        renderDbEvaluationsTable();
      }
    });
  }

  const btnEvalNext = document.getElementById("btn-eval-next-page");
  if (btnEvalNext) {
    btnEvalNext.addEventListener("click", () => {
      APP_STATE.evalPage++;
      renderDbEvaluationsTable();
    });
  }

  // --- SUBTAB B: COLABORADORES EVENTOS ---
  const btnOpenColabForm = document.getElementById("btn-open-colab-form");
  const btnCancelColabAdd = document.getElementById("btn-cancel-colab-add");
  const addColabFormPanel = document.getElementById("add-colab-form-panel");

  if (btnOpenColabForm && addColabFormPanel) {
    btnOpenColabForm.addEventListener("click", () => {
      addColabFormPanel.style.display = addColabFormPanel.style.display === "none" ? "block" : "none";
    });
  }

  if (btnCancelColabAdd && addColabFormPanel) {
    btnCancelColabAdd.addEventListener("click", () => {
      addColabFormPanel.style.display = "none";
    });
  }

  // Guardar Colaborador
  const btnSaveColabRecord = document.getElementById("btn-save-colab-record");
  if (btnSaveColabRecord) {
    btnSaveColabRecord.addEventListener("click", () => {
      const cId = document.getElementById("add-new-colab-id").value.trim().toUpperCase();
      const cRole = document.getElementById("add-new-colab-role").value.trim();
      const mId = document.getElementById("add-new-colab-manager").value.trim().toUpperCase();

      if (!cId || !cRole || !mId) {
        alert("Por favor, rellena todos los campos del colaborador.");
        return;
      }

      // Evitar duplicados
      const duplicate = window.EVALUATIONS_DATA.some(row => row.id_colaborador === cId);
      if (duplicate) {
        alert(`Ya existe un colaborador con el ID ${cId}.`);
        return;
      }

      // Determinar qué habilidades asignarle inicialmente
      const assignedSkills = new Set();
      window.EVALUATIONS_DATA.forEach(row => {
        if (row.rol_colaborador.toLowerCase() === cRole.toLowerCase()) {
          assignedSkills.add(JSON.stringify({
            skill: row.capacidad,
            reqStr: row.nivel_requerido_str,
            reqNum: row.nivel_requerido_num
          }));
        }
      });

      const finalSkills = Array.from(assignedSkills).map(s => JSON.parse(s));
      if (finalSkills.length === 0) {
        // Fallback a habilidades predefinidas
        DEFAULT_CRITICAL_SKILLS.forEach(skill => {
          finalSkills.push({
            skill: skill,
            reqStr: "Intermedio",
            reqNum: 2
          });
        });
      }

      // Insertar las habilidades iniciales
      finalSkills.forEach(item => {
        const newRecord = {
          id_responsible: mId,
          id_colaborador: cId,
          rol_colaborador: cRole,
          capacidad: item.skill,
          criticidad: "",
          nivel_requerido_str: item.reqStr,
          nivel_requerido_num: item.reqNum,
          autoevaluacion_str: "Intermedio",
          autoevaluacion_num: 2,
          revision_responsable_str: "Intermedio",
          revision_responsable_num: 2,
          brecha: 2 - item.reqNum,
          coincidencia: "Coinciden"
        };
        window.EVALUATIONS_DATA.unshift(newRecord);
      });

      initializeRoleSkillsPartition();

      // Limpiar y ocultar
      document.getElementById("add-new-colab-id").value = "";
      document.getElementById("add-new-colab-role").value = "";
      document.getElementById("add-new-colab-manager").value = "";
      if (addColabFormPanel) addColabFormPanel.style.display = "none";

      alert(`Colaborador ${cId} guardado con éxito e inicializado con ${finalSkills.length} habilidades.`);
      updateDashboard();
    });
  }

  // Search
  const colabSearchDb = document.getElementById("colab-db-search");
  if (colabSearchDb) {
    colabSearchDb.addEventListener("input", (e) => {
      APP_STATE.colabSearchQueryDb = e.target.value;
      APP_STATE.colabPage = 1;
      renderDbCollaboratorsTable();
    });
  }

  // Pagination
  const btnColabPrev = document.getElementById("btn-colab-prev-page");
  if (btnColabPrev) {
    btnColabPrev.addEventListener("click", () => {
      if (APP_STATE.colabPage > 1) {
        APP_STATE.colabPage--;
        renderDbCollaboratorsTable();
      }
    });
  }

  const btnColabNext = document.getElementById("btn-colab-next-page");
  if (btnColabNext) {
    btnColabNext.addEventListener("click", () => {
      APP_STATE.colabPage++;
      renderDbCollaboratorsTable();
    });
  }

  // --- SUBTAB C: ROLES Y CAPACIDADES EVENTOS ---
  const btnOpenRoleForm = document.getElementById("btn-open-role-form");
  const btnCancelRoleAdd = document.getElementById("btn-cancel-role-add");
  const addRoleFormPanel = document.getElementById("add-role-form-panel");

  if (btnOpenRoleForm && addRoleFormPanel) {
    btnOpenRoleForm.addEventListener("click", () => {
      addRoleFormPanel.style.display = addRoleFormPanel.style.display === "none" ? "block" : "none";
    });
  }

  if (btnCancelRoleAdd && addRoleFormPanel) {
    btnCancelRoleAdd.addEventListener("click", () => {
      addRoleFormPanel.style.display = "none";
    });
  }

  // Guardar Requerimiento de Rol
  const btnSaveRoleRecord = document.getElementById("btn-save-role-record");
  if (btnSaveRoleRecord) {
    btnSaveRoleRecord.addEventListener("click", () => {
      const rName = document.getElementById("add-new-role-name").value.trim();
      const sName = document.getElementById("add-new-role-skill").value.trim();
      const reqStr = document.getElementById("add-new-role-req").value;

      if (!rName || !sName) {
        alert("Por favor, rellena todos los campos del requerimiento.");
        return;
      }

      const levelsMap = { "Básico": 1, "Intermedio": 2, "Avanzado": 3, "Experto": 4 };
      const reqNum = levelsMap[reqStr] || 2;

      // Buscar colaboradores existentes con este puesto
      const colabsInRole = new Set();
      window.EVALUATIONS_DATA.forEach(row => {
        if (row.rol_colaborador.toLowerCase() === rName.toLowerCase()) {
          colabsInRole.add(row.id_colaborador);
        }
      });

      const listColabs = Array.from(colabsInRole);
      if (listColabs.length > 0) {
        // Asignar o actualizar esta habilidad en todos ellos
        listColabs.forEach(colabId => {
          const alreadyHas = window.EVALUATIONS_DATA.some(row => 
            row.id_colaborador === colabId && row.capacidad.toLowerCase() === sName.toLowerCase()
          );

          if (!alreadyHas) {
            const managerRow = window.EVALUATIONS_DATA.find(row => row.id_colaborador === colabId);
            const managerId = managerRow ? managerRow.id_responsible : "A01";

            const newRecord = {
              id_responsible: managerId,
              id_colaborador: colabId,
              rol_colaborador: rName,
              capacidad: sName,
              criticidad: "",
              nivel_requerido_str: reqStr,
              nivel_requerido_num: reqNum,
              autoevaluacion_str: "Intermedio",
              autoevaluacion_num: 2,
              revision_responsable_str: "Intermedio",
              revision_responsable_num: 2,
              brecha: 2 - reqNum,
              coincidencia: "Coinciden"
            };
            window.EVALUATIONS_DATA.unshift(newRecord);
          } else {
            // Actualizar requerimiento
            window.EVALUATIONS_DATA.forEach(row => {
              if (row.id_colaborador === colabId && row.capacidad.toLowerCase() === sName.toLowerCase()) {
                row.nivel_requerido_str = reqStr;
                row.nivel_requerido_num = reqNum;
                row.brecha = (row.revision_responsable_num || 2) - reqNum;
              }
            });
          }
        });
      } else {
        // Registrar requerimiento con colaborador plantilla
        const newRecord = {
          id_responsible: "A01",
          id_colaborador: "PLANTILLA_" + rName.replace(/\s+/g, "_").toUpperCase(),
          rol_colaborador: rName,
          capacidad: sName,
          criticidad: "",
          nivel_requerido_str: reqStr,
          nivel_requerido_num: reqNum,
          autoevaluacion_str: "Intermedio",
          autoevaluacion_num: 2,
          revision_responsable_str: "Intermedio",
          revision_responsable_num: 2,
          brecha: 2 - reqNum,
          coincidencia: "Coinciden"
        };
        window.EVALUATIONS_DATA.unshift(newRecord);
      }

      initializeRoleSkillsPartition();

      // Limpiar y ocultar
      document.getElementById("add-new-role-name").value = "";
      document.getElementById("add-new-role-skill").value = "";
      if (addRoleFormPanel) addRoleFormPanel.style.display = "none";

      alert(`Requerimiento de '${sName}' guardado para el rol '${rName}'.`);
      updateDashboard();
    });
  }

  // Search
  const rolesSearchDb = document.getElementById("role-db-search");
  if (rolesSearchDb) {
    rolesSearchDb.addEventListener("input", (e) => {
      APP_STATE.rolesSearchQuery = e.target.value;
      APP_STATE.rolesPage = 1;
      renderDbRolesTable();
    });
  }

  // Pagination
  const btnRolesPrev = document.getElementById("btn-roles-prev-page");
  if (btnRolesPrev) {
    btnRolesPrev.addEventListener("click", () => {
      if (APP_STATE.rolesPage > 1) {
        APP_STATE.rolesPage--;
        renderDbRolesTable();
      }
    });
  }

  const btnRolesNext = document.getElementById("btn-roles-next-page");
  if (btnRolesNext) {
    btnRolesNext.addEventListener("click", () => {
      APP_STATE.rolesPage++;
      renderDbRolesTable();
    });
  }
}

// --- ACTUALIZACIÓN GLOBAL DEL DASHBOARD ---
function updateDashboard() {
  console.log("Updating dashboard for cohort:", APP_STATE.currentCohort);

  // 1. Obtener la información básica de la cohorte
  const cohortInfo = getCohortDetails();
  
  // 2. Actualizar textos en la cabecera
  document.getElementById("cohort-title").textContent = `Cohorte: ${cohortInfo.name}`;
  document.getElementById("cohort-description").textContent = cohortInfo.desc;

  // 3. Procesar y filtrar datos para la cohorte seleccionada
  const filteredData = getCohortFilteredData();
  const uniqueColabs = Array.from(new Set(filteredData.map(d => d.id_colaborador)));

  // 4. Calcular métricas clave (KPIs)
  const totalEvals = filteredData.length;
  const totalColabs = uniqueColabs.length;

  const coincidenceEvals = filteredData.filter(d => d.coincidencia === "Coinciden").length;
  const coincidencePct = totalEvals > 0 ? ((coincidenceEvals / totalEvals) * 100).toFixed(0) + "%" : "0%";

  // Sesgo General = promedio de (Manager - Auto)
  let sumBias = 0;
  let countBias = 0;
  filteredData.forEach(d => {
    if (d.revision_responsable_num !== null && d.autoevaluacion_num !== null) {
      sumBias += (d.revision_responsable_num - d.autoevaluacion_num);
      countBias++;
    }
  });
  const avgBias = countBias > 0 ? (sumBias / countBias).toFixed(2) : "0.00";

  // Rellenar las tarjetas de estadísticas
  document.getElementById("stat-colabs").textContent = totalColabs;
  document.getElementById("stat-evals").textContent = totalEvals;
  
  const coincidenceEl = document.getElementById("stat-coincidence");
  coincidenceEl.textContent = coincidencePct;
  
  const biasEl = document.getElementById("stat-bias");
  biasEl.textContent = avgBias;
  
  // Colorear el Sesgo según sea positivo o negativo
  biasEl.className = "stat-value";
  if (parseFloat(avgBias) > 0.15) {
    biasEl.classList.add("text-emerald"); // Sesgo benevolente
  } else if (parseFloat(avgBias) < -0.15) {
    biasEl.classList.add("gap-negative"); // Sesgo estricto
  }

  // 5. Destruir gráficos previos para evitar fugas de memoria o solapamiento
  destroyAllCharts();

  // 6. Cargar los gráficos de la pestaña actualmente activa
  renderActiveTabCharts();
}

// --- DESTRUIR GRÁFICOS ACTIVOS ---
function destroyAllCharts() {
  Object.keys(APP_STATE.chartInstances).forEach(key => {
    if (APP_STATE.chartInstances[key]) {
      try {
        APP_STATE.chartInstances[key].destroy();
      } catch (err) {
        console.error("Error destroying chart:", key, err);
      }
      APP_STATE.chartInstances[key] = null;
    }
  });
  APP_STATE.chartInstances = {};
}

// --- RENDERIZADO REACTIVO SEGÚN PESTAÑA ---
function renderActiveTabCharts() {
  const tab = APP_STATE.activeTab;
  console.log("Rendering charts for tab:", tab);

  if (tab === "tab-evaluadores") {
    renderChartEvaluatorMatrix(); // Nuevo gráfico de matriz de calibración de evaluadores
    renderChartBiasManager();
    renderChartCoincidenceManager();
    renderChartScatterOutliers(); 
    renderChartHeatmapManager();
  } else if (tab === "tab-cohorte") {
    renderChartRadarCohort();
    renderChartCriticalGaps();   // Gráfico de ranking filtrado por categoría movido aquí
    renderChartDistributionLevels();
  } else if (tab === "tab-individual") {
    renderChartColabDistribution(); // Nuevo gráfico de distribución unidimensional de manager
    renderChartColabAlignment(); // Nuevo gráfico de alineamiento individual
    renderColabsTable();
  } else if (tab === "tab-bbdd") {
    renderDbTables();             // Nueva visualización multitabla BBDD editable
  }
}

// --- INFORMACIÓN DE LAS COHORTES ---
function getCohortDetails() {
  const details = {
    "1": { name: "Auditor Asistente", desc: "Calibración del grupo de Auditores Asistentes. Foco: Asimilación de metodologías y fundamentos." },
    "2": { name: "Auditor Senior", desc: "Calibración del grupo de Auditores Seniors. Foco: Gestión técnica avanzada, análisis y criterio." },
    "3": { name: "Project Manager", desc: "Calibración de Jefes de Proyecto. Foco: Gestión de proyectos de auditoría, liderazgo y negociación." },
    "4": { name: "Todos los Supervisores", desc: "Calibración agregada de Supervisores de Riesgos y TI. Foco: Supervisión experta y gobierno del dato." },
    "5": { name: "Todos los Directores", desc: "Calibración agregada de Directores de Estrategia, Riesgos y Asesoramiento. Foco: Liderazgo estratégico." }
  };
  return details[APP_STATE.currentCohort] || { name: "Desconocida", desc: "Sin descripción" };
}

// --- FILTRADO DE DATOS POR COHORTE ---
function getCohortFilteredData() {
  const cohort = APP_STATE.currentCohort;
  return window.EVALUATIONS_DATA.filter(rec => {
    const rol = rec.rol_colaborador.toLowerCase();
    if (cohort === "1") return rol.includes("asistente");
    if (cohort === "2") return rol.includes("senior");
    if (cohort === "3") return (rol.includes("jefe de proyecto") || rol.includes("project manager"));
    if (cohort === "4") return rol.includes("supervisor");
    if (cohort === "5") return (rol.includes("director") || rol.includes("directora"));
    return false;
  });
}

// ==========================================================================
// RENDERIZADO DE GRÁFICOS CON APEXCHARTS.JS
// ==========================================================================

/* --------------------------------------------------------------------------
   NUEVO GRÁFICO: MATRIZ DE CALIBRACIÓN DE EVALUADORES (2D ALINEAMIENTO VS SESGO)
   -------------------------------------------------------------------------- */
function renderChartEvaluatorMatrix() {
  const data = getCohortFilteredData();
  
  // 1. Agrupar calificaciones por Responsable (Manager)
  const managerMap = {};
  data.forEach(d => {
    const m = d.id_responsible;
    if (m && d.revision_responsable_num !== null && d.autoevaluacion_num !== null) {
      if (!managerMap[m]) {
        managerMap[m] = {
          id: m,
          respSum: 0, respCount: 0,
          autoSum: 0, autoCount: 0
        };
      }
      managerMap[m].respSum += d.revision_responsable_num;
      managerMap[m].respCount++;
      managerMap[m].autoSum += d.autoevaluacion_num;
      managerMap[m].autoCount++;
    }
  });

  const managersList = Object.values(managerMap).map(m => {
    const avgResp = m.respCount > 0 ? (m.respSum / m.respCount) : 0;
    const avgAuto = m.autoCount > 0 ? (m.autoSum / m.autoCount) : 0;
    const avgBias = avgResp - avgAuto;
    return {
      id: m.id,
      x: parseFloat(avgResp.toFixed(2)),
      y: parseFloat(avgBias.toFixed(2))
    };
  });

  if (managersList.length === 0) {
    const container = document.getElementById("chart-evaluator-matrix");
    if (container) container.innerHTML = "<div class='no-data-msg'>No hay datos suficientes para generar la matriz de calibración.</div>";
    return;
  }

  // Mapeo estético de colores por responsable
  const managerColorsMap = {
    "A01": "hsl(217, 91%, 60%)",  // Blue (Cajamar)
    "A02": "hsl(262, 83%, 68%)",  // Violet
    "A03": "hsl(150, 84%, 40%)",  // Emerald Green
    "A04": "hsl(38, 92%, 50%)",   // Amber
    "A05": "hsl(355, 78%, 56%)",  // Crimson
    "A06": "hsl(180, 70%, 45%)",  // Teal
    "A07": "hsl(310, 60%, 55%)",  // Pink
    "A08": "hsl(20, 85%, 50%)",   // Orange
    "A09": "hsl(290, 50%, 45%)",  // Purple
    "A10": "hsl(100, 60%, 40%)",  // Olive Green
  };
  
  function getManagerColor(managerId) {
    return managerColorsMap[managerId] || "hsl(215, 20%, 45%)";
  }

  // 2. Preparar datos de las series
  const seriesData = managersList.map(m => ({
    x: m.x,
    y: m.y,
    fillColor: getManagerColor(m.id),
    id: m.id
  }));

  // Calcular límites dinámicos de Y para que quede centrado
  const maxAbsBias = Math.max(...managersList.map(m => Math.abs(m.y)), 0.2);
  let limitY = Math.ceil(maxAbsBias * 4) / 4; // Redondea al 0.25 más cercano
  limitY = Math.max(0.5, limitY); // Mínimo de 0.5 de desviación

  const options = {
    series: [{
      name: 'Responsables',
      data: seriesData
    }],
    chart: {
      type: 'scatter',
      height: 320,
      foreColor: '#94a3b8',
      toolbar: { show: false },
      background: 'transparent',
      zoom: {
        enabled: false // Evita desaparición de puntos al hacer scroll
      }
    },
    colors: ['hsl(217, 91%, 60%)'],
    markers: {
      size: 9,
      strokeWidth: 2,
      strokeColor: '#090d16',
      fillOpacity: 0.9,
      hover: { size: 12 }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, opt) {
        const dp = opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex];
        return dp ? `Resp. ${dp.id}` : '';
      },
      style: {
        fontSize: '11px',
        fontFamily: 'Inter',
        fontWeight: '600',
        colors: ['#ffffff'] // Texto blanco puro sin fondo
      },
      background: {
        enabled: false // Quita el recuadro de fondo por completo
      },
      offsetY: -10
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } }
    },
    xaxis: {
      min: 0.8,
      max: 4.2,
      tickAmount: 4,
      title: {
        text: 'Calificación Promedio Asignada (Manager)',
        style: { color: '#94a3b8', fontFamily: 'Inter', fontWeight: 500 }
      },
      labels: {
        style: { colors: '#94a3b8' },
        formatter: function (val) {
          const r = Math.round(val);
          const lbls = ["", "Básico (1)", "Intermedio (2)", "Avanzado (3)", "Experto (4)"];
          if (val % 1 === 0) return lbls[r] || val.toFixed(1);
          return val.toFixed(1);
        }
      }
    },
    yaxis: {
      min: -limitY,
      max: limitY,
      title: {
        text: 'Sesgo Promedio (Manager − Colaborador)',
        style: { color: '#94a3b8', fontFamily: 'Inter', fontWeight: 500 }
      },
      labels: {
        style: { colors: '#94a3b8' },
        formatter: function (val) {
          if (val === 0) return "0 (Alineado)";
          return (val > 0 ? "+" : "") + val.toFixed(2);
        }
      }
    },
    annotations: {
      xaxis: [{
        x: 2.5,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        strokeDashArray: 4
      }],
      yaxis: [{
        y: 0,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 2,
        strokeDashArray: 0
      }]
    },
    tooltip: {
      theme: 'dark',
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const dp = seriesData[dataPointIndex];
        if (!dp) return '';
        const diff = dp.y;
        let diffText = "";
        if (diff > 0) {
          diffText = `<span class="text-emerald" style="font-weight:bold;">Resp. ${dp.id} es benevolente (+${diff.toFixed(2)} vs Auto)</span>`;
        } else if (diff < 0) {
          diffText = `<span class="gap-negative" style="font-weight:bold;">Resp. ${dp.id} es estricto (${diff.toFixed(2)} vs Auto)</span>`;
        } else {
          diffText = `<span class="text-emerald" style="font-weight:bold;">Alineación perfecta con su equipo</span>`;
        }
        return `
          <div style="padding: 12px 14px; background: rgba(13, 20, 35, 0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; line-height: 1.4; font-family: Inter;">
            <div style="font-weight:bold; font-size:13px; color:#f1f5f9; font-family: Outfit; margin-bottom:6px;">Evaluador: Responsable ${dp.id}</div>
            <div style="color:#94a3b8; font-size:11px; margin-bottom:4px;">Calificación Media Asignada: <b style="color:#f1f5f9;">${dp.x.toFixed(2)}</b></div>
            <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px; font-size:12px;">
              Sesgo Medio: ${diffText}
            </div>
          </div>
        `;
      }
    }
  };

  const container = document.getElementById("chart-evaluator-matrix");
  if (container) {
    container.innerHTML = "";
    const chart = new ApexCharts(container, options);
    chart.render();
    APP_STATE.chartInstances['evaluator-matrix'] = chart;
  }
}

/* --------------------------------------------------------------------------
   GRÁFICO 1: SESGO DE EVALUACIÓN POR RESPONSABLE (BARRAS HORIZONTALES DIVERGENTES)
   -------------------------------------------------------------------------- */
function renderChartBiasManager() {
  const data = getCohortFilteredData();
  
  // Agrupar brecha (Revision - Auto) por ID RESPONSIBLE
  const managerData = {};
  data.forEach(d => {
    if (d.id_responsible && d.revision_responsable_num !== null && d.autoevaluacion_num !== null) {
      if (!managerData[d.id_responsible]) {
        managerData[d.id_responsible] = { sum: 0, count: 0 };
      }
      managerData[d.id_responsible].sum += (d.revision_responsable_num - d.autoevaluacion_num);
      managerData[d.id_responsible].count++;
    }
  });

  const categories = [];
  const biasValues = [];

  Object.keys(managerData)
    .sort((a, b) => (managerData[a].sum / managerData[a].count) - (managerData[b].sum / managerData[b].count))
    .forEach(m => {
      categories.push(`Resp. ${m}`);
      biasValues.push(parseFloat((managerData[m].sum / managerData[m].count).toFixed(2)));
    });

  const options = {
    series: [{
      name: 'Sesgo Medio (Manager - Colaborador)',
      data: biasValues
    }],
    chart: {
      type: 'bar',
      height: 320,
      foreColor: '#94a3b8',
      toolbar: { show: false },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        colors: {
          ranges: [{
            from: -10,
            to: -0.01,
            color: 'hsl(355, 78%, 56%)' // Rojo: Estricto
          }, {
            from: 0,
            to: 10,
            color: 'hsl(150, 84%, 40%)' // Verde: Benevolente
          }]
        },
        columnWidth: '80%',
        horizontal: true
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return (val > 0 ? '+' : '') + val;
      },
      style: {
        colors: ['#fff'],
        fontSize: '11px',
        fontFamily: 'Inter'
      }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      xaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: categories,
      title: { text: 'Sesgo (Puntos en Escala 1-4)', style: { color: '#94a3b8' } },
      labels: {
        formatter: function (val) {
          return val.toFixed(1);
        }
      }
    },
    yaxis: {
      title: { text: 'Evaluador (Manager)', style: { color: '#94a3b8' } }
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: function (val) {
          if (val > 0) return `Califica en promedio +${val} por encima del colaborador (Benevolente)`;
          if (val < 0) return `Califica en promedio ${val} por debajo del colaborador (Estricto)`;
          return "Acuerdo perfecto promedio";
        }
      }
    }
  };

  const container = document.getElementById("chart-bias-manager");
  if (container) {
    container.innerHTML = "";
    const chart = new ApexCharts(container, options);
    chart.render();
    APP_STATE.chartInstances['bias-manager'] = chart;
  }
}

/* --------------------------------------------------------------------------
   GRÁFICO 2: DISTRIBUCIÓN DEL GRADO DE COINCIDENCIA POR RESPONSABLE (BAR 100%)
   -------------------------------------------------------------------------- */
function renderChartCoincidenceManager() {
  const data = getCohortFilteredData();
  
  // Agrupar las categorías por ID RESPONSIBLE
  const managerData = {};
  data.forEach(d => {
    if (d.id_responsible) {
      if (!managerData[d.id_responsible]) {
        managerData[d.id_responsible] = { coinciden: 0, baja: 0, alta: 0, total: 0 };
      }
      
      if (d.coincidencia === "Coinciden") managerData[d.id_responsible].coinciden++;
      else if (d.coincidencia === "Autoevaluación baja") managerData[d.id_responsible].baja++;
      else if (d.coincidencia === "Autoevaluación alta") managerData[d.id_responsible].alta++;
      
      managerData[d.id_responsible].total++;
    }
  });

  const categories = [];
  const pctCoinciden = [];
  const pctBaja = [];
  const pctAlta = [];

  Object.keys(managerData).forEach(m => {
    categories.push(`Resp. ${m}`);
    const tot = managerData[m].total;
    pctCoinciden.push(parseFloat(((managerData[m].coinciden / tot) * 100).toFixed(1)));
    pctBaja.push(parseFloat(((managerData[m].baja / tot) * 100).toFixed(1)));
    pctAlta.push(parseFloat(((managerData[m].alta / tot) * 100).toFixed(1)));
  });

  const options = {
    series: [{
      name: 'Coinciden',
      data: pctCoinciden
    }, {
      name: 'Autoevaluación Baja (Manager califica superior)',
      data: pctBaja
    }, {
      name: 'Autoevaluación Alta (Manager califica inferior)',
      data: pctAlta
    }],
    chart: {
      type: 'bar',
      height: 320,
      stacked: true,
      stackType: '100%',
      foreColor: '#94a3b8',
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: ['hsl(150, 84%, 40%)', 'hsl(217, 91%, 60%)', 'hsl(355, 78%, 56%)'],
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: '70%'
      }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)'
    },
    xaxis: {
      categories: categories,
      labels: {
        formatter: function (val) {
          return val + "%";
        }
      }
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: function (val) {
          return val + "% de sus evaluaciones";
        }
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      labels: { colors: '#f1f5f9' }
    }
  };

  const container = document.getElementById("chart-coincidence-manager");
  if (container) {
    container.innerHTML = "";
    const chart = new ApexCharts(container, options);
    chart.render();
    APP_STATE.chartInstances['coincidence-manager'] = chart;
  }
}

/* --------------------------------------------------------------------------
   GRÁFICO 3: MAPA DE CALOR: RESPONSABLE × CAPACIDAD (HEATMAP)
   -------------------------------------------------------------------------- */
function renderChartHeatmapManager() {
  const data = getCohortFilteredData();
  
  // 1. Obtener todas las capacidades evaluadas en esta cohorte y los responsables
  const rawSkills = Array.from(new Set(data.map(d => d.capacidad))).filter(Boolean);
  const managers = Array.from(new Set(data.map(d => d.id_responsible))).filter(Boolean).sort();

  // Para evitar sobrecargar el mapa de calor con 43 columnas, seleccionamos las capacidades 
  // que tengan evaluaciones reales o limitamos a las 12 más comunes en esta cohorte.
  const skillEvalsCount = {};
  rawSkills.forEach(s => skillEvalsCount[s] = 0);
  data.forEach(d => { if (d.capacidad) skillEvalsCount[d.capacidad]++; });

  const activeSkills = rawSkills
    .sort((a, b) => skillEvalsCount[b] - skillEvalsCount[a])
    .slice(0, 35); // Seleccionar hasta 35 capacidades principales de la cohorte

  // 2. Agrupar la media de la revisión del responsable por [Responsable][Capacidad]
  const matrix = {};
  managers.forEach(m => {
    matrix[m] = {};
    activeSkills.forEach(s => {
      matrix[m][s] = { sum: 0, count: 0 };
    });
  });

  data.forEach(d => {
    const m = d.id_responsible;
    const s = d.capacidad;
    if (m && s && matrix[m] && matrix[m][s] && d.revision_responsable_num !== null) {
      matrix[m][s].sum += d.revision_responsable_num;
      matrix[m][s].count++;
    }
  });

  // 3. Generar las series para ApexCharts Heatmap (Invertido: Columnas = Evaluadores, Filas = Skills)
  const series = [];
  activeSkills.forEach(s => {
    const seriesData = [];
    managers.forEach(m => {
      const avg = matrix[m][s].count > 0 ? parseFloat((matrix[m][s].sum / matrix[m][s].count).toFixed(2)) : 0;
      seriesData.push({
        x: `Resp. ${m}`,
        y: avg
      });
    });
    series.push({
      name: s.length > 25 ? s.substring(0, 25) + "..." : s,
      data: seriesData
    });
  });

  // Altura adaptada dinámicamente para que quepan de forma legible y holgada hasta 35 habilidades
  const chartHeight = Math.max(380, activeSkills.length * 27 + 90);

  const options = {
    series: series,
    chart: {
      type: 'heatmap',
      height: chartHeight,
      foreColor: '#94a3b8',
      toolbar: { show: false },
      background: 'transparent'
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 2,
        useDirectColors: false,
        colorScale: {
          ranges: [
            { from: 0.0, to: 0.9, name: 'Sin Datos', color: '#1e293b' },
            { from: 1.0, to: 1.8, name: 'Básico (1)', color: 'rgba(239, 68, 68, 0.5)' },
            { from: 1.9, to: 2.8, name: 'Intermedio (2)', color: 'rgba(245, 158, 11, 0.6)' },
            { from: 2.9, to: 3.5, name: 'Avanzado (3)', color: 'rgba(37, 99, 235, 0.6)' },
            { from: 3.6, to: 4.0, name: 'Experto (4)', color: 'rgba(16, 185, 129, 0.7)' }
          ]
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ['#fff'],
        fontSize: '11px',
        fontFamily: 'Inter',
        fontWeight: 'bold'
      }
    },
    grid: { padding: { right: 20 } },
    xaxis: {
      labels: {
        rotate: 0, // Las etiquetas de evaluadores (ej. Resp. A01) son cortas, por lo que no es necesario rotarlas
        rotateAlways: false,
        style: { fontSize: '11px', fontWeight: 600 }
      }
    },
    title: {
      text: undefined
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: function (val) {
          if (val === 0) return "Sin calificaciones";
          const labels = ["", "Básico", "Intermedio", "Avanzado", "Experto"];
          const closestIndex = Math.round(val);
          return `${val} (${labels[closestIndex] || 'Desconocido'})`;
        }
      }
    }
  };

  const container = document.getElementById("chart-heatmap-manager");
  if (container) {
    container.innerHTML = "";
    const chart = new ApexCharts(container, options);
    chart.render();
    APP_STATE.chartInstances['heatmap-manager'] = chart;
  }
}

/* --------------------------------------------------------------------------
   GRÁFICO 4: RADAR DE PERFIL COMPETENCIAL DE LA COHORTE
   -------------------------------------------------------------------------- */
function renderChartRadarCohort() {
  const data = getCohortFilteredData();

  // 1. Agrupar promedios de Requerido, Auto y Responsable por Capacidad
  const skillsMap = {};
  data.forEach(d => {
    const s = d.capacidad;
    if (s) {
      if (!skillsMap[s]) {
        skillsMap[s] = {
          reqSum: 0, reqCount: 0,
          autoSum: 0, autoCount: 0,
          respSum: 0, respCount: 0,
          totalCount: 0
        };
      }
      
      if (d.nivel_requerido_num !== null) {
        skillsMap[s].reqSum += d.nivel_requerido_num;
        skillsMap[s].reqCount++;
      }
      if (d.autoevaluacion_num !== null) {
        skillsMap[s].autoSum += d.autoevaluacion_num;
        skillsMap[s].autoCount++;
      }
      if (d.revision_responsable_num !== null) {
        skillsMap[s].respSum += d.revision_responsable_num;
        skillsMap[s].respCount++;
      }
      skillsMap[s].totalCount++;
    }
  });

  // Ordenar competencias por volumen de evaluaciones y tomar las 10 principales para el radar
  const sortedSkills = Object.keys(skillsMap)
    .sort((a, b) => skillsMap[b].totalCount - skillsMap[a].totalCount)
    .slice(0, 10);

  const categories = [];
  const reqAvg = [];
  const autoAvg = [];
  const respAvg = [];

  sortedSkills.forEach(s => {
    categories.push(s.length > 20 ? s.substring(0, 20) + "..." : s);
    
    const obj = skillsMap[s];
    reqAvg.push(obj.reqCount > 0 ? parseFloat((obj.reqSum / obj.reqCount).toFixed(2)) : 0);
    autoAvg.push(obj.autoCount > 0 ? parseFloat((obj.autoSum / obj.autoCount).toFixed(2)) : 0);
    respAvg.push(obj.respCount > 0 ? parseFloat((obj.respSum / obj.respCount).toFixed(2)) : 0);
  });

  const options = {
    series: [{
      name: 'Nivel Requerido',
      data: reqAvg
    }, {
      name: 'Autoevaluación (Colaborador)',
      data: autoAvg
    }, {
      name: 'Revisión Responsable (Manager)',
      data: respAvg
    }],
    chart: {
      type: 'radar',
      height: 420,
      foreColor: '#94a3b8',
      toolbar: { show: false },
      background: 'transparent',
      dropShadow: { enabled: true, blur: 8, left: 1, top: 1, opacity: 0.2 }
    },
    plotOptions: {
      radar: {
        size: 130
      }
    },
    colors: ['hsl(217, 91%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(150, 84%, 40%)'],
    stroke: { width: 2 },
    fill: { opacity: 0.1 },
    markers: { size: 4 },
    xaxis: {
      categories: categories
    },
    yaxis: {
      min: 0,
      max: 4,
      tickAmount: 4,
      labels: {
        formatter: function (val) {
          const lbls = ["", "Básico", "Intermedio", "Avanzado", "Experto"];
          return lbls[val] || val;
        }
      }
    },
    legend: {
      position: 'bottom',
      labels: { colors: '#f1f5f9' }
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: function (val) {
          return `${val} de media`;
        }
      }
    }
  };

  const container = document.getElementById("chart-radar-cohort");
  if (container) {
    container.innerHTML = "";
    const chart = new ApexCharts(container, options);
    chart.render();
    APP_STATE.chartInstances['radar-cohort'] = chart;
  }
}

// El gráfico de brechas por rol ha sido eliminado según petición del usuario.

/* --------------------------------------------------------------------------
   GRÁFICO 6: DISTRIBUCIÓN DE NIVELES POR ROL (STACKED BAR)
   -------------------------------------------------------------------------- */
function renderChartDistributionLevels() {
  const data = getCohortFilteredData();

  // Agrupar niveles por Rol
  const roleLevels = {};
  data.forEach(d => {
    const r = d.rol_colaborador;
    const l = d.revision_responsable_str;
    if (r && l) {
      const cleanRole = r.trim();
      if (!roleLevels[cleanRole]) {
        roleLevels[cleanRole] = { basic: 0, inter: 0, adv: 0, exp: 0 };
      }
      
      const cleanL = l.trim().toLowerCase();
      if (cleanL.includes("básico") || cleanL.includes("basico")) roleLevels[cleanRole].basic++;
      else if (cleanL.includes("intermedio")) roleLevels[cleanRole].inter++;
      else if (cleanL.includes("avanzado")) roleLevels[cleanRole].adv++;
      else if (cleanL.includes("experto")) roleLevels[cleanRole].exp++;
    }
  });

  const categories = [];
  const seriesBasic = [];
  const seriesInter = [];
  const seriesAdv = [];
  const seriesExp = [];

  Object.keys(roleLevels).forEach(r => {
    categories.push(r.length > 25 ? r.substring(0, 25) + "..." : r);
    const obj = roleLevels[r];
    seriesBasic.push(obj.basic);
    seriesInter.push(obj.inter);
    seriesAdv.push(obj.adv);
    seriesExp.push(obj.exp);
  });

  const options = {
    series: [{
      name: 'Básico',
      data: seriesBasic
    }, {
      name: 'Intermedio',
      data: seriesInter
    }, {
      name: 'Avanzado',
      data: seriesAdv
    }, {
      name: 'Experto',
      data: seriesExp
    }],
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      foreColor: '#94a3b8',
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: ['hsl(355, 78%, 56%)', 'hsl(38, 92%, 50%)', 'hsl(217, 91%, 60%)', 'hsl(150, 84%, 40%)'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%'
      }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      yaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: categories,
      labels: {
        rotate: -20,
        rotateAlways: categories.length > 3
      }
    },
    yaxis: {
      title: { text: 'Skills Evaluadas', style: { color: '#94a3b8' } }
    },
    legend: {
      position: 'bottom',
      labels: { colors: '#f1f5f9' }
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: function (val) {
          return `${val} skills en este nivel`;
        }
      }
    }
  };

  const container = document.getElementById("chart-distribution-levels");
  if (container) {
    container.innerHTML = "";
    const chart = new ApexCharts(container, options);
    chart.render();
    APP_STATE.chartInstances['distribution-levels'] = chart;
  }
}

/* --------------------------------------------------------------------------
   GRÁFICO 7: DISPERSIÓN AUTOEVALUACIÓN VS. REVISIÓN RESPONSABLE (SCATTER PLOT + JITTER)
   -------------------------------------------------------------------------- */
function renderChartScatterOutliers() {
  const data = getCohortFilteredData();

  // Generar puntos con un pequeño Jitter (ruido aleatorio) para evitar el solapamiento exacto
  const points = [];
  data.forEach(d => {
    if (d.autoevaluacion_num !== null && d.revision_responsable_num !== null) {
      // Jitter entre -0.15 y +0.15
      const jitterX = (Math.random() - 0.5) * 0.3;
      const jitterY = (Math.random() - 0.5) * 0.3;
      
      points.push({
        x: parseFloat((d.autoevaluacion_num + jitterX).toFixed(3)),
        y: parseFloat((d.revision_responsable_num + jitterY).toFixed(3)),
        meta: {
          id: d.id_colaborador,
          rol: d.rol_colaborador,
          cap: d.capacidad,
          auto_str: d.autoevaluacion_str,
          resp_str: d.revision_responsable_str,
          actualX: d.autoevaluacion_num,
          actualY: d.revision_responsable_num
        }
      });
    }
  });

  const options = {
    series: [{
      name: 'Observaciones (Competencia por Colaborador)',
      data: points.map(p => ({ x: p.x, y: p.y }))
    }],
    chart: {
      type: 'scatter',
      height: 350,
      foreColor: '#94a3b8',
      toolbar: { show: false },
      background: 'transparent',
      zoom: {
        enabled: false // Evita desaparición de puntos al hacer scroll
      },
      events: {
        dataPointSelection: function(event, chartContext, config) {
          const pIdx = config.dataPointIndex;
          const pt = points[pIdx];
          if (pt && pt.meta) {
            console.log("Clicked observation of:", pt.meta.id);
            openColabModal(pt.meta.id);
          }
        }
      }
    },
    colors: ['hsl(217, 91%, 60%)'],
    xaxis: {
      min: 0.5,
      max: 4.5,
      tickAmount: 4,
      title: { text: 'Autoevaluación Colaborador', style: { color: '#94a3b8' } },
      labels: {
        formatter: function (val) {
          const r = Math.round(val);
          const lbls = ["", "Básico (1)", "Intermedio (2)", "Avanzado (3)", "Experto (4)"];
          return lbls[r] || val;
        }
      }
    },
    yaxis: {
      min: 0.5,
      max: 4.5,
      tickAmount: 4,
      title: { text: 'Revisión Responsable (Manager)', style: { color: '#94a3b8' } },
      labels: {
        formatter: function (val) {
          const r = Math.round(val);
          const lbls = ["", "Básico (1)", "Intermedio (2)", "Avanzado (3)", "Experto (4)"];
          return lbls[r] || val;
        }
      }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)'
    },
    annotations: {
      // Línea diagonal indicando acuerdo perfecto
      xaxis: [],
      yaxis: [],
      points: [],
      lines: [{
        x: 1,
        y: 1,
        x2: 4,
        y2: 4,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        borderWidth: 2,
        label: {
          borderColor: '#10b981',
          style: {
            color: '#fff',
            background: '#10b981'
          },
          text: 'Diagonal de Coincidencia'
        }
      }]
    },
    markers: {
      size: 6,
      strokeWidth: 1,
      strokeColor: '#090d16',
      fillOpacity: 0.6,
      hover: { size: 9 }
    },
    tooltip: {
      theme: 'dark',
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const pt = points[dataPointIndex];
        if (!pt) return '';
        
        const m = pt.meta;
        const diff = m.actualY - m.actualX;
        let diffText = "";
        if (diff > 0) diffText = `<span class="text-emerald" style="font-weight:bold;">Manager califica +${diff} por encima</span>`;
        else if (diff < 0) diffText = `<span class="gap-negative" style="font-weight:bold;">Colaborador se autoevalúa +${Math.abs(diff)} por encima</span>`;
        else diffText = `<span class="text-emerald" style="font-weight:bold;">Acuerdo Absoluto</span>`;

        return `
          <div style="padding: 12px 14px; background: rgba(13, 20, 35, 0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; line-height: 1.4; font-family: Inter;">
            <div style="font-weight:bold; font-size:13px; color:#f1f5f9; margin-bottom: 6px; font-family: Outfit;">Colaborador: ${m.id}</div>
            <div style="color:#94a3b8; font-size:11px; margin-bottom: 2px;">Rol: ${m.rol}</div>
            <div style="color:#94a3b8; font-size:11px; margin-bottom: 8px;">Competencia: <b>${m.cap}</b></div>
            <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px; font-size:12px;">
              Auto: <b>${m.auto_str}</b><br/>
              Manager: <b>${m.resp_str}</b><br/>
              Alineamiento: ${diffText}
            </div>
            <div style="font-size:10px; color:#475569; margin-top: 8px; font-style:italic;">Haz clic en el punto para abrir su expediente</div>
          </div>
        `;
      }
    }
  };

  const container = document.getElementById("chart-scatter-outliers");
  if (container) {
    container.innerHTML = "";
    const chart = new ApexCharts(container, options);
    chart.render();
    APP_STATE.chartInstances['scatter-outliers'] = chart;
  }
}

/* --------------------------------------------------------------------------
   GRÁFICO 8: RANKING DE BRECHAS POR CATEGORÍA DE SKILLS (BARRAS HORIZONTALES)
   -------------------------------------------------------------------------- */
function renderChartCriticalGaps() {
  const data = getCohortFilteredData();
  const category = APP_STATE.selectedSkillCategory; // 'criticas', 'primarias', 'secundarias'

  // Agrupar brecha (Requerido - Manager) por Capacidad si pertenece a la categoría seleccionada
  const skillGaps = {};
  data.forEach(d => {
    const s = d.capacidad;
    if (s && getSkillCategory(d.rol_colaborador, s) === category && d.nivel_requerido_num !== null && d.revision_responsable_num !== null) {
      if (!skillGaps[s]) {
        skillGaps[s] = { sum: 0, count: 0 };
      }
      // Brecha: Nivel Requerido - Revision Responsable
      skillGaps[s].sum += (d.nivel_requerido_num - d.revision_responsable_num);
      skillGaps[s].count++;
    }
  });

  const categories = [];
  const values = [];

  Object.keys(skillGaps)
    .sort((a, b) => (skillGaps[b].sum / skillGaps[b].count) - (skillGaps[a].sum / skillGaps[a].count)) // De mayor brecha a menor
    .forEach(s => {
      categories.push(s.length > 25 ? s.substring(0, 25) + "..." : s);
      values.push(parseFloat((skillGaps[s].sum / skillGaps[s].count).toFixed(2)));
    });

  if (categories.length === 0) {
    const container = document.getElementById("chart-critical-gaps");
    if (container) {
      container.innerHTML = "<div class='no-data-msg' style='padding:40px; text-align:center; color:#94a3b8; font-size:13px;'>No se registran evaluaciones para esta categoría de habilidades en esta cohorte.</div>";
    }
    return;
  }

  const categoryLabels = { criticas: 'Críticas', primarias: 'Primarias', secundarias: 'Secundarias' };
  const catLabel = categoryLabels[category] || 'Habilidades';

  const options = {
    series: [{
      name: `Brecha de Habilidades ${catLabel} (Requerido - Manager)`,
      data: values
    }],
    chart: {
      type: 'bar',
      height: 420,
      foreColor: '#94a3b8',
      toolbar: { show: false },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        colors: {
          ranges: [{
            from: -10,
            to: -0.01,
            color: 'hsl(150, 84%, 40%)' // Verde: Supera expectativas
          }, {
            from: 0,
            to: 10,
            color: 'hsl(355, 78%, 56%)' // Rojo: Brecha pendiente (déficit)
          }]
        },
        columnWidth: '60%',
        horizontal: true
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return (val > 0 ? '+' : '') + val;
      },
      style: { colors: ['#fff'], fontSize: '11px', fontFamily: 'Inter' }
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      xaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: categories
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: function (val) {
          if (val > 0) return `Falta en promedio ${val} puntos de nivel para cumplir el requisito`;
          if (val < 0) return `Se supera en promedio ${Math.abs(val)} puntos el requisito`;
          return "Expectativas cubiertas con precisión";
        }
      }
    }
  };

  const container = document.getElementById("chart-critical-gaps");
  if (container) {
    container.innerHTML = "";
    const chart = new ApexCharts(container, options);
    chart.render();
    APP_STATE.chartInstances['critical-gaps'] = chart;
  }
}

/* --------------------------------------------------------------------------
   TABLA DE COLABORADORES (PESTAÑA 3)
   -------------------------------------------------------------------------- */
function renderColabsTable() {
  const data = getCohortFilteredData();
  const tbody = document.getElementById("colab-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  // 1. Agrupar la información por colaborador
  const colabsMap = {};
  data.forEach(d => {
    const id = d.id_colaborador;
    if (id) {
      if (!colabsMap[id]) {
        colabsMap[id] = {
          id: id,
          rol: d.rol_colaborador,
          evals: [],
          coincidenCount: 0,
          totalCount: 0,
          sumGap: 0,
          countGap: 0
        };
      }
      
      colabsMap[id].totalCount++;
      if (d.coincidencia === "Coinciden") colabsMap[id].coincidenCount++;
      
      if (d.revision_responsable_num !== null && d.nivel_requerido_num !== null) {
        colabsMap[id].sumGap += (d.revision_responsable_num - d.nivel_requerido_num);
        colabsMap[id].countGap++;
      }
    }
  });

  const list = Object.values(colabsMap).sort((a, b) => a.id.localeCompare(b.id));

  // Actualizar el recuento en la cabecera
  document.getElementById("list-colab-count").textContent = list.length;

  list.forEach(c => {
    const coinPct = c.totalCount > 0 ? ((c.coincidenCount / c.totalCount) * 100).toFixed(0) : 0;
    const avgGap = c.countGap > 0 ? (c.sumGap / c.countGap).toFixed(2) : "0.00";

    const tr = document.createElement("tr");
    tr.dataset.id = c.id;
    
    if (APP_STATE.selectedColabId === c.id) {
      tr.className = "active-row";
    }

    // Badge de coincidencia
    let badgeClass = "badge-coinciden";
    if (coinPct < 40) badgeClass = "badge-alta"; // Alta discrepancia
    else if (coinPct < 75) badgeClass = "badge-baja";

    // Formato de brecha
    let gapClass = "gap-zero";
    let gapSign = "";
    if (parseFloat(avgGap) > 0) {
      gapClass = "gap-positive";
      gapSign = "+";
    } else if (parseFloat(avgGap) < 0) {
      gapClass = "gap-negative";
    }

    tr.innerHTML = `
      <td style="font-weight:600; color:#f1f5f9;">${c.id}</td>
      <td>${c.rol.length > 22 ? c.rol.substring(0, 22) + "..." : c.rol}</td>
      <td><span class="badge ${badgeClass}">${coinPct}%</span></td>
      <td><span class="gap-val ${gapClass}">${gapSign}${avgGap}</span></td>
    `;

    tr.addEventListener("click", () => {
      // Activar fila
      document.querySelectorAll("#colab-table-body tr").forEach(row => row.classList.remove("active-row"));
      tr.classList.add("active-row");
      
      openColabModal(c.id);
    });

    tbody.appendChild(tr);
  });
}

// ==========================================================================
// DETALLE DE CALIBRACIÓN INDIVIDUAL (FICHA / MODAL DE COLABORADOR)
// ==========================================================================
function openColabModal(colabId) {
  console.log("Opening modal details for:", colabId);
  APP_STATE.selectedColabId = colabId;

  // 1. Obtener todas las evaluaciones del colaborador
  const colabEvals = window.EVALUATIONS_DATA.filter(d => d.id_colaborador === colabId);
  if (colabEvals.length === 0) return;

  const firstRec = colabEvals[0];
  
  // 2. Rellenar textos generales
  document.getElementById("modal-colab-id").textContent = `Ficha de Calibración: ${colabId}`;
  document.getElementById("modal-colab-role").textContent = firstRec.rol_colaborador;
  document.getElementById("modal-manager-id").textContent = `Resp. ${firstRec.id_responsible || 'S/D'}`;

  // 3. Calcular KPIs del colaborador
  const total = colabEvals.length;
  const coincidences = colabEvals.filter(d => d.coincidencia === "Coinciden").length;
  const coinPct = total > 0 ? ((coincidences / total) * 100).toFixed(0) + "%" : "0%";

  let sumGap = 0;
  let countGap = 0;
  colabEvals.forEach(d => {
    if (d.revision_responsable_num !== null && d.nivel_requerido_num !== null) {
      sumGap += (d.revision_responsable_num - d.nivel_requerido_num);
      countGap++;
    }
  });
  const avgGap = countGap > 0 ? (sumGap / countGap).toFixed(2) : "0.00";

  const coinEl = document.getElementById("modal-coincidence-pct");
  coinEl.textContent = coinPct;
  coinEl.className = "modal-stat-value";
  if (parseInt(coinPct) < 45) coinEl.classList.add("gap-negative");
  else coinEl.classList.add("text-emerald");

  const gapEl = document.getElementById("modal-average-gap");
  gapEl.textContent = (parseFloat(avgGap) > 0 ? "+" : "") + avgGap;
  gapEl.className = "modal-stat-value";
  if (parseFloat(avgGap) < 0) gapEl.classList.add("gap-negative");
  else if (parseFloat(avgGap) > 0) gapEl.classList.add("text-emerald");

  // 4. Renderizar tabla de capacidades y brechas individuales
  const modalTbody = document.getElementById("modal-table-body");
  modalTbody.innerHTML = "";

  colabEvals.forEach(e => {
    const brecha = e.brecha !== null ? e.brecha : (e.revision_responsable_num - e.nivel_requerido_num);
    let gapClass = "gap-zero";
    let gapSign = "";
    if (brecha > 0) {
      gapClass = "gap-positive";
      gapSign = "+";
    } else if (brecha < 0) {
      gapClass = "gap-negative";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight:500; color:#f1f5f9;">${e.capacidad}</td>
      <td>${e.nivel_requerido_str || e.nivel_requerido_num}</td>
      <td>${e.autoevaluacion_str || e.autoevaluacion_num}</td>
      <td><b>${e.revision_responsable_str || e.revision_responsable_num}</b></td>
      <td><span class="gap-val ${gapClass}">${gapSign}${brecha}</span></td>
    `;
    modalTbody.appendChild(tr);
  });

  // 5. Mostrar el modal (Overlay)
  const modalOverlay = document.getElementById("colab-details-modal");
  modalOverlay.classList.add("active");

  // 6. Renderizar gráfico de radar de competencias del colaborador
  setTimeout(() => {
    renderColabRadarChart(colabEvals);
  }, 100);
}

/* Radar Individual */
function renderColabRadarChart(colabEvals) {
  const categories = [];
  const reqVals = [];
  const autoVals = [];
  const respVals = [];

  // Ordenar o filtrar capacidades para que el radar no esté excesivamente congestionado
  const sortedEvals = [...colabEvals].sort((a, b) => b.capacidad.localeCompare(a.capacidad)).slice(0, 10);

  sortedEvals.forEach(e => {
    categories.push(e.capacidad.length > 20 ? e.capacidad.substring(0, 20) + "..." : e.capacidad);
    reqVals.push(e.nivel_requerido_num || 0);
    autoVals.push(e.autoevaluacion_num || 0);
    respVals.push(e.revision_responsable_num || 0);
  });

  const options = {
    series: [{
      name: 'Nivel Requerido',
      data: reqVals
    }, {
      name: 'Autoevaluación',
      data: autoVals
    }, {
      name: 'Revisión Responsable',
      data: respVals
    }],
    chart: {
      type: 'radar',
      height: 320,
      foreColor: '#94a3b8',
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: ['hsl(217, 91%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(150, 84%, 40%)'],
    stroke: { width: 1.5 },
    fill: { opacity: 0.08 },
    markers: { size: 3 },
    xaxis: {
      categories: categories
    },
    yaxis: {
      min: 0,
      max: 4,
      tickAmount: 4,
      labels: {
        formatter: function (val) {
          const lbls = ["", "Básico", "Intermedio", "Avanzado", "Experto"];
          return lbls[val] || val;
        }
      }
    },
    legend: {
      position: 'bottom',
      labels: { colors: '#f1f5f9' }
    }
  };

  const container = document.getElementById("modal-colab-radar-chart");
  if (container) {
    container.innerHTML = "";
    const chart = new ApexCharts(container, options);
    chart.render();
  }
}

/* --------------------------------------------------------------------------
   NUEVO GRÁFICO: DISTRIBUCIÓN UNIDIMENSIONAL DE EVALUACIONES (PUNTOS EN X)
   -------------------------------------------------------------------------- */
function renderChartColabDistribution() {
  const data = getCohortFilteredData();
  
  // 1. Agrupar datos por Colaborador
  const colabsMap = {};
  data.forEach(d => {
    const id = d.id_colaborador;
    if (id) {
      if (!colabsMap[id]) {
        colabsMap[id] = {
          id: id,
          manager: d.id_responsible || "S/D",
          respSum: 0, respCount: 0,
          reqSum: 0, reqCount: 0
        };
      }
      if (d.revision_responsable_num !== null) {
        colabsMap[id].respSum += d.revision_responsable_num;
        colabsMap[id].respCount++;
      }
      if (d.nivel_requerido_num !== null) {
        colabsMap[id].reqSum += d.nivel_requerido_num;
        colabsMap[id].reqCount++;
      }
    }
  });

  // Convertir a lista, calcular promedios y normalizar (Diferencia: avgResp - avgReq)
  const colabList = Object.values(colabsMap)
    .map(c => {
      const avgResp = c.respCount > 0 ? (c.respSum / c.respCount) : 0;
      const avgReq = c.reqCount > 0 ? (c.reqSum / c.reqCount) : 0;
      const normalizedValue = avgResp - avgReq;
      return {
        id: c.id,
        manager: c.manager,
        avgResp: avgResp,
        avgReq: avgReq,
        normalizedValue: normalizedValue
      };
    })
    .filter(c => c.avgResp > 0);

  if (colabList.length === 0) {
    const container = document.getElementById("chart-colab-distribution");
    if (container) container.innerHTML = "<div class='no-data-msg'>No hay datos suficientes para generar este gráfico.</div>";
    return;
  }

  // CALCULO DE ZOOM DINÁMICO EN X Y COLISIÓN X_EPSILON PROPORCIONAL
  // Buscamos el valor de desviación máxima absoluto en el conjunto
  const maxAbsDev = Math.max(...colabList.map(c => Math.abs(c.normalizedValue)), 0.05);
  // Zoom simétrico dinámico: límite estrecho alrededor de la desviación máxima
  const limit = parseFloat((maxAbsDev * 1.25).toFixed(2));
  // Umbral de proximidad horizontal proporcional (20% de la mitad del eje X para evitar solape de etiquetas en pantalla)
  const X_EPSILON = limit * 0.20;

  // 2. Swarm-Plot o Stacking Determinista en Y (aprovechando toda la altura)
  const sortedPoints = [...colabList].sort((a, b) => a.normalizedValue - b.normalizedValue);
  const assignedPoints = [];

  sortedPoints.forEach(p => {
    let yOffset = 0;
    let overlapCount = 0;
    while (true) {
      // Comprobar colisión horizontal (en X_EPSILON) y vertical
      const hasOverlap = assignedPoints.some(ap => 
        Math.abs(ap.x - p.normalizedValue) < X_EPSILON && 
        Math.abs(ap.y - (1 + yOffset)) < 0.10
      );
      if (!hasOverlap) {
        break;
      }
      overlapCount++;
      const direction = overlapCount % 2 === 0 ? 1 : -1;
      const steps = Math.ceil(overlapCount / 2);
      yOffset = direction * steps * 0.20; // Gran dispersión vertical (20% por paso)
    }
    assignedPoints.push({
      id: p.id,
      x: p.normalizedValue,
      y: 1 + yOffset,
      manager: p.manager,
      avgResp: p.avgResp,
      avgReq: p.avgReq
    });
  });

  // Mapeo estético de colores por responsable
  const managerColorsMap = {
    "A01": "hsl(217, 91%, 60%)",  // Blue (Cajamar)
    "A02": "hsl(262, 83%, 68%)",  // Violet
    "A03": "hsl(150, 84%, 40%)",  // Emerald Green
    "A04": "hsl(38, 92%, 50%)",   // Amber
    "A05": "hsl(355, 78%, 56%)",  // Crimson
    "A06": "hsl(180, 70%, 45%)",  // Teal
    "A07": "hsl(310, 60%, 55%)",  // Pink
    "A08": "hsl(20, 85%, 50%)",   // Orange
    "A09": "hsl(290, 50%, 45%)",  // Purple
    "A10": "hsl(100, 60%, 40%)",  // Olive Green
  };
  
  function getManagerColor(managerId) {
    return managerColorsMap[managerId] || "hsl(215, 20%, 45%)";
  }

  // 3. Preparar series para ApexCharts
  const seriesData = assignedPoints.map(p => ({
    x: parseFloat(p.x.toFixed(2)),
    y: p.y,
    fillColor: getManagerColor(p.manager),
    id: p.id,
    manager: p.manager,
    avgResp: p.avgResp,
    avgReq: p.avgReq
  }));

  const options = {
    series: [{
      name: 'Desviación vs Requerimiento',
      data: seriesData
    }],
    chart: {
      type: 'scatter',
      height: 280,
      foreColor: '#94a3b8',
      toolbar: { show: false },
      background: 'transparent',
      zoom: {
        enabled: false // Deshabilita el zoom de ApexCharts para evitar que desaparezca el gráfico al hacer scroll
      },
      events: {
        dataPointSelection: function(event, chartContext, config) {
          const dp = seriesData[config.dataPointIndex];
          if (dp) {
            openColabModal(dp.id);
          }
        }
      }
    },
    markers: {
      size: 7,
      strokeWidth: 1,
      strokeColor: '#090d16',
      fillOpacity: 0.85,
      hover: { size: 10 }
    },
    dataLabels: {
      enabled: false // Quita la etiqueta del ID de los puntos para evitar saturación visual
    },
    grid: {
      show: false,
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    },
    xaxis: {
      min: -limit,
      max: limit,
      tickAmount: limit <= 0.15 ? 4 : (limit <= 0.5 ? 6 : 8),
      labels: {
        style: {
          fontWeight: 600,
          colors: '#94a3b8'
        },
        formatter: function (val) {
          if (val === 0) return "0 (Expectativa)";
          return (val > 0 ? "+" : "") + val.toFixed(2);
        }
      },
      axisBorder: { show: true, color: 'rgba(255, 255, 255, 0.1)' },
      axisTicks: { show: true, color: 'rgba(255, 255, 255, 0.1)' }
    },
    yaxis: {
      min: 0.2,
      max: 1.8,
      show: false
    },
    annotations: {
      xaxis: [{
        x: 0,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderWidth: 2,
        strokeDashArray: 3,
        label: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
          style: {
            color: '#f1f5f9',
            background: 'rgba(15, 23, 42, 0.85)',
            fontFamily: 'Inter',
            fontSize: '9px'
          },
          text: 'Nivel Requerido'
        }
      }],
      yaxis: [{
        y: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 2,
        strokeDashArray: 0
      }]
    },
    tooltip: {
      theme: 'dark',
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const dp = seriesData[dataPointIndex];
        if (!dp) return '';
        const diff = dp.x;
        let diffText = "";
        if (diff > 0) {
          diffText = `<span class="text-emerald" style="font-weight:bold;">+${diff.toFixed(2)} por encima de expectativa</span>`;
        } else if (diff < 0) {
          diffText = `<span class="gap-negative" style="font-weight:bold;">${diff.toFixed(2)} por debajo de expectativa</span>`;
        } else {
          diffText = `<span class="text-emerald" style="font-weight:bold;">Cumple exactamente expectativa</span>`;
        }
        return `
          <div style="padding: 12px 14px; background: rgba(13, 20, 35, 0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; line-height: 1.4; font-family: Inter;">
            <div style="font-weight:bold; font-size:13px; color:#f1f5f9; font-family: Outfit; margin-bottom:6px;">Colaborador: ${dp.id}</div>
            <div style="color:#94a3b8; font-size:11px; margin-top:2px;">Responsable: <b>Resp. ${dp.manager}</b></div>
            <div style="color:#94a3b8; font-size:11px; margin-top:2px;">Requerido Medio: <b>${dp.avgReq.toFixed(2)}</b></div>
            <div style="color:#94a3b8; font-size:11px; margin-top:6px;">Manager Medio: <b>${dp.avgResp.toFixed(2)}</b></div>
            <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px; font-size:12px;">
              Alineamiento: ${diffText}
            </div>
            <div style="font-size:9px; color:#475569; margin-top: 8px; font-style:italic;">Haz clic en el punto para ver expediente</div>
          </div>
        `;
      }
    }
  };

  const container = document.getElementById("chart-colab-distribution");
  if (container) {
    container.innerHTML = "";
    const chart = new ApexCharts(container, options);
    chart.render();
    APP_STATE.chartInstances['colab-distribution'] = chart;
  }
}

/* --------------------------------------------------------------------------
   NUEVO GRÁFICO 7: ALINEAMIENTO DE CALIFICACIÓN INDIVIDUAL POR COLABORADOR
   -------------------------------------------------------------------------- */
function renderChartColabAlignment() {
  const data = getCohortFilteredData();
  
  // 1. Agrupar datos por Colaborador
  const colabsMap = {};
  data.forEach(d => {
    const id = d.id_colaborador;
    if (id) {
      if (!colabsMap[id]) {
        colabsMap[id] = {
          id: id,
          manager: d.id_responsible || "S/D",
          autoSum: 0, autoCount: 0,
          respSum: 0, respCount: 0,
          reqSum: 0, reqCount: 0
        };
      }
      if (d.autoevaluacion_num !== null) {
        colabsMap[id].autoSum += d.autoevaluacion_num;
        colabsMap[id].autoCount++;
      }
      if (d.revision_responsable_num !== null) {
        colabsMap[id].respSum += d.revision_responsable_num;
        colabsMap[id].respCount++;
      }
      if (d.nivel_requerido_num !== null) {
        colabsMap[id].reqSum += d.nivel_requerido_num;
        colabsMap[id].reqCount++;
      }
    }
  });

  // Convertir a array y ordenar de forma descendente por la revisión media del manager
  const colabList = Object.values(colabsMap)
    .map(c => {
      const avgAuto = c.autoCount > 0 ? parseFloat((c.autoSum / c.autoCount).toFixed(2)) : 0;
      const avgResp = c.respCount > 0 ? parseFloat((c.respSum / c.respCount).toFixed(2)) : 0;
      const avgReq = c.reqCount > 0 ? parseFloat((c.reqSum / c.reqCount).toFixed(2)) : 0;
      return {
        id: c.id,
        manager: c.manager,
        avgAuto: avgAuto,
        avgResp: avgResp,
        avgReq: avgReq
      };
    })
    .sort((a, b) => b.avgResp - a.avgResp); // Orden descendente por nota manager

  if (colabList.length === 0) {
    const container = document.getElementById("chart-colab-alignment");
    if (container) container.innerHTML = "<div class='no-data-msg'>No hay datos suficientes para generar este gráfico.</div>";
    return;
  }

  // Mapeo estético de colores por responsable
  const managerColorsMap = {
    "A01": "hsl(217, 91%, 60%)",  // Blue (Cajamar)
    "A02": "hsl(262, 83%, 68%)",  // Violet
    "A03": "hsl(150, 84%, 40%)",  // Emerald Green
    "A04": "hsl(38, 92%, 50%)",   // Amber
    "A05": "hsl(355, 78%, 56%)",  // Crimson
    "A06": "hsl(180, 70%, 45%)",  // Teal
    "A07": "hsl(310, 60%, 55%)",  // Pink
    "A08": "hsl(20, 85%, 50%)",   // Orange
    "A09": "hsl(290, 50%, 45%)",  // Purple
    "A10": "hsl(100, 60%, 40%)",  // Olive Green
  };
  
  function getManagerColor(managerId) {
    return managerColorsMap[managerId] || "hsl(215, 20%, 45%)";
  }

  // 2. Crear y renderizar la leyenda dinámica de Responsables en el DOM
  const chartEl = document.getElementById("chart-colab-alignment");
  if (chartEl) {
    let legendEl = document.getElementById("manager-custom-legend");
    if (!legendEl) {
      legendEl = document.createElement("div");
      legendEl.id = "manager-custom-legend";
      legendEl.style.display = "flex";
      legendEl.style.flexWrap = "wrap";
      legendEl.style.gap = "10px";
      legendEl.style.marginBottom = "16px";
      legendEl.style.padding = "8px 12px";
      legendEl.style.borderRadius = "8px";
      legendEl.style.backgroundColor = "rgba(255,255,255,0.02)";
      legendEl.style.border = "1px solid rgba(255,255,255,0.04)";
      legendEl.style.fontSize = "11px";
      chartEl.parentNode.insertBefore(legendEl, chartEl);
    }
    
    // Obtener los managers únicos presentes en esta cohorte
    const uniqueManagers = Array.from(new Set(colabList.map(c => c.manager))).sort();
    
    legendEl.innerHTML = `<span style="font-weight:600; color:#94a3b8; margin-right:4px;">Leyenda Managers:</span>`;
    uniqueManagers.forEach(m => {
      const color = getManagerColor(m);
      const span = document.createElement("span");
      span.style.display = "flex";
      span.style.alignItems = "center";
      span.style.gap = "6px";
      span.style.color = "#f1f5f9";
      span.innerHTML = `
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${color};"></span>
        Resp. ${m}
      `;
      legendEl.appendChild(span);
    });
  }

  // 3. Preparar series para ApexCharts
  // Series 1: Autoevaluación Media (Fila superior en barra agrupada)
  // Series 2: Revisión Responsable (Fila inferior, coloreada por Responsable)
  const categories = colabList.map(c => `${c.id} (R: ${c.avgReq.toFixed(1)})`);
  const autoData = colabList.map((c, idx) => ({ x: categories[idx], y: c.avgAuto }));
  const respData = colabList.map((c, idx) => ({
    x: categories[idx],
    y: c.avgResp,
    fillColor: getManagerColor(c.manager)
  }));

  const options = {
    series: [{
      name: 'Autoevaluación Media',
      data: autoData
    }, {
      name: 'Revisión Responsable Media',
      data: respData
    }],
    chart: {
      type: 'bar',
      height: Math.max(320, colabList.length * 42), // Redimensionado dinámico para evitar solapes
      foreColor: '#94a3b8',
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: ['rgba(255, 255, 255, 0.16)', 'hsl(217, 91%, 60%)'], // El primer color es la autoevaluación, el segundo es un fallback
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '75%',
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        fontSize: '10px',
        colors: ['#fff']
      },
      formatter: function (val, opt) {
        return val.toFixed(2);
      },
      offsetX: 4
    },
    stroke: {
      show: true,
      width: 1,
      colors: ['transparent']
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      xaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: categories,
      min: 0,
      max: 4,
      tickAmount: 4,
      labels: {
        formatter: function (val) {
          const lbls = ["", "Básico (1)", "Intermedio (2)", "Avanzado (3)", "Experto (4)"];
          return lbls[val] || val;
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontWeight: 600,
          colors: '#f1f5f9'
        }
      }
    },
    tooltip: {
      theme: 'dark',
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const item = colabList[dataPointIndex];
        if (!item) return '';
        
        const diff = item.avgResp - item.avgAuto;
        let diffText = "";
        if (diff > 0) diffText = `<span class="text-emerald" style="font-weight:bold;">+${diff.toFixed(2)} (Manager superior)</span>`;
        else if (diff < 0) diffText = `<span class="gap-negative" style="font-weight:bold;">${diff.toFixed(2)} (Autoevaluación superior)</span>`;
        else diffText = `<span class="text-emerald" style="font-weight:bold;">Alineación perfecta</span>`;

        return `
          <div style="padding: 12px 14px; background: rgba(13, 20, 35, 0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; line-height: 1.4; font-family: Inter;">
            <div style="font-weight:bold; font-size:13px; color:#f1f5f9; margin-bottom: 4px; font-family: Outfit;">Colaborador: ${item.id}</div>
            <div style="color:#94a3b8; font-size:11px; margin-bottom: 8px;">Asignado a: <b>Resp. ${item.manager}</b></div>
            <div style="border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px; font-size:12px;">
              Autoevaluación Media: <b>${item.avgAuto.toFixed(2)}</b><br/>
              Evaluación Responsable: <b>${item.avgResp.toFixed(2)}</b><br/>
              Diferencia de Calibración: ${diffText}
            </div>
            <div style="font-size:10px; color:#475569; margin-top: 6px; font-style:italic;">Haz clic en el listado para ver sus brechas</div>
          </div>
        `;
      }
    }
  };

  const container = document.getElementById("chart-colab-alignment");
  if (container) {
    container.innerHTML = "";
    const chart = new ApexCharts(container, options);
    chart.render();
    APP_STATE.chartInstances['colab-alignment'] = chart;
  }
}

/* --------------------------------------------------------------------------
   NUEVA FUNCIONALIDAD: GESTIÓN Y EDICIÓN DE BASE DE DATOS (CRUD MULTITABLA)
   -------------------------------------------------------------------------- */

function renderDbTables() {
  const activeSub = APP_STATE.activeSubTab;
  console.log("Rendering subtab:", activeSub);

  // Ocultar todos los subtab-contents
  document.querySelectorAll(".subtab-content").forEach(el => {
    el.style.display = "none";
    el.classList.remove("active-subtab");
  });

  // Mostrar el activo
  const activeEl = document.getElementById(activeSub);
  if (activeEl) {
    activeEl.style.display = "block";
    activeEl.classList.add("active-subtab");
  }

  // Renderizar tabla correspondiente
  if (activeSub === "subtab-evaluaciones") {
    renderDbEvaluationsTable();
  } else if (activeSub === "subtab-colaboradores") {
    renderDbCollaboratorsTable();
  } else if (activeSub === "subtab-roles") {
    renderDbRolesTable();
  }
}

/* --- TABLA 1: EVALUACIONES Y PUNTUACIONES --- */
function renderDbEvaluationsTable() {
  const tbody = document.getElementById("db-evaluations-table-body");
  if (!tbody) return;

  let rawData = APP_STATE.evalShowAll ? window.EVALUATIONS_DATA : getCohortFilteredData();

  if (APP_STATE.evalSearchQuery) {
    const q = APP_STATE.evalSearchQuery.toLowerCase().trim();
    rawData = rawData.filter(d => 
      (d.id_colaborador && d.id_colaborador.toLowerCase().includes(q)) ||
      (d.rol_colaborador && d.rol_colaborador.toLowerCase().includes(q)) ||
      (d.capacidad && d.capacidad.toLowerCase().includes(q)) ||
      (d.id_responsible && d.id_responsible.toLowerCase().includes(q))
    );
  }

  const totalItems = rawData.length;
  const totalPages = Math.ceil(totalItems / APP_STATE.pageSize) || 1;

  if (APP_STATE.evalPage > totalPages) APP_STATE.evalPage = totalPages;
  if (APP_STATE.evalPage < 1) APP_STATE.evalPage = 1;

  const startIdx = (APP_STATE.evalPage - 1) * APP_STATE.pageSize;
  const endIdx = Math.min(startIdx + APP_STATE.pageSize, totalItems);
  const paginatedData = rawData.slice(startIdx, endIdx);

  document.getElementById("eval-pagination-info").textContent = 
    totalItems > 0 
      ? `Mostrando ${startIdx + 1}-${endIdx} de ${totalItems} filas` 
      : "Mostrando 0-0 de 0 filas";

  const btnPrev = document.getElementById("btn-eval-prev-page");
  if (btnPrev) {
    btnPrev.disabled = APP_STATE.evalPage === 1;
    btnPrev.style.opacity = APP_STATE.evalPage === 1 ? "0.4" : "1";
    btnPrev.style.cursor = APP_STATE.evalPage === 1 ? "not-allowed" : "pointer";
  }

  const btnNext = document.getElementById("btn-eval-next-page");
  if (btnNext) {
    btnNext.disabled = APP_STATE.evalPage === totalPages;
    btnNext.style.opacity = APP_STATE.evalPage === totalPages ? "0.4" : "1";
    btnNext.style.cursor = APP_STATE.evalPage === totalPages ? "not-allowed" : "pointer";
  }

  tbody.innerHTML = "";

  if (paginatedData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 30px; color: var(--text-secondary);">No se han encontrado registros de evaluación.</td></tr>`;
    return;
  }

  paginatedData.forEach(d => {
    const globalIdx = window.EVALUATIONS_DATA.indexOf(d);
    const tr = document.createElement("tr");

    const reqNum = d.nivel_requerido_num || 2;
    const respNum = d.revision_responsable_num || 2;
    const brechaVal = respNum - reqNum;
    let gapClass = "gap-zero";
    let gapSign = "";
    if (brechaVal > 0) { gapClass = "gap-positive"; gapSign = "+"; }
    else if (brechaVal < 0) { gapClass = "gap-negative"; }

    let badgeClass = "badge-coinciden";
    if (d.coincidencia === "Autoevaluación alta") badgeClass = "badge-alta";
    else if (d.coincidencia === "Autoevaluación baja") badgeClass = "badge-baja";

    const selectReqHtml = getSelectRatingHtml(d.nivel_requerido_str, "req", globalIdx);
    const selectAutoHtml = getSelectRatingHtml(d.autoevaluacion_str, "auto", globalIdx);
    const selectRespHtml = getSelectRatingHtml(d.revision_responsable_str, "resp", globalIdx);

    tr.innerHTML = `
      <td style="font-weight:600; color:#f1f5f9;">${d.id_colaborador}</td>
      <td style="color:var(--text-secondary); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${d.rol_colaborador}">${d.rol_colaborador}</td>
      <td><b style="color:#f1f5f9;">${d.id_responsible}</b></td>
      <td style="color:#f1f5f9; font-weight:500; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${d.capacidad}">${d.capacidad}</td>
      <td>${selectReqHtml}</td>
      <td>${selectAutoHtml}</td>
      <td>${selectRespHtml}</td>
      <td style="text-align: center;"><span class="gap-val ${gapClass}">${gapSign}${brechaVal}</span></td>
      <td><span class="badge ${badgeClass}">${d.coincidencia || 'Coinciden'}</span></td>
      <td style="text-align: center;">
        <button class="btn-delete-row" data-idx="${globalIdx}" style="background:none; border:none; color:var(--color-crimson); font-size: 14px; cursor:pointer;" title="Borrar registro">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Vincular eventos selects interactivos
  tbody.querySelectorAll(".cell-editable-select").forEach(select => {
    select.addEventListener("change", (e) => {
      const idx = parseInt(e.target.dataset.idx);
      const field = e.target.dataset.field;
      const valStr = e.target.value;
      const levelsMap = { "Básico": 1, "Intermedio": 2, "Avanzado": 3, "Experto": 4 };
      const valNum = levelsMap[valStr] || 2;

      const rec = window.EVALUATIONS_DATA[idx];
      if (!rec) return;

      console.log(`Editing index ${idx} | Field ${field} -> ${valStr} (${valNum})`);

      if (field === "req") {
        rec.nivel_requerido_str = valStr;
        rec.nivel_requerido_num = valNum;
      } else if (field === "auto") {
        rec.autoevaluacion_str = valStr;
        rec.autoevaluacion_num = valNum;
      } else if (field === "resp") {
        rec.revision_responsable_str = valStr;
        rec.revision_responsable_num = valNum;
      }

      rec.brecha = (rec.revision_responsable_num || 2) - (rec.nivel_requerido_num || 2);
      
      const aNum = rec.autoevaluacion_num || 2;
      const rNum = rec.revision_responsable_num || 2;
      rec.coincidencia = aNum === rNum ? "Coinciden" : (aNum < rNum ? "Autoevaluación baja" : "Autoevaluación alta");

      initializeRoleSkillsPartition();
      updateDashboard();
    });
  });

  // Vincular evento de borrado
  tbody.querySelectorAll(".btn-delete-row").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx);
      const rec = window.EVALUATIONS_DATA[idx];
      if (!rec) return;
      if (confirm(`¿Eliminar la evaluación de '${rec.capacidad}' para ${rec.id_colaborador}?`)) {
        window.EVALUATIONS_DATA.splice(idx, 1);
        initializeRoleSkillsPartition();
        alert("Registro eliminado.");
        updateDashboard();
      }
    });
  });
}

function getSelectRatingHtml(currentVal, field, globalIdx) {
  const options = ["Básico", "Intermedio", "Avanzado", "Experto"];
  const cleanVal = currentVal ? currentVal.trim() : "Intermedio";

  let html = `<select class="cell-editable-select" data-field="${field}" data-idx="${globalIdx}">`;
  options.forEach(opt => {
    const selected = opt.toLowerCase() === cleanVal.toLowerCase() ? "selected" : "";
    html += `<option value="${opt}" ${selected}>${opt}</option>`;
  });
  html += `</select>`;
  return html;
}

/* --- TABLA 2: COLABORADORES Y ROLES --- */
function getUniqueCollaborators() {
  const colabsMap = {};
  window.EVALUATIONS_DATA.forEach(d => {
    const id = d.id_colaborador;
    if (id) {
      if (!colabsMap[id]) {
        colabsMap[id] = {
          id_colaborador: id,
          rol_colaborador: d.rol_colaborador || "Sin Puesto",
          id_responsible: d.id_responsible || "S/M",
          evalsCount: 0
        };
      }
      colabsMap[id].evalsCount++;
    }
  });
  return Object.values(colabsMap).sort((a, b) => a.id_colaborador.localeCompare(b.id_colaborador));
}

function renderDbCollaboratorsTable() {
  const tbody = document.getElementById("db-collaborators-table-body");
  if (!tbody) return;

  let rawData = getUniqueCollaborators();

  if (APP_STATE.colabSearchQueryDb) {
    const q = APP_STATE.colabSearchQueryDb.toLowerCase().trim();
    rawData = rawData.filter(d => 
      d.id_colaborador.toLowerCase().includes(q) ||
      d.rol_colaborador.toLowerCase().includes(q) ||
      d.id_responsible.toLowerCase().includes(q)
    );
  }

  const totalItems = rawData.length;
  const totalPages = Math.ceil(totalItems / APP_STATE.pageSize) || 1;

  if (APP_STATE.colabPage > totalPages) APP_STATE.colabPage = totalPages;
  if (APP_STATE.colabPage < 1) APP_STATE.colabPage = 1;

  const startIdx = (APP_STATE.colabPage - 1) * APP_STATE.pageSize;
  const endIdx = Math.min(startIdx + APP_STATE.pageSize, totalItems);
  const paginatedData = rawData.slice(startIdx, endIdx);

  document.getElementById("colab-pagination-info").textContent = 
    totalItems > 0 
      ? `Mostrando ${startIdx + 1}-${endIdx} de ${totalItems} colaboradores` 
      : "Mostrando 0-0 de 0 colaboradores";

  const btnPrev = document.getElementById("btn-colab-prev-page");
  if (btnPrev) {
    btnPrev.disabled = APP_STATE.colabPage === 1;
    btnPrev.style.opacity = APP_STATE.colabPage === 1 ? "0.4" : "1";
    btnPrev.style.cursor = APP_STATE.colabPage === 1 ? "not-allowed" : "pointer";
  }

  const btnNext = document.getElementById("btn-colab-next-page");
  if (btnNext) {
    btnNext.disabled = APP_STATE.colabPage === totalPages;
    btnNext.style.opacity = APP_STATE.colabPage === totalPages ? "0.4" : "1";
    btnNext.style.cursor = APP_STATE.colabPage === totalPages ? "not-allowed" : "pointer";
  }

  tbody.innerHTML = "";

  if (paginatedData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color: var(--text-secondary);">No se han encontrado colaboradores.</td></tr>`;
    return;
  }

  paginatedData.forEach(d => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <input type="text" class="cell-editable-text-input colab-id-edit" data-oldid="${d.id_colaborador}" value="${d.id_colaborador}" style="font-weight:600; color:#f1f5f9; width: 120px;">
      </td>
      <td>
        <input type="text" class="cell-editable-text-input colab-role-edit" data-id="${d.id_colaborador}" value="${d.rol_colaborador}" style="width: 250px;">
      </td>
      <td>
        <input type="text" class="cell-editable-text-input colab-manager-edit" data-id="${d.id_colaborador}" value="${d.id_responsible}" style="font-weight:600; width: 100px;">
      </td>
      <td style="text-align: center;"><span class="count-badge">${d.evalsCount}</span></td>
      <td style="text-align: center;">
        <button class="btn-delete-row btn-delete-colab" data-id="${d.id_colaborador}" title="Eliminar colaborador en cascada">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // A. Editar ID Colaborador
  tbody.querySelectorAll(".colab-id-edit").forEach(input => {
    input.addEventListener("change", (e) => {
      const oldId = e.target.dataset.oldid;
      const newId = e.target.value.trim().toUpperCase();
      if (!newId) {
        alert("El ID del colaborador no puede estar vacío.");
        e.target.value = oldId;
        return;
      }
      if (oldId === newId) return;

      window.EVALUATIONS_DATA.forEach(row => {
        if (row.id_colaborador === oldId) {
          row.id_colaborador = newId;
        }
      });
      console.log(`Updated Collaborator ID: ${oldId} -> ${newId}`);
      updateDashboard();
    });
  });

  // B. Editar Rol/Cargo
  tbody.querySelectorAll(".colab-role-edit").forEach(input => {
    input.addEventListener("change", (e) => {
      const colabId = e.target.dataset.id;
      const newRole = e.target.value.trim();
      if (!newRole) {
        alert("El cargo no puede estar vacío.");
        return;
      }

      window.EVALUATIONS_DATA.forEach(row => {
        if (row.id_colaborador === colabId) {
          row.rol_colaborador = newRole;
        }
      });
      console.log(`Updated Role for ${colabId} -> ${newRole}`);
      initializeRoleSkillsPartition();
      updateDashboard();
    });
  });

  // C. Editar Responsable
  tbody.querySelectorAll(".colab-manager-edit").forEach(input => {
    input.addEventListener("change", (e) => {
      const colabId = e.target.dataset.id;
      const newManager = e.target.value.trim().toUpperCase();
      if (!newManager) {
        alert("El ID del responsable no puede estar vacío.");
        return;
      }

      window.EVALUATIONS_DATA.forEach(row => {
        if (row.id_colaborador === colabId) {
          row.id_responsible = newManager;
        }
      });
      console.log(`Updated Manager for ${colabId} -> ${newManager}`);
      updateDashboard();
    });
  });

  // D. Eliminar Colaborador
  tbody.querySelectorAll(".btn-delete-colab").forEach(btn => {
    btn.addEventListener("click", () => {
      const colabId = btn.dataset.id;
      const confirmDelete = confirm(`¿Deseas eliminar al colaborador ${colabId}? Se purgarán todas sus evaluaciones de la base de datos de manera definitiva.`);
      if (confirmDelete) {
        window.EVALUATIONS_DATA = window.EVALUATIONS_DATA.filter(row => row.id_colaborador !== colabId);
        initializeRoleSkillsPartition();
        alert(`Colaborador ${colabId} eliminado.`);
        updateDashboard();
      }
    });
  });
}

/* --- TABLA 3: ROLES Y CAPACIDADES (REQUERIMIENTOS) --- */
function getUniqueRoleRequirements() {
  const reqsMap = {};
  window.EVALUATIONS_DATA.forEach(d => {
    const r = d.rol_colaborador ? d.rol_colaborador.trim() : "";
    const s = d.capacidad ? d.capacidad.trim() : "";
    if (r && s) {
      const key = `${r}||${s}`;
      if (!reqsMap[key]) {
        reqsMap[key] = {
          rol_colaborador: r,
          capacidad: s,
          nivel_requerido_str: d.nivel_requerido_str || "Intermedio",
          nivel_requerido_num: d.nivel_requerido_num || 2,
          criticidad: getSkillCategory(r, s)
        };
      }
    }
  });
  return Object.values(reqsMap).sort((a, b) => {
    const compRole = a.rol_colaborador.localeCompare(b.rol_colaborador);
    if (compRole !== 0) return compRole;
    return a.capacidad.localeCompare(b.capacidad);
  });
}

function renderDbRolesTable() {
  const tbody = document.getElementById("db-roles-table-body");
  if (!tbody) return;

  let rawData = getUniqueRoleRequirements();

  if (APP_STATE.rolesSearchQuery) {
    const q = APP_STATE.rolesSearchQuery.toLowerCase().trim();
    rawData = rawData.filter(d => 
      d.rol_colaborador.toLowerCase().includes(q) ||
      d.capacidad.toLowerCase().includes(q)
    );
  }

  const totalItems = rawData.length;
  const totalPages = Math.ceil(totalItems / APP_STATE.pageSize) || 1;

  if (APP_STATE.rolesPage > totalPages) APP_STATE.rolesPage = totalPages;
  if (APP_STATE.rolesPage < 1) APP_STATE.rolesPage = 1;

  const startIdx = (APP_STATE.rolesPage - 1) * APP_STATE.pageSize;
  const endIdx = Math.min(startIdx + APP_STATE.pageSize, totalItems);
  const paginatedData = rawData.slice(startIdx, endIdx);

  document.getElementById("roles-pagination-info").textContent = 
    totalItems > 0 
      ? `Mostrando ${startIdx + 1}-${endIdx} de ${totalItems} requerimientos` 
      : "Mostrando 0-0 de 0 requerimientos";

  const btnPrev = document.getElementById("btn-roles-prev-page");
  if (btnPrev) {
    btnPrev.disabled = APP_STATE.rolesPage === 1;
    btnPrev.style.opacity = APP_STATE.rolesPage === 1 ? "0.4" : "1";
    btnPrev.style.cursor = APP_STATE.rolesPage === 1 ? "not-allowed" : "pointer";
  }

  const btnNext = document.getElementById("btn-roles-next-page");
  if (btnNext) {
    btnNext.disabled = APP_STATE.rolesPage === totalPages;
    btnNext.style.opacity = APP_STATE.rolesPage === totalPages ? "0.4" : "1";
    btnNext.style.cursor = APP_STATE.rolesPage === totalPages ? "not-allowed" : "pointer";
  }

  tbody.innerHTML = "";

  if (paginatedData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color: var(--text-secondary);">No se han encontrado requerimientos de roles.</td></tr>`;
    return;
  }

  paginatedData.forEach(d => {
    const tr = document.createElement("tr");
    const selectHtml = getSelectRatingRoleHtml(d.nivel_requerido_str, d.rol_colaborador, d.capacidad);
    const selectCritHtml = getSelectCriticidadHtml(d.criticidad, d.rol_colaborador, d.capacidad);

    tr.innerHTML = `
      <td>
        <input type="text" class="cell-editable-text-input role-name-edit" data-role="${d.rol_colaborador}" data-skill="${d.capacidad}" value="${d.rol_colaborador}" style="width: 250px;">
      </td>
      <td>
        <input type="text" class="cell-editable-text-input role-skill-edit" data-role="${d.rol_colaborador}" data-skill="${d.capacidad}" value="${d.capacidad}" style="width: 250px; font-weight:500;">
      </td>
      <td>${selectHtml}</td>
      <td>${selectCritHtml}</td>
      <td style="text-align: center;">
        <button class="btn-delete-row btn-delete-role" data-role="${d.rol_colaborador}" data-skill="${d.capacidad}" title="Eliminar requerimiento">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // A. Editar Nivel Requerido
  tbody.querySelectorAll(".cell-editable-select-role").forEach(select => {
    select.addEventListener("change", (e) => {
      const role = e.target.dataset.role;
      const skill = e.target.dataset.skill;
      const valStr = e.target.value;
      const levelsMap = { "Básico": 1, "Intermedio": 2, "Avanzado": 3, "Experto": 4 };
      const valNum = levelsMap[valStr] || 2;

      window.EVALUATIONS_DATA.forEach(row => {
        if (row.rol_colaborador === role && row.capacidad === skill) {
          row.nivel_requerido_str = valStr;
          row.nivel_requerido_num = valNum;
          row.brecha = (row.revision_responsable_num || 2) - valNum;
        }
      });
      console.log(`Updated Role Requirement: [${role}] - [${skill}] -> ${valStr}`);
      updateDashboard();
    });
  });

  // B. Editar Nombre de Puesto (Rol)
  tbody.querySelectorAll(".role-name-edit").forEach(input => {
    input.addEventListener("change", (e) => {
      const oldRole = e.target.dataset.role;
      const skill = e.target.dataset.skill;
      const newRole = e.target.value.trim();
      if (!newRole) {
        alert("El rol no puede estar vacío.");
        return;
      }

      window.EVALUATIONS_DATA.forEach(row => {
        if (row.rol_colaborador === oldRole && row.capacidad === skill) {
          row.rol_colaborador = newRole;
        }
      });
      console.log(`Updated Role Name in cascading: ${oldRole} -> ${newRole}`);
      initializeRoleSkillsPartition();
      updateDashboard();
    });
  });

  // C. Editar Nombre de Competencia (Capacidad)
  tbody.querySelectorAll(".role-skill-edit").forEach(input => {
    input.addEventListener("change", (e) => {
      const role = e.target.dataset.role;
      const oldSkill = e.target.dataset.skill;
      const newSkill = e.target.value.trim();
      if (!newSkill) {
        alert("La habilidad no puede estar vacía.");
        return;
      }

      window.EVALUATIONS_DATA.forEach(row => {
        if (row.rol_colaborador === role && row.capacidad === oldSkill) {
          row.capacidad = newSkill;
        }
      });
      console.log(`Updated Skill Name in cascading: ${oldSkill} -> ${newSkill}`);
      initializeRoleSkillsPartition();
      updateDashboard();
    });
  });

  // D. Eliminar Requerimiento
  tbody.querySelectorAll(".btn-delete-role").forEach(btn => {
    btn.addEventListener("click", () => {
      const role = btn.dataset.role;
      const skill = btn.dataset.skill;
      const confirmDelete = confirm(`¿Deseas eliminar el requerimiento de '${skill}' para el rol '${role}'? Se eliminarán todas las calificaciones asociadas a esta habilidad en dicho cargo.`);
      if (confirmDelete) {
        window.EVALUATIONS_DATA = window.EVALUATIONS_DATA.filter(row => !(row.rol_colaborador === role && row.capacidad === skill));
        initializeRoleSkillsPartition();
        alert("Requerimiento y calificaciones eliminadas.");
        updateDashboard();
      }
    });
  });

  // E. Editar Criticidad
  tbody.querySelectorAll(".cell-editable-select-role-crit").forEach(select => {
    select.addEventListener("change", (e) => {
      const role = e.target.dataset.role;
      const skill = e.target.dataset.skill;
      const newVal = e.target.value; // 'criticas', 'primarias', 'secundarias'
      
      const part = ROLE_SKILLS_PARTITION[role];
      if (!part) return;

      // Comprobar restricciones del modelo de roles (6 críticas, 18 primarias)
      if (newVal === 'criticas' && part.criticas.length >= 6) {
        alert(`Límite alcanzado: El puesto '${role}' ya cuenta con el máximo de 6 habilidades críticas permitidas.\n\nPor favor, cambia otra habilidad de este rol a Primaria o Secundaria antes de marcar esta como crítica.`);
        e.target.value = part.criticas.includes(skill) ? 'criticas' : (part.primarias.includes(skill) ? 'primarias' : 'secundarias');
        return;
      }
      if (newVal === 'primarias' && part.primarias.length >= 18) {
        alert(`Límite alcanzado: El puesto '${role}' ya cuenta con el máximo de 18 habilidades primarias permitidas.\n\nPor favor, cambia otra habilidad de este rol a Secundaria antes de marcar esta como primaria.`);
        e.target.value = part.criticas.includes(skill) ? 'criticas' : (part.primarias.includes(skill) ? 'primarias' : 'secundarias');
        return;
      }

      // 1. Remover de todas las listas en memoria
      part.criticas = part.criticas.filter(s => s !== skill);
      part.primarias = part.primarias.filter(s => s !== skill);
      part.secundarias = part.secundarias.filter(s => s !== skill);

      // 2. Insertar en la nueva categoría
      part[newVal].push(skill);
      console.log(`Updated Criticidad for [${role}] - [${skill}] -> ${newVal}`);

      // 3. Propagar a evaluations data en cascada
      const critLabels = { 'criticas': 'Crítica', 'primarias': 'Primaria', 'secundarias': 'Secundaria' };
      window.EVALUATIONS_DATA.forEach(row => {
        if (row.rol_colaborador === role && row.capacidad === skill) {
          row.criticidad = critLabels[newVal];
        }
      });

      // 4. Refrescar el Dashboard completo de inmediato
      updateDashboard();
    });
  });
}

function getSelectRatingRoleHtml(currentVal, role, skill) {
  const options = ["Básico", "Intermedio", "Avanzado", "Experto"];
  const cleanVal = currentVal ? currentVal.trim() : "Intermedio";

  let html = `<select class="cell-editable-select-role" data-role="${role}" data-skill="${skill}">`;
  options.forEach(opt => {
    const selected = opt.toLowerCase() === cleanVal.toLowerCase() ? "selected" : "";
    html += `<option value="${opt}" ${selected}>${opt}</option>`;
  });
  html += `</select>`;
  return html;
}

function getSelectCriticidadHtml(currentCrit, role, skill) {
  const options = [
    { label: "Crítica", value: "criticas" },
    { label: "Primaria", value: "primarias" },
    { label: "Secundaria", value: "secundarias" }
  ];
  
  let html = `<select class="cell-editable-select-role-crit" data-role="${role}" data-skill="${skill}">`;
  options.forEach(opt => {
    const selected = opt.value === currentCrit ? "selected" : "";
    html += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
  });
  html += `</select>`;
  return html;
}



