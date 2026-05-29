import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { BookOpen, AlertCircle } from "lucide-react";

/**
 * Home Page - Halaman utama dengan akses ke ujian
 * 
 * Design Philosophy: Minimalis Profesional dengan Aksen Merah
 */
export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Sistem Ujian Terawasi</h1>
          <p className="text-gray-600 mt-1">Platform ujian dengan sistem pengawasan ketat</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <BookOpen size={40} className="text-blue-700" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Selamat Datang</h2>
                <p className="text-gray-600">Siap untuk ujian Anda?</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">
              Sistem ujian ini dilengkapi dengan pengawasan ketat untuk memastikan integritas ujian. Sebelum memulai, pastikan Anda telah membaca dan memahami semua aturan yang berlaku.
            </p>

            {/* Rules */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Aturan Ujian:</h3>
              <ul className="space-y-2 text-sm text-gray-800">
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Dilarang keluar dari mode fullscreen</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Dilarang menggunakan copy/paste (Ctrl+C / Ctrl+V)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Dilarang membuka tab atau aplikasi lain</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Dilarang menggunakan Alt+Tab</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Dilarang menekan tombol Windows</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Dilarang menggunakan tombol arrow (panah)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Dilarang menggunakan tombol Tab</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>Dilarang membuka Developer Tools</span>
                </li>
              </ul>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 flex gap-3 mb-8">
              <AlertCircle className="text-yellow-700 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-yellow-900">Peringatan</p>
                <p className="text-xs text-yellow-800 mt-1">
                  Setiap pelanggaran akan dideteksi dan dicatat. Pelanggaran berulang dapat mengakibatkan pembatalan ujian.
                </p>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => setLocation('/exam')}
              className="w-full px-6 py-4 bg-blue-700 text-white font-bold text-lg rounded-lg hover:bg-blue-800 transition-colors shadow-md"
            >
              Mulai Ujian
            </button>
          </div>

          {/* Info Footer */}
          <div className="text-center text-sm text-gray-600">
            <p>Sistem Pengawasan Ujian Otomatis © 2026</p>
          </div>
        </div>
      </main>
    </div>
  );
}
