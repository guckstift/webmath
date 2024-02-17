export function postprocess(elm)
{
	for(const child of elm.children) {
		postprocess(child);
	}

	if(elm.matches("sup")) {
		let sup = elm;
		let base = sup.previousElementSibling;
		let sup_rect = sup.getBoundingClientRect();
		let base_rect = base.getBoundingClientRect();
		let font_size = parseFloat(getComputedStyle(sup).fontSize);

		elm.style.verticalAlign = (sup_rect.bottom - base_rect.y - 2 * font_size / 3) + "px";
	}
	else if(elm.matches("math-frac")) {
		let frac = elm;
		let op = [].find.call(frac.parentElement.children, c => c.matches("math-op"));

		if(op) {
			let line = frac.querySelector(":scope > math-hline");
			let line_rect = line.getBoundingClientRect();
			let op_rect = op.getBoundingClientRect();

			frac.style.verticalAlign = (line_rect.y + line_rect.bottom) / 2 - (op_rect.y + op_rect.bottom) / 2 + "px";
		}
		else {
			let fract_rect = frac.parentElement.getBoundingClientRect();
			let parent_rect = frac.getBoundingClientRect();

			frac.style.verticalAlign = parent_rect.bottom - fract_rect.bottom + "px";
		}
	}
}