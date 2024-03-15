var webmath = (function (exports) {
	'use strict';

	function lex(src)
	{
		let tokens = [];
		let match = [""];

		while(src = src.slice(match[0].length)) {
			if(match = src.match(/^[\n\t ]+/)) ;
			else if(match = src.match(/^[a-zA-Z]+/)) {
				tokens.push({name: match[0]});
			}
			else if(match = src.match(/^\d+(\.\d+)?/)) {
				tokens.push({number: match[0]});
			}
			else if(match = src.match(/^(\*\*|\+\-|\+|\-|\*|\/|\=|\;|\(|\)|\<|\>|\^|\_)/)) {
				tokens.push({punct: match[0]});
			}
			else if(match = src.match(/^[⁰¹²³⁴⁵⁶⁷⁸⁹]+/)) {
				let text = [...match[0]].map(char => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(char)).join("");
				tokens.push({punct: "**"}, {number: text});
			}
			else if(match = [src[0]]) {
				if(tokens.length && tokens[tokens.length - 1].string)
					tokens[tokens.length - 1].string += match[0];
				else
					tokens.push({string: match[0]});
			}
		}

		return tokens;
	}

	let tokenbuf = null;

	function peek()
	{
		return tokenbuf[0] || {};
	}

	function tokenval(token)
	{
		return Object.values(token)[0];
	}

	function match(query)
	{
		return !query || peek()[query] || tokenval(peek()) === query;
	}

	function eat(query)
	{
		return match(query) && tokenbuf.length && tokenval(tokenbuf.shift());
	}

	function placeholder()
	{
		return {placeholder: true}
	}

	function variable()
	{
		return match("name") && {variable: eat()};
	}

	function number()
	{
		return match("number") && {number: eat()};
	}

	function string()
	{
		return match("string") && {string: eat()};
	}

	function group()
	{
		if(!eat("("))
			return;

		let group = expr() || placeholder();
		eat(")");
		return {group};
	}

	function atom()
	{
		return variable() || number() || string() || group();
	}

	function subscript()
	{
		let base = atom();

		if(!base)
			return;

		if(!eat("_"))
			return base;

		return {subscript: subscript() || placeholder(), base};
	}

	function func()
	{
		let backup = tokenbuf.slice();
		let func = variable();

		if(!func || !eat("(")) {
			tokenbuf = backup;
			return subscript();
		}

		let arg = expr() || placeholder();
		eat(")");
		return {func, arg};
	}

	function power()
	{
		let base = func();

		if(!base || !eat("**") && !eat("^"))
			return base;

		let expo = power() || placeholder();
		return {base, expo};
	}

	function prefixed()
	{
		let prefix = eat("+-") || eat("+") || eat("-");

		if(!prefix)
			return power();

		let child = power() || placeholder();
		return {prefix, child};
	}

	function binop(ops, subparser)
	{
		let left = subparser();

		while(left) {
			let binop = ops.find(op => eat(op));

			if(!binop)
				break;

			let right = subparser() || placeholder();
			left = {binop, left, right};
		}

		return left;
	}

	function mul()
	{
		return binop(["*", "/"], prefixed);
	}

	function add()
	{
		return binop(["+", "-"], mul);
	}

	function expr()
	{
		return add();
	}

	function equ()
	{
		let chain = [expr()];

		if(!chain[0])
			return;

		while(match("=") || match("<") || match(">"))
			chain.push(eat(), expr() || placeholder());

		return chain.length === 1 ? chain[0] : {equ: chain};
	}

	function list()
	{
		let list = [];
		let eq = equ();

		while(eq) {
			list.push(eq);
			eat(";");
			eq = equ();
		}

		return {list};
	}

	function parse(tokens)
	{
		tokenbuf = tokens.slice();
		return list();
	}

	let align_at = [];

	function render_group(group, force = false)
	{
		if(!force && group.binop === "/")
			return render_node(group);

		return `<math-group>${render_node(group)}</math-group>`;
	}

	function render_subscript(base, subscript, toplevel)
	{
		return `${render_node(base, toplevel)}<sub>${render_node(subscript.group ?? subscript)}</sub>`;
	}

	function render_func(func, arg, toplevel)
	{
		if(func.variable) {
			if(func.variable === "sqrt")
				return `<math-sqrt>${render_node(arg)}</math-sqrt>`;
			if(func.variable === "floor")
				return `<math-floor>${render_node(arg)}</math-floor>`;
			if(func.variable === "ceil")
				return `<math-ceil>${render_node(arg)}</math-ceil>`;
		}

		return `${render_node(func, toplevel)}<math-group>${render_node(arg)}</math-group>`;
	}

	function render_power(base, expo, toplevel)
	{
		let result = "";

		if(base.group)
			result += render_group(base.group, true);
		else
			result += render_node(base, toplevel);

		result += `<sup>${render_node(expo.group ?? expo)}</sup>`;
		return result;
	}

	function render_op(op, isprefix = false)
	{
		let tag = isprefix ? "math-prefix" : "math-op";

		if(op === "+-")
			return `<${tag}>&plusmn;</${tag}>`;
		if(op === "-")
			return `<${tag}>&minus;</${tag}>`;
		if(op === "*")
			return `<${tag}>&middot;</${tag}>`;
		if(op === "<")
			return `<${tag}>&lt;</${tag}>`;
		if(op === ">")
			return `<${tag}>&gt;</${tag}>`;

		return `<${tag}>${op}</${tag}>`;
	}

	function render_frac(left, right)
	{
		left = render_node(left.group ?? left);
		right = render_node(right.group ?? right);
		return `<math-frac><math-numer>${left}</math-numer><math-denom>${right}</math-denom></math-frac>`;
	}

	function render_binop(left, op, right, toplevel)
	{
		if(op === "/")
			return render_frac(left, right);

		left = render_node(left, toplevel);
		right = render_node(right, toplevel);
		return left + (toplevel && align_at.includes(op) ? "</math-col><math-col>" : "") + render_op(op) + right;
	}

	function render_equ(chain, toplevel)
	{
		let result = "";

		for(let i=0; i < chain.length; i++) {
			if(typeof chain[i] === "string") {
				if(toplevel && align_at.includes(chain[i]))
					result += "</math-col><math-col>";

				result += render_op(chain[i]);
			}
			else {
				result += render_node(chain[i], toplevel);
			}
		}

		return result;
	}

	function render_node(node, toplevel = false)
	{
		if(node.placeholder)
			return `<span>&squ;</span>`;

		if(node.variable)
			return `<var>${node.variable}</var>`;

		if(node.number)
			return `<math-num>${node.number}</math-num>`;

		if(node.string)
			return `<span>${node.string}</span>`;

		if(node.group)
			return render_group(node.group);

		if(node.subscript)
			return render_subscript(node.base, node.subscript, toplevel);

		if(node.func)
			return render_func(node.func, node.arg, toplevel);

		if(node.expo)
			return render_power(node.base, node.expo, toplevel);

		if(node.prefix)
			return render_op(node.prefix, true) + render_node(node.child, toplevel);

		if(node.binop)
			return render_binop(node.left, node.binop, node.right, toplevel);

		if(node.equ)
			return render_equ(node.equ, toplevel);

		if(node.list)
			return node.list.map(line => `<math-line><math-col>${render_node(line, true)}<math-col></math-line>`).join("");
	}

	function render(ast, _align_at = "")
	{
		align_at = _align_at.split(/\s+/);
		return `<math-root>${render_node(ast)}</math-root>`;
	}

	function postprocess(elm)
	{
		for(const child of elm.children) {
			postprocess(child);
		}

		if(!elm.matches)
			return;

		if(elm.matches("sup")) {
			let sup = elm;
			let base = sup.previousElementSibling;
			let sup_rect = sup.getBoundingClientRect();
			let base_rect = base.getBoundingClientRect();
			let font_size = parseFloat(getComputedStyle(base).fontSize);

			sup.style.verticalAlign = (sup_rect.bottom - base_rect.y - font_size / 2) + "px";
		}
		else if(elm.matches("sub")) {
			let sub = elm;
			let base = sub.previousElementSibling;
			let sub_rect = sub.getBoundingClientRect();
			let base_rect = base.getBoundingClientRect();
			let font_size = parseFloat(getComputedStyle(base).fontSize);

			sub.style.verticalAlign = (sub_rect.y - base_rect.bottom + font_size / 2) + "px";
		}
		else if(elm.matches("math-frac")) {
			let frac = elm;
			let parent = frac.parentElement;
			let op = null;

			while(true) {
				op = parent.querySelector(":scope > math-op, :scope > math-col > math-op");

				if(!op && parent.matches("math-group, math-sqrt, math-floor, math-ceil, math-col"))
					parent = parent.parentElement;
				else
					break;
			}

			if(op) {
				let denom = frac.querySelector(":scope > math-denom");
				let denom_rect = denom.getBoundingClientRect();
				let op_rect = op.getBoundingClientRect();

				frac.style.verticalAlign = denom_rect.y - (op_rect.y + op_rect.bottom) / 2 - 0.5 + "px";
			}
			else {
				let frac_rect = frac.parentElement.getBoundingClientRect();
				let parent_rect = frac.getBoundingClientRect();

				frac.style.verticalAlign = parent_rect.bottom - frac_rect.bottom + "px";
			}
		}
		else if(elm.matches("math-sqrt")) {
			let sqrt = elm;
			let sqrt_rect = sqrt.getBoundingClientRect();

			sqrt.style.setProperty("--height", sqrt_rect.height + "px");
		}
		else if(elm.matches("math-line")) {
			let i = 0;

			for(let col of elm.querySelectorAll(":scope > math-col")) {
				let col_var = `--col-${i}-width`;
				let col_rect = col.getBoundingClientRect();
				let root = elm.closest("math-root");
				let width = parseFloat(root.style.getPropertyValue(col_var) || 0);
				width = Math.max(col_rect.width, width);
				root.style.setProperty(col_var, width + "px");
				col.style.minWidth = "var(" + col_var + ")";
				i ++;
			}
		}
	}

	let style = `
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

	let stylesheet = new CSSStyleSheet();

	stylesheet.replaceSync(style);

	class MathElement extends HTMLElement
	{
		static observedAttributes = ["align-at"];

		constructor()
		{
			super();

			this.state = "ready";
			this.attachShadow({mode: "open"});
			this.shadowRoot.adoptedStyleSheets = [stylesheet];

			this.mutation_observer = new MutationObserver((records, obs) => {
				this.state = "invalid";
				this.update();
			});

			this.resize_observer = new ResizeObserver((entries, obs) => {
				for(const entry of entries) {
					if(
						this.state === "rendered" &&
						entry.borderBoxSize[0].blockSize && entry.borderBoxSize[0].inlineSize
					)
						this.update();
				}
			});

			this.mutation_observer.observe(this, {childList: true, characterData: true});
			this.resize_observer.observe(this, {box: "border-box"});
		}

		connectedCallback()
		{
			this.update();
		}

		disconnectedCallback()
		{
			this.mutation_observer.disconnect();
		}

		attributeChangedCallback(name, oldval, newval)
		{
			this.state = "invalid";
			this.update();
		}

		update()
		{
			if(this.state === "invalid")
				this.update_content();

			if(this.state === "rendered")
				this.update_metrics();
		}

		update_content()
		{
			let src = this.textContent;
			let align_at = this.getAttribute("align-at") ?? "";
			let tokens = lex(src);
			let ast = parse(tokens);
			let html = render(ast, align_at);

			this.shadowRoot.innerHTML = html;
			this.compiled_src = src;
			this.state = "rendered";
		}

		update_metrics()
		{
			postprocess(this.shadowRoot);
			this.state = "ready";
		}
	}

	class MathBlock extends MathElement
	{
	}

	class MathInline extends MathElement
	{
	}

	customElements.define("math-block", MathBlock);
	customElements.define("math-inline", MathInline);

	exports.MathBlock = MathBlock;
	exports.MathElement = MathElement;
	exports.MathInline = MathInline;

	return exports;

})({});
