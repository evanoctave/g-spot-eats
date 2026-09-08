import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { usePlate } from "@/context/PlateContext";
import { createDiaryEntry } from "@/lib/localDatabase";
import { theme } from "@/theme/tokens";
import type { MealPeriodId } from "@/types/dining";
import { totalSelections } from "@/utils/macros";
import { MacroSummary } from "./MacroSummary";
import { ServingSelector } from "./ServingSelector";
import { useDiary } from "@/hooks/useDiary";

export function PlateSummary({ menuDate, mealPeriod }: { menuDate: string; mealPeriod: MealPeriodId }) {
  const { selections, setServings, removeItem, clearPlate } = usePlate();
  const { addEntry } = useDiary();
  if (!selections.length) return null;
  const totals = totalSelections(selections);

  const logMeal = () => {
    const entry = createDiaryEntry({ selections, mealPeriod, menuDate });
    addEntry.mutate(entry, {
      onSuccess: () => {
        clearPlate();
        Alert.alert("Meal logged", "Your plate was saved to the on-device diary.");
      },
      onError: () => Alert.alert("Couldn’t log meal", "Your plate is still here. Please try again."),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>My plate</Text>
        <Pressable accessibilityRole="button" onPress={clearPlate} hitSlop={8}><Text style={styles.clear}>Clear</Text></Pressable>
      </View>
      {selections.map(({ item, servings }) => (
        <View key={item.id} style={styles.selection}>
          <View style={styles.selectionHeading}>
            <View style={styles.selectionCopy}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>{item.serving?.description}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${item.name}`} onPress={() => removeItem(item.id)} hitSlop={8}>
              <Ionicons name="close" size={22} color={theme.color.muted} />
            </Pressable>
          </View>
          {item.serving ? <ServingSelector serving={item.serving} value={servings} onChange={(next) => setServings(item.id, next)} /> : null}
        </View>
      ))}
      <MacroSummary totals={totals} />
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: addEntry.isPending }} disabled={addEntry.isPending} onPress={logMeal} style={({ pressed }) => [styles.logButton, pressed && styles.logPressed]}>
        <Text style={styles.logLabel}>{addEntry.isPending ? "Saving…" : "Log this meal"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.color.surface, borderRadius: theme.radius.lg, padding: theme.space.lg, gap: theme.space.lg },
  heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { ...theme.type.section, color: theme.color.ink },
  clear: { ...theme.type.label, color: theme.color.danger, paddingVertical: theme.space.sm },
  selection: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.color.divider, paddingTop: theme.space.md, gap: theme.space.md },
  selectionHeading: { flexDirection: "row", justifyContent: "space-between", gap: theme.space.md },
  selectionCopy: { flex: 1, gap: 2 },
  itemName: { ...theme.type.label, color: theme.color.ink },
  itemMeta: { ...theme.type.meta, color: theme.color.muted },
  logButton: { minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: theme.radius.md, backgroundColor: theme.color.primary },
  logPressed: { backgroundColor: theme.color.primaryPressed },
  logLabel: { ...theme.type.body, color: theme.color.white, fontWeight: "700" },
});
