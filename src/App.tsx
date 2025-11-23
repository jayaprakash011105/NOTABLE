import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { UserProvider } from './contexts/UserContext';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Tasks from './pages/Tasks';
import Notes from './pages/Notes';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <UserProvider>
              <Router>
                <div className="relative min-h-screen">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                  <BottomNav />
                </div>
              </Router>
            </UserProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
