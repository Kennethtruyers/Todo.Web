(function (window, R) {
	'use strict';

	function Model() {
	    
	}

	Model.prototype.setEmail = function (email) {
	    this.baseUrl = '/Tasks/' + email + '/';
	};

	var parseItem = function (item) {
	    item.DueDate = item.DueDate.substr(0, 10);
	    item.getDate = function () {
	        var dateParts = item.DueDate.split("-");
	        return new Date(dateParts[0], (dateParts[1] - 1), dateParts[2]);
	    };
	    return item;
	};

	var parseItems = function (items) {
	    for (var i = 0; i < items.length; i++) {
	        items[i] = parseItem(items[i]);
	    }
	    return items;
	};

	Model.prototype.create = function (name, date) {
	    name = name || '';
		return $.ajax({
		    type: "POST",
		    url: this.baseUrl,
		    data: {
		        Name: name.trim(),
		        DueDate: date,
		        Done: false
		    }
		});
	};

	Model.prototype.read = function (query) {
	    if (!query) {
	        var self = this;
	        return $.ajax({ type: 'GET', url: this.baseUrl })
                 .then(parseItems);
		} else if (typeof query === 'number') {
		    return $.ajax({ type: 'GET', url: this.baseUrl + query }).then(parseItem);
		} else if(query == "done"){
		    return $.ajax({ type: 'GET', url: this.baseUrl + 'done' }).then(parseItems);
		}
		else if (query == "pending") {
		    return $.ajax({ type: 'GET', url: this.baseUrl + 'pending' }).then(parseItems);
		}
	};

	Model.prototype.update = function (data) {
	    return $.ajax({ type: "PUT", url: this.baseUrl, data: data }).then(parseItem);
	};

	Model.prototype.remove = function (id) {
	    return $.ajax({ type: 'DELETE', url: this.baseUrl + id });
	};

	window.app = window.app || {};
	window.app.Model = Model;
})(window, R);