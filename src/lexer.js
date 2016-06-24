(function(){'use strict';}());

function Lexer(){
}

Lexer.TOK_ID          = 1;
Lexer.TOK_VAR         = 2;
Lexer.TOK_INT         = 3;
Lexer.TOK_FLOAT       = 4;
Lexer.TOK_TYPE        = 5;
Lexer.TOK_EQ          = 6;
Lexer.TOK_PLUS        = 7;
Lexer.TOK_MINUS       = 8;
Lexer.TOK_STAR        = 9;
Lexer.TOK_SLASH       = 10;
Lexer.TOK_LPAREN      = 11;
Lexer.TOK_RPAREN      = 12;
Lexer.TOK_COLON       = 13;
Lexer.TOK_WHILE       = 14;
Lexer.TOK_DO          = 15;
Lexer.TOK_DONE        = 16;
Lexer.TOK_SEMI        = 17;
Lexer.TOK_FALSE       = 19;
Lexer.TOK_TRUE        = 20;
Lexer.TOK_EQLS        = 21;
Lexer.TOK_FOR         = 22;
Lexer.TOK_IF          = 23;
Lexer.TOK_ELSE        = 24;
Lexer.TOK_COMMA       = 25;
Lexer.TOK_STRING      = 26;
Lexer.TOK_GTHAN       = 27;
Lexer.TOK_LTHAN       = 28;
Lexer.TOK_LTHANEQ     = 29;
Lexer.TOK_GTHANEQ     = 30;
Lexer.TOK_COMMA       = 31;
Lexer.TOK_RBRACKET    = 32;
Lexer.TOK_LBRACKET    = 33;
Lexer.TOK_FUNC        = 34;
Lexer.TOK_OR          = 35;
Lexer.TOK_AND         = 36;
Lexer.TOK_BITWISE_OR  = 37;
Lexer.TOK_BITWISE_AND = 38;
Lexer.TOK_MOD         = 39;
Lexer.TOK_NEQLS       = 40;
Lexer.TOK_NEGATE      = 41;
Lexer.TOK_PRINT       = 42;

var KEYWORDS =  {
  'while' : { type: Lexer.TOK_WHILE,  value: 'while'},
  'for'   : { type: Lexer.TOK_FOR,    value: 'for'},
  'end'   : { type: Lexer.TOK_END,    value: 'end'},
  'do'    : { type: Lexer.TOK_DO,     value: 'do'},
  'int'   : { type: Lexer.TOK_TYPE,   value: 'int'},
  'float' : { type: Lexer.TOK_TYPE,   value: 'float'},
  'string': { type: Lexer.TOK_TYPE,   value: 'string'},
  'bool'  : { type: Lexer.TOK_TYPE,   value: 'bool'},
  'if'    : { type: Lexer.TOK_IF,     value: 'if'},
  'else'  : { type: Lexer.TOK_ELSE,   value: 'else'},
  'true'  : { type: Lexer.TOK_BOOL,   value: 'true'},
  'false' : { type: Lexer.TOK_BOOL,   value: 'false'},
  'var'   : { type: Lexer.TOK_VAR,    value: 'var'},
  'func'  : { type: Lexer.TOK_FUNC,   value: 'func'},
  'print' : { type: Lexer.TOK_PRINT,  value: 'print'}
};

