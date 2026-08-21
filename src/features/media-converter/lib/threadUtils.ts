/**
 * Extended Navigator interface for the Device Memory API.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory
 *
 * `deviceMemory` is only available in Chromium-based browsers (Chrome, Edge, Opera).
 * Firefox and Safari do not support it — in those cases we fall back to a conservative default.
 */
interface NavigatorWithDeviceMemory extends Navigator {
    readonly deviceMemory?: number;
}

/**
 * Chrome-only `performance.memory` API that exposes JS heap usage.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory
 */
interface PerformanceWithMemory extends Performance {
    readonly memory?: {
        /** The maximum size the JS heap can grow to (bytes). */
        readonly jsHeapSizeLimit: number;
        /** Total allocated JS heap size (bytes). */
        readonly totalJSHeapSize: number;
        /** Currently active/used JS heap size (bytes). */
        readonly usedJSHeapSize: number;
    };
}

/** The maximum number of threads libx264 can safely use in WebAssembly without exhausting the heap. */
const WASM_SAFE_MAX_THREADS = 4;

/** Approximate per-thread overhead for libx264 frame buffers inside the WASM heap (in MB). */
const PER_THREAD_OVERHEAD_MB = 80;

/**
 * Estimates the available memory budget (in MB) for FFmpeg encoding threads.
 *
 * Priority order:
 * 1. `performance.memory` (Chromium) — gives actual real-time heap usage, so we can calculate
 *    how much headroom remains. This is the closest thing to "free RAM" available in browsers.
 * 2. `navigator.deviceMemory` (Chromium) — gives total device RAM (not free, but better than nothing).
 * 3. Fallback to a conservative 4 GB assumption.
 */
function estimateAvailableMemoryMB(): number {
    // Try performance.memory first — this gives us *actual* real-time heap availability
    if (typeof performance !== "undefined") {
        const perf = performance as PerformanceWithMemory;
        if (perf.memory) {
            const heapLimitMB = perf.memory.jsHeapSizeLimit / (1024 * 1024);
            const heapUsedMB = perf.memory.usedJSHeapSize / (1024 * 1024);
            return heapLimitMB - heapUsedMB;
        }
    }

    // Fall back to navigator.deviceMemory (total RAM, not free — but still useful)
    if (typeof navigator !== "undefined") {
        const nav = navigator as NavigatorWithDeviceMemory;
        if (nav.deviceMemory !== undefined) {
            // Assume ~60% of total RAM is available (OS + other tabs use the rest)
            return nav.deviceMemory * 1024 * 0.6;
        }
    }

    // Conservative fallback: assume 4 GB total, ~60% available
    return 4 * 1024 * 0.6;
}

/**
 * Calculates the optimal number of FFmpeg encoding threads based on the
 * current device's hardware capabilities and the size of the input file.
 *
 * Browsers do not expose "free CPU cores" or "free system RAM" directly.
 * We use `performance.memory` (real-time heap usage) when available, and
 * fall back to `navigator.deviceMemory` (total RAM) otherwise.
 *
 * Strategy:
 * 1. Start with half the logical CPU cores (hyperthreading siblings share execution units).
 * 2. Estimate available memory and subtract the file's footprint (input + output headroom).
 * 3. Divide remaining memory by per-thread overhead to find the memory-safe thread ceiling.
 * 4. Apply a hard safety cap to prevent libx264 WASM deadlocks.
 */
export function getOptimalThreadCount(fileSizeBytes: number): number {
    if (typeof navigator === "undefined") return 1;

    // ── Step 1: CPU-based baseline ──────────────────────────────────────
    const cores = navigator.hardwareConcurrency ?? 2;
    // Use half the logical cores (hyperthreaded pairs share execution units)
    let threads = Math.max(1, Math.floor(cores / 2));

    // ── Step 2: Memory-based ceiling ────────────────────────────────────
    const availableMB = estimateAvailableMemoryMB();
    const fileSizeMB = fileSizeBytes / (1024 * 1024);

    // Reserve space for input file in MEMFS + output file + FFmpeg internal overhead
    const reservedMB = fileSizeMB * 2 + 50; // 2x file size + 50 MB FFmpeg overhead
    const budgetForThreadsMB = Math.max(0, availableMB - reservedMB);
    const memoryBasedMax = Math.max(1, Math.floor(budgetForThreadsMB / PER_THREAD_OVERHEAD_MB));

    threads = Math.min(threads, memoryBasedMax);

    // ── Step 3: Hard safety cap ─────────────────────────────────────────
    // libx264 in WASM rarely scales beyond 4 threads and risks deadlock above that.
    threads = Math.min(threads, WASM_SAFE_MAX_THREADS);

    return Math.max(1, threads);
}
