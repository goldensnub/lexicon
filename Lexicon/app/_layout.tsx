import { router, useRouter, Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import  { useEffect } from "react";
import Auth from "./auth";
import { AuthProvider } from "@/lib/auth-context";

function RouteGuard({children}: {children: React.ReactNode}) {
  useEffect(() => {
    const userIsAuthenticated = true; // Replace with real auth check -- App wont start if set to true initially
    const router = useRouter();

    if (!userIsAuthenticated) {
      router.replace("/auth");
    } else {
      //router.replace("/(tabs)"); //Uncomment once all is done
    }
      
  }, []);
  return <>{children}</>;
}


export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard>
        <GestureHandlerRootView style={styles.container}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
          </Stack>
        </GestureHandlerRootView>
      </RouteGuard>
    </AuthProvider>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
