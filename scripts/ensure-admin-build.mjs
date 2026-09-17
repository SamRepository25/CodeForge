import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "src", "routes", "_authenticated", "admin.tsx");
const source = fs.readFileSync(file, "utf8");
const duplicate = `\nfunction Metric({ label, value }: { label: string; value: number }) { return <div className="glass rounded-2xl p-5"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 font-display text-3xl font-bold gradient-text">{value}</div></div>; }`;
const count = source.split(duplicate).length - 1;

if (count === 0) {
  console.log("Admin Metric declaration: already clean");
} else if (count === 2) {
  fs.writeFileSync(file, source.replace(duplicate, ""), "utf8");
  console.log("Admin Metric declaration: removed duplicate");
} else {
  throw new Error(`Expected exactly 0 or 2 identical Metric declarations, found ${count}`);
}
