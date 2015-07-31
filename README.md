# Kirby Page Builder Plugin (beta)

The Builder plugin is an extended structure field for Kirby CMS. It adopted some ideas from this [post in the official kirby forum](http://forum.getkirby.com/t/choose-from-multiple-field-groups-within-a-structure-field/1296). 

The plugin also comes with the handy placeholder variable `_fileUrl` that can be used inside your entry templates of the blueprint for image previews inside the panel.

Here is a blueprint example:

	fields:
      ...
      builder:
        label: Sections
        type: builder
        fieldsets:
          bodytext:
            label: Body Text
            fields:
              text:
                label: text
                type: textarea
          linkedImage:
            label: Linked Image
            entry: >
              <img src="{{_fileUrl}}{{image}}" height=120px/></br>
              {{url}}
            fields:
              image:
                label: Category
                type: select
                options: images
              url:
                label: Link Url
                type: text
          quote:
            label: Quote
            entry: >
              <i>"{{text}}"</i></br></br>
              {{citation}}
            fields:
              text:
                label: Quote Text
                type: textarea
              citation:
                label: Citation
                type: text

This will give us a section field like this:

![Kirby builder Screenshot](https://raw.githubusercontent.com/TimOetting/kirby-builder/master/PREVIEW.gif)

The content will be stored like this:

	----

    Builder: 

    - 
      text: >
        Lorem ipsum dolor sit amet, consectetur
        adipisicing elit. Ipsa, rerum quam
        similique numquam doloremque, quidem
        sequi placeat quibusdam aspernatur
        doloribus tempore, obcaecati eligendi
        odio eaque repellendus accusamus veniam
        blanditiis impedit.
      _fieldset: bodytext
    - 
      image: forrest.jpg
      url: www.getkirby.com
      _fieldset: linkedImage
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

##Template Usage

There are different ways to use the builder field inside a template. A clean approach for this is to use different snippets inside `site/snippets/sections/` that have the same file name like the field set names in the blueprint

### /site/templates/yourtempalte.php

```php
<?php foreach($page->builder()->toStructure() as $section): ?>
  <?php snippet( snippet('sections/' . $section->_fieldset(), array('section' => $section)) ) ?>
<?php endforeach ?>
```
Don't forget to use **toStructure()** on the builder field to "gives you a full blown Kirby Collection which makes it possible to use Kirby's chaining syntax" ([Kirby Documentation](http://getkirby.com/docs/cheatsheet/field-methods/toStructure)).

### /site/snippets/sections/bodytext.php

``` php
<p><?php echo $section->text()->kt(); ?></p>
```

### /site/snippets/sections/linkedimage.php

``` php
<a href="<?php echo $section->url(); ?>">
  <img src="<?php echo $page->image( $section->image() )->url(); ?>" alt="section image">
</a>
```

### /site/snippets/sections/quote.php

``` php
<blockquote>
  <?php echo $section->text()->kt(); ?>
</blockquote>
<p><cite><?php echo $section->citation(); ?></cite></p>
```

## Setup
The plugin comes in two pieces:
* The content of the `fields` folder has to be copied into `site/fields inside your Kirby installation
* The content of the `plugins` folder has to be copied into site/plugins inside your Kirby installation
 