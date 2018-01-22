# This project is not maintained

# minilangjs
A tiny compiler for a small language written entirely in < 1k lines of Javascript.

## Why?

The minilang compiler is to show how a programming language is implemented through all the steps of compilation:

1. lexing
2. parsing
3. symbol table building
4. typec checking
5. code generation

Since we try to keep the implementation under 1k lines we keep the language small and the following constructs are available:

* if statements:
``` 
if true do
  some work
else
  some other work
end
```

* while statements:
```
while i < 10 do
i = i +1;
end
```

* variable declarations:
`var x:int = 5`

* operators: `*,-,/,+,%,&&,!=,==, <,>`

* print statement: `print (4*4*4);`

For example here is euclids algorithm implemented in minilang.
```
var t:int = 0;
var u:int = 561;
var v:int = 11;
while 0 < v do
  t = u;
  u = v;
  v = t % v;
end
if u < 0 do
  print 0-u;
else
  print u;
end
```

## Usage

From the minilang directory run: `node compiler.js <path to minilang file>`

This will compile and execute the code.

There is also a `displayAST` method in the parser which will output to the console the ast of a program in dot notation.
