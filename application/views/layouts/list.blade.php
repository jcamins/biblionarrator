@layout('layouts/main')

@section('navigation')
@parent
@endsection

@section('sidetoolbar')
    @if (Auth::check())
        <div class="btn-group dropdown">
            <button id="download-results" type="button" data-toggle="modal" data-target="#download-modal" class="btn btn-small">Download</button>
            <button id="dropdown-download-results" type="button" data-toggle="dropdown" class="btn btn-small dropdown-toggle"><b class="caret"></b></button>
            <ul class="dropdown-menu">
                <li><a target="_blank" href="{{ URL::current() }}/export/htmlnolink/snippet?{{ http_build_query(Input::all()) }}"id="download-citations-html">Citations (HTML)</a></li>
                <li><a target="_blank" href="{{ URL::current() }}/export/htmlnolink?{{ http_build_query(Input::all()) }}" id="download-full-html">Full list (HTML)</a></li>
            </ul>
        </div>
    @endif
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

