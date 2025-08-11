import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

export default function RootLayout() {
  return (
  <GestureHandlerRootView style={styles.container}>
    <Stack>
      <Stack.Screen name="index" options={{headerShown: false}}/>
    </Stack>
  </GestureHandlerRootView>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // make sure it fills the screen
  },
});
