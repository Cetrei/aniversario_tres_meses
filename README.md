# 🌸 Tercer Aniversario — Guía de Despliegue

Proyecto 100% estático. Se despliega **gratis** en Cloudflare Pages.

---

## 1. Setup local (primera vez)

```powershell
# Desde D:\Projects\Personal\tercer_aniversario
npm install
npm run dev
```

Abre `http://localhost:5173`.

---

## 2. Preparar las imágenes

Las fotos van en `public/images/` como `.webp`. Las originales están en `.dev/sourceImages/`.

**Con ImageMagick:**
```powershell
New-Item -ItemType Directory -Force -Path public\images

Get-ChildItem ".dev\sourceImages\*" -Include "*.jpg","*.jpeg","*.png" | ForEach-Object {
    magick $_.FullName -quality 82 -resize "1200x1200>" "public\images\$($_.BaseName).webp"
    Write-Host "✓ $($_.BaseName).webp"
}
```

**Sin ImageMagick:** Convierte en https://squoosh.app y guarda en `public/images/` con el mismo nombre base + `.webp`.

---

## 3. Build para producción

```powershell
npm run build
```

Genera la carpeta `dist/`.

---

## 4. Despliegue en Cloudflare Pages (gratis)

### Opción A — Git (recomendado)

1. Sube el proyecto a GitHub (público o privado).
2. Ve a [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Selecciona el repo y configura:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Save and Deploy**.

Cada push a `main` redespliega automáticamente. URL gratis tipo `*.pages.dev`.

### Opción B — Upload directo (sin Git)

1. Ejecuta `npm run build` localmente.
2. Ve a Cloudflare Pages → **Create** → **Pages** → **Upload assets**.
3. Arrastra el contenido de la carpeta `dist/`.

---

## 5. Personalización

Todo el contenido editable está en **`src/config.ts`**:

| Campo | Qué hace |
|---|---|
| `loveLetter[]` | Párrafos de la carta |
| `photos[]` | Rutas y captions de la galería |
| `buseta` | Los 15 pasajeros con emoji o imagen |
| `dateIdeas[]` | Ideas para la ruleta de citas |
| `anniversaryDate` | Fecha de inicio del contador |

Para añadir una foto nueva:
1. Pon el `.webp` en `public/images/`
2. Agrega la entrada en `CONFIG.photos` en `config.ts`

---

## Estructura del proyecto

```
tercer_aniversario/
├── public/
│   ├── favicon.svg
│   └── images/              ← Fotos reales aquí (.webp)
├── src/
│   ├── components/
│   │   ├── SakuraTree.tsx   ← Árbol fractal + contador fuera del canvas
│   │   ├── SmileSlider.tsx  ← Onda SVG rAnimFrame, inicial en 0
│   │   ├── Buseta.tsx       ← Layout exacto 15 asientos
│   │   ├── Gallery.tsx      ← Polaroids + blobs ambientales + partículas
│   │   ├── DateRoulette.tsx ← Ruleta de citas
│   │   └── FadeInSection.tsx← Scroll bidireccional
│   ├── config.ts            ← TODA la data personal
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```
