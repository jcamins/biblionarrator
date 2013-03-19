@layout('layouts/list')

@section('listheading')
<tr><th>Found {{ $records->size() }} results for your search for: {{ $query }}</th></tr>
@endsection

@section('norecords')
<div id="norecords"><em>Your search for {{ $query }} found no records</em></div>
@endsection
