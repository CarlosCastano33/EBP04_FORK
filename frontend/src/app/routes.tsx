import { createBrowserRouter, Navigate } from 'react-router';
import { useAuth } from './context/AuthContext';
import { Register } from './pages/Register';
import { ProfileSetup } from './pages/ProfileSetup';
import { HomeSelection } from './pages/HomeSelection';
import { CreateHome } from './pages/CreateHome';
import { JoinHome } from './pages/JoinHome';
import { Login } from './pages/Login';
import { LogoutSuccess } from './pages/LogoutSuccess';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Members } from './pages/Members';
import { MemberRemoveSuccess } from './pages/MemberRemoveSuccess';
import { RoleManagement } from './pages/RoleManagement';
import { Tasks } from './pages/Tasks';
import { PendingTasks } from './pages/PendingTasks';
import { MyTasks } from './pages/MyTasks';
import { HomeTasksOverview } from './pages/HomeTasksOverview';
import { HomeHistoryOverview } from './pages/HomeHistoryOverview';
import { ReportsOverview } from './pages/ReportsOverview';
import { ComplianceReport } from './pages/ComplianceReport';
import { UserReport } from './pages/UserReport';
import { DistributionReport } from './pages/DistributionReport';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoadingSession } = useAuth();

  if (isLoadingSession) {
    return <SessionLoader />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoadingSession } = useAuth();

  if (isLoadingSession) {
    return <SessionLoader />;
  }

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function SessionLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="rounded-lg bg-white px-6 py-5 text-center shadow-lg">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <p className="text-sm text-gray-600">Validando sesión...</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: '/profile-setup',
    element: (
      <ProtectedRoute>
        <ProfileSetup />
      </ProtectedRoute>
    ),
  },
  {
    path: '/home-selection',
    element: (
      <ProtectedRoute>
        <HomeSelection />
      </ProtectedRoute>
    ),
  },
  {
    path: '/create-home',
    element: (
      <ProtectedRoute>
        <CreateHome />
      </ProtectedRoute>
    ),
  },
  {
    path: '/join-home',
    element: (
      <ProtectedRoute>
        <JoinHome />
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/logout-success',
    element: <LogoutSuccess />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/members',
    element: (
      <ProtectedRoute>
        <Members />
      </ProtectedRoute>
    ),
  },
  {
    path: '/member-remove-success',
    element: (
      <ProtectedRoute>
        <MemberRemoveSuccess />
      </ProtectedRoute>
    ),
  },
  {
    path: '/role-management',
    element: (
      <ProtectedRoute>
        <RoleManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tasks',
    element: (
      <ProtectedRoute>
        <Tasks />
      </ProtectedRoute>
    ),
  },
  {
    path: '/pending-tasks',
    element: (
      <ProtectedRoute>
        <PendingTasks />
      </ProtectedRoute>
    ),
  },
  {
    path: '/my-tasks',
    element: (
      <ProtectedRoute>
        <MyTasks />
      </ProtectedRoute>
    ),
  },
  {
    path: '/home-tasks-overview',
    element: (
      <ProtectedRoute>
        <HomeTasksOverview />
      </ProtectedRoute>
    ),
  },
  {
    path: '/home-history',
    element: (
      <ProtectedRoute>
        <HomeHistoryOverview />
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports',
    element: (
      <ProtectedRoute>
        <ReportsOverview />
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports/compliance',
    element: (
      <ProtectedRoute>
        <ComplianceReport />
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports/user',
    element: (
      <ProtectedRoute>
        <UserReport />
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports/distribution',
    element: (
      <ProtectedRoute>
        <DistributionReport />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
