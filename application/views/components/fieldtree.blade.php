<ul>
    {{ render_each('components.fieldtreeitem', Field::roots()->get(), 'node') }}
</ul>
