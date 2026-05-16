"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (role !== null && role !== "ADMIN") {
      router.replace("/");
    }
  }, [role, router]);

  if (role !== "ADMIN") return null;
  return <>{children}</>;
}
