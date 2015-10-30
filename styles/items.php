<?php foreach($field->entries() as $entry): ?>
<div class="structure-entry" id="structure-entry-<?php echo $entry->id() ?>">
  <div class="structure-entry-content text">
    <?php echo $field->entry($entry) ?>
  </div>
  <?php if(!$field->readonly()): ?>
  <nav class="structure-entry-options cf">
    <a data-modal class="btn btn-with-icon structure-edit-button" href="<?php _u($field->page(), 'field/' . $field->name() . '/builder/' . $entry->id() . '/update') ?>">
      <?php i('pencil', 'left') . _l('fields.structure.edit') ?>
    </a>

    <a data-modal class="btn btn-with-icon structure-delete-button" href="<?php _u($field->page(), 'field/' . $field->name() . '/builder/' . $entry->id() . '/delete') ?>">
      <?php i('trash-o', 'left') . _l('fields.structure.delete') ?>
    </a>
  </nav>
  <?php endif ?>
</div>          
<?php endforeach ?>