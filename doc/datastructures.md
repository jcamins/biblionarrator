Data structures
===============

List results
------------

    results = {
        'headfacets': [
            {
            'code': 'BOOK',
            'selected': 'selected',
            'link': 'http://biblionarrator.com/search?recordtype=BOOK',
            'name': 'Book',
            'count': 18
            }
        ],
        'records': [
            {
            'id': 2,
            'ordinal': 1,
            'data': { ... }
            },
            ... { }
        ],
        'shown': 10,
        'count': 42,
        'offset': 1,
    }


Records
-------

*Version 0.3*

*Version 0.2*

Records in version 0.2 used JSON, but were structured very much like the
original XML/HTML5 data:

    {
       "article":{
          "children":[
             {
                "header":{
                   "children":[
                      {
                         "mods_author":{
                            "children":[
                               "Camins-Esakov, Jared"
                            ],
                            "link":""
                         }
                      },
                      ". ",
                      {
                         "mods_title":{
                            "children":[
                               "Biblionarrator: a glorious bibliographic future"
                            ]
                         }
                      },
                      "."
                   ]
                }
             },
             {
                "section":{
                   "children":[
                      "On ",
                      {
                         "a":{
                            "children":[
                               "this imaginary page"
                            ],
                            "href":"http://www.biblionarrator.com/glorious"
                         }
                      },
                      ", Jared lays out in technicolor how wonderful life is when using Biblionarrator."
                   ]
                }
             },
          ]
       }
    }

In pseudocode, this can be converted to the display format with the
following algorithm:

    [TODO]

*Version 0.1*

Records in version 0.1 were the native XML/HTML5:

    <article>
        <header>
            <mods_author>Camins-Esakov, Jared</mods_author>.
            <mods_title>Biblionarrator: a glorious bibliographic future</mods_title>.
        </header>
        <section>
            On <a href="http://www.biblionarrator.com/glorious">this imaginary
            page</a>, Jared lays out in technicolor how wonderful life is when
            using Biblionarrator.
        </section>
    </article>

The only difference between the storage format and the display format is that the field
names were converted to CSS classes of <a> and <span> elements.
