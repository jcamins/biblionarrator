@layout ('layouts/main')

@section('controlbar')
@endsection

@section('content')
<form action="/resources/user" method="POST">
    <h3>Editing user</h3>
    <div>Name: {{ $resource->name }}</div>
    <div>E-mail address: {{ $resource->email }}</div>
    <input type="hidden" name="id" value="{{ $resource->id }}"></input>
    <input type="hidden" name="adminredirect" value="1"></input>
    <label for="user-password">Password:</label><input id="user-password" type="password" name="password"></input>
    <div>
        <?php $matches = $resource->roles()->pivot()->lists('role_id') ?>
        @foreach (Role::all() as $role)
                <div><input type="checkbox" name="role[]" value="{{ $role->id }}"
                @if (in_array($role->id, $matches))
                    checked="checked"
                @endif
                >{{ $role->name }}</input></div>
        @endforeach
    </div>
    <button type="submit" id="user-security-ok" class="btn btn-primary">Save</button>
</form>
@endsection
