@if ($records && $records->results->paginate(10)->results)
    <table id="recordList" class="table">
    <thead>
        <tr><th class='recordtypes'>
        @if (isset($query) && strlen($query) > 0)
            Your search for <em>{{ $query }}</em> found:
        @else
            Found:
        @endif
        @foreach ($records->facet('recordtype')->counts() as $format)
            <a class="{{ $format['selected'] ? 'selected' : '' }}" href="{{ URL::current() }}?{{ http_build_query(Input::except('recordtype')) }}&recordtype={{ $format['name'] }}"><i class="icon-leaf"></i> {{ $format['count'] }} {{ $format['name'] }}s</a>
        @endforeach
        </th></tr>
        @yield('listheading')
    </thead>
    <tbody>
    @foreach ($records->results->paginate(10)->results as $record)
        <tr class="resultRow" data-id="{{ $record->id }}">
            <td>
                <div itemscope id="recordContainer_{{ $record->id }}" class="recordtype_Book recordContainer">
                    <a class="record-view-link" href="/record/{{ $record->id }}">{{ $record->snippet()->format('html') }}</a>
                    <div class="recordPreviewArea">
                        <div class="recordRemainder"></div>
                    </div>
                </div>
                <div class="resultToolbar">
                    @if (isset($recordToolbarView) && View::exists($recordToolbarView))
                    @include ($recordToolbarView)
                    @endif
                </div>
            </td>
            <td class="recordPane">
                @if (isset($recordPaneView) && View::exists($recordPaneView))
                @include ($recordPaneView)
                @endif
            </td>
        </tr>
    @endforeach
    </tbody>
    </table>
    {{ $records->results->paginate(10)->appends(Input::except('page'))->links() }}
@else
    @section('norecords')
    @yield_section
@endif
