(function(){'use strict';}());

var Lexer = require('../src/lexer');

describe('Lexer', function(){
  var lexer = new Lexer();

  it('skips whitespace', function(){
    var tokens = lexer.lex(" \r\n\t");
    expect(tokens).toEqual([]);
  });

   it('lexes literal numbers', function(){
     var tokens = lexer.lex('2012');
     expect(tokens[0]).toEqual({type: Lexer.TOK_INT, value: '2012'});
   });

   it('lexes floating point numbers', function(){
    var tokens = lexer.lex('20.12');
    expect(tokens[0]).toEqual({type: Lexer.TOK_FLOAT, value: '20.12'});
   });

   it('throws an exception if floats don\'t start with a digit', function(){
    expect(function(){lexer.lex('.14');}).toThrow();
   });

   it('throws an exception on incorrectly formatted float', function(){
    expect(function(){lexer.lex('20..12');}).toThrow();
   });

   it('lexes an identifier', function(){
    var tokens = lexer.lex('tiger2012');
    expect(tokens[0]).toEqual({type: Lexer.TOK_ID, value: 'tiger2012'});
   });

   it('doensn\'t let identifiers start with a number', function(){
      var tokens = lexer.lex('2012tiger');
      expect(tokens[0]).toEqual({type: Lexer.TOK_INT, value: '2012'});
      expect(tokens[1]).toEqual({type: Lexer.TOK_ID, value: 'tiger'});
   });

   it('accepts identifiers with a number in the middle', function(){
    var tokens = lexer.lex('tiger2012tiger');
    expect(tokens[0]).toEqual({type: Lexer.TOK_ID, value: 'tiger2012tiger'});
   });

   it('throws an exception if identifier has an invalid character', function(){
    expect(function(){lexer.lex('tiger@tiger');}).toThrow();
   });

   it('allows identifiers to use an underscore in any position', function(){
    var tokens = lexer.lex('_tiger_tiger_');
    expect(tokens[0]).toEqual({ type: Lexer.TOK_ID, value: '_tiger_tiger_'});
   });

   it('properly lexes identifiers that are key words', function(){
    var tokens = lexer.lex('while');
    expect(tokens[0]).toEqual({ type: Lexer.TOK_WHILE, value : 'while'});
   });

   it('properly lexes reserved characters', function(){
    var lexed = [];
    lexed.push({ type: Lexer.TOK_LPAREN, value: '('});
    lexed.push({ type: Lexer.TOK_RPAREN, value: ')'});
    lexed.push({ type: Lexer.TOK_PLUS, value: '+'});
    lexed.push({ type: Lexer.TOK_MINUS, value: '-'});
    lexed.push({ type: Lexer.TOK_STAR, value: '*'});
    lexed.push({ type: Lexer.TOK_SLASH, value: '/'});
    lexed.push({ type: Lexer.TOK_COLON, value: ':'});
    lexed.push({ type: Lexer.TOK_SEMI, value: ';'});

    var tokens = lexer.lex('()+-*/:;');

    expect(tokens).toEqual(lexed);
   });

   it('lexes the equality test sign', function(){
    var tokens = lexer.lex('a == b');
    expect(tokens[1]).toEqual({ type: Lexer.TOK_EQLS, value: "=="});
   });

   it(' lexes the greater than test operation', function(){
    var tokens = lexer.lex('a > b');
    expect(tokens[1]).toEqual({ type: Lexer.TOK_GTHAN, value: ">"});
   });

   it(' lexes the greater than test operation', function(){
    var tokens = lexer.lex('a >= b');
    expect(tokens[1]).toEqual({ type: Lexer.TOK_GTHANEQ, value: ">="});
   });

   it(' lexes the greater than test operation', function(){
    var tokens = lexer.lex('a < b');
    expect(tokens[1]).toEqual({ type: Lexer.TOK_LTHAN, value: "<"});
   });

   it(' lexes the greater than test operation', function(){
    var tokens = lexer.lex('a <= b');
    expect(tokens[1]).toEqual({ type: Lexer.TOK_LTHANEQ, value: "<="});
   });

   it('lexes boolean literals', function(){
    var tokens = lexer.lex('true');
    expect(tokens[0]).toEqual({ type: Lexer.TOK_BOOL, value: 'true'});
   });

   it('lexes string literals with double quotes', function(){
    var tokens = lexer.lex('"tiger"');
    expect(tokens[0]).toEqual({ type: Lexer.TOK_STRING, value: "'tiger'"});
   });

   it('lexes string literals with single quotes', function(){
    var tokens = lexer.lex("'tiger'");
    expect(tokens[0]).toEqual({ type: Lexer.TOK_STRING, value: "'tiger'"});
   });

   it('throws error on a strings mismatched quotes', function(){
    expect(function(){lexer.lex("tiger'");}).toThrow();
   });

   it('can lex strings with spaces in them', function(){
    var tokens = lexer.lex("'hello there world'");
    expect(tokens[0]).toEqual({type: Lexer.TOK_STRING, value: "'hello there world'"});
   });

   it('can lex strings with special characters in them', function(){
    var tokens = lexer.lex("'$hell@ ^there *world*!'");
    expect(tokens[0]).toEqual({type: Lexer.TOK_STRING, value: "'$hell@ ^there *world*!'"});
   });
});
