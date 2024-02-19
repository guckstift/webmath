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
		else if(match = src.match(/^(\*\*|\+\-|\+|\-|\*|\/|\=|\;|\(|\)|\<|\>|\^|\_)/)) {
			token = "punct";
		}
		else if(match = src.match(/^[⁰¹²³⁴⁵⁶⁷⁸⁹]+/)) {
			tokens.push({punct: "**", text: "**"});
			match[0] = [...match[0]].map(char => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(char)).join("");
			token = "number";
		}
		else {
			token = "string";
			match = [src[0]];

			if(tokens.length && tokens[tokens.length - 1].string) {
				tokens[tokens.length - 1].text += match[0];
				token = null;
				src = src.slice(1);
			}
		}

		if(token) {
			tokens.push({[token]: match[0], text: match[0]});
			src = src.slice(match[0].length);
		}
	}

	return tokens;
}