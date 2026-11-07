import "./Tooltip.css";

// 09 · Tooltip. The full prompt is in README.md in this folder.
// Write all styles in Tooltip.css. Prefix classes with "tooltip".

// TODO: implement this. Right now it ignores content and position.
export function Tooltip({ content, position = "top", children }) {
  return children;
}

// Demo page. Add class names for the layout as needed.
export function TooltipDemo() {
  return (
    <div className="tooltip-demo">
      <h2>Tooltip</h2>
      <p>See README.md for the prompt.</p>

      <h3>Positions</h3>
      <div className="tooltip-demo__row">
        <Tooltip content="On top" position="top">
          <button type="button">Top</button>
        </Tooltip>
        <Tooltip content="On the right" position="right">
          <button type="button">Right</button>
        </Tooltip>
        <Tooltip content="Underneath" position="bottom">
          <button type="button">Bottom</button>
        </Tooltip>
        <Tooltip content="On the left" position="left">
          <button type="button">Left</button>
        </Tooltip>
      </div>

      <h3>Icon button and long text</h3>
      <div className="tooltip-demo__row">
        <Tooltip content="Copy link">
          <button type="button" aria-label="Copy link">
            🔗
          </button>
        </Tooltip>
        <Tooltip
          content="This tooltip has a much longer description that should wrap onto several lines instead of stretching across the whole screen."
          position="bottom"
        >
          <button type="button">Long tooltip</button>
        </Tooltip>
        <span>
          Inline text with a{" "}
          <Tooltip content="A word with a definition">
            <a href="#definition">linked word</a>
          </Tooltip>{" "}
          in the middle of a sentence.
        </span>
      </div>

      <h3>Near the right edge (stretch: flip)</h3>
      <div className="tooltip-demo__row tooltip-demo__row--end">
        <Tooltip content="I should flip to the left instead of going off screen" position="right">
          <button type="button">Edge</button>
        </Tooltip>
      </div>

      <h3>Inside overflow: hidden (stretch: portal)</h3>
      <div className="tooltip-demo__clip">
        <Tooltip content="Am I cut off?" position="top">
          <button type="button">Clipped?</button>
        </Tooltip>
      </div>
    </div>
  );
}
