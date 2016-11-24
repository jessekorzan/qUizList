var Google = (function ($) {
	var jk = {};
	jk.config = {
    	url : "https://docs.google.com/a/2hatsecurity.com/forms/d/e/1FAIpQLScVMavzKKJxf-BQSW5c8PAtY2_VSbCmbQdUuS4N2C85on6bMg/formResponse?callback=googleDocCallback",
    	fields : [
	        "entry.974744299", //score
            "entry.408793700", //total,
            "entry.76165195", //percent,
            "entry.432523256" //time
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
            	url: jk.config.url,
            	data: jk.config.data,
				type: "POST",
				dataType: "xml",
				statusCode: {}
        	});
		}
	};
  return jk;
})(jQuery);