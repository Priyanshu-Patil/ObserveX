import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/api';
import { QUERY_KEYS, REFETCH_INTERVAL } from '../constants';

export function useAnalyticsQuery(params, options = {}) {
    return useQuery({
        queryKey: [...QUERY_KEYS.STATS, params],
        queryFn: () => analyticsApi.getStats(params),
        refetchInterval: REFETCH_INTERVAL,
        ...options,
    });
}
