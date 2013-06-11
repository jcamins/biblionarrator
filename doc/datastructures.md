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
            },
            ... { }
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

This can be converted to the display format with the following recursive
algorithm:

    function raw2html(object) {
        var output = '';
        if (typeof object === 'string') {
            output = object;
        } else {
            for (var elem in object) {
                var htmlelem = elem;
                if (typeof object[elem] == 'undefined') {
                    continue
                }
                if (jQuery.inArray(elem, htmlelements) < 0) {
                    if (typeof object[elem]['link'] === 'undefined' && typeof object[elem]['href'] === 'undefined') {
                        htmlelem = 'span';
                        if (object[elem]['link'] !== '') {
                            object[elem]['href'] = '/record/' + object[elem]['link'];
                        }
                    } else {
                        htmlelem = 'a';
                    }
                    output += '<' + htmlelem + ' class="' + elem + '"';
                } else {
                    output += '<' + elem;
                }
                for (var attr in object[elem]) {
                    if (jQuery.inArray(attr, attrs) >= 0 && object[elem][attr].length > 0) {
                        output += ' ' + attr + '="' + object[elem][attr] + '"';
                    }
                }
                output += '>';
                for (var child in object[elem]['children']) {
                    output += raw2html(object[elem]['children'][child]);
                }
                output += '</' + htmlelem + '>';
            }
        }
        return output;
    }

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
