<?php
/* Copyright (c) 2013 C & P Bibliography Services
 *
 * This file is part of Biblionarrator.
 *
 * Biblionarrator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

function array_search_recursive($needle,$haystack) {
    foreach($haystack as $key=>$value) {
        if ($key === $needle) {
            return array($key => $value);
        } else if (is_array($value)) {
            $res = array_search_recursive($needle, $value);
            if ($res !== false) {
                return $res;
            }
        }
    }
    return false;
}

function array_remove_recursive($needle,&$haystack) {
    foreach($haystack as $key=>$value) {
        if ($key === $needle) {
            unset($haystack[$key]);
        } else if (is_array($value)) {
            $haystack[$key] = array_remove_recursive($needle, $value);
        }
    }
    return $haystack;
}



class Record extends Eloquent
{
    public static $timestamps = true;

    protected $htmlelements = array('a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'command', 'datalist', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'map', 'mark', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr');
    protected $allowedattrs = array('role', 'itemscope', 'itemtype', 'itemid', 'itemprop', 'itemref', 'href');

    public static function structured_list() {
        $query = Record::where('deleted', '=', 0);
        if (Config::get('biblionarrator.private')) {
            if (Auth::check()) {
                $query->where('collection_id', '=', Auth::user()->collection_id);
            } else {
                $query->where('collection_id', '=', '-1');
            }
        }
        $records = array();
        foreach ($query->get() as $record) {
            array_push($records, $record->to_array());
        }
        return $records;
    }

    public function primaries() {
        return $this->has_many('Primary', 'record_id');
    }

    public function images() {
        return $this->has_many('Image', 'record_id');
    }

    public function sources() {
        return $this->has_many_and_belongs_to('Record', 'record_links', 'target_id', 'source_id');
    }

    public function targets() {
        return $this->has_many_and_belongs_to('Record', 'record_links', 'source_id', 'target_id');
    }

    public function record_type() {
        return $this->belongs_to('RecordType', 'recordtype_id');
    }

    public function collection() {
        return $this->belongs_to('Collection', 'collection_id');
    }

    public function obj() {
        return json_decode($this->data, true);
    }

    public function snippet() {
        $obj = array_search_recursive('header', $this->obj());
        return new RecordSnippet(json_encode($obj));
    }

    public function remainder() {
        $obj = $this->obj();
        return new RecordSnippet(json_encode(array_remove_recursive('header', $obj)));
    }

    public function format($format = 'raw') {
        if ($format === 'json' || $format === 'raw') {
            return $this->data;
        } else {
            return $this->traverseRaw($this->obj(), $format);
        }
    }

    protected function _raw2html() {
    }

    protected function traverseRaw($object = null, $format = 'html') {
        $output = '';
        $html = (strpos($format, 'html') !== false);
        if (is_string($object)) {
            $output = $object;
        } else if (!is_null($object)) {
            foreach ($object as $elem => $obj) {
                $htmlelem = $elem;
                if ($html && !in_array($elem, $this->htmlelements)) {
                    if (isset($obj['link']) && strpos($format, 'nolink') === false) {
                        $htmlelem = 'a';
                    } else {
                        $htmlelem = 'span';
                    }
                    $output .= '<' . $htmlelem . ' class="' . $elem . '"';
                    if (isset($obj['link']) && strlen($obj['link']) > 0 && strpos($format, 'nolink') === false) {
                        $output .= ' href="/record/' . $obj['link'] . '"';
                    }
                } else {
                    $output .= '<' . $elem;
                }
                foreach ($obj as $attr => $val) {
                    if ($html && in_array($attr, $this->allowedattrs) && isset($val)) {
                        $output .= ' ' . $attr . '="' . $val . '"';
                    }
                }
                $output .= '>';
                if (isset($obj['children'])) {
                    foreach ($obj['children'] as $child) {
                        $output .= $this->traverseRaw($child, $format);
                    }
                }
                $output .= '</' . $htmlelem . '>';
            }
        }
        return $output;
    }

    public function _crosswalkRecordXml ($stylesheet) {
        if (is_null($this->data)) {
            return '';
        }
        $xp = new XsltProcessor();
        $xsl = new DomDocument;
        $xsl->load('public/xsl/' . $stylesheet);
        $xp->importStylesheet($xsl);
        $xml = new DomDocument;
        $xml->loadXML($this->data);
        return $xp->transformToXML($xml);
    }

    protected function findLinks($object = null) {
        if (!is_null($object) && is_array($object)) {
            foreach ($object as $elem => $obj) {
                if (isset($obj['link'])) {
                    $field = Field::by_label($elem);
                    $source = Record::find($obj['link']);
                    if (isset($field) && $field->link && isset($source)) {
                        $this->targets()->attach($obj['link']);
                    }
                }
                if (isset($obj['children'])) {
                    foreach ($obj['children'] as $child) {
                        $this->findLinks($child);
                    }
                }
            }
        }
    }

    public function save() {
        if (is_null($this->recordtype_id)) {
            $this->recordtype_id = RecordType::first()->id;
        }
        if (is_null($this->collection_id)) {
            $this->collection_id = Auth::user()->collection_id;
        }
        parent::save();
        /*$xml = new SimpleXMLElement($this->data);
        $fields = Field::where_primary('1')->get();
        $this->primaries()->delete();
        foreach ($fields as $field) {
            foreach ($xml->xpath('//' . $field->schema . '_' . $field->field) as $node) {
                $primary = new Primary(array('key' => $node[0]));
                $this->primaries()->insert($primary);
            }
        }
        $fields = Field::where_link('1')->get();*/
        $this->targets()->delete();
        $this->findLinks($this->obj());
        BiblioNarrator\ElasticSearch::saveRecord($this->data);
    }
}
