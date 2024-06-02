"use client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import type * as React from "react";

const queryClient = new QueryClient();
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
