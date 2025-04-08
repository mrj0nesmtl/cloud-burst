// Direct imports from TanStack Query v5
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
  QueryKey,
  QueryFunction,
  MutationFunction,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';

// Re-export all imported functions directly
export {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
};

// Legacy adapter for TanStack Query v4 style to v5
export function useLegacyQuery<TData = unknown, TError = Error>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    ...(options || {})
  });
}

// Legacy mutation adapter
export function useLegacyMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  mutationFn: MutationFunction<TData, TVariables>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>
) {
  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    ...(options || {})
  });
} 