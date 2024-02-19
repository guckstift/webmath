let align_at = null;

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

function render_binop(left, op, right, toplevel)
{
	left = render(left, op !== "/" && toplevel);
	right = render(right, op !== "/" && toplevel);

	if(op === "/")
		return `<math-frac>
			<math-numer>${left}</math-numer>
			<math-hline></math-hline>
			<math-denom>${right}</math-denom>
		</math-frac>`;

	let result = left;

	if(toplevel && align_at === op)
		result += "</math-col><math-col>";

	return result + render_op(op) + right;
}

function render_func(func, arg, toplevel)
{
	if(func === "sqrt")
		return"<math-sqrt>" + render(arg) +"</math-sqrt>";

	if(func === "floor")
		return"<math-floor>" + render(arg) +"</math-floor>";

	if(func === "ceil")
		return"<math-ceil>" + render(arg) +"</math-ceil>";

	return (
		`<var>${func}</var>` +
		"<math-group>" +
		render(arg) +
		"</math-group>"
	);
}

function render_equ(chain, toplevel)
{
	let result = "";

	while(chain.length) {
		if(typeof chain[0] === "string") {
			if(toplevel && align_at === chain[0])
				result += "</math-col><math-col>";

			result += render_op(chain[0]);
		}
		else {
			result += render(chain[0], toplevel);
		}

		chain = chain.slice(1);
	}

	return result;
}

function render_group(child)
{
	return "<math-group>" + render(child) + "</math-group>";
}

function render_list(list)
{
	return list.map(line => `<math-line><math-col>${render(line, true)}</math-col></math-line>`).join("");
}

export function render(ast, toplevel = false, _align_at = null)
{
	if(_align_at !== null)
		align_at = _align_at;

	if(ast.grouped > 1)
		return render_group({...ast, grouped: 0});

	if(ast.placeholder)
		return `<span>&squ;</span>`;

	if(ast.variable)
		return `<var>${ast.variable}</var>`;

	if(ast.subscript)
		return `<span>${render(ast.base, toplevel)}<sub>${render(ast.subscript)}</sub></span>`;

	if(ast.number)
		return `<math-num>${ast.number}</math-num>`;

	if(ast.string)
		return `<span>${ast.string}</span>`;

	if(ast.binop)
		return render_binop(ast.left, ast.binop, ast.right, toplevel);

	if(ast.prefix)
		return render_op(ast.prefix, true) + render(ast.child, toplevel);

	if(ast.power)
		return `<span>${render(ast.base, toplevel)}<sup>${render(ast.expo)}</sup></span>`;

	if(ast.func)
		return render_func(ast.func, ast.arg, toplevel);

	if(ast.equ)
		return render_equ(ast.chain, toplevel);

	if(ast.list)
		return render_list(ast.list);
}