import {lex} from "./lex.js";
import {parse} from "./parse.js";
import {render} from "./render.js";
import {postprocess} from "./postprocess.js";

export class MathElement extends HTMLElement
{
	constructor()
	{
		super();

		let shadow = this.shadow = this.attachShadow({mode: "closed"});
		let src = this.textContent;
		let tokens = lex(src);
		console.log(tokens);
		let ast = parse(tokens);
		console.log(ast);
		let html = render(ast);
		console.log(html);
		let root = document.createElement("math-root");
		let style = document.createElement("link");
		style.onload = () => postprocess(root);
		style.rel = "stylesheet";
		style.href = "./style.css";
		root.innerHTML = html;
		shadow.append(style);
		shadow.append(root);
	}

	update()
	{
		let src = this.textContent;
		let tokens = lex(src);
		console.log(tokens);
		let ast = parse(tokens);
		console.log(ast);
		let html = render(ast);
		console.log(html);
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