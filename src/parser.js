(function(){ 'use strict'; }());

var Lexer = require('./lexer');

/*
 program          := stmts
 stmt-seq         := stmt-seq stmt
 stmt             := if-stmt | while-stmt | assign-stmt | for-stmt | decl-stmt | func-dcl
 if-stmt          := if exp then stmt-seq end | if exp then stmt-seq else stmt-seq end
 while-stmt       := while exp do stmt-seq end
 for-stmt         := for stmt, exp, stmt do stmt-seq end
 expr-stmt        := expr

 decl-stmt        := var id : type ; | var id : type = exp | array-decl | func-decl
 assing-stmt      := id = exp ; | id = array-stmt
 array-decl       := var id nested-brackets : type = array-stmt;
 nested-brackets  := [ nestedbrackets ] | []
 array-stmt       := [ param-list ]
 param-list       := element | element , paramlist
 element          := id | int | float | bool | string |  array-stmt
 func-dcl         := func id( paramlist ) do stmt-seq end
 print-stmt       := print expr

 expr             := term { '+' expr }
                  | term  { - expr  }
                  | term  { || term }
                  | term  { && term }
                  | term  { == term }
                  | term

term              := factor { * term }
                  := factor { / term }
                  := factor

factor            := ('expr')
                  |  ident
                  |  int
                  |  float
                  |  string
                  |  bool

bool-factor       := true
                  | false
                  | ( bool-expr )
 */


function Parser(){
  this.lexer = new Lexer();
}
Parser.AST_STMT_LIST = 1;
Parser.AST_ID        = 2;
Parser.AST_ASSIGN    = 3;
Parser.AST_INT       = 4;
Parser.AST_DECL      = 5;
Parser.AST_BOOL      = 6;
Parser.AST_STRING    = 7;
Parser.AST_FLOAT     = 8;
Parser.AST_BINOP     = 9;
Parser.AST_WHILE     = 10;
Parser.AST_IF        = 11;
Parser.AST_ELSE      = 12;
Parser.AST_PRINT     = 13;

function ASTNode(args){
  this.nodetype  =  args.nodetype;
  this.value  = args.value;
  this.left   = args.left;
  this.right  = args.right;
  this.type   = args.type;
  this.operator = args.operator;
  this.exp    = args.exp;
  this.stmts  = args.stmts;
}

Parser.prototype.parse = function(input){
 this.tokens = this.lexer.lex(input);
 return this.program();
};

Parser.prototype.program = function(){
  program = {
    nodetype: Parser.AST_STMT_LIST,
    nodes: this.stmtList()
  };
  return program;
};

Parser.prototype.stmtList= function(){
  var stmtToks = [Lexer.TOK_IF, Lexer.TOK_WHILE, Lexer.TOK_VAR, Lexer.TOK_FOR, Lexer.TOK_FUNC, Lexer.TOK_ID, Lexer.TOK_PRINT];
  var stmts = [];
  while(this.tokens.length){
    if(stmtToks.indexOf(this.peek()) > -1)
      stmts.push(this.stmt());
    else if(this.peek() === Lexer.TOK_END || this.peek() === Lexer.TOK_ELSE)
      break;
    else
      throw new Error("Unexpected token: " + this.nextToken().value);
  }
  return stmts;
};

Parser.prototype.stmt = function(){
  var id;
  var left;
  var right;
  var type;
  var exp;
  var stmts;
  if(this.peek() === Lexer.TOK_ID){
    id = this.consume(Lexer.TOK_ID);
    this.consume(Lexer.TOK_EQ);
    right = this.expr();
    left = new ASTNode({nodetype: Parser.AST_ID, value: id.value});
    this.consume(Lexer.TOK_SEMI);
    return new ASTNode({ nodetype: Parser.AST_ASSIGN, left: left, right: right});
  }
  else if(this.peek() === Lexer.TOK_VAR){
    this.consume(Lexer.TOK_VAR);
    id = this.consume(Lexer.TOK_ID);
    this.consume(Lexer.TOK_COLON);
    type = this.consume(Lexer.TOK_TYPE);
    left = new ASTNode({nodetype: Parser.AST_ID, type: type.value, value: id.value});
    this.consume(Lexer.TOK_EQ);
    right = this.expr();
    this.consume(Lexer.TOK_SEMI);
    return new ASTNode({nodetype: Parser.AST_DECL, left: left, right: right});
  }
  else if(this.peek() === Lexer.TOK_WHILE){
    this.consume(Lexer.TOK_WHILE);
    exp = this.expr();
    this.consume(Lexer.TOK_DO);
    stmts = this.stmtList();
    this.consume(Lexer.TOK_END);
    return new ASTNode({nodetype: Parser.AST_WHILE, exp: exp, stmts: stmts});
  }
  else if(this.peek() === Lexer.TOK_IF){
    this.consume(Lexer.TOK_IF);
    exp = this.expr();
    this.consume(Lexer.TOK_DO);
    stmts = this.stmtList();
    if(this.peek() === Lexer.TOK_END)
      this.consume(Lexer.TOK_END);
    else{
      this.consume(Lexer.TOK_ELSE);
      var stmtsElse = this.stmtList();
      this.consume(Lexer.TOK_END);
      stmts.push(new ASTNode({nodetype: Parser.AST_ELSE, stmts: stmtsElse}));
    }
    return new ASTNode({nodetype: Parser.AST_IF, exp: exp, stmts: stmts});
  }
  else if(this.peek() === Lexer.TOK_PRINT){
    this.consume(Lexer.TOK_PRINT);
    exp = this.expr();
    this.consume(Lexer.TOK_SEMI);
    return new ASTNode({nodetype: Parser.AST_PRINT, exp: exp});
  }
};

