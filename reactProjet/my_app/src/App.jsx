import './App.css'
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import InscriptionPage from './pages/auth/register';
import ConnexionPage from './pages/auth/login';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import VerifyOTPPage from './pages/auth/VerifyOTP';
import ResetPasswordPage from './pages/auth/ResetPassword';
import { Dashboard } from './pages/dashboard/dashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import AdminOverview from './components/admin/pages/AdminOverview';
import AdminUsers from './components/admin/pages/AdminUsers';
import AdminEvents from './components/admin/pages/AdminEvents';
import AdminAnalytics from './components/admin/pages/AdminAnalytics';
import Abonements from './components/admin/pages/Abonements';
import AdminSettings from './components/admin/pages/AdminSettings';
import ProtectedRoute from './routes/protectedRoute';
import { AuthProvider } from './context/AuthContext.jsx';
import { EventsManage } from './pages/events/events.jsx';
import RsvpPage from './pages/public/RsvpPage';
import PublicEventLanding from './pages/public/PublicEventLanding';
import TicketDownloadPage from './pages/public/TicketDownloadPage';
import CreateEventPage from './pages/events/CreateEventPage';
import PublicPollPage from './pages/public/PublicPollPage';
import PublicFeedbackPage from './pages/public/PublicFeedbackPage';

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<InscriptionPage />} />
            <Route path="/login" element={<ConnexionPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Route publique RSVP pour les invités */}
            <Route path="/rsvp/:token" element={<RsvpPage />} />

            {/* Routes publiques Billetterie & Téléchargement B2C v2.0 */}
            <Route path="/event/:eventId/tickets" element={<PublicEventLanding />} />
            <Route path="/ticket/download/:token" element={<TicketDownloadPage />} />

            {/* Nouvelles Routes Publiques : Sondages et Feedback Post-Événement */}
            <Route path="/poll/:pollId" element={<PublicPollPage />} />
            <Route path="/event/:eventId/feedback" element={<PublicFeedbackPage />} />

            {/* Routes protégées */}
            <Route element={<ProtectedRoute forbiddenRole="admin" />}> 
              <Route path="/dashboard" element={<Navigate to="/dashboard/vue" replace />} />
              <Route path="/dashboard/evenement/create" element={<CreateEventPage />} />
              <Route path="/dashboard/evenement/manage/:eventId" element={<EventsManage />} />
              <Route path="/dashboard/:section" element={<Dashboard />} />
            </Route>
            <Route element={<ProtectedRoute requiredRole="admin" />}> 
              <Route path="/admin" element={<AdminDashboard />}>
                <Route index element={<Navigate to="vue" replace />} />
                <Route path="vue" element={<AdminOverview />} />
                <Route path="utilisateurs" element={<AdminUsers />} />
                <Route path="evenement" element={<AdminEvents />} />
                <Route path="analytique" element={<AdminAnalytics />} />
                <Route path="abonements" element={<Abonements />} />
                <Route path="parametres" element={<AdminSettings />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
