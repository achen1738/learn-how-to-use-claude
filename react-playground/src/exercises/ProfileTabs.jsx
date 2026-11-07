import { createContext, useContext, useState, useRef } from "react";

/**
 * SENIOR REACT INTERVIEW EXERCISE — Profile Tabs: Compound Component API
 * ------------------------------------------------------------------
 * Time: ~35-45 minutes
 *
 * Unlike a list-of-items-plus-mock-API exercise, this one is about
 * component composition and API design. `Tabs` / `Tabs.List` / `Tabs.Tab`
 * / `Tabs.Panels` / `Tabs.Panel` below are a compound component: they
 * share state implicitly via Context instead of the parent passing props
 * down to each child explicitly. Basic click-to-switch tabs already work
 * correctly — the exercise is to bring the API and behavior up to what a
 * real design-system component would need.
 *
 * Ask the candidate to narrate their reasoning before coding — in
 * particular, why Context (rather than cloneElement/prop-drilling) is a
 * reasonable choice here, and what re-render cost it has.
 *
 * ------------------------------------------------------------------
 * TASKS (roughly increasing difficulty)
 * ------------------------------------------------------------------
 * 1. ROVING TABINDEX + ARROW KEYS: Follow the WAI-ARIA "tabs" pattern —
 *    only the active tab button should be in the normal Tab order
 *    (tabIndex 0), every other tab button should have tabIndex -1.
 *    With a tab focused, ArrowRight/ArrowLeft should move focus to the
 *    next/previous tab AND activate it (Home/End jump to first/last).
 *
 * 2. CONTROLLED + UNCONTROLLED DUAL API: `Tabs` currently only supports
 *    uncontrolled usage via `defaultValue`. Add support for controlled
 *    usage too (`value` + `onValueChange` props), the way a real
 *    component library (Radix, Headless UI) does it, so this file's
 *    `ProfileTabs` could go either way without changing `Tabs` itself.
 *
 * 3. LAZY MOUNT, THEN KEEP ALIVE: Right now every `Tabs.Panel` mounts
 *    immediately regardless of whether it's active (open devtools and
 *    check). Change it so a panel's content only mounts the FIRST time
 *    its tab is selected — but once mounted, keep it mounted (just
 *    hidden) on subsequent switches, so scroll position and any local
 *    state inside a panel survive switching away and back.
 *
 * 4. DYNAMIC TABS: Make the tab list editable at runtime (see the
 *    commented-out "add/remove tab" UI below — wire it up). Closing the
 *    currently ACTIVE tab needs to fall back sensibly to a neighboring
 *    tab, not to an undefined/blank state.
 *
 * 5. ACCESSIBILITY: Wire up the full ARIA tabs pattern — `role="tablist"`
 *    on the list, `role="tab"` + `aria-selected` + `aria-controls` on
 *    each tab button, `role="tabpanel"` + `aria-labelledby` on each
 *    panel, and matching `id`s tying each tab to its panel.
 *
 * 6. STRETCH: `Tabs.Tab` and `Tabs.Panel` currently match up by matching
 *    array position (implicit). Switch them to matching by an explicit
 *    `value` prop instead (like `<Tabs.Tab value="billing">`), so tabs
 *    and panels can be reordered or rendered from separate lists
 *    without silently pairing the wrong ones together. Discuss what
 *    breaks today if a candidate reorders the panels but not the tabs.
 * ------------------------------------------------------------------
 * No mock API and no data array here on purpose — the state that
 * matters is which tab is active, not a list of records.
 * ------------------------------------------------------------------
 */

const TabsContext = createContext(null);

function useTabsContext(componentName) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`${componentName} must be rendered inside <Tabs>`);
  }
  return context;
}

function Tabs({ activeValue, onValueChange, clickedTabs, children }) {
  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue: onValueChange, clickedTabs }}>
      <div style={styles.tabsRoot}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ children }) {
  const ret = useTabsContext();
  return <div style={styles.tabList}>{children}</div>;
}

