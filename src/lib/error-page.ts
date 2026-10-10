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
  return renderStatusPage({
    title: "503 — Maintenance in progress | CodeForge",
    heading: "We’ll be back soon",
    message:
      "CodeForge is temporarily unavailable while maintenance is in progress. Please check back shortly.",
  });
}
