@layout('layouts/main')

@section('styles')
<style type="text/css">
.toolbar-row {
    display: none;
}
</style>
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
