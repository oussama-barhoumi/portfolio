// BlobGhostButton.jsx
// Usage: import BlobGhostButton from './BlobGhostButton'
// Requires: Tailwind CSS + Syne font (add to your index.html or globals.css)
// <link href="https://fonts.googleapis.com/css2?family=Syne:wght@500;600&display=swap" rel="stylesheet">

const BLOBS = {
    sm: {
        width: 130,
        height: 52,
        viewBox: "0 0 130 52",
        path: "M14,8 C26,1 48,4 66,5 C84,6 106,2 118,10 C128,17 132,27 127,37 C122,47 108,52 88,53 C68,54 44,55 26,52 C8,49 -1,41 1,31 C3,21 6,13 14,8 Z",
    },
    md: {
        width: 155,
        height: 56,
        viewBox: "0 0 155 56",
        path: "M18,9 C34,2 60,5 80,6 C100,7 126,3 140,12 C152,19 156,31 151,41 C146,51 130,57 108,58 C86,59 58,60 38,57 C18,54 2,47 1,36 C0,25 6,14 18,9 Z",
    },
    lg: {
        width: 190,
        height: 66,
        viewBox: "0 0 190 66",
        path: "M22,12 C44,3 78,7 102,8 C126,9 156,5 172,15 C186,23 190,38 185,50 C180,62 162,68 138,69 C114,70 80,71 56,68 C32,65 6,57 2,45 C-3,33 4,20 22,12 Z",
    },
};

const FONT_SIZES = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
};

export default function BlobGhostButton({
    children = "Learn more",
    size = "md",       // "sm" | "md" | "lg"
    onClick,
    className = "",
}) {
    const blob = BLOBS[size];
    const fontSize = FONT_SIZES[size];

    return (
        <button
            onClick={onClick}
            style={{
                width: blob.width,
                height: blob.height,
                fontFamily: "'Matemasie', sans-serif",
            }}
            className={`
        relative cursor-pointer bg-transparent border-none p-0
        font-semibold tracking-wide
        transition-all duration-300 ease-out
        group
        ${className}
      `}
        >
            {/* Blob SVG border */}
            <svg
                viewBox={blob.viewBox}
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-1 group-active:scale-95"
                aria-hidden="true"
            >
                <path
                    d={blob.path}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-gray-300 group-hover:text-gray-800 transition-colors duration-300"
                />
            </svg>

            {/* Label */}
            <span
                className={`
          relative z-10 flex items-center justify-center w-full h-full
          text-gray-400 group-hover:text-gray-900
          transition-colors duration-300
          ${fontSize}
        `}
            >
                {children}
            </span>
        </button>
    );
}


// ─── DEMO / PREVIEW ────────────────────────────────────────────────────────────
// Remove this export if you only want the button component above.

export function BlobGhostButtonDemo() {
    return (
        <div
            style={{ fontFamily: "'Matemasie', sans-serif" }}
            className="flex flex-col gap-10 p-12 bg-white min-h-screen"
        >
            {/* Sizes */}
            <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-5">
                    Sizes
                </p>
                <div className="flex flex-wrap items-center gap-6">
                    <BlobGhostButton size="sm">Small</BlobGhostButton>
                    <BlobGhostButton size="md">Medium</BlobGhostButton>
                    <BlobGhostButton size="lg">Large</BlobGhostButton>
                </div>
            </div>

            {/* Portfolio use-cases */}
            <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-5">
                    Portfolio examples
                </p>
                <div className="flex flex-wrap items-center gap-6">
                    <BlobGhostButton size="sm">Learn more</BlobGhostButton>
                    <BlobGhostButton size="md">All projects</BlobGhostButton>
                    <BlobGhostButton size="md">About me</BlobGhostButton>
                    <BlobGhostButton size="lg">View case study →</BlobGhostButton>
                </div>
            </div>
        </div>
    );
}