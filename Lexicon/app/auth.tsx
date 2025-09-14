import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import {Button, Text, TextInput, useTheme} from "react-native-paper";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";


export default function Auth() {
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const theme = useTheme();
    const router = useRouter();

    const {signIn, signUp} = useAuth();
    
    const handleSwitchMode = () => {
        setIsSignUp((prev) => !prev);
    };

    const handleSubmit = async () => {
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }
        setError(null);

        if (isSignUp) {
            const signUpError = await signUp(email, password);
            if (signUpError) {
                setError(signUpError);
                return;
            }
        } else {
            const signInError = await signIn(email, password);
            if (signInError) {
                setError(signInError);
                return;
            }
        }

        router.replace("/");
    }
    
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text
            variant="headlineMedium"
            style={{ marginBottom: 20, textAlign: "center" }}>
             {isSignUp ? "Create an account" : "Welcome back!"}
          </Text>
          <TextInput
            label="Email"
            mode="outlined"
            style={{ marginBottom: 10 }}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="example@gmail.com"
            onChangeText={setEmail}
          />
          <TextInput
            label="Password"
            mode="outlined"
            style={{ marginBottom: 20 }}
            secureTextEntry
            onChangeText={setPassword}
          />

            {error && (
                <Text style={{ color: theme.colors.error, marginBottom: 5 }}>{error}</Text>
            )}

          <Button mode="contained" onPress={handleSubmit} style={{ padding: 8 }}>
            Submit
          </Button>
          <Button
            mode="text"
            onPress={handleSwitchMode}
          >
            {isSignUp? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </Button>
        </View>
      </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
    }  
});
