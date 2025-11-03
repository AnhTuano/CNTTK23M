import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../lib/api';

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const response = await authAPI.getCurrentUser();
        return response.data;
      } catch (error) {
        return null;
      }
    }
  });

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (response) => {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      queryClient.setQueryData(['auth', 'me'], response.data.user);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
    }
  });

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (response) => {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      queryClient.setQueryData(['auth', 'me'], response.data.user);
    }
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    register: registerMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isRegisterLoading: registerMutation.isPending
  };
};
