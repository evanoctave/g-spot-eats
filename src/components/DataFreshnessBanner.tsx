import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "@/theme/tokens";
import type { MenuFreshness } from "@/types/dining";
import { formatCampusTime } from "@/utils/dates";

export function DataFreshnessBanner({ freshness, isDemo }: { freshness: MenuFreshness; isDemo: boolean }) {
  const stale = freshness.freshness === "stale";
  const title = isDemo ? "Sample menu" : stale ? "Cached menu" : "Menu updated";
  const detail = isDemo
    ? "Explore the full app flow while live source approval is pending."
    : `${stale ? "Last successful update" : "Retrieved"} at ${formatCampusTime(freshness.sourceFetchedAt)}.`;
  return (
    <View style={[styles.banner, stale && styles.warning]} accessibilityRole="summary">
      <Ionicons name={isDemo ? "flask-outline" : stale ? "time-outline" : "checkmark-circle-outline"} size={21} color={stale ? theme.color.warning : theme.color.confirmation} />
      <View style={styles.copy}>
        <Text style={[styles.title, stale && styles.warningText]}>{title}</Text>
        <Text style={[styles.detail, stale && styles.warningText]}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: "row", alignItems: "flex-start", gap: theme.space.md, padding: theme.space.lg, borderRadius: theme.radius.md, backgroundColor: theme.color.confirmationSoft },
  warning: { backgroundColor: theme.color.warningSoft },
  copy: { flex: 1, gap: 2 },
  title: { ...theme.type.label, color: theme.color.confirmation },
  detail: { ...theme.type.meta, color: theme.color.ink },
  warningText: { color: theme.color.warning },
});
