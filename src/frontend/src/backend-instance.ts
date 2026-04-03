import type { backendInterface } from "./backend";
/**
 * backend-instance.ts
 * Lazy singleton backend accessor for use outside React components.
 * Inside React components, prefer useActor() from hooks/useActor.ts.
 */
import { createActorWithConfig } from "./config";

let _instance: backendInterface | null = null;
let _promise: Promise<backendInterface> | null = null;

export function getBackend(): Promise<backendInterface> {
  if (_instance) return Promise.resolve(_instance);
  if (_promise) return _promise;
  _promise = createActorWithConfig().then((b) => {
    _instance = b;
    return b;
  });
  return _promise;
}
