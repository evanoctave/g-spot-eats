import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DataFreshnessBanner } from "@/components/DataFreshnessBanner";
import { GoalSelector } from "@/components/GoalSelector";
import { PlateSummary } from "@/components/PlateSummary";
import { Screen } from "@/components/Screen";
import { StationPlan } from "@/components/StationPlan";
import { usePlate } from "@/context/PlateContext";
import { usePreferences } from "@/hooks/usePreferences";
import { useTodayMenu } from "@/hooks/useTodayMenu";
import { theme } from "@/theme/tokens";
import type { DietMode } from "@/types/dining";
import { activeMealPeriod, formatCampusDate } from "@/utils/dates";
import { buildPlateRecommendation } from "@/utils/macros";

export default function TodayRoute() {
  const now = useMemo(() => new Date(), []);
  const { preferences } = usePreferences();
  const [modeOverride, setModeOverride] = useState<DietMode | null>(null);
  const menuQuery = useTodayMenu(now);
  const { replaceWithRecommendation } = usePlate();
  const currentNow = menuQuery.campusNow;
  const mealPeriod = activeMealPeriod(currentNow);
  const mode = modeOverride ?? preferences.defaultDietMode;

  if (menuQuery.isLoading) {
    return <Screen title="Today" subtitle={formatCampusDate(currentNow)}><View style={styles.loading}><Text style={styles.loadingTitle}>Preparing today’s menu…</Text><Text style={styles.loadingCopy}>Checking the latest available dining-hall snapshot.</Text></View></Screen>;
  }

  if (menuQuery.isError || !menuQuery.data) {
    return <Screen title="Today" subtitle={formatCampusDate(currentNow)}><View style={styles.error}><Text style={styles.errorTitle}>Today’s menu is unavailable</Text><Text style={styles.errorCopy}>We couldn’t load a valid current-date menu. An old menu will never be shown as today’s.</Text><Pressable accessibilityRole="button" onPress={() => menuQuery.refetch()} style={styles.retry}><Text style={styles.retryLabel}>Try again</Text></Pressable></View></Screen>;
  }

  const { menu, isDemo } = menuQuery.data;
  const recommendation = buildPlateRecommendation(menu, mealPeriod, mode, currentNow);

  return (
    <Screen title="Today at the hall" subtitle={`${formatCampusDate(currentNow)} · ${mealPeriod[0].toUpperCase() + mealPeriod.slice(1)}`}>
      <DataFreshnessBanner freshness={menu.freshness} isDemo={isDemo} />
      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>What fits today?</Text>
          <Text style={styles.sectionCopy}>Choose a direction. Recommendations only use foods with a source serving and nutrition facts.</Text>
        </View>
        <GoalSelector value={mode} onChange={setModeOverride} />
      </View>
      {recommendation ? <StationPlan recommendation={recommendation} onUse={() => replaceWithRecommendation(recommendation.items)} /> : <View style={styles.error}><Text style={styles.errorTitle}>No reliable match</Text><Text style={styles.errorCopy}>This meal does not have enough verified foods for that goal. Browse the menu instead of forcing a recommendation.</Text></View>}
      <PlateSummary menuDate={menu.menuDate} mealPeriod={mealPeriod} />
      <Text style={styles.disclaimer}>Nutrition and portions may vary. Goal modes are planning aids, not medical or allergy advice.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: theme.space.lg },
  sectionHeading: { gap: theme.space.xs },
  sectionTitle: { ...theme.type.section, color: theme.color.ink },
  sectionCopy: { ...theme.type.body, color: theme.color.muted },
  loading: { paddingVertical: theme.space.xxxl, gap: theme.space.sm },
  loadingTitle: { ...theme.type.section, color: theme.color.ink },
  loadingCopy: { ...theme.type.body, color: theme.color.muted },
  error: { borderRadius: theme.radius.lg, backgroundColor: theme.color.dangerSoft, padding: theme.space.xl, gap: theme.space.sm },
  errorTitle: { ...theme.type.section, color: theme.color.danger },
  errorCopy: { ...theme.type.body, color: theme.color.ink },
  retry: { minHeight: 48, marginTop: theme.space.sm, alignItems: "center", justifyContent: "center", borderRadius: theme.radius.md, backgroundColor: theme.color.danger },
  retryLabel: { ...theme.type.label, color: theme.color.white },
  disclaimer: { ...theme.type.meta, color: theme.color.muted },
});
