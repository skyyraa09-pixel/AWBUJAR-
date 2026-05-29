import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { AlertCircle, Clock, AlertTriangle, Lock } from 'lucide-react';
import { useStrictProctoring } from '@/hooks/useStrictProctoring';
import { useAntiTampering } from '@/hooks/useAntiTampering';
import { useBehavioralAnalysis } from '@/hooks/useBehavioralAnalysis';
import { useHardwareDetection } from '@/hooks/useHardwareDetection';
import { useAggressiveFullscreen } from '@/hooks/useAggressiveFullscreen';

/**
 * ExamPage - Halaman ujian dengan sistem pengawasan SUPER KETAT
 *
 * Design Philosophy: Minimalis Profesional dengan Aksen Merah
 */

interface Violation {
  type: string;
  timestamp: number;
  description: string;
}

export default function ExamPage() {
  const [, setLocation] = useLocation();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [hasViolation, setHasViolation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 jam dalam detik
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [studentName] = useState('Siswa Ujian');
  const [examTitle] = useState('Ujian Matematika - Kelas 12');
  const [isLocked, setIsLocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Ref untuk mencegah multiple redirect
  const violationRedirectRef = useRef(false);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          handleViolation('TIME_UP', 'Waktu ujian telah habis');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format waktu ke HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Fungsi untuk mencatat pelanggaran — gunakan useCallback agar referensi stabil
  const handleViolation = useCallback(
    (type: string, description: string) => {
      // Hindari redirect ganda
      if (violationRedirectRef.current) return;

      const violation: Violation = {
        type,
        timestamp: Date.now(),
        description,
      };

      setViolations((prev) => [...prev, violation]);
      setHasViolation(true);
      setIsLocked(true);
      violationRedirectRef.current = true;

      // Redirect ke warning page setelah 500ms
      setTimeout(() => {
        setLocation(
          `/warning?violation=${encodeURIComponent(type)}&description=${encodeURIComponent(description)}`
        );
      }, 500);
    },
    [setLocation]
  );

  // Use all anti-cheat hooks
  useStrictProctoring(handleViolation);
  useAntiTampering(handleViolation);
  useBehavioralAnalysis(handleViolation);
  useHardwareDetection(handleViolation);
  useAggressiveFullscreen(containerRef, handleViolation);

  // Deteksi fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Request fullscreen saat halaman dimuat
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
        // Fullscreen request bisa gagal tanpa user gesture — tidak apa-apa
      }
    };

    const timer = setTimeout(requestFullscreen, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLocked) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center">
        <div className="text-center text-white">
          <Lock size={64} className="mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl font-bold mb-2">UJIAN TERKUNCI</h1>
          <p className="text-xl">Pelanggaran terdeteksi. Ujian Anda telah diakhiri.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-white flex flex-col"
      style={{ userSelect: 'none' }}
    >
      {/* Alert Bar untuk Pelanggaran */}
      {hasViolation && (
        <div className="bg-red-600 text-white px-4 py-3 flex items-center gap-2 animate-pulse">
          <AlertTriangle size={20} />
          <span className="font-semibold">PELANGGARAN TERDETEKSI - Ujian akan diakhiri</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{examTitle}</h1>
          <p className="text-sm text-gray-600">Peserta: {studentName}</p>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 bg-blue-50 px-6 py-3 rounded-lg border-2 border-blue-700">
          <Clock size={24} className="text-blue-700" />
          <div className="text-right">
            <p className="text-xs text-gray-600 font-semibold">SISA WAKTU</p>
            <p className="text-3xl font-bold text-blue-700 font-mono">{formatTime(timeLeft)}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-50 border-r-2 border-gray-200 p-6">
          <div className="space-y-6">
            {/* Status */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">STATUS UJIAN</h3>
              <div className="flex items-center gap-2 px-3 py-2 bg-green-100 border-2 border-green-600 rounded-lg">
                <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-900">MONITORING AKTIF</span>
              </div>
            </div>

            {/* Violations Count */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">PELANGGARAN</h3>
              <div className="text-center px-3 py-3 bg-red-50 border-2 border-red-300 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{violations.length}</p>
                <p className="text-xs text-red-700">Terdeteksi</p>
              </div>
            </div>

            {/* Security Level */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">LEVEL KEAMANAN</h3>
              <div className="px-3 py-3 bg-purple-50 border-2 border-purple-600 rounded-lg">
                <p className="text-sm font-bold text-purple-900">🔒 SUPER KETAT</p>
                <p className="text-xs text-purple-700 mt-1">Monitoring penuh sistem</p>
              </div>
            </div>

            {/* Rules */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">LARANGAN KETAT</h3>
              <ul className="space-y-1 text-xs text-gray-700">
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Ctrl+C, Ctrl+V (Copy/Paste)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Windows key</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Alt+Tab</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Mouse kanan</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>F12, Ctrl+Shift+I</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Idle lebih dari 30 detik</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Multiple displays</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Keluar fullscreen</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Exam Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Question Card */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-8 shadow-md">
              <div className="mb-6">
                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  Soal 1 dari 10
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Berapa hasil dari 2 + 2?
                </h2>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 mb-8">
                {['3', '4', '5', '6'].map((option, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors"
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      className="w-5 h-5 text-blue-700 cursor-pointer"
                    />
                    <span className="text-lg text-gray-800 font-medium">{option}</span>
                  </label>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4 justify-between">
                <button className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50">
                  ← Soal Sebelumnya
                </button>
                <button className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors">
                  Soal Berikutnya →
                </button>
              </div>
            </div>

            {/* Critical Warning */}
            <div className="mt-8 bg-red-50 border-2 border-red-600 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="text-red-700 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-red-900">
                  ⚠️ SISTEM MONITORING SUPER KETAT AKTIF
                </p>
                <p className="text-xs text-red-800 mt-1">
                  Setiap aktivitas mencurigakan akan LANGSUNG mengakhiri ujian Anda. Pastikan
                  Anda fokus dan mengikuti semua aturan dengan ketat.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
