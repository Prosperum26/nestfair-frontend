import type { QueryClient, QueryKey } from '@tanstack/react-query';

type WithId = { id: string };

export function removeById<T extends WithId>(list: T[] | undefined, id: string): T[] | undefined {
  return list?.filter((item) => item.id !== id);
}

export function patchById<T extends WithId>(list: T[] | undefined, id: string, patch: Partial<NoInfer<T>>): T[] | undefined {
  return list?.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export interface OptimisticContext<T> {
  snapshots: [QueryKey, T[] | undefined][];
  ids: string[];
}

/**
 * Trả lại đúng các phần tử `ids` từ `before` vào `current`, giữ nguyên mọi thay đổi khác đã xảy ra sau đó
 * (vd. một lần xóa lạc quan khác). Phần tử không có trong `before` (thêm lạc quan) thì bỏ ra.
 */
function restore<T extends WithId>(current: T[], before: T[], ids: string[]): T[] {
  let next = [...current];
  for (const id of ids) {
    const old = before.find((item) => item.id === id);
    if (!old) {
      next = next.filter((item) => item.id !== id);
      continue;
    }
    const at = next.findIndex((item) => item.id === id);
    if (at >= 0) {
      next[at] = old;
      continue;
    }
    // Chèn sau phần tử đứng trước nó trong bản cũ mà vẫn còn trong danh sách hiện tại.
    const oldIndex = before.indexOf(old);
    let insertAt = 0;
    for (let k = oldIndex - 1; k >= 0; k--) {
      const prevAt = next.findIndex((item) => item.id === before[k].id);
      if (prevAt >= 0) {
        insertAt = prevAt + 1;
        break;
      }
    }
    next.splice(insertAt, 0, old);
  }
  return next;
}

/**
 * Cập nhật lạc quan cho các query danh sách cùng tiền tố `queryKey` (TanStack Query v5). Gắn thẳng vào
 * `useMutation({ ...optimisticList(...) })`. Toast lỗi do nơi gọi lo (đã có sẵn `onError` ở từng màn).
 */
export function optimisticList<TVars, T extends WithId>(
  queryClient: QueryClient,
  { queryKey, apply, ids }: { queryKey: QueryKey; apply: (list: T[], vars: TVars) => T[]; ids: (vars: TVars) => string[] },
) {
  return {
    onMutate: async (vars: TVars): Promise<OptimisticContext<T>> => {
      // Hủy request đang chạy để dữ liệu cũ về sau không ghi đè bản lạc quan.
      await queryClient.cancelQueries({ queryKey });
      const snapshots = queryClient.getQueriesData<T[]>({ queryKey });
      for (const [key, list] of snapshots) if (list) queryClient.setQueryData<T[]>(key, apply(list, vars));
      return { snapshots, ids: ids(vars) };
    },
    onError: (_error: unknown, _vars: TVars, context: OptimisticContext<T> | undefined) => {
      if (!context) return;
      for (const [key, before] of context.snapshots) {
        if (!before) continue;
        queryClient.setQueryData<T[]>(key, (current) => (current ? restore(current, before, context.ids) : before));
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  };
}
