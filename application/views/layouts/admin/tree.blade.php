@layout('layouts/main')

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
