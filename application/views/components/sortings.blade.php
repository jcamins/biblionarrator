<span class="sort-label">Sort</span> &gt;
@foreach ($records->sorts as $sort)
<span class="sort-facet">{{ $sort }} <sub><a title="Remove {{ $sort }} sort" class="remove-sort" href="{{ str_replace('sort%5B%5D='.$sort, '', URI::full()) }}">x</a></span> &gt;
@endforeach
<select id="add-sort">
    <option>-- add sort --</option>
@foreach (Field::where_sortable(1)->get() as $field)
    @if (!in_array($field->schema . '_' . $field->field, $records->sorts))
        <option value="{{ $field->schema }}_{{ $field->field }}">{{ $field->label }}</option>
    @endif
@endforeach
</select>
