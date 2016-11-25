var Scoreboard = (function ($) {
    // 2016
    // @jessekorzan
    // emptycan.com
    
    // if you're looking for the Google Sheets sh*t,
    // try the service that saves the score
    
	var jk = {};
	jk.config = {};
	jk.vars = {
    	data : {
        	wrongs : ""
    	}
	};

/* --------------------------------------------------	
-------------------------------------------------- */
    // INIT this f**ker
    jk.init = function () {
               
        // show highscores?
        Google.form.get(jk.services.getScores);
        //Google.form.get(jk.views.twoByTwo);
    };
/* --------------------------------------------------	
-------------------------------------------------- */

    // ########################################
    // 
    // UTILITIES
    //
    // ########################################
    
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
        sortByCol : function (arr, colIndex){
            arr.sort(sortFunction)
            function sortFunction(a, b) {
                a = a[colIndex]
                b = b[colIndex]
                return (a === b) ? 0 : (a > b) ? -1 : 1
            }
        },
        getScores : function (data) {
            var _arr = [],
                _longestTime = [],
                _target = $(".ui-two-x-two");
                
            data.shift();
            $(".ui-stat-total").html(data.length);
            $.each(data, function (){
                var _row = this.values,
                    _col = {};
                    
                if (_row[4].formattedValue > 12 && _row[4].formattedValue > 12) {
                    _col = {
                        "time" : _row[0].formattedValue,
                        "score" : _row[1].formattedValue,
                        "total" : _row[2].formattedValue,
                        "percentage" : Number(_row[3].formattedValue),
                        "time" : Number(_row[4].formattedValue),
                        "speed" : Number(50 / _row[4].formattedValue),
                        "variant" : (_row[5].formattedValue === "Variant A") ? "Single" : "Multi",
                        "wrongs" : (_row[6] === undefined) ? null : _row[6].formattedValue.split(",").join(", ")
                    };
                    _arr.push(_col);
                    
                    // add to the wrong word string
                    if (_col.wrongs != null) {
                        var _str = _col.wrongs.split(", ");
                        jk.vars.data.wrongs += _str;
                    }
                }
            
            });
            
            // find weighted time
            var _longestTime = _arr;
            jk.services.sortByCol(_longestTime, "speed")
            
            var _longestTime = _longestTime[0].speed;
            
            $.each(_arr, function (){
                var _this = this;
                _this.weighted = Math.floor(_this.score / (_longestTime / _this.speed));
            });
            
            jk.services.sortByCol(_arr, "weighted");
            
            $.each(_arr, function (){
                var _col = this,
                    _pt = $("<div/>").addClass("pt").addClass(_col.variant);
                    
                jk.mustache.output({
                    container : $(".layout-table"),
                    template : "#table",
                    replace : false,
                    data : _col
                });
                
                _pt.css({
                    left : _col.percentage + "%",
                    bottom : Math.floor((_col.speed / _longestTime) * 100) + "%"
                });
                _target.append(_pt);
            });
            
            jk.views.stats();
        },
        stats : function (_arr) {
            var _rtnArr = [];
            
            _arr.sort();

            var _current = null,
                _cnt = 0;
            
            for (var i = 0; i < _arr.length; i++) {
                if (_arr[i] != _current) {
                    if (_cnt > 0) {
                        _rtnArr.push({
                            "word" : _current, 
                            "score" : _cnt
                        });
                    }
                    _current = _arr[i];
                    _cnt = 1;
                } else {
                    _cnt++;
                }
            }
            if (_cnt > 0) {
                _rtnArr.push({
                    "word" : _current, 
                    "score" : _cnt
                });
            }
            
            return _rtnArr;

        }
    };
    // ########################################
    // 
    // VIEWS
    //
    // ########################################
    jk.views = {
        stats : function () {
            var _wordCnt = {};
            
            // count words from the wrong words string
            _wordCnt = jk.services.stats(jk.vars.data.wrongs.split(","));
            
            jk.services.sortByCol(_wordCnt, "score");
            
            jk.mustache.output({
                container : $(".ui-word-cnt"),
                template : "#word",
                replace : false,
                data : _wordCnt
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
        ui : function () {}
    }
    return jk;
})(jQuery);
$(function () {
	// boom
	Scoreboard.init();
});