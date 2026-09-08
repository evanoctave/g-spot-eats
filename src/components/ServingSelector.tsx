import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme/tokens";
import type { SourceServing } from "@/types/nutrition";

export function ServingSelector({ serving, value, onChange }: { serving: SourceServing; value: number; onChange: (next: number) => void }) {
  const canDecrease = value > 1;
  const canIncrease = serving.multipliable;
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel="Decrease serving" accessibilityState={{ disabled: !canDecrease }} disabled={!canDecrease} onPress={() => onChange(value - 1)} style={({ pressed }) => [styles.button, !canDecrease && styles.disabled, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>−</Text>
      </Pressable>
      <View style={styles.valueGroup}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.caption}>{value === 1 ? "serving" : "servings"}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Increase serving" accessibilityState={{ disabled: !canIncrease }} disabled={!canIncrease} onPress={() => onChange(value + 1)} style={({ pressed }) => [styles.button, !canIncrease && styles.disabled, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: theme.space.md },
  button: { width: 44, height: 44, borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: theme.color.primarySoft },
  pressed: { backgroundColor: theme.color.divider },
  disabled: { opacity: 0.4 },
  buttonText: { fontSize: 24, lineHeight: 28, color: theme.color.primary, fontWeight: "600" },
  valueGroup: { minWidth: 54, alignItems: "center" },
  value: { fontSize: 18, lineHeight: 22, fontWeight: "700", color: theme.color.ink },
  caption: { ...theme.type.meta, color: theme.color.muted },
});
