@layout('layouts/main')

@section('toolbar')
<h3>Administration</h3>
@endsection

@section('content')
<ul class="home-links">
    @if ( Authority::can('manage', 'Field') )
    <li><a href="/admin/field">Fields</a></li>
    @endif
    @if ( Authority::can('manage', 'User') )
    <li><a href="/admin/user">Users</a></li>
    @endif
    @if ( Authority::can('manage', 'Collection') )
    <li><a href="/admin/collection">Collections</a></li>
    @endif
    @if ( Authority::can('manage', 'RecordType') )
    <li><a href="/admin/recordtype">Record types</a></li>
    @endif
    @if ( Authority::can('manage', 'SystemSettings') )
    <li><a href="/admin/settings">Settings</a></li>
    @endif
    @if ( Authority::can('manage', 'Template') )
    <li><a href="/admin/templates">Templates</a></li>
    @endif
</ul>
@endsection
