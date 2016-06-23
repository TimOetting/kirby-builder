<?php

require_once(panel()->roots()->fields()."/structure/controller.php");

use Kirby\Panel\Structure;;
use Kirby\Panel\Models\Page\Blueprint\Field;

class BuilderStructure extends Structure {

  protected $fieldsets;

  public function __construct($model) {
    parent::__construct($model, "builder");
  }

  public function forFieldset($field, $fieldsetName) {
    parent::forField($field);

    $this->fieldsets = $this->config->get("fieldsets");
    $fieldsetConfig = new Field($this->fieldsets[$fieldsetName], $this->model);

    $this->config = $fieldsetConfig;

    return $this;

  }
}

class BuilderFieldController extends StructureFieldController {

  public function add() {

    $self      = $this;
    $model     = $this->model();
    $structure = $this->structure($model);
    $modalsize = $this->field()->modalsize();

    $fieldsetName = get("fieldset");
    $fieldsetStructure = $this->fieldsetStructure($fieldsetName);

    if(!$fieldsetStructure)
      return $this->modal('error', array(
        'text' => 'No fieldset with name "'. $fieldsetName . '" found.'
      ));

    $form      = $this->form('add', array($model, $fieldsetStructure), function($form) use($model, $structure, $self, $fieldsetName) {

      $form->validate();

      if(!$form->isValid()) {
        return false;
      }

      $data = $form->serialize();
      $data["_fieldset"] = $fieldsetName;

      $structure->add($data);
      $self->notify(':)');
      $self->redirect($model);

    });

    $form->attr('action', panel()->urls()->current()."?fieldset=".get("fieldset"));

    return $this->modal('add', compact('form', 'modalsize'));
  }

  public function update($entryId) {

    $self      = $this;
    $model     = $this->model();
    $structure = $this->structure($model);
    $entry     = $structure->find($entryId);

    $fieldsetStructure = $this->fieldsetStructure($entry->_fieldset);
    
    if(!$fieldsetStructure)
      return $this->modal('error', array(
        'text' => 'No fieldset with name "'. $fieldsetName . '" found.'
      ));

    if(!$entry) {
      return $this->modal('error', array(
        'text' => 'The item could not be found'
      ));
    }

    $modalsize = $this->field()->modalsize();
    // $style = $this->field()->style();
    $form      = $this->form('update', array($model, $fieldsetStructure, $entry), function($form) use($model, $structure, $self, $entryId) {

      // run the form validator
      $form->validate();

      if(!$form->isValid()) {
        return false;
      }

      $structure->update($entryId, $form->serialize());
      $self->notify(':)');
      $self->redirect($model);  

    });

    return $this->modal('update', compact('form', 'modalsize'));
  }

  private function fieldsetStructure($fieldsetName) {
    $structure = new BuilderStructure($this->model());
    return $structure->forFieldset($this->fieldname(), $fieldsetName);
  }

}