<table class="structure-table">
  <thead>
    <tr>
      <th>Type</th>
      <th>Entry</th>
      <th class="structure-table-options">  
        &nbsp;
      </th>
    </tr>    
  </thead>
  <tbody>
    <?php foreach($field->entries() as $entry): ?>
    <tr id="structure-entry-<?php echo $entry->id() ?>">
      <td>
        <a data-modal href="<?php _u($field->page(), 'field/' . $field->name() . '/builder/' . $entry->id() . '/update') ?>">
          <?php if($field->fieldsets() && isset($field->fieldsets()[$entry->_fieldset()])) : ?>
          <?php echo html($field->fieldsets()[$entry->_fieldset()]["label"]) ?>
          <?php else: ?>
          No type found.
          <?php endif ?>
        </a>
      </td>
      <td>
        <a data-modal href="<?php _u($field->page(), 'field/' . $field->name() . '/builder/' . $entry->id() . '/update') ?>">
          <?php echo $field->entry($entry) ?>
        </a>
      </td>
      <td class="structure-table-options">
        <a data-modal class="btn" href="<?php _u($field->page(), 'field/' . $field->name() . '/builder/' . $entry->id() . '/delete') ?>">
          <?php i('trash-o') ?>
        </a>
      </td>
    </tr>
    <?php endforeach ?>
  </tbody>
</table>