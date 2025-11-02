// src/App.jsx
// Le Chef d'Orchestre (Routeur)

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AnnonceDetailPage from './pages/AnnonceDetailPage';
import ProfilePage from './pages/ProfilePage';
import SellerProfilePage from './pages/SellerProfilePage';
import MessagesPage from './pages/MessagesPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
    <Route path="/annonces" element={<AnnouncementsPage />} />
    <Route path="/annonces/:annonceId" element={<AnnonceDetailPage />} />
  <Route path="/profil" element={<ProfilePage />} />
  <Route path="/messages" element={<MessagesPage />} />
  <Route path="/messages/:conversationId" element={<MessagesPage />} />
  <Route path="/vendeurs/:sellerId" element={<SellerProfilePage />} />
        {/* On ajoutera nos futures pages ici */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;