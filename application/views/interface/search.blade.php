@layout('layouts/list')

@section('listheading')
@endsection

@section('norecords')
<div id="norecords"><em>
@if (Session::has('query') && strlen(Session::get('query')) > 0)
Your search for {{ Session::get('query') }} found no records
@else
Your search found no records
@endif
</em></div>
@endsection
