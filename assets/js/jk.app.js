var Game = (function ($) {
    // 2016
    // @jessekorzan
    // emptycan.com
    
    // if you're looking for the Google Sheets sh*t,
    // try the service that saves the score
    
	var jk = {};
	jk.config = {};
	jk.vars = {
    	game : {
        	id : 01,
        	name : "Variant A"
    	},
    	colors : [],
    	words : [],
    	score : 0,
    	total : 50,
    	obj : {
        	wordlist : ".ui-words-list",
        	word : ".word"
    	},
    	timer : {
            start : false,
            time : 0	
        }
	}
/* --------------------------------------------------	
-------------------------------------------------- */
    // INIT this f**ker
    jk.init = function () {
        
        jk.mustache.output({
            container : $(".ui-modal"),
            template : "#start",
            replace : true,
            data : {
                total : jk.vars.total
            }
        });
        
        jk.controller.ui();
        jk.services.colors();
        
        // show highscores?
        //Google.form.get();
    };
/* --------------------------------------------------	
-------------------------------------------------- */

    // ########################################
    // 
    // UTILITIES
    //
    // ########################################
    
	jk.pubSub = (function(){
		// David Walsh, genius advice
		// https://davidwalsh.name/pubsub-javascript
		var topics = {},
			hOP = topics.hasOwnProperty;
		return {
			subscribe: function(topic, listener) {
				// Create the topic's object if not yet created
				if(!hOP.call(topics, topic)) topics[topic] = [];
		
				// Add the listener to queue
				var index = topics[topic].push(listener) -1;
		
				// Provide handle back for removal of topic
				return {
					remove: function() {
						delete topics[topic][index];
					}
				};
			},
			publish: function(topic, info) {
				// If the topic doesn't exist, or there's no listeners in queue, just leave
				if(!hOP.call(topics, topic)) return;
		
				// Cycle through topics queue, fire!
				topics[topic].forEach(function(item) {
					item(info != undefined ? info : {});
				});
			}
		}
	})();
	jk.mustache = (function(){
    	var options = {};
    	
    	return {
        	output : function (options) {
			    var render = Mustache.to_html($(options.template).html(), options.data);
			    if (options.replace) {
    			    $(options.container).html(render);
			    } else {
    			    $(options.container).append(render);
                }
            }
		}
	})();
	jk.getJSON = (function(){
    	
	})();
/* --------------------------------------------------	
-------------------------------------------------- */


    // ########################################
    // 
    // SERVICES
    //
    // ########################################
    jk.services = {
        process : function (options) {
            options = (typeof options !== "object") ? {} : options;
            
            $.ajaxSetup({ async: true, cache: false });
            $.ajax ({
                //dataType : "json",
                url: options.url,
                data: options.data,
                headers: {
                    "Authorization": options.authorization
                },
                success: function (data) { 
            		options.callBack(data);
            	},
                error: function(e) {
            	    console.error(e);
            	    $("body").append("<mark>" + e.responseText + "</mark>");
            	}
            });
        },
        colors : function () {
            var _options = {
                url : "assets/data/colors.json",
                data : {},
                callBack : function (data) {
                    $.each(data, function(){
                        jk.vars.colors.push(this.color);
                    });
                    jk.services.words();
                }
            }
            jk.services.process(_options);
        },
        words : function () {
            var _options = {
                url : "assets/data/words.json",
                data : {},
                callBack : function (data) {
                    $.each(data, function(){
                        jk.vars.words.push(this.word);
                    });
                    jk.views.wordlist.init();
                }
            }
            jk.services.process(_options);
        },
        test : function () {
            $.each($(jk.vars.obj.word), function(){
                if (jk.services.randomNum(100) < 10) {
                    var _el = $(this);
                    _el.find("var").html(jk.vars.words[jk.services.randomNum(jk.vars.words.length)]);
                    _el.attr({"data-correct" : false});
                }
                
                if (jk.services.randomNum(100) < 8) {
                    jk.views.ui.word($(this), "no");
                }
                
            });    
        },
        scoring : function () {
            $(jk.vars.obj.word).addClass("closed");
            $($(jk.vars.obj.word).get().reverse()).each(function(i, v) {
                var _word = $(this),
                    _correct = _word.data().correct,
                    _state = $(this).hasClass("yes"),
                    _ans = "right";
                    
                setTimeout(function(){
                    if((_word.data().correct && _state) || (!_word.data().correct && !_state)) {
                        jk.vars.score++;
                    } else {
                        _ans = "wrong";
                    }
                    jk.views.scoreboard();
                    _word.addClass(_ans);
                    setTimeout(function(){
                        _word.remove();
                        if (i == jk.vars.total-1) {
                            // fire the end game stuff
                            // i.e. send score to google form
                            jk.services.saveScore();
                            
                        }
                    }, 320);
                    
                }, 320 * i); 
                
            });
        },
        saveScore : function () {
            var _arr = [];
            
            _arr = [
                jk.vars.game.name, // variant/name of quiz
                jk.vars.score, // score
                jk.vars.total, // total questions
                Math.floor((jk.vars.score / jk.vars.total) * 100), // percentage
                jk.vars.timer.time // time
                ];
            
            Google.form.save(_arr);
            
        },
        randomNum : function (max) {
            return Math.floor(Math.random() * max) + 1;
        }
    };
    // ########################################
    // 
    // VIEWS
    //
    // ########################################
    jk.views = {
        wordlist : {
            init : function (data) {
                var _target = $(jk.vars.obj.wordlist),
                    _cnt = 0;
                // get color array
               
                while(_cnt < jk.vars.total){
                    jk.mustache.output({
                        container : _target,
                        template : "#word",
                        data : {
                            word : jk.vars.colors[_cnt],
                            correct : true
                        }
    	            });
                    _cnt++;
                }
                jk.services.test();
            }
        },
        timer : function () {
            if (!jk.vars.timer.start) {
                jk.vars.timer.start = true;
                jk.vars.timer.obj = setInterval(function(){
                    jk.vars.timer.time++;
                    $(".ui-timer").html(jk.vars.timer.time);
                }, 1000);
            }
        },
        scoreboard : function () {
            jk.mustache.output({
                container : $(".ui-complete"),
                template : "#score",
                replace : true,
                data : {
                    score : jk.vars.score,
                    total : jk.vars.total,
                    perc : Math.floor((jk.vars.score / jk.vars.total) * 100),
                    time : jk.vars.timer.time
                }
            });
        },
        ui : {
            word : function (_word, _state) {
                _word.attr({"class" : "word"});
                _word.addClass(_state);
            }
        }
        
    }
     // ########################################
    // 
    // CONTROLLER
    //
    // ########################################
    jk.controller = {
        ui : function () {
            
            $("body").on("click", jk.vars.obj.word, function(e){

                var _state = e.target.className,
                    _ans = "no",
                    _word = $(this);
                
                switch (_state) {
                    case "yes":
                        jk.views.ui.word(_word, "yes");
                        break;
                    case "no":
                        jk.views.ui.word(_word, "no");
                        break;
                }
            })
            
            $("body").on("click", "[data-action]", function(e){
                e.preventDefault();
                var _action = $(this).data().action;
                
                switch (_action) {
                    case "complete":
                        $(this).hide();
                        clearTimeout(jk.vars.timer.obj);
                        jk.services.scoring();
                        break;
                    case "start":
                        $(".ui-modal").addClass("off");
                        $(".pause").removeClass("pause");
                        setInterval(function(){
                            jk.views.timer();
                            
                            $(".ui-modal").remove();
                        }, 400);
                        
                        break;
                }
            });
        }
    }
    return jk;
})(jQuery);
$(function () {
	// boom
	Game.init();
});