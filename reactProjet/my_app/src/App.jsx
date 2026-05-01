import './App.css'
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { Home } from './pages/Home';
import InscriptionPage from './pages/auth/register';
import ConnexionPage from './pages/auth/login';
import { Dashboard } from './pages/dashboard/dashboard';
import ProtectedRoute from './routes/protectedRoute';
import { AuthProvider } from './context/AuthContext.jsx';

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
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
