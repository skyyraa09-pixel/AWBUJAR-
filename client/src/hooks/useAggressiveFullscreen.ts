import { useEffect, useRef } from 'react';

/**
 * useAggressiveFullscreen - Hook untuk aggressive fullscreen enforcement
 *
 * Fitur:
 * - Force fullscreen dan prevent exit
 * - Detect semua cara keluar dari fullscreen
 * - Re-enter fullscreen otomatis jika user keluar
 * - Detect F11 (browser fullscreen)
 * - Detect Alt+Tab, Alt+F4
 * - Continuous fullscreen verification
 * - Block all window resizing
 */

interface ViolationCallback {
  (type: string, description: string): void;
}

export function useAggressiveFullscreen(
  containerRef: React.RefObject<HTMLDivElement | null>,
  onViolation: ViolationCallback
) {
  const fullscreenAttemptRef = useRef<number>(0);
  const lastFullscreenCheckRef = useRef<number>(Date.now());

  useEffect(() => {
    const requestFullscreen = async () => {
      try {
        if (containerRef.current) {
          const elem = containerRef.current as any;

          if (elem.requestFullscreen) {
            await elem.requestFullscreen();
          } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen();
          } else if (elem.mozRequestFullScreen) {
            await elem.mozRequestFullScreen();
          } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen();
          }
        }
      } catch {
        // Fullscreen request mungkin diblok browser — bukan alasan violation
      }
    };

    const isFullscreenActive = () =>
      !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

    // 1. Request fullscreen on load
    const initTimer = setTimeout(requestFullscreen, 500);

    // 2. Monitor fullscreen changes
    const handleFullscreenChange = () => {
      if (!isFullscreenActive()) {
        fullscreenAttemptRef.current++;
        onViolation(
          'FULLSCREEN_EXIT',
          `Keluar dari fullscreen (${fullscreenAttemptRef.current}x)`
        );

        // Auto re-enter fullscreen
        setTimeout(requestFullscreen, 100);
      }
    };

    // 3. Monitor F11 (browser fullscreen) dan shortcut lain
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        e.stopPropagation();
        onViolation('F11_PRESSED', 'F11 (browser fullscreen) terdeteksi');
        return false;
      }

      // Block Alt+F4
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        e.stopPropagation();
        onViolation('ALT_F4', 'Alt+F4 (close window) terdeteksi');
        return false;
      }

      // Block Alt+Tab (redundant tapi extra safety)
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        onViolation('ALT_TAB_FULLSCREEN', 'Alt+Tab terdeteksi dalam fullscreen');
        return false;
      }
    };

    // 4. Monitor window resize
    const handleResize = () => {
      // Coba maximize window (mungkin diblok browser, tapi boleh dicoba)
      try {
        window.moveTo(0, 0);
        window.resizeTo(window.screen.width, window.screen.height);
      } catch {
        // Ignore — diblok browser adalah normal
      }

      if (
        window.innerWidth < window.screen.width * 0.8 ||
        window.innerHeight < window.screen.height * 0.8
      ) {
        onViolation('WINDOW_RESIZED', 'Window size tidak fullscreen');
      }
    };

    // 5. Monitor window position changes
    let lastWindowX = window.screenX;
    let lastWindowY = window.screenY;

    const handleWindowMove = () => {
      if (window.screenX !== lastWindowX || window.screenY !== lastWindowY) {
        onViolation('WINDOW_MOVED', 'Window position terubah');
        lastWindowX = window.screenX;
        lastWindowY = window.screenY;
      }
    };

    // 6. Continuous fullscreen verification (setiap 2 detik)
    const fullscreenCheckInterval = setInterval(() => {
      const now = Date.now();

      if (now - lastFullscreenCheckRef.current >= 2000) {
        if (!isFullscreenActive()) {
          onViolation('FULLSCREEN_CHECK_FAILED', 'Fullscreen verification failed');
          requestFullscreen();
        }
        lastFullscreenCheckRef.current = now;
      }
    }, 1000);

    // 7. Monitor for window blur (user switched window)
    const handleBlur = () => {
      onViolation('WINDOW_BLUR_FULLSCREEN', 'Window blur terdeteksi dalam fullscreen');

      setTimeout(() => {
        window.focus();
      }, 100);
    };

    // 8. Monitor for visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onViolation('PAGE_HIDDEN_FULLSCREEN', 'Page hidden dalam fullscreen');
      }
    };

    // 9. Handle Escape key — beberapa browser allow Escape untuk keluar fullscreen
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isFullscreenActive()) {
          onViolation('ESCAPE_EXIT_FULLSCREEN', 'Escape key fullscreen exit terdeteksi');
          setTimeout(requestFullscreen, 100);
        }
      }
    };

    // 10. Prevent context menu dalam fullscreen
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      onViolation('CONTEXT_MENU_FULLSCREEN', 'Context menu dalam fullscreen');
      return false;
    };

    // 11. Monitor Print Screen dalam fullscreen
    const handlePrintScreen = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        onViolation('PRINT_SCREEN_FULLSCREEN', 'Print screen dalam fullscreen');
        return false;
      }
    };

    // Attach event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('resize', handleResize);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handlePrintScreen);

    // Periodic window move check
    const moveCheckInterval = setInterval(handleWindowMove, 1000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(fullscreenCheckInterval);
      clearInterval(moveCheckInterval);

      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handlePrintScreen);
    };
  }, [containerRef, onViolation]);
}
