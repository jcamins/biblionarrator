RECORD
======

new Record([id])
----------------

*Arguments:* [optional] (record id) id

*Return value:* (Record) record

Creates a new Record object, optionally retrieving it from the database.

    var rec = new Record(25);


record.with(callback)
---------------------

*Arguments:* (function) callback

*Return value:* (none)

This should be called after the Record constructor in order to retrieve the
actual record that is created. The callback should take two arguments, `err`,
which will receive any error thrown by the constructor, and `record`, which will
receive the populated Record object.

    var rec = new Record(25);
    rec.with(function (err, record) {
        if (err) {
            throw(err);
        } else {
            console.log(record.data);
        }
    });

record.in([filter])
-------------------

*Arguments:* [optional] (object) filter

*Return value:* (LinkList) links

Returns a LinkList object with all the inward links to the record, optionally
filtered by the criteria in `filter`.

    var rec = new Record(25);
    var linksin = rec.in({ field: 'subject' });


record.out([filter])
--------------------

*Arguments:* [optional] (object) filter

*Return value:* (LinkList) links

Returns a LinkList object with all the outward links from the record, optionally
filtered by the criteria in `filter`.

    var rec = new Record(25);
    var linksin = rec.out({ field: 'author' });


LINKLIST
========

linklist.each(callback)
-----------------------

*Arguments:* (function) callback

*Return value:* (none)

This can be called after a LinkList object has been instantiated in order to
run the specified callback on each link in the list. The callback should take
two arguments, `err` and `link`. If any errors were thrown during the
retrieval/creation, the callback will be called once with `err` populated with
that error. Otherwise, the callback will be called once per link.

    var links = rec->in();
    links.each(function (err, link) {
        if (err) {
            throw(err);
        } else {
            console.log(link.field);
        }
    });


linklist.with(callback)
--------------

*Arguments:* (function) callback

*Return value:* (none)

This can be called after a LinkList object has been instantiated in order to
run the callback on the array of Link objects contained in the LinkList.
The callback should take two arguments, `err`, which will receive any error
thrown during instantiation, and `list`, which will receive the populated array.

    var links = rec->in();
    links.all(function (err, list) {
        if (err) {
            throw(err);
        } else {
            console.log(list.length);
        }
    });


RECORD FORMAT HANDLER PLUGINS
=============================

All formathandler methods take the raw record data rather than a record object.

formathandler.render(record)
----------------------------

*Arguments:* (Record.data) record

*Return value:* (string) html

Renders raw records as HTML for display.


formathandler.snippet(record)
-----------------------------

*Arguments:* (Record.data) record

*Return value:* (Record.data) snippet

Given a raw record, generates a snippet suitable for display in search results.


formathandler.indexes(record)
-----------------------------

*Arguments:* (Record.data) record

*Return value:* (array) indexes

Given the raw record, generates an array describing the indexable fields in the
record.


formathandler.links(record)
---------------------------

*Arguments:* (Record.data) record

*Return value:* (array) links

Given the raw record, generates an array describing all the outward links from the
record.
