function sudoku_widget(cont, config) {
    cont.css("position", "relative");
    var root = cont;

    cont.addClass("sudoku");

    function cell(x, y) {
        var ret = {
            "x": x,
            "y": y
        };
        ret.set = function(v) {
            if(!root.check(this, v)) {
                return;
            }

            if(!this.ro) {
                var undo = root.undo;
                var oldVal = this.value;
                root.undo = (function() {
                    ret.set(oldVal);
                    root.undo = undo.bind(root);

                    if(root.ccl) {
                        root.ccl(root.choices());
                    }
                }).bind(root);
            }
            var vv = v ? v : "";
            this.value = v;
            this.setNumber(vv);

            var fin = true;

            for(var x = 0; x < 9; x++) {
                for(var y = 0; y < 9; y++) {
                    if(!root.cells[x][y].value) {
                        fin = false;
                    }
                }
            }
            if(fin) {
                root.addClass("turn");
            }

        }.bind(ret);

        ret.select = function() {
            if(root.selected == this || this.ro) {
                return;
            }
            this.oldBG = this.dom.css("background-color");
            this.dom.css("background-color", "rgba(22,22,22,0.5)");
            if(root.selected) {
                root.selected.unselect();
            }
            root.selected = this;
            if(root.ccl) {
                root.ccl(root.choices());
            }
            if(root.scl) {
                root.scl(this);
            }
        }.bind(ret);

        ret.unselect = function() {
            this.dom.css("background-color", this.oldBG);
            root.selected = null;
        }.bind(ret);

        ret.dom = $($.parseHTML('<div class="field"></div>')[0]).outerWidth("10%").outerHeight("10%").css("position", "absolute").css("left", 3 + x * 10 + (x / 3 >> 0) * 2 + "%").css("top", 3 + 10 * y + (y / 3 >> 0) * 2 + "%");
        ret.number = $($.parseHTML('<div class="centerY snumber overlay ' + (this.ro ? "read_only" : "") + '"></div>')[0]);
        ret.dom.append(ret.number);

        ret.table = $($.parseHTML('<div class="overlay"></div>')[0]);
        for(var i = 0; i < 9; i++) {
            var e = $($.parseHTML('<div class="poss"></div>')[0]);
            e.css("top", (i / 3 >> 0) * 100 / 3 + "%");
            e.css("left", i % 3 * 100 / 3 + "%");
            e.css("width", 100 / 3 + "%");

            ret.table.append(e);
        }
        ret.dom.append(ret.table);
        ret.setNumber = function(vv) {
            this.number.html(vv);
        }.bind(ret);
        ret.showPossibilities = function() {
            if(this.ro) {
                return;
            }
            var c = root.choices(this);
            for(var i = 1; i <= 9; i++) {
                this.table.find("div").each(function(v, k) {
                    if(c.has(v + 1) && !(c.size == 1 && ret.value))  {
                        $(k).html(v + 1);
                    } else {
                        $(k).html("");
                    }
                });
            }
        }.bind(ret);

        if("ontouchstart" in document.documentElement || !config.wandering_control) {
            ret.dom.on("click", ret.select);
        } else {
            ret.dom.on("hover", ret.select);
        }
        root.append(ret.dom);
        root.check = function(cell, value) {
            if(value == null) {
                return true;
            } else if(!(value >= 1 && value <= 9)) {
                return false;
            }
            return this.choices(cell).has(value);
        }.bind(root);

        return ret;
    }

    root.cells = [[], [], [], [], [], [], [], [], []];
    for(var i = 0; i < 9 * 9; i++) {
        var x = i % 9;
        var y = i / 9 >> 0;
        root.cells[x][y] = cell(x, y);
    }

    root.attr("tabindex", 1);
    root.on("keypress", function(e) {
        if(e.charCode > 48 && e.charCode < 59) {
            root.set(e.charCode - 48);
        } else if(e.charCode == 32) {
            root.set(null);
        }
    });

    root.set = function(v) {
        if(this.selected) {
            this.selected.set(v);
        }
    }.bind(root);

    root.initString = function(u) {
        for(var i = 0; i < 9 * 9; i++) {
            var v = u[i] == "_" ? null : parseInt(u[i]);
            var x = i % 9;
            var y = i / 9 >> 0;
            root.cells[x][y].ro = v ? true : false;
            root.cells[x][y].set(v, true);
        }
        return this;
    }.bind(root);

    root.init = function(level, su) {
        su = su ? su : sudo();
        var bias = 1.0 - (0.2 + level / 6);

        for(var i = 0; i < 9 * 9; i++) {
            var v = Math.random() > bias ? null : su[i];
            var x = i % 9;
            var y = i / 9 >> 0;
            root.cells[x][y].ro = v ? true : false;
            root.cells[x][y].set(v, true);
        }
        return this;
    }.bind(root);

    root.choices = function(cell) {
        cell = cell ? cell : this.selected;
        if(!cell) {
            return new Set();
        }
        var choices = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for(var i = 0; i < 9; i++) {
            var x = cell.x;
            var y = cell.y;
            if(i != y) {
                choices.delete(this.cells[x][i].value);
            }
            if(i != x) {
                choices.delete(this.cells[i][y].value);
            }
            if((x / 3 >> 0) * 3 + i % 3 != x && (y / 3 >> 0) * 3 + i / 3 >> 0 != y) {
                choices.delete(this.cells[(x / 3 >> 0) * 3 + i % 3][(y / 3 >> 0) * 3 + i / 3 >> 0].value);
            }
        }
        return choices;
    }.bind(root);

    root.setChoicesChangeListener = function(ccl) {
        this.ccl = ccl;
    }.bind(root);
    root.setOnSelectionChangeListener = function(scl) {
        this.scl = scl;
    }.bind(root);
    root.setOnResizeListener = function(rsl) {
        this.rsl = rsl;
    }.bind(root);

    cont.append(root);

    new ResizeSensor(cont[0], function() {
        if(cont.width() == cont.height()) {
            return;
        }
        cont.height(cont.width());
        cont.css("font-size", cont.width() / 20);
        cont.find(".field").each(function(ii, vv) {
            $(vv).find(".poss").each(function(i, v) {
                $(v).css("font-size", cont.width() / 60).height($(v).width()).css("top", $(v).outerWidth() * (i / 3 >> 0) + "px");
            });
        });
        if(this.rsl) {
            this.rsl(cont.width());
        }
    }.bind(root));

    return root;
}

