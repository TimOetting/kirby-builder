<?php

require_once(panel()->roots()->fields()."/structure/controller.php");

class BuilderFieldController extends StructureFieldController {

  public function add() {
    PC::debug(get("fieldset"), "add");

    PC::debug($this, "this");

    $self      = $this;
    $page      = $this->model();
    $store     = $this->store($page);

    $fieldsetName = get("fieldset");
    $fieldsetStore = $this->getFieldset($fieldsetName);

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

    $fieldsetStore = $this->getFieldset($entry->_fieldset);

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

  private function getFieldset($fieldsetName) {

    $fieldsets = $this->field()->fieldsets();

    if(isset($fieldsets[$fieldsetName]))
      return new BuilderFieldset($fieldsets[$fieldsetName]);
    else
      return null;
  }

}