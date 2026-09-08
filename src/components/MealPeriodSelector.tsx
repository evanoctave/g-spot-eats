import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme/tokens";
import type { DiningPeriod, MealPeriodId } from "@/types/dining";

export function MealPeriodSelector({ periods, value, onChange }: { periods: DiningPeriod[]; value: MealPeriodId; onChange: (period: MealPeriodId) => void }) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {periods.map((period) => {
        const selected = value === period.id;
        return (
          <Pressable key={period.id} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => onChange(period.id)} style={({ pressed }) => [styles.tab, selected && styles.selected, pressed && styles.pressed]}>
            <Text style={[styles.label, selected && styles.selectedLabel]}>{period.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", padding: 4, borderRadius: theme.radius.md, backgroundColor: theme.color.divider },
  tab: { minHeight: 44, flex: 1, alignItems: "center", justifyContent: "center", borderRadius: theme.radius.sm },
  selected: { backgroundColor: theme.color.surface },
  pressed: { opacity: 0.7 },
  label: { ...theme.type.label, color: theme.color.muted },
  selectedLabel: { color: theme.color.ink },
});
