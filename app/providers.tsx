"use client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

import type * as React from "react";

const queryClient = new QueryClient();
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <WebSocketProvider>{children}</WebSocketProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}
