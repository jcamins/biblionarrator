@layout ('layouts/admin')

@section('form_modals')
@parent
<div id="user-security-dialog" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="user-roles-label" aria-hidden="true">
</div>
@endsection

@section('scripts')
@parent
<script type="text/javascript">
var controlColumn = '<button class="btn btn-mini user-security"><i class="icon-lock"></i></button>';
var collectionlist = {
@foreach (Collection::all() as $collection)
'{{ $collection->name }}': '{{ $collection->id }}',
@endforeach
};

$(document).ready(function () {
    $('.user-security').click(function () {
    });
});
</script>
@endsection

