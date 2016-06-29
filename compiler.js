var Parser = require('./src/parser').Parser;
var TypeChecker = require('./src/typecheck');
var SymbolTable = require('./src/symtab');
var CodeGenerator = require('./src/codegen');
var fs = require('fs');

var compile = function(debug){
  if(process.argv.length <= 2){
    console.log("Usage: " + __filename + " <path to file>");
    process.exit(-1);
  }

  var path = process.argv[2];

  var program = fs.readFileSync(path).toString();
  var parser = new Parser();
  var typeChecker = new TypeChecker();
  var symtab = new SymbolTable();
  var codeGenerator = new CodeGenerator();
  var ast = parser.parse(program);
  symtab = symtab.build(ast.nodes);
  typeChecker.check(ast.nodes);
  var targetCode = codeGenerator.generate(ast.nodes);
  return new Function(targetCode);
};

compile()();
