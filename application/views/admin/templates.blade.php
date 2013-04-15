@layout('layouts/main')

@section('controlbar')
    <li><a href="/record/new" id="btnAdd">Add</a></li>
    <li class="divider-vertical"></li>
    <li><input id="admintable-filter" type="text" placeholder="Filter table"></li>
@endsection

@section('content')
    <div class="row-fluid">
        <div class="span9">
            <table id="admintable" class="table table-striped">
                <thead><tr><th>ID</th><th>Name</th><th>Owner</th><th>Collection</th><th>Record</th><th></th></tr></thead>
                <tbody>
                @foreach ($templates as $template)
                    <tr data-id="{{ $template->id }}">
                        <td>{{ $template->id }}</td>
                        <td>{{ $template->name }}</td>
                        <td>
                        @if (isset($template->owner_id))
                            {{ $template->owner()->first()->name }}
                        @endif
                        </td>
                        <td>
                        @if (isset($template->collection_id))
                            {{ $template->collection->name }}
                        @endif
                        </td>
                        <td class="recordContainer showtags">{{ $template->record()->format('html') }}</td>
                        <td><a href="/record/new/template/{{ $template->id }}" class="btn btn-mini template-edit"><i class="icon-pencil"></i></a><button class="btn btn-mini delete-object"><i class="icon-remove"></i></button></td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    </div>
@endsection

@section('scripts')
@parent
<script type="text/javascript">
$(document).ready(function () {
    var oTable = $('#admintable').dataTable( {
        "bPaginate": true,
        "sDom": '<"dataTables_controls top resultcount header-shown"i>rt<"dataTables_controls"pl>',
        "sPaginationType": "bootstrap",
        "aoColumns": [ { "sWidth": "5%" }, { "sWidth": "10%" }, { "sWidth": "10%" }, { "sWidth": "15%" }, { "sWidth": "50%" }, { "bSortable": false, "bSearchable": false, "sWidth": "5%" } ],
    } );
    $('#admintable-filter').keyup(function () {
        oTable.fnFilter($(this).val(), null, false, true);
    });
    $('#admintable').on('click', '.delete-object', null, function (e) {
        var row = this.parentNode.parentNode;
        $.ajax({
            url: '/resources/template',
            type: "DELETE",
            data: { 'id': $(row).attr('data-id') }
        }).done(function () {
            $('#admintable').dataTable().fnDeleteRow(row);
        });
        return false;
    });
});
</script>
@endsection


