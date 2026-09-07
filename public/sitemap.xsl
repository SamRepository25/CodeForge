<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" omit-xml-declaration="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Sitemap — CodeForge</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; font-family: Inter, Arial, sans-serif; color: #182044; background: #f6f7fb; }
          .hero { margin: 18px; min-height: 345px; border-radius: 18px; background: linear-gradient(115deg, #5d35a8 0%, #7650bd 48%, #9b94dc 100%); position: relative; overflow: hidden; }
          .hero:after { content: ''; position: absolute; width: 430px; height: 430px; border-radius: 50%; right: -120px; top: -190px; background: rgba(255,255,255,.08); }
          .nav { height: 78px; display: flex; align-items: center; justify-content: space-between; padding: 0 38px; position: relative; z-index: 2; }
          .brand { color: white; font-size: 27px; font-weight: 800; letter-spacing: -.7px; }
          .tag { color: rgba(255,255,255,.78); font-size: 11px; letter-spacing: 3px; margin-top: 2px; }
          .navlinks { display: flex; gap: 34px; padding: 13px 30px; border-radius: 30px; background: rgba(255,255,255,.2); color: white; font-size: 15px; }
          .navlinks a { color: white; text-decoration: none; }
          .title { position: absolute; left: 8%; bottom: 54px; color: white; font-size: clamp(58px, 8vw, 94px); font-weight: 300; letter-spacing: -4px; }
          main { background: white; padding: 72px 7.5% 90px; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 70px 70px; max-width: 1250px; margin: 0 auto; }
          section { min-width: 0; }
          h2 { font-size: 26px; margin: 0 0 23px; font-weight: 700; display: inline-block; border-bottom: 1px solid #53608c; padding-bottom: 5px; }
          ul { margin: 0; padding-left: 22px; }
          li { margin: 0 0 16px; padding-left: 2px; font-size: 17px; }
          a { color: #4c5d93; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px; }
          a:hover { color: #6b45b6; }
          .count { max-width: 1250px; margin: 0 auto 46px; color: #6f7894; font-size: 15px; }
          @media (max-width: 850px) { .navlinks { display: none; } .hero { min-height: 280px; } .title { left: 8%; bottom: 42px; } .grid { grid-template-columns: 1fr; gap: 45px; } main { padding: 50px 8%; } }
        </style>
      </head>
      <body>
        <div class="hero">
          <div class="nav">
            <div>
              <div class="brand">CodeForge</div>
              <div class="tag">FORGE IDEAS</div>
            </div>
            <div class="navlinks">
              <a href="https://codeforgedev.vercel.app/">Home</a>
              <a href="https://codeforgedev.vercel.app/about">About</a>
              <a href="https://codeforgedev.vercel.app/projects">Projects</a>
              <a href="https://codeforgedev.vercel.app/blog">Blog</a>
            </div>
          </div>
          <div class="title">Sitemap</div>
        </div>

        <main>
          <div class="count"><xsl:value-of select="count(s:urlset/s:url)"/> indexed pages</div>
          <div class="grid">
            <section>
              <h2>Main Navigation</h2>
              <ul>
                <xsl:for-each select="s:urlset/s:url[contains(s:loc, 'codeforgedev.vercel.app/') and not(contains(s:loc, '/blog/'))]">
                  <li><a href="{s:loc}"><xsl:choose><xsl:when test="s:loc='https://codeforgedev.vercel.app/'">Home</xsl:when><xsl:when test="contains(s:loc, '/about')">About</xsl:when><xsl:when test="contains(s:loc, '/projects')">Projects</xsl:when><xsl:otherwise><xsl:value-of select="s:loc"/></xsl:otherwise></xsl:choose></a></li>
                </xsl:for-each>
              </ul>
            </section>

            <section>
              <h2>Blog</h2>
              <ul>
                <li><a href="https://codeforgedev.vercel.app/blog">All Blog Posts</a></li>
                <xsl:for-each select="s:urlset/s:url[contains(s:loc, '/blog/') ]">
                  <li><a href="{s:loc}"><xsl:call-template name="title"><xsl:with-param name="url" select="s:loc"/></xsl:call-template></a></li>
                </xsl:for-each>
              </ul>
            </section>

            <section>
              <h2>Resources</h2>
              <ul>
                <li><a href="https://codeforgedev.vercel.app/sitemap.xml">XML Sitemap</a></li>
                <li><a href="https://codeforgedev.vercel.app/robots.txt">Robots.txt</a></li>
                <li><a href="https://github.com/SamRepository25/CodeForge">CodeForge on GitHub</a></li>
              </ul>
            </section>
          </div>
        </main>
      </body>
    </html>
  </xsl:template>

  <xsl:template name="title">
    <xsl:param name="url"/>
    <xsl:variable name="slug" select="substring-after($url, '/blog/')"/>
    <xsl:call-template name="replace"><xsl:with-param name="text" select="$slug"/><xsl:with-param name="from">-</xsl:with-param><xsl:with-param name="to"> </xsl:with-param></xsl:call-template>
  </xsl:template>

  <xsl:template name="replace">
    <xsl:param name="text"/><xsl:param name="from"/><xsl:param name="to"/>
    <xsl:choose>
      <xsl:when test="contains($text, $from)"><xsl:value-of select="substring-before($text, $from)"/><xsl:value-of select="$to"/><xsl:call-template name="replace"><xsl:with-param name="text" select="substring-after($text, $from)"/><xsl:with-param name="from" select="$from"/><xsl:with-param name="to" select="$to"/></xsl:call-template></xsl:when>
      <xsl:otherwise><xsl:value-of select="$text"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
