<?php
class BuilderField extends BaseField {

  static public $assets = array(
    'js' => array(
      'builder.js'
    ),
    'css' => array(
      'builder.css'
    )
  );

  public $fields = array();
  public $entry  = null;

  public function fields() {

    $output = array();

    foreach($this->fields as $k => $v) {
      $v['name']  = $k;
      $v['value'] = '{{' . $k . '}}';
      $output[] = $v;
    }

    return $output;

  }

  public function value() {

    if(is_string($this->value)) {
      $this->value = yaml::decode($this->value);
    }

    return $this->value;

  }

  public function result() {
    $result = parent::result();
    $raw    = (array)json_decode($result);
    $data   = array();
    foreach($raw as $key => $row) {
      unset($row->_id);
      unset($row->_csfr);
      $data[$key] = (array)$row;
    }
    return yaml::encode($data);
  }

  public function entryTemplate($fieldsetName) {

    if(!isset($this->fieldsets[$fieldsetName]['entry']) or !is_string($this->fieldsets[$fieldsetName]['entry'])) {
      $html = array();
      foreach($this->fieldsets[$fieldsetName]['fields'] as $name => $field) {
        $html[] = '{{' . $name . '}}';
      }
      return implode('<br>', $html);
    } else {
      return $this->fieldsets[$fieldsetName]['entry'];
    }

  }

  public function label() {
    return null;
  }

  public function headline() {

    if(!$this->readonly) {

      $fieldName = $this->name;
      $blueprint  = blueprint::find($this->page());
      $fieldsets = $blueprint->fields()->$fieldName->fieldsets;

      $addDropdownHtml = '<div class="drop-down">';
      $addDropdownHtml .= '<a class="drop-down-toggle label-option"><i class="icon icon-left fa fa-chevron-circle-down"></i>' . l('fields.structure.add') . '</a>';
      $addDropdownHtml .= '<ul>';
      foreach ($fieldsets as $fieldsetName => $fieldsetFields) {
        $addDropdownHtml .= '<li>';
        $addDropdownHtml .= '<a href="#0" class="builder-add-button" data-fieldset="'.$fieldsetName.'"><i class="icon icon-left fa fa-plus-circle"></i>' . $fieldsetFields['label'] . '</a>';
        $addDropdownHtml .= '</li>';
      }
      $addDropdownHtml .= '</ul>';
      $addDropdownHtml .= '</div>';

    } else {
      $addButtons[] = null;
    }

    $label = parent::label();
    $label->addClass('builder-label');
    // foreach ($addButtons as $key => $value) {
    //   $label->append($add[$key]);
    // }
    $label->append($addDropdownHtml);

    return $label;

  }

  public function content() {
    return tpl::load(__DIR__ . DS . 'template.php', array('field' => $this));
  }

  public function files()
    {
        if (!is_null($this->page)) {
            $files = $this->page->files();
        } else {
            if (version_compare(Kirby::version(), '2.1', '>=')) {
                $files = site()->files();
            } else {
                return new Collection();
            }
        }

        return $files;
    }

}