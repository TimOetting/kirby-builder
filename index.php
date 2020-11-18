<?php

use Kirby\Cms\Blueprint;
use Kirby\Cms\Api;
use Kirby\Cms\Form;
use Kirby\Cms\Content;
use Kirby\Form\Field;
use Kirby\Form\Fields;
use Kirby\Toolkit\I18n;

require_once __DIR__ . '/lib/BuilderBlueprint.php';
use KirbyBuilder\Builder\BuilderBlueprint;

/**
 * Calls the API endpoint for a nested field (e.g. a structure or a fieles field)
 */
function callFieldAPI($ApiInstance, $fieldPath, $context, $path) {
  $fieldPath = Str::split($fieldPath, '+');
  $form = Form::for($context);
  $field = fieldFromPath($fieldPath, $context, $form->fields()->toArray());
  $fieldApi = $ApiInstance->clone([
    'routes' => $field->api(),
    'data'   => array_merge($ApiInstance->data(), ['field' => $field])
  ]);
  return $fieldApi->call($path, $ApiInstance->requestMethod(), $ApiInstance->requestData());
}

/**
 * Gets a nested Field Object, also from within nested builder, by recursively iterating and extending through the configurations.
 * 
 * @param array $fieldPath
 * @param \Kirby\Cms\Page $page
 * @param array $fields
 * @return \Kirby\Form\Field
 */
function fieldFromPath($fieldPath, $page, $fields) {
  $fieldName = array_shift($fieldPath);
  $fieldProps = $fields[$fieldName];
  if ($fieldProps['type'] === 'builder' && count($fieldPath) > 0) {
    $fieldsetKey = array_shift($fieldPath);
    $fieldset = $fieldProps['fieldsets'][$fieldsetKey];
    $fieldset = BuilderBlueprint::extend($fieldset);
    $fieldset = extendRecursively($fieldset, $page, '__notNull');
    if (array_key_exists('tabs', $fieldset) && is_array($fieldset['tabs'])) {
      $fieldsetFields = [];
      foreach ( $fieldset['tabs'] as $tabKey => $tab) {
        $fieldsetFields = array_merge($fieldsetFields, $tab['fields']);
      }
    } else {
      $fieldsetFields = $fieldset['fields'];
    }
    return fieldFromPath($fieldPath, $page, $fieldsetFields);
  } else if ($fieldProps['type'] === 'structure' && count($fieldPath) > 0) {
    return fieldFromPath($fieldPath, $page, $fieldProps['fields']);
  } else {
    $fieldProps['model'] = $page;
    return new Field($fieldProps['type'], $fieldProps);
  }
}

/**
 * Transforms values from the content file to panel ready values.
 * 
 * Returning just the yaml decoded value from the content file is not enough to work with fields in the panel. File Fields, Select Fields an others require the values to be transformed to work with the vue components. To get this transformed value I create a proxy Form to get the get the values via its value() function.
 * 
 * @param array $values
 * @param array $fieldsets
 * @param \Kirby\Api\Model|null $model
 * @return array
 */
function getPanelReadyValues ($values, $fieldsets, $model = null)  {
  $vals = [];
  if ($values == null) {
    return $vals;
  }
  foreach ($values as $key => $value) {
    $blockKey = $value['_key'];
    if (array_key_exists($blockKey, $fieldsets)) {
      $block = $fieldsets[$blockKey];
      $form = getBlockForm($value, $block, $model);
    }
    $vals[] = $form->values();
  }
  return $vals;
}

/**
 * Returns a Kirby Form object from block fields. It also merges fields of block tabs to be treated as one form.
 * 
 * @param array $value
 * @param array $blockConfig
 * @param \Kirby\Api\Model|null $model
 */
function getBlockForm($value, $blockConfig, $model = null) {
  $fields = [];
  if (array_key_exists('fields', $blockConfig)) {
    $fields = $blockConfig['fields'];
  } else if (array_key_exists('tabs', $blockConfig)) {
    $tabs = $blockConfig['tabs'];
    foreach ( $tabs as $tabKey => $tab) {
      $fields = array_merge($fields, $tab['fields']);
    }
  }
  foreach ($fields as $key => $field ) {
    $fields[$key]["errors"] = null;
  }
  $form = new Form([
    'fields' => $fields,
    'values' => $value,
    'model'  => $model
  ]);
  return $form;
}

/**
 * Recursively iterates through the properties of a a builder's fieldsets configuration and transforms the fields property to a panel compatible structure
 * 
 * @param array $properties
 * @param \Kirby\Api\Model|null $model
 */
