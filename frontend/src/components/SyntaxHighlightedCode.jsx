import React, { useRef, useEffect } from "react";

import "highlight.js/styles/github-dark.css";

const SyntaxHighlightedCode = ({ className = '', children, ...props }) => {
      const ref = useRef(null)

    useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current)

            // hljs won't reprocess the element unless this attribute is removed
            ref.current.removeAttribute('data-highlighted')
        }
    }, [ props.className, props.children ])

  return (
    <code ref={ref} className={className} {...props}>
      {children}
    </code>
  );
};

export default SyntaxHighlightedCode;