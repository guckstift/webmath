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
	else if(elm.matches("sub")) {
		let sub = elm;
		let base = sub.previousElementSibling;
		let sub_rect = sub.getBoundingClientRect();
		let base_rect = base.getBoundingClientRect();
		let font_size = parseFloat(getComputedStyle(sub).fontSize);

		sub.style.verticalAlign = (sub_rect.y - base_rect.bottom + 2 * font_size / 3) + "px";
	}
	else if(elm.matches("math-frac")) {
		let frac = elm;
		let parent = frac.parentElement;
		let op = null

		while(true) {
			op = parent.querySelector(":scope > math-op, :scope > math-col > math-op");

			if(!op && parent.matches("math-group, math-sqrt, math-floor, math-ceil, math-col"))
				parent = parent.parentElement;
			else
				break;
		}

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
	else if(elm.matches("math-line")) {
		let i = 0;

		for(let col of elm.querySelectorAll(":scope > math-col")) {
			let col_var = "--col-" + i + "-width";
			let col_rect = col.getBoundingClientRect();
			let root = elm.closest("math-root");
			let width = parseFloat(root.style.getPropertyValue(col_var) || 0);
			width = Math.max(col_rect.width, width);
			root.style.setProperty(col_var, width + "px");
			col.style.minWidth = "var(" + col_var + ")";
			i ++;
		}
	}
}