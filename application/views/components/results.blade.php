@if ($records && $paginator->results)
    <div class="recordtypes header-shown">
    @if (isset($query) && strlen($query) > 0)
        Your search for <em>{{ $query }}</em> found:
    @else
        Found:
    @endif
    @foreach ($records->facet('recordtype')->counts() as $format)
        <a class="{{ $format['selected'] ? 'selected' : '' }}" href="{{ URL::current() }}?{{ http_build_query(Input::except('recordtype')) }}&recordtype={{ $format['name'] }}"><i class="icon-leaf"></i> {{ $format['count'] }} {{ $format['name'] }}s</a>
    @endforeach
    @if (Input::has('recordtype'))
        <a href="{{ URL::current() }}?{{ http_build_query(Input::except('recordtype')) }}"><i class="icon-leaf"></i>Show all</a>
    @endif
    </div>
    <div class="header-shown resultcount">Showing {{ $records->results->size() }} of {{ $records->size() }} records.</div>
    <table id="recordList" class="table">
    <thead>
        <tr class="header-hidden"><th>Record</th><th>Actions</th></tr>
        @yield('listheading')
    </thead>
    <tbody>
    @foreach ($paginator->results as $record)
        <tr class="resultRow" data-id="{{ $record->id }}">
            <td>
                <div itemscope id="recordContainer_{{ $record->id }}" class="recordtype_Book recordContainer">
                    <a class="record-view-link" href="/record/{{ $record->id }}">{{ $record->snippet()->format('htmlnolink') }}</a>
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
    {{ $paginator->appends(Input::except(array('page', '/' . URI::current())))->links() }}
    <div class="result-size">Show <select id="perpage" name="perpage">
        <option value="2">2</option>
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
    </select> records</div>
@else
    @section('norecords')
    @yield_section
@endif
