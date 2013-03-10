<?php

class Record extends Eloquent
{
    public static $timestamps = true;

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

    public function format($format = 'raw') {
        switch ($format) {
            case 'raw':
                break;
            
            case 'html':
                $xmlstylesheet = 'raw2html.xsl';
                break;

            default:
        }

        if (isset($xmlstylesheet)) {
            return $this->_crosswalkRecordXml($xmlstylesheet);
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
        parent::save();
        BiblioNarrator\ElasticSearch::saveRecord($this->data);
    }
}
