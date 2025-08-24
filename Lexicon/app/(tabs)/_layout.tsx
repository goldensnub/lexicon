import { Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{headerShown: false, title: "Home"}}/>
      <Tabs.Screen name="profile" options={{headerShown: false, title: "Profile"}}/>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  
});
