function initializeTree(callbacks) {
    $('#tree').jstree({
        "defaults": {
            "strings": {
                "new_node": "New " + resourcetype
            }
        },
        "dnd" : {
            "drag_check": function(data) {
                return { after : true, before : true, inside : true }; 
            },
            "drag_finish": function(data) {
                $('#tree').jstree('create', data.r, data.p);
            }
        },
        "themes": {
            "theme": "apple"
        },
        "ui": {
            "select_limit": 1
        },
        "plugins" : [ "themes", "html_data", "crrm", "dnd" ]
    });
    for (var ev in callbacks) {
        $('#tree').bind(ev + '.jstree', callbacks[ev]);
    }
}

function loadTree(url) {
    $('#tree').load(url, function() {
        initializeTree();
    });
}
