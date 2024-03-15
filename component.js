import {lex} from "./lex.js";
import {parse} from "./parse.js";
import {render} from "./render.js";
import {postprocess} from "./postprocess.js";
import {style} from "./style.js";

let stylesheet = new CSSStyleSheet();

stylesheet.replaceSync(style);

export class MathElement extends HTMLElement
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

export class MathBlock extends MathElement
{
}

export class MathInline extends MathElement
{
}

customElements.define("math-block", MathBlock);
customElements.define("math-inline", MathInline);
