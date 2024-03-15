# language definition

## lexis

* whitespace: `[\n\t ]+`
* NAME: `[a-zA-Z]+`
* NUMBER: `\d+(\.\d+)?`
* punctuation: `\*\*|\+\-|\+|\-|\*|\/|\=|\;|\(|\)|\<|\>|\^|\_`
* string: all other token 

## syntax

* equation-list: ( equation `;` )*
* equation: expression ( (`=` | `<` | `>`) expression )*
* expression: add
* add: mul ( (`+` | `-`) mul)*
* mul: prefixed ( (`*` | `/`) prefixed)*
* prefixed: (`+-` | `+` | `-`)? power
* power: func ( (`**` | `^`) power)?
* func: variable `(` expression `)` | subscript
* subscript: atom (`_` subscript)?
* atom: variable | number | string | group
* variable: NAME
* number: NUMBER
* string: STRING
* group: `(` expression `)`
