<?php
/**
 * Builder Plugin
 *
 * @author Tim Ötting <email@tim-oetting.de>
 * @version 0.9
 */
$router = new Router(array( 
  array(
    'pattern' => 'views/editor/builder2/(:all)/(:any)/(:any)/(:any)',
    'action'  => 'builderForm',
    'filter'  => 'auth',
    'method'  => 'POST|GET',
    'modal'   => true,
  ),
));

if($route = $router->run()){
  call($route->action(), $route->arguments());
  exit;
}

function builderForm($id, $fieldName, $fieldsetName, $context) {  
  
  $kirby = kirby();
  $kirby->extensions();
  $kirby->plugins();

  $root  =  $kirby->roots->index . DS . 'panel';
  $panel = new Panel($kirby, $root);
  $panel->i18n();
  $roots = new Panel\Roots($panel, $root);

  $site  = $kirby->site();

  $page = empty($id) ? site() : page($id);

  if(!$page) throw new Exception('The page could not be found');
  $blueprint  = blueprint::find($page);
  $field      = null;
  $fields     = ($context == 'file') ? $blueprint->files()->fields() : $blueprint->fields();
  // make sure to get fields by case insensitive field names
  foreach($fields as $f) {
    if(strtolower($f->name) == strtolower($fieldName)) {
      $field = $f;
    }
  }
  if(!$field) throw new Exception('The field could not be found');

  $fieldsets  = $field->fieldsets();
  $fields     = new Blueprint\Fields($fieldsets[$fieldsetName]['fields'], $page);
  $fields     = $fields->toArray();
  foreach($fields as $key => $field) {
    if($field['type'] == 'textarea') $fields[$key]['buttons'] = false;
  }

  $form        = new Form($fields, null, $fieldName);
  $form->save  = get('_id') ? l('fields.structure.save') : l('fields.structure.add');
  echo '<div class="modal-content modal-content-large">';
  echo $form;
  echo '</div>';

}
// }
