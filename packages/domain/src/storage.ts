import { createInitialDemoState, initialDemoState } from "./demo.ts";
import type { DemoState } from "./types.ts";

const COOKIE = "lunchbox_demo_state";

function encodeState(state: DemoState): string {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `v2.${btoa(binary).replaceAll("+","-").replaceAll("/","_").replaceAll("=","")}`;
}

function decodeState(raw: string): DemoState {
  if (!raw.startsWith("v2.")) return JSON.parse(decodeURIComponent(raw)) as DemoState;
  const encoded = raw.slice(3).replaceAll("-","+").replaceAll("_","/");
  const binary = atob(encoded + "=".repeat((4-encoded.length%4)%4));
  const bytes = Uint8Array.from(binary,(character)=>character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as DemoState;
}

export function readDemoState(): DemoState {
  if (typeof document === "undefined") return initialDemoState;
  const raw = document.cookie.split("; ").find((part)=>part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length+1);
  if (!raw) return initialDemoState;
  try {
    const parsed = decodeState(raw);
    if (!parsed.profile || !parsed.lunchbox) return initialDemoState;
    return {...parsed,rewards:parsed.rewards??[],activities:parsed.activities??[]};
  } catch { return initialDemoState; }
}

export function writeDemoState(state: DemoState): void {
  if (typeof document === "undefined") return;
  const compact = {...state,activities:state.activities.slice(0,3)};
  document.cookie = `${COOKIE}=${encodeState(compact)}; path=/; max-age=2592000; SameSite=Lax`;
  window.dispatchEvent(new Event("lunchbox-state"));
}

export function resetDemoState(): DemoState {
  const fresh=createInitialDemoState();
  writeDemoState(fresh);
  return fresh;
}
