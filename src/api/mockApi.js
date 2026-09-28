/**
 * Mock backend. Simulates network latency and (optionally) random failures
 * so loading states, error handling and retry logic can be demonstrated.
 */
const LATENCY = 1000;

export function saveDraftMock(data, { failRate = 0 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!data.content || !data.content.trim()) {
        reject({ error: "Invalid data" });
      } else if (Math.random() < failRate) {
        reject({ error: "Network error (simulated)" });
      } else {
        resolve({ success: true, draft: data });
      }
    }, LATENCY);
  });
}

export function deleteDraftMock(id, { failRate = 0 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failRate) reject({ error: "Network error (simulated)" });
      else resolve({ success: true, id });
    }, 500);
  });
}

/**
 * Retry wrapper: re-runs `fn` up to `retries` times, waiting `delay` ms
 * (doubling each time — exponential back-off) between attempts.
 */
export async function retry(fn, { retries = 3, delay = 500, onRetry } = {}) {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      onRetry?.(retries);
      await new Promise((r) => setTimeout(r, delay));
      return retry(fn, { retries: retries - 1, delay: delay * 2, onRetry });
    }
    throw new Error("Failed after retries");
  }
}
