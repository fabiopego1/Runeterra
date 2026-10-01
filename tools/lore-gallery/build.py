#!/usr/bin/env python3
"""Builds the region galleries of the Lore page (Grupos, Ambientes, Criaturas) from official Riot art:
Legends of Runeterra card art (Data Dragon, dd.b.pvp.net) and the League of Legends Universe galleries.

Writes assets/lore-gallery/*.webp and js/pt/lore-gallery.js. Needs network access and Pillow:

    pip install pillow
    python3 tools/lore-gallery/build.py            # CACHE=/some/dir to keep the downloads elsewhere

Group definitions live in groups.py next to this file. Pictures already used anywhere else on the site
(same art, checked by a perceptual hash) are left out, so no picture appears twice.
"""
import concurrent.futures as cf
import hashlib
import io
import json
import os
import re
import sys
import time
import urllib.request

from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from groups import GROUPS, UNI_CREATURES, UNI_PEOPLE, UNI_TITLES  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT_IMG = os.path.join(ROOT, 'assets', 'lore-gallery')
OUT_JS = os.path.join(ROOT, 'js', 'pt', 'lore-gallery.js')
CACHE = os.environ.get('CACHE') or os.path.join(ROOT, 'tools', 'lore-gallery', '.cache')
SETS = ['1', '2', '3', '4', '5', '6', '6cde', '7', '7b', '8', '9']
W, H = 480, 240            # thumbnail size (LoR art is 2:1); Universe art keeps its shape up to 480 x 360
MAX_H = 360
QUALITY = 58

LOR_REGION = {'Demacia': 'demacia', 'Freljord': 'freljord', 'Ionia': 'ionia', 'Noxus': 'noxus', 'ShadowIsles': 'shadow-isles',
              'Bilgewater': 'bilgewater', 'Shurima': 'shurima', 'Targon': 'targon', 'BandleCity': 'bandle', 'Runeterra': 'runeterra'}
UNI_REGION = {'demacia': 'demacia', 'freljord': 'freljord', 'ionia': 'ionia', 'noxus': 'noxus', 'piltover': 'piltover', 'zaun': 'zaun',
              'shadow-isles': 'shadow-isles', 'bilgewater': 'bilgewater', 'shurima': 'shurima', 'mount-targon': 'targon', 'bandle-city': 'bandle'}
# Regions the galleries skip for now (their own pages come later)
SKIP = re.compile(r"\bvoid|xer'sai|rek'sai|kai'sa|vel'koz|kassadin|malzahar|ixtal|nidalee|pakaa|nazumah|k'sante", re.I)
ZAUN = re.compile(r"zaun|chem|sump|undercity|back alley|whump|urchin|shimmer|singed|warwick|twitch|zeri|mundo|ekko|jinx|viktor|augment|scrap|bouncer|diva|corina|renata|gang|punk|clockling|swapbot|mimic|boom", re.I)
CREATURE_SUB = {'BIRD', 'CAT', 'DOG', 'SPIDER', 'REPTILE', 'PORO', 'YETI', 'ELNUK', 'SEA MONSTER', 'DRAGON', 'LURKER', 'FAE', 'TECH', 'ELEMENTAL', 'CELESTIAL'}
CREATURE_NAME = re.compile(
    r"Drake|Wolf|Boar|Bear\b|Badgerbear|Kraken|Serpent|Hound|Stag\b|Charger|Broadwing|Toad|fish|Fish|Shark|Octo|Squirrel|Hare\b|Goat|Ibex|"
    r"Stellacorn|Snapper|Lizard|Beast|Golem|Colossus|Construct|bot\b|Bot\b|Turret|Elemental|Mammoth|Snailmoth|Crocolith|Scuttle|Leech|Sprite|"
    r"Monster|Croaker|Narwhal|\bRex\b|Basilisk(?! Rider)|Tri-tail|Greyback|Pigeon|Owlcat|Cobra|Heisho|Swarm|Rockbear|Bristlehog|Pairofant|"
    r"Chimera|Leviathan|Megatusk|Platewyrm|Wyrm|Gromp|Otterpus|dactyl|Slug|Barkbeast|Doombeast|Soulgorger|Hydravine|Snapvine|Treant|Sapling|"
    r"Stomper|Lionhawk|Raptor|Razorclaw|Hawk|Owl\b|Fox\b|Pup\b|Poro|Caprine|Scarab|Burblefish|Newtfish|Sandhopper|Telescope|Husk|Spectral|"
    r"Wraith|Ghast|Specter|Phantom|Haunted|Mistkeepers|Spirit|Ghost|Abomination|Horror|Nestling|Spiderling|Skitterer|Webspinner|Deathwinder|"
    r"Harpy|[Ss]prite|Hatchling|Youngling|Ram\b|Elkin|Stonehorn|Dune Swallower|Rock Hopper|Megatee|Minitee|Hare|Fluffs|Changelings|Shellfolk|Kelp|Clump|Stinky|"
    r"Chump|Lantern|Library|Snow Hare|Saurian|Ancient Yeti|Wyrding|Undying|Etherfiend|Darkwraith|Shackled|Chimeslime|Cygnus|Startled|Sparklefly|Ibex")
