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

export function render_node(node, toplevel = false)
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

export function render(ast, _align_at = "")
{
	align_at = _align_at.split(/\s+/);
	return `<math-root>${render_node(ast)}</math-root>`;
}
