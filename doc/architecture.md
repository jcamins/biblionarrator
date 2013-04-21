General overview
================


Design Principles
=================

Biblionarrator has been designed from the beginning to be as simple as
possible, and do only one thing, but do it well. To that end, Biblionarrator
was designed around the concept that there are only two first-order entities:
records, and records and record collections. Besides these, there are a handful
of second-order entities necessary for the business of handling records and
record collections.

Code in Biblionarrator follows -- or at least should follow -- a
model-view-controller pattern. To the extent that it can be generalized,
business logic should be placed in the model layer rather than the controller or
view.


API
===

There are three classes of object that can be accessed in Biblionarrator:

Record objects
-------------

The record viewer/editor interface is accessed at [GET] /record/{ID}, and various
formats can be accessed by setting the format={FORMAT} parameter

Other than the default view being the interface, and having a path of /record/,
Record objects behave the same as Administrative objects.

Administrative objects
---------------------

Administrative objects include:

* Collection
* Field
* RecordType
* Style
* SystemSettings - *NOTE*: not yet normalized to use this API
* Template
* User
* UserSettings - *NOTE*: not yet normalized to use this API


Administrative objects are accessed at /resources/{OBJECT}, and have
the following methods:

* [GET] /resources/{OBJECT} (JSON request) - retrieve a JSON listing (suitable
  for direct ingestion by DataTable) of all objects of that type.
* [GET] /resources/{OBJECT} (regular request) - show the administration interface
  for the object type.
* [GET] /resources/{OBJECT}/{ID} (JSON request) - retrieve the object in JSON
  format
* [GET] /resources/{OBJECT}/{ID} (regular request) - show the administrative edit
  interface for the specified object.
* [POST] /resources/{OBJECT}/{ID} - save the specified object, or create a new
  object if {ID} is not set.
* [DELETE] /resources/{OBJECT}/{ID} - delete the specified object.

RecordList objects
-----------------

RecordList objects include:

* Search
* Bookmarks

RecordList objects are accessed at /{OBJECT}/, and have the following methods:

* [GET] /{OBJECT}?format={FORMAT} - retrieves the list in the specified format.
  If {FORMAT} is blank or set to "interface", retrieve the interface.
* [GET] /{OBJECT}/snippets?format={FORMAT} - retrieves the list of record
  snippets in the specified format.
