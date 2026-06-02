import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockUsers, mockCourses } from '../data/mockData';
import { BookOpen, AlertCircle, Clock, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';

export const MyUpskilling = () => {
  const { currentUser } = useAuth();
  const isManager = currentUser.profile === 'Manager' || currentUser.profile === 'RRHH';

  // Find subordinates if Manager
  const teamMembers = mockUsers.filter(u => u.managerId === currentUser.id);
  const [selectedUser, setSelectedUser] = useState(isManager && teamMembers.length > 0 ? teamMembers[0] : currentUser);

  // Local state for approvals to simulate interactivity
  const [courseStatuses, setCourseStatuses] = useState(
    mockCourses.reduce((acc, course) => {
      acc[course.id] = course.status;
      return acc;
    }, {})
  );

  const toggleApproval = (courseId, currentStatus) => {
    setCourseStatuses(prev => ({
      ...prev,
      [courseId]: currentStatus === 'Pendiente' ? 'Aprobado' : 'Pendiente'
    }));
  };

  // Switch displayed user based on selector
  const activeUser = isManager ? selectedUser : currentUser;

  // Calculate gaps
  const skillsWithGaps = activeUser.skills
    .filter(s => s.required > s.level)
    .map(s => ({ ...s, gap: s.required - s.level }))
    .sort((a, b) => b.gap - a.gap); // Sort by highest gap (Critical priority)

  const totalGaps = skillsWithGaps.length;
  // Let's pretend 40% of itinerary is done for the progress bar if there are gaps, 100% otherwise
  const progressPercentage = totalGaps === 0 ? 100 : 40; 

  const getCoursesForSkill = (skillName) => {
    return mockCourses.filter(c => c.skills.includes(skillName));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">MyUpskilling</h1>
            <p className="text-slate-500 mt-1">Catálogo de formación e itinerario de desarrollo.</p>
          </div>
          
          {isManager && teamMembers.length > 0 && (
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-sm font-medium text-slate-500 pl-2">Ver itinerario de:</span>
              <select 
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#007A33]"
                value={selectedUser.id}
                onChange={(e) => setSelectedUser(mockUsers.find(u => u.id === parseInt(e.target.value)))}
              >
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Progreso del Itinerario</h3>
              <p className="text-sm text-slate-500">Formación requerida para cubrir brechas competenciales.</p>
            </div>
            <span className="text-2xl font-bold text-[#007A33]">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-[#007A33] h-3 rounded-full transition-all duration-1000 relative" 
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {totalGaps === 0 ? (
        <div className="bg-emerald-50 rounded-3xl p-12 text-center border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-100 text-[#007A33] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-emerald-800 mb-2">¡Excelente Perfil!</h2>
          <p className="text-emerald-600">Actualmente no tienes brechas competenciales críticas. Explora el catálogo libre para seguir creciendo.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {skillsWithGaps.map(skill => {
            const priorityLevel = skill.gap >= 2 ? "Crítica" : "Normal";
            const suggestedCourses = getCoursesForSkill(skill.name);
            
            return (
              <div key={skill.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className={clsx(
                  "px-8 py-5 border-b flex justify-between items-center bg-gradient-to-r transition-all duration-300",
                  skill.gap >= 2 
                    ? "from-amber-500/10 via-amber-500/2 to-transparent border-amber-500/15" 
                    : "from-slate-500/5 via-slate-500/1 to-transparent border-slate-100/10"
                )}>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-800">{skill.name}</h2>
                      <span className={clsx(
                        "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border",
                        skill.gap >= 2 
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                          : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      )}>
                        Prioridad {priorityLevel === "Crítica" ? "Crítica" : "Normal"}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      Nivel actual: <strong className="text-[var(--text-accent)]">{skill.level}</strong> → Requerido: <strong className="text-[var(--text-accent)]">{skill.required}</strong>
                    </p>
                  </div>
                  {skill.gap >= 2 && <AlertCircle className="text-amber-500 opacity-60" size={26} />}
                </div>

                <div className="p-8 bg-white">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BookOpen size={16} /> Cursos Recomendados
                  </h3>
                  
                  {suggestedCourses.length === 0 ? (
                    <p className="text-slate-500 italic text-sm">No hay cursos disponibles para esta competencia por el momento.</p>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {suggestedCourses.map(course => (
                        <div key={course.id} className="flex border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group bg-slate-50/30">
                          <div className="w-32 h-auto shrink-0 overflow-hidden relative">
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-extrabold text-[#007A33] dark:text-emerald-450 bg-emerald-500/8 dark:bg-emerald-500/12 px-2 py-0.5 rounded-md border border-emerald-500/15">Objetivo: Nivel {Math.min(skill.level + 1, skill.required)}</span>
                              <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                <Clock size={12} /> {course.duration}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-800 leading-tight my-2 line-clamp-2">{course.title}</h4>
                            
                            <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className={clsx("text-sm font-bold", course.cost > 0 ? "text-slate-700" : "text-emerald-600")}>
                                  {course.cost > 0 ? `${course.cost}€` : "Gratuito"}
                                </span>
                                {course.cost > 0 && (
                                  <span className={clsx(
                                    "text-[10px] font-bold uppercase tracking-wider",
                                    courseStatuses[course.id] === 'Aprobado' ? "text-[#007A33]" : "text-amber-500"
                                  )}>
                                    {courseStatuses[course.id]}
                                  </span>
                                )}
                              </div>
                              
                              {isManager && course.cost > 0 ? (
                                <button 
                                  onClick={() => toggleApproval(course.id, courseStatuses[course.id])}
                                  className={clsx(
                                    "text-xs font-bold px-4 py-1.5 rounded-lg transition-all border flex items-center gap-1",
                                    courseStatuses[course.id] === 'Pendiente' 
                                      ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100" 
                                      : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                                  )}
                                >
                                  {courseStatuses[course.id] === 'Pendiente' ? 'Aprobar' : <><CheckCircle2 size={14}/> Aprobado</>}
                                </button>
                              ) : (
                                <button className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-[#007A33] hover:text-white transition-colors">
                                  <ChevronRight size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
