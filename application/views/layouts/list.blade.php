@layout('layouts/main')

@section('controlbar')
    @if (Auth::check())
        <li class="dropdown"><a href="#" id="dropdown-download-results" data-toggle="dropdown" class="dropdown-toggle">Download<b class="caret"></b></a>
        <ul class="dropdown-menu">
            <li><a target="_blank" href="{{ URL::current() }}/htmlnolink/snippet?{{ http_build_query(Input::all()) }}"id="download-citations-html">Citations (HTML)</a></li>
            <li><a target="_blank" href="{{ URL::current() }}/htmlnolink?{{ http_build_query(Input::all()) }}" id="download-full-html">Full list (HTML)</a></li>
        </ul></li>
    @endif
        <li class="dropdown"><a href="#" data-toggle="dropdown" class="dropdown-toggle">Add page<b class="caret"></b></a>
            <ul class="dropdown-menu">
                <li class="hide-on-bookmarks"><a href="{{ URL::with_querystring('search/bookmarkpage') }}">To bookmarks</a></li>
            </ul>
        </li>
        <li class="dropdown"><a href="#" data-toggle="dropdown" class="dropdown-toggle">Add results<b class="caret"></b></a>
            <ul class="dropdown-menu">
                <li class="hide-on-bookmarks"><a href="{{ URL::with_querystring('search/bookmarkall') }}">To bookmarks</a></li>
            </ul>
        </li>
@endsection

@section('toolbar')
    <div class="span8">
    @if ($records && $paginator->results)
        <div id="sortings">
        @include ('components.sortings')
        </div>
    @endif
        <hr class="breadcrumb-divider"/>
    </div>
@endsection

@section('sidebar')
@endsection

@section('content')
    <div class="span8">
        <h3>
            @section('listtitle')
            @yield_section
        </h3>
        @include('components.results')
        <div class="instructions instructions-below">
            <span class="instruction-label">Hint:</span>
            All list pages in Biblionarrator are designed to have a consistent
            interface. On the controlbar you will find the following options:
            <ul>
                <li>The &#8220;Download&#8221; button allows you to save the items
                on the list to your desktop for future reference</li>
                <li>The &#8220;Add page&#8221; button will add all the items on
                this page to your bookmarks or a saved list</li>
                <li>The &#8220;Add results&#8221; button adds all the results to
                your bookmarks or a saved list</li>
            </ul>
            You can also work with records directly from the list page:
            <ul>
                <li><i class="icon-eye-open"></i> will show you a preview of the
                record</li>
                <li><i class="icon-comment"></i> shows you the comments on a
                record and gives you the chance to add your own</li>
                @if (strpos(URL::current(), 'bookmark'))
                    <li><i class="icon-remove"></i> will remove a record from your bookmarks</li>
                @else
                    <li><i class="icon-bookmark"></i> will bookmark a record</li>
                @endif
            </ul>
        </div>
        @section('listhelp')
        @yield_section
    </div>
    <div id="previewPane" class="span4">
    </div>
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
    $('#sortings').on('change', '#add-sort', null, function() {
        if ($(this).find(':selected').val()) {
            window.location.href = addQueryStringParameter(document.URL, 'sort[]', $(this).find(':selected').val());
        }
    });
    $('#perpage').change(function () {
        window.location.href = updateQueryStringParameter(document.URL, 'perpage', $(this).find(':selected').val());
    });

    var onmobile = $(window).width() < 980;
    if (!onmobile) {
        $('.resultToolbar').fadeTo('fast', 0);
        $('.record-number-link').fadeTo('fast', 0);
    }
    $('.preview').show();
    $(window).resize(function() {
        if ($(window).width() > 980) {
            onmobile = false;
            $('.resultToolbar').css('opacity', 0);
            $('.record-number-link').css('opacity', 0);
        } else {
            onmobile = true;
            $('.resultToolbar').css('opacity', 1);
            $('.record-number-link').css('opacity', 1);
        }
    });
    $('.resultRow').hover(function() {
        if (!onmobile) {
            $(this).find('.resultToolbar').fadeTo('fast', 1);
            $(this).find('.record-number-link').fadeTo('fast', 1);
        }
    }, function() {
        if (!onmobile) {
            $(this).find('.resultToolbar').fadeTo('fast', 0);
            $(this).find('.record-number-link').fadeTo('fast', 0);
        }
    });
    $('.add-bookmark').click(function() {
        addBookmark($(this).parents('tr').attr('data-id'));
        return false;
    });
});

</script>
@endsection

