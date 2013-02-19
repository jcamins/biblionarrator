@foreach (Style::all() as $style)
@if ($style->recordtypes()->get())
    @foreach ($style->recordtypes()->get() as $recordtype)
        .{{ $recordtype->name }}
    @endforeach
    .{{ $style->field()->schema }}_{{ $style->field()->field }} {
@else
.{{ $style->field()->first()->schema }}_{{ $style->field()->first()->field }} {
@endif
    {{ $style->css }}
}

@endforeach
