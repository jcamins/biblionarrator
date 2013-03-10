<li data-id="{{ $node->id }}"><a href="/admin/fields/{{ $node->id }}">{{ $node->field }} ({{ $node->schema }})</a>
    <ul>
        @if ($node->children()->first())
            {{ render_each('components.fieldtree', $node->children()->get(), 'node') }}
        @endif
    </ul>
</li>
