@layout('layouts/main')

@section('navigation')
@parent
<!--<li><a class="active" href="/cataloging/fields">Record fields</a></li>-->
@endsection

@section('toolbar')
    <button id="btnAdd" class="btn">Add</button>
@endsection

@section('content')
    <div class="row-fluid">
        <div class="span6">
            <table id="admintable">
                <thead><tr><th>ID</th></tr></thead>
                <tbody></tbody>
            </table>
        </div>
    </div>
@endsection

@section('form_modals')
<div id="styleEditor" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="styleEditorLabel" aria-hidden="true">
</div>
@endsection

@section('scripts')
<script type="text/javascript">
var columns = {{ $columns }};

var posturl = '{{ $posturl }}';

$(document).ready(function() {
    initializeAdminTable();
    $('#admintable').on('click', '.editStyle', null, function() {
        $('#styleEditor').empty();
        loadStyle($(this).attr('id').replace('editStyle', ''));
    });
});
</script>
@endsection
