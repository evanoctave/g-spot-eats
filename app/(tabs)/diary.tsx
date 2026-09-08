import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { MacroBar } from "@/components/MacroBar";
import { MacroSummary } from "@/components/MacroSummary";
import { MealSection } from "@/components/MealSection";
import { Screen } from "@/components/Screen";
import { useDiary } from "@/hooks/useDiary";
import { usePreferences } from "@/hooks/usePreferences";
import { theme } from "@/theme/tokens";
import { campusDate } from "@/utils/dates";
import { addMacros } from "@/utils/macros";
import { emptyMacros } from "@/types/nutrition";

export default function DiaryRoute() {
  const { entries, clearEntries } = useDiary();
  const { preferences } = usePreferences();
  const today = campusDate(new Date());
  const todaysEntries = (entries.data ?? []).filter((entry) => entry.menuDate === today);
  const totals = todaysEntries.reduce((sum, entry) => addMacros(sum, entry.totals), emptyMacros);

  const confirmClear = () => Alert.alert("Clear diary?", "This permanently removes every locally saved meal.", [
    { text: "Cancel", style: "cancel" },
    { text: "Clear diary", style: "destructive", onPress: () => clearEntries.mutate() },
  ]);

  return (
    <Screen title="Diary" subtitle="Meals stay on this device" right={(entries.data?.length ?? 0) > 0 ? <Pressable accessibilityRole="button" onPress={confirmClear} hitSlop={8}><Text style={styles.clear}>Clear</Text></Pressable> : null}>
      <View style={styles.daily}>
        <View style={styles.dailyHeading}>
          <Text style={styles.dailyTitle}>Today so far</Text>
          <Text style={styles.mealCount}>{todaysEntries.length} {todaysEntries.length === 1 ? "meal" : "meals"}</Text>
        </View>
        <MacroSummary totals={totals} />
        <View style={styles.bars}>
          <MacroBar label="Calories" value={totals.calories} target={preferences.goals.calories} unit="" />
          <MacroBar label="Protein" value={totals.proteinGrams} target={preferences.goals.proteinGrams} color={theme.color.confirmation} />
          <MacroBar label="Carbs" value={totals.carbohydratesGrams} target={preferences.goals.carbohydratesGrams} />
          <MacroBar label="Fat" value={totals.fatGrams} target={preferences.goals.fatGrams} color={theme.color.warning} />
        </View>
      </View>
      {entries.isLoading ? <Text style={styles.emptyCopy}>Loading your diary…</Text> : null}
      {!entries.isLoading && !(entries.data?.length) ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Your first plate starts on Today</Text>
          <Text style={styles.emptyCopy}>Use a suggested plate or add foods from the menu, then log it. The saved nutrition is an immutable snapshot.</Text>
        </View>
      ) : (entries.data ?? []).map((entry) => <MealSection key={entry.id} entry={entry} />)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  clear: { ...theme.type.label, color: theme.color.danger, paddingVertical: theme.space.sm },
  daily: { backgroundColor: theme.color.surface, borderRadius: theme.radius.lg, padding: theme.space.lg, gap: theme.space.lg },
  dailyHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  dailyTitle: { ...theme.type.section, color: theme.color.ink },
  mealCount: { ...theme.type.meta, color: theme.color.muted },
  bars: { gap: theme.space.md },
  empty: { paddingVertical: theme.space.xxxl, gap: theme.space.sm },
  emptyTitle: { ...theme.type.section, color: theme.color.ink },
  emptyCopy: { ...theme.type.body, color: theme.color.muted },
});
