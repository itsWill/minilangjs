(function(){'use strict';}());

var Parser = require('./parser').Parser;

function TypeChecker(){
}

TypeChecker.prototype.check = function(nodes){
  var self = this;
  nodes.forEach(function(node){
    self.checkNode(node);
  });
};

TypeChecker.prototype.checkNode = function(node){
  var lType, rType, type, left, right;
  switch(node.nodetype){
    case Parser.AST_DECL:
      this.checkNode(node.right);
      lType = node.left.type;
      rType = node.right.type;
      if(lType !== rType)
        throw new Error("can't declare a " + lType + " and assign it a " + rType );
      break;
    case Parser.AST_ASSIGN:
      lType = node.left.scope.getSymbol(node.left.value);
      if(lType === undefined)
        throw new Error("can't use undeclared identifier " + node.left.value);
      this.checkNode(node.right);
      rType = node.right.type;
      if(lType !== rType)
        throw new Error("can't assign a " + lType + " a " + rType);
      break;
    case Parser.AST_BINOP:
      this.checkNode(node.left);
      this.checkNode(node.right);
      lType = node.left.type;
      rType = node.right.type;
      if(lType === "string" || rType === "string")
        node.type = this.checkStringRules(lType, rType, node.operator);
      else if(lType === "bool" || rType === "bool"){
        node.type = this.checkBoolRules(rType, lType, node.operator);
      }else if(lType === "int" || rType === "int" || lType === 'float' || rType === 'float')
        node.type = this.checkNumRules(rType, lType, node.operator);
      break;
    case Parser.AST_WHILE:
    case Parser.AST_IF:
    case Parser.AST_ELSE:
      if(node.exp !== undefined)
        this.checkNode(node.exp);
      this.check(node.stmts);
      break;
    case Parser.AST_PRINT:
      this.checkNode(node.exp);
      break;
    case Parser.AST_FLOAT:
      node.type = "float";
      break;
    case Parser.AST_INT:
      node.type = "int";
      break;
    case Parser.AST_BOOL:
      node.type = "bool";
      break;
    case Parser.AST_STRING:
      node.type = "string";
      break;
    case Parser.AST_ID:
      type = node.scope.getSymbol(node.value);
      if(type === undefined)
        throw new Error("can't use undeclared identifier " + node.value);
      node.type = type;
  }
};

TypeChecker.prototype.checkBoolRules = function(rType, lType, operator){
  var boolOps = ['&&', '||', '=='];
  if(rType !== lType)
    throw new Error("both sides of the expression have to be a boolean");
  else if(boolOps.indexOf(operator) < 0){
    throw new Error("undefined operator " + operator + " for bool");
  }
  return 'bool';
};

TypeChecker.prototype.checkNumRules = function(rType, lType, operator){
  var intOps = ["*", "/", "+", "%", "<", "-"];
  if(intOps.indexOf(operator) < 0)
    throw new Error("undefined operator " + operator + " for int");
  if(lType === 'float' || rType === 'float')
    return 'float';
  else if((lType === "string" || rType === "string") && operator === "+")
    return 'string';
  else if((lType === "int" && rType === "int") && operator === "<")
    return 'bool';
  else if(lType === "int" && rType === "int")
    return 'int';
  else if(lType === "float" && rType === "float")
    return 'float';
};

TypeChecker.prototype.checkStringRules = function(rType, lType, operator){
  if(operator != "+")
    throw new Error("undefined operator " + operator + " for string");
  return 'string';
};

module.exports = TypeChecker;

