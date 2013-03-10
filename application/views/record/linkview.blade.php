<div class="recordLink accordion-group">
    <div class="accordion-heading">
        <a class="accordion-toggle" data-toggle="collapse" data-parent="#linkaccordion" href="#linkblock{{ $link->id }}">{{ $link->snippet()->format('html') }}</a>
    </div>
    <div id="linkblock{{ $link->id }}" class="accordion-body collapse">
        <div class="accordion-inner">
            @foreach ($link->sources as $linkrecord)
                @if ($record->id !== $linkrecord->id)
                <div class="well linkrecordview">
                    {{ $linkrecord->format('html') }}
                    <a href="/record/{{ $linkrecord->id }}"><i class="icon-play"></i></a>
                </div>
                @endif
            @endforeach
        </div>
    </div>
</div>
