@layout('layouts/list')

@section('listheading')
@endsection

@section('norecords')
<div id="norecords"><em>
@if ($query)
Your search for {{ $query }} found no records
@else
Your search found no records
@endif
</em></div>
@endsection
