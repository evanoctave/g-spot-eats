import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { GoalSelector } from "@/components/GoalSelector";
import { Screen } from "@/components/Screen";
import { usePreferences } from "@/hooks/usePreferences";
import { theme } from "@/theme/tokens";
import type { DietMode } from "@/types/dining";

type GoalFields = { calories: string; protein: string; carbs: string; fat: string };

export default function SettingsRoute() {
  const { preferences, save } = usePreferences();
  const [mode, setMode] = useState<DietMode>(preferences.defaultDietMode);
  const [fields, setFields] = useState<GoalFields>({
    calories: String(preferences.goals.calories),
    protein: String(preferences.goals.proteinGrams),
    carbs: String(preferences.goals.carbohydratesGrams),
    fat: String(preferences.goals.fatGrams),
  });

  /* The persisted query is an external store; refresh the editable draft when it hydrates. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMode(preferences.defaultDietMode);
    setFields({ calories: String(preferences.goals.calories), protein: String(preferences.goals.proteinGrams), carbs: String(preferences.goals.carbohydratesGrams), fat: String(preferences.goals.fatGrams) });
  }, [preferences]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const updateField = (key: keyof GoalFields, value: string) => setFields((current) => ({ ...current, [key]: value.replace(/[^0-9]/g, "") }));
  const saveSettings = () => {
    const numbers = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, Number(value)])) as Record<keyof GoalFields, number>;
    if (Object.values(numbers).some((value) => !Number.isFinite(value) || value <= 0)) {
      Alert.alert("Check your goals", "Every daily target must be a positive number.");
      return;
    }
    save.mutate({ defaultDietMode: mode, goals: { calories: numbers.calories, proteinGrams: numbers.protein, carbohydratesGrams: numbers.carbs, fatGrams: numbers.fat } }, {
      onSuccess: () => Alert.alert("Settings saved", "Your defaults are stored on this device."),
    });
  };

  const input = (label: string, key: keyof GoalFields, unit: string) => (
    <View style={styles.field} key={key}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput accessibilityLabel={`${label} daily goal`} value={fields[key]} onChangeText={(value) => updateField(key, value)} keyboardType="number-pad" selectTextOnFocus style={styles.input} />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <Screen title="Settings" subtitle="Independent, local-first nutrition planning">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default plate direction</Text>
        <GoalSelector value={mode} onChange={setMode} />
      </View>
      <View style={styles.section}>
        <View style={styles.sectionCopy}>
          <Text style={styles.sectionTitle}>Daily goals</Text>
          <Text style={styles.body}>Use personal planning targets—not medical recommendations.</Text>
        </View>
        <View style={styles.grid}>
          {input("Calories", "calories", "cal")}
          {input("Protein", "protein", "g")}
          {input("Carbohydrates", "carbs", "g")}
          {input("Fat", "fat", "g")}
        </View>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: save.isPending }} disabled={save.isPending} onPress={saveSettings} style={({ pressed }) => [styles.save, pressed && styles.savePressed]}>
          <Text style={styles.saveLabel}>{save.isPending ? "Saving…" : "Save settings"}</Text>
        </Pressable>
      </View>
      <View style={styles.status}>
        <Text style={styles.statusTitle}>Sample data mode</Text>
        <Text style={styles.body}>Live collection is intentionally disabled until written permission and an approved source contract are configured. Current sample foods are clearly labeled throughout the app.</Text>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL("https://dineoncampus.com/csuf/whats-on-the-menu")} style={styles.linkButton}>
          <Text style={styles.link}>Open the official menu</Text>
        </Pressable>
      </View>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>About GSpot Eats</Text>
        <Text style={styles.body}>GSpot Eats is an independent application. It is not affiliated with or endorsed by California State University, Fullerton, Chartwells, Compass Group, or Dine On Campus.</Text>
        <Text style={styles.body}>Nutrition, ingredients, and labels can change. Ask dining staff about allergies or medical dietary needs.</Text>
        <Text style={styles.version}>Version 0.1.0</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: theme.space.lg },
  sectionCopy: { gap: theme.space.sm },
  sectionTitle: { ...theme.type.section, color: theme.color.ink },
  body: { ...theme.type.body, color: theme.color.muted },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: theme.space.md },
  field: { width: "47%", gap: theme.space.sm },
  fieldLabel: { ...theme.type.label, color: theme.color.ink },
  inputRow: { minHeight: 52, flexDirection: "row", alignItems: "center", borderRadius: theme.radius.md, backgroundColor: theme.color.surface, paddingHorizontal: theme.space.md },
  input: { flex: 1, minHeight: 52, ...theme.type.body, color: theme.color.ink },
  unit: { ...theme.type.meta, color: theme.color.muted },
  save: { minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: theme.radius.md, backgroundColor: theme.color.primary },
  savePressed: { backgroundColor: theme.color.primaryPressed },
  saveLabel: { ...theme.type.body, color: theme.color.white, fontWeight: "700" },
  status: { borderRadius: theme.radius.lg, padding: theme.space.lg, gap: theme.space.sm, backgroundColor: theme.color.warningSoft },
  statusTitle: { ...theme.type.section, color: theme.color.warning },
  linkButton: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  link: { ...theme.type.label, color: theme.color.primary, textDecorationLine: "underline" },
  version: { ...theme.type.meta, color: theme.color.muted },
});
