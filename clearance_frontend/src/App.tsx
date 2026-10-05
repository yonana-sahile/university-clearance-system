import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ChatButton from './components/Chat/ChatButton';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './context/LanguageContext';

// Pages & Components
import WelcomePage from './components/Pages/WelcomePage';
import AboutPage from './components/Pages/AboutPage';
import LearnMorePage from './components/Pages/LearnMorePage';
import IntroSlides from './components/Pages/IntroSlides';
import MaintenancePage from './components/Pages/MaintenancePage';
import ProfilePage from './components/Pages/ProfilePage';
import ChangeProfile from './components/Pages/ChangeProfile';
import VerifyCertificatePage from './components/Pages/VerifyCertificatePage';

// Auth Pages
import AuthPage from './components/Authen/AuthPage';
import LoginPage from './components/Authen/LoginPage';
import AdminLogin from './components/Authen/AdminLogin';
import RegisterPage from './components/Authen/RegisterPage';
import ForgotPasswordPage from './components/Authen/ForgotPasswordPage';
import VerifyOTP from './components/Authen/VerifyOTP';
import ResetPassword from './components/Authen/ResetPassword';

// Dashboards & Portals
import StudentDashboard from './components/Dashboards/StudentDashboard';
import ClearanceFormSubmission from './components/Forms/ClearanceForm';
import StudentPaymentPage from './components/Payments/StudentPaymentPage';
import DepartmentHeadPage from './components/Pages/DepartmentHeadPage';
import LibrarianPage from './components/Pages/LibrarianPage';
import CafeteriaPage from './components/Pages/CafeteriaPage';
import DormitoryPage from './components/Pages/DormitoryPage';
import PsychologyPage from './components/Pages/PsychologyPage';
import SportMasterPage from './components/Pages/SportMasterPage';
import CampusPolicePage from './components/Pages/CampusPolicePage';
import CooperationSharingPage from './components/Pages/CooperationSharingPage';
import DOPCoordinatorPage from './components/Pages/DOPCoordinatorPage';
import StudentAffairsPage from './components/Pages/StudentAffairsPage';
import RegistrarPage from './components/Pages/RegistrarPage';
import AdminDashboard from './components/Pages/AdminDashboard';
import DeveloperApiPortal from './components/Pages/DeveloperApiPortal';

// Theme Context
interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <LanguageProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              <main className="app-main-content" style={{ flex: 1 }}>
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<WelcomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/learn-more" element={<LearnMorePage />} />
                  <Route path="/intro-slides" element={<IntroSlides />} />
                  <Route path="/maintenance" element={<MaintenancePage />} />
                  <Route path="/verify-certificate" element={<VerifyCertificatePage />} />

                  {/* Authentication Routes */}
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/verify-otp" element={<VerifyOTP />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* User Profile */}
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/change-profile" element={<ChangeProfile />} />

                  {/* Portals & Dashboards */}
                  <Route path="/student" element={<StudentDashboard />} />
                  <Route path="/clearance-form" element={
                    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
                      <ClearanceFormSubmission />
                    </div>
                  } />
                  <Route path="/payment" element={<StudentPaymentPage />} />

                  <Route path="/departmenthead" element={<DepartmentHeadPage />} />
                  <Route path="/librarian" element={<LibrarianPage />} />
                  <Route path="/cafeteria" element={<CafeteriaPage />} />
                  <Route path="/dormitory" element={<DormitoryPage />} />
                  <Route path="/psychology" element={<PsychologyPage />} />
                  <Route path="/sportmaster" element={<SportMasterPage />} />
                  <Route path="/campuspolice" element={<CampusPolicePage />} />
                  <Route path="/cooperationsharing" element={<CooperationSharingPage />} />
                  <Route path="/dopcordinator" element={<DOPCoordinatorPage />} />
                  <Route path="/studentaffairs" element={<StudentAffairsPage />} />
                  <Route path="/registrar" element={<RegistrarPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/developer-api" element={<DeveloperApiPortal />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
              <ChatButton />
            </div>
          </BrowserRouter>
        </ErrorBoundary>
      </LanguageProvider>
    </ThemeContext.Provider>
  );
}

export default App;

