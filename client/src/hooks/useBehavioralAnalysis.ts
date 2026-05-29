import { useEffect, useRef } from 'react';

/**
 * useBehavioralAnalysis - Hook untuk deteksi behavioral anomalies
 *
 * Fitur:
 * - Detect typing speed yang tidak natural (terlalu cepat/lambat)
 * - Detect pause pattern yang mencurigakan
 * - Detect mouse movement yang tidak natural
 * - Detect copy-paste behavior
 * - Detect rapid clicking
 * - Detect unusual answer patterns
 */

interface ViolationCallback {
  (type: string, description: string): void;
}

export function useBehavioralAnalysis(onViolation: ViolationCallback) {
  const typingSpeedRef = useRef<number[]>([]);
  const lastKeyPressRef = useRef<number>(Date.now());
  const lastClickRef = useRef<number>(Date.now());
  const mouseMovementRef = useRef<{ x: number; y: number; t: number }[]>([]);

  useEffect(() => {
    // 1. Monitor typing speed — deteksi paste/bot dari kecepatan sangat tinggi
    const handleKeyPress = (e: KeyboardEvent) => {
      const now = Date.now();
      const timeSinceLastKey = now - lastKeyPressRef.current;

      // Hanya hitung karakter printable, bukan modifier
      if (e.key.length === 1) {
        if (timeSinceLastKey < 50 && timeSinceLastKey > 0) {
          typingSpeedRef.current.push(timeSinceLastKey);

          // Perlu minimal 8 sampel berturut-turut agar lebih yakin
          if (typingSpeedRef.current.length >= 8) {
            const avgSpeed =
              typingSpeedRef.current.reduce((a, b) => a + b, 0) /
              typingSpeedRef.current.length;
            if (avgSpeed < 30) {
              onViolation(
                'RAPID_TYPING',
                `Typing speed tidak natural: ${Math.round(avgSpeed)}ms per key`
              );
              typingSpeedRef.current = [];
            }
          }
        } else {
          typingSpeedRef.current = [];
        }
      }

      lastKeyPressRef.current = now;
    };

    // 2. Monitor mouse movement — deteksi gerakan sangat tidak wajar
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();

      mouseMovementRef.current.push({ x: e.clientX, y: e.clientY, t: now });

      // Keep only last 60 movements
      if (mouseMovementRef.current.length > 60) {
        mouseMovementRef.current.shift();
      }

      // Deteksi mouse yang benar-benar tidak bergerak sama sekali
      // (butuh 60 data point sebelum mengevaluasi)
      if (mouseMovementRef.current.length >= 60) {
        const recentMovements = mouseMovementRef.current.slice(-60);
        const uniquePositions = new Set(
          recentMovements.map((m) => `${m.x},${m.y}`)
        );

        // Hanya 1 posisi unik dalam 60 movements = benar-benar tidak bergerak
        if (uniquePositions.size <= 1) {
          onViolation('STATIC_MOUSE', 'Mouse tidak bergerak sama sekali dalam waktu lama');
        }
      }

      // Deteksi gerakan linear yang sangat sempurna (bot-like)
      // Butuh minimal 15 titik dan threshold lebih ketat
      if (mouseMovementRef.current.length >= 15) {
        const lastFifteen = mouseMovementRef.current.slice(-15);
        let straightLineCount = 0;

        for (let i = 1; i < lastFifteen.length - 1; i++) {
          const prev = lastFifteen[i - 1];
          const curr = lastFifteen[i];
          const next = lastFifteen[i + 1];

          // Hitung luas segitiga (collinear jika area mendekati 0)
          const area = Math.abs(
            (curr.x - prev.x) * (next.y - prev.y) -
              (next.x - prev.x) * (curr.y - prev.y)
          );

          if (area < 2) {
            // Threshold sangat ketat (< 2 pixel area)
            straightLineCount++;
          }
        }

        // Harus >90% titik collinear
        if (straightLineCount > lastFifteen.length * 0.9) {
          onViolation(
            'LINEAR_MOUSE',
            'Mouse movement terlalu linear/artificial'
          );
          // Reset agar tidak spam
          mouseMovementRef.current = [];
        }
      }
    };

    // 3. Monitor click patterns — deteksi clicking terlalu cepat
    const handleClick = (e: MouseEvent) => {
      const now = Date.now();
      const timeSinceLastClick = now - lastClickRef.current;

      // Threshold 80ms: manusia tidak bisa klik lebih cepat dari ini secara natural
      if (timeSinceLastClick < 80 && timeSinceLastClick > 0) {
        onViolation('RAPID_CLICKING', `Rapid clicking terdeteksi: ${timeSinceLastClick}ms`);
      }

      lastClickRef.current = now;
    };

    // 4. Monitor for copy-paste behavior via paste event
    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text') || '';

      // Paste teks panjang sangat mencurigakan
      if (pastedText.length > 50) {
        onViolation(
          'LARGE_PASTE',
          `Large paste detected: ${pastedText.length} characters`
        );
      }
    };

    // 5. Monitor for unusual answer patterns (nilai sama di-paste berulang)
    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement & {
        dataset: { previousValue?: string };
      };
      const value = target.value;

      if (
        target.dataset.previousValue === value &&
        value.length > 10
      ) {
        onViolation('DUPLICATE_ANSWER', 'Duplicate answer terdeteksi');
      }

      target.dataset.previousValue = value;
    };

    // 6. Monitor for unusual scroll patterns
    let lastScrollTime = Date.now();
    let scrollCount = 0;

    const handleScroll = () => {
      const now = Date.now();

      // Reset counter setiap menit
      if (now - lastScrollTime > 60000) {
        scrollCount = 0;
        lastScrollTime = now;
      }

      scrollCount++;

      // Lebih dari 100 scroll/menit = sangat tidak wajar
      if (scrollCount > 100) {
        onViolation('EXCESSIVE_SCROLLING', 'Excessive scrolling terdeteksi');
        scrollCount = 0;
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('change', handleChange);
    document.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('change', handleChange);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [onViolation]);
}
