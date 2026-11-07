// Dummy data for a File Tree exercise.
//
// Three shapes of the same project are exported, for different variants of the
// challenge:
//
//   FILE_TREE        nested: folders have `children`         render / expand / collapse
//   FLAT_FILES       flat list with `parentId`, shuffled     build the tree yourself first
//   fetchChildren()  async, one folder at a time             lazy loading with spinners
//
// Node shape:
//   folder: { id, name, type: "folder", modified, children: [...] }
//   file:   { id, name, type: "file", size (bytes), modified }
//
// Edge cases included on purpose:
//   - empty folders                       (public/fonts, src/legacy)
//   - deep nesting (7 levels)             src/features/billing/components/invoice/line-items/LineItem.tsx
//   - the same file name in many folders  index.ts, README.md
//   - dotfiles and files with no extension (.gitignore, .env.example, Dockerfile, LICENSE)
//   - children NOT sorted                 sort folders first, then A→Z, yourself
//   - names differing only in case        Button.tsx vs button.test.tsx
//   - long names and unicode              a very long migration file, résumé-template.pdf, 日本語.md
//   - a large folder (30 files)           src/assets/icons
//   - a 0-byte file and a very large one  .gitkeep, demo-recording.mp4

const file = (id, name, size, modified) => ({ id, name, type: "file", size, modified });
const folder = (id, name, modified, children) => ({ id, name, type: "folder", modified, children });

const ICON_NAMES = [
  "arrow-down",
  "arrow-left",
  "arrow-right",
  "arrow-up",
  "bell",
  "calendar",
  "check",
  "chevron-down",
  "chevron-up",
  "clock",
  "close",
  "copy",
  "credit-card",
  "download",
  "edit",
  "external-link",
  "eye",
  "filter",
  "folder",
  "heart",
  "home",
  "info",
  "lock",
  "mail",
  "menu",
  "plus",
  "search",
  "settings",
  "trash",
  "user",
];

