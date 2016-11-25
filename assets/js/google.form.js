var Google = (function ($) {
    // 2016
    // jesse korzan
    // @jessekorzan
    // emptycan.com
    
	var jk = {};
	
	// should probably hide these guys in a PHP "api wrapper"... 
	// but it's'okay for this demo
	jk.config = {
    	urls : {
        	form : "https://docs.google.com/a/2hatsecurity.com/forms/d/e/1FAIpQLScVMavzKKJxf-BQSW5c8PAtY2_VSbCmbQdUuS4N2C85on6bMg/formResponse?callback=googleDocCallback",
        	sheet : "https://sheets.googleapis.com/v4/spreadsheets/12lxAyUgb8sWStLux8eXTztnRjeAhN4dCy4EpcvlCopU"
        },
        key : "AIzaSyB0tR_kpDgKOQpkX5EhKGsdM-6r6yD5whI",
    	fields : [
        	"entry.1602904101", //variant
	        "entry.974744299", //score
            "entry.408793700", //total,
            "entry.76165195", //percent,
            "entry.432523256", //time
            "entry.1637332259" //wrongs
            ]
    	
    	
	};
/* --------------------------------------------------	
-------------------------------------------------- */
	jk.form = {	
		getFormData : function (data) {
    		// if you need form values
			// e.g. var _values = jk.forms.getFormData(data);
			
			var formObj = {};
			$.each(data, function (i, data) {
				formObj[data.name] = data.value;
    		});
			return (formObj);
		},
		formatData : function (data) {
    		var _json = {};
    		
    		$.each(jk.config.fields, function(i,v){
        		var _field = {};
        		
        		_field[jk.config.fields[i]] = data[i];
                $.extend(_json, _field);
                
    		});
            return (_json);
    		
        },
		save : function (data) {
			
			jk.config.data = jk.form.formatData(data);
			
			// add to GOOGLE SHEET
			window.googleDocCallback = function () { return true; };
		    $.ajax({
			    cache: false,
				crossDomain:true,
            	url: jk.config.urls.form,
            	data: jk.config.data,
				type: "POST",
				dataType: "xml",
				statusCode: {}
        	});
		},
		get : function (callBack) {
            $.ajaxSetup({ async: true, cache: false });
            $.ajax ({
                //dataType : "json",
                url: jk.config.urls.sheet,
                //data: options.data,
                type: "GET",
                data : {
                    key : jk.config.key,
                    includeGridData : true // include data
                },  
                success: function (data) { 
            		callBack(data.sheets[0].data[0].rowData);
            	},
                error: function(e) {
            	    console.error(e);
            	}
            });
		}
	};
  return jk;
})(jQuery);