function getEnhancedBlockConfig($properties, $model) {
  foreach ($properties as $name => $props) {
    if (is_array($props)) {
      if ($name === "fields") {
        $fieldForm = new Form([
          'fields' => $properties["fields"],
          'model'  => $model ?? null
          ]
        );
        $properties["fields"] = $fieldForm->fields()->toArray();
        $properties["extended"] = true;
      } else {
        $properties[$name] = getEnhancedBlockConfig($props, $model);
      }
    }
  }
  return $properties;
}

Kirby::plugin('timoetting/kirbybuilder', [
  'fields' => [
    'builder' => [
      'computed' => [
        'pageId' => function () {
          return $this->model()->id();
        },
        'pageUid' => function () {
          return $this->model()->uid();
        },
        'encodedPageId' => function () {
          return str_replace('/', '+', $this->model()->id());
        },
        'fieldsets' => function () {
          if (!$this->isNestedBuilder) {
            $cache = [];
            $fieldSets = Yaml::decode($this->fieldsets);
            $fieldSets = extendRecursively($fieldSets, $this->model(), null, $cache);
            $fieldSets = getEnhancedBlockConfig($fieldSets, $this->model());
            return $fieldSets;
          } else {
            return $this->fieldsets;
          }
        },
        'pending' => function () {
          return ($this->isNestedBuilder) ? true : false;
        },
        'value' => function () {
          if ($this->isNestedBuilder) {
            return $this->value;
          } else {
            $values = $this->value != null ? Yaml::decode($this->value) : Yaml::decode($this->default);
            return getPanelReadyValues($values, $this->fieldsets, $this->model());
          }
        },
        'cssUrls' => function() {
          return [];
        },
        'jsUrls' => function() {
          return [];
        }       
      ],
      'methods' => [
        'getData' => function ($values)  {
          $vals = [];
          if ($values == null) {
            return $vals;
          }
          foreach ($values as $value) {
            $blockKey = $value['_key'];
            if (array_key_exists($blockKey, $this->fieldsets)) {
              if ($this->isNestedBuilder) {
                $this->fieldsets[$blockKey] = extendRecursively([$blockKey => $this->fieldsets[$blockKey]], $this->model())[$blockKey];
              }
              $blockConfig = $this->fieldsets[$blockKey];

              $form = $this->getBlockForm($value, $blockConfig);
            }
            $vals[] = $form->data();
          }
          return $vals;
        },
        'getBlockForm' => function ($value, $block) {
          return getBlockForm($value, $block, $this->model());
        },
      ],
      'validations' => [
        'validateChildren' => function ($values) {
          $errorMessages = [];
          if ($values && gettype($values) === "array") {
            foreach ($values as $value) {
              $blockKey = $value['_key'];
              if (array_key_exists($blockKey, $this->fieldsets)) {
                if ($this->isNestedBuilder) {
                  $this->fieldsets[$blockKey] = extendRecursively([$blockKey => $this->fieldsets[$blockKey]], $this->model())[$blockKey];
                }
                $blockConfig = $this->fieldsets[$blockKey];
                $form = $this->getBlockForm($value, $blockConfig);
                if ($form->errors()) {
                  foreach ($form->errors() as $fieldKey => $error) {
                    foreach ($error["message"] as $errorKey => $message) {
                      if ($errorKey != "validateChildren") {
                        $errorMessage = "";
                        if (array_key_exists('name', $blockConfig)) {
                          $errorMessage .= $blockConfig["name"] . "/";
                        }
                        $errorMessage .= $error['label'] . ': ' . $message;
                        $errorMessages[] = $errorMessage;
                      } else {
                        $errorMessages[] = $message;
                      }
                    }
                  }
                }
              }
            }
          }
          if (count($errorMessages)) {
            throw new Exception(implode("\n", $errorMessages));
          }
        }
      ],
      'save' => function ($values = null) {
        return $this->getData($values);
      },
    ],
  ],
  'api' => [
    'routes' => [
      [
        'pattern' => 'kirby-builder/pages/(:any)/blockformbyconfig',
        'method' => 'POST',
        'action'  => function (string $pageUid) {
          $page = kirby()->page($pageUid);
          $blockConfig = kirby()->request()->data();
          $extendedProps = extendRecursively($blockConfig, $page);
          $defaultValues = [];
          if(array_key_exists("tabs", $extendedProps)) {
            $tabs = $extendedProps['tabs'];
            foreach ( $tabs as $tabKey => &$tab) {
              foreach ($tab["fields"] as $fieldKey => &$field) {
                if (array_key_exists("default", $field)) {
                  $defaultValues[$fieldKey] = $field["default"];
                }
              }
            }
          } else {
            foreach ($extendedProps["fields"] as $fieldKey => &$field) {
              if (array_key_exists("default", $field)) {
                $defaultValues[$fieldKey] = $field["default"];
              }
            }
          }
          $extendedProps["defaultValues"] = $defaultValues;
          return $extendedProps;
        }
      ],
      [
        'pattern' => 'kirby-builder/pages/(:all)/builderconfig',
        'method' => 'POST',
        'action'  => function (string $pageUid) {
          $page = kirby()->page($pageUid);
          $builderConfig = kirby()->request()->data();
          $cache = [];
          $fieldsets = extendRecursively($builderConfig["fieldsets"], $page, null, $cache);
          $fieldsets = getEnhancedBlockConfig($fieldsets, $page);
          $value = getPanelReadyValues($builderConfig["value"], $fieldsets, $page);
          return [
            "fieldsets" => $fieldsets,
            "value" => $value
          ];
        }
      ],
      [
        'pattern' => 'kirby-builder/preview',
        'method' => 'POST',
        'action'  => function () {
          $existingPreviews = kirby()->session()->data()->get('kirby-builder-previews');
          $newPreview = [get('blockUid') => get('blockcontent')];
          if (isset($existingPreviews)) {
            $updatedPreviews = $existingPreviews;
            $updatedPreviews[get('blockUid')] = get('blockcontent');
            kirby()->session()->set('kirby-builder-previews', $updatedPreviews);
          } else {
            $newPreview = [get('blockUid') => get('blockcontent')];
            kirby()->session()->set('kirby-builder-previews', $newPreview);
          }
          return [
            'code' => 200,
            'status' => 'ok'
          ];
        }
      ],
      [
        'pattern' => 'kirby-builder/rendered-preview',
        'method' => 'POST',
        'action'  => function () {
          $kirby            = kirby();
          $blockUid         = get('blockUid');
          $blockContent     = get('blockContent');
          $block            = get('block');
          $previewOptions   = get('preview');
          $cache            = $kirby->cache('timoetting.builder');
          $existingPreviews = $cache->get('previews');
          if(isset($existingPreviews)) {
            $updatedPreviews            = $existingPreviews;
            $updatedPreviews[$blockUid] = $blockContent;
            $cache->set('previews', $updatedPreviews);
          } else {
            $newPreview = [$blockUid => $blockContent];
            $cache->set('previews', $newPreview);
          }
          $snippet      = $previewOptions['snippet'] ?? null;
          $modelName    = $previewOptions['modelname'] ?? 'data';
          $originalPage = $kirby->page(get('pageid'));
          $form = getBlockForm($blockContent, $block, $originalPage);
          return array(
            'preview' => snippet($snippet, ['page' => $originalPage, $modelName => new Content($form->data(), $originalPage)], true) ,
            'content' => get('blockContent')
          );
        }
      ],
      [
        'pattern' => 'kirby-builder/site/fields/(:any)/(:all?)',
        'method' => 'ALL',
        'action'  => function (string $fieldPath, string $path = null) {            
          return callFieldAPI($this, $fieldPath, site(), $path);
        }
      ],
      [
        'pattern' => 'kirby-builder/pages/(:any)/fields/(:any)/(:all?)',
        'method' => 'ALL',
        'action'  => function (string $id, string $fieldPath, string $path = null) {            
          if ($page = $this->page($id)) {
            return callFieldAPI($this, $fieldPath, $page, $path);
          }
        }
      ],
    ],
  ],
  'translations' => [
    'en' => [
      'builder.clone' => 'Clone',
      'builder.preview' => 'Preview',
    ],
    'fr' => [
      'builder.clone' => 'Dupliquer',
      'builder.preview' => 'Aperçu',
    ],
    'de' => [
      'builder.clone' => 'Duplizieren',
      'builder.preview' => 'Vorschau',
    ],
    'sv' => [
      'builder.clone' => 'Duplicera',
      'builder.preview' => 'Förhandsgranska',
    ],
  ],  
  'templates' => [
    'snippet-wrapper' => __DIR__ . '/templates/snippet-wrapper.php'
  ],
  'fieldMethods' => [
    'toBuilderBlocks' => function ($field) {
      return $field->toStructure();
    }
  ]
]);

function extendRecursively($properties, $page, $currentPropertiesName = null, &$cache = []) {
  if ($currentPropertiesName !== "fieldsets") {
    foreach ($properties as $propertyName => $property) {
      if(($currentPropertiesName === null && is_string($property)) || is_array($property)){ 
        $properties[$propertyName] = BuilderBlueprint::extend($property, $cache);
        $properties[$propertyName] = extendRecursively($properties[$propertyName], $page, $propertyName, $cache);
      }
      if($propertyName === "label" || $propertyName === "name") {
        $translatedText = I18n::translate($property, $property);
        if (!empty($translatedText)) {
          $properties[$propertyName] = $translatedText;
        }
      }
      if(array_key_exists("type", $properties) 
        && $properties["type"] == "builder" 
        && !array_key_exists("isNestedBuilder", $properties)) {
          $properties["isNestedBuilder"] = true;
        };
    }
  }
  return $properties;
}