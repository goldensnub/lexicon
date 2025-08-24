import { Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#080808ff",
        tabBarInactiveTintColor: "#808080ff",

        tabBarIconStyle: {
          width: 28,
          height: 28,
          marginTop: 2,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4,
        },

        tabBarStyle: {
          height: 80,
          paddingTop: 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="feather" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="book" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  
});
