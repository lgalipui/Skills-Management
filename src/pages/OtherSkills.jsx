import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockSkills, mockRoles } from '../data/mockData';
import { 
  Sparkles, 
  UploadCloud, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Award, 
  FileText, 
  X, 
  ChevronRight, 
  AlertCircle, 
  ThumbsUp, 
  RotateCcw, 
  HelpCircle, 
  Search,
  Filter,
  Check,
  Loader2,
  FileUp,
  Layers,
  Code,
  Heart,
  Briefcase,
  Shield,
  Clock,
  Compass,
  FileCheck,
  Star,
  History
} from 'lucide-react';

// Preguntas predefinidas para los tests de conocimientos
const QUIZ_BANK = {
  python: [
    {
      q: "¿Qué palabra clave se utiliza para definir una función en Python?",
      a: ["function", "def", "func"],
      correct: 1
    },
    {
      q: "¿Cuál de las siguientes estructuras de datos es inmutable?",
      a: ["Lista ([...])", "Diccionario ({...})", "Tupla ((...))"],
      correct: 2
    },
    {
      q: "¿Cómo se añade un elemento al final de una lista en Python?",
      a: ["lista.append(elemento)", "lista.add(elemento)", "lista.push(elemento)"],
      correct: 0
    },
    {
      q: "¿Cuál es el resultado de la expresión 3 ** 2 en la consola de Python?",
      a: ["6", "9", "8"],
      correct: 1
    },
    {
      q: "¿Qué bloque se ejecuta si se produce un error en un bloque 'try'?",
      a: ["except", "catch", "finally"],
      correct: 0
    }
  ],
  docker: [
    {
      q: "¿Qué comando se utiliza para construir una imagen de contenedor a partir de un Dockerfile?",
      a: ["docker run", "docker build", "docker compile"],
      correct: 1
    },
    {
      q: "¿Qué instrucción del Dockerfile define el puerto en el que escuchará el contenedor?",
      a: ["PORT", "EXPOSE", "LISTEN"],
      correct: 1
    },
    {
      q: "¿Qué comando permite listar todos los contenedores que se están ejecutando actualmente?",
      a: ["docker list", "docker ps", "docker images"],
      correct: 1
    },
    {
      q: "¿Qué archivo se utiliza normalmente para definir y ejecutar aplicaciones multi-contenedor?",
      a: ["docker-compose.yml", "Dockerfile", "package.json"],
      correct: 0
    },
    {
      q: "¿Qué flag se utiliza para mapear puertos de tu host al contenedor en 'docker run'?",
      a: ["-v", "-p", "-d"],
      correct: 1
    }
  ],
  ingles: [
    {
      q: "Which of the following sentences is grammatically correct for professional emails?",
      a: [
        "I am writing to inquire about the job opening.",
        "I writing to ask you for the job open.",
        "I am write to enquire for the job vacancy."
      ],
      correct: 0
    },
    {
      q: "Choose the correct preposition: 'She has been working here ___ three years.'",
      a: ["since", "during", "for"],
      correct: 2
    },
    {
      q: "What is the synonym of the corporate term 'To postpone'?",
      a: ["To forward", "To put off", "To cancel"],
      correct: 1
    },
    {
      q: "Fill in the blank: 'If we ___ the deadline, we will face penalties.'",
      a: ["miss", "lose", "forget"],
      correct: 0
    },
    {
      q: "What does the idiom 'Touch base' mean in a business context?",
      a: ["To sign a contract", "To contact or talk briefly", "To finish a task"],
      correct: 1
    }
  ],
  defecto: [
    {
      q: "¿Cuál es la principal ventaja de trabajar de forma ágil y colaborativa?",
      a: ["Reducir el papeleo", "Responder al cambio rápidamente y entregar valor iterativo", "Eliminar todas las reuniones"],
      correct: 1
    },
    {
      q: "¿Qué significa que una habilidad sea transversal o 'soft'?",
      a: ["Que es fácil de aprender", "Que aplica a múltiples ámbitos profesionales y relaciones interpersonales", "Que requiere un título universitario específico"],
      correct: 1
    },
    {
      q: "¿Qué método ayuda a priorizar tareas de manera efectiva?",
      a: ["Hacer primero lo más fácil", "La matriz de Eisenhower (Urgente vs Importante)", "Trabajar sin plan establecido"],
      correct: 1
    },
    {
      q: "¿Cuál es la base de la escucha activa en un equipo?",
      a: ["Interrumpir para aportar ideas rápido", "Prestar atención plena, entender, responder y recordar lo que se comunica", "Tomar notas de todo en silencio"],
      correct: 1
    },
    {
      q: "Para resolver un conflicto laboral de forma profesional, se debe...",
      a: ["Ignorar el tema hasta que pase", "Abordar la situación de forma objetiva, empática y buscando el bien común", "Culpar a un tercero en privado"],
      correct: 1
    }
  ]
};

