<?php

use Kirby\Cms\Blueprint;
use Kirby\Cms\Api;
use Kirby\Cms\Form;
use Kirby\Form\Field;
use Kirby\Form\Fields;
use Kirby\Toolkit\I18n;

Kirby::plugin('timoetting/kirbybuilder', [
  'fields' => [
    'builder' => [
      'props' => [
        'value' => function ($value = null) {
          return $value;
        }
      ],
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
          $fieldSets = Yaml::decode($this->fieldsets);
          $fieldSets = $this->extendRecursively($fieldSets);
          return $fieldSets;
        },
        'value' => function () {
          $values = $this->value != null ? Yaml::decode($this->value) : Yaml::decode($this->default);
          $vals = [];
          foreach ($values as $key => $value) {
            $blockKey = $value['_key'];
            if (array_key_exists($blockKey, $this->fieldsets)) {
              if (array_key_exists('fields', $this->fieldsets[$blockKey])) {
                $fields = $this->fieldsets[$blockKey]['fields'];
                $form = new Form([
                  'fields' => $this->fieldsets[$blockKey]['fields'],
                  'values' => $value,
                  'model'  => $this->model() ?? null
                ]);
              } 
              else if (array_key_exists('tabs', $this->fieldsets[$blockKey])) {
                $fields = [];
                $tabs = $this->fieldsets[$blockKey]['tabs'];
                foreach ( $tabs as $tabKey => $tab) {
                  $fields = array_merge($fields, $tab['fields']);
                }
                $form = new Form([
                  'fields' => $fields,
                  'values' => $value,
                  'model'  => $this->model() ?? null
                ]);
              }
            }
            $vals[] = $form->values();
          }
          return $vals;
        },
        'cssUrls' => function() {
          $cssUrls = array_map(function($arr) {
            if(array_key_exists('preview', $arr)) {
              return array_key_exists('css', $arr['preview']) ? $arr['preview']['css'] : '';
            }
          }, $this->fieldsets);
          $cssUrls = array_filter($cssUrls);
          return $cssUrls;
        },
        'jsUrls' => function() {
          $jsUrls = array_map(function($arr) {
            if(array_key_exists('preview', $arr)) {
              return array_key_exists('js', $arr['preview']) ? $arr['preview']['js'] : '';
            }
          }, $this->fieldsets);
          $jsUrls = array_filter($jsUrls);
          return $jsUrls;
        }	        
      ],
      'methods' => [
        'extendRecursively' => function ($properties, $currentPropertiesName = null) {
          foreach ($properties as $propertyName => $property) {
            if(is_array($property)){
              $properties[$propertyName] = $this->model()->blueprint()->extend($property);
              $properties[$propertyName] = $this->extendRecursively($properties[$propertyName], $propertyName);
            }
            if($propertyName == "label") {
              $properties[$propertyName] = I18n::translate($property, $property);
            }
          }
          if ($currentPropertiesName === 'fields') {
            $fieldForm = new Form([
              'fields' => $properties,
              'model'  => $this->model() ?? null
            ]);
            $properties = $fieldForm->fields()->toArray();
          }
          return $properties;
        },
      ],
      'save' => function ($values = null) {
        $vals = [];
        if ($values == null) {
          return $vals;
        }
        foreach ($values as $key => $value) {
          $blockKey = $value['_key'];
          if (array_key_exists('fields', $this->fieldsets[$blockKey])) {
            $fields = $this->fieldsets[$blockKey]['fields'];
            $form = new Form([
              'fields' => $fields,
              'values' => $value,
              'model'  => $this->model() ?? null
            ]);
          } else if (array_key_exists('tabs', $this->fieldsets[$blockKey])) {
            $fields = [];
            $tabs = $this->fieldsets[$blockKey]['tabs'];
            foreach ( $tabs as $tabKey => $tab) {
              $fields = array_merge($fields, $tab['fields']);
            }
            $form = new Form([
              'fields' => $fields,
              'values' => $value,
              'model'  => $this->model() ?? null
            ]);
          }
          $vals[] = $form->data();
        }
        return $vals;
      },
    ],
  ],
  'api' => [
    'routes' => [
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
          $blockFields     = get('blockFields');
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
          $form = new Form([
            'fields' => $blockFields,
            'values' => $blockContent,
            'model'  => $originalPage
          ]);
          $page = new Page([
            'slug'     => 'builder-preview',
            'template' => 'builder-preview',
            'content'  => $form->data(),
            'files'    => $originalPage->files()->toArray()
          ]);
          return array(
            'preview' => snippet($snippet, ['page' => $originalPage, $modelName => $page->content()], true) ,
            'content' => get('blockContent')
          );
        }
      ],
      [
        'pattern' => 'kirby-builder/pages/(:any)/fields/(:any)/(:all?)',
        'method' => 'ALL',
        'action'  => function (string $id, string $fieldPath, string $path = null) {            
          if ($page = $this->page($id)) {
            $fieldPath = Str::split($fieldPath, '+');
            $form = Form::for($page);
            $field = fieldFromPath($fieldPath, $page, $form->fields()->toArray());
            $fieldApi = $this->clone([
              'routes' => $field->api(),
              'data'   => array_merge($this->data(), ['field' => $field])
            ]);
            return $fieldApi->call($path, $this->requestMethod(), $this->requestData());
          }
        }
      ],
    ],
  ],
  'routes' => [
    [
      'pattern' => 'kirby-builder-preview/(:any)',
      'method' => 'GET',
      'action'  => function ($blockUid) {
        $content = kirby()->session()->data()->get('kirby-builder-previews')[$blockUid];
        if (get('pageid')) {
          $content['_pageid'] = get('pageid');
        }
        if (get('snippet')) {
          $content['_snippetpath'] = get('snippet');
        }
        if (get('css')) {
          $content['_csspath'] = get('css');
        }
        if (get('js')) {
          $content['_jspath'] = get('js');
        }
        $content['_modelname'] = (get('modelname')) ? get('modelname') : 'data';
        $responsePage = new Page([
          'slug' => 'virtual-reality',
          'template' => 'snippet-wrapper',
          'content' => $content
        ]);
        return $responsePage;
      }
    ],
    [
      'pattern' => 'kirby-builder-frame',
      'method' => 'GET',
      'action'  => function () {
        return '<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>Document</title>
          </head>
          <body>
            hey
          </body>
          </html>';
      }
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

// example: http://localhost:8889/api/kirby-builder/pages/projects+trees-and-stars-and-stuff/fields/test+events+eventlist+event+downloads
function fieldFromPath($fieldPath, $page, $fields) {
  $fieldName = array_shift($fieldPath);
  $fieldProps = $fields[$fieldName];
  if ($fieldProps['type'] === 'builder' && count($fieldPath) > 0) {
    $fieldsetKey = array_shift($fieldPath);
    $fieldset = $fieldProps['fieldsets'][$fieldsetKey];
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
