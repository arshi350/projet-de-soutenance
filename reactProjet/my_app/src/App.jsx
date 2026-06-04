import './App.css'
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import InscriptionPage from './pages/auth/register';
import ConnexionPage from './pages/auth/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import AdminOverview from './components/admin/pages/AdminOverview';
import AdminUsers from './components/admin/pages/AdminUsers';
import AdminEvents from './components/admin/pages/AdminEvents';
import AdminAnalytics from './components/admin/pages/AdminAnalytics';
import AdminSettings from './components/admin/pages/AdminSettings';
import ProtectedRoute from './routes/protectedRoute';
// import ManageEvent from './components/dashboard/event/manageEvent/ManageEvent';
import { AuthProvider } from './context/AuthContext.jsx';
import { EventsManage } from './pages/events/events.jsx';

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<InscriptionPage />} />
            <Route path="/login" element={<ConnexionPage />} />
            {/* Routes protégées */}
            <Route element={<ProtectedRoute forbiddenRole="admin" />}> 
              <Route path="/dashboard" element={<Navigate to="/dashboard/vue" replace />} />
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
