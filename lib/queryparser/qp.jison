/* description: Parses Biblionarrator queries. */

%{
var curindex = 'keyword';
%}

/* lexical grammar */
%lex
%%

\s+                         /* skip whitespace */
"("                         return 'GS'; // Group Start
")"                         return 'GE'; // Group End
(keyword|author|title)      return 'INDEX'
":"                         return 'SEP'
"!"                         return 'NOT'; // Not
"||"                        return 'OR'; // Or
"&&"                        return 'AND'; // And
["][^"]*["]                 return 'PHR'; // Phrase
[^\s()!:|&]+                return 'WORD'
<<EOF>>                     return 'EOF';


/lex

/* operator associations and precedence */
%right OR AND
%left NOT

%start plan

%% /* language grammar */

plan
    : query EOF
        {  /*typeof console !== 'undefined' ? console.log($1) : print($1);*/
            return $1; }
    ;       

query
    : query AND query
        { $$ = [ 'AND', $1, $3 ]; }
    | query OR query
        { $$ = [ 'OR', $1, $3 ]; }
    | NOT query
        { $$ = [ 'NOT', $2 ]; }
    | query query
        { $$ = [ 'AND', $1, $2 ]; }
    | indexterm
        { $$ = $1; }
    | GS query GE
        { $$ = $2; }
    ;

indexterm
    : INDEX SEP atomset
        { curindex = $1; $$ = [ 'HAS', $1, $3 ]; }
    | INDEX SEP phrase
        { curindex = $1; $$ = [ 'HAS', $1, $3 ]; }
    | atomset
        { $$ = [ 'HAS', curindex, $1 ]; }
    | phrase
        { $$ = [ 'HAS', curindex, $1 ]; }
    ;

phrase
    : PHR
        { $$ = [ 'PHRASE', $1.substring(1, $1.length - 1) ]; }
    ;

atomset
    : atomset atom
        { $1.push($2); $$ = $1; }
    | atom
        { $$ = [ $1 ]; }
    ;

atom
    : WORD
        { $$ = $1; }
    ;

