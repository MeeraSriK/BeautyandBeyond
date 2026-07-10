import { createFileRoute } from "@tanstack/react-router";
import { getValidatedSydneyNow } from "@/lib/chat-handler.server";

export const Route = createFileRoute("/api/public/debug/clock")({
  server: {
    handlers: {
      GET: async () => {
        const sydney = getValidatedSydneyNow();
        return new Response(JSON.stringify(sydney, null, 2), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
