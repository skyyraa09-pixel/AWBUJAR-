import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { AlertTriangle, AlertCircle, XCircle } from 'lucide-react';

/**
 * WarningPage - Halaman warning untuk pelanggaran SUPER KETAT
 * 
 * Design Philosophy: Minimalis Profesional dengan Aksen Merah
 * - Menampilkan pelanggaran dengan jelas dan tegas
 * - Red alert bar untuk emphasis
 * - Informasi detail tentang pelanggaran
 */

const VIOLATION_MESSAGES: Record<string, { title: string; description: string; severity: 'critical' | 'warning' }> = {
  FULLSCREEN_EXIT: {
    title: 'Keluar dari Mode Fullscreen',
    description: 'Anda telah keluar dari mode fullscreen. Ujian harus dilakukan dalam mode fullscreen penuh.',
    severity: 'critical',
  },
  KEYBOARD_DETECTED: {
    title: 'Input Keyboard Terdeteksi',
    description: 'Semua keyboard input dilarang selama ujian. Sistem monitoring mendeteksi aktivitas keyboard Anda.',
    severity: 'critical',
  },
  RIGHT_CLICK: {
    title: 'Right-Click Terdeteksi',
    description: 'Right-click tidak diperbolehkan selama ujian.',
    severity: 'critical',
  },
  CONTEXT_MENU: {
    title: 'Context Menu Terdeteksi',
    description: 'Anda mencoba membuka context menu. Ini tidak diperbolehkan.',
    severity: 'critical',
  },
  IDLE_TIMEOUT: {
    title: 'User Idle Terlalu Lama',
    description: 'Anda tidak aktif selama lebih dari 30 detik. Ujian memerlukan aktivitas berkelanjutan.',
    severity: 'critical',
  },
  MULTIPLE_DISPLAYS: {
    title: 'Multiple Displays Terdeteksi',
    description: 'Sistem monitoring mendeteksi lebih dari satu display. Ujian hanya boleh dilakukan dengan satu monitor.',
    severity: 'critical',
  },
  TAB_HIDDEN: {
    title: 'Tab Ujian Tidak Visible',
    description: 'Anda berpindah ke tab atau aplikasi lain. Anda harus tetap fokus pada ujian.',
    severity: 'critical',
  },
  WINDOW_BLUR: {
    title: 'Jendela Ujian Kehilangan Focus',
    description: 'Jendela ujian kehilangan fokus. Anda harus tetap fokus pada ujian ini.',
    severity: 'critical',
  },
  PRINT_SCREEN: {
    title: 'Print Screen Terdeteksi',
    description: 'Anda mencoba menggunakan Print Screen. Screenshot tidak diperbolehkan.',
    severity: 'critical',
  },
  CLIPBOARD: {
    title: 'Clipboard Access Terdeteksi',
    description: 'Copy/Paste tidak diperbolehkan selama ujian.',
    severity: 'critical',
  },
  MEDIA_KEY: {
    title: 'Media Key Terdeteksi',
    description: 'Anda mencoba mengubah brightness atau volume. Ini tidak diperbolehkan.',
    severity: 'critical',
  },
  DEVICE_CHANGE: {
    title: 'USB/Device Baru Terdeteksi',
    description: 'Sistem monitoring mendeteksi perubahan device. Koneksi USB baru tidak diperbolehkan.',
    severity: 'critical',
  },
  DRAG_DROP: {
    title: 'Drag & Drop Terdeteksi',
    description: 'Drag and drop tidak diperbolehkan selama ujian.',
    severity: 'critical',
  },
  ZOOM_ATTEMPT: {
    title: 'Zoom Attempt Terdeteksi',
    description: 'Anda mencoba mengubah zoom level. Ini tidak diperbolehkan.',
    severity: 'critical',
  },
  NETWORK_OFFLINE: {
    title: 'Koneksi Internet Terputus',
    description: 'Koneksi internet Anda terputus. Ujian memerlukan koneksi internet yang stabil.',
    severity: 'critical',
  },
  DEV_TOOLS: {
    title: 'Developer Tools Terdeteksi',
    description: 'Anda mencoba membuka Developer Tools. Ini tidak diperbolehkan selama ujian.',
    severity: 'critical',
  },
  TIME_UP: {
    title: 'Waktu Ujian Habis',
    description: 'Waktu yang dialokasikan untuk ujian telah berakhir.',
    severity: 'critical',
  },
};

