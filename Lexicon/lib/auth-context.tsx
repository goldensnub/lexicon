import { createContext, useContext } from "react";
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

interface AuthContextType {
    //user: Models.User<Models.Preferences> | null;
    signIn: (email: string, password: string) => Promise<string | null>;
    signUp: (email: string, password: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
    
    const signUp = async (email: string, password: string) => {
        try {
            await account.create({
                userId: ID.unique(),
                email,
                password,
            });
            await signIn(email, password);
            return null;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return "An unknown error occurred.";
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            await account.createEmailPasswordSession({
                email,
                password,
            });
            return null;
        } catch (error) {
            if (error instanceof Error) {
                return error.message;
            }
            return "An unknown error occurred.";
        }
    };

    
    return (
    <AuthContext.Provider value={{signUp, signIn}}>
        {children}
    </AuthContext.Provider>
    );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be inside of the AuthProvider");
  }

  return context;
}