import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { MacroSummary } from "@/components/MacroSummary";
import { Screen } from "@/components/Screen";
import { usePlate } from "@/context/PlateContext";
import { useTodayMenu } from "@/hooks/useTodayMenu";
import { findMenuItem } from "@/services/menuService";
import { theme } from "@/theme/tokens";

export default function FoodDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const now = useMemo(() => new Date(), []);
  const menuQuery = useTodayMenu(now);
  const { addItem } = usePlate();
  const item = menuQuery.data ? findMenuItem(menuQuery.data.menu, id) : null;

  if (!item) return <Screen title="Food details"><Text style={styles.body}>{menuQuery.isLoading ? "Loading food details…" : "This food is no longer in the current menu."}</Text></Screen>;

  return (
    <Screen title={item.name} subtitle={`${item.stationName} · ${item.serving?.description ?? "Serving unavailable"}`}>
      {item.nutrition ? <View style={styles.nutrition}><Text style={styles.sectionTitle}>Per source serving</Text><MacroSummary totals={item.nutrition} /></View> : <View style={styles.warning}><Text style={styles.warningTitle}>Nutrition unavailable</Text><Text style={styles.body}>This item cannot be used in calculated plates.</Text></View>}
      {item.nutrition && item.serving ? <Pressable accessibilityRole="button" onPress={() => addItem(item)} style={({ pressed }) => [styles.add, pressed && styles.addPressed]}><Ionicons name="add-circle-outline" size={20} color={theme.color.white} /><Text style={styles.addLabel}>Add one serving</Text></Pressable> : null}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <Text style={styles.body}>{item.ingredients?.join(", ") ?? "Not supplied by the source."}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Source labels</Text>
        <Text style={styles.body}>{item.dietaryLabels.length ? item.dietaryLabels.join(" · ") : "No dietary labels supplied."}</Text>
        <Text style={styles.body}>{item.allergenLabels.length ? `Listed allergens: ${item.allergenLabels.join(", ")}` : "No allergen labels supplied."}</Text>
      </View>
      <View style={styles.warning}>
        <Text style={styles.warningTitle}>Ask dining staff about allergies</Text>
        <Text style={styles.body}>Source labels may not reflect substitutions, preparation changes, or cross-contact. Absence of a label does not mean a food is allergen-free.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  nutrition: { backgroundColor: theme.color.surface, borderRadius: theme.radius.lg, padding: theme.space.lg, gap: theme.space.lg },
  section: { gap: theme.space.sm },
  sectionTitle: { ...theme.type.section, color: theme.color.ink },
  body: { ...theme.type.body, color: theme.color.muted },
  add: { minHeight: 52, flexDirection: "row", gap: theme.space.sm, alignItems: "center", justifyContent: "center", borderRadius: theme.radius.md, backgroundColor: theme.color.primary },
  addPressed: { backgroundColor: theme.color.primaryPressed },
  addLabel: { ...theme.type.body, color: theme.color.white, fontWeight: "700" },
  warning: { borderRadius: theme.radius.lg, backgroundColor: theme.color.warningSoft, padding: theme.space.lg, gap: theme.space.sm },
  warningTitle: { ...theme.type.label, color: theme.color.warning },
});
