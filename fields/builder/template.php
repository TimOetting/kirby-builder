<div class="builder<?php e($field->readonly(), ' builder-readonly') ?>" data-field="builder" data-page="<?php echo $field->page() ?>" data-sortable="<?php e($field->readonly(), 'false', 'true') ?>" data-file-url="<?php echo site()->url() . '/content/' . $field->page->diruri() . '/'  ?>">

  <?php echo $field->headline() ?>

  <input type="hidden" name="<?php __($field->name()) ?>" value="<?php __(json_encode($field->value()), false) ?>">

    <script class="builder-entries-template" type="text/x-handlebars-template">
      {{#unless entries}}
      <div class="builder-empty">
        <?php _l('fields.structure.empty') ?>
      </div>
      {{/unless}}

      {{#entries}}
      <div class="builder-entry" id="builder-entry-{{_id}}" data-fieldset="{{_fieldset}}">
        <div class="builder-entry-content text">
        </div>
        <?php if(!$field->readonly()): ?>
        <nav class="builder-entry-options cf">
          <button type="button" data-builder-id="{{_id}}" data-fieldset="{{_fieldset}}" class="btn btn-with-icon builder-edit-button">
            <?php i('pencil', 'left') . _l('fields.structure.edit') ?>
          </button>
          <button type="button" data-builder-id="{{_id}}" class="btn btn-with-icon builder-delete-button">
            <?php i('trash-o', 'left') . _l('fields.structure.delete') ?>
          </button>
        </nav>
        <?php endif ?>
      </div>
      {{/entries}}
    </script>
  <?php foreach ($field->fieldsets as $fieldsetName => $fieldset): ?>
    <script class="builder-entries-template-<?php echo $fieldsetName ?>" type="text/x-handlebars-template">
      <div class="builder-entry-fieldset"><?php echo $fieldset['label'] ?></div>
      {{#entry}}
      <?php echo $field->entryTemplate($fieldsetName) ?>
      {{/entry}}
    </script>
  <?php endforeach ?>

</div>