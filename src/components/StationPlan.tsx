import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "@/theme/tokens";
import type { PlateRecommendation } from "@/types/dining";
import { MacroSummary } from "./MacroSummary";

export function StationPlan({ recommendation, onUse }: { recommendation: PlateRecommendation; onUse: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>A feasible plate</Text>
          <Text style={styles.explanation}>{recommendation.explanation}</Text>
        </View>
        <View style={styles.stationBadge}>
          <Text style={styles.stationCount}>{new Set(recommendation.items.map(({ item }) => item.stationId)).size}</Text>
          <Text style={styles.stationLabel}>stops</Text>
        </View>
      </View>
      <MacroSummary totals={recommendation.totals} />
      <View>
        {recommendation.items.map((choice, index) => (
          <View key={choice.item.id} style={styles.step}>
            <View style={styles.stepMarker}><Text style={styles.stepNumber}>{index + 1}</Text></View>
            <View style={styles.stepCopy}>
              <Text style={styles.action}>{choice.action === "take" ? "Take" : "Add"} at {choice.item.stationName}</Text>
              <Text style={styles.itemName}>{choice.item.name}</Text>
              <Text style={styles.reason}>{choice.reasons[1] ?? choice.reasons[0]}</Text>
            </View>
          </View>
        ))}
      </View>
      <Pressable accessibilityRole="button" onPress={onUse} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
        <Ionicons name="add-circle-outline" size={20} color={theme.color.white} />
        <Text style={styles.buttonLabel}>Use this plate</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.color.surface, borderRadius: theme.radius.lg, padding: theme.space.lg, gap: theme.space.xl },
  headingRow: { flexDirection: "row", alignItems: "flex-start", gap: theme.space.md },
  headingCopy: { flex: 1, gap: theme.space.xs },
  title: { ...theme.type.section, color: theme.color.ink },
  explanation: { ...theme.type.meta, color: theme.color.muted },
  stationBadge: { minWidth: 50, alignItems: "center", paddingVertical: theme.space.sm, borderRadius: theme.radius.md, backgroundColor: theme.color.confirmationSoft },
  stationCount: { fontSize: 20, lineHeight: 23, fontWeight: "700", color: theme.color.confirmation },
  stationLabel: { ...theme.type.meta, color: theme.color.confirmation },
  step: { flexDirection: "row", gap: theme.space.md, paddingVertical: theme.space.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.color.divider },
  stepMarker: { width: 28, height: 28, borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: theme.color.primarySoft },
  stepNumber: { ...theme.type.label, color: theme.color.primary },
  stepCopy: { flex: 1, gap: 2 },
  action: { ...theme.type.meta, color: theme.color.primary, fontWeight: "700" },
  itemName: { ...theme.type.body, color: theme.color.ink, fontWeight: "700" },
  reason: { ...theme.type.meta, color: theme.color.muted },
  button: { minHeight: 52, flexDirection: "row", gap: theme.space.sm, alignItems: "center", justifyContent: "center", borderRadius: theme.radius.md, backgroundColor: theme.color.primary },
  buttonPressed: { backgroundColor: theme.color.primaryPressed },
  buttonLabel: { ...theme.type.body, color: theme.color.white, fontWeight: "700" },
});
