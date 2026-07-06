import { createContext, PropsWithChildren, useMemo, useState } from "react";
import { use } from "react";

type MockAuthContextValue = {
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
};

const MockAuthContext = createContext<MockAuthContextValue | null>(null);

export function MockAuthProvider({ children }: PropsWithChildren) {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const value = useMemo<MockAuthContextValue>(
    () => ({
      isSignedIn,
      signIn: () => setIsSignedIn(true),
      signOut: () => setIsSignedIn(false),
    }),
    [isSignedIn],
  );

  return <MockAuthContext value={value}>{children}</MockAuthContext>;
}

export function useMockAuth() {
  const context = use(MockAuthContext);

  if (!context) {
    throw new Error("useMockAuth deve essere usato dentro MockAuthProvider");
  }

  return context;
}
