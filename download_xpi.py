import requests

content = requests.get(
    "https://addons.mozilla.org/firefox/downloads/file/4526332/adf3791080a54f429246-1.0.xpi", 
    headers={
        "Host": "addons.mozilla.org", 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0", 
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", 
        "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3", 
        "Accept-Encoding": "gzip, deflate, br, zstd", 
        "Referer": "https://addons.mozilla.org/fr/developers/addon/adf3791080a54f429246/versions/5982059", 
        "Connection": "keep-alive", 
        "Cookie": "_ga=GA1.1.1434982639.1736160516; _ga_B9CY1C9VBC=GS2.1.s1751614801$o28$g1$t1751615507$j37$l0$h0; _ga_2VC139B3XV=GS1.1.1742914079.5.1.1742914137.0.0.0; sessionid=q4ot9pfacvl8b483m11lq6v5fgoc2efl; _gid=GA1.2.1388788652.1751551723; _gat=1", 
        "Upgrade-Insecure-Requests": "1", 
        "Sec-Fetch-Dest": "document", 
        "Sec-Fetch-Mode": "navigate", 
        "Sec-Fetch-Site": "same-origin", 
        "Sec-Fetch-User": "?1", 
        "Priority": "u=0, i", 
        "TE": "trailers"
    }).content

open("Concorde.xpi", "wb").write(content)
