import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

export function useAuth() {
  const { identity, login, clear, loginStatus, isLoggingIn, isLoginError } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const principalId = identity?.getPrincipal().toString();

  return {
    isAuthenticated,
    principalId,
    login,
    logout: handleLogout,
    loginStatus,
    isLoggingIn,
    isLoginError,
  };
}
