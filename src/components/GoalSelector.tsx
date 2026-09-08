import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { theme } from "@/theme/tokens";
import type { DietMode } from "@/types/dining";
import { dietModes } from "@/utils/macros";

export function GoalSelector({ value, onChange }: { value: DietMode; onChange: (mode: DietMode) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} accessibilityRole="tablist">
      {dietModes.map((mode) => {
        const selected = value === mode.id;
        return (
          <Pressable key={mode.id} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => onChange(mode.id)} style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}>
            <Text style={[styles.label, selected && styles.selectedLabel]}>{mode.shortLabel}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: theme.space.sm, paddingRight: theme.space.xl },
  chip: { minHeight: 44, justifyContent: "center", paddingHorizontal: theme.space.lg, borderRadius: theme.radius.pill, backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.divider },
  selected: { backgroundColor: theme.color.primary, borderColor: theme.color.primary },
  pressed: { opacity: 0.75 },
  label: { ...theme.type.label, color: theme.color.ink },
  selectedLabel: { color: theme.color.white },
});
