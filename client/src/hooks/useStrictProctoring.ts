import { useEffect, useRef, useState } from 'react';

interface ViolationCallback {
  (type: string, description: string): void;
}

const STARTUP_GRACE_MS = 4000; // 4 detik grace period setelah ExamPage mount

export function useStrictProctoring(onViolation: ViolationCallback) {
  const lastActivityRef = useRef<number>(Date.now());
  const violationCountRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const [isLocked, setIsLocked] = useState(false);

  const isReady = () => Date.now() - startTimeRef.current > STARTUP_GRACE_MS;

  // 1. Block shortcut berbahaya (tapi allow keyboard input normal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Block Windows key
      if (e.key === 'Meta' || e.key === 'Win' || e.keyCode === 91 || e.keyCode === 92) {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('WINDOWS_KEY', `Windows key terdeteksi (${violationCountRef.current}x)`);
        return false;
      }

      // Block Alt+Tab
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('ALT_TAB', `Alt+Tab terdeteksi (${violationCountRef.current}x)`);
        return false;
      }

      // Block Ctrl+C (Copy)
      if (ctrlKey && e.key === 'c') {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('COPY', `Ctrl+C terdeteksi (${violationCountRef.current}x)`);
        return false;
      }

      // Block Ctrl+V (Paste)
      if (ctrlKey && e.key === 'v') {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('PASTE', `Ctrl+V terdeteksi (${violationCountRef.current}x)`);
        return false;
      }

      // Block Ctrl+X (Cut)
      if (ctrlKey && e.key === 'x') {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('CUT', `Ctrl+X terdeteksi (${violationCountRef.current}x)`);
        return false;
      }

      // Block Ctrl+A (Select All)
      if (ctrlKey && e.key === 'a') {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('SELECT_ALL', `Ctrl+A terdeteksi (${violationCountRef.current}x)`);
        return false;
      }

      // Block F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('DEV_TOOLS', `F12 terdeteksi (${violationCountRef.current}x)`);
        return false;
      }

      // Block Ctrl+Shift+I/J/C (Developer Tools)
      if (ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('DEV_TOOLS', `Ctrl+Shift+I terdeteksi (${violationCountRef.current}x)`);
        return false;
      }
      if (ctrlKey && e.shiftKey && (e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('DEV_TOOLS', `Ctrl+Shift+J terdeteksi (${violationCountRef.current}x)`);
        return false;
      }
      if (ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('DEV_TOOLS', `Ctrl+Shift+C terdeteksi (${violationCountRef.current}x)`);
        return false;
      }

      // Block Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('PRINT_SCREEN', `Print Screen terdeteksi (${violationCountRef.current}x)`);
        return false;
      }

      // Block Ctrl+S (Save)
      if (ctrlKey && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('SAVE', `Ctrl+S terdeteksi (${violationCountRef.current}x)`);
        return false;
      }

      // Block Ctrl+P (Print)
      if (ctrlKey && e.key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('PRINT', `Ctrl+P terdeteksi (${violationCountRef.current}x)`);
        return false;
      }

      // Block Ctrl+W (Close Tab)
      if (ctrlKey && e.key === 'w') {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('CLOSE_TAB', `Ctrl+W terdeteksi (${violationCountRef.current}x)`);
        return false;
      }

      // Block Ctrl+T (New Tab)
      if (ctrlKey && e.key === 't') {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('NEW_TAB', `Ctrl+T terdeteksi (${violationCountRef.current}x)`);
        return false;
      }

      // Block Ctrl+N (New Window)
      if (ctrlKey && e.key === 'n') {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('NEW_WINDOW', `Ctrl+N terdeteksi (${violationCountRef.current}x)`);
        return false;
      }

      // Block Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        violationCountRef.current++;
        onViolation('ESCAPE_KEY', `Escape key terdeteksi (${violationCountRef.current}x)`);
        return false;
      }

      // Update last activity untuk keyboard input yang valid
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onViolation]);

  // 2. Disable mouse kanan
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        onViolation('RIGHT_CLICK', 'Right-click terdeteksi');
        return false;
      }
      lastActivityRef.current = Date.now();
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onViolation('CONTEXT_MENU', 'Context menu terdeteksi');
      return false;
    };

    const handleMouseMove = () => {
      lastActivityRef.current = Date.now();
    };

    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [onViolation]);

  // 3. Deteksi idle time — grace period 4 detik + idle threshold 30 detik
  // Jadi user punya total 34 detik sebelum pertama kali bisa trigger
  useEffect(() => {
    // Reset timer aktivitas saat hook mount supaya baseline fresh
    lastActivityRef.current = Date.now();

    const checkIdle = () => {
      if (!isReady()) return; // Jangan check idle selama grace period
      const idleTime = (Date.now() - lastActivityRef.current) / 1000;
      if (idleTime > 30) {
        onViolation('IDLE_TIMEOUT', `User idle selama ${Math.floor(idleTime)} detik`);
      }
    };

    const idleInterval = setInterval(checkIdle, 5000);
    return () => clearInterval(idleInterval);
  }, [onViolation]);

  // 4. Deteksi multiple displays — hanya via enumerateDevices, hapus resolusi check
  useEffect(() => {
    const checkDisplays = async () => {
      try {
        if ((navigator as any).mediaDevices?.enumerateDevices) {
          const devices = await (navigator as any).mediaDevices.enumerateDevices();
          // enumerateDevices tidak bisa detect monitor eksternal secara reliable,
          // hanya videoinput (kamera). Skip supaya tidak false positive.
          // Deteksi ini dipertahankan untuk future API support (getScreenDetails)
        }
      } catch {
        // Ignore
      }
    };

    checkDisplays();
    const displayInterval = setInterval(checkDisplays, 10000);
    return () => clearInterval(displayInterval);
  }, [onViolation]);

  // 5. Deteksi tab/window berpindah — dengan grace period
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isReady()) return;
      if (document.hidden) {
        onViolation('TAB_HIDDEN', 'Tab ujian tidak visible');
      }
    };

    const handleBlur = () => {
      if (!isReady()) return;
      onViolation('WINDOW_BLUR', 'Window ujian kehilangan focus');
    };

    const handleFocus = () => {
      lastActivityRef.current = Date.now();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [onViolation]);

  // 6. Deteksi USB/device changes
  useEffect(() => {
    const handleDeviceChange = () => {
      if (!isReady()) return;
      onViolation('DEVICE_CHANGE', 'USB atau device baru terdeteksi');
    };

    if ((navigator as any).mediaDevices?.addEventListener) {
      (navigator as any).mediaDevices.addEventListener('devicechange', handleDeviceChange);
    }

    return () => {
      if ((navigator as any).mediaDevices?.removeEventListener) {
        (navigator as any).mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      }
    };
  }, [onViolation]);

  // 7. Prevent drag and drop
  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      onViolation('DRAG_DROP', 'Drag and drop terdeteksi');
      return false;
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      onViolation('DRAG_DROP', 'Drop file terdeteksi');
      return false;
    };

    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('drop', handleDrop, true);

    return () => {
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('drop', handleDrop, true);
    };
  }, [onViolation]);

  // 8. Monitor network offline
  useEffect(() => {
    const handleOffline = () => {
      onViolation('NETWORK_OFFLINE', 'Internet connection terputus');
    };

    window.addEventListener('offline', handleOffline);
    return () => window.removeEventListener('offline', handleOffline);
  }, [onViolation]);

  // 9. Prevent zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        onViolation('ZOOM_ATTEMPT', 'Zoom attempt terdeteksi');
        return false;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [onViolation]);

  return {
    isLocked,
    setIsLocked,
    violationCount: violationCountRef.current,
  };
}
