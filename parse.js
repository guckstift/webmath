let tokens = null;

function match(query)
{
	return tokens.length && (!query || tokens[0][query] || tokens[0].text === query);
}

function eat(query)
{
	if(match(query)) {
		let token = tokens[0];
		tokens.splice(0, 1);
		return token;
	}
}

function inc_group(e)
{
	e.grouped = e.grouped ? e.grouped + 1 : 1;
}

function placeholder()
{
	return {placeholder: true}
}

function variable()
{
	if(match("name"))
		return {variable: eat().text, level: 0};
}

function subscript()
{
	let vari = variable();

	if(!vari)
		return;

	if(eat("_")) {
		let sub = atom();

		if(!sub)
			sub = placeholder();

		return {subscript: sub, base: vari};
	}

	return vari;
}

function number()
{
	if(match("number"))
		return {number: eat().text, level: 0};
}

function string()
{
	if(match("string"))
		return {string: eat().text, level: 0};
}

function group()
{
	if(eat("(")) {
		let e = expr();

		if(!e)
			e = placeholder();

		eat(")");
		inc_group(e);
		return e;
	}
}

function atom()
{
	return subscript() || number() || string() || group();
}

function func()
{
	let backup = tokens.slice();
	let name = eat("name");

	if(name && eat("(")) {
		let arg = expr();

		if(!arg)
			arg = placeholder();

		eat(")");
		return {func: name.text, arg};
	}

	tokens = backup;
	return atom();
}

function power()
{
	const level = 1;
	let base = func();

	if(!base)
		return;

	if(!eat("**") && !eat("^"))
		return base;

	if(base.level > level)
		inc_group(base);

	let expo = power();

	if(!expo)
		expo = placeholder();

	return {power: true, base, expo, level};
}

function prefixed()
{
	const level = 2;
	let op = eat("+-") || eat("+") || eat("-");

	if(op) {
		let child = power();

		if(!child)
			child = placeholder();

		if(child.level > level && child.binop !== "/")
			inc_group(child);

		return {prefix: op.text, child, level};
	}

	return power();
}

function binop(ops, subparser, level)
{
	let left = subparser();

	while(left) {
		let op = ops.find(op => eat(op));

		if(!op)
			break;

		let right = subparser();

		if(!right)
			right = placeholder();

		if(op !== "/" && left.level > level)
			inc_group(left);

		if(op !== "/" && right.level >= level && right.binop !== "/")
			inc_group(right);

		left = {binop: op, left, right, level};
	}

	return left;
}

function mul()
{
	return binop(["*", "/"], prefixed, 10);
}

function add()
{
	return binop(["+", "-"], mul, 11);
}

function expr()
{
	return add();
}

function equ()
{
	let left = expr();
	let tail = [];

	while(left) {
		let op = eat("=") || eat("<") || eat(">");

		if(!op)
			break;

		let right = expr();

		if(!right)
			right = placeholder();

		tail.push(op.text, right);
	}

	if(tail.length)
		return {equ: true, chain: [left, ... tail]};
	else
		return left;
}

function list()
{
	let list = [];

	while(true) {
		let eq = equ();

		if(!eq)
			break;

		list.push(eq);
		eat(";")
	}

	return {list};
}

export function parse(_tokens)
{
	tokens = _tokens;
	let result = list();
	return result;
}