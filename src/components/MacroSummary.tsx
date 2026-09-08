import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme/tokens";
import type { MacroTotals } from "@/types/nutrition";

export function MacroSummary({ totals, compact = false }: { totals: MacroTotals; compact?: boolean }) {
  const values = [
    [Math.round(totals.calories).toString(), "cal"],
    [`${Math.round(totals.proteinGrams)}g`, "protein"],
    [`${Math.round(totals.carbohydratesGrams)}g`, "carbs"],
    [`${Math.round(totals.fatGrams)}g`, "fat"],
  ];
  return (
    <View accessible style={[styles.row, compact && styles.compact]} accessibilityLabel={`${Math.round(totals.calories)} calories, ${Math.round(totals.proteinGrams)} grams protein, ${Math.round(totals.carbohydratesGrams)} grams carbohydrates, ${Math.round(totals.fatGrams)} grams fat`}>
      {values.map(([value, label]) => (
        <View key={label} style={styles.valueGroup}>
          <Text style={[styles.value, compact && styles.compactValue]}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", gap: theme.space.sm },
  compact: { justifyContent: "flex-start", gap: theme.space.lg },
  valueGroup: { gap: 1 },
  value: { color: theme.color.ink, fontSize: 18, lineHeight: 22, fontWeight: "700" },
  compactValue: { fontSize: 15, lineHeight: 19 },
  label: { color: theme.color.muted, fontSize: 12, lineHeight: 16 },
});
