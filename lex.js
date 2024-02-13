export const patterns = {
	_white:    /\s+/,
	name:      /[a-zA-Z]+/,
	number:    /\d+(\.\d+)?/,
	operator:  /\+\-|\*\*|[\+\-\*\/\=]/,
	lparen:    /\(/,
	rparen:    /\)/,
	semicolon: /;/,
	supernum:  /[⁰¹²³⁴⁵⁶⁷⁸⁹]+/,
};

export const converters = {
	supernum: text => [
		Token("operator", "**"),
		Token("number", [...text].map(char => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(char)).join("")),
	],
};

export function Token(name, text) {
	return {name, text};
}

export function lex(src)
{
	for(const [name, pattern] of Object.entries(patterns))
		if(!pattern.source.startsWith("^"))
			patterns[name] = new RegExp("^(" + pattern.source + ")");

	const tokens = [];

	while(src) {
		let best_match = "";
		let best_name = null;

		for(const [name, pattern] of Object.entries(patterns)) {
			const match = src.match(pattern);

			if(match && match[0].length > best_match.length) {
				best_match = match[0];
				best_name = name;
			}
		}

		if(!best_name)
			throw `unknown token "${src[0]}"`;

		const name = best_name;
		const text = best_match;
		const token = {name, text};

		if(!name.startsWith("_")) {
			if(converters[name])
				tokens.push(...converters[name](text));
			else
				tokens.push(token);
		}

		src = src.slice(text.length);
	}

	return tokens;
}