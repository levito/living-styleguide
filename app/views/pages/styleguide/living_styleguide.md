This gulp.js project handles typical prototyping and front-end asset pipelining needs and additionally serves as a static styleguide generator.


Project Structure
-----------------

All your code lives inside the `app` directory. Most paths can be configured inside `gulpfile.js`. The default is:
* `fonts`: your custom fonts and auto-generated icon fonts
* `images`: all your images
* `scripts`: your own scripts
  - `lib`: external scripts (no jshint messages here)
* `styles`: your stylesheets (scss or css)
* `views`: html templates
  - `layouts`: shared layouts
  - `partials`: shared partials
  - `views`: single prototype pages
    + `styleguide`: styleguide patterns


Working with Styleguide Patterns
--------------------------------


### Naming Scheme

* keep all names lower-case
* prepend 2-digit numbers followed by a dash to reorder patterns (e.g. `01-foo`, optional)
* prepend an underscore to hide a file (useful for shared partials)
* other underscores will be converted to spaces in the pattern name


### Anatomy of a Pattern

A pattern can consist of:
* a markup template (`*.ect`, Embedded CoffeeScript Template, optional)
* a markdown file for documentation (`*.md`, optional)
* a stylesheet file (`*.css` or `*.scss`, optional)

All files of a pattern have the same basename. At least a markup or markdown file must exist. If you have a markup template, the stylesheet will be applied to it. A markdown file only will render a documentation sample like this.

You can nest patterns 2 levels deep by creating directories. These levels are reflected in the left side of the navigation bar above. Additionally, *View All* links will be generated for combined views.

Use the *Jump To* link on the right side of the navigation bar to scroll to single patterns. The *Layout* switch allows you to test responsive layout for common screen sizes. *Details* allows you to quickly show/hide usage notes and code samples for all patterns.

You can also switch the details on the single patterns. Clicking the pattern name on the top right of a pattern will open it stand-alone in a new tab.


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
