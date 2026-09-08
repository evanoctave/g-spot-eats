import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { MacroSummary } from "./MacroSummary";
import { theme } from "@/theme/tokens";
import type { MenuItem } from "@/types/dining";

export function FoodCard({ item, onAdd }: { item: MenuItem; onAdd?: (item: MenuItem) => void }) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel={`View ${item.name} details`} onPress={() => router.push({ pathname: "/food/[id]", params: { id: item.id } })} style={({ pressed }) => [styles.details, pressed && styles.pressed]}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.color.muted} />
        </View>
        <Text style={styles.meta}>{item.serving?.description ?? "Nutrition unavailable"}</Text>
        {item.nutrition ? <MacroSummary totals={item.nutrition} compact /> : <Text style={styles.unavailable}>Nutrition unavailable</Text>}
        {item.dietaryLabels.length ? <Text style={styles.labels}>{item.dietaryLabels.join(" · ")}</Text> : null}
      </Pressable>
      {onAdd && item.nutrition && item.serving ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Add ${item.name} to plate`} onPress={() => onAdd(item)} style={({ pressed }) => [styles.add, pressed && styles.addPressed]}>
          <Ionicons name="add" size={23} color={theme.color.white} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 104, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.color.divider, gap: theme.space.md },
  details: { flex: 1, paddingVertical: theme.space.lg, gap: theme.space.xs },
  pressed: { opacity: 0.65 },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: theme.space.sm },
  name: { ...theme.type.body, color: theme.color.ink, fontWeight: "700", flex: 1 },
  meta: { ...theme.type.meta, color: theme.color.muted },
  labels: { ...theme.type.meta, color: theme.color.confirmation, fontWeight: "600" },
  unavailable: { ...theme.type.meta, color: theme.color.danger },
  add: { width: 44, height: 44, borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: theme.color.primary },
  addPressed: { backgroundColor: theme.color.primaryPressed },
});