function Tab({ index, children }) {
  const { activeValue, setActiveValue } = useTabsContext("Tabs.Tab");
  const isActive = activeValue === index;
  const focusRef = useRef(null);
  const handleKeyDown = (e) => {
    // if (!isActive) return;
    if (e.key === "ArrowRight") {
      setActiveValue((activeValue + 1) % 3);
    } else if (e.key === "ArrowLeft") {
      setActiveValue((activeValue - 1 + 3) % 3);
    } else if (e.key === "Home") {
      setActiveValue(0);
    } else if (e.key === "End") {
      setActiveValue(2);
    }
  };

  if (isActive) {
    focusRef.current?.focus();
  }

  return (
    <button
      tabIndex={isActive ? 0 : -1}
      ref={focusRef}
      onKeyDown={handleKeyDown}
      onClick={() => setActiveValue(index)}
      style={isActive ? { ...styles.tab, ...styles.tabActive } : styles.tab}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }) {
  return <div style={styles.panels}>{children}</div>;
}

function TabPanel({ index, children }) {
  const { activeValue, clickedTabs } = useTabsContext("Tabs.Panel");
  if (!clickedTabs.has(index)) return null;
  return <div style={activeValue === index ? styles.panel : styles.hidden}>{children}</div>;
}

Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

// ------------------------------------------------------------------
// Demo usage — this is the "real app" screen exercising the compound
// component above. Feel free to add UI here (e.g. add/remove tab
// controls for TASK 4) but the interesting work is in Tabs itself.
// ------------------------------------------------------------------
export default function ProfileTabs() {
  const [tabs, setTabs] = useState([
    { id: 0, label: "Profile", text: "Update your name, email, and avatar." },
    { id: 1, label: "Notifications", text: "Choose which emails you'd like to receive." },
    { id: 2, label: "Billing", text: "Manage your plan and payment method." },
  ]);
  const [uuid, setUuid] = useState(3); // for generating unique IDs for new tabs
  const [activeTab, setActiveTab] = useState(0);
  const [clickedTabs, setClickedTabs] = useState(new Set([0]));

  const onValueChange = (newValue) => {
    setActiveTab(newValue);
    setClickedTabs((prev) => new Set(prev).add(newValue));
  };

  const handleAddTab = (e) => {
    const formData = new FormData(e.target);
    const labelValue = formData.get("label");
    const textValue = formData.get("text");
    setTabs((prevTabs) => [...prevTabs, { id: uuid, label: labelValue, text: textValue }]);
    setUuid((prev) => prev + 1);
    onValueChange(uuid); // Set the new tab as active
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Account Settings</h2>

      <Tabs activeValue={activeTab} onValueChange={onValueChange} clickedTabs={clickedTabs}>
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab index={tab.id}>{tab.label}</Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panels>
          {tabs.map((tab) => (
            <Tabs.Panel index={tab.id}>
              <p style={styles.panelText}>{tab.text}</p>
            </Tabs.Panel>
          ))}
        </Tabs.Panels>
      </Tabs>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddTab(e);
        }}
        style={{ marginTop: 12 }}
      >
        <input type="text" name="label" placeholder="Add a new tab label" />
        <input type="text" name="text" placeholder="Add a new tab text" />
        <button type="submit">Add Tab</button>
      </form>
    </div>
  );
}

const styles = {
  hidden: {
    display: "none",
  },
  container: {
    maxWidth: 420,
    margin: "40px auto",
    fontFamily: "system-ui, sans-serif",
  },
  heading: {
    fontSize: 16,
    marginBottom: 12,
  },
  tabsRoot: {
    border: "1px solid #eee",
    borderRadius: 6,
    overflow: "hidden",
  },
  tabList: {
    display: "flex",
    borderBottom: "1px solid #eee",
    background: "#fafafa",
  },
  tab: {
    flex: 1,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 600,
    color: "#888",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
  },
  tabActive: {
    color: "#111",
    borderBottom: "2px solid #007bff",
  },
  panels: {
    padding: "14px 12px",
  },
  panel: {
    fontSize: 13,
  },
  panelText: {
    margin: 0,
    color: "#555",
  },
};
