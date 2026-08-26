/**
 * AuthGuard - 路由守卫 (Phase 5 JWT 鉴权).
 *
 * 用法: 包裹受保护路由的 layout:
 *   <Route element={<AuthGuard />}>
 *     <Route path="/welcome" element={<Welcome />} />
 *     ...
 *   </Route>
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
