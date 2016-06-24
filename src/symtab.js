(function(){ 'use strict'; }());

var Parser = require('./parser').Parser;

function SymbolTable(){
  this.stack = [new Scope()];
}

function Scope(parent){
  this.table = {};
  this.parent = parent;
}

SymbolTable.prototype.build = function(nodes){
  var self = this;
  nodes.forEach(function(node){
    self.analyzeNode(node);
  });
};

SymbolTable.prototype.analyzeNode = function(node){
  switch(node.nodetype){
    case Parser.AST_DECL:
      this.putSymbol(node.left.value, node.left.type);
      this.analyzeNode(node.right);
      node.scope = this.peek();
      break;
    case Parser.AST_WHILE:
    case Parser.AST_IF:
    case Parser.AST_ELSE:
      if(node.exp !== undefined)
        this.analyzeNode(node.exp);
      this.scopeSymbolTable();
      node.scope = this.peek();
      this.build(node.stmts);
      this.pop();
      break;
    case Parser.AST_BINOP:
      this.analyzeNode(node.left);
      this.analyzeNode(node.right);
      break;
    case Parser.AST_ASSIGN:
      this.analyzeNode(node.left);
      this.analyzeNode(node.right);
      break;
    case Parser.AST_ID:
      node.scope = this.peek();
      break;

  }
};

SymbolTable.prototype.scopeSymbolTable = function(){
  var scope = new Scope(this.peek());
  this.stack.push(scope);
};

SymbolTable.prototype.putSymbol = function(symbol, type){
  this.peek().putSymbol(symbol, type);
};

Scope.prototype.putSymbol = function(symbol, type){
  if(this.getSymbol(symbol) !== undefined )
    throw new Error("can't redeclare variable " + symbol);
  this.table[symbol] = type;
};

SymbolTable.prototype.getSymbol = function(symbol){
  return this.peek().getSymbol(symbol);
};

Scope.prototype.getSymbol = function(symbol){
  if(this.table[symbol] === undefined && this.parent)
    return this.parent.getSymbol(symbol);
  return this.table[symbol];
};

SymbolTable.prototype.peek = function(){
  return this.stack[this.stack.length - 1];
};

SymbolTable.prototype.pop = function(){
  return this.stack.pop();
};

module.exports = SymbolTable;
