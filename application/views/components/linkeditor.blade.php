    <button id="saveLinks" class="btn btn-small">Save links</button>
    <div>
    <?php $matches = $field->links()->pivot()->lists('recordtype_id') ?>
    @foreach (RecordType::all() as $recordtype)
            <div><input type="checkbox"
            @if (in_array($recordtype->id, $matches))
                checked="checked"
            @endif
            >{{ $recordtype->name }}</input></div>
    @endforeach
    </div>
