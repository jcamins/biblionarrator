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
