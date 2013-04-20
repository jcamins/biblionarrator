    <button id="btnAddStyle" class="btn btn-small">Add style</button>
    <button type="submit" id="saveStyles" class="btn btn-small">Save styles</button>
    <table id="styleTable" data-id="{{ $field->id }}" class="table table-striped">
    <thead>
    <tr><th>Record types</th><th>Style</th><th>Example text</th><th></th></tr>
    </thead>
    <tbody>
    @foreach ($field->styles as $style)
    <tr id="style{{ $style->id }}" data-id="{{ $style->id }}">
    <td>
        <div class="style-record-type-cell">
            <input type="text" name="styleRecordTypes" placeholder="Record types" class="styleRecordTypes" value="@foreach ($style->recordtypes as $recordtype)@{{ $recordtype->name }}#@endforeach"></input>
        </div>
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
