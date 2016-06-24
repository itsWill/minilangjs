/* jshint multistr: true */
(function(){'use strict';}());

var SymbolTable = require('../src/symtab');
var requires = require('../src/parser');
var Parser = requires.Parser;

describe('Symbol Table', function(){
  var symtab;
  var parser = new Parser();

  beforeEach(function(){
    symtab = new SymbolTable();
  });

  it("has an empty scope for an empty program", function(){
    var ast = parser.parse('');
    symtab.build(ast.nodes);
    expect(symtab.pop().table).toEqual({});
  });

  it("stores the symbol and type of a delcaration", function(){
    var ast = parser.parse("var x:int = 3;");
    symtab.build(ast.nodes);
    expect(symtab.getSymbol('x')).toEqual('int');
  });

  it("doens't allow variables to be redeclared", function(){
    var ast = parser.parse("var x:int = 4; var x:float = 3.0;");
    expect(function(){symtab.build(ast.nodes);}).toThrow(new Error("can't redeclare variable x"));
  });

  it("finds a symbol in the parent scope", function(){
    var ast = parser.parse("var i:int = 0; while i < 10 do i = i + 1; end");
    symtab.build(ast.nodes);
    var whileNode = ast.nodes[1];
    expect(whileNode.scope.table.i).toBeUndefined();
    expect(whileNode.scope.getSymbol('i')).toEqual('int');
  });

  it("doesn\'t allow redeclaring a symbol in a nested scope", function(){
    var ast = parser.parse("var i:int = 0; while i < 10 do var i:float = 0.0; end");
    expect(function(){symtab.build(ast.nodes);}).toThrow(new Error("can't redeclare variable i"));
  });

  it("doesn't allow variable redeclaration in multiple nested scopes", function(){
    var ast = parser.parse("var i:int = 0; while i < 10 do while i < 5 do var i:float = 0.0; end end");
    expect(function(){symtab.build(ast.nodes);}).toThrow(new Error("can't redeclare variable i"));
  });

  it("doesn't find variables in child scopes", function(){
    var ast = parser.parse("while i < 10 do var j:int = 0; end");
    symtab.build(ast.nodes);
    expect(ast.nodes[0].scope.getSymbol('j')).toEqual('int');
    expect(symtab.getSymbol("j")).toBeUndefined();
  });

  it("links the scope table to an identifier node", function(){
    var ast = parser.parse("var j:int = i + 3;");
    symtab.build(ast.nodes);
    var idNode = ast.nodes[0].right.left;
    expect(idNode.scope).not.toBeUndefined();
  });

  it("links the scope table to an identifier node in nested scopes", function(){
    var ast = parser.parse("while i < 10 do while i < 5 do var j:int = i + 5; end end");
    symtab.build(ast.nodes);
    var secondWhileId = ast.nodes[0].stmts[0].stmts[0].right.left;
    expect(secondWhileId.scope).not.toBeUndefined();
  });

  it("links the scope to an indetifier in a conditional expression", function(){
    var ast = parser.parse("if i < 10 do i = true; else i = false; end");
    symtab.build(ast.nodes);
    var exp = ast.nodes[0].exp;
    expect(exp.left).not.toBeUndefined();
  });
});