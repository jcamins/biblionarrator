@layout('layouts/admin')

@section('scripts')
@parent
<script type="text/javascript">
var columns = {{ $columns }};
var sourceurl = '{{ $sourceurl }}';
var posturl = '{{ $posturl }}';
var controlColumn = '';
</script>
@endsection

