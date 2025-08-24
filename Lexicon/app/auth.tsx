import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import {Button, Text, TextInput} from "react-native-paper";
import { useState } from "react";


export default function Auth() {
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    
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
          <Button mode="contained" onPress={() => {}} style={{ padding: 8 }}>
            Submit
          </Button>
          <Button
            mode="text"
            onPress={() => {}}
          >
            Already have an account? Sign In
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
