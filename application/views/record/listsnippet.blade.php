<tr class="resultRow" data-id="{{ $record->id }}">
<td>
<div itemscope id="recordContainer_{{ $record->id }}" class="recordtype_Book recordContainer">
    {{ $record->snippet()->format('html') }}
</div>
<div class="resultToolbar">
    <a title="Go to record" href="/record/{{ $record->id }}" class="btn btn-link resultRecordLink"><i class="icon-cog"></i></a>
    <button title="Comment" class="btn btn-link"><i class="icon-comment"></i></button>
    <button title="Bookmark" class="add-bookmark btn btn-link"><i class="icon-bookmark"></i></button>
</div>
</td>
<td><button title="Show preview" class="preview btn btn-link hidden-phone"><i class='icon-eye-open'></i></button></td>
</tr>
