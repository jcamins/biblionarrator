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
    @if ($records && $records->paginate(10)->results)
    <div class="span8">
    <table id="recordList" class="table">
    <thead>
        @yield('listheading')
    </thead>
    <tbody>
    @foreach ($records->paginate(10)->results as $record)
        <tr class="resultRow" data-id="{{ $record->id }}">
            <td>
                <div itemscope id="recordContainer_{{ $record->id }}" class="recordtype_Book recordContainer">
                    {{ $record->snippet()->format('html') }}
                    <div class="recordPreviewArea">
                        <div class="recordRemainder"></div>
                    </div>
                </div>
                <div class="resultToolbar">
                    <a title="Go to record" href="/record/{{ $record->id }}" class="btn btn-link resultRecordLink"><i class="icon-cog"></i></a>
                    <button title="Comment" class="btn btn-link"><i class="icon-comment"></i></button>
                    <a href="/bookmarks/add/{{ $record->id }}" title="Bookmark" class="add-bookmark btn btn-link"><i class="icon-bookmark"></i></a>
                    <button title="Hide preview" disabled="disabled" class="hide-preview btn btn-link"><i class='icon-chevron-up'></i></button>
                    @if (isset($recordToolbarView) && View::exists($recordToolbarView))
                    @include ($recordToolbarView)
                    @endif
                </div>
            </td>
            <td class="recordPane">
                <button title="Show preview" class="preview btn btn-link"><i class='icon-eye-open'></i></button>
                @if (isset($recordPaneView) && View::exists($recordPaneView))
                @include ($recordPaneView)
                @endif
            </td>
        </tr>
    @endforeach
    </tbody>
    </table>
    {{ $records->paginate(10)->appends(Input::except('page'))->links() }}
    </div>
    <div id="previewPane" class="span4">
    </div>
    @else
        @section('norecords')
        @yield_section
    @endif
@endsection

@section('form_modals')
@parent
@endsection

@section('scripts')
<script type="text/javascript">
$(document).ready(function() {
    $('.preview').click(function() {
        if (!$(this).parents('tr').find('.recordPreviewArea').is(':visible')) {
            var thisButton = this;
            $.ajax({
                type: "GET",
                url: "/record/" + $(thisButton).parents('tr').attr('data-id') + '/html',
                dataType: "html",
            }).done(function(preview) {
                var recordPreview = $(thisButton).parents('tr').find('.recordPreviewArea');
                $(recordPreview).find('.recordRemainder').html(preview);
                $(recordPreview).find('.recordRemainder').find('header').remove();
                $(thisButton).attr('title', 'Hide preview');
                $(thisButton).find('i').removeClass('icon-eye-open').addClass('icon-chevron-up');
                $(recordPreview).slideDown('fast', function() {
                    $(thisButton).parents('tr').find('.hide-preview').removeAttr('disabled');
                });
            });
        } else {
            $(this).parents('tr').find('.hide-preview').click();
        }
    });
    $('.hide-preview').click(function() {
        $(this).parents('tr').find('.hide-preview').attr('disabled', 'disabled');
        $(this).parents('tr').find('.recordPreviewArea').slideUp('fast', function() {
            $(this).parents('tr').find('.preview i').removeClass('icon-chevron-up').addClass('icon-eye-open');
        });
    });

    var onmobile = $(window).width() < 980;
    if (!onmobile) {
        $('.resultToolbar').fadeTo('fast', 0);
    }
    $('.preview').show();
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