export const FILE_TREE = [
  folder("root", "acme-dashboard", "2026-10-12T18:04:00Z", [
    folder("src", "src", "2026-10-12T18:04:00Z", [
      file("src-main", "main.tsx", 412, "2026-03-02T10:00:00Z"),
      file("src-app", "App.tsx", 2318, "2026-10-12T18:04:00Z"),
      file("src-index", "index.ts", 96, "2026-01-15T09:30:00Z"),
      folder("components", "components", "2026-10-09T14:22:00Z", [
        folder("button", "Button", "2026-08-30T11:00:00Z", [
          file("button-tsx", "Button.tsx", 1874, "2026-08-30T11:00:00Z"),
          file("button-test", "button.test.tsx", 2210, "2026-08-30T11:05:00Z"),
          file("button-css", "Button.module.css", 940, "2026-07-18T16:40:00Z"),
          file("button-index", "index.ts", 38, "2026-02-01T08:00:00Z"),
        ]),
        folder("modal", "Modal", "2026-10-09T14:22:00Z", [
          file("modal-tsx", "Modal.tsx", 3402, "2026-10-09T14:22:00Z"),
          file("modal-hook", "useFocusTrap.ts", 1288, "2026-09-21T13:15:00Z"),
          file("modal-index", "index.ts", 37, "2026-02-01T08:00:00Z"),
        ]),
        folder("table", "DataTable", "2026-06-11T10:10:00Z", [
          file("table-tsx", "DataTable.tsx", 6120, "2026-06-11T10:10:00Z"),
          file("table-sort", "sortRows.ts", 845, "2026-06-11T10:02:00Z"),
          file("table-pagination", "Pagination.tsx", 1730, "2026-05-28T15:45:00Z"),
          file("table-index", "index.ts", 41, "2026-02-01T08:00:00Z"),
        ]),
        file("components-readme", "README.md", 1502, "2026-04-04T12:00:00Z"),
      ]),
      folder("features", "features", "2026-10-11T09:00:00Z", [
        folder("billing", "billing", "2026-10-11T09:00:00Z", [
          folder("billing-components", "components", "2026-10-11T09:00:00Z", [
            folder("invoice", "invoice", "2026-10-11T09:00:00Z", [
              folder("line-items", "line-items", "2026-10-11T09:00:00Z", [
                file("line-item", "LineItem.tsx", 2044, "2026-10-11T09:00:00Z"),
                file("line-item-list", "LineItemList.tsx", 1590, "2026-10-10T17:30:00Z"),
                file("line-items-index", "index.ts", 72, "2026-09-02T08:00:00Z"),
              ]),
              file("invoice-view", "InvoiceView.tsx", 4388, "2026-10-08T12:12:00Z"),
              file("invoice-totals", "InvoiceTotals.tsx", 1206, "2026-10-01T09:45:00Z"),
            ]),
            file("plan-picker", "PlanPicker.tsx", 3150, "2026-09-14T11:20:00Z"),
          ]),
          file("billing-api", "api.ts", 2780, "2026-09-30T16:00:00Z"),
          file("billing-types", "types.ts", 1104, "2026-09-30T15:40:00Z"),
          file("billing-index", "index.ts", 120, "2026-09-02T08:00:00Z"),
        ]),
        folder("auth", "auth", "2026-07-07T07:07:00Z", [
          file("auth-login", "LoginForm.tsx", 2967, "2026-07-07T07:07:00Z"),
          file("auth-context", "AuthContext.tsx", 1840, "2026-06-30T10:30:00Z"),
          file("auth-session", "session.ts", 1322, "2026-06-29T18:00:00Z"),
          file("auth-index", "index.ts", 88, "2026-02-01T08:00:00Z"),
        ]),
      ]),
      folder("hooks", "hooks", "2026-08-19T13:00:00Z", [
        file("hook-debounce", "useDebounce.ts", 512, "2026-03-11T10:00:00Z"),
        file("hook-local", "useLocalStorage.ts", 1034, "2026-08-19T13:00:00Z"),
        file("hook-media", "useMediaQuery.ts", 640, "2026-05-05T09:09:00Z"),
      ]),
      folder("utils", "utils", "2026-09-25T08:30:00Z", [
        file("utils-format", "formatCurrency.ts", 702, "2026-09-25T08:30:00Z"),
        file("utils-date", "dates.ts", 1890, "2026-08-08T14:00:00Z"),
        file("utils-format-test", "formatCurrency.test.ts", 1455, "2026-09-25T08:31:00Z"),
      ]),
      folder("assets", "assets", "2026-05-20T12:00:00Z", [
        folder(
          "icons",
          "icons",
          "2026-05-20T12:00:00Z",
          // Deliberately not alphabetical, so sorting is visible.
          [...ICON_NAMES]
            .reverse()
            .map((name, i) =>
              file(`icon-${name}`, `${name}.svg`, 280 + ((i * 97) % 900), "2026-05-20T12:00:00Z"),
            ),
        ),
        file("logo", "logo.svg", 4120, "2026-01-03T09:00:00Z"),
        file("hero", "hero@2x.png", 845_231, "2026-02-14T10:00:00Z"),
      ]),
      folder("legacy", "legacy", "2025-11-30T23:59:00Z", []),
      folder("i18n", "i18n", "2026-04-22T08:00:00Z", [
        file("i18n-en", "en.json", 18_204, "2026-04-22T08:00:00Z"),
        file("i18n-fr", "fr.json", 19_870, "2026-04-20T08:00:00Z"),
        file("i18n-ja", "日本語.md", 2_048, "2026-04-18T08:00:00Z"),
      ]),
    ]),
    folder("public", "public", "2026-02-14T10:00:00Z", [
      file("favicon", "favicon.ico", 15_086, "2025-12-01T00:00:00Z"),
      file("robots", "robots.txt", 68, "2025-12-01T00:00:00Z"),
      folder("fonts", "fonts", "2026-02-14T10:00:00Z", []),
      folder("docs-public", "downloads", "2026-02-14T10:00:00Z", [
        file("resume", "résumé-template.pdf", 96_512, "2026-02-14T10:00:00Z"),
        file("demo-video", "demo-recording.mp4", 1_288_490_188, "2026-02-10T16:20:00Z"),
      ]),
    ]),
    folder("db", "db", "2026-09-01T12:00:00Z", [
      folder("migrations", "migrations", "2026-09-01T12:00:00Z", [
        file("mig-1", "20250101_create_users.sql", 1_204, "2025-01-01T00:00:00Z"),
        file(
          "mig-3",
          "20260901_add_billing_address_and_tax_region_columns_to_customers_table.sql",
          2_988,
          "2026-09-01T12:00:00Z",
        ),
        file("mig-2", "20250615_create_invoices.sql", 2_310, "2025-06-15T00:00:00Z"),
        file("mig-keep", ".gitkeep", 0, "2025-01-01T00:00:00Z"),
      ]),
      file("seed", "seed.ts", 4_096, "2026-08-08T08:08:00Z"),
    ]),
    folder("docs", "docs", "2026-10-02T15:00:00Z", [
      file("docs-readme", "README.md", 3_310, "2026-10-02T15:00:00Z"),
      file("docs-arch", "architecture.md", 9_802, "2026-09-12T11:00:00Z"),
      file("docs-adr", "adr-0001-use-react-query.md", 2_456, "2026-03-03T09:00:00Z"),
    ]),
    file("pkg", "package.json", 1_842, "2026-10-12T17:50:00Z"),
    file("lock", "package-lock.json", 412_778, "2026-10-12T17:50:00Z"),
    file("tsconfig", "tsconfig.json", 640, "2026-01-02T00:00:00Z"),
    file("readme", "README.md", 4_200, "2026-09-30T10:00:00Z"),
    file("gitignore", ".gitignore", 132, "2025-12-01T00:00:00Z"),
    file("env-example", ".env.example", 288, "2026-06-01T00:00:00Z"),
    file("dockerfile", "Dockerfile", 702, "2026-07-15T00:00:00Z"),
    file("license", "LICENSE", 1_067, "2025-12-01T00:00:00Z"),
  ]),
];

