function renderStatusPage({
  title,
  heading,
  message,
}: {
  title: string;
  heading: string;
  message: string;
}) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { color-scheme: dark; font: 15px/1.6 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0b0b14; color: #f7f5ff; }
      * { box-sizing: border-box; }
      body { display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      main { width: 100%; max-width: 34rem; text-align: center; }
      .brand { color: #b9a3ff; font-size: .75rem; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; }
      h1 { margin: 1rem 0 .75rem; font-size: clamp(2rem, 8vw, 3rem); line-height: 1.15; }
      p { margin: 0; color: #a6a3b5; }
      a { display: inline-block; margin-top: 1.5rem; padding: .65rem 1rem; border: 1px solid #39324d; border-radius: .75rem; color: #f7f5ff; text-decoration: none; }
      a:hover { background: #191626; }
    </style>
  </head>
  <body>
    <main>
      <div class="brand">CodeForge</div>
      <h1>${heading}</h1>
      <p>${message}</p>
      <a href="/">Go to homepage</a>
    </main>
  </body>
</html>`;
}

export function renderErrorPage() {
  return renderStatusPage({
    title: "500 — Something went wrong | CodeForge",
    heading: "500 — Something went wrong",
    message: "An unexpected error occurred on our end. Please try again in a little while.",
  });
}

export function renderMaintenancePage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>503 — Maintenance in progress | CodeForge</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#070b16" />
    <meta name="robots" content="noindex, nofollow" />
    <link rel="icon" href="/Firefly_RemoveBackground.png?v=3" type="image/png" />
    <link rel="apple-touch-icon" href="/Firefly_RemoveBackground.png?v=3" />
    <style>
      :root { color-scheme: dark; font: 15px/1.6 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #070b16; color: #f8fafc; }
      * { box-sizing: border-box; }
      body { display: grid; min-height: 100vh; min-height: 100svh; place-items: center; margin: 0; padding: 32px 20px; overflow-x: hidden; background: radial-gradient(ellipse at 50% 34%, rgba(37,99,235,.18), transparent 42%), radial-gradient(ellipse at 12% 88%, rgba(99,102,241,.10), transparent 34%), #070b16; }
      body::before { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(148,163,184,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.035) 1px, transparent 1px); background-size: 48px 48px; content: ""; mask-image: linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent); }
      .orbit { position: fixed; top: 50%; left: 50%; width: min(76vw,680px); aspect-ratio: 1; border: 1px solid rgba(96,165,250,.09); border-radius: 50%; transform: translate(-50%,-50%); pointer-events: none; }
      .orbit::after { position: absolute; inset: 13%; border: 1px solid rgba(165,180,252,.09); border-radius: inherit; content: ""; }
      main { position: relative; width: 100%; max-width: 672px; padding: 52px 48px 34px; overflow: hidden; border: 1px solid rgba(255,255,255,.09); border-radius: 32px; background: rgba(2,6,23,.72); box-shadow: 0 30px 120px rgba(0,0,0,.48); text-align: center; backdrop-filter: blur(18px); }
      main::before { position: absolute; top: 0; left: 25%; width: 50%; height: 1px; background: linear-gradient(90deg,transparent,rgba(96,165,250,.8),transparent); content: ""; }
      .brand-mark { position: relative; display: grid; width: 96px; height: 96px; margin: 0 auto 30px; place-items: center; }
      .brand-mark::before,.brand-mark::after { position: absolute; border: 1px solid rgba(147,197,253,.25); border-radius: 50%; content: ""; }
      .brand-mark::before { inset: 0; border-top-color: rgba(147,197,253,.95); animation: orbit-spin 12s linear infinite; }
      .brand-mark::after { inset: 8px; border-color: rgba(165,180,252,.16); }
      .brand-mark img { position: relative; z-index: 1; width: 68px; height: 68px; border-radius: 17px; object-fit: cover; box-shadow: 0 0 38px rgba(59,130,246,.2); }
      .status { display: inline-flex; align-items: center; gap: 9px; margin-bottom: 20px; padding: 6px 14px; border: 1px solid rgba(147,197,253,.2); border-radius: 999px; background: rgba(96,165,250,.07); color: #bfdbfe; font-size: 10px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
      .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #93c5fd; box-shadow: 0 0 14px rgba(96,165,250,.9); animation: pulse 2.4s ease-in-out infinite; }
      .eyebrow { margin: 0 0 12px; color: #94a3b8; font-size: 11px; font-weight: 700; letter-spacing: .34em; text-transform: uppercase; }
      h1 { max-width: 560px; margin: 0 auto; color: #f8fafc; font-size: clamp(32px,6vw,52px); font-weight: 750; letter-spacing: -.045em; line-height: 1.12; }
      .message { max-width: 490px; margin: 20px auto 0; color: rgba(203,213,225,.78); font-size: 15px; line-height: 1.85; }
      .working { display: inline-flex; align-items: center; gap: 13px; margin-top: 32px; padding: 11px 17px; border: 1px solid rgba(255,255,255,.07); border-radius: 14px; background: rgba(255,255,255,.035); text-align: left; }
      .working-icon { display: grid; width: 36px; height: 36px; place-items: center; border-radius: 10px; background: rgba(96,165,250,.1); color: #bfdbfe; font-size: 18px; }
      .working-title { color: #e2e8f0; font-size: 12px; font-weight: 600; }
      .working-note { margin-top: 2px; color: #94a3b8; font-size: 11px; }
      footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,.07); color: #64748b; font-size: 10px; font-weight: 600; letter-spacing: .22em; text-transform: uppercase; }
      @keyframes orbit-spin { to { transform: rotate(360deg); } }
      @keyframes pulse { 0%,100% { opacity: .55; transform: scale(.92); } 50% { opacity: 1; transform: scale(1.08); } }
      @media (max-width: 540px) { main { padding: 42px 23px 28px; border-radius: 25px; } .message { font-size: 14px; } footer { margin-top: 30px; } }
      @media (prefers-reduced-motion: reduce) { .brand-mark::before,.status-dot { animation: none; } }
    </style>
  </head>
  <body>
    <div class="orbit" aria-hidden="true"></div>
    <main>
      <div class="brand-mark"><img src="/Firefly_RemoveBackground.png" alt="CodeForge official logo" /></div>
      <div class="status"><span class="status-dot" aria-hidden="true"></span>System maintenance</div>
      <p class="eyebrow">CodeForge</p>
      <h1>Something better is on its way.</h1>
      <p class="message">CodeForge is temporarily unavailable while we make improvements. We’re working behind the scenes and will be back as soon as maintenance is complete.</p>
      <div class="working">
        <div class="working-icon" aria-hidden="true">⚙</div>
        <div><div class="working-title">We’re working on it</div><div class="working-note">Thanks for your patience</div></div>
      </div>
      <footer>CodeForge - Developer Portfolio and Technical Blog</footer>
    </main>
  </body>
</html>`;
}
