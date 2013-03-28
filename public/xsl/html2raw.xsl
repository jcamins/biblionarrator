<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:mods="http://www.loc.gov/mods/v3">
    <xsl:template match="span[@class!='']">
        <xsl:element name="{@class}">
                <xsl:apply-templates select="@*|node()"/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="a[@class!='']">
        <xsl:element name="{@class}">
            <xsl:choose>
            <xsl:when test="starts-with(@href, '/record/')">
                <xsl:attribute name="link"><xsl:value-of select="substring-after(@href, '/record/')"/></xsl:attribute>
            </xsl:when>
            <xsl:otherwise>
                <xsl:attribute name="href"><xsl:value-of select="@href"/></xsl:attribute>
            </xsl:otherwise>
            </xsl:choose>
            <xsl:apply-templates select="@*[local-name() != 'href']|node()"/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="@href|@role|@itemscope|@itemtype|@itemid|@itemprop|@itemref|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="@*" priority="-3">
    </xsl:template>
</xsl:stylesheet>
