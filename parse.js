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

function variable()
{
	if(match("name"))
		return {variable: eat().text};
}

function number()
{
	if(match("number"))
		return {number: eat().text};
}

function group()
{
	if(eat("(")) {
		let e = expr();

		if(!e)
			throw `expected expression after ( got "${tokens[0]}"`;

		if(!eat(")"))
			throw `expected ) after expression got "${tokens[0]}"`;

		e.grouped = e.grouped ? e.grouped + 1 : 1;
		return e;
	}
}

function atom()
{
	return variable() || number() || group();
}

function func()
{
	let backup = tokens.slice();
	let name = eat("name");

	if(name && eat("(")) {
		let arg = expr();

		if(!arg)
			throw `expected argument after ( got "${tokens[0]}"`;

		if(!eat(")"))
			throw `expected ) after argument, got "${tokens[0]}"`;

		return {func: name.text, arg};
	}

	tokens = backup;
	return atom();
}

function power()
{
	let base = func();

	if(!base)
		return;

	if(!eat("**"))
		return base;

	let expo = power();

	if(!expo)
		throw `expected right side after ** got "${tokens[0]}"`;

	return {power: true, base, expo};
}

function prefixed()
{
	let op = eat("+-") || eat("+") || eat("-");

	if(op) {
		let child = power();

		if(!child)
			throw `expected expression after ${op.text} got "${tokens[0]}"`;

		return {prefix: op.text, child};
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
			throw `expected right side after ${op.text} got "${tokens[0]}"`;

		if(op !== "/" && left.type === "binop" && left.level > level)
			left = {type: "group", child: left}

		if(op !== "/" && right.type === "binop" && right.level >= level)
			right = {group: right}

		left = {binop: op, left, right, level};
	}

	return left;
}

function mul()
{
	return binop(["*", "/"], prefixed, 0);
}

function add()
{
	return binop(["+", "-"], mul, 1);
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
			throw `expected right side after ${op.text} got "${tokens[0]}"`;

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

		if(!eat(";"))
			break;
	}

	return {list};
}

export function parse(_tokens)
{
	tokens = _tokens;
	let result = list();

	if(tokens.length)
		throw `unconsumed token "${tokens[0]}"`;

	return result;
}