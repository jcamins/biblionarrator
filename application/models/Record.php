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

class Record extends Eloquent
{
    public static $timestamps = true;

    public function primaries() {
        return $this->has_many('Primary', 'record_id');
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

    public function snippet() {
        $xml = new SimpleXMLElement($this->data);
        return new RecordSnippet($xml->header->asXML());
    }

    public function remainder() {
        $xml = new SimpleXMLElement($this->data);
        unset($xml->header);
        return new RecordSnippet($xml->asXML());
    }

    public function format($format = 'raw') {
        switch ($format) {
            case 'raw':
                break;
            
            case 'html':
            case 'html4':
                $xmlstylesheet = 'raw2html.xsl';
                break;

            case 'escaped':
                $xmlstylesheet = 'raw2html.xsl';
                $postprocess = function ($data) {
                    return str_replace('"', "'", htmlentities($data));
                };
                break;

            case 'htmlnolink':
                $xmlstylesheet = 'raw2html.xsl';
                $postprocess = function ($data) {
                    return preg_replace('/<(\/)?a(\W)/', '<$1span$2', $data);
                };
                break;

            default:
        }

        if (isset($xmlstylesheet)) {
            $crosswalkedData = $this->_crosswalkRecordXml($xmlstylesheet);
            if (isset($postprocess)) {
                return $postprocess($crosswalkedData);
            } else {
                return $crosswalkedData;
            }
        } else {
            return $this->data;
        }
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

    public function save() {
        if (is_null($this->recordtype_id)) {
            $this->recordtype_id = RecordType::find(1)->id;
        }
        if (is_null($this->collection_id)) {
            $this->collection_id = Auth::user()->collection_id;
        }
        parent::save();
        $xml = new SimpleXMLElement($this->data);
        $fields = Field::where_primary('1')->get();
        $this->primaries()->delete();
        foreach ($fields as $field) {
            foreach ($xml->xpath('//' . $field->schema . '_' . $field->field) as $node) {
                $primary = new Primary(array('key' => $node[0]));
                $this->primaries()->insert($primary);
            }
        }
        $fields = Field::where_link('1')->get();
        $this->targets()->delete();
        foreach ($fields as $field) {
            foreach ($xml->xpath('//' . $field->schema . '_' . $field->field) as $node) {
                if ($node->xpath('@link')) {
                    $this->targets()->attach(str_replace('/record/', '', join('', $node->xpath('@link'))));
                }
            }
        }
        BiblioNarrator\ElasticSearch::saveRecord($this->data);
    }
}
