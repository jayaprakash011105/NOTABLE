import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import Health from './pages/Health';
import Profile from './pages/Profile';
import Login from './pages/Login';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';
import './index.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <UserProvider>
              <NotificationProvider>
                <AuthProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <div className="relative min-h-screen">
                              <Dashboard />
                              <BottomNav />
                            </div>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/finance"
                        element={
                          <ProtectedRoute>
                            <div className="relative min-h-screen">
                              <Finance />
                              <BottomNav />
                            </div>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/tasks"
                        element={
                          <ProtectedRoute>
                            <div className="relative min-h-screen">
                              <Tasks />
                              <BottomNav />
                            </div>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/notes"
                        element={
                          <ProtectedRoute>
                            <div className="relative min-h-screen">
                              <Notes />
                              <BottomNav />
                            </div>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/health"
                        element={
                          <ProtectedRoute>
                            <div className="relative min-h-screen">
                              <Health />
                              <BottomNav />
                            </div>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <div className="relative min-h-screen">
                              <Profile />
                              <BottomNav />
                            </div>
                          </ProtectedRoute>
                        }
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </BrowserRouter>
                </AuthProvider>
              </NotificationProvider>
            </UserProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
