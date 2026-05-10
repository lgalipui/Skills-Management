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
      { id: "s8", name: "Comunicación", level: 3, required: 4, category: "Soft Skill" }
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
