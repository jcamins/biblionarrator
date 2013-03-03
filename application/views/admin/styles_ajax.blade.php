<div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
    <h3 id="styleEditorLabel">{{ $field->field }} ({{ $field->schema }}) field</h3>
</div>
    <div class="modal-body">
    <input type="hidden" id="schema" value="{{ $field->schema }}"></input>
    <input type="hidden" id="field" value="{{ $field->field }}"></input>
    <button id="btnAddStyle" class="btn">Add style</button>
            <table id="styleTable" data-id="{{ $field->id }}">
            <thead>
            <tr><th>Record types</th><th>Style</th><th>Example text</th><th></th></tr>
            </thead>
            <tbody>
            @foreach ($styles as $style)
            <tr id="style{{ $style->id }}">
            <td>
                <input type="text" name="styleRecordTypes" placeholder="Record types" class="styleRecordTypes input-small" value=""></input>
                @foreach ($style->recordtypes as $recordtype)
                    <span class="recordType" style="display: none;">{{ $recordtype->name }},</span>
                @endforeach
            </td>
            <td><textarea class="styleEntry">{{ $style->css }}</textarea></td>
            <td>
                <div class="exampleText">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</div>
            </td>
            <td>
                <button class="btn btn-mini delEntry"><i class="icon-remove"></i></button>
            </td>
            </tr>
            @endforeach
            </tbody>
            </table>
        </div>
    </div>
<div class="modal-footer">
    <button id="styleEditorCancel" class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
    <button id="styleEditorOK" class="btn btn-primary">Save</button>
</div>
<script type="text/javascript">
var recordTypes = { 
    @foreach (RecordType::all() as $recordtype)
        '{{ $recordtype->name }}': {{ $recordtype->id }},
    @endforeach
}; //'Book', 'Person', 'Organization', 'Stamp', 'Coin' ];
</script>
