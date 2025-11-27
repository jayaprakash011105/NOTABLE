import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { UserProvider } from './contexts/UserContext';
import { AuthProvider } from './contexts/AuthContext';
import Splash from './pages/Splash';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import Health from './pages/Health';
import Profile from './pages/Profile';
import Login from './pages/Login';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <LanguageProvider>
          <UserProvider>
            <AuthProvider>
              <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-black">
                  <Routes>
                    {/* Splash Screen - Default Landing Page */}
                    <Route path="/" element={<Splash />} />

                    {/* Login Page */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route
                      path="/dashboard"
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
                  </Routes>
                </div>
              </Router>
            </AuthProvider>
          </UserProvider>
        </LanguageProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;
