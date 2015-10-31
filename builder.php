<?php

class BuilderField extends StructureField {

  static public $assets = array(
    'js' => array(
      'structure.js',
      'builder.js'
    ),
    'css' => array(
      'structure.css',
      'builder.css'
    )
  );

  public function entry($data) {

    if(isset($data->_fieldset))
      $fieldsetName = $data->_fieldset;
    else
      return "No fieldset found in entry.";

    if(isset($this->fieldsets[$fieldsetName])) {
      $fieldset = $this->fieldsets[$fieldsetName];

      if(isset($fieldset["entry"]))
        $this->entry = $fieldset["entry"];
      else
        $this->entry = null;

      $this->fields = $fieldset["fields"];
    } else 
      return 'No fieldset with name "'. $fieldsetName . '" found.';

    return parent::entry($data);
  }

  public function headline() {

    if(!$this->readonly) {

      $fieldName = $this->name;
      $blueprint = $this->page()->blueprint();
      $fieldsets = $blueprint->fields()->$fieldName->fieldsets;

      $dropDown = new Brick("div");
      $dropDown->addClass('builder-drop-down');

      $addList = new Brick('ul');
      $addList->addClass('builder-add-list');

      foreach ($fieldsets as $fieldsetName => $fieldsetFields) {

        $addListItem = new Brick('li');

        $add = new Brick('a');
        $add->html('<i class="icon icon-left fa fa-plus-circle"></i>' . $fieldsetFields['label']);
        $add->addClass('builder-add-button');
        $add->data('modal', true);
        $add->attr('href', purl($this->page, 'field/' . $this->name . '/builder/add?fieldset=' . $fieldsetName));

        $addListItem->append($add);
        $addList->append($addListItem);
      }

    } else
      $addList = null;

    $label = parent::headline();
    
    $dropDown->append($addList);
    $label->append($dropDown);

    return $label;

  }

  public function content() {
    return tpl::load(__DIR__ . DS . 'template.php', array('field' => $this));
  }

}