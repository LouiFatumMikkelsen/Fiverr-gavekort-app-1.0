import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "#fff", paddingBottom: 5 },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#A0A0A0",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Mine Kort",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="credit-card" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tilbud"
        options={{
          title: "Tilbud",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="local-offer" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="indstillinger"
        options={{
          title: "Indstillinger",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
