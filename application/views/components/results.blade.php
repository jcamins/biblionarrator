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
    @foreach ($paginator->results as $key => $record)
        <tr class="resultRow" data-id="{{ $record->id }}">
            <td class="result-number">
                <a class="record-number-link" href="/record/{{ $record->id }}">{{ ($paginator->page - 1) * $paginator->per_page + $key + 1 }}</a>
            </td>
            <td class="result-content">
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
    {{ $paginator->appends(Input::except('page'))->links() }}
    <div class="result-size">Show <span data-toggle="dropdown-select" class="button-dropdown white">
        <select id="perpage" name="perpage">
        <option value="2" {{ $perpage == 2 ? 'selected="selected"' : '' }}>2</option>
        <option value="5" {{ $perpage == 5 ? 'selected="selected"' : '' }}>5</option>
        <option value="10" {{ $perpage == 10 ? 'selected="selected"' : '' }}>10</option>
        <option value="25" {{ $perpage == 25 ? 'selected="selected"' : '' }}>25</option>
        <option value="50" {{ $perpage == 50 ? 'selected="selected"' : '' }}>50</option>
        <option value="100" {{ $perpage == 100 ? 'selected="selected"' : '' }}>100</option>
        </select>
    </span> records</div>
@else
    @section('norecords')
    @yield_section
@endif
