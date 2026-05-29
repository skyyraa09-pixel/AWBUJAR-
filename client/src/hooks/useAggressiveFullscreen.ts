import { useEffect, useRef } from 'react';

interface ViolationCallback {
  (type: string, description: string): void;
}

// Grace period setelah masuk fullscreen sebelum mulai enforce (ms)
const FULLSCREEN_GRACE_MS = 3000;
// Grace period awal sebelum semua check aktif
const STARTUP_GRACE_MS = 4000;

export function useAggressiveFullscreen(
  containerRef: React.RefObject<HTMLDivElement | null>,
  onViolation: ViolationCallback
) {
  const fullscreenAttemptRef = useRef<number>(0);
  const isReadyToEnforceRef = useRef<boolean>(false);
  const lastFullscreenEntryRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

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
        // Fullscreen request bisa gagal tanpa user gesture — bukan violation
      }
    };

    const isFullscreenActive = () =>
      !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

    // Cek apakah sudah cukup waktu sejak startup DAN sejak fullscreen terakhir
    const isGracePeriodOver = () => {
      const now = Date.now();
      const sinceStart = now - startTimeRef.current;
      const sinceFullscreen = now - lastFullscreenEntryRef.current;
      return (
        sinceStart > STARTUP_GRACE_MS &&
        sinceFullscreen > FULLSCREEN_GRACE_MS &&
        isReadyToEnforceRef.current
      );
    };

    // 1. Request fullscreen on load, aktifkan enforce setelah grace period
    const initTimer = setTimeout(requestFullscreen, 500);
    const readyTimer = setTimeout(() => {
      isReadyToEnforceRef.current = true;
    }, STARTUP_GRACE_MS);

    // 2. Monitor fullscreen changes
    const handleFullscreenChange = () => {
      if (isFullscreenActive()) {
        // Baru masuk fullscreen — catat waktu, reset grace period
        lastFullscreenEntryRef.current = Date.now();
      } else {
        // Keluar dari fullscreen — hanya report jika grace period sudah selesai
        if (isGracePeriodOver()) {
          fullscreenAttemptRef.current++;
          onViolation(
            'FULLSCREEN_EXIT',
            `Keluar dari fullscreen (${fullscreenAttemptRef.current}x)`
          );
        }
        // Selalu coba re-enter
        setTimeout(requestFullscreen, 300);
      }
    };

    // 3. Monitor F11 dan shortcut keluar
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        e.stopPropagation();
        if (isGracePeriodOver()) {
          onViolation('F11_PRESSED', 'F11 (browser fullscreen) terdeteksi');
        }
        return false;
      }
      if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        e.stopPropagation();
        if (isGracePeriodOver()) {
          onViolation('ALT_F4', 'Alt+F4 (close window) terdeteksi');
        }
        return false;
      }
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        if (isGracePeriodOver()) {
          onViolation('ALT_TAB_FULLSCREEN', 'Alt+Tab terdeteksi dalam fullscreen');
        }
        return false;
      }
    };

    // 4. Monitor window resize — hanya setelah grace period
    const handleResize = () => {
      if (!isGracePeriodOver()) return;
      if (
        window.innerWidth < window.screen.width * 0.8 ||
        window.innerHeight < window.screen.height * 0.8
      ) {
        onViolation('WINDOW_RESIZED', 'Window size tidak fullscreen');
      }
    };

    // 5. Monitor window position changes — hanya setelah grace period
    let lastWindowX = window.screenX;
    let lastWindowY = window.screenY;

    const handleWindowMove = () => {
      if (!isGracePeriodOver()) {
        // Update baseline selama grace period supaya tidak false positive
        lastWindowX = window.screenX;
        lastWindowY = window.screenY;
        return;
      }
      if (window.screenX !== lastWindowX || window.screenY !== lastWindowY) {
        onViolation('WINDOW_MOVED', 'Window position terubah');
        lastWindowX = window.screenX;
        lastWindowY = window.screenY;
      }
    };

    // 6. Continuous fullscreen verification — dengan grace period
    const fullscreenCheckInterval = setInterval(() => {
      if (!isGracePeriodOver()) return;
      if (!isFullscreenActive()) {
        onViolation('FULLSCREEN_CHECK_FAILED', 'Fullscreen verification failed');
        requestFullscreen();
      }
    }, 3000); // Check setiap 3 detik (lebih jarang, lebih aman)

    // 7. Window blur — hanya setelah grace period
    const handleBlur = () => {
      if (!isGracePeriodOver()) return;
      onViolation('WINDOW_BLUR_FULLSCREEN', 'Window blur terdeteksi dalam fullscreen');
      setTimeout(() => window.focus(), 100);
    };

    // 8. Visibility change — hanya setelah grace period
    const handleVisibilityChange = () => {
      if (!isGracePeriodOver()) return;
      if (document.hidden) {
        onViolation('PAGE_HIDDEN_FULLSCREEN', 'Page hidden dalam fullscreen');
      }
    };

    // 9. Escape key
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isGracePeriodOver()) {
        if (!isFullscreenActive()) {
          onViolation('ESCAPE_EXIT_FULLSCREEN', 'Escape key fullscreen exit terdeteksi');
          setTimeout(requestFullscreen, 100);
        }
      }
    };

    // 10. Context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (isGracePeriodOver()) {
        onViolation('CONTEXT_MENU_FULLSCREEN', 'Context menu dalam fullscreen');
      }
      return false;
    };

    // 11. Print Screen
    const handlePrintScreen = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        if (isGracePeriodOver()) {
          onViolation('PRINT_SCREEN_FULLSCREEN', 'Print screen dalam fullscreen');
        }
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

    const moveCheckInterval = setInterval(handleWindowMove, 1000);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(readyTimer);
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
