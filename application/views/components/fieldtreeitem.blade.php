<li data-id="{{ $node->id }}"><a href="/admin/field/{{ $node->id }}"
@if (Session::has('currentfield') && Session::get('currentfield')->id === $node->id)
class="selected"
@endif
>{{ $node->label }}</a>
    <ul>
        @if ($node->children()->first())
            {{ render_each('components.fieldtreeitem', $node->children()->get(), 'node') }}
        @endif
    </ul>
</li>

