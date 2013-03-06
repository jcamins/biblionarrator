@layout('layouts/main')

@section('toolbar')
    <button id="btnAdd" class="btn">Add</button>
@endsection

@section('content')
    <div class="row-fluid">
        <div class="span6">
            <form action="{{ $posturl }}" method="POST">
            <table id="admintable">
                <thead><tr><th>ID</th></tr></thead>
                <tbody></tbody>
            </table>
            </form>
        </div>
    </div>
@endsection


@section('scripts')
<script type="text/javascript">
$(document).ready(function() {
    initializeAdminTable();
});
</script>
@endsection
