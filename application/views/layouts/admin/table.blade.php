@layout('layouts/main')

@section('controlbar')
    <li><a href="#" id="btnAdd">Add</a></li>
    <li class="divider-vertical"></li>
    <li><input id="admintable-filter" type="text" placeholder="Filter table"></li>
@endsection

@section('content')
    <div class="row-fluid">
        <div class="span9">
            <form class="new-form" action="/resources/{{ $resourcetype }}" method="POST">
            <table id="admintable" class="table table-striped">
                <thead><tr><th>ID</th></tr></thead>
                <tbody></tbody>
            </table>
            </form>
        </div>
        <div id="object-editor">
            @section('editor')
            @yield_section
        </div>
    </div>
@endsection


@section('scripts')
<script type="text/javascript">
var columns = {{ $columns }};
var resourcetype = '{{ $resourcetype }}';
$(document).ready(function() {
    initializeAdminTable();
});
</script>
@endsection
