<div class="structure<?php e($field->readonly(), ' structure-readonly') ?>" 
  data-field="structure" 
  data-api="<?php _u($field->page(), 'field/' . $field->name() . '/builder/sort') ?>" 
  data-sortable="<?php e($field->readonly(), 'false', 'true') ?>" 
  data-style="<?php echo $field->style() ?>">

  <?php echo $field->headline() ?>

  <div class="structure-entries">

    <?php if(!$field->entries()->count()): ?>
    <div class="structure-empty">
      <?php _l('fields.structure.empty') ?>
    </div>
    <?php else: ?>
    <?php require(__DIR__ . DS . 'styles' . DS . $field->style() . '.php') ?>
    <?php endif ?>

  </div>
</div>