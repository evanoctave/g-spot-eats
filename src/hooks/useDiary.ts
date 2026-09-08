import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { clearDiaryEntries, insertDiaryEntry, listDiaryEntries } from "@/lib/localDatabase";
import type { DiaryEntry } from "@/types/dining";

export function useDiary() {
  const queryClient = useQueryClient();
  const entries = useQuery({
    queryKey: ["diary"],
    queryFn: listDiaryEntries,
  });
  const addEntry = useMutation({
    mutationFn: (entry: DiaryEntry) => insertDiaryEntry(entry),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diary"] }),
  });
  const clearEntries = useMutation({
    mutationFn: clearDiaryEntries,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["diary"] }),
  });
  return { entries, addEntry, clearEntries };
}
