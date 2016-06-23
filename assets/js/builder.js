(function($) {

  var Builder = function(element) {

    var element  = $(element);
    var dropDown = element.find('.builder-drop-down');
    var style    = element.data('style');
    var api      = element.data('api');
    var sortable = element.data('sortable');
    var entries  = style == 'table' ? element.find('.structure-table tbody') : element.find('.structure-entries');
    
    if(sortable === false) return false;

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
  $(document).on('click','.builder-entry [data-quickform]',function(e){
    e.preventDefault();
    var formUrl = $(this).attr('data-href')
    var builderEntry = $(this).closest('.builder-entry')
    var builderEntryContent = builderEntry.find('.builder-entry-content')
    var builderEntryOptions = builderEntry.find('.builder-entry-options')
    var quickformContainer = builderEntry.find('.builder-entry-quickform-container')
    placeQuickform(formUrl, quickformContainer, function(){
      builderEntryContent.addClass('hidden')
      builderEntryOptions.addClass('hidden')
    });
    return false;
  });
  $(document).on('click','.builder-add-buttons [data-quickform]',function(e){
    e.preventDefault();
    var formUrl = $(this).attr('data-href')
    var builder = $(this).closest('[data-field="builder"]')
    var quickformContainer = builder.find('.builder-add-container .builder-entry-quickform-container')
    builder.find('.builder-add-container').removeClass('hidden')
    placeQuickform(formUrl, quickformContainer, function(){});
    return false;
  });
  $(document).on('click', '.quickform .btn-submit', function(e){
    e.preventDefault();
    var fieldID = $(this).closest('.builder-entry').find('.builder-entry-quickform-container').data('quickform-container')
    var data = $('.quickform form').serialize().split(fieldID + '-').join('');
    var url = $('.quickform form').attr('action')
    var urlParamSeparator = (url.indexOf('?') > -1) ? '&' : '?'
    $.ajax({
      type: "POST",
      url: url + urlParamSeparator + data,
      success: function(){
        app.content.reload();
      }
    });
    return false
  })

  getMainButtonBar = function(){
    var mainForm = $('.form-blueprint-project')
    var mainSaveButton = mainForm.find('[type="submit"]')
    return mainSaveButton.closest('.buttons-centered')
  }

  placeQuickform = function(formUrl, $container, callback){
    $.get( formUrl, function( data ) {
      var mainButtonBar = getMainButtonBar()
      mainButtonBar.addClass('hidden')
      $container.removeClass('hidden')
      var mainForm = $('.form-blueprint-project')
      var fieldID = $container.data('quickform-container')
      var quickform = $(data.content)
      blockOtherFields($container)
      $container.html(quickform)
      var quickformFields = quickform.find('[name]')
      quickformFields.each(function(){
        //we add the field id to the the field's names to prevent duplicate naming with fields from the surrounding main form.
        $(this).attr('name', fieldID + '-' + $(this).attr('name'))
      });
      quickform.find('*[data-field]').each(function(i, element){
        // run field's javascript
        $(element)[$(element).data('field')]()
      });

      callback()
    });
  }

  blockOtherFields = function($container){
    var mainForm = $('.form-blueprint-project')
    mainForm.find('.field').addClass('blocked-by-builder')
    var builderWrapper = $container.closest('[data-field="builder"]').closest('.field')
    builderWrapper.removeClass('blocked-by-builder')
    builderWrapper.find('.builder-entry').addClass('blocked-by-builder')
    builderWrapper.find('.builder-label').addClass('blocked-by-builder')
    builderWrapper.find('.builder-add-buttons').addClass('blocked-by-builder')
    builderWrapper.find('.structure-empty').closest('.builder-entries').addClass('hidden')
    $container.closest('.builder-entry').removeClass('blocked-by-builder')
    builderWrapper.find('.builder-entries').sortable('disable')
  }

})(jQuery);