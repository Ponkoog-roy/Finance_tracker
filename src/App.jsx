import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Transactions from '@/pages/Transactions';
import NewTransaction from '@/pages/NewTransaction';
import Budgets from '@/pages/Budgets';
import Goals from '@/pages/Goals';
import Accounts from '@/pages/Accounts';
import FinancialCalendar from '@/pages/FinancialCalendar';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';

const AuthenticatedApp = () => {
  // Use a local state variable to control landing status
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  // A local function to trigger entry when credentials are submitted
  const handleMockLoginSuccess = () => {
    setUserAuthenticated(true);
  };

  return (
    <Routes>
      {/* 1. If NOT authenticated, visiting "/" redirects instantly to "/login" */}
      <Route 
        path="/" 
        element={userAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
      />

      {/* 2. Public Facing Guest Routes */}
      <Route path="/login" element={<Login onLoginSuccess={handleMockLoginSuccess} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* 3. Restricted Dashboard Routes Wrapper */}
      <Route element={userAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transactions/new" element={<NewTransaction />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/calendar" element={<FinancialCalendar />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
