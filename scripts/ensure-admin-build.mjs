
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "src", "routes", "_authenticated", "admin.tsx");

let source = fs.readFileSync(file, "utf8");
const newline = source.includes("\r\n") ? "\r\n" : "\n";

// Keep the existing production build guard for the historical duplicate Metric.
const duplicate = `\nfunction Metric({ label, value }: { label: string; value: number }) { return <div className="glass rounded-2xl p-5"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 font-display text-3xl font-bold gradient-text">{value}</div></div>; }`;

const count = source.split(duplicate).length - 1;

if (count === 2) {
  source = source.replace(duplicate, "");
  console.log("Admin Metric declaration: removed duplicate");
} else if (count === 1) {
  console.log("Admin Metric declaration: already clean");
} else if (count === 0) {
  console.log("Admin Metric declaration: already clean");
} else {
  throw new Error(`Unexpected Metric declaration count: ${count}`);
}

// The Admin Control Center remains in the existing route file.
// This idempotent preparation step wires the Devices panel into that route
// for both development and production builds.

const devicesImport =
  'import { DevicesPanel } from "@/components/DevicesPanel";';

if (!source.includes(devicesImport)) {
  const anchor =
    'import { SecurityTab } from "@/components/SecurityTab";';

  if (!source.includes(anchor)) {
    throw new Error("Admin SecurityTab import anchor not found");
  }

  source = source.replace(
    anchor,
    `${anchor}${newline}${devicesImport}`
  );
}

// Add the Devices navigation item.
const devicesNav = '["devices", "Devices", Monitor],';

if (!source.includes(devicesNav)) {
  const anchor =
    '["export", "Export", Download], ["trash", "Trash / Recovery", Archive], ["profile", "Admin Profile", Users],';

  if (!source.includes(anchor)) {
    throw new Error("Admin navigation anchor not found");
  }

  source = source.replace(
    anchor,
    `${anchor}${newline}  ${devicesNav}`
  );
}

// Ensure Monitor is imported from lucide-react.
// Match the MessageCircle import regardless of line-ending format.
if (
  source.includes(devicesNav) &&
  !/^[ \t]*Monitor,[ \t]*$/m.test(source)
) {
  const anchor = /^([ \t]*)MessageCircle,[ \t]*$/m;

  if (!anchor.test(source)) {
    throw new Error("Admin lucide import anchor not found");
  }

  source = source.replace(
    anchor,
    (line, indentation) =>
      `${line}${newline}${indentation}Monitor,`
  );
}

// Render the Devices panel when its navigation tab is selected.
const devicesRender =
  '{tab === "devices" && <DevicesPanel />}';

if (!source.includes(devicesRender)) {
  const anchor =
    '{tab === "profile" && <ProfilePanel userId={user?.id ?? ""} />}';

  if (!source.includes(anchor)) {
    throw new Error("Admin panel render anchor not found");
  }

  source = source.replace(
    anchor,
    `${anchor}${newline}      ${devicesRender}`
  );
}

// Write the updated Admin route.
fs.writeFileSync(file, source, "utf8");

console.log("Admin Devices integration: ready");