import { createServerFn } from "@tanstack/react-start";

const SOPHIA_AGENT_ID = "c6a701d2-151b-40d4-99fe-b8be78843ca4";

export const getSophiaVoiceToken = createServerFn({ method: "POST" }).handler(
  async () => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("Voice assistant is not configured (missing API key).");
    }

    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${SOPHIA_AGENT_ID}`,
      { headers: { "xi-api-key": apiKey } },
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(
        `ElevenLabs token request failed [${res.status}]: ${body}`,
      );
      throw new Error(
        res.status === 401
          ? "Voice assistant credentials are invalid."
          : "Couldn't reach the voice assistant right now.",
      );
    }

    const data = (await res.json()) as { token?: string };
    if (!data.token) {
      throw new Error("Voice assistant didn't return a session token.");
    }
    return { token: data.token };
  },
);
