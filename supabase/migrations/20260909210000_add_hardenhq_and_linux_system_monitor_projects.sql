-- Add recent projects to the CodeForge portfolio
INSERT INTO public.projects (
  title,
  slug,
  description,
  long_description,
  tags,
  category,
  github_url,
  live_url,
  featured,
  order_index
)
VALUES
(
  'HardenHQ',
  'hardenhq',
  'A modern website security analyzer that checks HTTPS, security headers, cookies, redirects, and server exposure to provide a security score with actionable recommendations.',
  'HardenHQ is a full-stack web security analysis platform built with Next.js, TypeScript, Tailwind CSS, FastAPI, Python, and Upstash Redis. It combines practical security checks with production protections such as SSRF defenses, redirect validation, rate limiting, secure admin sessions, and restricted CORS.',
  ARRAY['Next.js', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'Python', 'Security'],
  'Cybersecurity',
  'https://github.com/SamRepository25/HardenHQ',
  'https://hardenhq.onrender.com',
  false,
  90
),
(
  'Linux System Monitor',
  'linux-system-monitor',
  'A modular terminal-based Linux system monitor written in C that provides real-time CPU, memory, disk, process, network, and system information.',
  'Linux System Monitor is a low-level systems programming project inspired by tools such as top and htop. It reads Linux /proc and /sys filesystems through POSIX APIs, supports live refresh, process sorting and control, logging, configuration files, and modular terminal output, and is compatible with Linux and WSL2.',
  ARRAY['C17', 'Linux', 'POSIX', 'GNU Make', 'Systems Programming'],
  'Systems Programming',
  'https://github.com/SamRepository25/Linux-System-Monitor',
  NULL,
  false,
  91
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  long_description = EXCLUDED.long_description,
  tags = EXCLUDED.tags,
  category = EXCLUDED.category,
  github_url = EXCLUDED.github_url,
  live_url = EXCLUDED.live_url,
  featured = EXCLUDED.featured,
  order_index = EXCLUDED.order_index,
  updated_at = now();