Parser.prototype.expr = function(){
  var t = this.term();
  var tRight;
  var nextToken = this.peek();
  var opToks = [Lexer.TOK_PLUS, Lexer.TOK_MINUS, Lexer.TOK_AND,  Lexer.TOK_OR,  Lexer.TOK_EQLS, Lexer.TOK_NEQLS, Lexer.TOK_LTHAN];
  while( this.tokens.length && opToks.indexOf(this.peek()) > -1){
    if(nextToken === Lexer.TOK_PLUS){
      this.consume(Lexer.TOK_PLUS);
      tRight = this.term();
      t = new ASTNode({nodetype: Parser.AST_BINOP, operator: '+', left: t, right: tRight });
    }else if(nextToken === Lexer.TOK_MINUS){
      this.consume(Lexer.TOK_MINUS);
      tRight = this.term();
      t = new ASTNode({nodetype: Parser.AST_BINOP, operator: '-', left: t, right: tRight});
    }else if(nextToken === Lexer.TOK_OR){
      this.consume(Lexer.TOK_OR);
      tRight = this.term();
      t = new ASTNode({nodetype: Parser.AST_BINOP, operator: "||", left: t, right: tRight});
    }else if(nextToken === Lexer.TOK_AND){
      this.consume(Lexer.TOK_AND);
      tRight = this.term();
      t = new ASTNode({nodetype: Parser.AST_BINOP, operator: "&&", left: t, right: tRight});
    }else if(nextToken === Lexer.TOK_EQLS){
      this.consume(Lexer.TOK_EQLS);
      tRight = this.term();
      t = new ASTNode({nodetype: Parser.AST_BINOP, operator: "==", left: t, right: tRight});
    }else if(nextToken === Lexer.TOK_NEQLS){
      this.consume(Lexer.TOK_NEQLS);
      tRight = this.term();
      t = new ASTNode({nodetype: Parser.AST_BINOP, operator: "!=", left: t, right: tRight});
    }
    else if(nextToken === Lexer.TOK_LTHAN){
      this.consume(Lexer.TOK_LTHAN);
      tRight = this.term();
      t = new ASTNode({nodetype: Parser.AST_BINOP, operator: "<", left: t, right: tRight});
    }
    nextToken = this.peek();
  }
  return t;
};

Parser.prototype.term = function(){
  var f = this.factor();
  var fRight;
  var nextToken = this.peek();
  while(this.tokens.length && nextToken === Lexer.TOK_STAR || nextToken === Lexer.TOK_SLASH || nextToken === Lexer.TOK_MOD){
    if(nextToken === Lexer.TOK_STAR){
      this.consume(Lexer.TOK_STAR);
      fRight = this.factor();
      f = new ASTNode({nodetype: Parser.AST_BINOP, operator: '*', left: f, right: fRight});
    }else if(nextToken === Lexer.TOK_SLASH){
      this.consume(Lexer.TOK_SLASH);
      fRight = this.factor();
      f = new ASTNode({nodetype: Parser.AST_BINOP, operator: '/', left: f, right: fRight});
    }else if(nextToken === Lexer.TOK_MOD){
      this.consume(Lexer.TOK_MOD);
      fRight = this.factor();
      f = new ASTNode({nodetype: Parser.AST_BINOP, operator: '%', left: f, right: fRight});
    }
    nextToken = this.peek();
  }
  return f;
};

