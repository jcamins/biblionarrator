<form data-id="{{ $field->id }}" id="fieldform" action="/resources/field" method="POST">
<h2 id="heading">{{ $field->field }} ({{ $field->schema }})</h2>

<div class="row-fluid">
<div class="span12">
    <fieldset id="fieldGeneral">
        <legend>General</legend>
        <input id="field-id" type="hidden" name="id" value="{{ $field->id }}"></input>
        <input id="field-parent" type="hidden" name="parent" value=""></input>
        <div class="row-fluid">
            <div class="span3">
                <label for="field-schema">Schema:</label><input id="field-schema" type="text" name="schema" value="{{ $field->schema }}"></input>
            </div>
            <div class="span3">
                <label for="field-field">Field:</label><input id="field-field" type="text" name="field" value="{{ $field->field }}"></input>
            </div>
                <label for="field-link">Link:</label><input id="field-link" type="checkbox" name="link"
                @if ($field->link)
                checked="checked"
                @endif
                ></input>
        </div>
        <div class="row-fluid">
            <div class="span3">
                <label for="field-description">Description:</label><textarea id="field-description" name="description">{{ $field->description }}</textarea>
            </div>
            <div class="span3">
                <label for="field-primary">Primary field:</label><input type="checkbox" name="primary"
                @if ($field->primary)
                checked="checked"
                @endif
                id="field-primary"></input>
            </div>
        </div>
    </fieldset>
</div>
</div>
<div class="row-fluid">
<div class="span6">
    <fieldset id="fieldStyles">
    <legend>Styles</legend>
    <div id="styles_ajax">
        @if ($field)
        @include('ajax.styles')
        @endif
    </div>
    </fieldset>
</div>
<div class="span6">
    <fieldset id="fieldLinks">
    <legend>Relationships</legend>
        @if ($field)
        @include('components.linkeditor')
        @endif
    </fieldset>
</div>
</div>
</form>
