# https://discord.com/api/v9/collectibles-categories?include_bundles=true&variants_return_style=2&skip_num_categories=0

data = eval(open("./utils/other/discord.json", "r", encoding="utf8").read().replace("false", "False").replace("true", "True").replace("null", "None"))

avatar = []
banner = []

palette = {
    "crimson": "#E7040F",
    "berry": "#B11FCF",
    "sky": "#56CCFF",
    "teal": "#7DEED7",
    "forest": "#6AA624",
    "bubble_gum": "#F957B3",
    "violet": "#972FED",
    "cobalt": "#4278FF",
    "clover": "#63CD5A",
}

for c in data:
    classId = c["sku_id"]
    className = c["name"]
    avatar.append({"id": classId, "name": className, "products": []})
    banner.append({"id": classId, "name": className, "products": []})
    for elm in c["products"]:
        elmId = elm["sku_id"]
        elmName = elm["name"]
        if elm["type"] == 0:
            elmLink = f"https://cdn.discordapp.com/avatar-decoration-presets/{elm['items'][0]['asset']}.png?size=160&passthrough=true"
            avatar[-1]["products"].append({"id": elmId, "name": elmName, "link": elmLink})
        elif elm["type"] == 2:
            elmLink = f"https://cdn.discordapp.com/assets/collectibles/{elm['items'][0]['asset']}asset.webm"
            banner[-1]["products"].append({"id": elmId, "name": elmName, "link": elmLink, "style": f"background: linear-gradient(90deg, {palette[elm['items'][0]['palette']]}1a 0%, {palette[elm['items'][0]['palette']]}4d 100%);"})

avatar = [elm for elm in avatar if len(elm["products"]) > 0]
banner = [elm for elm in banner if len(elm["products"]) > 0]

# print(avatar)
# print(banner)

for cat in avatar:
    for p in cat["products"]:
        print(p["name"])
