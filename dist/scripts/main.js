var app, foobar;

app = function() {
  var walker;
  walker = function(sites) {
    var i, len, results, site;
    results = [];
    for (i = 0, len = sites.length; i < len; i++) {
      site = sites[i];
      results.push(console.log(site));
    }
    return results;
  };
  return chrome.topSites.get(walker);
};

app();

foobar = 'foobar';
