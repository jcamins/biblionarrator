@layout ('layouts/admin.table')

@section('scripts')
@parent
<script type="text/javascript">
var controlColumn = '<a href="#" class="btn btn-mini user-edit"><i class="icon-pencil"></i></a><button class="btn btn-mini delete-object"><i class="icon-remove"></i></button>';
var collectionlist = {
@foreach (Collection::all() as $collection)
'{{ $collection->id }}': '{{ $collection->name }}',
@endforeach
};

$(document).ready(function () {
    $('#admintable').on('draw', null, null, function () {
        $('.user-edit').click(function (e) {
            window.location = '/admin/user/edit/' + $(this).parents('tr').first().attr('data-id');
            return false;
        });
    });
});

</script>
@endsection

