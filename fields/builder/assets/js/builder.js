(function($) {
  var Builder = function(element) {
    var self = this;

    this.element   = $(element);
    this.list      = $('<div class="builder-entries"></div>');
    this.input     = this.element.find('input[type=hidden]');
    this.page      = this.element.data('page');
    this.fileUrl   = this.element.data('file-url');
    this.context   = this.element.parents('.fileview-sidebar').length > 0 ? 'file' : 'page';
    this.button    = this.element.find('.builder-add-button');
    this.json      = this.input.val() ? $.parseJSON(this.input.val()) : [];
    this.entries   = [];
    this.templates = [];
    this.template  = Handlebars.compile(this.element.find('.builder-entries-template').html());

    this.render = function() {

      self.list.html(self.template({
        entries: self.entries
      }));

      $.each(self.entries, function(i, item) {
        self.templates[item['_fieldset']] = Handlebars.compile( self.element.find('.builder-entries-template-' + item['_fieldset']).html() );
        item._fileUrl = self.fileUrl;
        self.list.find('#builder-entry-' + item._id + ' .builder-entry-content').html(self.templates[item['_fieldset']]({
          entry: item
        }))
        delete item._fileUrl;
      });

      self.list.find('.builder-add-button').on('click', function() {
        self.button.trigger('click');
        return false;
      });

      self.list.find('.builder-delete-button').on('click', function() {
        self.remove($(this).data('builder-id'));
        return false;
      });

      self.list.find('.builder-edit-button').on('click', function() {
        self.edit($(this).data('builder-id'));
        return false;
      });

      self.element.find('.drop-down-toggle, .builder-add-button').off('click', self.toggleDropDown);
      self.element.find('.drop-down-toggle, .builder-add-button').on('click', self.toggleDropDown);

      if(self.element.data('sortable') == true && self.list.find('.builder-entry').length > 1) {

        self.list.sortable({
          update: function() {

            var result = [];

            $.each($(this).sortable('toArray'), function(i, id) {

              var id = id.replace('builder-entry-', '');

              $.each(self.entries, function(i, entry) {
                if(entry._id == id) {
                  result.push(entry);
                }
              });

            });

            self.entries = result;
            self.serialize();

          }
        });

      }

      self.list.disableSelection();
      self.serialize();

    };

    this.serialize = function() {
      self.input.val(JSON.stringify(self.entries));
    };

    this.id = function() {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    this.form = function(input, mode, fieldset) {
      app.popup.form('editor/builder2/' + self.page + '/' + self.input.attr('name') + '/' + fieldset + '/' + self.context, input, null, function(form, data) {
        data._fieldset = fieldset;
        mode == 'add' ? self.add(data) : self.update(input._id, data);
        app.popup.hide();
      });
    };

    this.add = function(data) {
      data._id = self.id();
      self.entries.push(data);
      self.render();
    };

    this.edit = function(id) {

      var data = $.grep(self.entries, function(item) {
        return item._id == id;
      })[0];

      var fieldsetName = $('#builder-entry-' + id).data('fieldset');

      self.form(data, 'edit', fieldsetName);

    };

    this.update = function(id, data) {

      data._id = id;

      $.each(self.entries, function(i, item) {

        if(item._id != id) return;
        data._fieldset = self.entries[i]._fieldset
        self.entries[i] = data;
      });
      self.render();

    };

    this.remove = function(id) {

      if(confirm('Do you really want to delete this entry?')) {
        self.entries = $.grep(self.entries, function(item) {
          return item._id != id;
        });
        self.render();
      }

    };

    this.init = function() {

      self.element.append(self.list);

      self.button.on('click', function() {
        self.form({}, 'add', $(this).data('fieldset'));
        return false;
      });

      $.each(self.json, function(i, item) {
        item['_id'] = self.id();
        // self.templates[item['_fieldset']] = Handlebars.compile(self.element.find('.builder-entries-template-' + item['_fieldset']).html());
        self.entries.push(item);
      });

      $(document).on('click', function (e) {
        var dropDown = $(".drop-down");
        if (!dropDown.is(e.target) && dropDown.has(e.target).length === 0) {
            dropDown.removeClass('active');
        }
      });

      self.render();

    };

    this.toggleDropDown = function() {
      console.log('click');
      $(this).parents('.drop-down').toggleClass('active');
    }

    return this.init();

  };

  $.fn.builder = function() {

    return this.each(function() {

      if($(this).data('builder')) {
        return $(this).data('builder');
      } else {
        var builder = new Builder(this);
        $(this).data('builder', builder);
        return builder;
      }

    });

  };

})(jQuery);