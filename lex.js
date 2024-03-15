export function lex(src)
{
	let tokens = [];
	let match = [""];

	while(src = src.slice(match[0].length)) {
		if(match = src.match(/^[\n\t ]+/)) {
			// ignore
		}
		else if(match = src.match(/^[a-zA-Z]+/)) {
			tokens.push({name: match[0]});
		}
		else if(match = src.match(/^\d+(\.\d+)?/)) {
			tokens.push({number: match[0]});
		}
		else if(match = src.match(/^(\*\*|\+\-|\+|\-|\*|\/|\=|\;|\(|\)|\<|\>|\^|\_)/)) {
			tokens.push({punct: match[0]});
		}
		else if(match = src.match(/^[⁰¹²³⁴⁵⁶⁷⁸⁹]+/)) {
			let text = [...match[0]].map(char => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(char)).join("");
			tokens.push({punct: "**"}, {number: text});
		}
		else if(match = [src[0]]) {
			if(tokens.length && tokens[tokens.length - 1].string)
				tokens[tokens.length - 1].string += match[0];
			else
				tokens.push({string: match[0]});
		}
	}

	return tokens;
}