export function lex(src)
{
	let tokens = [];

	while(src) {
		let match = null;
		let token = null;

		if(/^[\n\t ]/.test(src)) {
			src = src.slice(1);
		}
		else if(match = src.match(/^[a-zA-Z]+/)) {
			token = "name";
		}
		else if(match = src.match(/^\d+(\.\d+)?/)) {
			token = "number";
		}
		else if(match = src.match(/^(\*\*|\+\-|\+|\-|\*|\/|\=|\;|\(|\)|\<|\>)/)) {
			token = "punct";
		}
		else if(match = src.match(/^[⁰¹²³⁴⁵⁶⁷⁸⁹]+/)) {
			tokens.push({type: "punct", text: "**"});
			match[0] = [...match[0]].map(char => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(char)).join("");
			token = "number";
		}
		else {
			throw `unknown token "${src[0]}"`;
		}

		if(token) {
			tokens.push({type: token, text: match[0]});
			src = src.slice(match[0].length);
		}
	}

	return tokens;
}