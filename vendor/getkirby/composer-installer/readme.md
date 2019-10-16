# Kirby Composer Installer

[![Build Status](https://travis-ci.com/getkirby/composer-installer.svg?branch=master)](https://travis-ci.com/getkirby/composer-installer)
[![Coverage Status](https://coveralls.io/repos/github/getkirby/composer-installer/badge.svg?branch=master)](https://coveralls.io/github/getkirby/composer-installer?branch=master)

This is Kirby's custom [Composer installer](https://getcomposer.org/doc/articles/custom-installers.md) for the Kirby CMS.
It is responsible for automatically choosing the correct installation paths if you install the CMS via Composer.

It can also be used to automatically install Kirby plugins to the `site/plugins` directory.

## Installing the CMS

### Default configuration

If you `require` the `getkirby/cms` package in your own `composer.json`, there is nothing else you need to do:

```js
{
  "require": {
    "getkirby/cms": "^3.0"
  }
}
```

Kirby's Composer installer (this repo) will run automatically and will install the CMS to the `kirby` directory.

### Custom installation path

You might want to use a different installation path. The path can be configured like this in your `composer.json`:

```js
{
  "require": {
    "getkirby/cms": "^3.0"
  },
  "extra": {
    "kirby-cms-path": "kirby" // change this to your custom path
  }
}
```

### Disable the installer for the CMS

If you prefer to have the CMS installed to the `vendor` directory, you can disable the custom path entirely:

```js
{
  "require": {
    "getkirby/cms": "^3.0"
  },
  "extra": {
    "kirby-cms-path": false
  }
}
```

Please note that you will need to modify your site's `index.php` to load the `vendor/autoload.php` file instead of Kirby's `bootstrap.php`.

## Installing plugins

### Support in published plugins

Plugins need to require this installer as a Composer dependency to make use of the automatic installation to the `site/plugins` directory.

You can find out more about this in our [plugin documentation](https://getkirby.com/docs/guide/plugins/plugin-setup-basic).

### Usage for plugin users

As a user of Kirby plugins that support this installer, you only need to `require` the plugins in your site's `composer.json`:

```js
{
  "require": {
    "getkirby/cms": "^3.0",
    "superwoman/superplugin": "^1.0"
  }
}
```

The installer (this repo) will run automatically, as the plugin dev added it to the plugin's `composer.json`.

### Custom installation path

If your `site/plugins` directory is at a custom path, you can configure the installation path like this in your `composer.json`:

```js
{
  "require": {
    "getkirby/cms": "^3.0",
    "superwoman/superplugin": "^1.0"
  },
  "extra": {
    "kirby-plugin-path": "site/plugins" // change this to your custom path
  }
}
```

## License

<http://www.opensource.org/licenses/mit-license.php>

## Author

Lukas Bestle <https://getkirby.com>
