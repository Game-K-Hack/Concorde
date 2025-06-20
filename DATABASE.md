# Database

| Prénom | Nom    | Identifiant |
| ------ | ------ | ----------- |
| Marion | Leguay | 771

On le hash avec **SHA256**

| Prénom | Nom | Identifiant |
| ------ | --- | ----------- |
| `3417cfdf67c51b20fe0424bc47d5692e8759fb06b36d4828a6ad1c654a9dc367` | `f1a71797c7582f76dd7310c839e8285ab5d0296cb896a42625772c6e773ad6f6` | `0fbc9039145b6449a7765dcc00d3bd8377d93ac8cccda9f0292b5976e6d67c75` |

On lie en les séparent via une lettre: **g**

`3417cfdf67c51b20fe0424bc47d5692e8759fb06b36d4828a6ad1c654a9dc367gf1a71797c7582f76dd7310c839e8285ab5d0296cb896a42625772c6e773ad6f6g0fbc9039145b6449a7765dcc00d3bd8377d93ac8cccda9f0292b5976e6d67c75`

Puis on y ajoute les autres données, l'avatar, la banner:

| Utilisateur | Avatar | Banner |
| ----------- | ------ | ------ |
| `3417cfdf67c51b20fe0424bc47d5692e8759fb06b36d4828a6ad1c654a9dc367gf1a71797c7582f76dd7310c839e8285ab5d0296cb896a42625772c6e773ad6f6g0fbc9039145b6449a7765dcc00d3bd8377d93ac8cccda9f0292b5976e6d67c75` | `1373015260465987705` | `1349849614227865711` |

On lie le tout en les séparent via une lettre: **h**

`3417cfdf67c51b20fe0424bc47d5692e8759fb06b36d4828a6ad1c654a9dc367gf1a71797c7582f76dd7310c839e8285ab5d0296cb896a42625772c6e773ad6f6g0fbc9039145b6449a7765dcc00d3bd8377d93ac8cccda9f0292b5976e6d67c75h1373015260465987705h1349849614227865711`
