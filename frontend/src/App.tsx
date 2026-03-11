import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CodeBackground from './components/CodeBackground';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Skills from './pages/Skills';
import Experience from './pages/Experience';
import Contact from './pages/Contact';
import BlogList from './pages/Blog';
import BlogPost from './pages/BlogPost';
import AdminLogin from './pages/admin/Login';
import ForgotPassword from './pages/admin/ForgotPassword';
import ResetPassword from './pages/admin/ResetPassword';
import ProjectDetail from './pages/ProjectDetail';
import AdminDashboard from './pages/admin/Dashboard';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.06)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
          }}
        />

        <Routes>
          {/* Admin routes (no main layout) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <AdminDashboard />
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          {/* Main portfolio routes */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <CodeBackground />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/project/:id" element={<ProjectDetail />} />
                  <Route path="/skills" element={<Skills />} />
                  <Route path="/experience" element={<Experience />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}
