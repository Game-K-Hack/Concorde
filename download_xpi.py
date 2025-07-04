import requests

content = requests.get(
    "https://addons.mozilla.org/firefox/1.0.xpi", 
    headers={

    }).content

open("Concorde.xpi", "wb").write(content)