Lexer.prototype.lex = function(input){
  var tokens = [];
  var id;
  this.index = 0;
  while(this.index < input.length){
    var ch = input.charAt(this.index);
    if(/\s/.test(ch)){ /*NOOP: skip whitespace*/ }
    else if (ch === '(')
      tokens.push({ type: Lexer.TOK_LPAREN, value: '('});
    else if (ch === ')')
      tokens.push({ type: Lexer.TOK_RPAREN, value: ')'});
    else if (ch === '+')
      tokens.push({ type: Lexer.TOK_PLUS, value: '+'});
    else if (ch === '-')
      tokens.push({ type: Lexer.TOK_MINUS, value: '-'});
    else if (ch === '*')
      tokens.push({ type: Lexer.TOK_STAR, value: '*'});
    else if (ch === '/')
      tokens.push({ type: Lexer.TOK_SLASH, value: '/'});
    else if (ch === '%')
      tokens.push({ type: Lexer.TOK_MOD, value: '%'});
    else if( ch === ':')
      tokens.push({ type: Lexer.TOK_COLON, value: ':'});
    else if( ch === ';')
      tokens.push({ type: Lexer.TOK_SEMI, value: ';'});
    else if( ch === ']')
      tokens.push({ type: Lexer.TOK_RBRACKET, value: ']'});
    else if( ch === '[')
      tokens.push({ type: Lexer.TOK_LBRACKET, value: '['});
    else if( ch === ',')
      tokens.push({ type: Lexer.TOK_COMMA, value: ','});
    else if(ch === "="){
      if(this.peek(input) === "="){
        this.index++;
        tokens.push({ type: Lexer.TOK_EQLS, value: "=="});
      }
      else
        tokens.push({ type: Lexer.TOK_EQ, value: "="});
    }
    else if(ch === ">"){
      if(this.peek(input) === "="){
        this.index++;
        tokens.push({ type: Lexer.TOK_GTHANEQ, value: ">="});
      }
      else
        tokens.push({ type: Lexer.TOK_GTHAN, value: ">"});
    }
    else if(ch === "<"){
      if(this.peek(input) === "="){
        this.index++;
        tokens.push({ type: Lexer.TOK_LTHANEQ, value: "<="});
      }
      else
        tokens.push({ type: Lexer.TOK_LTHAN, value: "<"});
    }
    else if(ch === "|"){
      if(this.peek(input) === "|"){
        this.index++;
        tokens.push({ type: Lexer.TOK_OR, value: "||"});
      }
      else
        tokens.push({ type: Lexer.TOK_BITWISE_OR, value: "|"});
    }
    else if(ch === "&"){
      if(this.peek(input) === "&"){
        this.index++;
        tokens.push({ type: Lexer.TOK_AND, value: '&&'});
      }
      else
        tokens.push({ type: Lexer.TOK_BITWISE_AND, value: '&'});
    }
    else if(ch === "!"){
      if(this.peek(input) === "="){
        this.index++;
        tokens.push({ type: Lexer.TOK_NEQLS, value: '!='});
      }
      else
        tokens.push({type: Lexer.TOK_NEGATE, value: '!'});
    }
    else if (this.isNumber(ch)){
      var num = this.readNumber(input);
      if(input[this.index] === '.'){
         num += '.';
         this.index++;
         num += this.readNumber(input);
         tokens.push({ type: Lexer.TOK_FLOAT, value: num});
      }else
        tokens.push({ type: Lexer.TOK_INT, value: num});
      this.index--;
    }
    else if(this.isIdent(ch)){
      id = this.readIdent(input);
      if(KEYWORDS.hasOwnProperty(id))
        tokens.push({ type: KEYWORDS[id].type, value: KEYWORDS[id].value});
      else
        tokens.push({ type: Lexer.TOK_ID, value: id});
      this.index--;
    }
    else if(ch === '"'){
      this.index++;
      id = this.readString(input, '"');
      if(input.charAt(this.index) === '"')
        tokens.push({ type: Lexer.TOK_STRING, value: "'" + id + "'"});
      else
        throw new Error("Unmatched quote");
    }
    else if(ch === "'"){
      this.index++;
      id = this.readString(input, "'");
      if(input.charAt(this.index) === "'")
        tokens.push({ type: Lexer.TOK_STRING, value: "'" + id + "'"});
      else
        throw new Error("Unmatched quote");
    }
    else{
      throw new Error('Unexpected character ' + ch);
    }
    this.index++;
  }
  return tokens;
};

Lexer.prototype.isNumber = function(n){
  return !isNaN(parseFloat(n) && isFinite(n));
};

Lexer.prototype.isIdent = function(ch){
  return /[a-z0-9_]/i.test(ch);
};

Lexer.prototype.readNumber = function(input){
  num = '';
  while(this.isNumber(input.charAt(this.index))){
    num += input.charAt(this.index);
    this.index++;
  }
  return num;
};

Lexer.prototype.readIdent = function(input){
  var id = '';
  while(this.isNumber(input.charAt(this.index)) || this.isIdent(input.charAt(this.index))){
    id += input.charAt(this.index);
    this.index++;
  }
  return id;
};

Lexer.prototype.readString = function(input, quote){
  var string = '';
  while(input.charAt(this.index) !== quote && this.index < input.length){
    string += input.charAt(this.index);
    this.index++;
  }
  return string;
};


Lexer.prototype.peek = function(input){
  return input.charAt(this.index + 1);
};

module.exports = Lexer;
