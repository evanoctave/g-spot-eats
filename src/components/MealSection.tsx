import { StyleSheet, Text, View } from "react-native";

import { MacroSummary } from "./MacroSummary";
import { theme } from "@/theme/tokens";
import type { DiaryEntry } from "@/types/dining";
import { formatCampusTime } from "@/utils/dates";

export function MealSection({ entry }: { entry: DiaryEntry }) {
  return (
    <View style={styles.group}>
      <View style={styles.heading}>
        <View>
          <Text style={styles.period}>{entry.mealPeriod[0].toUpperCase() + entry.mealPeriod.slice(1)}</Text>
          <Text style={styles.time}>Logged {formatCampusTime(entry.loggedAt)}</Text>
        </View>
        <Text style={styles.calories}>{Math.round(entry.totals.calories)} cal</Text>
      </View>
      {entry.items.map((item) => (
        <View key={`${entry.id}-${item.sourceItemId}`} style={styles.item}>
          <View style={styles.itemCopy}>
            <Text style={styles.itemName}>{item.itemName}</Text>
            <Text style={styles.itemMeta}>{item.servings} × {item.servingDescription} · {item.stationName}</Text>
          </View>
        </View>
      ))}
      <MacroSummary totals={entry.totals} compact />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { backgroundColor: theme.color.surface, borderRadius: theme.radius.lg, padding: theme.space.lg, gap: theme.space.md },
  heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  period: { ...theme.type.section, color: theme.color.ink },
  time: { ...theme.type.meta, color: theme.color.muted },
  calories: { ...theme.type.label, color: theme.color.confirmation },
  item: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.color.divider, paddingTop: theme.space.md },
  itemCopy: { gap: 2 },
  itemName: { ...theme.type.label, color: theme.color.ink },
  itemMeta: { ...theme.type.meta, color: theme.color.muted },
});
