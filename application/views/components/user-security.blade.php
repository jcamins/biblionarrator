<form action="/resources/user" method="POST">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
        <h3 id="tagSelectorLabel">Select tag</h3>
    </div>
    <div class="modal-body">
        <input type="hidden" name="id" value="{{ $user->id }}"></input>
        <label for="user-password">Password:</label><input id="user-password" type="password" name="password"></input>
        <div>
            <?php $matches = $user->roles()->pivot()->lists('role_id') ?>
            @foreach (Role::all() as $role)
                    <div><input type="checkbox" name="role[]" value="{{ $role->id }}"
                    @if (in_array($role->id, $matches))
                        checked="checked"
                    @endif
                    >{{ $role->name }}</input></div>
            @endforeach
        </div>
    </div>
    <div class="modal-footer">
        <button id="user-security-cancel" class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
        <button type="submit" id="user-security-ok" class="btn btn-primary">Save</button>
    </div>
</form>
