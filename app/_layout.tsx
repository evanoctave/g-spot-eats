import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { PlateProvider } from "@/context/PlateContext";
import { queryClient } from "@/lib/queryClient";
import { theme } from "@/theme/tokens";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PlateProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ contentStyle: { backgroundColor: theme.color.canvas } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="food/[id]" options={{ title: "Food details", headerBackTitle: "Menu", headerTintColor: theme.color.primary, headerStyle: { backgroundColor: theme.color.canvas }, headerShadowVisible: false }} />
            <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
            <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
          </Stack>
        </PlateProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