UNIT_TYPES = {'Unit', 'Landmark'}


def get(url, path):
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        for attempt in range(5):                   # the CDN sometimes cuts a transfer: try again
            try:
                with urllib.request.urlopen(req, timeout=60) as r, open(path + '.part', 'wb') as f:
                    f.write(r.read())
                break
            except Exception:
                if attempt == 4:
                    raise
                time.sleep(2 ** attempt)
        os.replace(path + '.part', path)
    return path


def dhash(im):
    g = im.convert('L').resize((9, 8), Image.LANCZOS)
    px = list(g.getdata())
    return sum(1 << i for i in range(64) if px[(i // 8) * 9 + i % 8] > px[(i // 8) * 9 + i % 8 + 1])


def oval(im):
    """True for card art drawn inside a black oval (spells and the like): all four corners are black."""
    w, h = im.size
    s = max(8, w // 40)
    corners = [im.crop(b).convert('L') for b in ((0, 0, s, s), (w - s, 0, w, s), (0, h - s, s, h), (w - s, h - s, w, h))]
    return all(max(c.getextrema()) < 18 for c in corners)


def near(h, pool, d=6):
    return any(bin(h ^ p).count('1') <= d for p in pool)


def site_hashes():
    pool = []
    for d in ('lore', 'cards', 'tip'):
        folder = os.path.join(ROOT, 'assets', d)
        for f in os.listdir(folder):
            if f.endswith('.webp'):
                im = Image.open(os.path.join(folder, f)).convert('RGB')
                pool.append(dhash(im))
                w, h = im.size
                if abs(w / h - 2) > .05:       # pictures cropped on the site: compare the matching 2:1 band too
                    ch = min(h, w // 2)
                    pool.append(dhash(im.crop((0, (h - ch) // 2, w, (h - ch) // 2 + ch))))
    return pool


def load_lor():
    en, pt = {}, {}
    for s in SETS:
        for lang, store in (('en_us', en), ('pt_br', pt)):
            p = get(f'https://dd.b.pvp.net/latest/set{s}/{lang}/data/set{s}-{lang}.json', os.path.join(CACHE, f'set{s}-{lang}.json'))
            for c in json.load(open(p, encoding='utf-8')):
                store[c['cardCode']] = c
    return en, pt


def site_region(c):
    text = ' '.join([c['name'], c.get('flavorText', ''), c.get('descriptionRaw', '')])
    if SKIP.search(text):
        return None
    if 'DARKIN' in c.get('subtypes', []):
        return 'runeterra'
    r = c['regionRefs'][0]
    if r == 'PiltoverZaun':
        return 'zaun' if ZAUN.search(text) else 'piltover'
    return LOR_REGION.get(r)


def group_for(name, flavor, region, champ):
    own = [g for g in GROUPS if g['region'] == region]
    for g in own:
        if name in g.get('champs', []):
            return g
    for g in GROUPS:                               # a champion can belong to a group of another region (e.g. Lucian, Sentinels)
        if name in g.get('champs', []):
            return g
    if champ:
        return None
    for g in own:
        if g.get('match') and re.search(g['match'], name):
            return g
        if g.get('flavor') and re.search(g['flavor'], flavor):
            return g
    return None


PEOPLE_NAME = re.compile(r'Herder|Handler|Trainer|Shepherd|Rider|Tamer|Keeper(?! of)')


def is_creature(c):
    if PEOPLE_NAME.search(c['name']):
        return False
    return bool(CREATURE_SUB & set(c.get('subtypes', []))) or bool(CREATURE_NAME.search(c['name']))


def main():
    os.makedirs(OUT_IMG, exist_ok=True)
    taken = site_hashes()
    en, pt = load_lor()

    # ------------------------------------------------------------ choose the cards
    jobs = []   # (key, url, kind, region, bucket, name, flavor, credit)
    for code, c in sorted(en.items()):
        champ = c.get('supertype') == 'Champion'
        if c['type'] not in UNIT_TYPES:              # spell art comes in a black oval frame: left out
            continue
        region = site_region(c)
        if not region:
            continue
        p = pt.get(code, c)
        name_pt, flavor = p['name'], (p.get('flavorText') or '').strip()
        if region == 'runeterra':
            if c['type'] == 'Spell':
                continue
            bucket = ('group', 'rt-shards' if 'WORLD RUNE' in c.get('subtypes', []) else 'rt-darkin' if 'DARKIN' in c.get('subtypes', []) else 'rt-wanderers')
        else:
            g = group_for(c['name'], c.get('flavorText', ''), region, champ) if c['type'] != 'Landmark' else None
            if g:
                region, bucket = g['region'], ('group', g['id'])
            elif c['type'] == 'Landmark':
                bucket = ('places', None)
            elif is_creature(c) and not champ:
                bucket = ('creatures', None)
            else:
                bucket = ('group', 'outros')
        jobs.append((code, c['assets'][0]['fullAbsolutePath'].replace('http://', 'https://').replace('/en_us/', '/pt_br/'),
                     'lor', region, bucket, name_pt, flavor, 'Legends of Runeterra'))

    uni_by_title = {}
    for g in GROUPS:
        for t in g.get('uni', []):
            uni_by_title[(g['region'], t)] = g['id']
    for slug, region in UNI_REGION.items():
        d = json.load(open(get(f'https://universe-meeps.leagueoflegends.com/v1/pt_br/factions/{slug}/index.json',
                               os.path.join(CACHE, f'uni-{slug}.json')), encoding='utf-8'))
        for m in d.get('modules', []):
            if m.get('type') != 'image-gallery':
                continue
            env = 'environment' in (m.get('slug') or '') or 'depths' in (m.get('slug') or '')
            for a in m.get('assets', []):
                url = (a.get('uri') or '').split('?')[0]
                if not url:
                    continue
                t = (a.get('title') or '').strip()
                t = '' if t == 'None' else t
                t = UNI_TITLES.get(t, t)
                gid = uni_by_title.get((region, t))
                if gid:
                    bucket = ('group', gid)
                elif t in UNI_CREATURES:
                    bucket = ('creatures', None)
                elif t in UNI_PEOPLE or (not env and not t):
                    bucket = ('group', 'outros')
                else:
                    bucket = ('places', None)
                key = 'u' + hashlib.sha1(url.encode()).hexdigest()[:10]
                desc = re.sub(r'\s+', ' ', a.get('description') or '').strip()
                jobs.append((key, url, 'uni', region, bucket, nice(t) or 'Arte de ' + REGION_NAME[region], desc, 'Universo de League of Legends'))

    # ------------------------------------------------------------ download and make thumbnails
    def work(j):
        key, url, kind, *_ = j
        out = os.path.join(OUT_IMG, key + '.webp')
        src = get(url, os.path.join(CACHE, 'img', key + os.path.splitext(url)[1]))
        im = Image.open(src).convert('RGB')
        h = dhash(im)
        if kind == 'lor':
            if oval(im):
                return j, None, None, out
            th = im.resize((W, H), Image.LANCZOS)
        else:
            w0, h0 = im.size
            nh = round(h0 * W / w0)
            th = im.resize((W, nh), Image.LANCZOS)
            if nh > MAX_H:
                th = th.crop((0, (nh - MAX_H) // 3, W, (nh - MAX_H) // 3 + MAX_H))
        return j, h, th, out

    chosen, seen, titles = [], list(taken), {}
    with cf.ThreadPoolExecutor(16) as ex:
        results = list(ex.map(work, jobs))
    for j, h, th, out in results:
        if h is None or near(h, seen):
            continue                                       # same art as a picture already used (here or elsewhere)
        if j[2] == 'uni' and near(h, titles.get((j[3], j[5]), []), 12):
            continue                                       # the Universe sometimes posts the same picture twice, cropped differently
        seen.append(h)
        titles.setdefault((j[3], j[5]), []).append(h)
        th.save(out, 'WEBP', quality=QUALITY, method=6)
        chosen.append(j)
    keep = {j[0] + '.webp' for j in chosen}
    for f in os.listdir(OUT_IMG):
        if f.endswith('.webp') and f not in keep:
            os.remove(os.path.join(OUT_IMG, f))

    # ------------------------------------------------------------ write the data file
    data = {}
    for key, url, kind, region, (cat, gid), name, flavor, credit in chosen:
        r = data.setdefault(region, {'groups': {}, 'places': [], 'creatures': []})
        item = {'s': key, 'n': name}
        if flavor:
            item['f'] = flavor[:280]
        if kind == 'uni':
            item['u'] = 1
        if cat == 'group':
            r['groups'].setdefault(gid, []).append(item)
        else:
            r[cat].append(item)
    meta = {g['region'] + '/' + g['id']: {'name': g['name'], 'desc': g['desc']} for g in GROUPS}
    out = {}
    for region, r in data.items():
        order = list(dict.fromkeys([g['id'] for g in GROUPS if g['region'] == region] + ['rt-wanderers', 'rt-darkin', 'rt-shards', 'outros']))
        groups = []
        for gid in order:
            items = r['groups'].get(gid)
            if not items:
                continue
            m = meta.get(region + '/' + gid) or RUNETERRA_GROUPS.get(gid) or {'name': None, 'desc': None}
            groups.append({'id': gid, 'name': m['name'], 'desc': m['desc'], 'items': sorted(items, key=sort_key)})
        out[region] = {'groups': groups, 'places': sorted(r['places'], key=sort_key), 'creatures': sorted(r['creatures'], key=sort_key)}
    with open(OUT_JS, 'w', encoding='utf-8') as f:
        f.write('// Generated by tools/lore-gallery/build.py from Legends of Runeterra card art and the League of Legends Universe\n'
                '// galleries (Riot Games). Do not edit by hand: change tools/lore-gallery/groups.py and run the script again.\n')
        f.write('window.LORE_GALLERY = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
    total = sum(len(g['items']) for r in out.values() for g in r['groups']) + sum(len(r['places']) + len(r['creatures']) for r in out.values())
    size = sum(os.path.getsize(os.path.join(OUT_IMG, f)) for f in os.listdir(OUT_IMG))
    print(f'{total} pictures, {size / 1e6:.1f} MB')
    for region, r in out.items():
        print(f"  {region}: {', '.join(g['id'] + ' ' + str(len(g['items'])) for g in r['groups'])} | places {len(r['places'])} | creatures {len(r['creatures'])}")


REGION_NAME = {'demacia': 'Demacia', 'freljord': 'Freljord', 'ionia': 'Ionia', 'noxus': 'Noxus', 'piltover': 'Piltover', 'zaun': 'Zaun',
               'shadow-isles': 'Ilhas das Sombras', 'bilgewater': 'Águas de Sentina', 'shurima': 'Shurima', 'targon': 'Targon', 'bandle': 'Bandópolis'}
PROPER = ['Rakkor', 'Solari', 'Lunari', 'Targon', 'Ra’Horak', 'Garra do Inverno', 'Draklorn', 'Mortis']


def nice(t):
    """Universe titles written in capitals become sentence case (keeping proper names)."""
    if not t or not t.isupper():
        return t
    out = t[0] + t[1:].lower()
    for p in PROPER:
        out = re.sub(re.escape(p), p, out, flags=re.I)
    return out


RUNETERRA_GROUPS = {
    'rt-wanderers': {'name': 'Andarilhos e lendas', 'desc': 'Figuras que não pertencem a uma só terra: viajantes, guardiões cósmicos e lendas que aparecem por toda Runeterra.'},
    'rt-darkin': {'name': 'Os Darkin', 'desc': 'Antigos Ascendidos de Shurima presos em armas após a guerra contra Icathia. Possuem quem os empunha e espalham ruína por onde passam.'},
    'rt-shards': {'name': 'Runas Globais', 'desc': 'Fragmentos dos poderes que criaram o mundo. Quem os encontra raramente sai ileso.'},
    'outros': {'name': None, 'desc': None},
}


def sort_key(it):
    return (it.get('u', 0), it['n'].lower())


if __name__ == '__main__':
    main()
