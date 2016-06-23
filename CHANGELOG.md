# 1.1.0

- added support for snippets to preview the content of the builder entries inside the panel listing
- replaced the modal as a container for the edit form. Kirby Builder now uses inline forms, that replace the entries' preview during edit mode
- got rid of the table style as the builder fieldsets don't have to have comparable field sets. Therefore it was kind of pointless to display the content in a table
- The buttons to add an entry are no longer hidden behind a dropdown field but visible directly under the builder field

# 1.0.0

- the builder entries inside the panel now have a class that coresponds to the field set name, e.g. the entry of the fieldset `bodyText` will have the class `builder-entry-bodytext`. This class can be used in a custom panel css to give these entries specific stylings.