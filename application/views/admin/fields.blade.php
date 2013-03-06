@layout('layouts/admin')

@section('form_modals')
<div id="styleEditor" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="styleEditorLabel" aria-hidden="true">
</div>
@endsection

@section('scripts')
@parent
<script type="text/javascript">
var controlColumn = '<button class="btn btn-mini editStyle"><i class="icon-pencil"></i></button>';

$(document).ready(function() {
    $('#admintable').on('click', '.editStyle', null, function() {
        $('#styleEditor').empty();
        loadStyle($(this).parents('tr').attr('data-id'));
        return false;
    });
});
</script>
@endsection
