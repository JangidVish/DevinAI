import React, { useRef, useEffect } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

const SyntaxHighlightedCode = ({ className = '', children, ...props }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      if (className && className.startsWith("language-")) {
        hljs.highlightElement(ref.current);
      } else {
        const result = hljs.highlightAuto(children?.toString() ?? "");
        ref.current.innerHTML = result.value;
      }
    }
  }, [children, className]);

  return (
    <code ref={ref} className={className} {...props}>
      {children}
    </code>
  );
};

export default SyntaxHighlightedCode;