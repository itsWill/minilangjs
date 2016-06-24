(function(){'use strict';}());

var requires = require('../src/parser');
var Parser = requires.Parser;
var ASTNode = requires.ASTNode;

describe('Parser', function(){
  var parser = new Parser();

  it('parses an empty program', function(){
    var program = parser.parse("");
    var ast = {
      nodetype: Parser.AST_STMT_LIST,
      nodes: []
    };
    expect(program).toEqual(ast);
  });

  it('parses a literal assignment', function(){
    var astRoot = parser.parse("a = 42;");

    var ast = new ASTNode({nodetype: Parser.AST_ASSIGN});
    ast.left = new ASTNode({nodetype: Parser.AST_ID, value: 'a'});
    ast.right = new ASTNode({nodetype: Parser.AST_INT, value: '42'});

    expect(astRoot.nodes[0]).toEqual(ast);
  });

  it('throws an error on a missing semicolon for an assignment', function(){
    expect(function(){ parse.parse(" a = 42");}).toThrow();
  });

  it('parses multiple assingment statments', function(){
    var astRoot = parser.parse("b = 41; b = 41;");

    var ast = new ASTNode({nodetype: Parser.AST_ASSIGN});
    ast.left = new ASTNode({nodetype: Parser.AST_ID, value: 'b'});
    ast.right = new ASTNode({nodetype: Parser.AST_INT, value: '41'});

    astRoot.nodes.forEach(function(node){
      expect(node).toEqual(ast);
    });
  });

  it('parses a declaration statement', function(){
    var astRoot = parser.parse("var c : int = 23 ;");
    var ast = new ASTNode({nodetype: Parser.AST_DECL});
    ast.left = new ASTNode({nodetype: Parser.AST_ID, type: 'int', value: 'c'});
    ast.right = new ASTNode({nodetype: Parser.AST_INT, value: '23'});
    expect(ast).toEqual(astRoot.nodes[0]);
  });

  it('parses an assignment and declaration statement', function(){
    var astRoot = parser.parse("var a : int = 42 ; a = 41;");

    var decl = new ASTNode({nodetype: Parser.AST_DECL});
    decl.left = new ASTNode({nodetype: Parser.AST_ID, type: 'int', value: 'a'});
    decl.right = new ASTNode({nodetype: Parser.AST_INT, value: '42'});

    var assign = new ASTNode({nodetype: Parser.AST_ASSIGN});
    assign.left = new ASTNode({nodetype: Parser.AST_ID, value: 'a'});
    assign.right = new ASTNode({nodetype: Parser.AST_INT, value: '41'});

    expect(astRoot.nodes[0]).toEqual(decl);
    expect(astRoot.nodes[1]).toEqual(assign);
  });

  it('parses a declaration to a literal boolean', function(){
    var astRoot = parser.parse("var a : bool = true ;");

    var decl = new ASTNode({nodetype: Parser.AST_DECL});
    decl.left = new ASTNode({nodetype: Parser.AST_ID, type: 'bool', value: 'a'});
    decl.right = new ASTNode({nodetype: Parser.AST_BOOL, value: 'true'});

    expect(astRoot.nodes[0]).toEqual(decl);
  });

  it('parses a declation to a literal string', function(){
    var astRoot = parser.parse("var hello : string = 'hello world!' ;");

    var decl = new ASTNode({nodetype: Parser.AST_DECL});
    decl.left = new ASTNode({nodetype: Parser.AST_ID, type: 'string', value: 'hello'});
    decl.right = new ASTNode({nodetype: Parser.AST_STRING, value: "'hello world!'"});

    expect(astRoot.nodes[0]).toEqual(decl);
  });

  it('parses a declaration to a literal float', function(){
    var astRoot = parser.parse("var num : float = 42.0 ;");

    var decl = new ASTNode({nodetype: Parser.AST_DECL});
    decl.left = new ASTNode({nodetype: Parser.AST_ID, type: 'float', value: 'num'});
    decl.right = new ASTNode({nodetype: Parser.AST_FLOAT, value: '42.0'});

    expect(astRoot.nodes[0]).toEqual(decl);
  });

  it('can\'t assign to a factor', function(){
    expect(function(){ parser.parse("'hello' = 42");}).toThrow();
  });

  it('parses a simple addition expression', function(){
    var astRoot = parser.parse("a = 52 + 3;");

    var assign = new ASTNode({nodetype: Parser.AST_ASSIGN});
    assign.left = new ASTNode({nodetype: Parser.AST_ID, value: 'a'});
    var exp = new  ASTNode({nodetype: Parser.AST_BINOP, operator: "+" });
    exp.left = new ASTNode({nodetype: Parser.AST_INT, value: '52'});
    exp.right = new ASTNode({nodetype: Parser.AST_INT, value: '3'});
    assign.right = exp;

    expect(astRoot.nodes[0]).toEqual(assign);
  });

  it('parses a assignment to a paranthesized expression', function(){
    var astRoot = parser.parse("a = (4 + 20) ;");

    var assign = new ASTNode({nodetype: Parser.AST_ASSIGN});
    assign.left = new ASTNode({nodetype: Parser.AST_ID, value: 'a'});
    var exp = new  ASTNode({nodetype: Parser.AST_BINOP, operator: "+" });
    exp.left = new ASTNode({nodetype: Parser.AST_INT, value: '4'});
    exp.right = new ASTNode({nodetype: Parser.AST_INT, value: '20'});
    assign.right = exp;

    expect(astRoot.nodes[0]).toEqual(assign);
  });

  it('parses an assignment to a paranthesized minus expression', function(){
    var astRoot = parser.parse("a = (4 - 15) ;");

    var assign = new ASTNode({nodetype: Parser.AST_ASSIGN});
    assign.left = new ASTNode({nodetype: Parser.AST_ID, value: 'a'});
    var exp = new  ASTNode({nodetype: Parser.AST_BINOP, operator: "-" });
    exp.left = new ASTNode({nodetype: Parser.AST_INT, value: '4'});
    exp.right = new ASTNode({nodetype: Parser.AST_INT, value: '15'});
    assign.right = exp;

    expect(astRoot.nodes[0]).toEqual(assign);
  });

  it('parses a  simple multiplication expresssion', function(){
    var astRoot = parser.parse("a = (20 * 21) ;");

    var assign = new ASTNode({nodetype: Parser.AST_ASSIGN});
    assign.left = new ASTNode({nodetype: Parser.AST_ID, value: 'a'});
    var exp = new  ASTNode({nodetype: Parser.AST_BINOP, operator: "*" });
    exp.left = new ASTNode({nodetype: Parser.AST_INT, value: '20'});
    exp.right = new ASTNode({nodetype: Parser.AST_INT, value: '21'});
    assign.right = exp;

    expect(astRoot.nodes[0]).toEqual(assign);
  });

  it('parses a simple division expresssion', function(){
    var astRoot = parser.parse("d = (840 / 2) ;");

    var assign = new ASTNode({nodetype: Parser.AST_ASSIGN});
    assign.left = new ASTNode({nodetype: Parser.AST_ID, value: 'd'});
    var exp = new  ASTNode({nodetype: Parser.AST_BINOP, operator: "/" });
    exp.left = new ASTNode({nodetype: Parser.AST_INT, value: '840'});
    exp.right = new ASTNode({nodetype: Parser.AST_INT, value: '2'});
    assign.right = exp;

    expect(astRoot.nodes[0]).toEqual(assign);
  });

  it('parses a complex assignment expression', function(){
    var astRoot = parser.parse("d = ((a + 2) * c) / 3.0 ;");

    var assign = new ASTNode({nodetype: Parser.AST_ASSIGN});
    assign.left = new ASTNode({nodetype: Parser.AST_ID, value: 'd'});

    var innerExp = new ASTNode({nodetype: Parser.AST_BINOP, operator: '+'});
    innerExp.left = new ASTNode({nodetype: Parser.AST_ID, value: 'a'});
    innerExp.right = new ASTNode({nodetype: Parser.AST_INT, value: '2'});

    var outerExp = new ASTNode({nodetype: Parser.AST_BINOP, operator: '*'});
    outerExp.left = innerExp;
    outerExp.right = new ASTNode({nodetype: Parser.AST_ID, value: 'c'});

    var exp = new ASTNode({nodetype: Parser.AST_BINOP, operator: '/'});
    exp.left = outerExp;
    exp.right = new ASTNode({nodetype: Parser.AST_FLOAT, value: '3.0'});

    assign.right = exp;

    expect(astRoot.nodes[0]).toEqual(assign);
  });

  it('parses a simple boolean expression', function(){
    var astRoot = parser.parse("a = true || false ;");

    var assign = new ASTNode({nodetype: Parser.AST_ASSIGN});
    assign.left = new ASTNode({nodetype: Parser.AST_ID, value: 'a'});

    var exp = new ASTNode({nodetype: Parser.AST_BINOP, operator: '||'});
    exp.left = new ASTNode({nodetype: Parser.AST_BOOL, value: 'true'});
    exp.right = new ASTNode({nodetype: Parser.AST_BOOL, value: 'false'});

    assign.right  = exp;

    expect(astRoot.nodes[0]).toEqual(assign);
  });

  it('parses a simple && expression', function(){
    var astRoot = parser.parse("a = true && false ;");

    var assign = new ASTNode({nodetype: Parser.AST_ASSIGN});
    assign.left = new ASTNode({nodetype: Parser.AST_ID, value: 'a'});

    var exp = new ASTNode({nodetype: Parser.AST_BINOP, operator: '&&'});
    exp.left = new ASTNode({nodetype: Parser.AST_BOOL, value: 'true'});
    exp.right = new ASTNode({nodetype: Parser.AST_BOOL, value: 'false'});

    assign.right  = exp;

    expect(astRoot.nodes[0]).toEqual(assign);
  });

  it('parses a simple == expression', function(){
    var astRoot = parser.parse("a = b == c ;");

    var assign = new ASTNode({nodetype: Parser.AST_ASSIGN});
    assign.left = new ASTNode({nodetype: Parser.AST_ID, value: 'a'});

    var exp = new ASTNode({nodetype: Parser.AST_BINOP, operator: '=='});
    exp.left = new ASTNode({nodetype: Parser.AST_ID, value: 'b'});
    exp.right = new ASTNode({nodetype: Parser.AST_ID, value: 'c'});

    assign.right = exp;

    expect(astRoot.nodes[0]).toEqual(assign);
  });

  it('parses a simple != expression', function(){
    var astRoot = parser.parse("a = b != c ;");

    var assign = new ASTNode({nodetype: Parser.AST_ASSIGN});
    assign.left = new ASTNode({nodetype: Parser.AST_ID, value: 'a'});

    var exp = new ASTNode({nodetype: Parser.AST_BINOP, operator: '!='});
    exp.left = new ASTNode({nodetype: Parser.AST_ID, value: 'b'});
    exp.right = new ASTNode({nodetype: Parser.AST_ID, value: 'c'});

    assign.right = exp;

    expect(astRoot.nodes[0]).toEqual(assign);
  });

  it('parses a while statement', function(){
    var astRoot = parser.parse("while a == b do a = false; end");

    var whileNode = new ASTNode({nodetype: Parser.AST_WHILE});

    var exp = new ASTNode({nodetype: Parser.AST_BINOP, operator: '=='});
    exp.left = new ASTNode({nodetype: Parser.AST_ID, value: 'a'});
    exp.right = new ASTNode({nodetype: Parser.AST_ID, value: 'b'});

    var stmt = new ASTNode({nodetype: Parser.AST_ASSIGN});
    stmt.left = new ASTNode({nodetype: Parser.AST_ID, value: 'a'});
    stmt.right = new ASTNode({nodetype: Parser.AST_BOOL, value: 'false'});

    whileNode.exp = exp;
    whileNode.stmts = [];
    whileNode.stmts.push(stmt);

    expect(astRoot.nodes[0]).toEqual(whileNode);
  });

  });