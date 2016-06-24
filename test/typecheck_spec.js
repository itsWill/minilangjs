(function(){'use strict';}());

var TypeChecker = require('../src/typecheck');
var Parser = require('../src/parser').Parser;
var SymbolTable = require('../src/symtab');

describe("Type Checker", function(){
  var parser = new Parser();
  var typeChecker = new TypeChecker();
  var symtab;
  beforeEach(function(){
    symtab = new SymbolTable();
  });

  it("throws an error if the types don't match", function(){
    var ast = parser.parse("var i:int = 3.0;");
    var ast2 = parser.parse("var i:int = true;");
    var ast4 = parser.parse("var i:string = 3;");
    expect(function(){typeChecker.check(ast.nodes);}).toThrow(new Error("can't declare a int and assign it a float"));
    expect(function(){typeChecker.check(ast2.nodes);}).toThrow(new Error("can't declare a int and assign it a bool"));
    expect(function(){typeChecker.check(ast4.nodes);}).toThrow(new Error("can't declare a string and assign it a int"));
  });

  it("doens't throw an error if the types match", function(){
    var ast = parser.parse("var i:int = 3;");
    var ast2 = parser.parse("var i:float = 3.0;");
    var ast3 = parser.parse("var i:bool = true;");
    var ast4 = parser.parse("var i:string = 'hello world';");
    expect(function(){typeChecker.check(ast.nodes);}).not.toThrow();
    expect(function(){typeChecker.check(ast2.nodes);}).not.toThrow();
    expect(function(){typeChecker.check(ast4.nodes);}).not.toThrow();
  });

  it("doesn't allow the use of an undeclared identifier in delcarations", function(){
    var ast = parser.parse("var i:int = j;");
    symtab.build(ast.nodes);
    expect(function(){typeChecker.check(ast.nodes);}).toThrow( new Error("can't use undeclared identifier j"));
  });

  it("doesn't allow an undeclared identifier in a assignment", function(){
    var ast = parser.parse("var i:int = 0; i = j;");
    symtab.build(ast.nodes);
    expect(function(){typeChecker.check(ast.nodes);}).toThrow(new Error("can't use undeclared identifier j"));
  });

  it("can be assigned to itself", function(){
    var ast = parser.parse("var i:int = 0; i = i;");
    symtab.build(ast.nodes);
    expect(function(){typeChecker.check(ast.nodes);}).not.toThrow();
  });

  it("doens't allow the use of undeclared identifiers in nested scopes", function(){
    var ast = parser.parse("var i:int = 0; while i < 10 do j = j + 1; end");
    symtab.build(ast.nodes);
    expect(function(){typeChecker.check(ast.nodes);}).toThrow( new Error("can't use undeclared identifier j"));
  });

  it("doesn't allow the use of undeclared identifiers in multiple nested scopes", function(){
    var ast = parser.parse("var i:int = 0; while i < 10 do if i < 10 do j = true; end end i = i + 1;");
    symtab.build(ast.nodes);
    expect(function(){typeChecker.check(ast.nodes);}).toThrow( new Error("can't use undeclared identifier j"));
  });

  it("checks a that a bool can't be adeed to a bool", function(){
    var ast = parser.parse("var i:bool = true + false;");
    expect(function(){typeChecker.check(ast.nodes);}).toThrow(new Error("undefined operator + for bool"));
  });

  it("throws an exception if a invalid operations is done on bools", function(){
    var ast = parser.parse('var i:bool = true * false;');
    var ast2 = parser.parse('var i:bool = true - false;');
    var ast3 = parser.parse('var i:bool = true < false;');
    expect(function(){typeChecker.check(ast.nodes);}).toThrow();
    expect(function(){typeChecker.check(ast2.nodes);}).toThrow();
    expect(function(){typeChecker.check(ast3.nodes);}).toThrow();
  });

  it("correctly annotates valid boolean operations", function(){
    var ast = parser.parse("var j:bool = false; var i:bool = true && false || (true || j);");
    symtab.build(ast.nodes);
    typeChecker.check(ast.nodes);
    expect(ast.nodes[0].right.type).toBe("bool");
  });

  it("checks that an int can't be added to a bool", function(){
    var ast = parser.parse("var i:int = 3 + true;");
    expect(function(){typeChecker.check(ast.nodes);}).toThrow(new Error("both sides of the expression have to be a boolean"));
  });

  it("checks that int added to float is a float", function(){
    var ast = parser.parse("var i:float = 1.0 + 3;");
    typeChecker.check(ast.nodes);
    expect(ast.nodes[0].right.type).toEqual('float');
  });

  it('checks that a int added to a string is a string', function(){
    var ast = parser.parse("var i:string = 'hello' + 4;");
    typeChecker.check(ast.nodes);
    expect(ast.nodes[0].right.type).toEqual('string');
  });

  it('doesn\'t allow invalid operators for ints', function(){
    var ast = parser.parse("var i:int = 3 && 4;");
    expect(function(){typeChecker.check(ast.nodes);}).toThrow(new Error("undefined operator && for int"));
  });

  it("checks that a integer comparison is a bool", function(){
    var ast = parser.parse("var i:bool = 1 < 3;");
    typeChecker.check(ast.nodes);
    expect(ast.nodes[0].right.type).toEqual('bool');
  });

  it("checks that an integer operation is a integer", function(){
    var ast = parser.parse("var i:int = ((33 + 44) - (3 % 4) * 4) / 7;");
    typeChecker.check(ast.nodes);
    expect(ast.nodes[0].right.type).toEqual('int');
  });

  it("checks that a float operation is a float", function(){
    var ast = parser.parse("var i:float = ((3.0 + 5.0) - 33)/7;");
    typeChecker.check(ast.nodes);
    expect(ast.nodes[0].right.type).toEqual("float");
  });

  it("checkst that string concatenation resolves to a string", function(){
    var ast = parser.parse("var s:string = 'hello' + ' world';");
    typeChecker.check(ast.nodes);
    expect(ast.nodes[0].right.type).toEqual("string");
  });

  it("throws an error for an unsopported operation on strings", function(){
    var ast = parser.parse("var s:string= 'hello' * 3.0;");
    expect(function(){typeChecker.check(ast.nodes);}).toThrow(new Error("undefined operator * for string"));
  });

  it("doesn't allow the use of an undeclared identier in a while expression", function(){
    var ast = parser.parse("while i < 10 do var j:int = 5; end");
    symtab.build(ast.nodes);
    expect(function(){typeChecker.check(ast.nodes);}).toThrow(new Error("can't use undeclared identifier i"));
  });

  it("doesn't allow an undeclared identier in an else statement", function(){
    var ast = parser.parse("var i:int = 0; if i < 0 do else i = j + 1; end");
    symtab.build(ast.nodes);
    expect(function(){typeChecker.check(ast.nodes);}).toThrow(new Error("can't use undeclared identifier j"));
  });

  it("doesn't allow an undeclared identifier in a print statement", function(){
    var ast = parser.parse("print i + 1;");
    symtab.build(ast.nodes);
    expect(function(){typeChecker.check(ast.nodes);}).toThrow(new Error("can't use undeclared identifier i"));
  });
});