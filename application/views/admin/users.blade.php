@layout ('layouts/admin.table')

@section('form_modals')
@parent
<div id="user-security-dialog" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="user-roles-label" aria-hidden="true">
</div>
@endsection

@section('scripts')
@parent
<script type="text/javascript">
var controlColumn = '<button class="btn btn-mini user-security"><i class="icon-lock"></i></button><button class="btn btn-mini delete-object"><i class="icon-remove"></i></button>';
var collectionlist = {
@foreach (Collection::all() as $collection)
'{{ $collection->name }}': '{{ $collection->id }}',
@endforeach
};

$(document).ready(function () {
    $('#admintable').on('draw', null, null, function () {
        $('.user-security').click(function (e) {
            $('#user-security-dialog').load('/resources/user/security/' + $(this).parents('tr').first().attr('data-id'));
            $('#user-security-dialog').modal('show');
            e.preventDefault();
            return false;
        });
    });
});
</script>
@endsection

