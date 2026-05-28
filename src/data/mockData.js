export const mockUsers = [
  {
    id: 1,
    name: "Ana García",
    role: "Analista Programador",
    department: "Tecnología",
    profile: "Employee",
    avatar: "https://i.pravatar.cc/150?u=1",
    managerId: 2,
    skills: [
      { id: "s1", name: "React", level: 4, required: 4, category: "Técnica" },
      { id: "s2", name: "Node.js", level: 2, required: 4, category: "Técnica" },
      { id: "s3", name: "Agile", level: 3, required: 3, category: "Metodología" },
      { id: "s7", name: "SQL", level: 2, required: 3, category: "Técnica" },
      { id: "s8", name: "Comunicación", level: 3, required: 4, category: "Soft Skill" },
      { id: "s4", name: "Liderazgo", level: 2, required: 3, category: "Soft Skill" },
      { id: "s5", name: "Gestión de Talento", level: 3, required: 3, category: "Soft Skill" }
    ],
    badges: [
      { badgeId: "b1", date: "2025-11-12", status: "Obtenido" },
      { badgeId: "b2", date: "2026-02-15", status: "Obtenido" },
      { badgeId: "b3", date: "2026-04-01", status: "En progreso" }
    ]
  },
  {
    id: 2,
    name: "Carlos Martínez",
    role: "Tech Lead",
    department: "Tecnología",
    profile: "Manager",
    avatar: "https://i.pravatar.cc/150?u=2",
    managerId: 3,
    skills: [
      { id: "s1", name: "React", level: 5, required: 5, category: "Técnica" },
      { id: "s2", name: "Arquitectura Cloud", level: 3, required: 5, category: "Técnica" },
      { id: "s4", name: "Liderazgo", level: 4, required: 4, category: "Soft Skill" },
      { id: "s3", name: "Agile", level: 5, required: 4, category: "Metodología" }
    ],
    badges: [
      { badgeId: "b4", date: "2025-08-20", status: "Obtenido" }
    ]
  },
  {
    id: 3,
    name: "Elena Rodríguez",
    role: "HR Business Partner",
    department: "Recursos Humanos",
    profile: "RRHH",
    avatar: "https://i.pravatar.cc/150?u=3",
    managerId: null,
    skills: [
      { id: "s5", name: "Gestión de Talento", level: 5, required: 5, category: "Soft Skill" },
      { id: "s6", name: "Comunicación", level: 5, required: 4, category: "Soft Skill" }
    ],
    badges: []
  },
  {
    id: 4,
    name: "Laura Gómez",
    role: "Analista Programador",
    department: "Tecnología",
    profile: "Employee",
    avatar: "https://i.pravatar.cc/150?u=4",
    managerId: 2,
    skills: [
      { id: "s1", name: "React", level: 2, required: 3, category: "Técnica" },
      { id: "s2", name: "Node.js", level: 1, required: 2, category: "Técnica" },
      { id: "s3", name: "Agile", level: 2, required: 2, category: "Metodología" }
    ],
    badges: []
  },
  {
    id: 5,
    name: "Javier Ruiz",
    role: "Senior Backend Developer",
    department: "Tecnología",
    profile: "Employee",
    avatar: "https://i.pravatar.cc/150?u=5",
    managerId: 7,
    skills: [
      { id: "s2", name: "Node.js", level: 4, required: 4, category: "Técnica" },
      { id: "s7", name: "SQL", level: 4, required: 4, category: "Técnica" },
      { id: "s3", name: "Agile", level: 3, required: 3, category: "Metodología" },
      { id: "s4", name: "Arquitectura Cloud", level: 2, required: 3, category: "Técnica" }
    ],
    badges: [
      { badgeId: "b5", date: "2025-10-10", status: "Obtenido" }
    ]
  },
  {
    id: 6,
    name: "Sofía Ramos",
    role: "Scrum Master",
    department: "Tecnología",
    profile: "Employee",
    avatar: "https://i.pravatar.cc/150?u=6",
    managerId: 9,
    skills: [
      { id: "s3", name: "Agile", level: 5, required: 5, category: "Metodología" },
      { id: "s6", name: "Comunicación", level: 4, required: 4, category: "Soft Skill" },
      { id: "s4", name: "Liderazgo", level: 3, required: 4, category: "Soft Skill" }
    ],
    badges: [
      { badgeId: "b2", date: "2025-05-18", status: "Obtenido" }
    ]
  },
  {
    id: 7,
    name: "Miguel Hernández",
    role: "Lead Architect",
    department: "Tecnología",
    profile: "Manager",
    avatar: "https://i.pravatar.cc/150?u=7",
    managerId: 2,
    skills: [
      { id: "s4", name: "Arquitectura Cloud", level: 5, required: 5, category: "Técnica" },
      { id: "s2", name: "Node.js", level: 5, required: 5, category: "Técnica" },
      { id: "s7", name: "SQL", level: 4, required: 4, category: "Técnica" },
      { id: "s5", name: "Liderazgo", level: 4, required: 4, category: "Soft Skill" }
    ],
    badges: [
      { badgeId: "b4", date: "2025-03-22", status: "Obtenido" }
    ]
  },
  {
    id: 8,
    name: "Lucía Sanz",
    role: "HR Specialist",
    department: "Recursos Humanos",
    profile: "Employee",
    avatar: "https://i.pravatar.cc/150?u=8",
    managerId: 3,
    skills: [
      { id: "s5", name: "Gestión de Talento", level: 3, required: 4, category: "Soft Skill" },
      { id: "s6", name: "Comunicación", level: 4, required: 4, category: "Soft Skill" }
    ],
    badges: []
  },
  {
    id: 9,
    name: "Daniel Alarcón",
    role: "Manager de Canales",
    department: "Tecnología",
    profile: "Manager",
    avatar: "https://i.pravatar.cc/150?u=9",
    managerId: null,
    skills: [
      { id: "s5", name: "Liderazgo", level: 5, required: 5, category: "Soft Skill" },
      { id: "s6", name: "Comunicación", level: 5, required: 5, category: "Soft Skill" },
      { id: "s3", name: "Agile", level: 4, required: 4, category: "Metodología" }
    ],
    badges: [
      { badgeId: "b6", date: "2024-12-05", status: "Obtenido" }
    ]
  },
  {
    id: 10,
    name: "Marta Ortiz",
    role: "Frontend Developer Senior",
    department: "Tecnología",
    profile: "Employee",
    avatar: "https://i.pravatar.cc/150?u=10",
    managerId: 9,
    skills: [
      { id: "s1", name: "React", level: 5, required: 5, category: "Técnica" },
      { id: "s2", name: "Node.js", level: 3, required: 4, category: "Técnica" },
      { id: "s3", name: "Agile", level: 4, required: 4, category: "Metodología" },
      { id: "s6", name: "Comunicación", level: 4, required: 3, category: "Soft Skill" }
    ],
    badges: [
      { badgeId: "b1", date: "2025-11-20", status: "Obtenido" }
    ]
  },
  {
    id: 11,
    name: "David Castro",
    role: "Banca Digital Specialist",
    department: "Banca Digital",
    profile: "Employee",
    avatar: "https://i.pravatar.cc/150?u=11",
    managerId: 9,
    skills: [
      { id: "s1", name: "React", level: 4, required: 4, category: "Técnica" },
      { id: "s7", name: "SQL", level: 3, required: 3, category: "Técnica" },
      { id: "s6", name: "Comunicación", level: 3, required: 3, category: "Soft Skill" }
    ],
    badges: []
  }
];


