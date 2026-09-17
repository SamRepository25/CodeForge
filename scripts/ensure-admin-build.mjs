import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "src", "routes", "_authenticated", "admin.tsx");
let source = fs.readFileSync(file, "utf8");

// Keep the existing production build guard for the historical duplicate Metric.
const duplicate = `\nfunction Metric({ label, value }: { label: string; value: number }) { return <div className="glass rounded-2xl p-5"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 font-display text-3xl font-bold gradient-text">{value}</div></div>; }`;
const count = source.split(duplicate).length - 1;

if (count === 2) {
  source = source.replace(duplicate, "");
  console.log("Admin Metric declaration: removed duplicate");
} else if (count === 0) {
  console.log("Admin Metric declaration: already clean");
} else {
  throw new Error(`Expected exactly 0 or 2 identical Metric declarations, found ${count}`);
}

// The Admin Control Center is kept as one existing route file. This idempotent
// preparation step wires the Devices panel into that route without duplicating
// the large generated admin source in this migration commit.
const devicesImport = 'import { DevicesPanel } from "@/components/DevicesPanel";';
if (!source.includes(devicesImport)) {
  const anchor = 'import { SecurityTab } from "@/components/SecurityTab";';
  if (!source.includes(anchor)) throw new Error("Admin SecurityTab import anchor not found");
  source = source.replace(anchor, `${anchor}\n${devicesImport}`);
}

const devicesNav = '["devices", "Devices", Monitor],';
if (!source.includes(devicesNav)) {
  const anchor = '["export", "Export", Download], ["trash", "Trash / Recovery", Archive], ["profile", "Admin Profile", Users],';
  if (!source.includes(anchor)) throw new Error("Admin navigation anchor not found");
  source = source.replace(anchor, `${anchor}\n  ${devicesNav}`);
}

// Monitor is deliberately imported only when the Devices nav item is injected.
if (source.includes(devicesNav) && !source.includes("  Monitor,")) {
  const anchor = "  MessageCircle,\n";
  if (!source.includes(anchor)) throw new Error("Admin lucide import anchor not found");
  source = source.replace(anchor, `${anchor}  Monitor,\n`);
}

const devicesRender = '{tab === "devices" && <DevicesPanel />}';
if (!source.includes(devicesRender)) {
  const anchor = '{tab === "profile" && <ProfilePanel userId={user?.id ?? ""} />}';
  if (!source.includes(anchor)) throw new Error("Admin panel render anchor not found");
  source = source.replace(anchor, `${anchor}\n      ${devicesRender}`);
}

fs.writeFileSync(file, source, "utf8");
console.log("Admin Devices integration: ready");
