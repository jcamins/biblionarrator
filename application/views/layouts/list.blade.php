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
    @if ($records && $records->results)
    <div class="span8">
    <table id="recordList" class="table">
    <thead>
        @yield('listheading')
    </thead>
    <tbody>
    @foreach ($records->results as $record)
        <tr class="resultRow" data-id="{{ $record->id }}">
            <td>
                @include('record.listsnippet')
                <div class="resultToolbar">
                    <a title="Go to record" href="/record/{{ $record->id }}" class="btn btn-link resultRecordLink"><i class="icon-cog"></i></a>
                    <button title="Comment" class="btn btn-link"><i class="icon-comment"></i></button>
                    <a href="/bookmarks/add/{{ $record->id }}" title="Bookmark" class="add-bookmark btn btn-link"><i class="icon-bookmark"></i></a>
                    @if (isset($recordToolbarView) && View::exists($recordToolbarView))
                    @include ($recordToolbarView)
                    @endif
                </div>
            </td>
            <td class="recordPane">
                <button title="Show preview" class="preview btn btn-link hidden-phone"><i class='icon-eye-open'></i></button>
                @if (isset($recordPaneView) && View::exists($recordPaneView))
                @include ($recordPaneView)
                @endif
            </td>
        </tr>
    @endforeach
    </tbody>
    </table>
    {{ $records->appends(Input::except('page'))->links() }}
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

    var onmobile = $(window).width() < 980;
    if (!onmobile) {
        $('.resultToolbar').fadeTo('fast', 0);
        $('.preview').fadeTo('fast', 1);
    }
    $(window).resize(function() {
        if ($(window).width() > 980) {
            onmobile = false;
            $('.resultToolbar').css('opacity', 0);
        } else {
            onmobile = true;
            $('.resultToolbar').css('opacity', 1);
        }
    });
    $('.resultRow').hover(function() {
        if (!onmobile) {
            $(this).find('.resultToolbar').fadeTo('fast', 1);
        }
    }, function() {
        if (!onmobile) {
            $(this).find('.resultToolbar').fadeTo('fast', 0);
        }
    });
    $('.add-bookmark').click(function() {
        addBookmark($(this).parents('tr').attr('data-id'));
        return false;
    });
});

</script>
@endsection

