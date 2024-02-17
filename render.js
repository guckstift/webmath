function render_op(op)
{
	if(op === "+-")
		return "<math-op>&plusmn;</math-op>";
	if(op === "-")
		return "<math-op>&minus;</math-op>";
	if(op === "*")
		return "<math-op>&middot;</math-op>";
	if(op === "<")
		return "<math-op>&lt;</math-op>";
	if(op === ">")
		return "<math-op>&gt;</math-op>";
	return `<math-op>${op}</math-op>`;
}

function render_binop(left, op, right)
{
	left = render(left);
	right = render(right);

	if(op === "/")
		return `<math-frac>
			<math-numer>${left}</math-numer>
			<math-hline></math-hline>
			<math-denom>${right}</math-denom>
		</math-frac>`;

	return left + render_op(op) + right;
}

function render_func(func, arg)
{
	if(func === "sqrt")
		return (
			"<math-sqrt>" +
			"<math-sqrt-stroke1></math-sqrt-stroke1>" +
			"<math-sqrt-stroke2></math-sqrt-stroke2>" +
			"<math-radicand>" +
			render(arg) +
			"</math-radicand></math-sqrt>"
		);

	return (
		`<var>${func}</var>` +
		"<math-group>" +
		render(arg) +
		"</math-group>"
	);
}

function render_equ(chain)
{
	let result = "";

	while(chain.length) {
		if(typeof chain[0] === "string")
			result += render_op(chain[0]);
		else
			result += render(chain[0]);

		chain = chain.slice(1);
	}

	return result;
}

function render_group(child)
{
	return "<math-group>" + render(child) + "</math-group>";
}

export function render(ast)
{
	if(ast.grouped > 1)
		return render_group({...ast, grouped: ast.grouped - 1});

	if(ast.variable)
		return `<var>${ast.variable}</var>`;

	if(ast.number)
		return `<math-num>${ast.number}</math-num>`;

	if(ast.binop)
		return render_binop(ast.left, ast.binop, ast.right);

	if(ast.prefix)
		return render_op(ast.prefix) + render(ast.child);

	if(ast.power)
		return `${render(ast.base)}<sup>${render(ast.expo)}</sup>`;

	if(ast.func)
		return render_func(ast.func, ast.arg);

	if(ast.group)
		return render_group(ast.group);

	if(ast.equ)
		return render_equ(ast.chain);

	if(ast.list)
		return ast.list.map(line => `<math-line>${render(line)}</math-line>`).join("");
}