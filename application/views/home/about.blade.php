@layout('layouts/main')

@section('controlbar')
    <li><a href="#license-modal" id="show-licenses" data-toggle="modal">License information</a></li>
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
        <p><a href="http://www.gnu.org/licenses/agpl-3.0.html">
            Biblionarrator is free software; you can redistribute it and/or
            modify it under the terms of the Affero GNU General Public License
            as published by the Free Software Foundation; either version 3 of
            the License, or (at your option) any later version.</a></p>
        <p>The AGPL requires that the source code for Biblionarrator be made
            available to anyone who uses it in any way. The official source code
            for Biblionarrator can be found at
            <a href="http://git.cpbibliography.com/?p=biblionarrator.git">git.cpbibliography.com</a>.
            If you want to customize your installation, please consider
            contributing your changes to the Biblionarrator project. Any questions
            can be directed to biblionarrator@cpbibliography.com.</p>
        <hr/>
        <h4>Some components of Biblionarrator are licensed under other licenses:</h4>
        <dl>
            <dt><a href="http://twitter.github.com/bootstrap/">Bootstrap</a>
                code and <a href="http://glyphicons.com">Glyphicons Free</a></dt>
                <dd>Bootstrap and Glyphicons free are licensed under the
                <a href="http://www.apache.org/licenses/LICENSE-2.0">Apache License v2.0</a>.
            </dd>
            <dt><a href="http://datatables.net/">DataTables</a></dt><dd>DataTables
                is dual licensed under the <a href="http://datatables.net/license_gpl2">GPLv2 license</a>
                and <a href="http://datatables.net/license_bsd">BSD license</a>.
            </dd>
            <dt><a href="http://www.pelagodesign.com/sidecar/emogrifier/">Emogrifier</a></dt>
                <dd>Emogrifier is licensed under the
                <a href="http://www.pelagodesign.com/sidecar/emogrifier/">MIT license</a>.
            </dd>
            <dt><a href="https://github.com/browserstate/history.js">History.js</a></dt>
                <dd>History.js is licensed under the
                <a href="https://github.com/browserstate/history.js/blob/master/license.txt">BSD license</a>.
            </dd>
            <dt><a href="https://code.google.com/p/html5shiv/">html5shiv</a></dt>
                <dd>html5shiv is dual licensed under the
                <a href="http://opensource.org/licenses/MIT">MIT license</a> and
                <a href="http://www.gnu.org/licenses/gpl-2.0.html">GPLv2 license</a>.
            </dd>
            <dt><a href="http://www.appelsiini.net/projects/jeditable">jEditable</a></dt>
                <dd>jEditable is licensed under the
                <a href="http://www.opensource.org/licenses/mit-license.php">MIT license</a>.
            </dd>
            <dt><a href="http://www.jquery.com/">jQuery</a></dt><dd>jQuery is
                licensed under the
                <a href="http://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt">MIT license</a>.
            </dd>
            <dt><a href="https://github.com/carhartl/jquery-cookie">jquery.cookie</a></dt>
                <dd>jquery.cookie is licensed under the
                <a href="https://github.com/carhartl/jquery-cookie/blob/master/MIT-LICENSE.txt">MIT license</a>.
            </dd>
            <dt><a href="http://www.jstree.com/">jsTree</a></dt>
                <dd>jsTree is licensed under the
                <a href="http://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt">MIT license</a>.
            </dd>
            <dt><a href="http://laravel.com/">Laravel</a></dt>
                <dd>Laravel is licensed under the
                <a href="http://opensource.org/licenses/mit-license.php">MIT license</a>.
            </dd>
            <dt><a href="https://code.google.com/p/rangy/">Rangy</a></dt>
                <dd>Rangy is licensed under the
                <a href="http://www.opensource.org/licenses/mit-license.php">MIT license</a>.
            </dd>
            <dt><a href="http://www.openjs.com/scripts/events/keyboard_shortcuts/">shortcut.js</a></dt>
                <dd>shortcut.js is licensed under the
                <a href="http://opensource.org/licenses/BSD-3-Clause">BSD license</a>.
            </dd>
            <dt><a href="https://github.com/max-favilli/tagmanager">Tags Manager</a></dt>
                <dd>Tags Manager is licensed under the
                <a href="https://github.com/max-favilli/tagmanager/blob/master/license.txt">Mozilla Public License Version 2.2</a>.
            </dd>
            <dt><a href="https://github.com/twitter/typeahead.js">typeahead.js</a></dt>
                <dd>typeahead.js is licensed under the
                <a href="https://github.com/twitter/typeahead.js/blob/master/LICENSE">MIT license</a>.
            </dd>
        </dl>
    </div>
    <div class="modal-footer">
        <button class="btn" data-dismiss="modal">Close</button>
    </div>
</div>
@endsection