export const mockBadgesCatalog = [
  { id: "b1", title: "React Ninja", description: "Demuestra dominio experto en React y su ecosistema.", icon: "⚛️", skillsValidated: ["React"], levelGranted: 4 },
  { id: "b2", title: "Agile Master", description: "Certifica habilidades avanzadas en gestión de proyectos ágiles y Scrum.", icon: "🏃‍♂️", skillsValidated: ["Agile"], levelGranted: 4 },
  { id: "b3", title: "Problem Solver", description: "Capacidad sobresaliente para resolver problemas técnicos complejos.", icon: "🧩", skillsValidated: ["Resolución de Problemas"], levelGranted: 3 },
  { id: "b4", title: "Cloud Expert", description: "Arquitectura e implementación en la nube.", icon: "☁️", skillsValidated: ["Arquitectura Cloud", "AWS"], levelGranted: 5 },
  { id: "b5", title: "Data Wizard", description: "Análisis de datos y modelado avanzado.", icon: "📊", skillsValidated: ["SQL", "Data Science"], levelGranted: 3 },
  { id: "b6", title: "Comunicador Estrella", description: "Excelentes habilidades de comunicación y presentación.", icon: "⭐", skillsValidated: ["Comunicación"], levelGranted: 4 },
];

export const mockCourses = [
  { id: "c1", title: "Certificación AWS Solutions Architect", skills: ["Arquitectura Cloud"], duration: "40h", type: "Técnico", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop", cost: 1500, targetLevel: 5, status: "Pendiente" },
  { id: "c2", title: "Masterclass Node.js Avanzado", skills: ["Node.js"], duration: "15h", type: "Técnico", image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2070&auto=format&fit=crop", cost: 0, targetLevel: 4, status: "Aprobado" },
  { id: "c3", title: "Liderazgo de Equipos Ágiles", skills: ["Liderazgo", "Agile"], duration: "20h", type: "Soft Skill", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop", cost: 350, targetLevel: 4, status: "Pendiente" },
  { id: "c4", title: "Bootcamp Backend con Node y NestJS", skills: ["Node.js"], duration: "60h", type: "Técnico", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop", cost: 1200, targetLevel: 4, status: "Pendiente" },
  { id: "c5", title: "SQL para Análisis de Datos", skills: ["SQL"], duration: "10h", type: "Técnico", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop", cost: 0, targetLevel: 3, status: "Aprobado" },
  { id: "c6", title: "Comunicación Efectiva en Remoto", skills: ["Comunicación"], duration: "5h", type: "Soft Skill", image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop", cost: 150, targetLevel: 4, status: "Pendiente" }
];

export const mockOpportunities = [
  { 
    id: "o1", 
    title: "Senior Frontend Developer", 
    department: "Banca Digital", 
    location: "Madrid / Híbrido",
    description: "Buscamos un experto en React para liderar el rediseño de nuestra plataforma transaccional.",
    requiredSkills: [
      { name: "React", level: 5 },
      { name: "Node.js", level: 3 },
      { name: "Liderazgo", level: 3 },
      { name: "Agile", level: 4 }
    ]
  },
  { 
    id: "o2", 
    title: "Cloud Architect", 
    department: "Infraestructura", 
    location: "Remoto",
    description: "Diseño y escalado de la infraestructura en la nube, optimizando costes y seguridad.",
    requiredSkills: [
      { name: "Arquitectura Cloud", level: 5 },
      { name: "SQL", level: 4 },
      { name: "Liderazgo", level: 4 },
      { name: "Comunicación", level: 4 }
    ]
  },
  { 
    id: "o3", 
    title: "Scrum Master", 
    department: "Metodología", 
    location: "Valencia / Presencial",
    description: "Facilitador de equipos ágiles, asegurando el cumplimiento de las ceremonias y eliminación de bloqueos.",
    requiredSkills: [
      { name: "Agile", level: 5 },
      { name: "Comunicación", level: 5 },
      { name: "Liderazgo", level: 4 },
      { name: "Gestión de Talento", level: 3 }
    ]
  }
];

export const mockRoles = [
  { 
    id: "r1", 
    title: "Analista Programador", 
    level: "Junior", 
    family: "Ingeniería de Software",
    description: "Desarrollador enfocado en la implementación de componentes de software.",
    requiredSkills: [
      { name: "React", level: 3, priority: "Crítica" },
      { name: "Node.js", level: 2, priority: "Primaria" },
      { name: "Agile", level: 2, priority: "Secundaria" }
    ]
  },
  { 
    id: "r6", 
    title: "Analista Programador", 
    level: "Senior", 
    family: "Ingeniería de Software",
    description: "Desarrollador experimentado capaz de diseñar soluciones medianas y dar soporte a perfiles junior.",
    requiredSkills: [
      { name: "React", level: 4, priority: "Crítica" },
      { name: "Node.js", level: 3, priority: "Primaria" },
      { name: "SQL", level: 3, priority: "Secundaria" }
    ]
  },
  { 
    id: "r7", 
    title: "Analista Programador", 
    level: "Lead", 
    family: "Ingeniería de Software",
    description: "Líder técnico de desarrollo enfocado en calidad de código y diseño de componentes robustos.",
    requiredSkills: [
      { name: "React", level: 5, priority: "Crítica" },
      { name: "Node.js", level: 4, priority: "Crítica" },
      { name: "Liderazgo", level: 3, priority: "Primaria" }
    ]
  },
  { 
    id: "r2", 
    title: "Senior Developer", 
    level: "Senior", 
    family: "Ingeniería de Software",
    description: "Desarrollador experto capaz de diseñar soluciones complejas y guiar al equipo.",
    requiredSkills: [
      { name: "React", level: 5, priority: "Crítica" },
      { name: "Node.js", level: 4, priority: "Crítica" },
      { name: "SQL", level: 4, priority: "Primaria" },
      { name: "Agile", level: 4, priority: "Secundaria" }
    ]
  },
  { 
    id: "r3", 
    title: "Tech Lead", 
    level: "Lead", 
    family: "Management Técnico",
    description: "Líder técnico responsable de la arquitectura del proyecto y coordinación del equipo técnico.",
    requiredSkills: [
      { name: "Liderazgo", level: 4, priority: "Crítica" },
      { name: "Arquitectura Cloud", level: 4, priority: "Crítica" },
      { name: "React", level: 5, priority: "Primaria" },
      { name: "Comunicación", level: 4, priority: "Secundaria" }
    ]
  },
  { 
    id: "r4", 
    title: "Arquitecto de Software", 
    level: "Expert", 
    family: "Arquitectura",
    description: "Responsable de las decisiones de diseño de alto nivel y estándares técnicos.",
    requiredSkills: [
      { name: "Arquitectura Cloud", level: 5, priority: "Crítica" },
      { name: "Node.js", level: 5, priority: "Primaria" },
      { name: "Liderazgo", level: 3, priority: "Secundaria" },
      { name: "SQL", level: 4, priority: "Secundaria" }
    ]
  },
  { 
    id: "r5", 
    title: "Agile Coach", 
    level: "Senior", 
    family: "Metodología",
    description: "Facilitador experto en marcos de trabajo ágiles y transformación organizativa.",
    requiredSkills: [
      { name: "Agile", level: 5, priority: "Crítica" },
      { name: "Comunicación", level: 5, priority: "Crítica" },
      { name: "Liderazgo", level: 4, priority: "Primaria" }
    ]
  }
];

export const mockSkillDetails = {
  "React": {
    description: "Desarrollo de interfaces de usuario interactivas y modulares utilizando la biblioteca React. Incluye la gestión del estado, ciclo de vida de componentes y optimización de rendimiento.",
    levels: {
      1: "Comprende la sintaxis básica (JSX) y puede crear componentes funcionales simples. Necesita supervisión constante.",
      2: "Desarrolla componentes complejos, usa hooks comunes (useState, useEffect) y gestiona el estado local adecuadamente.",
      3: "Domina la gestión de estado global, optimiza el rendimiento y aplica patrones de diseño avanzados de React.",
      4: "Experto en la arquitectura completa de frontend con React, define estándares y lidera la adopción de nuevas características."
    }
  },
  "Node.js": {
    description: "Desarrollo de aplicaciones backend escalables y asíncronas utilizando el entorno de ejecución Node.js. Abarca desde APIs REST hasta microservicios.",
    levels: {
      1: "Conoce los conceptos básicos, sabe crear un servidor simple y gestionar rutas básicas con Express.",
      2: "Desarrolla APIs completas, interactúa con bases de datos y maneja la autenticación y errores de forma estándar.",
      3: "Diseña arquitecturas robustas, optimiza consultas complejas y maneja operaciones asíncronas avanzadas de manera eficiente.",
      4: "Define arquitecturas orientadas a eventos y microservicios, experto en rendimiento y escalabilidad de sistemas distribuidos."
    }
  },
  "Agile": {
    description: "Aplicación de metodologías ágiles (Scrum, Kanban) para la gestión y desarrollo iterativo de productos. Fomenta la colaboración y la adaptación al cambio.",
    levels: {
      1: "Conoce las ceremonias básicas (Daily, Sprint Planning) y entiende el flujo de trabajo en herramientas como Jira.",
      2: "Participa activamente en todas las ceremonias, comprende las métricas y contribuye a la mejora continua del equipo.",
      3: "Facilita ceremonias ágiles, elimina impedimentos y ayuda al equipo a mejorar su velocidad y predictibilidad.",
      4: "Domina múltiples frameworks ágiles, escala la agilidad a nivel organizacional y actúa como Agile Coach para varios equipos."
    }
  },
  "SQL": {
    description: "Diseño, consulta y optimización de bases de datos relacionales utilizando el lenguaje SQL. Implica modelado de datos y análisis de rendimiento.",
    levels: {
      1: "Capaz de realizar consultas básicas (SELECT, INSERT, UPDATE) y comprender la estructura de tablas simples.",
      2: "Escribe consultas con JOINs múltiples, subconsultas y utiliza funciones de agregación para reportes básicos.",
      3: "Diseña esquemas normalizados, escribe stored procedures y optimiza consultas analizando planes de ejecución.",
      4: "Experto en afinamiento de rendimiento, diseño de data warehouses complejos y estrategias avanzadas de alta disponibilidad."
    }
  },
  "Comunicación": {
    description: "Habilidad para transmitir ideas técnicas y no técnicas de manera clara, concisa y efectiva, adaptando el mensaje a diferentes audiencias.",
    levels: {
      1: "Comunica el estado de sus tareas claramente. Puede tener dificultades explicando conceptos técnicos a negocio.",
      2: "Redacta documentación clara y presenta ideas estructuradas en reuniones. Se comunica bien con otros departamentos.",
      3: "Adapta mensajes complejos para audiencias no técnicas. Facilita reuniones productivas y resuelve conflictos comunicativos.",
      4: "Excelente orador y negociador. Representa al departamento en foros ejecutivos y lidera la estrategia de comunicación interna."
    }
  },
  "Gestión de Talento": {
    description: "Capacidad para identificar, desarrollar y retener el talento dentro de la organización, fomentando un ambiente de crecimiento continuo.",
    levels: {
      1: "Entiende los procesos de evaluación de desempeño básicos y participa en entrevistas estructuradas bajo supervisión.",
      2: "Lleva a cabo evaluaciones de desempeño de su equipo directo y ayuda en la creación de planes de desarrollo.",
      3: "Diseña estrategias de retención, lidera procesos de sucesión y mentoriza a otros managers en gestión de equipos.",
      4: "Define la estrategia global de talento, establece políticas de compensación y alinea el desarrollo con el negocio."
    }
  },
  "Liderazgo": {
    description: "Habilidad para guiar, motivar e inspirar a equipos y personas hacia la consecución de objetivos comunes, fomentando el desarrollo.",
    levels: {
      1: "Ejerce liderazgo informal dentro de su equipo, ayudando a compañeros junior en tareas específicas.",
      2: "Lidera equipos pequeños, asigna tareas eficazmente y proporciona feedback constructivo a sus miembros.",
      3: "Lidera equipos multidisciplinares, define la visión técnica/estratégica y gestiona conflictos complejos.",
      4: "Líder inspiracional a nivel organizacional. Promueve la cultura de la empresa y desarrolla a futuros líderes."
    }
  },
  "Arquitectura Cloud": {
    description: "Diseño, despliegue y gestión de infraestructuras escalables, seguras y tolerantes a fallos en proveedores cloud (AWS, Azure, GCP).",
    levels: {
      1: "Entiende los conceptos cloud básicos (IaaS, PaaS, SaaS) y puede desplegar aplicaciones simples.",
      2: "Diseña arquitecturas básicas utilizando múltiples servicios, implementa pipelines CI/CD y gestiona la seguridad.",
      3: "Diseña soluciones cloud complejas, optimiza costes y automatiza con Infrastructure as Code.",
      4: "Experto en arquitecturas multi-cloud, define estándares de gobernanza cloud y lidera migraciones masivas."
    }
  }
};

// Generador procedural de 5000 habilidades
export const generateMockSkills = (count = 5000) => {
  // Empezar mapeando las 8 habilidades iniciales
  const list = Object.keys(mockSkillDetails).map((name, index) => {
    let family = "Tecnología";
    if (["Agile"].includes(name)) family = "Metodología";
    else if (["Comunicación", "Liderazgo"].includes(name)) family = "Habilidades Blandas";
    else if (["Gestión de Talento"].includes(name)) family = "Negocio";
    
    const isGlobalSoftSkill = family === "Habilidades Blandas" && (name === "Comunicación" || name === "Liderazgo");

    return {
      id: `s-${index + 1}`,
      name: name,
      family: family,
      isGlobalSoftSkill: isGlobalSoftSkill,
      description: mockSkillDetails[name].description,
      levels: mockSkillDetails[name].levels
    };
  });

  // 13 habilidades realistas detalladas adicionales
  const extraBaseSkills = [
    {
      name: "Python & Data Science",
      family: "Tecnología",
      description: "Análisis y modelado de datos utilizando Python y librerías como Pandas, NumPy, Scikit-Learn. Implementación de algoritmos de Machine Learning y visualización de datos.",
      levels: {
        1: "Escribe scripts básicos de Python, lee archivos CSV y realiza limpiezas de datos guiadas.",
        2: "Construye modelos de regresión y clasificación, realiza análisis exploratorios completos de datos (EDA).",
        3: "Despliega modelos de Machine Learning en producción, optimiza hiperparámetros y diseña pipelines de datos.",
        4: "Diseña la arquitectura de datos e IA de la entidad, liderando proyectos complejos de aprendizaje profundo."
      }
    },
    {
      name: "Ciberseguridad y Pentesting",
      family: "Tecnología",
      description: "Identificación de vulnerabilidades, auditorías de seguridad, pruebas de penetración y fortificación de sistemas e infraestructura.",
      levels: {
        1: "Entiende conceptos básicos de redes, firewalls y vulnerabilidades comunes (OWASP Top 10).",
        2: "Realiza análisis de vulnerabilidades automatizados y aplica parches de seguridad estándar.",
        3: "Ejecuta auditorías de pentesting manuales complejas, detecta brechas avanzadas y propone planes de mitigación.",
        4: "Establece la estrategia global de ciberseguridad, dirige la respuesta a incidentes críticos y define políticas de defensa activa."
      }
    },
    {
      name: "DevOps & CI/CD",
      family: "Tecnología",
      description: "Automatización del ciclo de vida del desarrollo de software mediante pipelines, integración continua, despliegue continuo e infraestructura como código.",
      levels: {
        1: "Familiarizado con Git y sabe disparar o revisar el estado de un pipeline en GitLab/GitHub.",
        2: "Crea configuraciones básicas de CI/CD, automatiza pruebas y genera builds en contenedores.",
        3: "Diseña pipelines multietapa optimizados, gestiona entornos de staging/producción y automatiza con Terraform.",
        4: "Define los estándares corporativos de automatización, orquestación a gran escala y cultura DevOps global."
      }
    },
    {
      name: "Docker & Kubernetes",
      family: "Tecnología",
      description: "Contenedores y orquestación de aplicaciones a gran escala. Configuración de clústeres, escalado automático, balanceo de carga y redes.",
      levels: {
        1: "Escribe un Dockerfile básico y levanta servicios locales con Docker Compose.",
        2: "Despliega pods, servicios e ingresses en un clúster de Kubernetes existente y monitoriza logs.",
        3: "Configura y administra clústeres de Kubernetes en la nube, optimiza recursos y define políticas de red.",
        4: "Arquitecto de soluciones nativas de nube a escala corporativa, liderando migraciones masivas hacia microservicios."
      }
    },
    {
      name: "Java & Spring Boot",
      family: "Tecnología",
      description: "Desarrollo backend empresarial robusto con Java y el ecosistema Spring. Patrones de diseño, persistencia y APIs de alto rendimiento.",
      levels: {
        1: "Conoce la sintaxis de Java y puede modificar endpoints existentes de Spring Boot bajo supervisión.",
        2: "Desarrolla microservicios independientes, integra JPA/Hibernate y realiza pruebas unitarias con JUnit.",
        3: "Diseña arquitecturas limpias y reactivas en Spring Boot, optimiza consultas complejas y maneja seguridad con OAuth2.",
        4: "Define directrices de arquitectura de backend empresarial, patrocina upgrades de frameworks y diseña sistemas core."
      }
    },
    {
      name: "TypeScript",
      family: "Tecnología",
      description: "Programación tipada y estructurada sobre JavaScript para la construcción de aplicaciones web escalables y mantenibles.",
      levels: {
        1: "Define interfaces y tipos básicos en proyectos web existentes.",
        2: "Aplica tipado estricto, genéricos y configuraciones personalizadas del tsconfig.",
        3: "Crea utilidades tipadas complejas, diseña librerías compartidas y optimiza la tipografía en arquitecturas monorrepo.",
        4: "Referente tecnológico en TypeScript, introduce mejores prácticas y herramientas en todo el equipo de frontend."
      }
    },
    {
      name: "Negociación Estratégica",
      family: "Habilidades Blandas",
      description: "Capacidad para alcanzar acuerdos beneficiosos mutuos (Win-Win) en situaciones de conflicto de intereses o negociaciones comerciales complejas.",
      levels: {
        1: "Mantiene una actitud receptiva y expone sus puntos de forma clara en reuniones bilaterales.",
        2: "Identifica los intereses de la otra parte y propone alternativas viables de beneficio mutuo.",
        3: "Lidera negociaciones contractuales y comerciales de alto impacto con proveedores estratégicos.",
        4: "Establece el marco corporativo de relaciones estratégicas, resolviendo conflictos de máxima prioridad institucional."
      }
    },
    {
      name: "Trabajo en Equipo",
      family: "Habilidades Blandas",
      description: "Colaboración constructiva y sinérgica con los miembros del equipo para alcanzar objetivos comunes, compartiendo conocimiento y apoyo.",
      levels: {
        1: "Colabora de forma activa, cumple con sus compromisos individuales y mantiene una buena relación laboral.",
        2: "Ayuda a integrar a nuevos miembros, comparte conocimientos y media en pequeñas diferencias cotidianas.",
        3: "Fomenta una cultura de colaboración de alto rendimiento, promueve la cocreación entre distintas áreas.",
        4: "Diseña el modelo de trabajo colaborativo de la organización, eliminando silos y promoviendo la sinergia global."
      }
    },
    {
      name: "Scrum & Kanban",
      family: "Metodología",
      description: "Implementación práctica de los marcos ágiles Scrum y Kanban para la gestión adaptativa y visual de proyectos de desarrollo de software.",
      levels: {
        1: "Entiende los tableros Kanban, participa en las reuniones diarias y estima tareas en Story Points.",
        2: "Facilita la planificación del Sprint y la retrospectiva, eliminando impedimentos cotidianos del equipo.",
        3: "Optimiza el flujo de valor mediante métricas ágiles avanzados (Velocity, CFD), mentorizando a Product Owners.",
        4: "Diseña la estrategia de transformación ágil de Cajamar, implantando marcos escalados en múltiples trenes."
      }
    },
    {
      name: "Design Thinking",
      family: "Metodología",
      description: "Metodología centrada en el usuario para la resolución creativa de problemas y el diseño de productos y servicios innovadores.",
      levels: {
        1: "Participa de forma activa en talleres de co-creación y aporta ideas en fases de brainstorming.",
        2: "Diseña mapas de empatía y Customer Journey Maps básicos para representar la experiencia del usuario.",
        3: "Planifica y lidera talleres de Design Thinking completos para el diseño conceptual de nuevos productos digitales.",
        4: "Evangeliza y define el modelo de diseño centrado en el usuario de la entidad, liderando la innovación estratégica."
      }
    },
    {
      name: "Análisis Financiero",
      family: "Negocio",
      description: "Evaluación de la viabilidad, estabilidad y rentabilidad de un negocio, proyecto o inversión mediante análisis de balances e indicadores.",
      levels: {
        1: "Interpreta estados financieros básicos y calcula ratios sencillos de liquidez y solvencia.",
        2: "Elabora modelos financieros de proyección de ingresos y gastos para proyectos de inversión de tamaño medio.",
        3: "Realiza análisis de viabilidad de fusiones, adquisiciones y grandes proyectos de inversión, valorando riesgos financieros.",
        4: "Define las directrices de planificación financiera estratégica del Grupo Cajamar, asesorando al Comité de Dirección."
      }
    },
    {
      name: "Prevención de Blanqueo (PBC/FT)",
      family: "Legal y Cumplimiento",
      description: "Cumplimiento normativo respecto a la prevención del blanqueo de capitales y financiación del terrorismo en la operativa bancaria.",
      levels: {
        1: "Conoce las alertas básicas de operaciones sospechosas y aplica las políticas de Conozca a su Cliente (KYC).",
        2: "Analiza y tramita expedientes de alertas de PBC, redactando informes de idoneidad técnica.",
        3: "Diseña y actualiza las políticas internas de control de PBC/FT adaptándolas a cambios normativos.",
        4: "Representa a la entidad ante organismos reguladores (SEPBLAC) y lidera la estrategia global de prevención."
      }
    },
    {
      name: "Reglamento General de Protección de Datos (RGPD)",
      family: "Legal y Cumplimiento",
      description: "Cumplimiento de las normativas de protección de datos personales y privacidad en el diseño y explotación de servicios.",
      levels: {
        1: "Comprende los principios básicos de consentimiento y confidencialidad en el tratamiento de datos.",
        2: "Elabora Evaluaciones de Impacto de Privacidad (EIPD) sencillas para nuevos desarrollos de software.",
        3: "Asesora legalmente en contratos internacionales de transferencia de datos y gestiona incidencias de brechas de seguridad.",
        4: "Actúa como Delegado de Protección de Datos (DPD/DPO) del grupo, definiendo la estrategia integral de privacidad."
      }
    }
  ];

  // Agregar habilidades a la lista
  extraBaseSkills.forEach((eb, idx) => {
    list.push({
      id: `s-${list.length + 1}`,
      name: eb.name,
      family: eb.family,
      isGlobalSoftSkill: false,
      description: eb.description,
      levels: eb.levels
    });
  });

  const FAMILIES = ["Tecnología", "Habilidades Blandas", "Metodología", "Negocio", "Legal y Cumplimiento"];

  // Diccionarios para combinación procedural realista
  const techPrefixes = ["Desarrollo en", "Administración de", "Arquitectura de", "Seguridad en", "Optimización de", "Integración con", "Gobernanza de"];
  const techSubjects = ["APIs REST", "Microservicios", "Bases de Datos SQL", "Bases de Datos NoSQL", "Contenedores Docker", "Orquestación Kubernetes", "Infraestructura AWS", "Infraestructura Azure", "Modelos de Machine Learning", "Pipelines CI/CD", "Frontend React", "Backend Spring Boot", "Redes Híbridas", "Sistemas Linux", "Arquitectura Hexagonal", "Despliegues Serverless", "Blockchain Corporativo", "Modelos Generativos NLP", "Visualización de Datos con PowerBI", "Eventos con Apache Kafka"];
  const techSuffixes = ["para Canales Digitales", "en la Nube", "de Alto Rendimiento", "para Aplicaciones Financieras", "en Entornos de Producción", "a Gran Escala", "con Alta Disponibilidad", "Multi-tenant", "para Procesamiento en Tiempo Real", "orientado a Microservicios"];

  const softPrefixes = ["Liderazgo en", "Gestión de", "Comunicación para", "Negociación en", "Resolución de", "Mentoría para", "Facilitación de", "Cohesión en"];
  const softSubjects = ["Equipos Multiculturales", "Conflictos Organizacionales", "Presentaciones Ejecutivas", "Proyectos Complejos", "Cambio Cultural", "Equipos de Alto Rendimiento", "Negociaciones Estratégicas", "Procesos de Toma de Decisiones"];
  const softSuffixes = ["bajo Presión", "en Entornos Corporativos", "con Stakeholders Críticos", "a Nivel Directivo", "de Forma Asíncrona", "basado en la Empatía"];

  const metodPrefixes = ["Implementación de", "Gestión con", "Optimización mediante", "Diseño de", "Adopción de", "Formación en"];
  const metodSubjects = ["Marcos Scrum Escalados", "Flujos Kanban Avanzados", "Talleres de Design Thinking", "Prácticas de Programación Extrema (XP)", "Metodologías Lean", "Modelos Agile", "Células DevOps"];
  const metodSuffixes = ["para Grandes Equipos", "en Proyectos de Software", "orientado al Cliente", "para la Mejora Continua", "con Enfoque Ágil"];

  const negPrefixes = ["Análisis de", "Estrategia para", "Gestión de", "Auditoría de", "Control de", "Planificación de"];
  const negSubjects = ["Riesgos Financieros", "Medios de Pago Digitales", "Banca Minorista", "Carteras de Inversión", "Marketing Digital y Redes", "Desarrollo de Nuevos Negocios", "Talento Organizacional", "Presupuestos y Finanzas"];
  const negSuffixes = ["de Banca Privada", "en el Sector Financiero", "para Cooperativas de Crédito", "orientado a Resultados", "a Largo Plazo"];

  const legalPrefixes = ["Cumplimiento de", "Auditoría de", "Prevención de", "Mitigación de", "Asesoría en", "Gobernanza de"];
  const legalSubjects = ["Riesgo de Crédito Minorista", "Directivas de Ciberseguridad Legal", "Normativa de Protección de Datos", "Fraude e Incumplimientos", "Políticas Anti-Corrupción", "Riesgos Operacionales Bancarios"];
  const legalSuffixes = ["para Reguladores Estatales", "según Estándares Europeos", "en Operaciones de Crédito", "en el Canal Digital"];

  let baseIdCount = list.length + 1;
  
  while (list.length < count) {
    const family = FAMILIES[list.length % FAMILIES.length];
    let name = "";
    let description = "";
    
    if (family === "Tecnología") {
      const p = techPrefixes[(list.length * 3) % techPrefixes.length];
      const s = techSubjects[(list.length * 7) % techSubjects.length];
      const suf = techSuffixes[(list.length * 13) % techSuffixes.length];
      name = `${p} ${s} ${suf}`;
      description = `Habilidad y experiencia en la ${p.toLowerCase()} ${s.toLowerCase()} ${suf}, garantizando el correcto funcionamiento y optimización según los estándares de Cajamar.`;
    } else if (family === "Habilidades Blandas") {
      const p = softPrefixes[(list.length * 3) % softPrefixes.length];
      const s = softSubjects[(list.length * 7) % softSubjects.length];
      const suf = softSuffixes[(list.length * 13) % softSuffixes.length];
      name = `${p} ${s} ${suf}`;
      description = `Dominio de competencias conductuales para el/la ${p.toLowerCase()} ${s.toLowerCase()} ${suf}, potenciando la sinergia y el bienestar del equipo de trabajo.`;
    } else if (family === "Metodología") {
      const p = metodPrefixes[(list.length * 3) % metodPrefixes.length];
      const s = metodSubjects[(list.length * 7) % metodSubjects.length];
      const suf = metodSuffixes[(list.length * 13) % metodSuffixes.length];
      name = `${p} ${s} ${suf}`;
      description = `Capacidad para llevar a cabo la ${p.toLowerCase()} ${s.toLowerCase()} ${suf}, asegurando la eficiencia, adaptabilidad y entrega continua de valor.`;
    } else if (family === "Negocio") {
      const p = negPrefixes[(list.length * 3) % negPrefixes.length];
      const s = negSubjects[(list.length * 7) % negSubjects.length];
      const suf = negSuffixes[(list.length * 13) % negSuffixes.length];
      name = `${p} ${s} ${suf}`;
      description = `Competencia enfocada en el/la ${p.toLowerCase()} ${s.toLowerCase()} ${suf}, impulsando la rentabilidad y el crecimiento sostenible en el negocio financiero de la entidad.`;
    } else { // Legal y Cumplimiento
      const p = legalPrefixes[(list.length * 3) % legalPrefixes.length];
      const s = legalSubjects[(list.length * 7) % legalSubjects.length];
      const suf = legalSuffixes[(list.length * 13) % legalSuffixes.length];
      name = `${p} ${s} ${suf}`;
      description = `Asegurar el correcto/a ${p.toLowerCase()} ${s.toLowerCase()} ${suf}, vigilando que la operativa de Cajamar se adecúe estrictamente al marco legal vigente.`;
    }

    const uniqueIndex = Math.floor(list.length / FAMILIES.length);
    name = `${name} #${uniqueIndex}`;

    list.push({
      id: `s-${baseIdCount++}`,
      name: name,
      family: family,
      isGlobalSoftSkill: false,
      description: description,
      levels: {
        1: `Nivel Conceptual: Comprende los principios teóricos básicos relativos a "${name}" y apoya en tareas estructuradas.`,
        2: `Nivel Operativo: Ejecuta de forma independiente y eficiente procesos normales de "${name}".`,
        3: `Nivel Avanzado: Resuelve problemas complejos, optimiza la metodología asociada a "${name}" y capacita al equipo.`,
        4: `Nivel Experto: Define la visión e introduce innovación y mejores prácticas de "${name}" a nivel organizacional.`
      }
    });
  }

  return list;
};

export const mockSkills = generateMockSkills(5000);
