import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAuthenticated } from '@/shared/auth/session';
import {
  buildCompareClearUrl,
  clearCompareProducts,
  toggleCompareProduct,
} from '../api/storefrontApi';
import { defaultStorefrontState, guestCompareUpdatedEvent } from '../constants';
import { storefrontStateKey } from '../queryKeys';
import type { StorefrontToggleResult } from '../types';
import {
  clearGuestCompareIds,
  persistGuestCompareIds,
  readGuestCompareIds,
} from '../utils/guestCompareStorage';
import { useStorefrontState } from './useStorefrontState';

export function useCompare() {
  const authed = isAuthenticated();
  const queryClient = useQueryClient();
  const storefrontQuery = useStorefrontState();
  const [guestIds, setGuestIds] = useState<string[]>(() => (authed ? [] : readGuestCompareIds()));
  const compareLimit = storefrontQuery.data?.compareLimit ?? defaultStorefrontState.compareLimit;

  useEffect(() => {
    if (authed || typeof window === 'undefined') {
      return;
    }

    const syncFromStorage = () => setGuestIds(readGuestCompareIds());
    syncFromStorage();

    window.addEventListener(guestCompareUpdatedEvent, syncFromStorage);
    window.addEventListener('storage', syncFromStorage);

    return () => {
      window.removeEventListener(guestCompareUpdatedEvent, syncFromStorage);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, [authed]);

  const ids = authed
    ? (storefrontQuery.data?.compareProductIds ?? defaultStorefrontState.compareProductIds)
    : guestIds;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const compareClearUrl = buildCompareClearUrl();
    let clearOnCloseTriggered = false;

    function clearOnWindowClose() {
      if (clearOnCloseTriggered) {
        return;
      }
      clearOnCloseTriggered = true;

      if (!authed) {
        clearGuestCompareIds();
        return;
      }

      if (ids.length === 0) {
        return;
      }

      const token = localStorage.getItem('accessToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      void fetch(compareClearUrl, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        keepalive: true,
      });
    }

    window.addEventListener('beforeunload', clearOnWindowClose);
    window.addEventListener('pagehide', clearOnWindowClose);

    return () => {
      window.removeEventListener('beforeunload', clearOnWindowClose);
      window.removeEventListener('pagehide', clearOnWindowClose);
    };
  }, [authed, ids]);

  const toggleMutation = useMutation({
    mutationFn: toggleCompareProduct,
    onSuccess: (data) => {
      queryClient.setQueryData(storefrontStateKey, data);
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearCompareProducts,
    onSuccess: (data) => {
      queryClient.setQueryData(storefrontStateKey, data);
    },
  });

  return {
    ids,
    isLoading: storefrontQuery.isLoading || toggleMutation.isPending || clearMutation.isPending,
    async toggle(productId: string): Promise<StorefrontToggleResult> {
      if (!authed) {
        const exists = guestIds.includes(productId);
        let reachedLimit = false;
        let nextIds: string[];

        if (exists) {
          nextIds = guestIds.filter((id) => id !== productId);
        } else if (guestIds.length >= compareLimit) {
          reachedLimit = true;
          nextIds = [...guestIds.slice(1), productId];
        } else {
          nextIds = [...guestIds, productId];
        }

        setGuestIds(nextIds);
        persistGuestCompareIds(nextIds);

        return {
          added: !exists,
          ids: nextIds,
          reachedLimit,
        };
      }

      const response = await toggleMutation.mutateAsync(productId);

      return {
        added: response.added,
        ids: response.compareProductIds,
        reachedLimit: Boolean(response.reachedLimit),
      };
    },
    clear() {
      if (!authed) {
        setGuestIds([]);
        clearGuestCompareIds();
        return;
      }

      clearMutation.mutate();
    },
  };
}
