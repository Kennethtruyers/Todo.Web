(function (window, R) {
	'use strict';

	function View() {
		this.ENTER_KEY = 13;
		this.ESCAPE_KEY = 27;

		this.$todoList = $('.todo-list');
		this.$todoItemCounter = $('.todo-count');
		this.$clearDone = $('.clear-done');
		this.$newTodo = $('.new-todo');
		this.$dueDate = $('.due-date');
		this.$addItem = $('.add-todo');
		this.$logon = $("#logon");
		this.$application = $("#application");
		this.$email = $("#email");
	}

	View.prototype._removeItem = function (id) {
		$('[data-id="' + id + '"]').remove();
	};

	View.prototype._clearDoneButton = function (doneCount, visible) {
	    this.$clearDone.html(doneCount > 0 ? 'Clear completed' : '');
		this.$clearDone.toggle(visible);
	};

	View.prototype._setFilter = function (currentPage) {
		$('.filters .selected').removeClass('selected');
		$('.filters [href="#/' + currentPage + '"]').addClass('selected');
	};

	View.prototype._elementDone = function (id, done, dueDate) {
	    var $listItem = $('[data-id="' + id + '"]').toggleClass('done', done)
	                                               .toggleClass('over-due', !done && dueDate < new Date());

	    // In case it was toggled from an event and not by clicking the checkbox
		$listItem.find('input')[0].checked = done;
	};

	View.prototype._editItem = function (id, name) {
	    $('[data-id="' + id + '"]').addClass('editing')
	                               .append($('<input />').addClass('edit')
                                                         .val(name)
                                                         .focus());
	};

	View.prototype._editItemDone = function (id, name) {
	    var $listItem = $('[data-id="' + id + '"]');
	    $listItem.find('input.edit').remove();
	    $listItem.removeClass('editing')
                 .find(".name").text(name);
	};

	View.prototype.render = function (viewCmd, parameter) {
		var self = this;
		var viewCommands = {
			showEntries: function () {
			    self.$todoList.html(self._show(parameter));
			    self.$logon.hide();
			    self.$application.show();
			},
			removeItem: function () {
				self._removeItem(parameter);
			},
			updateElementCount: function () {
			    var plural = parameter === 1 ? '' : 's';
			    self.$todoItemCounter.html('<strong>' + pendingTodos + '</strong> item' + plural + ' left');
			},
			clearDoneButton: function () {
				self._clearDoneButton(parameter.Done, parameter.visible);
			},
			setFilter: function () {
				self._setFilter(parameter);
			},
			clearNewTodo: function () {
			    self.$newTodo.val('');
			    self.$dueDate.val('');
			    self.$addItem.removeClass("enabled")
                             .addClass("disabled");
			},
			elementDone: function () {
				self._elementDone(parameter.Id, parameter.Done, parameter.getDate());
			},
			editItem: function () {
				self._editItem(parameter.Id, parameter.Name);
			},
			editItemDone: function () {
				self._editItemDone(parameter.Id, parameter.Name);
			},
			showLogon: function () {
			    self.$logon.show();
			    self.$application.hide();
			},
			setAddState: function () {
			    self.$addItem.removeClass(parameter ? "disabled" : "enabled")
			                 .addClass(parameter ? "enabled" : "disabled");
			    
			}

		};

		viewCommands[viewCmd]();
	};

	View.prototype._itemId = function (element) {
		return parseInt($(element).parents('li').data('id'), 10);
	};

	View.prototype._dueDate = function (element) {
	    return $(element).parents('li').data('deudate');
	};

	View.prototype._bindItemEditDone = function (handler) {
	    var self = this;
	    self.$todoList.on('blur', 'li .edit', function () {
	        if (!this.dataset.iscanceled) {
	            handler({
	                Id: self._itemId(this),
	                Name: this.value
	            });
	        }
	    })

		self.$todoList.on('keypress', 'li .edit', function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				// Remove the cursor from the input when you hit enter just like if it
				// were a real form
				this.blur();
			}
		});
	};

	View.prototype._bindItemEditCancel = function (handler) {
		var self = this;
		self.$todoList.on('keyup', 'li .edit', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();

				handler({Id: self._itemId(this)});
			}
		});
	};

	View.prototype.bind = function (event, handler) {
	    var self = this;
		if (event === 'newTodo') {
		    $(self.$addItem).on("click", function () {
		        if (self.$addItem.hasClass("enabled")){
		            handler(self.$newTodo.val(), self.$dueDate.val());
		        }
			});

		} else if (event === 'removeDone') {
			$(self.$clearDone).on('click', function () {
				handler();
			});

		} else if (event === 'itemEdit') {
			self.$todoList.on('dblclick', 'li label', function () {
				handler({Id: self._itemId(this)});
			});

		} else if (event === 'itemRemove') {
			self.$todoList.on('click', '.destroy', function () {
				handler({Id: self._itemId(this)});
			});

		} else if (event === 'itemToggle') {
		    self.$todoList.on('click', '.toggle', function () {
				handler({
					Id: self._itemId(this),
					Done: this.checked
				});
			});

		} else if (event === 'itemEditDone') {
			self._bindItemEditDone(handler);

		} else if (event === 'itemEditCancel') {
			self._bindItemEditCancel(handler);
		} else if (event == 'emailChanged') {
		    self.$email.on("change", function () {
		        handler(self.$email.val());
		    })
		}
		else if(event == "nameChanged"){
		    self.$newTodo.on("change", function(){
		        handler(self.$newTodo.val());
		    });
		}
		else if(event == "dateChanged"){
		    self.$dueDate.on("change", function(){
		        handler(self.$dueDate.val());
		    });
		}
	}

	var htmlEscapes = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    '\'': '&#x27;',
	    '`': '&#x60;'
	};

	var reUnescapedHtml = /[&<>"'`]/g;
	var reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

	var escape = function (string) {
	    return (string && reHasUnescapedHtml.test(string))
			? string.replace(reUnescapedHtml, function (chr) {
			    return htmlEscapes[chr];
			})
			: string;
	};

	View.prototype._show = function (data) {
	    var i, l;
	    var view = '';

	    for (i = 0, l = data.length; i < l; i++) {
	        var template
                = '<li data-id="{{id}}" data-dueDate="{{duedate}}" class="{{done}}{{overdue}}">'
		        + '<div class="view">'
		        + '<input class="toggle" type="checkbox" {{checked}}>'
		        + '<label class="name">{{name}}</label>'
                + '<label class="duedate">{{duedate}}</label>'
		        + '<button class="destroy"></button>'
		        + '</div>'
		        + '</li>';
	        var done = '';
	        var checked = '';
	        var overdueClass = '';

	        if (data[i].Done) {
	            done = 'done';
	            checked = 'checked';
	        } else if (data[i].getDate() < new Date()) {
	            overdueClass = ' over-due';
	        }

	        template = template.replace('{{id}}', data[i].Id);
	        template = template.replace('{{name}}', escape(data[i].Name));
	        template = template.replace('{{done}}', done);
	        template = template.replace('{{duedate}}', escape(data[i].DueDate));
	        template = template.replace('{{duedate}}', escape(data[i].DueDate));
	        template = template.replace('{{checked}}', checked);
	        template = template.replace('{{overdue}}', overdueClass);

	        view = view + template;
	    }
	    return view;
	};

	window.app = window.app || {};
	window.app.View = View;
}(window, R));
