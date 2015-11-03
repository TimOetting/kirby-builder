<?php

require_once(panel()->roots()->fields()."/structure/controller.php");

use Kirby\Panel\Models\Page\Structure;
use Kirby\Panel\Models\Page\Blueprint\Field;

class BuilderStructure extends Structure {

  protected $fieldsets;

  public function __construct($page, $field, $fieldsetName) {
    parent::__construct($page, $field);
    
    $this->fieldsets = $this->config->get("fieldsets");
    $fieldsetConfig = new Field($this->fieldsets[$fieldsetName]);

    $this->config = $fieldsetConfig;
  }
}

class BuilderFieldController extends StructureFieldController {

  public function add() {

    $self      = $this;
    $page      = $this->model();
    $store     = $this->store($page);

    $fieldsetName = get("fieldset");
    $fieldsetStore = $this->fieldset($fieldsetName);

    if(!$fieldsetStore)
      return $this->modal('error', array(
        'text' => 'No fieldset with name "'. $fieldsetName . '" found.'
      ));

    $modalsize = $this->field()->modalsize();
    $form      = $this->form('add', array($page, $fieldsetStore), function($form) use($page, $store, $self, $fieldsetName) {

      $form->validate();

      if(!$form->isValid()) {
        return false;
      }

      $data = $form->serialize();
      $data["_fieldset"] = $fieldsetName;

      $store->add($data);
      $self->notify(':)');
      $self->redirect($page);
    });

    $form->attr('action', panel()->urls()->current()."?fieldset=".get("fieldset"));

    return $this->modal('add', compact('form', 'modalsize'));

  }

  public function update($entryId) {

    $self  = $this;
    $page  = $this->model();
    $store = $this->store($page);
    $entry = $store->find($entryId);

    $fieldsetStore = $this->fieldset($entry->_fieldset);
    
    if(!$fieldsetStore)
      return $this->modal('error', array(
        'text' => 'No fieldset with name "'. $fieldsetName . '" found.'
      ));

    if(!$entry) {
      return $this->modal('error', array(
        'text' => 'The item could not be found'
      ));
    }

    $modalsize = $this->field()->modalsize();
    $form      = $this->form('update', array($page, $fieldsetStore, $entry), function($form) use($page, $store, $self, $entryId) {

      // run the form validator

      $form->validate();

      if(!$form->isValid()) {
        return false;
      }

      $store->update($entryId, $form->serialize());
      $self->notify(':)');
      $self->redirect($page);

    });

    return $this->modal('update', compact('form', 'modalsize'));
        
  }

  private function fieldset($fieldsetName) {
    return new BuilderStructure($this->model(), $this->fieldname(), $fieldsetName);
  }

}