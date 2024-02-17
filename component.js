import {lex} from "./lex.js";
import {parse} from "./parse.js";
import {render} from "./render.js";
import {postprocess} from "./postprocess.js";

export class MathElement extends HTMLElement
{
	constructor()
	{
		super();

		let shadow = this.attachShadow({mode: "closed"});
		let src = this.innerHTML;
		let tokens = lex(src);
		let ast = parse(tokens);
		console.log(ast);
		let html = render(ast);
		let root = document.createElement("math-root");
		let style = document.createElement("link");
		style.onload = () => postprocess(root);
		style.rel = "stylesheet";
		style.href = "./style.css";
		root.innerHTML = html;
		shadow.append(style);
		shadow.append(root);
	}

	static register()
	{
		customElements.define("math-block", MathElement);
	}
}