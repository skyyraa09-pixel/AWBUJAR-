import { useEffect } from 'react';

/**
 * useHardwareDetection - Hook untuk deteksi VM, emulator, dan suspicious hardware
 *
 * Fitur:
 * - Detect virtual machines (VirtualBox, VMware, Hyper-V, KVM)
 * - Detect emulators
 * - Detect suspicious GPU
 * - Detect suspicious CPU info
 * - Detect if running in sandbox
 * - Detect suspicious browser plugins
 */

interface ViolationCallback {
  (type: string, description: string): void;
}

export function useHardwareDetection(onViolation: ViolationCallback) {
  useEffect(() => {
    // 1. Detect Virtual Machines via user agent
    const detectVM = () => {
      const vmUserAgents = ['VirtualBox', 'VMware', 'Xen', 'QEMU', 'Bochs', 'Parallels', 'Hyper-V', 'KVM'];
      for (const vm of vmUserAgents) {
        if (navigator.userAgent.includes(vm)) {
          onViolation('VM_DETECTED', `VM detected: ${vm}`);
        }
      }
    };

    // 2. Detect suspicious screen resolution
    // Hanya resolusi yang benar-benar khas VM dan sangat jarang di hardware nyata
    const detectSuspiciousResolution = () => {
      const width = window.screen.width;
      const height = window.screen.height;

      // Resolusi sangat kecil yang hampir tidak pernah dipakai di hardware nyata saat ini
      const suspiciousVmResolutions: [number, number][] = [
        [800, 600],
        [640, 480],
        [1024, 600],
      ];

      for (const res of suspiciousVmResolutions) {
        if (width === res[0] && height === res[1]) {
          onViolation('VM_RESOLUTION', `Suspicious VM resolution: ${width}x${height}`);
        }
      }
    };

    // 3. Detect suspicious GPU via WebGL
    const detectSuspiciousGPU = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl =
          (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
          (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = gl.getParameter(
              (debugInfo as any).UNMASKED_RENDERER_WEBGL
            ) as string;
            const vendor = gl.getParameter(
              (debugInfo as any).UNMASKED_VENDOR_WEBGL
            ) as string;

            // Detect common VM / software-rendered GPUs
            const vmGPUs = ['SwiftShader', 'llvmpipe', 'softpipe', 'VirtualBox', 'ANGLE (Google, Vulkan 1.3.0 (SwiftShader)'];

            for (const gpu of vmGPUs) {
              if (
                renderer.toLowerCase().includes(gpu.toLowerCase()) ||
                vendor.toLowerCase().includes(gpu.toLowerCase())
              ) {
                onViolation('VM_GPU', `Suspicious GPU detected: ${renderer}`);
                break;
              }
            }

            // Detect if GPU info is completely missing (headless browser)
            if (!renderer || renderer === 'Unknown' || renderer.trim() === '') {
              onViolation('NO_GPU', 'GPU information not available - possible headless browser');
            }
          }
        }
      } catch {
        // Jangan laporkan error WebGL sebagai violation — beberapa browser privacy mode blok ini
      }
    };

    // 4. Detect suspicious CPU info
    const detectSuspiciousCPU = () => {
      const cores = navigator.hardwareConcurrency;

      // Hanya 1 core adalah indikator kuat VM minimal
      if (cores === 1) {
        onViolation('SINGLE_CORE_CPU', 'Single core CPU terdeteksi - possible VM');
      }
    };

    // 5. Detect suspicious memory (hanya jika sangat rendah)
    const detectSuspiciousMemory = () => {
      const memory = (navigator as any).deviceMemory as number | undefined;

      if (memory !== undefined && memory < 1) {
        onViolation('LOW_MEMORY', `Very low memory detected: ${memory}GB - possible VM`);
      }
    };

    // 6. Detect suspicious browser plugins (remote access tools)
    const detectSuspiciousPlugins = () => {
      const suspiciousPlugins = [
        'Chrome Remote Desktop',
        'Citrix',
        'TeamViewer',
        'AnyDesk',
        'VNC',
        'RDP',
      ];

      for (let i = 0; i < navigator.plugins.length; i++) {
        const plugin = navigator.plugins[i];
        for (const suspicious of suspiciousPlugins) {
          if (plugin.name.includes(suspicious)) {
            onViolation('REMOTE_ACCESS_TOOL', `Remote access tool detected: ${plugin.name}`);
          }
        }
      }
    };

    // 7. Detect if running in sandbox environment
    const detectSandbox = () => {
      if (
        (window as any).__SANDBOX__ ||
        (window as any).__SANDBOX_ENV__ ||
        (window as any).sandbox ||
        (window as any).__SANDBOX_MODE__
      ) {
        onViolation('SANDBOX_DETECTED', 'Sandbox environment terdeteksi');
      }
      // __MANUS_SANDBOX__ / __MANUS_ENV__ adalah environment yang diketahui, tidak dilaporkan
    };

    // 8. Detect headless browser
    const detectHeadless = () => {
      const isHeadless =
        /HeadlessChrome|PhantomJS|Nightmare/.test(navigator.userAgent) ||
        (navigator as any).webdriver === true;

      if (isHeadless) {
        onViolation('HEADLESS_BROWSER', 'Headless browser terdeteksi');
      }
    };

    // 9. Detect if browser is in private/incognito mode
    const detectPrivateMode = () => {
      try {
        const test = '__private_mode_test__';
        window.localStorage.setItem(test, test);
        window.localStorage.removeItem(test);
      } catch {
        onViolation('PRIVATE_MODE', 'Private/Incognito mode terdeteksi');
      }
    };

    // Run all detection functions
    detectVM();
    detectSuspiciousResolution();
    detectSuspiciousGPU();
    detectSuspiciousCPU();
    detectSuspiciousMemory();
    detectSuspiciousPlugins();
    detectSandbox();
    detectHeadless();
    detectPrivateMode();

    // Run periodic checks setiap 30 detik
    const checkInterval = setInterval(() => {
      detectVM();
      detectSuspiciousResolution();
      detectSuspiciousGPU();
    }, 30000);

    return () => clearInterval(checkInterval);
  }, [onViolation]);
}
