@layout('layouts/list')

@section('listheading')
<tr><th>Your bookmarks</th></tr>
@endsection

@section('recordPane')
@parent
<button title="Remove from bookmarks" class="bookmark-remove btn btn-link"><i class="icon-remove"></i></button>
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
