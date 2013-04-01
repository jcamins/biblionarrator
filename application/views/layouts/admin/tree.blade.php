@layout('layouts/main')

@section('headbar')
@endsection

@section('sidebar')
    <div id="tree">
        @section('treedata')
        @yield_section
    </div>
@endsection

@section('content')
    @section('editor')
    @yield_section
@endsection

@section('footbar')
@endsection

