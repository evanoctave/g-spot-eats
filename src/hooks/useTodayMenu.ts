import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getTodayMenu } from "@/services/menuService";
import { campusDate } from "@/utils/dates";

export function useTodayMenu(now = new Date()) {
  const queryClient = useQueryClient();
  const [campusNow, setCampusNow] = useState(now);
  const date = campusDate(campusNow);

  useEffect(() => {
    let previousState = AppState.currentState;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (previousState !== "active" && nextState === "active") {
        setCampusNow(new Date());
        void queryClient.invalidateQueries({ queryKey: ["today-menu"] });
      }
      previousState = nextState;
    });
    return () => subscription.remove();
  }, [queryClient]);

  const query = useQuery({
    queryKey: ["today-menu", date],
    queryFn: () => getTodayMenu(campusNow),
  });
  return { ...query, campusNow };
}
