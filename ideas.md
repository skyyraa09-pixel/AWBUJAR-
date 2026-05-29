# Brainstorming Desain Website Ujian dengan Sistem Pengawasan

## Konteks
Website ujian dengan sistem pengawasan ketat yang mendeteksi pelanggaran. Desain harus terasa profesional, tegas, dan menunjukkan seriusitas ujian sambil tetap user-friendly.

---

## Desain 1: Minimalis Profesional dengan Aksen Merah (Probability: 0.08)

**Design Movement:** Minimalism meets Institutional Design
- Fokus pada kesederhanaan, kejelasan, dan kepercayaan
- Estetika yang mirip dengan sistem ujian formal/resmi

**Core Principles:**
1. **Clarity First** - Setiap elemen memiliki tujuan jelas, tidak ada dekorasi berlebihan
2. **Strict Hierarchy** - Teks dan tombol diatur dengan presisi untuk membimbing perhatian
3. **Authoritative Tone** - Warna dan tipografi menyampaikan keserius-an dan profesionalisme
4. **Accessibility** - Kontras tinggi, ukuran font besar, navigasi intuitif

**Color Philosophy:**
- Background: Putih bersih (#FFFFFF) dengan aksen abu-abu ringan (#F5F5F5)
- Primary: Biru gelap (#1F3A93) untuk tombol dan elemen interaktif
- Warning/Violation: Merah cerah (#E63946) untuk pelanggaran dan alert
- Text: Hitam pekat (#1A1A1A) untuk readability maksimal
- Reasoning: Merah langsung mengkomunikasikan bahaya/pelanggaran tanpa ambiguitas

**Layout Paradigm:**
- Grid-based dengan spacing yang ketat (8px, 16px, 24px, 32px)
- Sidebar kiri untuk informasi ujian (waktu, nama, status)
- Area utama untuk konten ujian
- Header atas dengan logo dan timer yang selalu terlihat
- Asymmetric sections untuk membedakan area berbeda

**Signature Elements:**
1. **Red Alert Bar** - Garis merah di atas saat ada pelanggaran, dengan animasi pulse
2. **Status Indicator** - Badge di corner dengan status "NORMAL" atau "VIOLATION"
3. **Timer Display** - Angka besar dan jelas yang menunjukkan sisa waktu

**Interaction Philosophy:**
- Tombol harus terasa "berat" dan deliberate (tidak ringan)
- Hover states yang jelas dan responsif
- Feedback instan untuk setiap aksi
- Transisi smooth tapi cepat (150-200ms)

**Animation:**
- Alert entrance: Scale dari 0.95 ke 1 dengan opacity fade-in (200ms ease-out)
- Violation pulse: Red bar bergerak dari atas dengan subtle pulse effect
- Button press: Scale down 0.97 dengan shadow depth increase
- Status change: Fade transition antara states (150ms)

**Typography System:**
- Display: "Playfair Display" untuk judul (bold, elegant)
- Body: "Inter" untuk teks body dan UI (clean, readable)
- Mono: "JetBrains Mono" untuk timer dan kode (jika ada)
- Hierarchy: 32px (title) → 18px (section) → 14px (body) → 12px (small)

---

## Desain 2: Dark Mode Futuristik dengan Neon Accent (Probability: 0.07)

**Design Movement:** Cyberpunk meets Surveillance Aesthetic
- Tema gelap yang mencerminkan "monitoring" dan "control"
- Neon accents yang memberikan energi dan tension

**Core Principles:**
1. **Controlled Tension** - Warna gelap + neon bright menciptakan sense of urgency
2. **High Contrast** - Setiap elemen pop out dengan jelas dari background
3. **Tech-Forward** - Aesthetic yang terasa modern dan advanced
4. **Immersive Focus** - Dark background mengurangi distraksi eksternal

**Color Philosophy:**
- Background: Charcoal gelap (#0F0F0F) dengan gradient subtle
- Primary: Cyan neon (#00D9FF) untuk interaksi dan highlight
- Warning: Magenta neon (#FF006E) untuk pelanggaran
- Text: White (#FFFFFF) dan cyan untuk contrast
- Reasoning: Neon colors terasa "urgent" dan "monitored", cocok untuk ujian

**Layout Paradigm:**
- Centered focus area dengan border neon glow
- Floating cards dengan shadow dan glow effects
- Asymmetric placement untuk visual interest
- Diagonal accent lines sebagai divider

**Signature Elements:**
1. **Neon Glow Border** - Box shadow dengan neon color di sekitar area ujian
2. **Animated Grid Background** - Subtle grid pattern yang bergerak lambat
3. **Violation Indicator** - Neon pulse di corner dengan warning text

**Interaction Philosophy:**
- Setiap klik memberikan feedback visual yang kuat
- Hover states dengan glow intensitas yang meningkat
- Transisi smooth dengan easing yang sophisticated
- Sound feedback optional (beep untuk violation)

**Animation:**
- Glow pulse: Neon glow bergerak dari center outward (400ms ease-in-out, loop)
- Violation alert: Magenta glow flash + text slide-in dari atas (300ms)
- Button hover: Glow intensitas naik + text color shift (150ms)
- Background grid: Subtle vertical movement (infinite, 8s linear)

**Typography System:**
- Display: "Space Mono" untuk judul (bold, tech-forward)
- Body: "Roboto" untuk teks (clean, modern)
- Mono: "Courier Prime" untuk kode dan timer
- Hierarchy: 36px (title) → 20px (section) → 15px (body) → 12px (small)

---

## Desain 3: Warm Institutional dengan Soft Gradients (Probability: 0.06)

**Design Movement:** Educational Design meets Human-Centered Interface
- Terasa welcoming tapi tetap formal
- Gradients lembut yang menenangkan namun tetap professional

**Core Principles:**
1. **Approachable Authority** - Formal tapi tidak menakutkan
2. **Warm Professionalism** - Warna hangat yang membuat user nyaman
3. **Guided Experience** - Setiap elemen membimbing user ke langkah berikutnya
4. **Emotional Intelligence** - Design yang mempertimbangkan stress level user

**Color Philosophy:**
- Background: Gradient dari cream (#FFF8F0) ke light orange (#FFF0E6)
- Primary: Warm blue (#4A6FA5) untuk tombol dan interaksi
- Warning: Orange-red (#E8704A) untuk pelanggaran (warm tapi alert)
- Accent: Soft gold (#D4A574) untuk highlight
- Text: Dark brown (#3D2817) untuk warmth
- Reasoning: Warna hangat mengurangi anxiety, orange-red terasa less aggressive

**Layout Paradigm:**
- Organic asymmetric layout dengan curved dividers
- Floating cards dengan soft shadows
- Centered content dengan breathing room
- Diagonal transitions antara sections

**Signature Elements:**
1. **Soft Gradient Background** - Subtle gradient yang berubah sepanjang hari
2. **Rounded Cards** - Soft border radius (16px+) untuk approachability
3. **Warm Alert Badge** - Orange badge dengan soft shadow untuk warnings

**Interaction Philosophy:**
- Smooth, gentle transitions
- Hover states yang subtle namun responsive
- Feedback yang positive dan encouraging
- Animations yang tidak jarring atau sudden

**Animation:**
- Alert entrance: Slide-in dari atas dengan bounce (250ms cubic-bezier)
- Card hover: Lift effect dengan shadow increase (150ms ease-out)
- Button press: Gentle scale down + color shift (120ms)
- Gradient shift: Subtle color change throughout day (slow, continuous)

**Typography System:**
- Display: "Poppins" untuk judul (friendly, modern)
- Body: "Lato" untuk teks (warm, readable)
- Mono: "Source Code Pro" untuk timer dan kode
- Hierarchy: 34px (title) → 18px (section) → 15px (body) → 12px (small)

---

## Pilihan Desain

**Saya memilih: Desain 1 - Minimalis Profesional dengan Aksen Merah**

Alasan:
1. **Clarity** - Untuk ujian, kejelasan adalah prioritas utama. User harus fokus pada soal, bukan distraksi visual
2. **Authoritative** - Merah untuk violation langsung mengkomunikasikan pelanggaran tanpa ambiguitas
3. **Professional** - Terasa formal dan serius, cocok untuk konteks ujian akademik
4. **Accessibility** - Kontras tinggi dan layout grid membuat mudah dipahami
5. **Practical** - Sidebar untuk info ujian membuat user selalu tahu status mereka

Desain ini akan terasa seperti sistem ujian formal yang dipercaya, dengan pesan pelanggaran yang jelas dan tegas.
