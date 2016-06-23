<?php

use Kirby\Panel\Models\Page\Blueprint\Field;

class BuilderField extends StructureField {

  static public $assets = array(
    'js' => array(
      'builder.js'
    ),
    'css' => array(
      'builder.css'
    )
  );

  public function fieldset($fieldsetName) {
    return new Field($this->fieldsets[$fieldsetName], $this->page());
  }

  public function modalsize() {
    $sizes = array('small', 'medium', 'large', 'extralarge');
    return in_array($this->modalsize, $sizes) ? $this->modalsize : 'large';
  }

  public function entry($data) {

    if(isset($data->_fieldset))
      $fieldsetName = $data->_fieldset;
    else
      return "No fieldset found in entry.";

    if(isset($this->fieldsets[$fieldsetName])) {
      $fieldset = $this->fieldset($fieldsetName);
      $this->snippet = $fieldset->snippet();
      $this->entry = $fieldset->entry();
      $this->fields = $fieldset->fields();
    } else 
      return 'No fieldset with name "'. $fieldsetName . '" found.';

    $data->_fileUrl = $this->page->contentUrl() . DS;
    if ($this->snippet){
      $data = structure((array) $data, $this->page());
      return tpl::load(c::get( 'buildersnippets.path', kirby()->roots()->snippets() ) . DS . $this->snippet . '.php', array(
        'page' => $this->page(),
        'data' => $data,
      ));
    } else {
      return parent::entry($data);
    }
  }

  public function headline() {
    $label = BaseField::label();
    return $label;
  }

  public function style() {
    return 'items';
  }

  public function content() {
    return tpl::load(__DIR__ . DS . 'template.php', array('field' => $this));
  }

  public function url($action) {
    return purl($this->model(), 'field/' . $this->name() . '/builder/' . $action);
  }  

}