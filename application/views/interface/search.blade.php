@layout('layouts/list')

@section('listheading')
@endsection

@section('norecords')
<div id="norecords"><em>Your search for {{ $query }} found no records</em></div>
@endsection
