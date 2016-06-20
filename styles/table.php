<table class="structure-table">
  <thead>
    <tr>
      <th class="structure-table-fieldset">Fieldset</th>
      <th>Entry</th>
      <th class="structure-table-options">  
        &nbsp;
      </th>
    </tr>    
  </thead>
  <tbody>
    <?php foreach($field->entries() as $entry): ?>
    <tr id="structure-entry-<?php echo $entry->id() ?>">
      <td class="structure-table-fieldset-name">
        <a data-modal href="<?php __($field->url($entry->id() . '/update')) ?>">
          <?php if($field->fieldsets() && isset($field->fieldsets()[$entry->_fieldset()])) : ?>
          <?php echo html($field->fieldset($entry->_fieldset())->label()) ?>
          <?php else: ?>
          No fieldset found.
          <?php endif ?>
        </a>
      </td>
      <td>
        <a data-modal href="<?php __($field->url($entry->id() . '/update')) ?>">
          <?php echo $field->entry($entry) ?>
        </a>
      </td>
      <td class="structure-table-options">
        <a data-modal class="btn" href="<?php __($field->url($entry->id() . '/delete')) ?>">
          <?php i('trash-o') ?>
        </a>
      </td>
    </tr>
    <?php endforeach ?>
  </tbody>
</table>