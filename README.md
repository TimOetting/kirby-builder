# Kirby Page Builder

This custom field for [Kirby CMS](https://getkirby.com) (v2.2 and above) lets you predefine content blocks with different field sets that can then be added and arranged inside the panel (Kirby's backend).

### Blueprint example
```yaml
fields:
...
  builder:
    label: Sections
    type: builder
    fieldsets:
      bodytext:
        label: Body Text
        snippet: sections/bodytext
        fields:
          text:
            label: text
            type: textarea
      imageBanner:
        label: Image Banner
        snippet: sections/imagebanner
        fields:
          picture:
            label: Background Image
            type: image
          text:
            label: Headline Text
            type: text
      quote:
        label: Quote
        snippet: sections/quote
        fields:
          text:
            label: Quote Text
            type: textarea
          citation:
            label: Citation
            type: text
```


The above blueprint will give us a panel field like this:

![Kirby builder Screenshot](https://raw.githubusercontent.com/TimOetting/kirby-builder/master/PREVIEW.gif)

### Previewing the content inside the panel

There are three ways how the content of the builder entries can be displayed inside the panel:

- By default the builder entries just show the plain content of the coresponding field set row by row
- The builder field, just like the structure field, allows you to define some markup in teh blueprint's entry field to preview the content. The builder field extends this feature with the `{{_fileUrl}}` variable, to display images in the preview: 

	```yaml
	...
	  builder:
	    ...
	    fieldsets:
	      ...
	      imageBanner:
	        ...
			    entry: >
			      <img src="{{_fileUrl}}{{picture}}" height=120px/></br>
			      {{url}}
	...
	```


- The builder field, however, even gives you the possibility to use snippets to preview the content blocks. Inside these snippets, you have access to the `$page` and a `$data` variable. The latter contains all the content and logic of the field's data, i.e. you can render text as kirbytext, iterate over list items, etc.

	You can just declare a path to the respective snippet path in a snippet field inside the blueprint:
	
	```yaml
	...
	  builder:
	    ...
	    fieldsets:
	      ...
	      imageBanner:
	        ...
	        snippet: builder/imagebanner
	...
	```
	
	the snippet `site/snippets/builder/imageBanner.php` from the example above would look like this:
	
	```php
	<section class="imageBanner" 
	<?php if ($data->picture()->isNotEmpty()): ?>
	  style="background-image: url(<?= $page->image($data->picture())->url() ?>)"
	<?php endif ?>
	>
	  <h2 class="imageBanner-headline">
	    <?= $data->text() ?>
	  </h2>
	</section>
	```
	
	With this solution, it is possible to use the same snippet both in the website's frontend and in the panel. You can use a [custom panel styling](https://getkirby.com/docs/developer-guide/panel/css) to control the look of the individual previews.

### How the content will be stored

	----

	Builder: 
	
	- 
	  picture: forrest.jpg
	  text: Hey folks!
	  _fieldset: imageBanner
	- 
	  text: |
	    ## Thanks for watching
	    Lorem ipsum dolor sit amet, consetetur sadipscing 
	    elitr, sed diam nonumy eirmod tempor invidunt ut 
	    labore et dolore magna aliquyam erat, sed diam voluptua. 
	    [...]
	  _fieldset: bodytext
	- 
	  text: >
	    Power is of two kinds. One is obtained
	    by the fear of punishment and the other
	    by acts of love. Power based on love is
	    a thousand times more effective and
	    permanent then the one derived from fear
	    of punishment.
	  citation: Mahadma Gandhi
	  _fieldset: quote


## Template Usage

There are different ways to use the builder field inside a template. A clean approach for this is to use different snippets inside `site/snippets/sections/` that have the same file name like the field set names in the blueprint. Like mentioned above, these snippets could be the same like those used in the panel.

### /site/templates/yourtemplate.php

```php
<?php foreach($page->builder()->toStructure() as $section): ?>
  <?php snippet('sections/' . $section->_fieldset(), array('data' => $section)) ?>
<?php endforeach ?>
```
Don't forget to use `toStructure()` on the builder field that "gives you a full blown Kirby Collection which makes it possible to use Kirby's chaining syntax" ([Kirby Documentation](http://getkirby.com/docs/cheatsheet/field-methods/toStructure)).

### /site/snippets/sections/bodytext.php

``` php
<section class="bodyText">
  <?= $data->text()->kt() ?>
</section>
```

### /site/snippets/sections/imagebanner.php

``` php
<section class="imageBanner" 
<?php if ($data->picture()->isNotEmpty()): ?>
  style="background-image: url(<?= $page->image($data->picture())->url() ?>)"
<?php endif ?>
>
  <h2 class="imageBanner-headline">
    <?= $data->text() ?>
  </h2>
</section>
```

### /site/snippets/sections/quote.php

``` php
<section class="quote">
  <blockquote>
    <?= $data->text() ?>
  </blockquote>
  <div class="citation">
    <?= $data->citation() ?>
  </div>
</section>
```

## Setup

``git clone https://github.com/TimOetting/kirby-builder.git site/fields/builder``
From the root of your kirby install.

Alternatively you can download the zip file, unzip it's contents into site/fields/builder.

##Known Issues

Some issues related to the structure field of Kirby Panel do also affect the builder field.
Builder fields do not support nested structure fields or other builder fields (on the TODO).

 