const FAMILIES = [
  { id: 'Todas', name: 'Todas las Familias', icon: Layers, color: 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/50', activeColor: 'bg-slate-900 border-slate-900 text-white' },
  { id: 'Tecnología', name: 'Tecnología', icon: Code, color: 'bg-blue-50 border-blue-150 text-blue-700 hover:bg-blue-100/50', activeColor: 'bg-blue-600 border-blue-600 text-white' },
  { id: 'Habilidades Blandas', name: 'Habilidades Blandas', icon: Heart, color: 'bg-purple-50 border-purple-150 text-purple-700 hover:bg-purple-100/50', activeColor: 'bg-purple-600 border-purple-600 text-white' },
  { id: 'Metodología', name: 'Metodología', icon: Compass, color: 'bg-emerald-50 border-emerald-150 text-emerald-700 hover:bg-emerald-100/50', activeColor: 'bg-emerald-600 border-emerald-600 text-white' },
  { id: 'Negocio', name: 'Negocio', icon: Briefcase, color: 'bg-amber-50 border-amber-150 text-amber-700 hover:bg-amber-100/50', activeColor: 'bg-amber-600 border-amber-600 text-white' },
  { id: 'Legal y Cumplimiento', name: 'Legal y Cumplimiento', icon: Shield, color: 'bg-rose-50 border-rose-150 text-rose-700 hover:bg-rose-100/50', activeColor: 'bg-rose-600 border-rose-600 text-white' }
];

export const OtherSkills = () => {
  const { currentUser, setUsers, addCustomSkill, deleteCustomSkill } = useAuth();
  
  // Estado para desplegar el formulario manual
  const [showAddForm, setShowAddForm] = useState(false);

  // Estados para buscar en catálogo
  const [selectedFamily, setSelectedFamily] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCatalogSkill, setSelectedCatalogSkill] = useState(null);
  
  // Estado para autoevaluación inicial elegida al añadir la skill
  const [newSkillLevel, setNewSkillLevel] = useState(3);

  // Estados para CV parser simulado
  const [dragActive, setDragActive] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [parsingStep, setParsingStep] = useState(0); // 0: reposo, 1: analizando, 2: extrayendo, 3: completado
  const [parsingProgress, setParsingProgress] = useState(0);

  // Estados para el Modal de Test/Quiz
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizSkill, setQuizSkill] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Estados para el Modal de Certificado Homologado
  const [showCertModal, setShowCertModal] = useState(false);
  const [certSkill, setCertSkill] = useState(null);
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [uploadCertProgress, setUploadCertProgress] = useState(0);

  // Mapa de carga para solicitudes de aprobación
  const [requestingApprovalMap, setRequestingApprovalMap] = useState({});

  // Estados para trayectoria laboral en la compañía
  const [selectedPastRole, setSelectedPastRole] = useState('');
  const [selectedAntiquity, setSelectedAntiquity] = useState('1-2');
  const [isLoadingTrajectory, setIsLoadingTrajectory] = useState(false);
  const [trajectoryProgress, setTrajectoryProgress] = useState(0);

  // Filtrar habilidades añadidas por el usuario actual que son personalizadas/adicionales
  const customSkills = useMemo(() => {
    return (currentUser?.skills || []).filter(s => s && s.isCustom);
  }, [currentUser]);

  // Autocompletado reactivo de 5.000 habilidades
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 1) return [];
    const query = searchQuery.toLowerCase();
    return mockSkills.filter(skill => {
      const matchesFamily = selectedFamily === 'Todas' || skill.family === selectedFamily;
      const matchesName = skill.name.toLowerCase().includes(query);
      return matchesFamily && matchesName;
    }).slice(0, 10);
  }, [searchQuery, selectedFamily]);

  // Manejador del cambio de búsqueda con validación estricta
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
    // Si escribe y ya tenía algo seleccionado, se invalida a menos que coincida exactamente
    if (selectedCatalogSkill && value !== selectedCatalogSkill.name) {
      setSelectedCatalogSkill(null);
    }
  };

  // Seleccionar habilidad sugerida
  const handleSelectSuggestion = (skill) => {
    setSelectedCatalogSkill(skill);
    setSearchQuery(skill.name);
    setShowSuggestions(false);
    setNewSkillLevel(3); // Resetear nivel sugerido al cambiar de skill
  };

  // Helper genérico para actualizar propiedades de una habilidad agregada en AuthContext
  const updateCustomSkill = (skillId, updatedProperties) => {
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          skills: u.skills.map(s => s && s.id === skillId ? { ...s, ...updatedProperties } : s)
        };
      }
      return u;
    }));
  };

  // Manejar el drag over de archivos
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Manejar drop de archivos
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Manejar input de archivo
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Procesamiento simulado del CV extrayendo habilidades 100% reales del catálogo maestro
  const processFile = (file) => {
    setCvFile(file);
    setParsingStep(1);
    setParsingProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setParsingProgress(progress);

      if (progress === 40) {
        setParsingStep(2);
      } else if (progress === 80) {
        setParsingStep(3);
      } else if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          // Buscamos 3 habilidades reales de catálogo de diferentes familias para añadir
          const techSkill = mockSkills.find(s => s.family === 'Tecnología' && s.name.toLowerCase().includes('docker')) || mockSkills.find(s => s.family === 'Tecnología');
          const metodSkill = mockSkills.find(s => s.family === 'Metodología' && s.name.toLowerCase().includes('scrum')) || mockSkills.find(s => s.family === 'Metodología');
          const legalSkill = mockSkills.find(s => s.family === 'Legal y Cumplimiento' && s.name.toLowerCase().includes('blanqueo')) || mockSkills.find(s => s.family === 'Legal y Cumplimiento');

          const catalogSkillsToAdd = [techSkill, metodSkill, legalSkill].filter(Boolean);

          catalogSkillsToAdd.forEach((s, index) => {
            addCustomSkill(currentUser.id, {
              name: s.name,
              category: s.family,
              description: s.description,
              levels: s.levels,
              level: 3 + (index % 3), // Niveles de autoevaluación inicial simulados (3, 4, 5)
              isVerified: false,
              certificateName: '',
              approvalStatus: 'none'
            });
          });

          // Resetear estados
          setParsingStep(0);
          setCvFile(null);
          setParsingProgress(0);
        }, 800);
      }
    }, 200);
  };

  // Guardar habilidad manual
  const handleAddManual = (e) => {
    e.preventDefault();
    if (!selectedCatalogSkill) return;

    // Verificar si ya la tiene
    const alreadyExists = currentUser.skills.some(
      s => s && s.name.toLowerCase() === selectedCatalogSkill.name.toLowerCase()
    );

    if (alreadyExists) {
      alert(`La habilidad "${selectedCatalogSkill.name}" ya se encuentra en tu perfil.`);
      return;
    }

    addCustomSkill(currentUser.id, {
      name: selectedCatalogSkill.name,
      category: selectedCatalogSkill.family,
      description: selectedCatalogSkill.description,
      levels: selectedCatalogSkill.levels,
      level: newSkillLevel,
      isVerified: false,
      certificateName: '',
      approvalStatus: 'none'
    });

    // Resetear formulario
    setSelectedCatalogSkill(null);
    setSearchQuery('');
    setSelectedFamily('Todas');
    setNewSkillLevel(3);
    setShowAddForm(false);
  };

  // Cargar habilidades basadas en trayectoria y antigüedad
  const handleLoadTrajectory = (e) => {
    e.preventDefault();
    if (!selectedPastRole) return;

    const role = mockRoles.find(r => r.id === selectedPastRole);
    if (!role) return;

    setIsLoadingTrajectory(true);
    setTrajectoryProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setTrajectoryProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          role.requiredSkills.forEach(reqSkill => {
            // Verificar si el usuario ya tiene esa habilidad
            const alreadyExists = currentUser.skills.some(
              s => s && s.name.toLowerCase() === reqSkill.name.toLowerCase()
            );

            // Calcular el nivel según la antigüedad (reglas de antigüedad)
            let calculatedLevel = reqSkill.level;
            if (selectedAntiquity === 'less-1') {
              calculatedLevel = Math.max(1, reqSkill.level - 1);
            } else if (selectedAntiquity === '1-2') {
              calculatedLevel = reqSkill.level;
            } else if (selectedAntiquity === '3-5') {
              calculatedLevel = Math.min(5, reqSkill.level + 1);
            } else if (selectedAntiquity === 'more-5') {
              calculatedLevel = 5;
            }

            // Buscar en mockSkills para traer la descripción y requisitos oficiales
            const officialSkill = mockSkills.find(
              s => s.name.toLowerCase() === reqSkill.name.toLowerCase()
            ) || {
              family: 'Tecnología',
              description: 'Habilidad importada de tu trayectoria.',
              levels: { 1: '', 2: '', 3: '', 4: '' }
            };

            if (alreadyExists) {
              const existingSkill = currentUser.skills.find(
                s => s && s.name.toLowerCase() === reqSkill.name.toLowerCase()
              );
              updateCustomSkill(existingSkill.id, { level: calculatedLevel });
            } else {
              addCustomSkill(currentUser.id, {
                name: reqSkill.name,
                category: officialSkill.family,
                description: officialSkill.description,
                levels: officialSkill.levels,
                level: calculatedLevel,
                isVerified: false,
                certificateName: '',
                approvalStatus: 'none'
              });
            }
          });

          setIsLoadingTrajectory(false);
          setSelectedPastRole('');
          setSelectedAntiquity('1-2');
        }, 400);
      }
    }, 150);
  };

  // Lanzar test quiz
  const startQuiz = (skill) => {
    setQuizSkill(skill);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
    setShowQuizModal(true);
  };

  // Obtener preguntas basadas en el nombre del skill
  const currentQuestions = useMemo(() => {
    if (!quizSkill) return [];
    const name = quizSkill.name.toLowerCase();
    if (name.includes('python')) return QUIZ_BANK.python;
    if (name.includes('docker') || name.includes('kubernetes') || name.includes('contenedor')) return QUIZ_BANK.docker;
    if (name.includes('inglés') || name.includes('ingles') || name.includes('english') || name.includes('comunicación')) return QUIZ_BANK.ingles;
    return QUIZ_BANK.defecto;
  }, [quizSkill]);

  // Selección de respuesta en test
  const handleSelectAnswer = (idx) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    const correctIdx = currentQuestions[currentQuestionIndex].correct;
    if (idx === correctIdx) {
      setQuizScore(prev => prev + 1);
    }
  };

  // Avanzar en preguntas de test
  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      const finalScore = quizScore + (selectedAnswer === currentQuestions[currentQuestionIndex].correct ? 1 : 0);
      const approved = finalScore >= 3;
      if (approved) {
        updateCustomSkill(quizSkill.id, { isVerified: true, quizScore: finalScore });
      }
    }
  };

  // Lanzar modal de carga de certificado
  const handleOpenCertModal = (skill) => {
    setCertSkill(skill);
    setCertName('');
    setCertIssuer('');
    setUploadCertProgress(0);
    setIsUploadingCert(false);
    setShowCertModal(true);
  };

  // Guardar certificado simulando proceso empresarial con carga animada
  const handleSaveCertificate = (e) => {
    e.preventDefault();
    if (!certName.trim()) return;

    setIsUploadingCert(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadCertProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          updateCustomSkill(certSkill.id, { certificateName: certName.trim() });
          setShowCertModal(false);
          setCertSkill(null);
          setIsUploadingCert(false);
        }, 400);
      }
    }, 150);
  };

  // Solicitar aprobación de responsable (Carlos Martínez)
  const handleRequestApproval = (skillId) => {
    setRequestingApprovalMap(prev => ({ ...prev, [skillId]: true }));
    
    // Simula retraso de envío al mánager de 1.5s
    setTimeout(() => {
      updateCustomSkill(skillId, { approvalStatus: 'requested' });
      setRequestingApprovalMap(prev => ({ ...prev, [skillId]: false }));
    }, 1500);
  };

  // Simular la firma de aprobación interactiva en 1-click del mánager
  const handleSimulateManagerApproval = (skillId) => {
    updateCustomSkill(skillId, { approvalStatus: 'approved' });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. CABECERA */}
      <div className="bg-white/70 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="text-[#007A33]" />
            Habilidades Adicionales
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-xl">
            Busca y asóciate habilidades oficiales del catálogo corporativo de Cajamar. Elige tu autoevaluación, acredítalas mediante test de conocimientos, carga certificados homologados o solicita visto bueno a tu mánager.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setSelectedCatalogSkill(null);
            setSearchQuery('');
          }}
          className="px-4.5 py-2.5 bg-[#007A33] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/10 hover:bg-[#006028] transition-all flex items-center gap-2 shrink-0"
        >
          {showAddForm ? <X size={15} /> : <Plus size={15} />}
          <span>{showAddForm ? 'Cancelar' : 'Añadir Nueva Habilidad'}</span>
        </button>
      </div>

      {/* 2. FORMULARIO DE BÚSQUEDA DEL CATÁLOGO CORPORATIVO */}
      {showAddForm && (
        <form 
          onSubmit={handleAddManual}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-6 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Search size={16} className="text-[#007A33]" />
              Catálogo de Skills del Maestro
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Busca entre las 5.000 habilidades oficiales validadas por la entidad. No se permite la inclusión de habilidades inexistentes.</p>
          </div>
          
          {/* Selector de Familias */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Filter size={10} />
              Filtrar por Familia de Cajamar:
            </label>
            <div className="flex flex-wrap gap-2">
              {FAMILIES.map((fam) => {
                const Icon = fam.icon;
                const isSelected = selectedFamily === fam.id;
                return (
                  <button
                    key={fam.id}
                    type="button"
                    onClick={() => {
                      setSelectedFamily(fam.id);
                      setSelectedCatalogSkill(null);
                      setSearchQuery('');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold rounded-full border transition-all ${
                      isSelected ? fam.activeColor : `${fam.color} border-slate-200`
                    }`}
                  >
                    <Icon size={12} />
                    <span>{fam.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 relative">
            {/* Campo Autocomplete */}
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Buscador Asistido</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={`Escribe para buscar habilidades en ${selectedFamily === 'Todas' ? 'todas las familias' : `la familia ${selectedFamily}`}...`}
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold"
                  autoComplete="off"
                />
                <Search size={14} className="text-slate-400 absolute left-3 top-3.5" />
                {selectedCatalogSkill && (
                  <Check size={14} className="text-emerald-500 absolute right-3 top-3.5" />
                )}
              </div>

              {/* Caja de Sugerencias */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-50">
                  {filteredSuggestions.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(skill)}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex justify-between items-center group"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="text-xs font-bold text-slate-700 truncate group-hover:text-emerald-700">{skill.name}</p>
                        <p className="text-[9px] text-slate-400 truncate mt-0.5">{skill.description}</p>
                      </div>
                      <span className="shrink-0 text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-[#007A33] border border-emerald-100/50">
                        {skill.family}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Indicador en caso de no encontrar */}
              {showSuggestions && searchQuery && filteredSuggestions.length === 0 && !selectedCatalogSkill && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-rose-100 rounded-xl p-3 shadow-xl z-50 text-center space-y-1">
                  <p className="text-xs font-bold text-rose-600 flex items-center justify-center gap-1.5">
                    <AlertCircle size={13} />
                    Habilidad no encontrada
                  </p>
                  <p className="text-[9px] text-slate-400">El catálogo maestro no contiene esta skill. Por favor, selecciona una habilidad de la lista sugerida.</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. VISUALIZADOR DE LA SKILL SELECCIONADA CON AUTOEVALUACIÓN Y EXPECTATIVAS */}
          {selectedCatalogSkill && (
            <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-5 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-[#007A33] text-white tracking-wider">
                    {selectedCatalogSkill.family}
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-sm mt-1">{selectedCatalogSkill.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{selectedCatalogSkill.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCatalogSkill(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </div>

              {/* SELECCIÓN DE AUTOEVALUACIÓN INICIAL */}
              <div className="space-y-2 border-t border-emerald-100/30 pt-4">
                <label className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">1. Tu nivel de Autoevaluación Inicial:</label>
                <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-200/50 rounded-xl max-w-xs shadow-xs">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNewSkillLevel(num)}
                      className="focus:outline-none hover:scale-110 transition-transform"
                    >
                      <Star 
                        size={20} 
                        className={`transition-colors ${
                          num <= newSkillLevel 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-slate-200 hover:text-amber-300'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-slate-700 ml-2">Nivel {newSkillLevel}</span>
                </div>
                <p className="text-[9px] text-slate-400 italic mt-1">Elige tu nivel autopercibido inicial para esta competencia antes de añadirla.</p>
              </div>

              {/* Grid de los 4 Niveles Oficiales */}
              <div className="space-y-2 border-t border-emerald-100/30 pt-4">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">2. Requisitos y expectativas de Cajamar por Nivel:</span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                  {[1, 2, 3, 4].map((lvlNum) => (
                    <div key={lvlNum} className="bg-white/80 rounded-xl p-3 border border-slate-100 flex flex-col justify-between shadow-xxs">
                      <span className="text-[9px] font-bold text-emerald-700">Nivel {lvlNum}</span>
                      <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                        {selectedCatalogSkill.levels?.[lvlNum] || "Definición del nivel no disponible."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!selectedCatalogSkill}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 ${
                selectedCatalogSkill 
                  ? 'bg-[#007A33] hover:bg-[#006028] text-white cursor-pointer shadow-emerald-700/10' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <Check size={14} />
              <span>Guardar en Perfil con Nivel {newSkillLevel}</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. PARSEO DE CV & TRAYECTORIA LABORAL (SIDE-BY-SIDE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LADO IZQUIERDO: PARSEO DE CV CON IA */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`bg-white rounded-3xl p-6 border-2 border-dashed shadow-xs transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px] text-center group ${
            dragActive 
              ? 'border-emerald-500 bg-emerald-50/20' 
              : 'border-slate-200 hover:border-emerald-300 bg-slate-50/30 hover:bg-slate-50/50'
          }`}
        >
          {parsingStep === 0 ? (
            <div className="space-y-3.5 max-w-sm">
              <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 shadow-sm mx-auto transition-transform group-hover:-translate-y-0.5 duration-300">
                <UploadCloud size={24} />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-700">Arrastra tu Curriculum Vitae o haz clic</h3>
                <p className="text-[10px] text-slate-400 mt-1">El motor de IA escaneará tu CV y extraerá de inmediato habilidades que coincidan con el catálogo oficial.</p>
              </div>
              <label className="px-3.5 py-1.5 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-white text-[10px] font-extrabold text-slate-600 inline-block cursor-pointer transition-all">
                Examinar archivo
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          ) : (
            <div className="w-full max-w-xs space-y-4 animate-pulse">
              <div className="w-10 h-10 bg-emerald-50 text-[#007A33] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <FileText size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-700">
                  {parsingStep === 1 && "Leyendo Curriculum Vitae..."}
                  {parsingStep === 2 && "Analizando competencias..."}
                  {parsingStep === 3 && "Mapeando habilidades..."}
                </h4>
                <p className="text-[9px] text-slate-400">{cvFile?.name || 'Archivo de CV'}</p>
              </div>
              {/* Barra de progreso */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#007A33] transition-all duration-300 rounded-full"
                  style={{ width: `${parsingProgress}%` }}
                ></div>
              </div>
              <span className="text-[9px] font-extrabold text-slate-400">{parsingProgress}% Analizado</span>
            </div>
          )}
        </div>

        {/* LADO DERECHO: TRAYECTORIA EN LA COMPAÑÍA (ROLES ANTERIORES) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between min-h-[220px] gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-50 text-[#007A33] rounded-xl flex items-center justify-center shrink-0">
                <History size={16} />
              </div>
              <h3 className="text-xs font-black text-slate-700">Cargar Habilidades de Trayectoria</h3>
            </div>
            <p className="text-[9.5px] text-slate-400 leading-normal">
              Importa competencias oficiales asociando automáticamente tus puestos pasados con niveles de autoevaluación adaptados a tu antigüedad.
            </p>
          </div>

          <div className="space-y-3">
            {/* Selector de Rol */}
            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">1. Seleccionar Rol Anterior</label>
              <select
                value={selectedPastRole}
                onChange={(e) => setSelectedPastRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold bg-white cursor-pointer text-slate-800"
              >
                <option value="">-- Elige un puesto anterior --</option>
                {mockRoles.map((role) => (
                  <option key={role.id} value={role.id}>{role.title} ({role.level})</option>
                ))}
              </select>
            </div>

            {/* Antigüedad */}
            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">2. Antigüedad en el Puesto</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'less-1', label: '< 1 año' },
                  { id: '1-2', label: '1 - 2 años' },
                  { id: '3-5', label: '3 - 5 años' },
                  { id: 'more-5', label: '> 5 años' }
                ].map((item) => {
                  const isSel = selectedAntiquity === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedAntiquity(item.id)}
                      className={`py-1.5 text-[8.5px] font-black rounded-lg border transition-all text-center ${
                        isSel
                          ? 'bg-[#007A33] border-[#007A33] text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ficha explicativa de Reglas */}
            <div className="bg-emerald-50/20 border border-emerald-100/30 rounded-xl p-2.5 text-[8px] text-emerald-850 space-y-0.5 leading-normal">
              <span className="font-black text-[#007A33] uppercase block tracking-wider mb-0.5">ℹ️ Regla de Niveles según permanencia:</span>
              <p>• <strong>Menos de 1 año:</strong> Nivel base del rol - 1 (mínimo nivel 1)</p>
              <p>• <strong>Entre 1 y 2 años:</strong> Nivel requerido base del rol</p>
              <p>• <strong>Entre 3 y 5 años:</strong> Nivel requerido base del rol + 1 (máximo nivel 5)</p>
              <p>• <strong>Más de 5 años:</strong> Nivel máximo 5 (dominio absoluto)</p>
            </div>
          </div>

          <div>
            {isLoadingTrajectory ? (
              <div className="space-y-2 py-1">
                <div className="flex justify-between items-center text-[9px] font-black text-slate-450 uppercase">
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={10} className="animate-spin text-[#007A33]" />
                    Mapeando trayectoria e importando habilidades...
                  </span>
                  <span>{trajectoryProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#007A33] transition-all duration-200 rounded-full"
                    style={{ width: `${trajectoryProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLoadTrajectory}
                disabled={!selectedPastRole}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedPastRole
                    ? 'bg-[#007A33] hover:bg-[#006028] text-white cursor-pointer shadow-md shadow-emerald-700/10'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                <History size={13} />
                <span>Cargar Habilidades de Trayectoria</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 4. LISTADO DE HABILIDADES ADICIONALES ACREDITABLES EN FORMATO LISTA */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-800">Mis Habilidades Adicionales</h2>
          <p className="text-[10px] text-slate-400">Consola de homologación y validación de tus habilidades añadidas del Catálogo Maestro.</p>
        </div>

        {customSkills.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center space-y-3 min-h-[240px]">
            <div className="w-14 h-14 bg-slate-50 border border-dashed border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <div className="space-y-1 max-w-xs">
              <h3 className="text-xs font-bold text-slate-700">Sin habilidades adicionales añadidas</h3>
              <p className="text-[10px] text-slate-400">Sube tu CV para cargarlas de forma automática o asóciate habilidades corporativas con el botón superior.</p>
            </div>
          </div>
        ) : (
          // FORMATO LISTA VERTICAL (Un solo ítem ancho por fila)
          <div className="flex flex-col gap-4.5">
            {customSkills.map((skill) => {
              if (!skill) return null;
              
              const isTech = skill.category === 'Tecnología' || skill.category === 'Metodología';
              const isLang = skill.category === 'Idiomas';
              
              const statusDetails = (() => {
                if (skill.approvalStatus === 'approved') {
                  return {
                    text: 'Validado por responsable',
                    style: 'bg-emerald-50 text-emerald-700 border-emerald-150 font-black',
                    icon: <CheckCircle2 size={12} className="text-[#007A33] shrink-0" />
                  };
                }
                if (skill.certificateName) {
                  return {
                    text: 'Validado por certificación',
                    style: 'bg-blue-50 text-blue-700 border-blue-150 font-black',
                    icon: <Award size={12} className="text-blue-600 shrink-0" />
                  };
                }
                if (skill.isVerified) {
                  return {
                    text: 'Validado por test',
                    style: 'bg-amber-50 text-amber-700 border-amber-150 font-black',
                    icon: <FileCheck size={12} className="text-amber-600 shrink-0" />
                  };
                }
                return {
                  text: 'Pendiente de validar',
                  style: 'bg-slate-50 text-slate-500 border-slate-200 font-semibold',
                  icon: <Clock size={12} className="text-slate-400 shrink-0" />
                };
              })();

              const isRequestingApproval = requestingApprovalMap[skill.id];

              return (
                <div 
                  key={skill.id}
                  className="bg-white rounded-3xl p-5 border border-slate-100 hover:border-emerald-200 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">
                    
                    {/* Bloque Izquierdo + Central (Información y Status) */}
                    <div className="flex-1 space-y-3 min-w-0">
                      
                      {/* Cabecera: Familia e Habilidad */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-md inline-block uppercase tracking-wider shrink-0 ${
                          isTech 
                            ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                            : isLang 
                              ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                              : 'bg-emerald-50 text-[#007A33] border border-emerald-100'
                        }`}>
                          {skill.category}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-[#007A33] transition-colors truncate max-w-md" title={skill.name}>
                          {skill.name}
                        </h4>
                      </div>

                      {/* Descripción */}
                      <p className="text-[10px] text-slate-400 leading-relaxed max-w-4xl">
                        {skill.description || "Sin descripción corporativa asignada en este maestro."}
                      </p>

                      {/* Autoevaluación en Caliente y Status Único */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
                        
                        {/* Selector de Autoevaluación interactivo en formato estrella */}
                        <div className="flex items-center gap-1.5 bg-slate-50/50 px-2.5 py-1 border border-slate-100 rounded-lg shrink-0">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Tu Autoevaluación:</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => updateCustomSkill(skill.id, { level: star })}
                                className="focus:outline-none hover:scale-110 transition-transform"
                                title={`Actualizar a Nivel ${star}`}
                              >
                                <Star 
                                  size={13} 
                                  className={`transition-colors ${
                                    star <= (Number(skill.level) || 0)
                                      ? 'fill-amber-400 text-amber-400' 
                                      : 'text-slate-200 hover:text-amber-355'
                                  }`} 
                                />
                              </button>
                            ))}
                            <span className="text-[9px] font-black text-slate-600 ml-1.5">Nivel {skill.level || 0}</span>
                          </div>
                        </div>

                        {/* Campo de Estado Único */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] uppercase tracking-wider rounded-xl border ${statusDetails.style}`}>
                            {statusDetails.icon}
                            <span>{statusDetails.text}</span>
                          </div>
                          
                          {/* Helper para Solicitud Pendiente en Responsable */}
                          {skill.approvalStatus === 'requested' && (
                            <span className="text-[9px] font-extrabold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100 flex items-center gap-1 animate-pulse shrink-0">
                              ⏳ Solicitado a Carlos M.
                            </span>
                          )}

                          {/* Info adicional para Certificación si existe */}
                          {skill.certificateName && (
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg shrink-0" title={skill.certificateName}>
                              📄 {skill.certificateName}
                            </span>
                          )}
                        </div>

                      </div>

                    </div>

                    {/* Bloque Derecho (Barra de Botones de Acreditación / CRUD) */}
                    <div className="flex flex-row lg:flex-col gap-2 items-stretch shrink-0 w-full lg:w-48 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-5">
                      
                      {isRequestingApproval ? (
                        <div className="flex items-center justify-center gap-2 p-2 bg-emerald-50/50 border border-emerald-100 rounded-xl text-[9px] font-bold text-emerald-700 w-full animate-pulse text-center min-h-[75px]">
                          <Loader2 size={10} className="animate-spin text-[#007A33] shrink-0" />
                          <span>Enviando firma...</span>
                        </div>
                      ) : (
                        <>
                          {/* Test Acreditar */}
                          <button
                            onClick={() => startQuiz(skill)}
                            className={`py-1.5 px-3 rounded-xl border text-[9px] font-extrabold flex items-center justify-center gap-1.5 transition-all w-full shrink-0 ${
                              skill.isVerified 
                                ? 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                                : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 shadow-xs'
                            }`}
                          >
                            <Award size={11} />
                            <span>{skill.isVerified ? 'Repetir Test' : 'Hacer Test'}</span>
                          </button>

                          {/* Certificado Cargar */}
                          <button
                            onClick={() => handleOpenCertModal(skill)}
                            className="py-1.5 px-3 rounded-xl border bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 text-[9px] font-extrabold flex items-center justify-center gap-1.5 w-full transition-all shadow-xs shrink-0"
                          >
                            <FileUp size={11} />
                            <span>Cargar Título</span>
                          </button>

                          {/* Mánager Aprobación / Firma interactiva */}
                          {skill.approvalStatus === 'none' || !skill.approvalStatus ? (
                            <button
                              onClick={() => handleRequestApproval(skill.id)}
                              className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[9px] font-extrabold flex items-center justify-center gap-1.5 w-full transition-all shadow-xs shrink-0"
                            >
                              <CheckCircle2 size={11} />
                              <span>Solicitar Firma</span>
                            </button>
                          ) : skill.approvalStatus === 'requested' ? (
                            <button
                              onClick={() => handleSimulateManagerApproval(skill.id)}
                              className="py-2 px-3 bg-gradient-to-r from-emerald-600 to-[#005021] text-white hover:brightness-110 rounded-xl text-[9px] font-black flex items-center justify-center gap-1.5 w-full shadow-md shadow-emerald-950/20 border border-[#007A33] animate-bounce shrink-0"
                            >
                              <Sparkles size={11} className="text-amber-300 shrink-0" />
                              <span>Simular Firma Carlos</span>
                            </button>
                          ) : (
                            <div className="py-1.5 px-3 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-[9px] font-extrabold flex items-center justify-center gap-1 w-full select-none shrink-0">
                              <Check size={11} />
                              <span>Aprobado Mánager</span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Botón de Borrar Habilidad */}
                      <button
                        onClick={() => deleteCustomSkill(currentUser.id, skill.id)}
                        className="py-1.5 px-3 rounded-xl border border-red-150 bg-red-50 hover:bg-red-150 hover:text-red-700 text-red-600 text-[9px] font-bold flex items-center justify-center gap-1.5 transition-colors w-full lg:mt-3"
                        title="Eliminar skill de mi perfil"
                      >
                        <Trash2 size={11} />
                        <span>Eliminar Habilidad</span>
                      </button>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. MODAL DE AÑADIR CERTIFICADO HOMOLOGADO */}
      {showCertModal && certSkill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <form 
            onSubmit={handleSaveCertificate}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col"
          >
            {/* Cabecera */}
            <div className="bg-gradient-to-r from-[#005021] to-[#007A33] text-white p-4.5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-blue-300" />
                <div>
                  <h3 className="font-extrabold text-sm">Añadir Certificado Homologado</h3>
                  <p className="text-[9px] text-emerald-200 font-medium">Asociar a: {certSkill.name}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowCertModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
                disabled={isUploadingCert}
              >
                <X size={16} />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
              {!isUploadingCert ? (
                <>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Nombre del Certificado Oficial</label>
                      <input 
                        type="text"
                        value={certName}
                        onChange={(e) => setCertName(e.target.value)}
                        placeholder="Ej. AWS Certified Solutions Architect, TOEFL C1, Scrum Alliance..."
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Entidad Emisora</label>
                      <input 
                        type="text"
                        value={certIssuer}
                        onChange={(e) => setCertIssuer(e.target.value)}
                        placeholder="Ej. Amazon Web Services, Scrum.org, Pearson..."
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Mock File Uploader */}
                  <div className="p-4 border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 bg-slate-50 cursor-pointer">
                    <FileText size={24} className="text-slate-400" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-600">Sube el documento justificativo (.pdf, .png)</p>
                      <p className="text-[8px] text-slate-400 mt-0.5">Máx 5MB de tamaño de archivo</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCertModal(false)}
                      className="flex-1 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/10 transition-all"
                    >
                      Cargar Certificado
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <Loader2 size={36} className="animate-spin text-blue-600 mx-auto" />
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black text-slate-700">Verificando y subiendo certificado digital...</h4>
                    <p className="text-[9px] text-slate-400">Analizando metadatos de homologación de Cajamar</p>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full max-w-xs bg-slate-100 h-1.5 rounded-full overflow-hidden mx-auto">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-150 rounded-full"
                      style={{ width: `${uploadCertProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400">{uploadCertProgress}% Verificado</span>
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* 6. MODAL DE TEST / QUIZ */}
      {showQuizModal && quizSkill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-[460px]">
            
            {/* Cabecera del Modal */}
            <div className="bg-gradient-to-r from-emerald-800 to-[#005021] text-white p-4.5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-amber-300" />
                <div>
                  <h3 className="font-extrabold text-sm">Test de Conocimientos</h3>
                  <p className="text-[9px] text-emerald-200 font-medium">Validación: {quizSkill.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowQuizModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 flex-1 min-h-0 overflow-y-auto flex flex-col justify-between">
              {!quizFinished ? (
                // Pantalla de Pregunta
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Progreso */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
                        <span>Pregunta {currentQuestionIndex + 1} de {currentQuestions.length}</span>
                        <span>{Math.round(((currentQuestionIndex) / currentQuestions.length) * 100)}% Completado</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${((currentQuestionIndex) / currentQuestions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Enunciado */}
                    <h4 className="font-extrabold text-slate-800 text-sm md:text-base leading-snug">
                      {currentQuestions[currentQuestionIndex].q}
                    </h4>
                  </div>

                  {/* Opciones */}
                  <div className="space-y-2.5 my-4">
                    {currentQuestions[currentQuestionIndex].a.map((option, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect = idx === currentQuestions[currentQuestionIndex].correct;
                      const hasSelected = selectedAnswer !== null;

                      let btnStyle = "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/10";
                      if (hasSelected) {
                        if (isCorrect) {
                          btnStyle = "border-emerald-500 bg-emerald-50/50 text-[#007A33]";
                        } else if (isSelected) {
                          btnStyle = "border-red-500 bg-red-50/50 text-red-700";
                        } else {
                          btnStyle = "border-slate-100 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectAnswer(idx)}
                          disabled={hasSelected}
                          className={`w-full p-3.5 border rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {hasSelected && isCorrect && <CheckCircle2 size={14} className="text-emerald-500 shrink-0 ml-2" />}
                          {hasSelected && isSelected && !isCorrect && <AlertCircle size={14} className="text-red-500 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Botón de Siguiente */}
                  <div className="flex justify-end pt-2 shrink-0">
                    <button
                      onClick={handleNextQuestion}
                      disabled={selectedAnswer === null}
                      className="px-4.5 py-2 bg-[#007A33] hover:bg-[#006028] disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-md disabled:shadow-none transition-all flex items-center gap-1.5"
                    >
                      <span>{currentQuestionIndex + 1 === currentQuestions.length ? 'Finalizar' : 'Siguiente'}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                // Pantalla de Resultados
                <div className="text-center py-4 flex flex-col justify-between items-center h-full">
                  {quizScore >= 3 ? (
                    // Aprobado
                    <div className="space-y-4 my-auto">
                      <div className="w-18 h-18 bg-emerald-50 border border-emerald-100 text-[#007A33] rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
                        <Award size={40} />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-base font-black text-slate-800">¡Enhorabuena, {currentUser.name}!</h4>
                        <p className="text-xs text-slate-500 px-4">
                          Has superado con éxito el test de validación de **{quizSkill.name}** obteniendo una puntuación de **{quizScore} / 5**.
                        </p>
                      </div>
                      <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 max-w-xs mx-auto text-left relative overflow-hidden">
                        <Award size={90} className="absolute -right-6 -bottom-6 text-emerald-800/5 rotate-12" />
                        <span className="text-[8px] font-black text-[#007A33] uppercase tracking-wider block">Certificación CajamarSkills</span>
                        <span className="text-xs font-extrabold text-slate-800 block mt-1">{quizSkill.name} - Nivel Verificado</span>
                        <span className="text-[9px] font-bold text-slate-400 block mt-1.5">Fecha: {new Date().toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  ) : (
                    // Suspendido
                    <div className="space-y-4 my-auto">
                      <div className="w-18 h-18 bg-amber-50 border border-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                        <AlertCircle size={40} />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-base font-black text-slate-800">Sigue intentándolo</h4>
                        <p className="text-xs text-slate-500 px-4">
                          Has obtenido **{quizScore} de 5** puntos en el test. Necesitas al menos **3 aciertos** para certificar esta habilidad.
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        ¡No te preocupes! Puedes repasar conceptos clave en la sección de **MyUpskilling** y volver a intentar el test cuando quieras.
                      </p>
                    </div>
                  )}

                  {/* Acciones de cierre */}
                  <div className="w-full pt-4 shrink-0 flex gap-3">
                    {quizScore < 3 && (
                      <button
                        onClick={() => {
                          setCurrentQuestionIndex(0);
                          setSelectedAnswer(null);
                          setQuizScore(0);
                          setQuizFinished(false);
                        }}
                        className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw size={14} />
                        <span>Reintentar</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowQuizModal(false)}
                      className="flex-1 py-2.5 bg-[#007A33] hover:bg-[#006028] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <ThumbsUp size={14} />
                      <span>{quizScore >= 3 ? 'Aceptar y Certificar' : 'Aceptar'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
