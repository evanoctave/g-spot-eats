import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View, type ScrollViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "@/theme/tokens";

export function Screen({
  title,
  subtitle,
  children,
  right,
  ...scrollProps
}: PropsWithChildren<{ title: string; subtitle?: string; right?: ReactNode } & ScrollViewProps>) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...scrollProps}
      >
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <Text style={styles.title} accessibilityRole="header">{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {right}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.color.canvas },
  scroll: { flex: 1 },
  content: { width: "100%", maxWidth: 760, alignSelf: "center", paddingHorizontal: theme.space.xl, paddingTop: theme.space.md, paddingBottom: 120, gap: theme.space.xxl },
  headingRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: theme.space.md },
  headingCopy: { flex: 1, gap: theme.space.xs },
  title: { ...theme.type.title, color: theme.color.ink, letterSpacing: -0.5 },
  subtitle: { ...theme.type.body, color: theme.color.muted },
});
