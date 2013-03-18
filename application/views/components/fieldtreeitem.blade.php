<li data-id="{{ $node->id }}"><a href="/resources/field/{{ $node->id }}/admin"
@if (Session::has('currentfield') && Session::get('currentfield')->id === $node->id)
class="selected"
@endif
>{{ $node->field }} ({{ $node->schema }})</a>
    <ul>
        @if ($node->children()->first())
            {{ render_each('components.fieldtreeitem', $node->children()->get(), 'node') }}
        @endif
    </ul>
</li>

