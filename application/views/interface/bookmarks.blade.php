@layout('layouts/list')

@section('styles')
<style type="text/css">
.add-bookmark {
    display: none;
}
</style>
@yield_section

@section('listheading')
<tr><th>Your bookmarks</th></tr>
@endsection

@section('scripts')
@parent
<script type="text/javascript">
$(document).ready(function() {
    $('.bookmark-remove').click(function() {
        deleteBookmark($(this).parents('tr').attr('data-id'));
        $(this).parents('tr').remove();
    });
});
</script>
@endsection
