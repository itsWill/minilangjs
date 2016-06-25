(function(){'use strict';}());

var Parser = require('./parser').Parser;

function CodeGenerator(){
}


CodeGenerator.prototype.generate = function(nodes){
  var program = "";
  var self = this;
  nodes.forEach(function(node){
    program += self.generateNode(node);
  });
  return program;
};

CodeGenerator.prototype.generateNode = function(node){
  var result = "";
  switch(node.nodetype){
    case Parser.AST_DECL:
      result += "var " + node.left.value + " = " + this.generateNode(node.right) +";\n";
    break;
    case Parser.AST_BINOP:
      result += "( " + this.generateNode(node.left) + " " + node.operator + " " + this.generateNode(node.right) + " )";
      break;
    case Parser.AST_ASSIGN:
      result += node.left.value + " = " + this.generateNode(node.right) +";\n";
      break;
    case Parser.AST_WHILE:
      result += "while " + this.generateNode(node.exp) + "{\n" + this.generate(node.stmts) + "}\n";
      break;
    case Parser.AST_IF:
      var hasElse = (node.stmts[node.stmts.length -1].nodetype === Parser.AST_ELSE) ? true : false;
      if(hasElse){
        var elseNode = node.stmts.pop();
        result += "if " + this.generateNode(node.exp)+ "{\n" + this.generate(node.stmts) +"}\n";
        result += "else{\n" + this.generate(elseNode.stmts) +"}\n";
      }else
        result += "if " + this.generateNode(node.exp)+ "{\n" + this.generate(node.stmts) +"}\n";
      break;
    case Parser.AST_PRINT:
      result += "console.log( " + this.generateNode(node.exp) + ");\n";
      break;
    case Parser.AST_ID:
    case Parser.AST_INT:
    case Parser.AST_FLOAT:
    case Parser.AST_BOOL:
    case Parser.AST_STRING:
      result += node.value;
      break;
  }
  return result;
};

module.exports = CodeGenerator;