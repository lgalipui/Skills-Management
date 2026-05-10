import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, TrendingUp, Briefcase, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-emerald-50 to-transparent opacity-50 pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            {currentUser.profile} Profile
          </span>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Impulsa tu carrera en <span className="text-[#007A33]">Cajamar</span>
          </h1>
          <p className="text-slate-500 mt-4 text-lg leading-relaxed">
            Explora tus competencias, descubre nuevas oportunidades de formación y define tu próximo paso profesional dentro de la organización.
          </p>
          <div className="mt-8 flex gap-4">
            <Link to="/myskills" className="px-6 py-3 bg-[#007A33] text-white rounded-xl font-medium shadow-lg shadow-emerald-600/20 hover:bg-[#006028] transition-all flex items-center gap-2">
              Ver mis Skills <ChevronRight size={18} />
            </Link>
            <Link to="/myupskilling" className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition-all">
              Catálogo de Formación
            </Link>
          </div>
        </div>
        
        {/* Placeholder for illustration - using a generic shape with gradients for premium feel */}
        <div className="hidden lg:block relative z-10 w-64 h-64">
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
           <div className="relative w-full h-full bg-white rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform duration-500">
              <Award size={80} className="text-[#007A33] opacity-20" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg -rotate-6">
                <BookOpen size={32} className="text-blue-600" />
              </div>
           </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Skills Registradas" value={currentUser.skills?.length || 0} icon={BookOpen} color="bg-blue-50 text-blue-600" />
        <StatCard title="Badges Obtenidos" value={currentUser.badges?.length || 0} icon={Award} color="bg-amber-50 text-amber-600" />
        <StatCard title="Cursos en Progreso" value="2" icon={TrendingUp} color="bg-emerald-50 text-[#007A33]" />
        <StatCard title="Oportunidades Match" value="5" icon={Briefcase} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Recents Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Actividad Reciente</h3>
          <div className="space-y-6">
            <ActivityItem 
              icon={Award} color="text-amber-500 bg-amber-50" 
              title="¡Nuevo Badge Obtenido!" desc="Has conseguido el badge 'Problem Solver'." time="Hace 2 días" 
            />
            <ActivityItem 
              icon={BookOpen} color="text-blue-500 bg-blue-50" 
              title="Skill Actualizada" desc="Tu nivel en 'React' ha subido a 4." time="Hace 1 semana" 
            />
            <ActivityItem 
              icon={TrendingUp} color="text-[#007A33] bg-emerald-50" 
              title="Curso Finalizado" desc="Completaste 'Masterclass Node.js'." time="Hace 2 semanas" 
            />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#007A33] to-[#005021] rounded-3xl p-8 shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="text-xl font-bold mb-2 relative z-10">Tu Próximo Reto</h3>
          <p className="text-emerald-100 text-sm mb-6 relative z-10">Basado en tu perfil y aspiraciones</p>
          
          <div className="bg-white/10 rounded-2xl p-5 border border-white/20 backdrop-blur-sm relative z-10">
            <h4 className="font-semibold text-lg mb-1">Senior Frontend Developer</h4>
            <p className="text-emerald-50 text-sm mb-4">Banca Digital • 85% Match</p>
            
            <div className="w-full bg-black/20 rounded-full h-2 mb-4">
              <div className="bg-white h-2 rounded-full" style={{width: '85%'}}></div>
            </div>
            
            <Link to="/myopportunities" className="block w-full py-2.5 bg-white text-[#007A33] text-center rounded-xl font-medium text-sm hover:bg-emerald-50 transition-colors">
              Ver Detalles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover-lift relative overflow-hidden group">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 ${color}`}>
      <Icon size={28} />
    </div>
    <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{title}</h3>
    <p className="text-4xl font-bold text-slate-800 mt-2">{value}</p>
    <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
      <Icon size={120} />
    </div>
  </div>
);

const ActivityItem = ({ icon: Icon, color, title, desc, time }) => (
  <div className="flex gap-4">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <h4 className="font-semibold text-slate-800">{title}</h4>
      <p className="text-slate-500 text-sm mt-0.5">{desc}</p>
      <span className="text-xs text-slate-400 mt-1 block">{time}</span>
    </div>
  </div>
);
