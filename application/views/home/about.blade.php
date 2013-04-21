@layout('layouts/main')

@section('controlbar')
    <li><a href="/doc/licensing" data-target="#license-modal" id="show-licenses" data-toggle="modal">License information</a></li>
    <li><a href="/doc/architecture" data-target="#architecture-modal" id="show-architecture" data-toggle="modal">System architecture</a></li>
    <li><a href="/doc/history" data-target="#history-modal" id="show-history" data-toggle="modal">Version history</a></li>
@endsection

@section('toolbar')
    <h2>Biblionarrator</h2>
@endsection

@section('content')
    <div class="row-fluid">
        <div class="span6">
            <div>
                <p>Biblionarrator turns traditional assumptions about cataloging
                on their heads and makes catalogs (and cataloging) fun again.
                This catalog has been designed for bibliophile and bibliographer
                alike and offers unprecedented flexibility and power in that
                most important of all tasks, bibliographic description.</p>
                <p>
            </div>
            <div class="figure about-figure">
                <img src="/img/death_of_a_king.jpg" title="Illuminated initial"/>
                <p>Thirteenth century illuminated initial of King Henry II on
                his deathbed from the Black Book of the Exchequer. Image
                courtesy of the
                <a href="http://www.flickr.com/photos/nationalarchives/3009780609/">National Archives</a>.
                </p>
            </div>
        </div>
        <div class="span4">
            <div>
                <h4>What Biblionarrator is not:</h4>
                <dl>
                    <dt>A word processor</dt><dd>Unlike a word processor,
                    data you enter into Biblionarrator has meaning. A title
                    is a title, and the computer knows it.</dd>
                    <dt>A traditional database</dt><dd>Unlike a traditional
                    database, Biblionarrator does not make any demands on how
                    you approach your data. You can enter information in any
                    order and any format.</dd>
                    <dt>An Integrated Library System</dt><dd>Unlike a traditional
                    ILS, Biblionarrator is designed around the needs of catalog
                    users and provides a cataloging interface designed for
                    bibliographers and catalogers rather than technologists.
                </dl>
            </div>
            <div>
                <h4>What Biblionarrator is:</h4>
                <dl>
                    <dt>A powerful online catalog</dt><dd>Biblionarrator
                    provides all the search capabilities of the most advanced
                    database or Integrated Library System.</dd>
                    <dt>Designed for paper</dt><dd>Biblionarrator gives you a
                    leg up on preparing printed catalogs by providing built in
                    list export functionality.</dd>
                    <dt>Standard-compliant</dt><dd>Biblionarrator is built on
                    the HTML5 standard and &#8220;semantic web&#8221; technologies to make
                    your catalog records accessible to everyone, even Google.</dd>
                </dl>
            </div>
        </div>
    </div>
@endsection

@section('form_modals')
<div id="license-modal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="license-label" aria-hidden="true">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
        <h3 id="license-label">Biblionarrator license</h3>
    </div>
    <div class="modal-body">
    </div>
    <div class="modal-footer">
        <button class="btn" data-dismiss="modal">Close</button>
    </div>
</div>

<div id="architecture-modal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="architecture-label" aria-hidden="true">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
        <h3 id="architecture-label">Biblionarrator architecture</h3>
    </div>
    <div class="modal-body">
    </div>
    <div class="modal-footer">
        <button class="btn" data-dismiss="modal">Close</button>
    </div>
</div>
<div id="history-modal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="history-label" aria-hidden="true">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
        <h3 id="history-label">Biblionarrator version history</h3>
    </div>
    <div class="modal-body">
    </div>
    <div class="modal-footer">
        <button class="btn" data-dismiss="modal">Close</button>
    </div>
</div>
@endsection

@section('scripts')
<script type="text/javascript">
$(document).ready(function () {
    $('#documentation-modal').on('hidden', function () {
        $('#documentation-modal .modal-body').text([]);
    });
});
</script>
@endsection
