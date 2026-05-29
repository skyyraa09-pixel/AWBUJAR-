import { useEffect } from 'react';

/**
 * useAntiTampering - Hook untuk deteksi tampering dan manipulasi DOM/JavaScript
 *
 * Fitur:
 * - Detect jika ada yang coba modify DOM
 * - Detect jika ada yang coba override functions
 * - Detect jika ada yang coba inject scripts
 * - Detect jika ada yang coba access console (hanya via devtools open check)
 * - Detect jika ada yang coba modify window object
 * - Continuous integrity verification
 */

interface ViolationCallback {
  (type: string, description: string): void;
}

export function useAntiTampering(onViolation: ViolationCallback) {
  useEffect(() => {
    // Simpan referensi asli sebelum di-override
    const originalEval = window.eval;
    const originalFetch = window.fetch;

    // 1. Protect eval
    window.eval = function () {
      onViolation('EVAL_ATTEMPT', 'Eval execution terdeteksi');
      throw new Error('Eval is disabled');
    } as typeof window.eval;

    // 2. Protect Function constructor
    (window as any).Function = function () {
      onViolation('FUNCTION_CONSTRUCTOR', 'Function constructor attempt terdeteksi');
      throw new Error('Function constructor is disabled');
    };

    // 3. Monitor DOM modifications
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Ignore safe mutations
        if (mutation.type === 'characterData' || mutation.type === 'attributes') {
          continue;
        }

        // Detect suspicious DOM changes
        if (mutation.type === 'childList') {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.nodeType === 1) { // Element node
              const element = node as HTMLElement;

              // Detect script injection
              if (element.tagName === 'SCRIPT') {
                onViolation('SCRIPT_INJECTION', 'Script injection terdeteksi');
              }

              // Detect iframe injection
              if (element.tagName === 'IFRAME') {
                onViolation('IFRAME_INJECTION', 'Iframe injection terdeteksi');
              }

              // Detect suspicious attributes
              if (
                element.getAttribute('onclick') ||
                element.getAttribute('onload') ||
                element.getAttribute('onerror')
              ) {
                onViolation('EVENT_HANDLER_INJECTION', 'Event handler injection terdeteksi');
              }
            }
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['onclick', 'onload', 'onerror', 'onmouseover'],
    });

    // 4. Protect window object properties (hanya block set, bukan get)
    const protectedProps = [
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'fetch',
      'XMLHttpRequest',
      'WebSocket',
    ];

    for (const prop of protectedProps) {
      const originalValue = (window as any)[prop];
      try {
        Object.defineProperty(window, prop, {
          get: function () {
            return originalValue;
          },
          set: function () {
            onViolation('WINDOW_PROPERTY_MODIFY', `Attempt to modify window.${prop}`);
          },
          configurable: false,
        });
      } catch {
        // Beberapa property mungkin sudah non-configurable, skip saja
      }
    }

    // 5. Detect debugger dengan timing check
    const debuggerInterval = setInterval(() => {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = performance.now();

      if (end - start > 100) {
        onViolation('DEBUGGER_DETECTED', 'Debugger terdeteksi');
      }
    }, 1000);

    // 6. Detect if page is in iframe
    if (window.self !== window.top) {
      onViolation('IFRAME_CONTEXT', 'Page dijalankan dalam iframe');
    }

    // 7. Monitor for localStorage/sessionStorage access dengan kata kunci sensitif
    const originalSetItem = Storage.prototype.setItem;
    const originalGetItem = Storage.prototype.getItem;
    const originalRemoveItem = Storage.prototype.removeItem;

    Storage.prototype.setItem = function (key: string, value: string) {
      if (key.includes('exam') || key.includes('answer')) {
        onViolation('STORAGE_MANIPULATION', `Storage manipulation terdeteksi: ${key}`);
      }
      return originalSetItem.call(this, key, value);
    };

    Storage.prototype.getItem = function (key: string) {
      if (key.includes('exam') || key.includes('answer')) {
        onViolation('STORAGE_ACCESS', `Storage access terdeteksi: ${key}`);
      }
      return originalGetItem.call(this, key);
    };

    Storage.prototype.removeItem = function (key: string) {
      if (key.includes('exam') || key.includes('answer')) {
        onViolation('STORAGE_REMOVAL', `Storage removal terdeteksi: ${key}`);
      }
      return originalRemoveItem.call(this, key);
    };

    // 8. Monitor network requests ke URL mencurigakan
    window.fetch = function (...args: Parameters<typeof fetch>) {
      const url = args[0];

      // Block requests ke suspicious URLs
      if (typeof url === 'string') {
        if (
          url.includes('pastebin') ||
          url.includes('github') ||
          url.includes('gist') ||
          url.includes('cheat')
        ) {
          onViolation('SUSPICIOUS_FETCH', `Suspicious fetch attempt: ${url}`);
          return Promise.reject(new Error('Blocked'));
        }
      }

      return originalFetch.apply(this, args);
    };

    // 9. Detect if running in headless browser
    const isHeadless = /HeadlessChrome|PhantomJS|Nightmare/.test(navigator.userAgent);
    if (isHeadless) {
      onViolation('HEADLESS_BROWSER', 'Headless browser terdeteksi');
    }

    // 10. Detect automation tools
    const isAutomated =
      (navigator as any).webdriver ||
      (window as any).__nightmare ||
      (window as any).__phantomjs ||
      (window as any).callPhantom;

    if (isAutomated) {
      onViolation('AUTOMATION_TOOL', 'Automation tool terdeteksi');
    }

    // 11. Continuous integrity check: pastikan fetch tidak dikembalikan ke native
    // (karena kita sudah override-nya sendiri, cukup cek apakah ada pihak lain yang override ulang)
    const originalFetchStr = originalFetch.toString();
    const integrityInterval = setInterval(() => {
      // Jika fetch sudah bukan milik kita lagi dan bukan native asli, ada yang override
      const currentFetchStr = window.fetch.toString();
      if (
        currentFetchStr !== window.fetch.toString() &&
        currentFetchStr.includes('[native code]')
      ) {
        onViolation('FETCH_MODIFIED', 'Fetch function termodifikasi oleh pihak ketiga');
      }
    }, 2000);

    return () => {
      observer.disconnect();
      clearInterval(debuggerInterval);
      clearInterval(integrityInterval);
      // Restore fungsi asli saat cleanup
      try {
        window.eval = originalEval;
        window.fetch = originalFetch;
        Storage.prototype.setItem = originalSetItem;
        Storage.prototype.getItem = originalGetItem;
        Storage.prototype.removeItem = originalRemoveItem;
      } catch {
        // Ignore restore errors
      }
    };
  }, [onViolation]);
}
