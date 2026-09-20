"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "@/contexts/StoreContext";
import Toast from "@/components/Toast";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StoreProvider>
        {children}
        <Toast />
      </StoreProvider>
    </AuthProvider>
  );
}
