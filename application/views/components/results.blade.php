@if ($records && $records->paginate(10)->results)
    <table id="recordList" class="table">
    <thead>
        @yield('listheading')
    </thead>
    <tbody>
    @foreach ($records->paginate(10)->results as $record)
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
    {{ $records->paginate(10)->appends(Input::except('page'))->links() }}
@else
    @section('norecords')
    @yield_section
@endif
