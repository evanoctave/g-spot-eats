import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { defaultPreferences, getPreferences, setPreferences, type AppPreferences } from "@/lib/localDatabase";

export function usePreferences() {
  const queryClient = useQueryClient();
  const preferences = useQuery({
    queryKey: ["preferences"],
    queryFn: getPreferences,
    placeholderData: defaultPreferences,
  });
  const save = useMutation({
    mutationFn: (next: AppPreferences) => setPreferences(next),
    onSuccess: (_, next) => queryClient.setQueryData(["preferences"], next),
  });
  return { preferences: preferences.data ?? defaultPreferences, save };
}
