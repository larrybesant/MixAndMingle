"use client";
import { ToastContextProvider } from "./toast-context";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ToastContextProvider>{children}</ToastContextProvider>;
}
