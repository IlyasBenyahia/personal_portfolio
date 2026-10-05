# Déployer benyahiailyas.com sur Cloudflare

Ce guide met le site en ligne sur **Cloudflare Workers (Static Assets)**, avec un
déploiement automatique à chaque fusion sur `main`. Il relie ensuite le domaine
benyahiailyas.com (DNS actuellement chez Hostinger) **sans couper l'email**, puis
déclare le site à Google.

Durée : environ 1 heure, plus le délai de propagation DNS (souvent moins d'une
heure, jusqu'à 24 h).

> Les menus de Cloudflare et de Hostinger changent régulièrement : si un libellé
> diffère, cherchez l'équivalent le plus proche. Les étapes, elles, restent les
> mêmes.

---

## 1. Préparer les clés (10 min)

| Service                  | Où                                                                                                        | Variable                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Web3Forms                | https://web3forms.com → saisir contact@benyahiailyas.com → clé reçue par email                            | `NEXT_PUBLIC_WEB3FORMS_KEY`      |
| Umami Cloud              | https://cloud.umami.is → Settings → Websites → Add website (domaine `benyahiailyas.com`) → **Website ID** | `NEXT_PUBLIC_UMAMI_WEBSITE_ID`   |
| Cloudflare Web Analytics | voir l'étape 5 (souvent inutile : activation automatique)                                                 | `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` |

Ces valeurs sont publiques par nature (elles finissent dans le JavaScript du
site) : ce ne sont pas des secrets, mais elles ne sont pas versionnées pour
autant (`.env` est ignoré par git).

## 2. Créer le projet Cloudflare relié à GitHub (15 min)

1. Créez un compte sur https://dash.cloudflare.com (offre gratuite suffisante).
2. **Workers & Pages** → **Create** → onglet **Workers** → **Import a
   repository** (ou « Connect to Git »).
3. Autorisez l'application GitHub de Cloudflare sur le dépôt
   `IlyasBenyahia/personal_portfolio`, puis sélectionnez-le.
4. Réglages de build :
   - **Project name** : `benyahiailyas-portfolio` (doit correspondre à `name`
     dans `wrangler.jsonc`) ;
   - **Production branch** : `main` ;
   - **Build command** : `npm run build` ;
   - **Deploy command** : `npx wrangler deploy` (valeur par défaut) ;
   - **Root directory** : `/`.
5. **Variables de build** (Build variables) : ajoutez les variables de l'étape
   1. La version de Node est lue dans `.nvmrc` (Node 22) : rien à faire.
6. Lancez le déploiement. Le site répond sur une adresse
   `https://benyahiailyas-portfolio.<votre-sous-domaine>.workers.dev`.
   Vérifiez `/fr`, `/en`, une étude de cas, `/fr/legal`, une URL inexistante
   (page 404) et le mini-jeu.

Ensuite, **chaque fusion sur `main` redéploie le site automatiquement**. Les
autres branches peuvent produire des versions de prévisualisation (option
« non-production branch builds »).

## 3. Relier le domaine en conservant l'email (30 min + propagation)

Un domaine personnalisé sur un Worker exige que la zone DNS soit **gérée par
Cloudflare**. On déplace donc la gestion DNS de Hostinger vers Cloudflare (le
domaine reste enregistré et payé chez Hostinger ; seuls les serveurs DNS
changent).

### 3.1 Relever les enregistrements actuels chez Hostinger (indispensable)

hPanel → **Domaines** → benyahiailyas.com → **DNS / Serveurs de noms** :
copiez **tous** les enregistrements (capture d'écran ou export), en particulier
ceux de l'email :

- **MX** (serveurs de réception, par ex. `mx1.hostinger.com` / `mx2.hostinger.com`,
  avec leur priorité) ;
- **TXT SPF** (commence par `v=spf1`) ;
- **DKIM** (CNAME ou TXT dont le nom contient `_domainkey`) ;
- **DMARC** (TXT `_dmarc`) ;
- CNAME éventuels `autodiscover`, `autoconfig`, `mail`, `webmail`.

Les valeurs ci-dessus sont des exemples : **recopiez exactement les vôtres**.

Si **DNSSEC** est activé chez Hostinger, désactivez-le maintenant (sinon le
domaine devient injoignable pendant le changement).

### 3.2 Ajouter le domaine à Cloudflare

1. Cloudflare → **Domains** → **Onboard a domain** → `benyahiailyas.com` →
   offre **Free** → laissez Cloudflare **scanner** les enregistrements.
2. Comparez la liste importée avec votre relevé : **ajoutez à la main** tout
   MX, TXT (SPF, DMARC), DKIM ou CNAME d'email manquant.
3. Mettez les enregistrements liés à l'email en **DNS only** (nuage gris) :
   les CNAME `_domainkey`, `autodiscover`, `autoconfig`, `mail`, `webmail`.
   (Les MX et TXT ne sont jamais proxifiés.)
4. **Supprimez** les anciens enregistrements du site web : `A`/`AAAA`/`CNAME`
   sur `@` (benyahiailyas.com) et sur `www` qui pointent vers l'hébergement
   Hostinger. Le Worker créera les siens (étape 3.4) et refuse un nom déjà
   occupé par un CNAME.
5. Notez les **deux serveurs de noms** attribués par Cloudflare.

### 3.3 Changer les serveurs de noms chez Hostinger

hPanel → **Domaines** → benyahiailyas.com → **DNS / Serveurs de noms** →
**Changer les serveurs de noms** → saisissez exactement les deux serveurs
Cloudflare. Attendez l'email « your domain is now active » de Cloudflare
(souvent moins d'une heure).

### 3.4 Brancher le domaine sur le Worker

1. **Workers & Pages** → `benyahiailyas-portfolio` → **Settings** →
   **Domains & Routes** → **Add** → **Custom domain** : `benyahiailyas.com`.
2. Ajoutez aussi `www.benyahiailyas.com`, puis redirigez-le vers le domaine
   principal : **Rules** → **Redirect Rules** → modèle « Redirect from WWW to
   root » → code **301**.
3. **SSL/TLS** : mode **Full (strict)** et **Always Use HTTPS** activé.

### 3.5 Vérifier l'email

- Envoyez un email **vers** contact@benyahiailyas.com depuis une autre
  adresse, puis répondez **depuis** cette adresse.
- Contrôlez les MX publiés : https://mxtoolbox.com → `benyahiailyas.com`.
- En cas de problème, il manque presque toujours un enregistrement : comparez
  à nouveau avec le relevé de l'étape 3.1.

## 4. Statistiques Cloudflare Web Analytics (5 min)

**Analytics & Logs** → **Web Analytics** → ajoutez `benyahiailyas.com`.

- Si Cloudflare propose l'**activation automatique** (site proxifié), acceptez
  et laissez `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` **vide** (sinon double comptage).
- Sinon, choisissez le snippet JavaScript, copiez le `token` dans
  `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` (variables de build), puis redéployez.

Umami commence à compter dès que le site tourne sur benyahiailyas.com (rien
n'est envoyé depuis `workers.dev` ni en local, voir `data-domains`).

## 5. Google Search Console (15 min)

1. https://search.google.com/search-console → **Ajouter une propriété** →
   type **Domaine** → `benyahiailyas.com`.
2. Google fournit un enregistrement **TXT** `google-site-verification=…` :
   ajoutez-le dans Cloudflare (**DNS** → **Records** → **Add record** → TXT,
   nom `@`), puis cliquez sur **Valider** (quelques minutes).
3. **Sitemaps** → saisissez `sitemap.xml` → **Envoyer**
   (`https://benyahiailyas.com/sitemap.xml`, qui contient les deux langues).
4. **Inspection d'URL** → `https://benyahiailyas.com/fr` puis `/en` →
   **Demander l'indexation**.
5. Facultatif : Bing Webmaster Tools → importer depuis Search Console.

Pensez à renvoyer le sitemap quand les études de cas réelles remplaceront les
placeholders (elles y entrent automatiquement à ce moment-là).

## 6. Liste de contrôle après la mise en ligne

- [ ] `https://benyahiailyas.com/` mène à `/fr` (ou `/en` pour un navigateur
      anglophone), `www` redirige vers le domaine principal.
- [ ] Une URL inexistante renvoie la page 404 avec le **code 404**.
- [ ] Formulaire de contact : un message de test arrive bien dans la boîte.
- [ ] En-têtes de sécurité : https://securityheaders.com.
- [ ] Aperçus de partage : https://www.opengraph.xyz et le Post Inspector de
      LinkedIn (https://www.linkedin.com/post-inspector/).
- [ ] Données structurées : https://search.google.com/test/rich-results.
- [ ] Performance réelle : https://pagespeed.web.dev.
- [ ] Umami et Cloudflare Web Analytics reçoivent des visites.

## Déploiement manuel (optionnel)

```bash
npx wrangler login     # une seule fois
npm run deploy         # build + wrangler deploy
```
