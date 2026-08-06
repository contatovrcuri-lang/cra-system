"use client";

import { useQuery } from "@tanstack/react-query";

type CurrentUser = {
  id: string;
  username: string;
  name: string;
  role: "ADMIN" | "COLABORADOR";
  avatarColor: string;
};

export function useCurrentUser() {
  const { data, isLoading } = useQuery<{ user: CurrentUser | null }>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return { user: null };
      return res.json();
    },
    staleTime: 60_000,
  });

  return { user: data?.user ?? null, isLoading };
}