Parser.prototype.factor = function(){
  var f;
  if(this.peek() === Lexer.TOK_INT){
    f = this.consume(Lexer.TOK_INT);
    return new ASTNode({nodetype: Parser.AST_INT, value: f.value});
  }
  else if(this.peek() === Lexer.TOK_BOOL){
    f = this.consume(Lexer.TOK_BOOL);
    return new ASTNode({nodetype: Parser.AST_BOOL, value: f.value});
  }
  else if(this.peek() === Lexer.TOK_STRING){
    f = this.consume(Lexer.TOK_STRING);
    return new ASTNode({nodetype: Parser.AST_STRING, value: f.value});
  }
  else if(this.peek() === Lexer.TOK_FLOAT){
    f = this.consume(Lexer.TOK_FLOAT);
    return new ASTNode({nodetype: Parser.AST_FLOAT, value: f.value});
  }
  else if(this.peek() === Lexer.TOK_ID){
    f = this.consume(Lexer.TOK_ID);
    return new ASTNode({nodetype: Parser.AST_ID, value: f.value });
  }
  else if(this.peek() === Lexer.TOK_LPAREN){
    this.consume(Lexer.TOK_LPAREN);
    var e = this.expr();
    this.consume(Lexer.TOK_RPAREN);
    return e;
  }
};

Parser.prototype.nextToken = function(){
  return this.tokens.shift();
};

Parser.prototype.peek = function(){
  return this.tokens.length ? this.tokens[0].type : null;
};

Parser.prototype.consume = function(tokType, value){
  if(!this.tokens.length)
    throw new Error("Expecting a token but EOF found");
  if(tokType === this.peek())
    return this.nextToken();
  else
    throw new Error("Unexpected token: " + this.tokens[0].value);
};

var nodeId = 0;
Parser.prototype.astDOT = function(node){
  nodeId++;
  var result = "";
  var i;
  var self;
  switch(node.nodetype){
    case Parser.AST_ASSIGN:
      i = nodeId;
      result += "{" + i + '[label="eq"]}' + " -> " + this.astDOT(node.left) + ";\n";
      result += "{" + i + '[label="eq"]}' + " -> " + this.astDOT(node.right);
      break;
    case Parser.AST_DECL:
      i = nodeId;
      result += "{" + i + '[label="decl"]}' + " -> " + this.astDOT(node.left) + ";\n";
      result += "{" + i + '[label="decl"]}' + " -> " + this.astDOT(node.right);
      break;
    case Parser.AST_BINOP:
      var op = this.operatorToStr(node.operator);
      i = nodeId;
      result += "{" + i + '[label="' + op + '"]}' +" -> " + this.astDOT(node.left) + ";\n";
      result += "{" + i + '[label="' + op + '"]}' + " -> " + this.astDOT(node.right);
      break;
    case Parser.AST_WHILE:
      i = nodeId;
      self = this;
      result += "{" + i + '[label="while"]}' + ";\n";
      result += "{" + i + '[label="while"]}' + " -> " + this.astDOT(node.exp) + ";\n";
      node.stmts.forEach(function(stmt){
        result += "{" + i + '[label="while"]}' + " -> " + self.astDOT(stmt);
      });
      break;
    case Parser.AST_IF:
      i = nodeId;
      self = this;
      result += "{" + i + '[label="if"]}' + ";\n";
      result += "{" + i + '[label="if"]}' + " -> " + this.astDOT(node.exp) + ";\n";
      node.stmts.forEach(function(stmt){
        result += "{" + i + '[label="if"]}' + " -> " + self.astDOT(stmt);
      });
      break;
    case Parser.AST_ELSE:
      i = nodeId;
      self = this;
      result += "{" + i + '[label="else"]}' + ";\n";
      node.stmts.forEach(function(stmt){
        result += "{" + i + '[label="else"]}' + " -> " + self.astDOT(stmt);
      });
      break;
    case Parser.AST_PRINT:
      result += "{" + nodeId + '[label="print"]}' + " -> " + this.astDOT(node.exp);
      break;
    case Parser.AST_ID:
    case Parser.AST_INT:
    case Parser.AST_FLOAT:
    case Parser.AST_BOOL:
      result +=  "{" + nodeId + '[label="' + node.value + '"]}';
      break;
  }
  return result;
};

Parser.prototype.operatorToStr = function(operator){
  switch(operator){
    case '+':
      return "plus";
    case '-':
      return "minus";
    case '/':
      return 'div';
    case '*':
      return 'mult';
    case '%':
      return 'mod';
    case '||':
      return 'or';
    case '==':
      return 'equals';
    case '&&':
      return 'and';
    case '!=':
      return 'not equals';
    case "<":
      return 'less than';
  }
};

Parser.prototype.displayAST = function(ast){
  var graph = "digraph ast {\n";
  var self = this;
  ast.nodes.forEach(function(node){
    graph += "program -> " + self.astDOT(node, 0) + "\n";
  });
  graph += "\n}";
  nodeId = 0;
  return graph;
};

module.exports = {Parser: Parser, ASTNode: ASTNode};
