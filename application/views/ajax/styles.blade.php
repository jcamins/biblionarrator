    <button id="btnAddStyle" class="btn btn-small">Add style</button>
    <button type="submit" id="saveStyles" class="btn btn-small">Save styles</button>
    <table id="styleTable" data-id="{{ $field->id }}">
    <thead>
    <tr><th>Record types</th><th>Style</th><th>Example text</th><th></th></tr>
    </thead>
    <tbody>
    @foreach ($field->styles as $style)
    <tr id="style{{ $style->id }}" data-id="{{ $style->id }}">
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
        <!--<button class="btn btn-mini saveStyle"><i class="icon-ok"></i></button>-->
        <button class="btn btn-mini delStyle"><i class="icon-remove"></i></button>
    </td>
    </tr>
    @endforeach
    </tbody>
    </table>
