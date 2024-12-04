/* PrismJS 1.29.0 - XML and JSON Syntax Highlighting */
var Prism = (function () {
    // Helper function to create a token
    function createToken(type, content, alias) {
        return {
            type: type,
            content: content,
            alias: alias
        };
    }

    // Main Prism object
    var prism = {
        // Language definitions
        languages: {
            xml: {
                'comment': {
                    pattern: /<!--[\s\S]*?-->/,
                    greedy: true
                },
                'prolog': {
                    pattern: /<\?[\s\S]+?\?>/,
                    greedy: true
                },
                'doctype': {
                    pattern: /<!DOCTYPE[\s\S]+?>/i,
                    greedy: true
                },
                'cdata': {
                    pattern: /(<!\[CDATA\[)[\s\S]*?(?=\]\]>)\]\]>/i,
                    lookbehind: true,
                    greedy: true
                },
                'tag': {
                    pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/i,
                    greedy: true,
                    inside: {
                        'tag': {
                            pattern: /^<\/?[^\s>\/]+/i,
                            inside: {
                                'punctuation': /^<\/?/,
                                'namespace': /^[^\s>\/:]+:/
                            }
                        },
                        'attr-value': {
                            pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/i,
                            inside: {
                                'punctuation': [/^=/, /"|'/]
                            }
                        },
                        'punctuation': /\/?>/,
                        'attr-name': {
                            pattern: /[^\s>\/]+/,
                            inside: {
                                'namespace': /^[^\s>\/:]+:/
                            }
                        }
                    }
                },
                'entity': [
                    {
                        pattern: /&[\da-z]{1,8};/i,
                        alias: 'named-entity'
                    },
                    /&#x?[\da-f]{1,8};/i
                ]
            },
            json: {
                'property': {
                    pattern: /"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,
                    greedy: true
                },
                'string': {
                    pattern: /"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
                    greedy: true
                },
                'number': /-?\d+\.?\d*(?:e[+-]?\d+)?/i,
                'punctuation': /[{}[\],]/,
                'operator': /:/,
                'boolean': /\b(?:true|false)\b/,
                'null': {
                    pattern: /\bnull\b/,
                    alias: 'keyword'
                }
            }
        },

        // Highlight a code block
        highlight: function(text, grammar, language) {
            var tokens = this.tokenize(text, grammar);
            return this.stringify(tokens, language);
        },

        // Tokenize input text
        tokenize: function(text, grammar) {
            var tokens = [];
            var rest = text;

            for (var tokenName in grammar) {
                if (!grammar.hasOwnProperty(tokenName)) continue;

                var pattern = grammar[tokenName].pattern || grammar[tokenName];
                
                var match = pattern.exec(rest);
                if (match) {
                    tokens.push(createToken(tokenName, match[0]));
                    rest = rest.slice(match[0].length);
                }
            }

            if (rest) tokens.push(createToken('text', rest));
            return tokens;
        },

        // Convert tokens to HTML
        stringify: function(tokens, language) {
            return tokens.map(function(token) {
                var content = token.content;
                
                if (token.type !== 'text') {
                    content = '<span class="token ' + token.type + '">' + 
                             content + '</span>';
                }
                
                return content;
            }).join('');
        }
    };

    // Initialize highlighting
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('pre code').forEach(function(element) {
            // Determine language from class
            var classes = element.className.split(' ');
            var language = null;
            
            for (var i = 0; i < classes.length; i++) {
                if (classes[i].startsWith('language-')) {
                    language = classes[i].substring(9);
                    break;
                }
            }

            if (language && prism.languages[language]) {
                var code = element.textContent;
                element.innerHTML = prism.highlight(code, prism.languages[language], language);
            }
        });
    });

    return prism;
})();