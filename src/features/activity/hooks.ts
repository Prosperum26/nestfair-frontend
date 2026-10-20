import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRealtimeEvent } from '@/features/realtime/context.ts';
import { RESYNC } from '@/features/realtime/hub.ts';
import { activityApi } from './api.ts';
import { latestCreatedAt, mergeActivities } from './feed.ts';
import type { Activity } from './types.ts';

export const activityKeys = {
  all: (houseId: string) => ['activity', houseId] as const,
  feed: (houseId: string) => ['activity', houseId, 'feed'] as const,
  history: (houseId: string) => ['activity', houseId, 'history'] as const,
};

/** Số mục tải khi mở Tổng quan. */
export const FEED_LIMIT = 10;
const HISTORY_PAGE = 20;

/**
 * Bảng tin hoạt động mới nhất của nhà: tải từ REST (F5 vẫn còn), thêm mục khi có `activity:new`
 * (bỏ trùng theo id), nối lại thì bù bằng `?since=` mốc mới nhất đã thấy.
 */
export function useActivityFeed(houseId: string | undefined) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: activityKeys.feed(houseId ?? ''),
    queryFn: () => activityApi.list(houseId!, { limit: FEED_LIMIT }),
    enabled: !!houseId,
  });

  const merge = (incoming: Activity[]) => {
    if (!houseId) return;
    queryClient.setQueryData<Activity[]>(activityKeys.feed(houseId), (cur) => mergeActivities(cur ?? [], incoming));
  };

  useRealtimeEvent('activity:new', (env) => merge([(env.payload as { activity: Activity }).activity]));
  useRealtimeEvent(RESYNC, () => {
    if (!houseId) return;
    const since = latestCreatedAt(queryClient.getQueryData<Activity[]>(activityKeys.feed(houseId)) ?? []);
    if (!since) {
      void queryClient.invalidateQueries({ queryKey: activityKeys.all(houseId) });
      return;
    }
    void activityApi.since(houseId, since).then(merge, () => undefined);
    void queryClient.invalidateQueries({ queryKey: activityKeys.history(houseId) });
  });

  return query;
}

/** Lịch sử đầy đủ (panel "Hoạt động gần đây"): 20 mục một trang, cuộn thêm bằng `before`. */
export function useActivityHistory(houseId: string | undefined, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: activityKeys.history(houseId ?? ''),
    queryFn: ({ pageParam }) => activityApi.list(houseId!, { limit: HISTORY_PAGE, before: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.length < HISTORY_PAGE ? undefined : last.at(-1)!.createdAt),
    enabled: !!houseId && enabled,
  });
}
