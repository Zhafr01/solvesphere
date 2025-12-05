import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PartnerProvider } from './context/PartnerContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import GuestLayout from './layouts/GuestLayout';
import ErrorBoundary from './components/ErrorBoundary';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import PartnerSite from './pages/PartnerSite';

import PartnersIndex from './pages/admin/PartnersIndex';
import UsersIndex from './pages/admin/UsersIndex';
import Settings from './pages/admin/Settings';
import SiteSettings from './pages/admin/settings/SiteSettings';
import SecuritySettings from './pages/admin/settings/SecuritySettings';
import NotificationSettings from './pages/admin/settings/NotificationSettings';
import SystemMaintenance from './pages/admin/settings/SystemMaintenance';
import PartnerAdminsIndex from './pages/admin/PartnerAdminsIndex';
import ReportsIndex from './pages/reports/ReportsIndex';
import CreateReport from './pages/reports/CreateReport';
import ReportDetail from './pages/reports/ReportDetail';
import ForumIndex from './pages/forum/ForumIndex';
import CreateTopic from './pages/forum/CreateTopic';
import ForumDetail from './pages/forum/ForumDetail';
import NewsIndex from './pages/news/NewsIndex';
import NewsCreate from './pages/news/Create';
import ChatIndex from './pages/chat/ChatIndex';
import SocialIndex from './pages/SocialIndex';
import SubscriptionIndex from './pages/Subscription/Index';
import PartnerUsersIndex from './pages/admin/UsersIndex'; // Reusing UsersIndex or creating a new one?
// Wait, UsersIndex is imported as UsersIndex on line 17 for Super Admin.
// Partner Admin might need a different one or reuse it.
// Let's assume reuse for now or check if PartnerAdmin/UsersIndex exists.
// I see `PartnerAdmin/UserManagementController` in backend.
// Let's check if `pages/admin/UsersIndex` handles partner admin logic or if I need a new component.
// For now, let's import SubscriptionIndex.

// Placeholder Pages
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <PartnerProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/partners/:slug" element={<PartnerSite />} />
                </Route>

                {/* Guest Routes */}
                <Route element={<GuestLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/partners/:slug/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/partners/:slug/news" element={
                    <ProtectedRoute>
                      <NewsIndex />
                    </ProtectedRoute>
                  } />
                  <Route path="/partners/:slug/forum" element={
                    <ProtectedRoute>
                      <ForumIndex />
                    </ProtectedRoute>
                  } />
                  <Route path="/partners/:slug/reports" element={
                    <ProtectedRoute>
                      <ReportsIndex />
                    </ProtectedRoute>
                  } />

                  {/* Super Admin Routes */}
                  {/* Super Admin Routes */}
                  <Route path="/super-admin/partners" element={
                    <ProtectedRoute roles={['super_admin']}>
                      <PartnersIndex />
                    </ProtectedRoute>
                  } />
                  <Route path="/super-admin/users" element={
                    <ProtectedRoute roles={['super_admin']}>
                      <UsersIndex />
                    </ProtectedRoute>
                  } />
                  <Route path="/super-admin/settings" element={
                    <ProtectedRoute roles={['super_admin']}>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/super-admin/settings/site" element={
                    <ProtectedRoute roles={['super_admin']}>
                      <SiteSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/super-admin/settings/security" element={
                    <ProtectedRoute roles={['super_admin']}>
                      <SecuritySettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/super-admin/settings/notifications" element={
                    <ProtectedRoute roles={['super_admin']}>
                      <NotificationSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/super-admin/settings/maintenance" element={
                    <ProtectedRoute roles={['super_admin']}>
                      <SystemMaintenance />
                    </ProtectedRoute>
                  } />
                  <Route path="/partner-admin/admins" element={
                    <ProtectedRoute roles={['partner_admin']}>
                      <PartnerAdminsIndex />
                    </ProtectedRoute>
                  } />
                  <Route path="/partner-admin/users" element={
                    <ProtectedRoute roles={['partner_admin']}>
                      <UsersIndex />
                    </ProtectedRoute>
                  } />
                  <Route path="/partner-admin/subscription" element={
                    <ProtectedRoute roles={['partner_admin']}>
                      <SubscriptionIndex />
                    </ProtectedRoute>
                  } />

                  {/* Feature Routes */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/users/:id" element={
                    <ProtectedRoute>
                      <PublicProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <ReportsIndex />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports/create" element={
                    <ProtectedRoute>
                      <CreateReport />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports/:id" element={
                    <ProtectedRoute>
                      <ReportDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/forum" element={
                    <ProtectedRoute>
                      <ForumIndex />
                    </ProtectedRoute>
                  } />
                  <Route path="/forum/create" element={
                    <ProtectedRoute>
                      <CreateTopic />
                    </ProtectedRoute>
                  } />
                  <Route path="/forum/:id" element={
                    <ProtectedRoute>
                      <ForumDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/news" element={
                    <ProtectedRoute>
                      <NewsIndex />
                    </ProtectedRoute>
                  } />
                  <Route path="/news/create" element={
                    <ProtectedRoute>
                      <NewsCreate />
                    </ProtectedRoute>
                  } />
                  <Route path="/social" element={
                    <ProtectedRoute>
                      <SocialIndex />
                    </ProtectedRoute>
                  } />
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <ChatIndex />
                    </ProtectedRoute>
                  } />
                  <Route path="/chat/:id" element={
                    <ProtectedRoute>
                      <ChatIndex />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Router>
          </ErrorBoundary>
        </ThemeProvider>
      </PartnerProvider>
    </AuthProvider>
  );
}

export default App;
