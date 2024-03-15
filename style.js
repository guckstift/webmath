export let style = `
* ,
*:before ,
*:after {
	box-sizing: border-box;
	display: inline-block;
}

:host {
	font-size: 16px;
	line-height: 1;
}

:host(math-block) {
	display: block;
}

:host(math-inline) {
	display: inline-block;
}

math-line {
	white-space: nowrap;
}

math-line:not(:last-child) {
	display: block;
	margin-bottom: 0.5em;
}

math-line * {
	--background-color: rgba(255, 0, 0, 0.125);
}

math-op {
	margin: 0 0.25em;
}

math-prefix {
    margin-right: 0.25em;
}

sup, sub, math-frac {
	vertical-align: 0;
}

sup, sub,
:is(math-frac, sup, sub) math-frac {
	font-size: 0.75em;
}

:is(sup, sub, math-frac math-frac)
:is(sup, sub, math-frac)
:is(sup, sub, math-frac) {
	font-size: 1em;
}

math-numer ,
math-denom {
	display: block;
	text-align: center;
	padding: 0 0.25em;
}

math-numer {
	padding-bottom: 1px;
	border-bottom: 1px solid currentColor;
}

math-denom {
	padding-top: 1px;
}

math-sqrt {
	--height: 1em;
	--offset: calc(0.125em + var(--height) * 0.375);
	position: relative;
	padding-left: calc(var(--offset));
	padding-right: 0.125em;
	padding-top: 1px;
	margin-bottom: 0.125em;
}

math-sqrt:before ,
math-sqrt:after {
	display: block;
	position: absolute;
	content: "";
}

math-sqrt:before {
	left: 0;
	bottom: 0;
	height: 50%;
	width: 0.125em;
	border-top: 1px solid currentColor;
	border-right: 1px solid currentColor;
	transform-origin: top left;
	transform: skewX(atan(1/4));
}

math-sqrt:after {
	left: calc(0.125em + var(--height) * 0.125 - 1px);
	bottom: 0;
	height: 100%;
	width: calc(100% - var(--offset) + 1px);
	border-top: 1px solid currentColor;
	border-left: 1px solid currentColor;
	transform-origin: bottom left;
	transform: skewX(atan(-1/4));
}

math-group {
	position: relative;
	padding: 0 0.25em;
	margin: 0 0.125em;
}

math-group:before ,
math-group:after {
	content: "";
	display: block;
	position: absolute;
	top: -2px;
	bottom: -2px;
	width: 0.5em;
	border: 1px solid currentColor;
	border-color: transparent currentColor;
	border-radius: 100% / min(50%, 1em);
}

math-group:before {
	left: 0;
	border-right: none;
	border-top-right-radius: 0;
	border-bottom-right-radius: 0;
}

math-group:after {
	right: 0;
	border-left: none;
	border-top-left-radius: 0;
	border-bottom-left-radius: 0;
}

math-floor ,
math-ceil {
	padding: 0 0.25em;
	position: relative;
}

math-floor {
	padding-bottom: 1px;
}

math-ceil {
	padding-top: 1px;
}

math-floor:before ,
math-floor:after ,
math-ceil:before ,
math-ceil:after {
	content: "";
	display: block;
	position: absolute;
	width: 0.25em;
	top: 0;
	bottom: 0;
}

math-floor:before ,
math-floor:after {
	border-bottom: 1px solid currentColor;
}

math-ceil:before ,
math-ceil:after {
	border-top: 1px solid currentColor;
}

math-floor:before ,
math-ceil:before {
	left: 0;
	border-left: 1px solid currentColor;
}

math-floor:after ,
math-ceil:after {
	right: 0;
	border-right: 1px solid currentColor;
}

math-col:first-child:not(:last-child) {
	text-align: right;
}
`;
