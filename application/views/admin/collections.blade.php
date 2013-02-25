@layout('layouts/main')

@section('navigation')
@parent
<!--<li><a class="active" href="/cataloging/fields">Record fields</a></li>-->
@endsection

@section('toolbar')
@endsection

@section('content')
    <div class="row-fluid">
        <div class="span6">
            <form id="newCollection" action="/admin/collections" method="post" accept-charset="UTF-8">
            <table id="collections">
                <thead><tr><th>ID</th><th>Name</th><th>Security</th><th></th></tr></thead>
                <tbody>
                @foreach (Collection::all() as $collection)
                <tr><td>{{ $collection->id }}</td>
                    <td>{{ $collection->name }}</td>
                    <td>{{ $collection->security }}</td>
                    <td><button class="btn btn-mini editCollection"><i class="icon-pencil"></i></button><button class="btn btn-mini delCollection"><i class="icon-remove"></i></button></td></tr>
                @endforeach
                </tbody>
                <tfoot>
                <tr>
                    <td>New</td>
                    <td><input name="name" type="text"></input></td>
                    <td><select name="security">
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                        <option value="Open">Open</option>
                    </select></td>
                    <td><button id="saveCollection" class="btn btn-mini" type="submit"><i class="icon-ok"></i></button><button class="btn btn-mini clearCollection"><i class="icon-remove"></i></button></td>
                    </tr>
                </tfoot>
            </table>
            </form>
        </div>
    </div>
@endsection

@section('form_modals')
<div id="collectionEditor" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="collectionEditorLabel" aria-hidden="true">
</div>
@endsection

@section('scripts')
<script type="text/javascript">
$(document).ready(function() {
    var oTable = $('#collections').dataTable( {
        "bPaginate": true,
        "sPaginationType": "full_numbers",
        "aoColumns": [
                        { "bSortable": false, "sWidth": "10%" },
                        { "sWidth": "50%" },
                        { "sWidth": "20%" },
                        { "bSortable": false, "sWidth": "10%" },
                     ],
    } );
});

</script>
@endsection

