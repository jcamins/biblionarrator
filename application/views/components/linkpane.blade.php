<div id="linksPane" class="tab-pane">
    <div id="linkaccordion" class="accordion">
    @if ($record->sources)
        <div class="recordLink accordion-group">
            <div class="accordion-heading">
                <a class="accordion-toggle" data-toggle="collapse" data-parent="#linkaccordion" href="#linkblockmain">Mentioned in</a>
            </div>
            <div id="linkblockmain" class="accordion-body collapse in">
                <div class="accordion-inner">
                    <?php $link = $record; ?>
                    @include('components.linksourcesloop')
                </div>
            </div>
        </div>
    @endif
    @foreach ($record->targets as $link)
        @include('record.linkview')
    @endforeach
    </div>
</div>
