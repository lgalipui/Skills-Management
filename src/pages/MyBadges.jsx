import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, CheckCircle2, AlertCircle, PlusCircle, X, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export const MyBadges = () => {
  const { currentUser, badgesCatalog, users, enrollBadge, validateBadge, createBadge } = useAuth();
  
  if (currentUser.profile === 'Employee') return <EmployeeView />;
  if (currentUser.profile === 'Manager') return <ManagerView />;
  if (currentUser.profile === 'RRHH') return <RRHHView />;
  
  return null;
};

// ==========================================
// VISTA EMPLEADO
// ==========================================
const EmployeeView = () => {
  const { currentUser, badgesCatalog, enrollBadge } = useAuth();
  const [filter, setFilter] = useState('Todos');
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Map user's badges to catalog data
  const myBadgesFull = currentUser.badges.map(userBadge => {
    const catalogData = badgesCatalog.find(b => b.id === userBadge.badgeId);
    return { ...catalogData, ...userBadge };
  });

  const obtainedBadges = myBadgesFull.filter(b => b.status === 'Obtenido');

  // Enriched catalog for the gallery
  const gallery = badgesCatalog.map(catalogBadge => {
    const userBadge = currentUser.badges.find(b => b.badgeId === catalogBadge.id);
    return {
      ...catalogBadge,
      status: userBadge ? userBadge.status : 'Disponible',
      date: userBadge?.date
    };
  });

  const filteredGallery = gallery.filter(b => filter === 'Todos' || b.status === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Carrusel de Badges Obtenidos */}
      <section>
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <Award size={18} />
          </div>
          <h2 className="text-base md:text-lg font-extrabold text-slate-800">Tus Trofeos Obtenidos</h2>
        </div>

        {obtainedBadges.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
            Aún no has obtenido insignias. ¡Explora el catálogo y apúntate a un reto!
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1.5 px-1 snap-x custom-scrollbar">
            {obtainedBadges.map(badge => (
              <div 
                key={badge.id} 
                className="snap-start shrink-0 w-48 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4.5 shadow-md shadow-amber-500/10 text-white relative overflow-hidden group hover:-translate-y-1.5 transition-transform duration-300"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full blur-xl transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="text-4xl mb-2.5 text-center group-hover:scale-110 transition-transform duration-300">{badge.icon}</div>
                <h3 className="font-extrabold text-sm text-center leading-tight mb-1 relative z-10">{badge.title}</h3>
                <p className="text-[10px] text-amber-100/90 text-center relative z-10">Obtenido: {new Date(badge.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Galería Completa */}
      <section className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100">
        <h2 className="text-base md:text-lg font-extrabold text-slate-800 mb-4">Catálogo de Insignias</h2>
        
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {['Todos', 'Disponible', 'En progreso', 'Obtenido'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors",
                filter === f 
                  ? "bg-slate-800 text-white shadow-sm" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGallery.map(badge => (
            <div 
              key={badge.id} 
              onClick={() => setSelectedBadge(badge)}
              className={clsx(
                "border rounded-2xl p-4 cursor-pointer hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center text-center",
                badge.status === 'Obtenido' ? "border-amber-200 bg-amber-50/70 hover:shadow-md hover:shadow-amber-100/50" :
                badge.status === 'En progreso' ? "border-blue-200 bg-blue-50/70 hover:shadow-md hover:shadow-blue-100/50" :
                "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              )}
            >
              <div className="text-3xl mb-2 filter drop-shadow-sm group-hover:scale-110 transition-transform">{badge.icon}</div>
              <h4 className="font-extrabold text-xs md:text-sm text-slate-800 mb-2 truncate max-w-full">{badge.title}</h4>
              
              <span className={clsx(
                "text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-auto",
                badge.status === 'Obtenido' ? "bg-amber-100 text-amber-700" :
                badge.status === 'En progreso' ? "bg-blue-100 text-blue-700" :
                "bg-slate-100 text-slate-500"
              )}>
                {badge.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL DETALLE */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedBadge(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-4 right-4">
              <button onClick={() => setSelectedBadge(null)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-8 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
              <div className="text-7xl mb-4 drop-shadow-lg">{selectedBadge.icon}</div>
              <h3 className="text-2xl font-bold text-slate-800">{selectedBadge.title}</h3>
              <span className={clsx(
                "inline-block mt-3 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                selectedBadge.status === 'Obtenido' ? "bg-amber-100 text-amber-700" :
                selectedBadge.status === 'En progreso' ? "bg-blue-100 text-blue-700" :
                "bg-slate-100 text-slate-500"
              )}>
                {selectedBadge.status}
              </span>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Criterios</h4>
                <p className="text-slate-600 leading-relaxed">{selectedBadge.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Skills Validadas</span>
                  <span className="font-semibold text-slate-800">{selectedBadge.skillsValidated.join(', ')}</span>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <span className="block text-xs font-bold text-emerald-600/70 uppercase mb-1">Nivel Otorgado</span>
                  <span className="font-bold text-[#007A33] text-lg">+{selectedBadge.levelGranted}</span>
                </div>
              </div>

              {selectedBadge.status === 'Disponible' && (
                <button 
                  onClick={() => {
                    enrollBadge(currentUser.id, selectedBadge.id);
                    setSelectedBadge(null);
                  }}
                  className="w-full py-4 bg-[#007A33] text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-600/20 hover:bg-[#006028] transition-colors flex items-center justify-center gap-2"
                >
                  ¡Auto-inscribirme al Reto! <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// VISTA MANAGER
// ==========================================
const ManagerView = () => {
  const { currentUser, users, badgesCatalog, validateBadge } = useAuth();
  const teamMembers = users.filter(u => u.managerId === currentUser.id);

  // Flat map to find all pending validations for team members
  const pendingValidations = teamMembers.flatMap(user => {
    return user.badges
      .filter(b => b.status === 'En progreso')
      .map(b => {
        const catalogData = badgesCatalog.find(cat => cat.id === b.badgeId);
        return { user, userBadge: b, catalogData };
      });
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Validación de Insignias</h1>
        <p className="text-slate-500">Revisa y aprueba los retos completados por tu equipo.</p>
      </div>

      {pendingValidations.length === 0 ? (
        <div className="bg-emerald-50 rounded-3xl p-12 text-center border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-100 text-[#007A33] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-emerald-800 mb-2">Todo al día</h2>
          <p className="text-emerald-600">No tienes ninguna insignia pendiente de validación en tu equipo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingValidations.map(({ user, catalogData }, idx) => (
            <div key={`${user.id}-${catalogData.id}-${idx}`} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex gap-6">
              <div className="text-5xl bg-slate-50 w-24 h-24 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0">
                {catalogData.icon}
              </div>
              <div className="flex flex-col flex-1">
                <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">{catalogData.title}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
                  <img src={user.avatar} className="w-5 h-5 rounded-full" alt="avatar" />
                  Solicitado por <strong>{user.name}</strong>
                </p>
                <div className="mt-auto">
                  <button 
                    onClick={() => validateBadge(user.id, catalogData.id)}
                    className="w-full py-2 bg-blue-50 text-blue-600 font-bold rounded-xl border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                  >
                    Validar Insignia
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// VISTA RRHH
// ==========================================
const RRHHView = () => {
  const { createBadge } = useAuth();
  const [formData, setFormData] = useState({ title: '', icon: '🌟', description: '', skillsValidated: '', levelGranted: 1 });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    createBadge({
      ...formData,
      skillsValidated: formData.skillsValidated.split(',').map(s => s.trim()),
      levelGranted: parseInt(formData.levelGranted)
    });
    setFormData({ title: '', icon: '🌟', description: '', skillsValidated: '', levelGranted: 1 });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Gestor de Gamificación</h1>
        <p className="text-slate-500">Crea nuevos retos y badges para incentivar el aprendizaje en la organización.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <PlusCircle size={20} className="text-[#007A33]" /> Crear Nuevo Badge
        </h2>

        {showSuccess && (
          <div className="mb-6 bg-emerald-50 text-[#007A33] p-4 rounded-xl border border-emerald-200 font-medium flex items-center gap-2">
            <CheckCircle2 size={18} /> ¡Insignia creada correctamente en el catálogo global!
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-slate-700 mb-2">Emoji / Icono</label>
              <input 
                type="text" 
                required 
                value={formData.icon}
                onChange={e => setFormData({...formData, icon: e.target.value})}
                className="w-full text-center text-3xl p-4 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#007A33] focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-bold text-slate-700 mb-2">Título de la Insignia</label>
              <input 
                type="text" 
                required 
                placeholder="Ej: React Master..."
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#007A33] focus:border-transparent outline-none transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Criterios de obtención</label>
            <textarea 
              required
              rows="3"
              placeholder="Describe qué debe hacer el empleado para conseguirlo..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#007A33] focus:border-transparent outline-none transition-all resize-none text-slate-700"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Skills asociadas (separadas por coma)</label>
              <input 
                type="text" 
                required 
                placeholder="Ej: React, Frontend, UI..."
                value={formData.skillsValidated}
                onChange={e => setFormData({...formData, skillsValidated: e.target.value})}
                className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#007A33] focus:border-transparent outline-none transition-all text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nivel otorgado (+)</label>
              <input 
                type="number" 
                min="1" max="5"
                required 
                value={formData.levelGranted}
                onChange={e => setFormData({...formData, levelGranted: e.target.value})}
                className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#007A33] focus:border-transparent outline-none transition-all text-slate-700"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button type="submit" className="px-8 py-3 bg-[#007A33] text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-[#006028] transition-colors">
              Publicar Insignia
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
