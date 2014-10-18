module.exports = function (files, callback) {
  var path = require('path');
  var srcpath = path.join(__dirname, 'app', 'views', 'pages') + path.sep;
  var viewall = 'view_all';

  // converts '01-my_test-pattern_1' to 'My Test-pattern 1'
  function toTitlestring(txt) {
    txt = txt.split(path.sep).pop();
    while (txt.charAt(0).match(/[\d\s\._-]/)) {
      txt = txt.substr(1);
    }
    return txt.replace(/_/g, ' ')
      .replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1);
      });
  }

  // add 'view all' to each dir, return only dir paths
  var newpaths = [];
  var paths = files.filter(function (file) {
    return file.isDirectory();
  }).map(function (dir) {
    newpaths.push(path.join(dir.path, viewall));
    return dir.path;
  });
  paths = newpaths.filter(function (val, i, self) {
    return self.indexOf(val) === i; // unique()
  }).concat(paths).sort();

  paths.forEach(function (currpath) {

    // each styleguide dir will form a page holding patterns
    var navitems = paths.map(function (navpath) {
      return {
        isActive: currpath.indexOf(navpath) !== -1,
        title: toTitlestring(navpath),
        path: navpath.split(srcpath)[1],
        children: []
      };
    });

    // assign children where child path contains parent path
    // and is exactly one level deeper
    navitems = navitems.map(function (navitem) {
      navitems.forEach(function (child) {
        if (child.path.indexOf(navitem.path) !== -1 && // only children
          child.path.replace(navitem.path, '') // only direct child
          .split(path.sep).length === 2) { // i.e. there's only one '/'
          navitem.children.push(child);
        }
      });
      return navitem;
    }).filter(function (navitem) {
      // keep only 'styleguide', all others are children
      return navitem.path.split(path.sep).length === 1;
    });

    // files in one dir will show up as patterns
    var dirfiles = files.filter(function (file) {
      if (path.basename(currpath) === viewall) {
        return !file.isDirectory() &&
          file.path.indexOf(path.resolve(currpath, '..')) !== -1 &&
          path.basename(file.path).charAt(0) !== '_';
      } else {
        var filename = file.path.replace(currpath + path.sep, '');
        return !file.isDirectory() &&
          filename.indexOf(path.sep) === -1 &&
          filename.charAt(0) !== '_'; // hide files starting with '_'
      }
    });

    // group patterns by file basename
    var sections = dirfiles.map(function (file) {
      return file.path.split(srcpath)[1].split('.')[0]; // remove ext
    }).filter(function (val, i, self) {
      return self.indexOf(val) === i; // unique()
    }).map(function (section) {
      function filterByExt(ext) {
        return dirfiles.filter(function (file) {
          return path.extname(file.path) === ext &&
            section === file.path.split(srcpath)[1].split('.')[0];
        })[0];
      }
      return {
        name: section,
        title: toTitlestring(section),
        Usage: filterByExt('.md'),
        Markup: filterByExt('.ect'),
        SCSS: filterByExt('.scss'),
        CSS: filterByExt('.css')
      };
    });

    // render styleguide template for each dir
    callback(dirfiles, navitems, sections, currpath);
  });
};