function sudoku_control(cont, root, config) {

    cont.config = config ? config : {};
    root.control = this;
    function updateP() {
        for(var i = 0; i < 9 * 9; i++) {
            var x = i % 9;
            var y = i / 9 >> 0;
            root.cells[x][y].showPossibilities();
        }
    }

    var undo_button = $($.parseHTML('<div class="field">↶</div>')[0]);
    undo_button.on("click", function() {
        if(root.undo) {
            root.undo();
            updateP();
        }
    });
    cont.append(undo_button);

    cont.css("text-align", "center");
    cont.addClass("sudoku_controller");

    var mro = $($.parseHTML('<div class="field">?</div>')[0]);
    mro.on("click", function() {
        var speech_less = false;
        var limit = 10;
        while(!speech_less) {
            speech_less = true;
            for(var x = 0; x < 9; x++) {
                for(var y = 0; y < 9; y++) {
                    var cell = root.cells[x][y];
                    if(!cell.value) {
                        var choices = root.choices(cell);
                        if(choices.size == 1) {
                            if(!limit) {
                                updateP();
                                return;
                            }
                            limit -= 1;
                            var v = choices.entries().next().value[0];
                            cell.set(v);
                            speech_less = false;
                        }
                    }
                }
            }
        }
        updateP();
    });
    cont.append(mro);

    var inputs = [];
    for(var i = 0; i <= 9; i++) {
        if(i == 1 || cont.config.wandering_control && (i - 1) % 3 == 0) {
            cont.append($($.parseHTML('<br></br>')[0]));
        }
        var input = $($.parseHTML('<div class="field">' + (i ? i : "X") + '</div>')[0]);
        inputs[i] = input;
        input.on("click", function(ii) {
            return function() {
                root.set(ii ? ii : null);
                updateP();
            };
        }(i));
        cont.append(input);
    }

    root.setChoicesChangeListener(function(choices) {
        var count = 0;
        for(var i = 1; i <= 9; i++) {
            //if (choices.has(i)) {count+=1; inputs[i].show();} else inputs[i].hide();
        }
        if(this.config.wandering_control) {
            this.width(inputs[0].outerWidth() * Math.max(3, count) + 10);
        }
    }.bind(cont));

    if(cont.config.wandering_control) {
        root.setOnSelectionChangeListener(function(cell) {
            $(this).offset({
                "top": cell.dom.offset().top + cell.dom.outerHeight(),
                "left": cell.dom.offset().left + (cell.dom.outerWidth() - this.outerWidth()) / 2
            });
            $(this).css("z-index", "10000").css("transition", "top 1s, left 1s");
        }.bind(cont));
    }

    root.setOnResizeListener(function(w) {
        this.find(".field").width(w / 15).height(w / 15).css("font-size", w / 30);
        this.css("padding", w / 60 + "px").css("background-color", "lightgrey");
    }.bind(cont));

    return cont;
}

