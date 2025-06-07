// Use a global variable to ensure the cache persists across requests
declare global {
  var verificationCache: Map<string, { code: string; expiresAt: number }>;
}

// Initialize the cache if it doesn't exist
if (!global.verificationCache) {
  global.verificationCache = new Map<string, { code: string; expiresAt: number }>();
}

// Export the global cache
export const verificationCache = global.verificationCache;

// Clean up expired codes periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of verificationCache.entries()) {
    if (value.expiresAt < now) {
      verificationCache.delete(key);
    }
  }
}, 60000); // Clean up every minutes 