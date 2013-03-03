@layout('layouts/main')

@section('navigation')
@parent
@endsection

@section('sidetoolbar')
@endsection

@section('toolbar')
@endsection

@section('sidebar')
@endsection

@section('content')
    @if ($results)
    <div class="span8">
    <table id="searchResults" class="table">
    <thead>
        <tr><th>Results for your search for: {{ $query }}</th></tr.
    </thead>
    <tbody>
    @foreach ($results as $record)
        @include('record.result')
    @endforeach
    </tbody>
    </table>
    </div>
    <div id="previewPane" class="span4">
        <div id="previewAffix" class="well">
            <div id="recordPreview">
            </div>
            <a id="previewRecordLink" class="btn btn-link">Go to record</a>
        </div>
    </div>
    @else
    @endif
@endsection

@section('form_modals')
@parent
@endsection

@section('scripts')
<script type="text/javascript">
var affixTop;
var affixHeight;
var targetTop;

function positionAffix() {
    affixHeight = $('#previewAffix').height();
    if (targetTop + affixHeight > $(window).height() - 60) {
        affixTop = $(window).height() - affixHeight - 60;
    } else {
        affixTop = targetTop;
    }
}

$(document).ready(function() {
    $('.preview').click(function() {
        if ($(this).attr('title') === 'Show preview') {
            $('.preview').attr('title', 'Show preview');
            $('.preview .icon-chevron-left').removeClass('icon-chevron-left').addClass('icon-eye-open');
            var thisButton = this;
            $.ajax({
                type: "GET",
                url: "/record/" + $(thisButton).parents('tr').attr('data-id') + '/preview',
                dataType: "html",
            }).done(function(preview) {
                $(thisButton).find('.icon-eye-open').removeClass('icon-eye-open').addClass('icon-chevron-left');
                $(thisButton).attr('title', 'Hide preview');
                $('#previewAffix').html(preview);
                targetTop = $(thisButton).position().top;
                positionAffix();
                $('#previewAffix').css('top', affixTop);
                $('#previewAffix').show();
            });
        } else {
            $('.icon-chevron-left').removeClass('icon-chevron-left').addClass('icon-eye-open');
            $('.preview').attr('title', 'Show preview');
            $('#previewAffix').hide();
        }
    });

    $(window).scroll(function() {
        var windowTop = $(window).scrollTop();
        positionAffix();
        if (affixTop < windowTop + 60) {
            $('#previewAffix').css({ position: 'fixed', top: 60 });
        } else {
            $('#previewAffix').css({ position: 'absolute', top: affixTop });
        }
    });

    $('.resultToolbar').fadeTo('fast', 0);
    $('.resultRow').hover(function() {
        $(this).find('.resultToolbar').fadeTo('fast', 1);
    }, function() {
        $(this).find('.resultToolbar').fadeTo('fast', 0);
    });
});

</script>
@endsection

