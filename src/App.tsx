import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import ProtectedRoute from "@/components/ProtectedRoute";
import SEOHead from "@/components/SEOHead";
import ScrollToTop from "@/components/ScrollToTop";
import CookieConsent from "./components/CookieConsent";
import PageLoader from "@/components/PageLoader";
import PageViewTracker from "@/components/PageViewTracker";

// Eager: landing page (first paint)
import UnifiedLanding from "./pages/UnifiedLanding";

// Lazy-loaded pages
const ProLanding = lazy(() => import("./pages/ProLanding"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Practice = lazy(() => import("./pages/Practice"));
const SessionDetail = lazy(() => import("./pages/SessionDetail"));
const Settings = lazy(() => import("./pages/Settings"));
const ProSubscription = lazy(() => import("./pages/ProSubscription"));
const ProSubscriptionManage = lazy(() => import("./pages/ProSubscriptionManage"));
const Library = lazy(() => import("./pages/Library"));
const PatientDetail = lazy(() => import("./pages/PatientDetail"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Assessment = lazy(() => import("./pages/Assessment"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const SubscriptionManage = lazy(() => import("./pages/SubscriptionManage"));
const Contact = lazy(() => import("./pages/Contact"));
const TherapistDashboard = lazy(() => import("./pages/TherapistDashboard"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const Dialogue = lazy(() => import("./pages/Dialogue"));
const Diagnostic = lazy(() => import("./pages/Diagnostic"));
const Admin = lazy(() => import("./pages/Admin"));
const AcousticTest = lazy(() => import("./pages/AcousticTest"));
const DialogueLab = lazy(() => import("./pages/DialogueLab"));
const SessionLive = lazy(() => import("./pages/SessionLive"));
const SilenceTraining = lazy(() => import("./pages/SilenceTraining"));
const Partners = lazy(() => import("./pages/Partners"));
const NeurologyTraining = lazy(() => import("./pages/NeurologyTraining"));
const Wrapped = lazy(() => import("./pages/Wrapped"));
const BatteryAssessment = lazy(() => import("./pages/BatteryAssessment"));

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <PageViewTracker />
          <SEOHead />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Unified landing page */}
              <Route path="/" element={<UnifiedLanding />} />
              <Route path="/pro" element={<ProLanding />} />
              <Route path="/patients" element={<Navigate to="/#patients" replace />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/pro/subscription" element={<ProtectedRoute><ProSubscription /></ProtectedRoute>} />
              <Route path="/pro/subscription/manage" element={<ProtectedRoute><ProSubscriptionManage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
              <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
              <Route path="/dialogue" element={<ProtectedRoute><Dialogue /></ProtectedRoute>} />
              
              <Route path="/session/:id" element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/patient/list" element={<ProtectedRoute><TherapistDashboard /></ProtectedRoute>} />
              <Route path="/patient/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
              <Route path="/pricing" element={<Pricing />} />
              
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/diagnostic" element={<Diagnostic />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/legal/terms" element={<Terms />} />
              <Route path="/legal/privacy" element={<Privacy />} />
              <Route path="/subscription/manage" element={<ProtectedRoute><SubscriptionManage /></ProtectedRoute>} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogArticle />} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/admin/test-acoustique" element={<ProtectedRoute><AcousticTest /></ProtectedRoute>} />
              <Route path="/dialogue-lab" element={<DialogueLab />} />
              <Route path="/session-live" element={<ProtectedRoute><SessionLive /></ProtectedRoute>} />
              <Route path="/silence-training" element={<ProtectedRoute><SilenceTraining /></ProtectedRoute>} />
              <Route path="/neuro-training" element={<ProtectedRoute><NeurologyTraining /></ProtectedRoute>} />
              <Route path="/partenaires" element={<Partners />} />
              <Route path="/wrapped/:year" element={<Wrapped />} />
              <Route path="/assessment/battery" element={<ProtectedRoute><BatteryAssessment /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
