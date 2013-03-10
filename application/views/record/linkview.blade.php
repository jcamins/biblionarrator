<div class="recordLink accordion-group">
    <div class="accordion-heading">
        <a class="accordion-toggle" data-toggle="collapse" data-parent="#linkaccordion" href="#linkblock{{ $link->id }}">{{ $link->snippet()->format('html') }}</a>
    </div>
    <div id="linkblock{{ $link->id }}" class="accordion-body collapse">
        <div class="accordion-inner">
            @foreach ($link->sources as $record)
                <div class="well linkrecordview">
                    {{ $record->format('html') }}
                    <a href="/record/{{ $record->id }}"><i class="icon-play"></i></a>
                </div>
            @endforeach
        </div>
    </div>
</div>
