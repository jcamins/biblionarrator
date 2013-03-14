<div class="recordLink accordion-group">
    <div class="accordion-heading">
        <a class="accordion-toggle" data-toggle="collapse" data-parent="#linkaccordion" href="#linkblock{{ $link->id }}">{{ $link->snippet()->format('html') }}</a>
    </div>
    <div id="linkblock{{ $link->id }}" class="accordion-body collapse">
        <div class="accordion-inner">
            <div class="linkdescription">
                {{ $link->remainder()->format('html') }}
            </div>
            @foreach ($link->sources as $linkrecord)
                @if ($record->id !== $linkrecord->id)
                <div class="well well-small linkrecordview">
                    <a href="/record/{{ $linkrecord->id }}" data-title="{{ $linkrecord->snippet()->format('escaped') }}" data-content="{{ $linkrecord->remainder()->format('escaped') }}" class="record-view-link popover-link"><i class="icon-eye-open"></i></a>&nbsp;<a href="/record/{{ $linkrecord->id }}">{{ $linkrecord->snippet()->format('html') }}</a>
                </div>
                @endif
            @endforeach
        </div>
    </div>
</div>
