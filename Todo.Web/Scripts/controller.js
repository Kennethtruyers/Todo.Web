(function (window, R) {
    'use strict';

    function Controller(model, view) {
        var self = this;
        self.view = view;
        self.model = model;
        self.name = '';
        self.date = '';

        var bind = R.bind(self.view.bind, self.view);

        bind('newTodo', self.addItem.bind(self));

        bind('itemEdit', R.pipe(R.prop("Id"), R.partial(self.editItem, [self.model, self.view])).bind(self));

        bind('itemEditDone', R.pipe(R.props(['Id', 'Name']), R.apply(self.editItemSave.bind(self))));

        bind('itemEditCancel', R.pipe(R.prop("Id"), self.editItemCancel.bind(self)));

        bind('itemRemove', R.pipe(R.prop("Id"), self.removeItem.bind(self)));

        bind('itemToggle', R.pipe(R.props(['Id', 'Done', 'DueDate']), R.apply(self.toggleDone.bind(self))));

        bind('removeDone', self.removeDoneItems.bind(self));

        bind('emailChanged', function (email) {
            self.model.setEmail(email);
            document.location.hash = "/";
        });

        bind('nameChanged', function (name) {
            self.name = name;
            self._checkCanAdd();
        });

        bind('dateChanged', function (date) {
            self.date = date;
            self._checkCanAdd();
        });
    }

    Controller.prototype.setView = function (locationHash) {
        var route = locationHash.split('/')[1];
        var page = route || '';
        this._updateFilterState(page);
    };

    var read = function (item, model, view) {
        model.read(item)
             .then(R.bind(R.partial(view.render, ['showEntries']), view));
    }
    Controller.prototype.showAll = R.partial(read, [null]);
    Controller.prototype.showPending = R.partial(read, ['pending']);
    Controller.prototype.showDone = R.partial(read, ['done']);

    Controller.prototype.showLogon = function (model, view) {
        view.render('showLogon');
    };

    Controller.prototype.addItem = function (name, date) {
        var self = this;

        if (name.trim() === '') {
            return;
        }

        self.model.create(name, date).then(function () {
            self.view.render('clearNewTodo');
            self._filter(true);
        });
    };

    Controller.prototype.editItem = function (model, view, id) {
        model.read(id)
             .done(function (data) {
                view.render('editItem', { Id: id, Name: data.Name });
            });
    };

    Controller.prototype.editItemSave = function (id, name) {
        name = name.trim();

        if (name.length !== 0) {
            this.model
                .read(id)
                .then(function (item) {
                    item.Name = name;
                    return item;
                })
                .then(R.bind(this.model.update, this.model))
                .then(R.bind(R.partial(this.view.render, ['editItemDone', { Id: id, Name: name }]), this.view));
        } else {
            this.removeItem(id);
        }
    };

    Controller.prototype.editItemCancel = function (id) {
        this.model
            .read(id)
            .then(R.prop("Name"))
            .then(function (name) { return { Id: id, Name: name }; })
            .then(R.bind(R.partial(this.view.render, ['editItemDone']), this.view));
    };

    Controller.prototype.removeItem = function (id) {
        this.model
            .remove(id)
            .then(R.bind(R.partial(this.view.render, ['removeItem', id]), this.view));

        this._filter();
    };

    Controller.prototype.removeDoneItems = function () {
        this.model
            .read("done")
            .then(R.pluck("Id"))
            .then(R.forEach(R.bind(this.removeItem, this)));

        this._filter();
    };

    Controller.prototype.toggleDone = function (id, done) {
        var self = this;
        self.model
            .read(id)
            .then(function (item) {
                item.Done = done;
                self.model.update(item);
                self.view.render('elementDone', item);
            });
    };

    Controller.prototype._filter = function (force) {
        var activeRoute = this._activeRoute.charAt(0).toUpperCase() + this._activeRoute.substr(1);

        this.name = '';
        this.date = '';
        this._checkCanAdd();
        // If the last active route isn't "All", or we're switching routes, we
        // re-create the todo item elements, calling:
        //   this.show[All|pending|done]();
        if (force || this._lastActiveRoute !== 'All' || this._lastActiveRoute !== activeRoute) {
            this['show' + activeRoute](this.model, this.view);
        }

        this._lastActiveRoute = activeRoute;
    };

    Controller.prototype._updateFilterState = function (currentPage) {
        // Store a reference to the active route, allowing us to re-filter todo
        // items as they are marked done or pending.
        this._activeRoute = currentPage;

        if (currentPage === '') {
            this._activeRoute = 'All';
        }

        this._filter();

        this.view.render('setFilter', currentPage);
    };

    Controller.prototype._checkCanAdd = function () {
        this.view.render('setAddState', this.name && this.date);
    };

    // Export to window
    window.app = window.app || {};
    window.app.Controller = Controller;
})(window, R);
