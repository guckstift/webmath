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

export function parse(tokens)
{
	tokenbuf = tokens.slice();
	return list();
}
