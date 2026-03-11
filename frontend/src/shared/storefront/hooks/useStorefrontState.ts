import { useQuery } from '@tanstack/react-query';
import { isAuthenticated } from '@/shared/auth/session';
import { fetchStorefrontState } from '../api/storefrontApi';
import { storefrontStateKey } from '../queryKeys';

export function useStorefrontState() {
  const authed = isAuthenticated();

  return useQuery({
    queryKey: storefrontStateKey,
    queryFn: fetchStorefrontState,
    enabled: authed,
    staleTime: 30_000,
  });
}
