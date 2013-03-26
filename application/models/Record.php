<?php

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
        return $this->belongs_to('RecordType');
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
        parent::save();
        BiblioNarrator\ElasticSearch::saveRecord($this->data);
    }
}
