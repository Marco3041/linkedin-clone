import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import Widgets from './components/Widgets';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Network from './pages/Network';
import Jobs from './pages/Jobs';
import Notifications from './pages/Notifications';
import Messaging from './pages/Messaging';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SearchProvider } from './context/SearchContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function AppContent() {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app">
      <Header />

      {!currentUser ? (
        <Login />
      ) : (
        <div className="app__body">
          <Routes>
            <Route path="/" element={
              <div style={{ display: 'flex', width: '100%' }}>
                <Sidebar />
                <Feed />
                <Widgets />
              </div>
            } />
            <Route path="/profile" element={
              <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <Profile />
              </div>
            } />
            <Route path="/network" element={
              <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <Network />
              </div>
            } />
            <Route path="/jobs" element={
              <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <Jobs />
              </div>
            } />
            <Route path="/notifications" element={
              <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <Notifications />
              </div>
            } />
            <Route path="/messaging" element={
              <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <Messaging />
              </div>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      )}


      <div
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          backgroundColor: theme === 'light' ? '#333' : '#fff',
          color: theme === 'light' ? '#fff' : '#333',
          padding: '10px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0px 4px 10px rgba(0,0,0,0.3)',
          zIndex: 1000
        }}
      >
        {theme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SearchProvider>
            <AppContent />
          </SearchProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
