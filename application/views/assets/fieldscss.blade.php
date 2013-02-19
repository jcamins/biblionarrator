@foreach (Field::all() as $field)
@if ($field->record_type)
.{{ $field->record_type }} .{{ $field->schema }}_{{ $field->field }} {
@else
.{{ $field->schema }}_{{ $field->field }} {
@endif
    {{ $field->style }}
}

@endforeach
