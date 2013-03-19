<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:mods="http://www.loc.gov/mods/v3" exclude-result-prefixes="mods">
    <xsl:output omit-xml-declaration="yes" />
    <xsl:template match="*[not(@link)]" priority="-3">
        <span>
            <xsl:attribute name="class"><xsl:value-of select="name()"/></xsl:attribute>
            <xsl:apply-templates select="./node()"/>
        </span>
    </xsl:template>
    <xsl:template match="*[@link]" priority="-3">
        <a>
            <xsl:attribute name="class"><xsl:value-of select="name()"/></xsl:attribute>
            <xsl:attribute name="href"><xsl:value-of select="concat('/record/', @link)"/></xsl:attribute>
            <xsl:apply-templates select="./node()"/>
        </a>
    </xsl:template>
    <xsl:template match="a|abbr|address|area|article|aside|audio|b|base|bdi|bdo|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|kbd|keygen|label|legend|li|link|map|mark|menu|meta|meter|nav|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|u|ul|var|video|wbr|@href|@role|@itemscope|@itemtype|@itemid|@itemprop|@itemref">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>
