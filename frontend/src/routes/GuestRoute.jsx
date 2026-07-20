import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function GuestRoute() {
  const { isAuthenticated } = useSelector(s => s.auth);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
