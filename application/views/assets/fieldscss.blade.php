@foreach (Style::all() as $style)
@if ($style->recordtypes)
@foreach ($style->recordtypes as $recordtype)
.recordtype_{{ $recordtype->name }}
@endforeach
 .{{ $style->field->schema }}_{{ $style->field->field }} {
@else
.{{ $style->field->schema }}_{{ $style->field->field }} {
@endif
    @if ($style->field->link)
    color: inherit;
    @endif
    {{ $style->css }}
}

@endforeach

.showtags span:before, .showtags a:before, .showtags span:after, .showtags a:after {
    font-size: smaller;
    color: #585;
    font-weight: bold;
}

@foreach (Field::all() as $field)
.showtags .{{ $field->schema }}_{{ $field->field }}:before {
    content: "<{{ $field->label }}>";
}

.showtags .{{ $field->schema }}_{{ $field->field }}:after {
    content: "</{{ $field->label }}>";
}
@endforeach
