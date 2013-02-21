@foreach (Style::all() as $style)
@if ($style->recordtypes)
@foreach ($style->recordtypes as $recordtype)
.recordtype_{{ $recordtype->name }}
@endforeach
 .{{ $style->field->schema }}_{{ $style->field->field }} {
@else
.{{ $style->field->schema }}_{{ $style->field->field }} {
@endif
    {{ $style->css }}
 }

@endforeach
