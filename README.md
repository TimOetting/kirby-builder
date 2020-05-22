# Kirby Builder

This versatile plugin for [Kirby CMS](https://a.paddle.com/v2/click/1129/38717?link=1170) (>= v3.0.1) lets you predefine content blocks with different field sets that can then be added, edited and arranged inside Kirby's panel.

The legacy version for Kirby 2 can be found under [this branch](https://github.com/TimOetting/kirby-builder/tree/kirby_v2).

## Commercial Use

Kirby Builder can be used in so many different extents. You know best how big the value is that you get out of this plugin. Please pay what (and if) you want.

[PayPal.me Link](https://www.paypal.me/TimOetting/10)

Another way to support this plugin is to buy a Kirby Licence via this affiliate link with no extra costs for you. You need that licence anyway, right? :wink:

[Buy a Kirby licence](https://a.paddle.com/v2/click/1129/38717?link=1170)

## Preview

![Kirby Builder Screenshot](https://raw.githubusercontent.com/TimOetting/kirby-builder/master/PREVIEW.png)

## Installation

### Git

From the root of your kirby project:

```
git clone https://github.com/TimOetting/kirby-builder.git site/plugins/kirby-builder
```

### Composer

```
composer require timoetting/kirby-builder
```

### Direct Download

Alternatively you can download the zip file, unzip it's contents into site/plugins/kirby-builder.

## Example Blueprint Structure

```yaml
# inside the fields section of your blueprint:
mybuilder:
  label: Page Builder
  type: builder
  columns: 1 # Optional. If set to 2 or more, the builder blocks will be placed in a grid.
  max: 10 # Optional. Limits the number of builder blocks that can be added.
  fieldsets:
    quote: # This is a field set. It contains a group of kirby fields. The user can select from these sets to build the content.
      name: Quote # The name option is used as a label for the buttons to add new fieldsets. It is also used as a label in the header of the fieldset, if the label option is not set explicitly (see next line).
      label: Quote by {{citation}} # Optional. The label option can be used to override the header text of the fieldset. The 'mustache' syntax can be used to include the value of any field of the fieldset.
      preview: # Optional. If defined, a preview of the fieldset can be rendered by the specified snippet from within the snippets folder.
        snippet: blocks/quote
        css: /assets/css/blocks/quote.css
      defaultView: preview # Optional. If the value "preview" is set, the block will show the preview when the page is loaded in the panel. If the value is a tab name, the respective tab is preselected when the page is loaded. Newly created blocks ignore this value and have the edit mode or the first tab preselected.
      fields:
        text:
          label: Quote Text
          type: textarea
        citation:
          label: Citation
          type: text
    bodytext:
      name: Text
      tabs: # Optional. Tabs can be used to group the fields of a field set. In this example, we use one tab to contain the content related fields and one for styling settings. It makes no difference for the content handling in the template if there are tabs or not.
        content:
          label: Content
          icon: edit # Optional. This icon appears next to the tab. The icon name can be chosen from the Kirby's icon set getkirby.com/docs/reference/ui/icon
          fields:
            text:
              label: text
              type: textarea
        style:
          label: Style
          icon: cog
          fields:
            fontfamily:
              label: Font
              type: select
              options:
                helvetica: Helvetica
                comicsans: Comic Sans
            fontsize:
              label: Font Size
              type: number
    events:
      name: Events
      preview:
        snippet: blocks/events
        css: /assets/css/blocks/events.css
      fields:
        eventlist: # The Builder Field can even be nested!
          type: builder
          label: Event List
          columns: 2
          fieldsets:
            event:
              label: Event
              fields:
                title:
                  label: Title
                  type: text
                text:
                  label: Description
                  type: textarea
                date:
                  label: Date
                  type: date
    calltoaction: blocks/calltoaction # the Builder Field blueprint can be rather complex. It is therefore recommended to organize your fieldsets in single files. This example would take the content of the file /site/blueprints/blocks/calltoaction.yml and use it for the fieldset "calltoaction".
```

## Template Usage

There are different ways to use the builder field inside a template. A clean approach for this is to use different snippets inside `site/snippets/blocks/` that have the same file name like the field set names in the blueprint. In this case, we use the same snippet that we used for the preview inside the panel.

```php
<?php # /site/templates/yourtemplate.php
foreach($page->mybuilder()->toBuilderBlocks() as $block):
  snippet('blocks/' . $block->_key(), array('data' => $block));
endforeach;
?>
```

The `toBuilderBlocks` method converts the builder field to a Kirby Collection which makes it possible to use Kirby's chaining syntax. Under the hood it is an alias for the `toStructure` method.

The quote snippet, for example, could then be rendered by this snippet:

```php
<php # /site/snippets/blocks/quote.php ?>
<section class="quote">
  <blockquote>
    <?= $data->text() ?>
  </blockquote>
  <div class="citation">
    <?= $data->citation() ?>
  </div>
</section>
```

### Licence

[MIT](https://opensource.org/licenses/MIT)
