(function($) {

  var Builder = function(element) {

    var element  = $(element);
    var dropDown = element.find('.builder-drop-down');

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
  };

  $.fn.builder = function() {
    $.fn.structure.call(this);
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