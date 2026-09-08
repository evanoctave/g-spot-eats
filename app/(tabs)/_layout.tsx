import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "@/theme/tokens";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.color.primary,
      tabBarInactiveTintColor: theme.color.muted,
      tabBarStyle: { backgroundColor: theme.color.surface, borderTopColor: theme.color.divider, height: 84, paddingTop: 8 },
      tabBarLabelStyle: { fontSize: 12, fontWeight: "600", paddingBottom: 8 },
    }}>
      <Tabs.Screen name="index" options={{ title: "Today", tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="progress" options={{ title: "Menu", tabBarIcon: ({ color, size }) => <Ionicons name="restaurant-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="diary" options={{ title: "Diary", tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Settings", tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}
