import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { FoodCard } from "@/components/FoodCard";
import { MealPeriodSelector } from "@/components/MealPeriodSelector";
import { Screen } from "@/components/Screen";
import { usePlate } from "@/context/PlateContext";
import { useTodayMenu } from "@/hooks/useTodayMenu";
import { theme } from "@/theme/tokens";
import type { MealPeriodId } from "@/types/dining";
import { activeMealPeriod, formatCampusDate } from "@/utils/dates";

export default function MenuRoute() {
  const now = useMemo(() => new Date(), []);
  const [selectedPeriod, setSelectedPeriod] = useState<MealPeriodId>(activeMealPeriod(now));
  const menuQuery = useTodayMenu(now);
  const { addItem } = usePlate();

  if (!menuQuery.data) {
    return <Screen title="Menu" subtitle={formatCampusDate(now)}><Text style={styles.message}>{menuQuery.isError ? "The current menu could not be loaded." : "Loading today’s menu…"}</Text></Screen>;
  }

  const { menu } = menuQuery.data;
  const period = menu.periods.find((candidate) => candidate.id === selectedPeriod) ?? menu.periods[0];
  return (
    <Screen title="Today’s menu" subtitle={`${menu.locationName} · ${formatCampusDate(now)}`}>
      <MealPeriodSelector periods={menu.periods} value={period.id} onChange={setSelectedPeriod} />
      <Text style={styles.hours}>{period.startsAt}–{period.endsAt} · {period.stations.reduce((count, station) => count + station.items.length, 0)} listed foods</Text>
      {period.stations.map((station) => (
        <View key={station.id} style={styles.station}>
          <View style={styles.stationHeading}>
            <Text style={styles.stationName}>{station.name}</Text>
            <Text style={styles.stationCount}>{station.items.length} items</Text>
          </View>
          {station.items.map((item) => <FoodCard key={item.id} item={item} onAdd={addItem} />)}
        </View>
      ))}
      <Text style={styles.source}>Source: {menu.sourceName}. Items shown here are sample data until approved live access is configured.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  message: { ...theme.type.body, color: theme.color.muted },
  hours: { ...theme.type.label, color: theme.color.muted, marginTop: -theme.space.md },
  station: { gap: 0 },
  stationHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingBottom: theme.space.sm },
  stationName: { ...theme.type.section, color: theme.color.ink },
  stationCount: { ...theme.type.meta, color: theme.color.muted },
  source: { ...theme.type.meta, color: theme.color.muted },
});
