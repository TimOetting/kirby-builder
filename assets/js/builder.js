(function($) {

  var Builder = function(element) {

    var element  = $(element);
    var dropDown = element.find('.builder-drop-down');
    var style    = element.data('style');
    var api      = element.data('api');
    var sortable = element.data('sortable');
    var entries  = style == 'table' ? element.find('.structure-table tbody') : element.find('.structure-entries');
    
    if(sortable === false) return false;

    toggleDropDown = function(event) {
      dropDown.toggleClass('active');
      return false;
    };

    element.find('.drop-down-toggle, .structure-add-button').off('click', toggleDropDown);
    element.find('.drop-down-toggle, .structure-add-button').on('click', toggleDropDown);
    dropDown.on('click', function(event) { dropDown.toggleClass('active'); });

    $(document).on('click', function (e) {
      if (!dropDown.is(e.target) && dropDown.has(e.target).length === 0) {
          dropDown.removeClass('active');
      }
    });

    var offsetFix = false

    entries.sortable({
      start: function(e, ui){
        offsetFix = (ui.helper.position().top != ui.originalPosition.top)
        if(offsetFix){
          ui.item.css('margin-top', -$('.mainbar').scrollTop() );
        }
      },
      beforestop: function(e, ui){
        if(offsetFix){
          ui.item.css('margin-top', 0);
        }
      },
      change: function(e, ui){
        if(offsetFix){
          ui.item.css('margin-top', 0);
        }
      },
      stop: function(e, ui){
        if(offsetFix){
          ui.item.css('margin-top', 0);
        }
      },
      helper: function(e, ui) {
        ui.children().each(function() {
          $(this).width($(this).width());
        });
        return ui.addClass('structure-sortable-helper');
      },
      update: function() {

        var ids = [];

        $.each($(this).sortable('toArray'), function(i, id) {
          ids.push(id.replace('structure-entry-', ''));
        });

        $.post(api, {ids: ids}, function() {
          app.content.reload();
        });

      }
    });
  };

  $.fn.builder = function() {
    // $.fn.structure.call(this);
    return this.each(function() {

      if($(this).data('builder')) {
        return $(this);
      } else {
        var builder = new Builder(this);
        $(this).data('builder', builder);
        return $(this);
      }

    });

  };

})(jQuery);