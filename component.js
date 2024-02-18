import {lex} from "./lex.js";
import {parse} from "./parse.js";
import {render} from "./render.js";
import {postprocess} from "./postprocess.js";

export class MathElement extends HTMLElement
{
	constructor()
	{
		super();

		this.shadow = this.attachShadow({mode: "closed"});
		this.update();
	}

	update()
	{
		let src = this.textContent;
		//console.log(src);
		let tokens = lex(src);
		//console.log(tokens);
		let ast = parse(tokens);
		console.log(ast);
		let html = render(ast, false, "=");
		//console.log(html);
		let root = document.createElement("math-root");
		let style = document.createElement("link");
		style.onload = () => postprocess(root);
		style.rel = "stylesheet";
		style.href = "./style.css";
		root.innerHTML = html;
		this.shadow.innerHTML = "";
		this.shadow.append(style);
		this.shadow.append(root);
	}

	static register()
	{
		customElements.define("math-block", MathElement);
	}
}