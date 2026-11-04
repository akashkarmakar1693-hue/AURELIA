// Resolves once the document's fonts have settled — so an entrance animation
// can wait instead of revealing text mid font-swap. Capped by a short timeout
// so a stalled font request can never hold the opening hostage. On repeat
// visits the promise resolves immediately from cache.
// Used only by load-time entrance choreography (Navbar, Home opening).
export function whenFontsReady(timeoutMs = 600) {
  if (typeof document === "undefined" || !document.fonts || !document.fonts.ready) {
    return Promise.resolve();
  }
  return Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}
