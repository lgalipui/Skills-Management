import React, { createContext, useContext, useState } from 'react';
import { mockUsers as initialUsers, mockBadgesCatalog as initialBadges } from '../data/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(initialUsers);
  const [badgesCatalog, setBadgesCatalog] = useState(initialBadges);
  
  // Inicializamos con Ana (Employee) referenciando el estado en memoria
  const [currentUserProfile, setCurrentUserProfile] = useState('Employee');

  const switchUser = (profileType) => {
    setCurrentUserProfile(profileType);
  };

  const currentUser = users.find(u => u.profile === currentUserProfile);

  // MÉTODOS DE MUTACIÓN PARA LA DEMO

  // 1. Empleado se auto-inscribe en un badge
  const enrollBadge = (userId, badgeId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        // Evitar duplicados
        if (u.badges.some(b => b.badgeId === badgeId)) return u;
        return {
          ...u,
          badges: [...u.badges, { badgeId, date: new Date().toISOString().split('T')[0], status: "En progreso" }]
        };
      }
      return u;
    }));
  };

  // 2. Mánager valida un badge
  const validateBadge = (userId, badgeId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          badges: u.badges.map(b => b.badgeId === badgeId ? { ...b, status: "Obtenido", date: new Date().toISOString().split('T')[0] } : b)
        };
      }
      return u;
    }));
  };

  // 3. RRHH crea un nuevo badge
  const createBadge = (newBadge) => {
    setBadgesCatalog(prev => [...prev, { ...newBadge, id: `b${prev.length + 1}` }]);
  };

  // 4. Empleado marca/desmarca un rol como favorito
  const [favoriteRoles, setFavoriteRoles] = useState({}); // { userId: [roleId1, roleId2] }

  const toggleFavoriteRole = (userId, roleId) => {
    setFavoriteRoles(prev => {
      const userFavs = prev[userId] || [];
      if (userFavs.includes(roleId)) {
        return { ...prev, [userId]: userFavs.filter(id => id !== roleId) };
      } else {
        return { ...prev, [userId]: [...userFavs, roleId] };
      }
    });
  };

  // 5. Empleado se inscribe a una vacante interna
  const [jobApplications, setJobApplications] = useState({}); // { userId: [oppId1] }

  const applyToJob = (userId, oppId) => {
    setJobApplications(prev => {
      const userApps = prev[userId] || [];
      if (userApps.includes(oppId)) return prev;
      return { ...prev, [userId]: [...userApps, oppId] };
    });
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      switchUser, 
      users, 
      badgesCatalog,
      favoriteRoles,
      jobApplications,
      enrollBadge,
      validateBadge,
      createBadge,
      toggleFavoriteRole,
      applyToJob
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
