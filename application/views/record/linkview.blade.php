<div class="recordLink accordion-group">
    <div class="accordion-heading">
        <a class="accordion-toggle" data-toggle="collapse" data-parent="#linkaccordion" href="#linkblock{{ $link->id }}">{{ $linkhead ? $linkhead : $link->snippet()->format('html') }}</a>
    </div>
    <div id="linkblock{{ $link->id }}" class="accordion-body collapse {{ $linkhead ? 'in' : '' }}">
        <div class="accordion-inner">
            <div class="linkdescription">
                <a href="/record/{{ $link->id }}">{{ $link->remainder()->format('html') }}</a>
            </div>
            @include('components.linksourcesloop')
        </div>
    </div>
</div>
