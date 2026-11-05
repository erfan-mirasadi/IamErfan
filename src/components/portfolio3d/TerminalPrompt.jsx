// zsh prompt in the oh-my-zsh "robbyrussell" style of a macOS Terminal: "➜  ~ "
export default function TerminalPrompt({ failed = false }) {
  return (
    <span aria-hidden="true">
      <span className={`mac-term-arrow${failed ? " is-failed" : ""}`}>➜</span>
      {"  "}
      <span className="mac-term-dir">~</span>{" "}
    </span>
  );
}
