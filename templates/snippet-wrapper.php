<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <?php if ($page->_csspath()->isNotEmpty()): ?>
    <?= css([$page->_csspath(), '@auto']) ?>
  <?php endif ?>
  <?php if ($page->_jspath()->isNotEmpty()): ?>
    <?= js($page->_jspath()) ?>
  <?php endif ?>
  <style>
    html, body{
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  
<?php
  snippet($page->content()->_snippetpath()->toString(), 
    [
      'page' => page($page->content()->_pageid()->toString()), 
      $page->content()->_modelname()->toString() => $page->content()->not('_snippetPath', '_cssPath', '_jsPath', 'pageid')
    ]); 
?>

<script>
  window.onload = function () { 
    if (window.frameElement) {
      window.frameElement.dispatchEvent(new CustomEvent('loaded', { detail: { height: document.documentElement.offsetHeight } }))
    }
  }
</script>
</body>
</html>