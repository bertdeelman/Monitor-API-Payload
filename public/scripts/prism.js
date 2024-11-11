/* PrismJS 1.29.0 */
var Prism = (function () {

    var lang = /\blang(?:uage)?-([\w-]+)\b/i;
    
    function Prism(options) {
        this.options = options || {};
        this.languages = {};
    }

    // Add basic languages
    Prism.languages = {
        xml: {
            tag: {
                pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/i,
                greedy: true,
                inside: {
                    tag: {
                        pattern: /^<\/?[^\s>\/]+/i,
                        inside: {
                            punctuation: /^<\/?/,
                            namespace: /^[^\s>\/:]+:/
                        }
                    },
                    'attr-value': {
                        pattern: /=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+)/i,
                        inside: {
                            punctuation: [
                                /^=/,
                                {
                                    pattern: /(^|[^\\])["']/,
                                    lookbehind: true
                                }
                            ]
                        }
                    },
                    punctuation: /\/?>/,
                    'attr-name': {
                        pattern: /[^\s>\/]+/,
                        inside: {
                            namespace: /^[^\s>\/:]+:/
                        }
                    }
                }
            },
            entity: /&#?[\da-z]{1,8};/i
        },
        
        json: {
            property: {
                pattern: /"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,
                greedy: true
            },
            string: {
                pattern: /"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
                greedy: true
            },
            number: /-?\d+\.?\d*([Ee][+-]?\d+)?/,
            punctuation: /[{}[\],]/,
            operator: /:/,
            boolean: /\b(?:true|false)\b/,
            null: /\bnull\b/
        }
    };

    Prism.highlightElement = function(element) {
        var language = (element.className.match(lang) || [,''])[1].toLowerCase();
        var grammar = this.languages[language];
        
        if (!grammar) return;

        var code = element.textContent;
        var env = {
            element: element,
            language: language,
            grammar: grammar,
            code: code
        };

        element.innerHTML = this.highlight(code, grammar, language);
    };

    Prism.highlight = function(text, grammar, language) {
        var tokens = this.tokenize(text, grammar);
        return this.stringify(tokens, language);
    };

    Prism.tokenize = function(text, grammar) {
        var tokens = [];
        var rest = grammar.rest;
        
        if (rest) {
            for (var token in rest) {
                grammar[token] = rest[token];
            }
            delete grammar.rest;
        }
        
        tokenloop: for (var token in grammar) {
            if (!grammar.hasOwnProperty(token) || !grammar[token]) continue;
            
            var pattern = grammar[token];
            pattern = (pattern instanceof RegExp) ? pattern : pattern.pattern || pattern;
            
            for (var i = 0; i < tokens.length; i++) {
                var matches = pattern.exec(text);
                if (!matches) continue;
                
                tokens.push({
                    type: token,
                    content: matches[0]
                });
                
                text = text.slice(matches[0].length);
                continue tokenloop;
            }
            
            if (text) {
                tokens.push({
                    type: 'text',
                    content: text
                });
            }
        }
        
        return tokens;
    };

    Prism.stringify = function(tokens, language) {
        if (typeof tokens === 'string') return tokens;
        
        var result = '';
        tokens.forEach(function(token) {
            var content = token.content;
            
            if (token.type === 'text') {
                result += content;
            } else {
                var className = 'token ' + token.type;
                result += '<span class="' + className + '">' + content + '</span>';
            }
        });
        
        return result;
    };

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        var elements = document.querySelectorAll('code[class*="language-"], [class*="language-"] code');
        elements.forEach(function(element) {
            Prism.highlightElement(element);
        });
    });

    return Prism;
})();