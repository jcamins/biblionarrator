@layout('layouts/list')

@section('styles')
<style type="text/css">
.add-bookmark {
    display: none;
}

.hide-on-bookmarks {
    display: none;
}
</style>
@endsection

@section('controlbar')
@parent
    @if ($records && $paginator->results)
        <li><a href="/bookmarks/clear">Clear bookmarks</a></li>
    @endif
@endsection

@section('listtitle')
Your bookmarks
@endsection

@section('norecords')
<em>You do not have any bookmarks</em>
@endsection

@section('scripts')
@parent
<script type="text/javascript">
$(document).ready(function() {
    $('.bookmark-remove').click(function() {
        deleteBookmark($(this).parents('tr').attr('data-id'));
        $(this).parents('tr').remove();
        return false;
    });
});
</script>
@endsection
