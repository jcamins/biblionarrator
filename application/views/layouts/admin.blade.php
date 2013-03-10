@layout('layouts/main')

@section('toolbar')
    <button id="btnAdd" class="btn">Add</button>
@endsection

@section('content')
    <div class="row-fluid">
        <div class="span6">
            <form action="/resources/{{ $resourcetype }}" method="POST">
            <table id="admintable">
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
