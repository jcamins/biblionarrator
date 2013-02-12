@layout('layouts/main')

@section('navigation')
@parent
<li><a class="active" href="/cataloging/editor">Record editor</a></li>
@endsection

@section('content')
<div class="hero-unit">
    <div class="row">
        <div class="span6">
            <h1>Record editor</h1>
            <p>This is the greatest record editor ever!</p>
            
            <form class="well" method="POST" action="record">
            <textarea class="record_editor" name="whatever" cols="50" rows="15"></textarea>
            </form>
            <button id="save" type="button" class="btn btn-primary">Save</button>
        </div>
    </div>
    
    
</div>

<!-- Example row of columns -->
<div class="row">
    <div class="span3">
        &nbsp;
    </div>
</div>
@endsection

@section('scripts')
<script type="text/javascript">
tinyMCE.init({
    mode : "specific_textareas",
    editor_selector : "record_editor",
    custom_elements : "-bib:title,-bib:author",
    extended_valid_elements : "bib:title,bib:author"
});
</script>
<script type="text/javascript">
$(document).ready(function() {
    $('#save').click(function() {
        saveData();
    });
});

$(window).load(function() {
    loadData();
});

function loadData() {
    var ed = tinyMCE.get('whatever');

    // Do you ajax call here, window.setTimeout fakes ajax call
    ed.setProgressState(1); // Show progress
    $.ajax({
        type: "GET",
        url: "/svc/record",
        data: { id: "1" }
    }).done(function(msg) {
        var obj = jQuery.parseJSON(msg);
        ed.setProgressState(0); // Hide progress
        ed.setContent(obj.data);
    });
}
function saveData() {
    var ed = tinyMCE.get('whatever');

    // Do you ajax call here, window.setTimeout fakes ajax call
    ed.setProgressState(1); // Show progress
    $.ajax({
        type: "POST",
        url: "/svc/record",
        data: { id: "1", data: ed.getContent() }
    }).done(function(msg) {
        ed.setProgressState(0); // Hide progress
    });
}
</script>
@endsection
