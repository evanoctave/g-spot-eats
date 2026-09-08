import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/theme/tokens";

export function MacroBar({ label, value, target, color = theme.color.primary, unit = "g" }: { label: string; value: number; target: number; color?: string; unit?: string }) {
  const progress = target > 0 ? Math.min(value / target, 1) : 0;
  return (
    <View style={styles.group}>
      <View style={styles.labels}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{Math.round(value)} / {Math.round(target)}{unit}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: theme.space.sm },
  labels: { flexDirection: "row", justifyContent: "space-between" },
  label: { ...theme.type.label, color: theme.color.ink },
  value: { ...theme.type.meta, color: theme.color.muted },
  track: { height: 8, borderRadius: theme.radius.pill, backgroundColor: theme.color.divider, overflow: "hidden" },
  fill: { height: "100%", borderRadius: theme.radius.pill },
});
