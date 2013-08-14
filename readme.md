Biblionarrator - a new type of cataloging system
================================================

About
-----

Biblionarrator turns traditional assumptions about cataloging on their
heads and makes catalogs (and cataloging) fun again. This catalog has
been designed for bibliophile and bibliographer alike and offers
unprecedented flexibility and power in that most important of all tasks,
bibliographic description.


Installation
------------

Biblionarrator is built on node.js, Titan, and -- currently -- MySQL.
The current installation instructions are out of date, but there are
one or two important gotchas in setting up Biblionarrator. In particular,
The version of gremlin-node that will be automatically installed by
`npm install` does not work with Biblionarrator. You will need to download
the version at https://github.com/jcamins/gremlin-node into
node_modules/gremlin and run `npm install` in that directory prior to
running `npm install` for Biblionarrator.

See doc/install.md for detailed instructions (once it has been updated).


License
-------

Biblionarrator is free software; you can redistribute it and/or modify
it under the terms of the Affero GNU General Public License as published
by the Free Software Foundation; either version 3 of the License, or (at
your option) any later version.

Detailed license information can be found in doc/licensing.html
