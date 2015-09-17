(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
ne.util.defineNamespace('toast.ui.doc', require('./src/js/app'));

},{"./src/js/app":2}],2:[function(require,module,exports){
var Menu = require('./menu');
var Content = require('./content');
var Search = require('./search');

var App = ne.util.defineClass({
    /**
     * Initialize
     * @param {object} option 
     */
    init: function(option) {
        this.menu = new Menu({
            element: option.element.menu,
            tab: option.element.tab
        });
        this.content = new Content({
            element: option.element.content,
            codeElement: option.element.code,
            content: option.data.content
        });
        this.search = new Search({
            element: option.element.search
        });
        this._menu = option.data.menu;
        this.setMenu();
        this.setEvent();
    },

    /**
     * Set events
     */
    setEvent: function() {
        this.content.on('notify', ne.util.bind(this.changePage, this));
        this.menu.on('notify', ne.util.bind(this.changePage, this));
        this.menu.on('tabChange', ne.util.bind(this.changeTab, this));
        this.search.on('search', ne.util.bind(this.searchList, this));
        this.search.on('notify', ne.util.bind(this.changePage, this));
    },

    /**
     * Search words by lnb data
     */
    searchList: function(data) {
        var word = data.text,
            classes = this._menu.classes,
            namespaces = this._menu.namespaces,
            result = this.findIn(word, classes);
        result = result.concat(this.findIn(word, namespaces));
        if (!word) {
            result = [];
        }
        data.callback(result);
    },

    /**
     * Find in lnb array
     */
    findIn: function(str, array) {
        var result = [], 
            self = this;
        ne.util.forEach(array, function(el) {
            var code = self.getCode(el.meta);
            if (el.methods) {
                ne.util.forEach(el.methods, function(m) {
                    if (m.id.replace('.', '').toLowerCase().indexOf(str.toLowerCase()) !== -1 && m.access !== 'private') {
                        result.push({
                            id: m.id,
                            label: self.highlighting(m.id, str),
                            group: el.longname,
                            code: code
                        });
                    }
                });            
            }
        });
        return result;
    },

    /**
     * Highlight query
     */
    highlighting: function(word, str) {
        var reg = new RegExp(str, 'i', 'g'),
            origin = reg.exec(word)[0];
        return word.replace(reg, '<strong>' + origin + '</strong>');
    },

    /**
     * Chagne Tab
     */
    changeTab: function(data) {
        this.content.changeTab(data.state);
   },

    /**
     * Set Content page by data
     */
    changePage: function(data) {
        var html;
        if (data.name) {
            this.changeTab({state: 'info'});
            this.menu.turnOnInfo();
            this.content.setInfo(fedoc.content[data.name + '.html']);
            this.content.setCode(fedoc.content[data.codeName + '.html']);
            this.content.moveTo('#contentTab');
        }

        if (data.line) {
            this.menu.turnOnCode();
            this.content.moveToLine(data.line);
        }   
        
        if (data.href) {
            this.content.moveTo(data.href);
        }
        this.menu.focus(data.name, data.codeName); 
        this.search.reset(); 
    },

    /**
     * Set menu object to html
     * @todo This might be moved to menu.js
     */
    setMenu: function() {
        var html = '',
            self = this,
            classes = this._menu.classes,
            namespace = this._menu.namespaces,
            tutorials = this._menu.tutorials;


        if (tutorials && tutorials.length) {
            html += '<h3>Samples</h3>';
        }

        html += '<ul class="tutorials">';

        ne.util.forEach(tutorials, function(el) {
            html += '<li clsss="tutorials"><a class="tutorialLink" href="tutorial-' + el.name + '.html" target="_blank">' + el.title + '</a></li>';
        });
        
        html += '</ul>';
        
        if (classes && classes.length) {
            html += '<h3>Classes</h3>';
        }

        html += '<ul class="classes">';
        ne.util.forEach(classes, function(el) {
            var code = self.getCode(el.meta);
            html += '<li class="listitem" data-spec="'+el.longname+'" data-code="'+code+'"><a href="#">' + el.longname + '</a>';
            if (el.members) {           
                html += '<div class="title"><strong>Members</strong></div>';
                html += '<ul class="inner">';
                ne.util.forEach(el.members, function(m) {
                    html += '<li class="memberitem" data-spec="' + el.longname + '" data-code="' + code + '"><a href="#' + m.id + '">' + m.id + '</a></li>';
                });
                html += '</ul>';
            }
            if (el.methods) {
                html += '<div class="title"><strong>Methods</strong></div>';
                html += '<ul class="inner">';
                ne.util.forEach(el.methods, function(m) {
                    if (m.access === 'private') return;
                    html += '<li class="memberitem" data-spec="'+el.longname+'" data-code="'+code+'"><a href="#' + m.id + '">' + m.id + '</a></li>';
                });
                html += '</ul>';
            }
            html += '</li>';
        });
        html += '</ul>';
        
        if (namespace && namespace.length) {
            html += '<h3>Modules</h3>';
        }
        
        html += '<ul class="namespace">';
        ne.util.forEach(namespace, function(el) {
            var code = self.getCode(el.meta);
            html += '<li class="listitem" data-spec="'+el.longname+'" data-code="'+code+'"><a href="#">' + el.longname + '</a>';
            if (el.members) {
                html += '<div class="title"><strong>Members</strong></div>';
                html += '<ul class="inner">';
                ne.util.forEach(el.members, function(m) {
                    html += '<li class="memberitem" data-spec="'+el.longname+'" data-code="'+code+'"><a href="#' + m.id + '">' + m.id + '</a></li>';
                });
                html += '</ul>';
            }
            if (el.methods) {
                html += '<div class="title"><strong>Methods</strong></div>';
                html += '<ul class="inner">';
            ne.util.forEach(el.methods, function(m) {
                if (m.access === 'private') return;
                html += '<li class="memberitem" data-spec="'+el.longname+'" data-code="'+code+'"><a href="#' + m.id + '">' + m.id.replace('.', '') + '</a></li>';
                });
                html += '</ul>';
            }
            html += '</li>';
});
        html += '</ul>';
        this.menu.setMenu(html);
    },

    find: function() {
        return [
            {
                id: 'idididid'
            },
            {
                id: 'asdfasdf'
            }
        ];
    },
    
    /**
     * Meta data
     */
    getCode: function(meta) {
        var path = meta.path.split('/src/')[1];
        
        if (path && path.indexOf('js/') !== -1) {
            path = path.split('js/')[1];
        } else if (path && path.indexOf('js') !== -1) {
            path = path.split('js')[1];
        }

       if (!path) {
            return meta.filename;
        }
        return path.replace(/\//g, '_') + '_' + meta.filename;
    },

    /**
     * Set content
     */
    setContent: function(html) {
        this.content.setInfo(html);
    }, 
    
    /**
     * Pick data from text files
     * @param {string} name A file name
     */
    pickData: function(name, callback) {
        var url = name,
            urlCode = name + '.js';
        
        this.content.setInfo(fedoc.content[name]);
        this.content.setCode(fedoc.content[urlCode]);
    },
});

module.exports = App;

},{"./content":3,"./menu":4,"./search":5}],3:[function(require,module,exports){
var Content = ne.util.defineClass({
    /**
     * Initialize
     */
    init: function(option) {
        this.$info = option.element;
        this.$code = option.codeElement;
        this.state = 'info';
        this.$code.hide();
        this.setInfo(option.content);
        this.setEvent();
    },

    setEvent: function() {
        this.$info.on('click', ne.util.bind(this.onClick, this));
    },

    onClick: function(e) {
        var target = e.target,
            tagName = target.tagName.toLowerCase(), 
            readme = this.$info.find('.readme');
        if (tagName === 'a') {
            if (readme.length &&  $.contains(readme[0], target)) {
                open(target.href);
            }
           e.preventDefault();
        }
        if (
            tagName === 'code' &&
            $(target).parent().hasClass('container-source') 
           ) {
            this.fire('notify', {
                line: parseInt(target.innerHTML.replace('line', ''), 10) || 1
            });
        }
    },

    /**
     * Set information html to info
     */
    setInfo: function(html) {
        this.$info.html(html);
    },

    /**
     * Set code html to code
     */
    setCode: function(code) {
        this.$code.html(code);
        this.setCodeLine();
    },
    
    /**
     * Set code line
     */
    setCodeLine: function() {
        prettyPrint();
        var source = this.$code.find('.prettyprint');
        var i = 0;
        var lineNumber = 0;
        var lineId;
        var lines;
        var totalLines;
        var anchorHash;

        if (source && source[0]) {
            anchorHash = document.location.hash.substring(1);
            lines = source[0].getElementsByTagName('li');
            totalLines = lines.length;

            for (; i < totalLines; i++) {
                lineNumber++;
                lineId = 'line' + lineNumber;
                lines[i].id = lineId;
                if (lineId === anchorHash) {
                    lines[i].className += ' selected';
                }
            }
        }
    },

    /**
     * Change tab for state change
     * @param {string} state A state to chagne tab
     */
    changeTab: function(state) {
        if (state === 'info') {
            this._enableInfo();
        } else {
            this._enableCode();
        }
    },

    /**
     * Be enable info state
     */
    _enableInfo: function() {
        this.state = 'info';        
        this.$info.show();
        this.$code.hide();
    },

    /**
     * Be enable code state
     */
    _enableCode: function() {
        this.state = 'code';
        this.$code.show();
        this.$info.hide();
    },

    /**
     * Move to moethod by id
     */
    moveTo: function(id) {
        document.location = document.URL.split('#')[0] + id; 
    },

    /**
     * Change tab and move to line (number)
     * @param {number} line The number of line to move
     */
    moveToLine: function(line) {
        this.changeTab('code');
        document.location = document.URL.split('#')[0] + '#line' + line; 
    }
});

ne.util.CustomEvents.mixin(Content);
module.exports = Content;

},{}],4:[function(require,module,exports){
var Menu = ne.util.defineClass({
    /**
     * Initialize
     */
    init: function(option) {
        this.$menu = option.element;
        this.$tab = option.tab;
        this.current = 'main';
        this.state = 'info';
        this.setEvent();
    },

    /**
     * Set event to page move
     */
    setEvent: function() {
        this.$menu.on('click', ne.util.bind(this.onClickMenu, this));
        this.$tab.on('click', ne.util.bind(this.onClickTab, this));
    },

    /**
     * Tab chnage event
     * @param {object} event The JqueryEvent object
     */
    onClickTab: function(event) {
        var target = $(event.target);
        if (target.hasClass('tabmenu')
           && !target.hasClass('on')) {
            var isCode = target.hasClass('code');
            this.fire('tabChange', {
                state: isCode ? 'code' : 'info'
            });

            if (isCode) {
                this.turnOnCode();
            } else {
                this.turnOnInfo();
            }
        }
    },

    /**
     * Focus menu
     */
    focus: function(spec, code) {
        if (!spec || !code) {
            return;
        }

        this.$menu.find('.listitem').each(function(index) {
            var self = $(this);
            if (self.attr('data-spec') === spec && self.attr('data-code')) {
                self.addClass('selected');
            } else {
                $(this).removeClass('selected');
            }
        });
    },
    turnOnInfo: function() {
        $('.tabmenu').removeClass('on');
        this.$tab.find('.info').addClass('on');
    },
    turnOnCode: function() {
        $('.tabmenu').removeClass('on');
        this.$tab.find('.code').addClass('on');
    },

    /**
     * Notify for change content
     */
    onClickMenu: function(event) {
        event.preventDefault();
        var target = $(event.target),
            isTutorial = target.hasClass('tutorialLink'),
            href = target.attr('href'),
            target = href ? target.parent() : target,
            spec = target.attr('data-spec'),
            code = target.attr('data-code');

        if (isTutorial) {
            window.open(href);
            return;
        }

        if (spec) {
            this.fire('notify', {
                name: spec,
                codeName: code,
                href: href
            });
        }
       
    },

    /**
     * Set menu html
     * @param {string} html A html string to set menu
     */
    setMenu: function(html) {
        this.$menu.html(html);
    },

    /**
     * Select menu with state
     */
    select: function(menu, state) {
        this.current = menu;
        this.state = state || 'info';
    },
    
    /**
     * Open selected menu
     */ 
    open: function(menu) {
        this.$menu.find('.' + menu).addClass('unfold'); 
    },

    /**
     * Set tab menu html
     */
    setTab: function(html) {
        this.$tab.html(html);
    }, 
    
    /**
     * On selected tab
     */
    tabOn: function(name) {
         this.$tab.removeClass();
         this.$tab.addClass('tab tab-' + name);
    }
});

ne.util.CustomEvents.mixin(Menu);
module.exports = Menu;

},{}],5:[function(require,module,exports){
var Search = ne.util.defineClass({

    keyUp: 38,
    keyDown: 40,
    enter: 13,

    /**
     * Initialize
     */
    init: function(option, app) {
        this.$el = option.element;
        this.$input = this.$el.find('input');
        this.$list = this.$el.find('.searchList');
        this.$list.hide();
        this.root = app;
        this._addEvent();
        this.index = null;
    },

    /**
     * Add Events
     */
    _addEvent: function() {
        this.$input.on('keyup', ne.util.bind(function(event) {
            if(event.keyCode === this.keyUp || event.keyCode === this.keyDown || event.keyCode === this.enter) {
                if (this.$list.css('display') !== 'none') {
                    if (event.keyCode === this.enter) {
                        // that is no way, this.find(event.target.value);
                        var selected = this.$list.find('li.on'), 
                            first = this.$list.find('li').eq(0),
                            query;
                        if (selected.length !== 0) {
                            this.onSubmit({ target: selected[0] });
                        } else if (first.length !== 0) {
                            this.onSubmit({ target: first[0]});
                        }
                    } else {
                        this.selectItem(event.keyCode);
                    }
                }
            } else {
                this.find(event.target.value); 
            }
        }, this));
    },

    /**
     * Select item by keyboard
     */
    selectItem: function(code) {
        this.$list.find('li').removeClass('on');
        var len = this.$list.find('li').length;
        if (!ne.util.isNumber(this.index)) {
            this.index = 0;
        }  else {
            if (code === this.keyUp) {
                this.index = (this.index - 1 + len) % len;
            } else {
                this.index = (this.index + 1) % len;
            }
        }
        this.$list.find('li').eq(this.index).addClass('on');
        this.$input.val(this.$list.find('li.on').find('a').text());
    },
    
    /**
     * Reset search
     */ 
    reset: function() {
        this.$input.val('');
        this.$list.find('li').off('click');
        this.$list.empty();
        this.$list.hide();
        this.index = null;
    },

    /**
     * Submit for change by search result list
     */ 
    onSubmit: function(event) {
        var target = event.target,
            href,
            spec, 
            code;
        target = this.getTarget(target);
        href = target.find('a').attr('href');
        spec = target.find('span').attr('data-spec');
        code = target.find('span').attr('data-code');
        
        this.fire('notify', {
             codeName: code,
             name: spec,
             href: href
        });
    }, 

    /**
     * Get target
     * @param {object} target The target that have to extract
     */
    getTarget: function(target) {
        var tagName = target.tagName.toUpperCase(),
            $target = $(target);
        if (tagName !== 'LI') {
            return this.getTarget($target.parent()[0]);
        } else {
            return $target;
        }
    },
    
    /**
     * Find word by input text
     */
    find: function(text) {
        var self = this;
        this.$list.hide();
        this.fire('search', { 
            text: text,
            callback: function(data) {
                self.update(data);
            }
        });
    },

    /**
     * Update search list
     */
    update: function(list) {
        var str = ''; 
        ne.util.forEach(list, function(el) {
            str += '<li><span data-spec="' + el.group + '" data-code="' + el.code + '"><a href="#' + el.id + '">' + el.label.replace('.', '') + '</a><span class="group">' + el.group + '</span></span></li>'; 
        });
        this.$list.html(str);
        if (str) {
            this.$list.show();
        }
        this.$list.find('li').on('click', ne.util.bind(this.onSubmit, this)); 
    }
});

ne.util.CustomEvents.mixin(Search);
module.exports = Search;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9hcHAuanMiLCJzcmMvanMvY29udGVudC5qcyIsInNyYy9qcy9tZW51LmpzIiwic3JjL2pzL3NlYXJjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm5lLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0b2FzdC51aS5kb2MnLCByZXF1aXJlKCcuL3NyYy9qcy9hcHAnKSk7XG4iLCJ2YXIgTWVudSA9IHJlcXVpcmUoJy4vbWVudScpO1xudmFyIENvbnRlbnQgPSByZXF1aXJlKCcuL2NvbnRlbnQnKTtcbnZhciBTZWFyY2ggPSByZXF1aXJlKCcuL3NlYXJjaCcpO1xuXG52YXIgQXBwID0gbmUudXRpbC5kZWZpbmVDbGFzcyh7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb24gXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMubWVudSA9IG5ldyBNZW51KHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IG9wdGlvbi5lbGVtZW50Lm1lbnUsXG4gICAgICAgICAgICB0YWI6IG9wdGlvbi5lbGVtZW50LnRhYlxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb250ZW50ID0gbmV3IENvbnRlbnQoe1xuICAgICAgICAgICAgZWxlbWVudDogb3B0aW9uLmVsZW1lbnQuY29udGVudCxcbiAgICAgICAgICAgIGNvZGVFbGVtZW50OiBvcHRpb24uZWxlbWVudC5jb2RlLFxuICAgICAgICAgICAgY29udGVudDogb3B0aW9uLmRhdGEuY29udGVudFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZWFyY2ggPSBuZXcgU2VhcmNoKHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IG9wdGlvbi5lbGVtZW50LnNlYXJjaFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fbWVudSA9IG9wdGlvbi5kYXRhLm1lbnU7XG4gICAgICAgIHRoaXMuc2V0TWVudSgpO1xuICAgICAgICB0aGlzLnNldEV2ZW50KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBldmVudHNcbiAgICAgKi9cbiAgICBzZXRFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuY29udGVudC5vbignbm90aWZ5JywgbmUudXRpbC5iaW5kKHRoaXMuY2hhbmdlUGFnZSwgdGhpcykpO1xuICAgICAgICB0aGlzLm1lbnUub24oJ25vdGlmeScsIG5lLnV0aWwuYmluZCh0aGlzLmNoYW5nZVBhZ2UsIHRoaXMpKTtcbiAgICAgICAgdGhpcy5tZW51Lm9uKCd0YWJDaGFuZ2UnLCBuZS51dGlsLmJpbmQodGhpcy5jaGFuZ2VUYWIsIHRoaXMpKTtcbiAgICAgICAgdGhpcy5zZWFyY2gub24oJ3NlYXJjaCcsIG5lLnV0aWwuYmluZCh0aGlzLnNlYXJjaExpc3QsIHRoaXMpKTtcbiAgICAgICAgdGhpcy5zZWFyY2gub24oJ25vdGlmeScsIG5lLnV0aWwuYmluZCh0aGlzLmNoYW5nZVBhZ2UsIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VhcmNoIHdvcmRzIGJ5IGxuYiBkYXRhXG4gICAgICovXG4gICAgc2VhcmNoTGlzdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgd29yZCA9IGRhdGEudGV4dCxcbiAgICAgICAgICAgIGNsYXNzZXMgPSB0aGlzLl9tZW51LmNsYXNzZXMsXG4gICAgICAgICAgICBuYW1lc3BhY2VzID0gdGhpcy5fbWVudS5uYW1lc3BhY2VzLFxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5maW5kSW4od29yZCwgY2xhc3Nlcyk7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodGhpcy5maW5kSW4od29yZCwgbmFtZXNwYWNlcykpO1xuICAgICAgICBpZiAoIXdvcmQpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGRhdGEuY2FsbGJhY2socmVzdWx0KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCBpbiBsbmIgYXJyYXlcbiAgICAgKi9cbiAgICBmaW5kSW46IGZ1bmN0aW9uKHN0ciwgYXJyYXkpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdLCBcbiAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuICAgICAgICBuZS51dGlsLmZvckVhY2goYXJyYXksIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgY29kZSA9IHNlbGYuZ2V0Q29kZShlbC5tZXRhKTtcbiAgICAgICAgICAgIGlmIChlbC5tZXRob2RzKSB7XG4gICAgICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGVsLm1ldGhvZHMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG0uaWQucmVwbGFjZSgnLicsICcnKS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc3RyLnRvTG93ZXJDYXNlKCkpICE9PSAtMSAmJiBtLmFjY2VzcyAhPT0gJ3ByaXZhdGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IG0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHNlbGYuaGlnaGxpZ2h0aW5nKG0uaWQsIHN0ciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IGVsLmxvbmduYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IGNvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7ICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWdobGlnaHQgcXVlcnlcbiAgICAgKi9cbiAgICBoaWdobGlnaHRpbmc6IGZ1bmN0aW9uKHdvcmQsIHN0cikge1xuICAgICAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cChzdHIsICdpJywgJ2cnKSxcbiAgICAgICAgICAgIG9yaWdpbiA9IHJlZy5leGVjKHdvcmQpWzBdO1xuICAgICAgICByZXR1cm4gd29yZC5yZXBsYWNlKHJlZywgJzxzdHJvbmc+JyArIG9yaWdpbiArICc8L3N0cm9uZz4nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hhZ25lIFRhYlxuICAgICAqL1xuICAgIGNoYW5nZVRhYjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB0aGlzLmNvbnRlbnQuY2hhbmdlVGFiKGRhdGEuc3RhdGUpO1xuICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBDb250ZW50IHBhZ2UgYnkgZGF0YVxuICAgICAqL1xuICAgIGNoYW5nZVBhZ2U6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGh0bWw7XG4gICAgICAgIGlmIChkYXRhLm5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlVGFiKHtzdGF0ZTogJ2luZm8nfSk7XG4gICAgICAgICAgICB0aGlzLm1lbnUudHVybk9uSW5mbygpO1xuICAgICAgICAgICAgdGhpcy5jb250ZW50LnNldEluZm8oZmVkb2MuY29udGVudFtkYXRhLm5hbWUgKyAnLmh0bWwnXSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQuc2V0Q29kZShmZWRvYy5jb250ZW50W2RhdGEuY29kZU5hbWUgKyAnLmh0bWwnXSk7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQubW92ZVRvKCcjY29udGVudFRhYicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRhdGEubGluZSkge1xuICAgICAgICAgICAgdGhpcy5tZW51LnR1cm5PbkNvZGUoKTtcbiAgICAgICAgICAgIHRoaXMuY29udGVudC5tb3ZlVG9MaW5lKGRhdGEubGluZSk7XG4gICAgICAgIH0gICBcbiAgICAgICAgXG4gICAgICAgIGlmIChkYXRhLmhyZWYpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGVudC5tb3ZlVG8oZGF0YS5ocmVmKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1lbnUuZm9jdXMoZGF0YS5uYW1lLCBkYXRhLmNvZGVOYW1lKTsgXG4gICAgICAgIHRoaXMuc2VhcmNoLnJlc2V0KCk7IFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgbWVudSBvYmplY3QgdG8gaHRtbFxuICAgICAqIEB0b2RvIFRoaXMgbWlnaHQgYmUgbW92ZWQgdG8gbWVudS5qc1xuICAgICAqL1xuICAgIHNldE1lbnU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaHRtbCA9ICcnLFxuICAgICAgICAgICAgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICBjbGFzc2VzID0gdGhpcy5fbWVudS5jbGFzc2VzLFxuICAgICAgICAgICAgbmFtZXNwYWNlID0gdGhpcy5fbWVudS5uYW1lc3BhY2VzLFxuICAgICAgICAgICAgdHV0b3JpYWxzID0gdGhpcy5fbWVudS50dXRvcmlhbHM7XG5cblxuICAgICAgICBpZiAodHV0b3JpYWxzICYmIHR1dG9yaWFscy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGh0bWwgKz0gJzxoMz5TYW1wbGVzPC9oMz4nO1xuICAgICAgICB9XG5cbiAgICAgICAgaHRtbCArPSAnPHVsIGNsYXNzPVwidHV0b3JpYWxzXCI+JztcblxuICAgICAgICBuZS51dGlsLmZvckVhY2godHV0b3JpYWxzLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgaHRtbCArPSAnPGxpIGNsc3NzPVwidHV0b3JpYWxzXCI+PGEgY2xhc3M9XCJ0dXRvcmlhbExpbmtcIiBocmVmPVwidHV0b3JpYWwtJyArIGVsLm5hbWUgKyAnLmh0bWxcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nICsgZWwudGl0bGUgKyAnPC9hPjwvbGk+JztcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBodG1sICs9ICc8L3VsPic7XG4gICAgICAgIFxuICAgICAgICBpZiAoY2xhc3NlcyAmJiBjbGFzc2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgaHRtbCArPSAnPGgzPkNsYXNzZXM8L2gzPic7XG4gICAgICAgIH1cblxuICAgICAgICBodG1sICs9ICc8dWwgY2xhc3M9XCJjbGFzc2VzXCI+JztcbiAgICAgICAgbmUudXRpbC5mb3JFYWNoKGNsYXNzZXMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgY29kZSA9IHNlbGYuZ2V0Q29kZShlbC5tZXRhKTtcbiAgICAgICAgICAgIGh0bWwgKz0gJzxsaSBjbGFzcz1cImxpc3RpdGVtXCIgZGF0YS1zcGVjPVwiJytlbC5sb25nbmFtZSsnXCIgZGF0YS1jb2RlPVwiJytjb2RlKydcIj48YSBocmVmPVwiI1wiPicgKyBlbC5sb25nbmFtZSArICc8L2E+JztcbiAgICAgICAgICAgIGlmIChlbC5tZW1iZXJzKSB7ICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwidGl0bGVcIj48c3Ryb25nPk1lbWJlcnM8L3N0cm9uZz48L2Rpdj4nO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzx1bCBjbGFzcz1cImlubmVyXCI+JztcbiAgICAgICAgICAgICAgICBuZS51dGlsLmZvckVhY2goZWwubWVtYmVycywgZnVuY3Rpb24obSkge1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8bGkgY2xhc3M9XCJtZW1iZXJpdGVtXCIgZGF0YS1zcGVjPVwiJyArIGVsLmxvbmduYW1lICsgJ1wiIGRhdGEtY29kZT1cIicgKyBjb2RlICsgJ1wiPjxhIGhyZWY9XCIjJyArIG0uaWQgKyAnXCI+JyArIG0uaWQgKyAnPC9hPjwvbGk+JztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8L3VsPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWwubWV0aG9kcykge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJ0aXRsZVwiPjxzdHJvbmc+TWV0aG9kczwvc3Ryb25nPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPHVsIGNsYXNzPVwiaW5uZXJcIj4nO1xuICAgICAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChlbC5tZXRob2RzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtLmFjY2VzcyA9PT0gJ3ByaXZhdGUnKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxsaSBjbGFzcz1cIm1lbWJlcml0ZW1cIiBkYXRhLXNwZWM9XCInK2VsLmxvbmduYW1lKydcIiBkYXRhLWNvZGU9XCInK2NvZGUrJ1wiPjxhIGhyZWY9XCIjJyArIG0uaWQgKyAnXCI+JyArIG0uaWQgKyAnPC9hPjwvbGk+JztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8L3VsPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodG1sICs9ICc8L2xpPic7XG4gICAgICAgIH0pO1xuICAgICAgICBodG1sICs9ICc8L3VsPic7XG4gICAgICAgIFxuICAgICAgICBpZiAobmFtZXNwYWNlICYmIG5hbWVzcGFjZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGh0bWwgKz0gJzxoMz5Nb2R1bGVzPC9oMz4nO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBodG1sICs9ICc8dWwgY2xhc3M9XCJuYW1lc3BhY2VcIj4nO1xuICAgICAgICBuZS51dGlsLmZvckVhY2gobmFtZXNwYWNlLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgdmFyIGNvZGUgPSBzZWxmLmdldENvZGUoZWwubWV0YSk7XG4gICAgICAgICAgICBodG1sICs9ICc8bGkgY2xhc3M9XCJsaXN0aXRlbVwiIGRhdGEtc3BlYz1cIicrZWwubG9uZ25hbWUrJ1wiIGRhdGEtY29kZT1cIicrY29kZSsnXCI+PGEgaHJlZj1cIiNcIj4nICsgZWwubG9uZ25hbWUgKyAnPC9hPic7XG4gICAgICAgICAgICBpZiAoZWwubWVtYmVycykge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJ0aXRsZVwiPjxzdHJvbmc+TWVtYmVyczwvc3Ryb25nPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPHVsIGNsYXNzPVwiaW5uZXJcIj4nO1xuICAgICAgICAgICAgICAgIG5lLnV0aWwuZm9yRWFjaChlbC5tZW1iZXJzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxsaSBjbGFzcz1cIm1lbWJlcml0ZW1cIiBkYXRhLXNwZWM9XCInK2VsLmxvbmduYW1lKydcIiBkYXRhLWNvZGU9XCInK2NvZGUrJ1wiPjxhIGhyZWY9XCIjJyArIG0uaWQgKyAnXCI+JyArIG0uaWQgKyAnPC9hPjwvbGk+JztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8L3VsPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWwubWV0aG9kcykge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJ0aXRsZVwiPjxzdHJvbmc+TWV0aG9kczwvc3Ryb25nPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPHVsIGNsYXNzPVwiaW5uZXJcIj4nO1xuICAgICAgICAgICAgbmUudXRpbC5mb3JFYWNoKGVsLm1ldGhvZHMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgICAgICAgICBpZiAobS5hY2Nlc3MgPT09ICdwcml2YXRlJykgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxsaSBjbGFzcz1cIm1lbWJlcml0ZW1cIiBkYXRhLXNwZWM9XCInK2VsLmxvbmduYW1lKydcIiBkYXRhLWNvZGU9XCInK2NvZGUrJ1wiPjxhIGhyZWY9XCIjJyArIG0uaWQgKyAnXCI+JyArIG0uaWQucmVwbGFjZSgnLicsICcnKSArICc8L2E+PC9saT4nO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzwvdWw+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGh0bWwgKz0gJzwvbGk+Jztcbn0pO1xuICAgICAgICBodG1sICs9ICc8L3VsPic7XG4gICAgICAgIHRoaXMubWVudS5zZXRNZW51KGh0bWwpO1xuICAgIH0sXG5cbiAgICBmaW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ2lkaWRpZGlkJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZDogJ2FzZGZhc2RmJ1xuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogTWV0YSBkYXRhXG4gICAgICovXG4gICAgZ2V0Q29kZTogZnVuY3Rpb24obWV0YSkge1xuICAgICAgICB2YXIgcGF0aCA9IG1ldGEucGF0aC5zcGxpdCgnL3NyYy8nKVsxXTtcbiAgICAgICAgXG4gICAgICAgIGlmIChwYXRoICYmIHBhdGguaW5kZXhPZignanMvJykgIT09IC0xKSB7XG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnanMvJylbMV07XG4gICAgICAgIH0gZWxzZSBpZiAocGF0aCAmJiBwYXRoLmluZGV4T2YoJ2pzJykgIT09IC0xKSB7XG4gICAgICAgICAgICBwYXRoID0gcGF0aC5zcGxpdCgnanMnKVsxXTtcbiAgICAgICAgfVxuXG4gICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gbWV0YS5maWxlbmFtZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGF0aC5yZXBsYWNlKC9cXC8vZywgJ18nKSArICdfJyArIG1ldGEuZmlsZW5hbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldCBjb250ZW50XG4gICAgICovXG4gICAgc2V0Q29udGVudDogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICB0aGlzLmNvbnRlbnQuc2V0SW5mbyhodG1sKTtcbiAgICB9LCBcbiAgICBcbiAgICAvKipcbiAgICAgKiBQaWNrIGRhdGEgZnJvbSB0ZXh0IGZpbGVzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgQSBmaWxlIG5hbWVcbiAgICAgKi9cbiAgICBwaWNrRGF0YTogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHVybCA9IG5hbWUsXG4gICAgICAgICAgICB1cmxDb2RlID0gbmFtZSArICcuanMnO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5jb250ZW50LnNldEluZm8oZmVkb2MuY29udGVudFtuYW1lXSk7XG4gICAgICAgIHRoaXMuY29udGVudC5zZXRDb2RlKGZlZG9jLmNvbnRlbnRbdXJsQ29kZV0pO1xuICAgIH0sXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcHA7XG4iLCJ2YXIgQ29udGVudCA9IG5lLnV0aWwuZGVmaW5lQ2xhc3Moe1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy4kaW5mbyA9IG9wdGlvbi5lbGVtZW50O1xuICAgICAgICB0aGlzLiRjb2RlID0gb3B0aW9uLmNvZGVFbGVtZW50O1xuICAgICAgICB0aGlzLnN0YXRlID0gJ2luZm8nO1xuICAgICAgICB0aGlzLiRjb2RlLmhpZGUoKTtcbiAgICAgICAgdGhpcy5zZXRJbmZvKG9wdGlvbi5jb250ZW50KTtcbiAgICAgICAgdGhpcy5zZXRFdmVudCgpO1xuICAgIH0sXG5cbiAgICBzZXRFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuJGluZm8ub24oJ2NsaWNrJywgbmUudXRpbC5iaW5kKHRoaXMub25DbGljaywgdGhpcykpO1xuICAgIH0sXG5cbiAgICBvbkNsaWNrOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCxcbiAgICAgICAgICAgIHRhZ05hbWUgPSB0YXJnZXQudGFnTmFtZS50b0xvd2VyQ2FzZSgpLCBcbiAgICAgICAgICAgIHJlYWRtZSA9IHRoaXMuJGluZm8uZmluZCgnLnJlYWRtZScpO1xuICAgICAgICBpZiAodGFnTmFtZSA9PT0gJ2EnKSB7XG4gICAgICAgICAgICBpZiAocmVhZG1lLmxlbmd0aCAmJiAgJC5jb250YWlucyhyZWFkbWVbMF0sIHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICBvcGVuKHRhcmdldC5ocmVmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHRhZ05hbWUgPT09ICdjb2RlJyAmJlxuICAgICAgICAgICAgJCh0YXJnZXQpLnBhcmVudCgpLmhhc0NsYXNzKCdjb250YWluZXItc291cmNlJykgXG4gICAgICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5maXJlKCdub3RpZnknLCB7XG4gICAgICAgICAgICAgICAgbGluZTogcGFyc2VJbnQodGFyZ2V0LmlubmVySFRNTC5yZXBsYWNlKCdsaW5lJywgJycpLCAxMCkgfHwgMVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGluZm9ybWF0aW9uIGh0bWwgdG8gaW5mb1xuICAgICAqL1xuICAgIHNldEluZm86IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAgICAgdGhpcy4kaW5mby5odG1sKGh0bWwpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgY29kZSBodG1sIHRvIGNvZGVcbiAgICAgKi9cbiAgICBzZXRDb2RlOiBmdW5jdGlvbihjb2RlKSB7XG4gICAgICAgIHRoaXMuJGNvZGUuaHRtbChjb2RlKTtcbiAgICAgICAgdGhpcy5zZXRDb2RlTGluZSgpO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogU2V0IGNvZGUgbGluZVxuICAgICAqL1xuICAgIHNldENvZGVMaW5lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcHJldHR5UHJpbnQoKTtcbiAgICAgICAgdmFyIHNvdXJjZSA9IHRoaXMuJGNvZGUuZmluZCgnLnByZXR0eXByaW50Jyk7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgdmFyIGxpbmVOdW1iZXIgPSAwO1xuICAgICAgICB2YXIgbGluZUlkO1xuICAgICAgICB2YXIgbGluZXM7XG4gICAgICAgIHZhciB0b3RhbExpbmVzO1xuICAgICAgICB2YXIgYW5jaG9ySGFzaDtcblxuICAgICAgICBpZiAoc291cmNlICYmIHNvdXJjZVswXSkge1xuICAgICAgICAgICAgYW5jaG9ySGFzaCA9IGRvY3VtZW50LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgbGluZXMgPSBzb3VyY2VbMF0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpJyk7XG4gICAgICAgICAgICB0b3RhbExpbmVzID0gbGluZXMubGVuZ3RoO1xuXG4gICAgICAgICAgICBmb3IgKDsgaSA8IHRvdGFsTGluZXM7IGkrKykge1xuICAgICAgICAgICAgICAgIGxpbmVOdW1iZXIrKztcbiAgICAgICAgICAgICAgICBsaW5lSWQgPSAnbGluZScgKyBsaW5lTnVtYmVyO1xuICAgICAgICAgICAgICAgIGxpbmVzW2ldLmlkID0gbGluZUlkO1xuICAgICAgICAgICAgICAgIGlmIChsaW5lSWQgPT09IGFuY2hvckhhc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXNbaV0uY2xhc3NOYW1lICs9ICcgc2VsZWN0ZWQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdGFiIGZvciBzdGF0ZSBjaGFuZ2VcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGUgQSBzdGF0ZSB0byBjaGFnbmUgdGFiXG4gICAgICovXG4gICAgY2hhbmdlVGFiOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgICBpZiAoc3RhdGUgPT09ICdpbmZvJykge1xuICAgICAgICAgICAgdGhpcy5fZW5hYmxlSW5mbygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fZW5hYmxlQ29kZSgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJlIGVuYWJsZSBpbmZvIHN0YXRlXG4gICAgICovXG4gICAgX2VuYWJsZUluZm86IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN0YXRlID0gJ2luZm8nOyAgICAgICAgXG4gICAgICAgIHRoaXMuJGluZm8uc2hvdygpO1xuICAgICAgICB0aGlzLiRjb2RlLmhpZGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmUgZW5hYmxlIGNvZGUgc3RhdGVcbiAgICAgKi9cbiAgICBfZW5hYmxlQ29kZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSAnY29kZSc7XG4gICAgICAgIHRoaXMuJGNvZGUuc2hvdygpO1xuICAgICAgICB0aGlzLiRpbmZvLmhpZGUoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0byBtb2V0aG9kIGJ5IGlkXG4gICAgICovXG4gICAgbW92ZVRvOiBmdW5jdGlvbihpZCkge1xuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbiA9IGRvY3VtZW50LlVSTC5zcGxpdCgnIycpWzBdICsgaWQ7IFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgdGFiIGFuZCBtb3ZlIHRvIGxpbmUgKG51bWJlcilcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGluZSBUaGUgbnVtYmVyIG9mIGxpbmUgdG8gbW92ZVxuICAgICAqL1xuICAgIG1vdmVUb0xpbmU6IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgdGhpcy5jaGFuZ2VUYWIoJ2NvZGUnKTtcbiAgICAgICAgZG9jdW1lbnQubG9jYXRpb24gPSBkb2N1bWVudC5VUkwuc3BsaXQoJyMnKVswXSArICcjbGluZScgKyBsaW5lOyBcbiAgICB9XG59KTtcblxubmUudXRpbC5DdXN0b21FdmVudHMubWl4aW4oQ29udGVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IENvbnRlbnQ7XG4iLCJ2YXIgTWVudSA9IG5lLnV0aWwuZGVmaW5lQ2xhc3Moe1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy4kbWVudSA9IG9wdGlvbi5lbGVtZW50O1xuICAgICAgICB0aGlzLiR0YWIgPSBvcHRpb24udGFiO1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSAnbWFpbic7XG4gICAgICAgIHRoaXMuc3RhdGUgPSAnaW5mbyc7XG4gICAgICAgIHRoaXMuc2V0RXZlbnQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IGV2ZW50IHRvIHBhZ2UgbW92ZVxuICAgICAqL1xuICAgIHNldEV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kbWVudS5vbignY2xpY2snLCBuZS51dGlsLmJpbmQodGhpcy5vbkNsaWNrTWVudSwgdGhpcykpO1xuICAgICAgICB0aGlzLiR0YWIub24oJ2NsaWNrJywgbmUudXRpbC5iaW5kKHRoaXMub25DbGlja1RhYiwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUYWIgY2huYWdlIGV2ZW50XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IFRoZSBKcXVlcnlFdmVudCBvYmplY3RcbiAgICAgKi9cbiAgICBvbkNsaWNrVGFiOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gJChldmVudC50YXJnZXQpO1xuICAgICAgICBpZiAodGFyZ2V0Lmhhc0NsYXNzKCd0YWJtZW51JylcbiAgICAgICAgICAgJiYgIXRhcmdldC5oYXNDbGFzcygnb24nKSkge1xuICAgICAgICAgICAgdmFyIGlzQ29kZSA9IHRhcmdldC5oYXNDbGFzcygnY29kZScpO1xuICAgICAgICAgICAgdGhpcy5maXJlKCd0YWJDaGFuZ2UnLCB7XG4gICAgICAgICAgICAgICAgc3RhdGU6IGlzQ29kZSA/ICdjb2RlJyA6ICdpbmZvJ1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChpc0NvZGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm5PbkNvZGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuT25JbmZvKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRm9jdXMgbWVudVxuICAgICAqL1xuICAgIGZvY3VzOiBmdW5jdGlvbihzcGVjLCBjb2RlKSB7XG4gICAgICAgIGlmICghc3BlYyB8fCAhY29kZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy4kbWVudS5maW5kKCcubGlzdGl0ZW0nKS5lYWNoKGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyk7XG4gICAgICAgICAgICBpZiAoc2VsZi5hdHRyKCdkYXRhLXNwZWMnKSA9PT0gc3BlYyAmJiBzZWxmLmF0dHIoJ2RhdGEtY29kZScpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICB0dXJuT25JbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnLnRhYm1lbnUnKS5yZW1vdmVDbGFzcygnb24nKTtcbiAgICAgICAgdGhpcy4kdGFiLmZpbmQoJy5pbmZvJykuYWRkQ2xhc3MoJ29uJyk7XG4gICAgfSxcbiAgICB0dXJuT25Db2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnLnRhYm1lbnUnKS5yZW1vdmVDbGFzcygnb24nKTtcbiAgICAgICAgdGhpcy4kdGFiLmZpbmQoJy5jb2RlJykuYWRkQ2xhc3MoJ29uJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE5vdGlmeSBmb3IgY2hhbmdlIGNvbnRlbnRcbiAgICAgKi9cbiAgICBvbkNsaWNrTWVudTogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KSxcbiAgICAgICAgICAgIGlzVHV0b3JpYWwgPSB0YXJnZXQuaGFzQ2xhc3MoJ3R1dG9yaWFsTGluaycpLFxuICAgICAgICAgICAgaHJlZiA9IHRhcmdldC5hdHRyKCdocmVmJyksXG4gICAgICAgICAgICB0YXJnZXQgPSBocmVmID8gdGFyZ2V0LnBhcmVudCgpIDogdGFyZ2V0LFxuICAgICAgICAgICAgc3BlYyA9IHRhcmdldC5hdHRyKCdkYXRhLXNwZWMnKSxcbiAgICAgICAgICAgIGNvZGUgPSB0YXJnZXQuYXR0cignZGF0YS1jb2RlJyk7XG5cbiAgICAgICAgaWYgKGlzVHV0b3JpYWwpIHtcbiAgICAgICAgICAgIHdpbmRvdy5vcGVuKGhyZWYpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNwZWMpIHtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnbm90aWZ5Jywge1xuICAgICAgICAgICAgICAgIG5hbWU6IHNwZWMsXG4gICAgICAgICAgICAgICAgY29kZU5hbWU6IGNvZGUsXG4gICAgICAgICAgICAgICAgaHJlZjogaHJlZlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICBcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0IG1lbnUgaHRtbFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIEEgaHRtbCBzdHJpbmcgdG8gc2V0IG1lbnVcbiAgICAgKi9cbiAgICBzZXRNZW51OiBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgIHRoaXMuJG1lbnUuaHRtbChodG1sKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VsZWN0IG1lbnUgd2l0aCBzdGF0ZVxuICAgICAqL1xuICAgIHNlbGVjdDogZnVuY3Rpb24obWVudSwgc3RhdGUpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbWVudTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlIHx8ICdpbmZvJztcbiAgICB9LFxuICAgIFxuICAgIC8qKlxuICAgICAqIE9wZW4gc2VsZWN0ZWQgbWVudVxuICAgICAqLyBcbiAgICBvcGVuOiBmdW5jdGlvbihtZW51KSB7XG4gICAgICAgIHRoaXMuJG1lbnUuZmluZCgnLicgKyBtZW51KS5hZGRDbGFzcygndW5mb2xkJyk7IFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGFiIG1lbnUgaHRtbFxuICAgICAqL1xuICAgIHNldFRhYjogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICB0aGlzLiR0YWIuaHRtbChodG1sKTtcbiAgICB9LCBcbiAgICBcbiAgICAvKipcbiAgICAgKiBPbiBzZWxlY3RlZCB0YWJcbiAgICAgKi9cbiAgICB0YWJPbjogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgdGhpcy4kdGFiLnJlbW92ZUNsYXNzKCk7XG4gICAgICAgICB0aGlzLiR0YWIuYWRkQ2xhc3MoJ3RhYiB0YWItJyArIG5hbWUpO1xuICAgIH1cbn0pO1xuXG5uZS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihNZW51KTtcbm1vZHVsZS5leHBvcnRzID0gTWVudTtcbiIsInZhciBTZWFyY2ggPSBuZS51dGlsLmRlZmluZUNsYXNzKHtcblxuICAgIGtleVVwOiAzOCxcbiAgICBrZXlEb3duOiA0MCxcbiAgICBlbnRlcjogMTMsXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9uLCBhcHApIHtcbiAgICAgICAgdGhpcy4kZWwgPSBvcHRpb24uZWxlbWVudDtcbiAgICAgICAgdGhpcy4kaW5wdXQgPSB0aGlzLiRlbC5maW5kKCdpbnB1dCcpO1xuICAgICAgICB0aGlzLiRsaXN0ID0gdGhpcy4kZWwuZmluZCgnLnNlYXJjaExpc3QnKTtcbiAgICAgICAgdGhpcy4kbGlzdC5oaWRlKCk7XG4gICAgICAgIHRoaXMucm9vdCA9IGFwcDtcbiAgICAgICAgdGhpcy5fYWRkRXZlbnQoKTtcbiAgICAgICAgdGhpcy5pbmRleCA9IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBFdmVudHNcbiAgICAgKi9cbiAgICBfYWRkRXZlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLiRpbnB1dC5vbigna2V5dXAnLCBuZS51dGlsLmJpbmQoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGlmKGV2ZW50LmtleUNvZGUgPT09IHRoaXMua2V5VXAgfHwgZXZlbnQua2V5Q29kZSA9PT0gdGhpcy5rZXlEb3duIHx8IGV2ZW50LmtleUNvZGUgPT09IHRoaXMuZW50ZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kbGlzdC5jc3MoJ2Rpc3BsYXknKSAhPT0gJ25vbmUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSB0aGlzLmVudGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGF0IGlzIG5vIHdheSwgdGhpcy5maW5kKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSB0aGlzLiRsaXN0LmZpbmQoJ2xpLm9uJyksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0ID0gdGhpcy4kbGlzdC5maW5kKCdsaScpLmVxKDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25TdWJtaXQoeyB0YXJnZXQ6IHNlbGVjdGVkWzBdIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmaXJzdC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uU3VibWl0KHsgdGFyZ2V0OiBmaXJzdFswXX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RJdGVtKGV2ZW50LmtleUNvZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbmQoZXZlbnQudGFyZ2V0LnZhbHVlKTsgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VsZWN0IGl0ZW0gYnkga2V5Ym9hcmRcbiAgICAgKi9cbiAgICBzZWxlY3RJdGVtOiBmdW5jdGlvbihjb2RlKSB7XG4gICAgICAgIHRoaXMuJGxpc3QuZmluZCgnbGknKS5yZW1vdmVDbGFzcygnb24nKTtcbiAgICAgICAgdmFyIGxlbiA9IHRoaXMuJGxpc3QuZmluZCgnbGknKS5sZW5ndGg7XG4gICAgICAgIGlmICghbmUudXRpbC5pc051bWJlcih0aGlzLmluZGV4KSkge1xuICAgICAgICAgICAgdGhpcy5pbmRleCA9IDA7XG4gICAgICAgIH0gIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNvZGUgPT09IHRoaXMua2V5VXApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGV4ID0gKHRoaXMuaW5kZXggLSAxICsgbGVuKSAlIGxlbjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRleCA9ICh0aGlzLmluZGV4ICsgMSkgJSBsZW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kbGlzdC5maW5kKCdsaScpLmVxKHRoaXMuaW5kZXgpLmFkZENsYXNzKCdvbicpO1xuICAgICAgICB0aGlzLiRpbnB1dC52YWwodGhpcy4kbGlzdC5maW5kKCdsaS5vbicpLmZpbmQoJ2EnKS50ZXh0KCkpO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogUmVzZXQgc2VhcmNoXG4gICAgICovIFxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kaW5wdXQudmFsKCcnKTtcbiAgICAgICAgdGhpcy4kbGlzdC5maW5kKCdsaScpLm9mZignY2xpY2snKTtcbiAgICAgICAgdGhpcy4kbGlzdC5lbXB0eSgpO1xuICAgICAgICB0aGlzLiRsaXN0LmhpZGUoKTtcbiAgICAgICAgdGhpcy5pbmRleCA9IG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN1Ym1pdCBmb3IgY2hhbmdlIGJ5IHNlYXJjaCByZXN1bHQgbGlzdFxuICAgICAqLyBcbiAgICBvblN1Ym1pdDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldCxcbiAgICAgICAgICAgIGhyZWYsXG4gICAgICAgICAgICBzcGVjLCBcbiAgICAgICAgICAgIGNvZGU7XG4gICAgICAgIHRhcmdldCA9IHRoaXMuZ2V0VGFyZ2V0KHRhcmdldCk7XG4gICAgICAgIGhyZWYgPSB0YXJnZXQuZmluZCgnYScpLmF0dHIoJ2hyZWYnKTtcbiAgICAgICAgc3BlYyA9IHRhcmdldC5maW5kKCdzcGFuJykuYXR0cignZGF0YS1zcGVjJyk7XG4gICAgICAgIGNvZGUgPSB0YXJnZXQuZmluZCgnc3BhbicpLmF0dHIoJ2RhdGEtY29kZScpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5maXJlKCdub3RpZnknLCB7XG4gICAgICAgICAgICAgY29kZU5hbWU6IGNvZGUsXG4gICAgICAgICAgICAgbmFtZTogc3BlYyxcbiAgICAgICAgICAgICBocmVmOiBocmVmXG4gICAgICAgIH0pO1xuICAgIH0sIFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRhcmdldFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXQgVGhlIHRhcmdldCB0aGF0IGhhdmUgdG8gZXh0cmFjdFxuICAgICAqL1xuICAgIGdldFRhcmdldDogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIHZhciB0YWdOYW1lID0gdGFyZ2V0LnRhZ05hbWUudG9VcHBlckNhc2UoKSxcbiAgICAgICAgICAgICR0YXJnZXQgPSAkKHRhcmdldCk7XG4gICAgICAgIGlmICh0YWdOYW1lICE9PSAnTEknKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRUYXJnZXQoJHRhcmdldC5wYXJlbnQoKVswXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJHRhcmdldDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICogRmluZCB3b3JkIGJ5IGlucHV0IHRleHRcbiAgICAgKi9cbiAgICBmaW5kOiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy4kbGlzdC5oaWRlKCk7XG4gICAgICAgIHRoaXMuZmlyZSgnc2VhcmNoJywgeyBcbiAgICAgICAgICAgIHRleHQ6IHRleHQsXG4gICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlKGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHNlYXJjaCBsaXN0XG4gICAgICovXG4gICAgdXBkYXRlOiBmdW5jdGlvbihsaXN0KSB7XG4gICAgICAgIHZhciBzdHIgPSAnJzsgXG4gICAgICAgIG5lLnV0aWwuZm9yRWFjaChsaXN0LCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgc3RyICs9ICc8bGk+PHNwYW4gZGF0YS1zcGVjPVwiJyArIGVsLmdyb3VwICsgJ1wiIGRhdGEtY29kZT1cIicgKyBlbC5jb2RlICsgJ1wiPjxhIGhyZWY9XCIjJyArIGVsLmlkICsgJ1wiPicgKyBlbC5sYWJlbC5yZXBsYWNlKCcuJywgJycpICsgJzwvYT48c3BhbiBjbGFzcz1cImdyb3VwXCI+JyArIGVsLmdyb3VwICsgJzwvc3Bhbj48L3NwYW4+PC9saT4nOyBcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuJGxpc3QuaHRtbChzdHIpO1xuICAgICAgICBpZiAoc3RyKSB7XG4gICAgICAgICAgICB0aGlzLiRsaXN0LnNob3coKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRsaXN0LmZpbmQoJ2xpJykub24oJ2NsaWNrJywgbmUudXRpbC5iaW5kKHRoaXMub25TdWJtaXQsIHRoaXMpKTsgXG4gICAgfVxufSk7XG5cbm5lLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFNlYXJjaCk7XG5tb2R1bGUuZXhwb3J0cyA9IFNlYXJjaDtcbiJdfQ==
