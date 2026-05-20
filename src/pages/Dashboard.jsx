import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, TrendingUp, Briefcase, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-white rounded-3xl p-6 lg:p-7 shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-emerald-50 to-transparent opacity-50 pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-2.5 py-0.5 bg-emerald-50 border border-emerald-150 text-[#007A33] rounded-full text-[9px] font-extrabold tracking-wider uppercase mb-2 shadow-2xs">
            {currentUser.profile} Profile
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
            Impulsa tu carrera en <span className="text-[#007A33]">Cajamar</span>
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm leading-relaxed max-w-xl">
            Explora tus competencias, descubre nuevas oportunidades de formación y define tu próximo paso profesional dentro de la organización.
          </p>
          <div className="mt-4 flex gap-3">
            <Link to="/myskills" className="px-4.5 py-2 bg-[#007A33] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/10 hover:bg-[#006028] transition-all flex items-center gap-1.5">
              MySkills <ChevronRight size={14} />
            </Link>
            <Link to="/myupskilling" className="px-4.5 py-2 bg-white text-slate-650 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs">
              MyUpskilling
            </Link>
          </div>
        </div>
        
        {/* Compact & Premium Illustration */}
        <div className="hidden lg:block relative z-10 w-40 h-40 shrink-0">
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full blur-3xl opacity-15 animate-pulse"></div>
           <div className="relative w-full h-full bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform duration-500">
              <Award size={56} className="text-[#007A33] opacity-20" />
              <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-blue-50/90 border border-blue-100 rounded-xl flex items-center justify-center shadow-md -rotate-6">
                <BookOpen size={20} className="text-blue-600" />
              </div>
           </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Skills Registradas" value={currentUser.skills?.length || 0} icon={BookOpen} color="bg-blue-50 text-blue-600 border-blue-100" />
        <StatCard title="Badges Obtenidos" value={currentUser.badges?.length || 0} icon={Award} color="bg-amber-50 text-amber-600 border-amber-100" />
        <StatCard title="Cursos en Progreso" value="2" icon={TrendingUp} color="bg-emerald-50 text-[#007A33] border-emerald-100" />
        <StatCard title="Oportunidades Match" value="5" icon={Briefcase} color="bg-purple-50 text-purple-600 border-purple-100" />
      </div>

      {/* Recents Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recents List */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100">
          <h3 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#007A33] shrink-0 animate-pulse"></span>
            Actividad Reciente
          </h3>
          <div className="space-y-3.5">
            <ActivityItem 
              icon={Award} color="text-amber-500 bg-amber-50 border-amber-100" 
              title="¡Nuevo Badge Obtenido!" desc="Has conseguido el badge 'Problem Solver'." time="Hace 2 días" 
            />
            <ActivityItem 
              icon={BookOpen} color="text-blue-500 bg-blue-50 border-blue-100" 
              title="Skill Actualizada" desc="Tu nivel en 'React' ha subido a 4." time="Hace 1 semana" 
            />
            <ActivityItem 
              icon={TrendingUp} color="text-[#007A33] bg-emerald-50 border-emerald-100" 
              title="Curso Finalizado" desc="Completaste 'Masterclass Node.js'." time="Hace 2 semanas" 
            />
          </div>
        </div>
        
        {/* Next Challenge Card */}
        <div className="bg-gradient-to-br from-[#007A33] to-[#005021] rounded-3xl p-5 md:p-6 shadow-md text-white relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
          <div>
            <h3 className="text-base font-extrabold mb-0.5 relative z-10">Tu Próximo Reto</h3>
            <p className="text-emerald-100 text-[11px] mb-4 relative z-10">Basado en tu perfil y aspiraciones</p>
            
            <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-xs relative z-10">
              <h4 className="font-extrabold text-sm mb-0.5">Senior Frontend Developer</h4>
              <p className="text-emerald-50 text-[10px] mb-3">Banca Digital • 85% Match</p>
              
              <div className="w-full bg-black/20 rounded-full h-1.5 mb-1">
                <div className="bg-white h-1.5 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Link to="/myopportunities" className="block w-full py-2 bg-white text-[#007A33] text-center rounded-xl font-bold text-xs hover:bg-emerald-50 transition-colors shadow-sm">
              Ver Detalles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-3xl p-3.5 md:p-4 shadow-sm border border-slate-100 hover-lift relative overflow-hidden group flex items-center gap-3.5">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 border ${color}`}>
      <Icon size={18} />
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="text-slate-400 text-[9px] font-extrabold uppercase tracking-wider truncate" title={title}>{title}</h3>
      <p className="text-xl md:text-2xl font-black text-slate-800 mt-0.5 leading-none">{value}</p>
    </div>
    <div className="absolute -bottom-3 -right-3 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
      <Icon size={64} />
    </div>
  </div>
);

const ActivityItem = ({ icon: Icon, color, title, desc, time }) => (
  <div className="flex gap-3 items-start">
    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${color}`}>
      <Icon size={16} />
    </div>
    <div className="min-w-0 flex-1">
      <h4 className="font-bold text-xs text-slate-800 truncate">{title}</h4>
      <p className="text-slate-500 text-xs mt-0.5 leading-normal">{desc}</p>
      <span className="text-[10px] text-slate-400 mt-1 block">{time}</span>
    </div>
  </div>
);
