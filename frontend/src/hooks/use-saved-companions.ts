"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "./use-auth";

export function useSavedCompanions() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Query saved companions
  const { data: savedIdsSet = new Set<string>(), isLoading } = useQuery({
    queryKey: ["savedCompanions"],
    queryFn: async () => {
      const res = await apiFetch<{ success: boolean; data: { companions: { id: string }[] } }>("/api/users/me/saved");
      if (res.success && res.data?.companions) {
        return new Set(res.data.companions.map((c) => c.id));
      }
      return new Set<string>();
    },
    enabled: isAuthenticated,
  });

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ companionId, isCurrentlySaved }: { companionId: string, isCurrentlySaved: boolean }) => {
      if (isCurrentlySaved) {
        await apiFetch(`/api/users/me/saved/${companionId}`, { method: "DELETE" });
      } else {
        await apiFetch(`/api/users/me/saved/${companionId}`, { method: "POST" });
      }
      return { companionId, isCurrentlySaved };
    },
    onMutate: async ({ companionId, isCurrentlySaved }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["savedCompanions"] });

      // Snapshot the previous value
      const previousSaved = queryClient.getQueryData<Set<string>>(["savedCompanions"]);

      // Optimistically update to the new value
      queryClient.setQueryData<Set<string>>(["savedCompanions"], (old) => {
        const next = new Set<string>(old || new Set<string>());
        if (isCurrentlySaved) next.delete(companionId);
        else next.add(companionId);
        return next;
      });

      // Return a context object with the snapshotted value
      return { previousSaved };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSaved) {
        queryClient.setQueryData(["savedCompanions"], context.previousSaved);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync
      queryClient.invalidateQueries({ queryKey: ["savedCompanions"] });
    },
  });

  const toggleSaved = (companionId: string) => {
    if (!isAuthenticated) return;
    const isCurrentlySaved = savedIdsSet.has(companionId);
    toggleMutation.mutate({ companionId, isCurrentlySaved });
  };

  return {
    savedIds: savedIdsSet,
    isLoading,
    toggleSaved,
    isSaved: (id: string) => savedIdsSet.has(id),
  };
}
