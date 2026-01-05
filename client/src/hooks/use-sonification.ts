import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type AnalyzeInput, type AnalyzeResponse } from "@shared/routes";

// Analyze Image Mutation
export function useAnalyzeImage() {
  return useMutation({
    mutationFn: async (data: AnalyzeInput) => {
      const res = await fetch(api.analyze.path, {
        method: api.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Analysis failed");
      }

      const json = await res.json();
      return api.analyze.responses[200].parse(json);
    },
  });
}

// List Generations Query
export function useGenerations() {
  return useQuery({
    queryKey: [api.generations.list.path],
    queryFn: async () => {
      const res = await fetch(api.generations.list.path);
      if (!res.ok) throw new Error("Failed to fetch generations");
      return api.generations.list.responses[200].parse(await res.json());
    },
  });
}

// Create Generation Mutation
export function useCreateGeneration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.generations.create.path, {
        method: api.generations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save generation");
      return api.generations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.generations.list.path] });
    },
  });
}
