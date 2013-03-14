<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:mods="http://www.loc.gov/mods/v3">
    <xsl:template match="span">
        <xsl:element name="{@class}">
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="@role|@link|@itemscope|@itemtype|@itemid|@itemprop|@itemref|node()">
        <xsl:copy>
            <xsl:apply-templates select="@role|@link|@itemscope|@itemtype|@itemid|@itemprop|@itemref|node()"/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>