// The same nodes as a flat list, like a database or API would return them.
// Folders have no `children` here; the root's parentId is null. The order is
// shuffled (deterministically) so you can't rely on parents coming first.
function flatten(node, parentId = null, out = []) {
  const { children, ...rest } = node;
  out.push({ ...rest, parentId });
  for (const child of children ?? []) flatten(child, node.id, out);
  return out;
}

function shuffled(items, seed = 42) {
  const result = [...items];
  let state = seed;
  const random = () => (state = (state * 1_103_515_245 + 12_345) % 2 ** 31) / 2 ** 31;
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const FLAT_FILES = shuffled(flatten(FILE_TREE));

// Lazy-loading variant: resolves with a folder's direct children after a
// random 300–1000ms delay. Child folders come back WITHOUT their children, so
// you have to call fetchChildren again when the user expands them. Pass
// { failRate: 0.3 } to simulate network errors.
const byId = new Map(flatten(FILE_TREE).map((node) => [node.id, node]));
const childrenById = new Map();
(function index(node) {
  if (node.type !== "folder") return;
  childrenById.set(node.id, node.children);
  node.children.forEach(index);
})(FILE_TREE);

export function fetchChildren(folderId, { failRate = 0 } = {}) {
  const delay = 300 + Math.random() * 700;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failRate) {
        reject(new Error(`Failed to load "${byId.get(folderId)?.name ?? folderId}"`));
      } else if (!childrenById.has(folderId)) {
        reject(new Error(`No folder with id "${folderId}"`));
      } else {
        resolve(childrenById.get(folderId).map(({ children, ...node }) => node));
      }
    }, delay);
  });
}

/** The root folder without its children, as a starting point for fetchChildren. */
export const ROOT = (({ children, ...root }) => root)(FILE_TREE);
