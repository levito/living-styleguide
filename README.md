Living Styleguide
=================

Features
--------

* front-end development environment with live-reload via BrowserSync
* create and maintain a living styleguide easily
  - compared to StyleDocco and KSS:
    + free organization structure, independent of your stylesheet file structure
    + Atomic Design is possible (nested patterns)
    + easily add documentation via Markdown files
  - compared to PatternLab:
    + no PHP dependency
    + less opinionated towards Atomic Design
    + easy documention via Markdown as opposed to PatternLab's JSON files
    + completely sandboxed patterns via iframes
* asset pipelining
  - preprocess SCSS via ruby-sass
  - concatenate and minify JS and CSS
  - optimize images
  - generate icon fonts from SVG images
* prototyping
  - ECT templating with support for partials, blocks and layouts
  - static export for easy deployment


Installation
------------

You need:
* node.js, at least version 0.10
* gulp (`npm install -g gulp`)
* ruby and sass, at least version 3.2
* git

1. Create a new project directory, open a terminal and cd to the new folder
2. run 'git clone git@github.com:levito/living-styleguide.git .'
3. run 'npm install'
4. Open your editor of choice. In gulpfile.js set basepath to '/' unless you're using github-pages
5. run 'gulp serve'
6. You can now access the styleguide in your browser. Default URL is localhost:3000/styleguide/


Gulp Tasks
----------

* `gulp` (default): clean + build
* `gulp build` builds the whole app and the styleguide to `dist`:
  - preprocesses SCSS to CSS via ruby-sass
  - concatenates and minifies CSS and JS
  - optimizes images
  - copies all assets like fonts, robots.txt, .htaccess
* `gulp clean` cleans `.tmp` and `dist` directories
* `gulp serve` starts a development server with BrowserSync for cross-device live reload
  - watches for changes in styles, scripts and views
  - on changes in `app/iconfont` the icon fonts and corresponding stylesheets will be rebuilt and reloaded
* `gulp iconfont` rebuilds the icon fonts manually


Working with the Styleguide
---------------------------

Read more in the [styleguide documentation](app/views/pages/styleguide/living_styleguide.md)