export default function WarningPage() {
  const [location] = useLocation();
  const [violationData, setViolationData] = useState<{
    type: string;
    description: string;
    timestamp: string;
  } | null>(null);

  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.split('?')[1]);
    const violationType = params.get('violation') || 'UNKNOWN';
    const customDescription = params.get('description') || '';

    const message = VIOLATION_MESSAGES[violationType] || {
      title: 'Pelanggaran Ujian',
      description: customDescription || 'Anda telah melakukan pelanggaran terhadap aturan ujian.',
      severity: 'critical' as const,
    };

    setViolationData({
      type: violationType,
      description: message.description,
      timestamp: new Date().toLocaleString('id-ID'),
    });
  }, [location]);

  if (!violationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-700 rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Memproses...</p>
        </div>
      </div>
    );
  }

  const message = VIOLATION_MESSAGES[violationData.type] || VIOLATION_MESSAGES['UNKNOWN'] || {
    title: 'Pelanggaran Ujian',
    description: violationData.description,
    severity: 'critical',
  };

  const isWarning = message.severity === 'warning';
  const isCritical = message.severity === 'critical';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Alert Header */}
      <div className={`${isCritical ? 'bg-red-600' : 'bg-yellow-500'} text-white px-6 py-4`}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {isCritical ? (
            <AlertTriangle size={28} className="flex-shrink-0 animate-pulse" />
          ) : (
            <AlertCircle size={28} className="flex-shrink-0" />
          )}
          <div>
            <h1 className="text-2xl font-bold">PELANGGARAN UJIAN TERDETEKSI</h1>
            <p className="text-sm opacity-90">Waktu: {violationData.timestamp}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full">
          {/* Violation Card */}
          <div className={`border-4 rounded-lg p-8 mb-8 ${
            isCritical
              ? 'border-red-600 bg-red-50'
              : 'border-yellow-500 bg-yellow-50'
          }`}>
            {/* Icon */}
            <div className="flex justify-center mb-6">
              {isCritical ? (
                <XCircle size={64} className="text-red-600 animate-pulse" />
              ) : (
                <AlertTriangle size={64} className="text-yellow-600" />
              )}
            </div>

            {/* Title */}
            <h2 className={`text-3xl font-bold text-center mb-4 ${
              isCritical ? 'text-red-900' : 'text-yellow-900'
            }`}>
              {message.title}
            </h2>

            {/* Description */}
            <p className={`text-lg text-center mb-6 ${
              isCritical ? 'text-red-800' : 'text-yellow-800'
            }`}>
              {message.description}
            </p>

            {/* Violation Details */}
            <div className={`border-2 rounded-lg p-4 mb-6 ${
              isCritical
                ? 'border-red-300 bg-white'
                : 'border-yellow-300 bg-white'
            }`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">JENIS PELANGGARAN</p>
                  <p className="text-lg font-bold text-gray-900">{violationData.type}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">WAKTU TERDETEKSI</p>
                  <p className="text-lg font-bold text-gray-900">{violationData.timestamp}</p>
                </div>
              </div>
            </div>

            {/* Severity Badge */}
            <div className="flex justify-center mb-8">
              <span className={`px-4 py-2 rounded-full font-bold text-sm ${
                isCritical
                  ? 'bg-red-600 text-white'
                  : 'bg-yellow-600 text-white'
              }`}>
                {isCritical ? 'PELANGGARAN SERIUS - UJIAN DIAKHIRI' : 'PELANGGARAN RINGAN'}
              </span>
            </div>
          </div>

          {/* Critical Warning */}
          <div className="bg-red-50 border-2 border-red-600 rounded-lg p-6 mb-8">
            <p className="text-sm text-red-900">
              <span className="font-bold">🔒 SISTEM MONITORING SUPER KETAT:</span> Ujian Anda telah diakhiri karena terdeteksi pelanggaran serius. Pelanggaran ini telah dicatat dalam sistem dan akan dilaporkan kepada pengawas ujian.
            </p>
          </div>

          {/* Rules Reminder */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Aturan Ujian SUPER KETAT:</h3>
            <ul className="space-y-2 text-sm text-gray-800">
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>Copy/Paste (Ctrl+C, Ctrl+V) dilarang</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>Windows key dilarang</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>Alt+Tab dilarang</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>Mouse kanan (right-click) dilarang</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>F12 dan Ctrl+Shift+I (Developer Tools) dilarang</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>Tidak boleh idle lebih dari 30 detik</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>Hanya boleh satu monitor (multiple displays dilarang)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>Tidak boleh keluar dari mode fullscreen</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>Print screen dan screenshot dilarang</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-600 font-bold">✗</span>
                <span>USB/Device baru tidak boleh terhubung</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 bg-blue-700 text-white font-bold text-lg rounded-lg hover:bg-blue-800 transition-colors shadow-lg"
            >
              Kembali ke Halaman Utama
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t-2 border-gray-300 px-6 py-4 text-center text-sm text-gray-600">
        <p>Sistem Pengawasan Ujian Otomatis SUPER KETAT © 2026 - Semua aktivitas dipantau dan dicatat</p>
      </footer>
    </div>
  );
}
