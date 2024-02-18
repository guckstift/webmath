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

		sup.style.verticalAlign = (sup_rect.bottom - base_rect.y - 2 * font_size / 3) + "px";
	}
	else if(elm.matches("math-frac")) {
		let frac = elm;
		let parent = frac.parentElement;

		while(parent.matches("math-group") || parent.matches("math-sqrt"))
			parent = parent.parentElement;

		let op = parent ? parent.querySelector("math-op") : null;

		if(op) {
			let line = frac.querySelector(":scope > math-hline");
			let line_rect = line.getBoundingClientRect();
			let op_rect = op.getBoundingClientRect();

			frac.style.verticalAlign = (line_rect.y + line_rect.bottom) / 2 - (op_rect.y + op_rect.bottom) / 2 + "px";
		}
		else {
			let frac_rect = frac.parentElement.getBoundingClientRect();
			let parent_rect = frac.getBoundingClientRect();

			frac.style.verticalAlign = parent_rect.bottom - frac_rect.bottom + "px";
		}
	}
	else if(elm.matches("math-sqrt")) {
		let sqrt = elm;
		let base_size = parseFloat(getComputedStyle(sqrt).fontSize) + 1;
		let sqrt_rect = sqrt.getBoundingClientRect();
		let scale = sqrt_rect.height / base_size;

		sqrt.style.setProperty("--scale", scale);
	}
}