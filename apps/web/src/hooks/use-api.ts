import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api-client";
import type { AxiosError, AxiosRequestConfig } from "axios";

/**
 * Custom hook for GET requests with TanStack Query
 *
 * @example
 * const { data, isLoading, error } = useApiQuery(
 *   ['projects', userId],
 *   '/projects',
 *   { enabled: !!userId }
 * );
 */
export function useApiQuery<TData = unknown, TError = AxiosError>(
  queryKey: unknown[],
  url: string,
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn"> & {
    config?: AxiosRequestConfig;
  }
) {
  const { config, ...queryOptions } = options ?? {};

  return useQuery<TData, TError>({
    queryKey,
    queryFn: () => apiGet<TData>(url, config),
    ...queryOptions,
  });
}

/**
 * Custom hook for POST mutations with TanStack Query
 *
 * @example
 * const { mutate, isPending } = useApiMutation<Project, CreateProjectInput>(
 *   '/projects',
 *   {
 *     onSuccess: (data) => {
 *       toast.success('Project created!');
 *       queryClient.invalidateQueries(['projects']);
 *     },
 *   }
 * );
 */
export function useApiMutation<TData = unknown, TVariables = unknown, TError = AxiosError>(
  url: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn"> & {
    config?: AxiosRequestConfig;
  }
) {
  const { config, ...mutationOptions } = options ?? {};

  return useMutation<TData, TError, TVariables>({
    mutationFn: (data) => apiPost<TData>(url, data, config),
    ...mutationOptions,
  });
}

/**
 * Custom hook for PUT mutations with TanStack Query
 *
 * @example
 * const { mutate, isPending } = useApiUpdateMutation<Project, UpdateProjectInput>(
 *   '/projects/123',
 *   {
 *     onSuccess: () => queryClient.invalidateQueries(['projects']),
 *   }
 * );
 */
export function useApiUpdateMutation<TData = unknown, TVariables = unknown, TError = AxiosError>(
  url: string,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn"> & {
    config?: AxiosRequestConfig;
  }
) {
  const { config, ...mutationOptions } = options ?? {};

  return useMutation<TData, TError, TVariables>({
    mutationFn: (data) => apiPut<TData>(url, data, config),
    ...mutationOptions,
  });
}

/**
 * Custom hook for DELETE mutations with TanStack Query
 *
 * @example
 * const { mutate, isPending } = useApiDeleteMutation<void>(
 *   '/projects/123',
 *   {
 *     onSuccess: () => queryClient.invalidateQueries(['projects']),
 *   }
 * );
 */
export function useApiDeleteMutation<TData = unknown, TError = AxiosError>(
  url: string,
  options?: Omit<UseMutationOptions<TData, TError, void>, "mutationFn"> & {
    config?: AxiosRequestConfig;
  }
) {
  const { config, ...mutationOptions } = options ?? {};

  return useMutation<TData, TError, void>({
    mutationFn: () => apiDelete<TData>(url, config),
    ...mutationOptions,
  });
}

/**
 * Custom hook for dynamic URL mutations (when URL depends on variables)
 *
 * @example
 * const { mutate, isPending } = useDynamicApiMutation<Project, { id: string; data: UpdateInput }>(
 *   ({ id, data }) => ({ url: `/projects/${id}`, data }),
 *   {
 *     onSuccess: () => queryClient.invalidateQueries(['projects']),
 *   }
 * );
 */
export function useDynamicApiMutation<
  TData = unknown,
  TVariables extends { url?: string; data?: unknown } = { url?: string; data?: unknown },
  TError = AxiosError
>(
  urlFn: (variables: TVariables) => { url: string; data?: unknown; method?: "POST" | "PUT" | "DELETE" },
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, "mutationFn"> & {
    config?: AxiosRequestConfig;
  }
) {
  const { config, ...mutationOptions } = options ?? {};

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      const { url, data, method = "POST" } = urlFn(variables);
      switch (method) {
        case "PUT":
          return apiPut<TData>(url, data, config);
        case "DELETE":
          return apiDelete<TData>(url, config);
        default:
          return apiPost<TData>(url, data, config);
      }
    },
    ...mutationOptions,
  });
}
