webmath.js: style.js component.js render.js lex.js parse.js postprocess.js
	rollup component.js --file webmath.js --format iife --output.name webmath

style.js: style.css
	echo "export let style = \`" > style.js
	cat style.css >> style.js
	echo "\`;" >> style.js

watch:
	while true; do make webmath.js; inotifywait -qre close_write .; done

.PHONY: watch
