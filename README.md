# webmath - a math rendering web component

*webmath* is a work-in-progress library similar to MathJax or KaTeX. It takes math formula code written in plain ASCII text and renders HTML for it and styles it.

Formulas are written in a JavaScript-like source language. An approach that is somewhat similar to AsciiMath.

webmath is used as a Web Component. Two custom HTML elements are defined `<math-block>` and `<math-inline>`. Inside of them you can notate the formula source code.

To enable the webmath web components, just include the `webmath.js` file in the header of your page (but not as `type=module`) and start adding math-blocks.

Examples can be found in `index.html`.
