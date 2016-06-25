(function(){'use strict';}());

var CodeGenerator = require('../src/codegen');
var Parser = require('../src/parser').Parser;

describe("Code Generator", function(){
  var codegen = new CodeGenerator();
  var parser = new Parser();

  it('generates code for simple assignment', function(){
    var ast = parser.parse("var i:int = 0;");
    expect(codegen.generate(ast.nodes)).toEqual('var i = 0;\n');
  });

  it("generates empty string for the empty program", function(){
    var ast = parser.parse("");
    expect(codegen.generate(ast.nodes)).toEqual("");
  });

  it("generates a expression", function(){
    var ast = parser.parse("var i:int = (((3 + 5) % 4) / 2.0);");
    expect(codegen.generate(ast.nodes)).toEqual("var i = ( ( ( 3 + 5 ) % 4 ) / 2.0 );\n");
  });

  it("generates a assignment expression", function(){
    var ast = parser.parse("i = 0;\n");
    expect(codegen.generate(ast.nodes)).toEqual("i = 0;\n");
  });

  it("generates a while statement", function(){
    var ast = parser.parse("while i < 10 do i = i + 1; end");
    expect(codegen.generate(ast.nodes)).toEqual("while ( i < 10 ){\ni = ( i + 1 );\n}\n");
  });

  it("generates an if statement", function(){
    var ast = parser.parse("if i < 10 do i = true; else i = false; end");
    expect(codegen.generate(ast.nodes)).toEqual("if ( i < 10 ){\ni = true;\n}\nelse{\ni = false;\n}\n");
  });

  it("generates the euclidean algorithm", function(){
    program = "var r:int = 0;\
    var u:int = 561;\
    var v:int = 11;\
    while 0 < v do\
      t = u;\
      u = v;\
      v = t % v;\
    end\
    if u < 0 do\
      print 0-u;\
    else\
      print u;\
    end"
    var ast = parser.parse(program);
    console.log(codegen.generate(ast.nodes));
  });
});