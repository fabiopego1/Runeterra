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
import unicodedata
import subprocess
import urllib.parse
import urllib.request

from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from groups import CREATURE_CARDS, CREATURE_CHAMPS, FORCE_REGION, FORCE_SPLASH, GROUPS, MOVES, PULL, UNI_CREATURES, UNI_MODULE_TITLES, UNI_PEOPLE, UNI_TITLES, RELOCATE, RENAME, FLAVOR_PT, GLOSSARY, UNIVERSE_SPLASH, WIKI_PICKS  # noqa: E402

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
              'shadow-isles': 'shadow-isles', 'bilgewater': 'bilgewater', 'shurima': 'shurima', 'mount-targon': 'targon', 'bandle-city': 'bandle',
              'void': 'void', 'ixtal': 'ixtal'}
# the League of Legends faction of a champion -> region of the Lore page
FACTION_REGION = dict(UNI_REGION, unaffiliated='runeterra')
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


def get_wiki(name, path):
    """Wiki files are served only to clients that send a browser-like User-Agent: curl does it reliably."""
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        subprocess.run(['curl', '-sS', '-m', '90', '--retry', '3', '-A', 'Mozilla/5.0', '-o', path + '.part',
                        'https://wiki.leagueoflegends.com/en-us/images/' + urllib.parse.quote(name)], check=True)
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
    if 'DARKIN' in c.get('subtypes', []):
        return 'runeterra'
    r = c['regionRefs'][0]
    if r == 'PiltoverZaun':
        return 'zaun' if ZAUN.search(text) else 'piltover'
    return LOR_REGION.get(r)


def nm(text):
    """Name key: no accents, capitals, spaces or apostrophes (the Universe writes Bel’Veth and Bel'Veth both ways)."""
    return re.sub(r'[^a-z0-9]', '', plain(text))


def group_for(name, flavor, region, champ):
    own = [g for g in GROUPS if g['region'] == region]
    for g in own:
        if nm(name) in {nm(n) for n in g.get('champs', [])}:
            return g
    for g in GROUPS:                               # a champion can belong to a group of another region (e.g. Lucian, Sentinels)
        if nm(name) in {nm(n) for n in g.get('champs', [])}:
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


def ptbr(text):
    """The Portuguese pages never say "Void": Vazio (and Vastinata for a Voidborn)."""
    text = re.sub(r'\bVoidborns\b', 'Vastinatas', text)
    text = re.sub(r'\bVoidborn\b', 'Vastinata', text)
    text = re.sub(r'\bVoidlings\b', 'Crias do Vazio', text)
    text = re.sub(r'\bVoidling\b', 'Cria do Vazio', text)
    text = re.sub(r'\bVoid\b', 'Vazio', text)
    for pat, rep in GLOSSARY:
        text = re.sub(pat, rep, text)
    return text


def clean_text(text, limit=420):
    """Card flavour text and Universe captions come with <br>, other tags and odd spacing: keep real line breaks only."""
    t = re.sub(r'<\s*br\s*/?\s*>', '\n', text, flags=re.I)
    t = re.sub(r'<[^>]+>', '', t)
    t = t.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    t = re.sub(r'[ \t\u00a0]+', ' ', t)
    t = re.sub(r' *\n *', '\n', t)
    t = re.sub(r'\n{3,}', '\n\n', t).strip()
    if len(t) > limit:
        cut = t[:limit]
        end = max(cut.rfind('. '), cut.rfind('! '), cut.rfind('? '), cut.rfind('.\n'))
        t = cut[:end + 1] if end > limit * 0.5 else cut.rsplit(' ', 1)[0].rstrip(',;: ') + '…'
    return t


def plain(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text.lower().strip()) if unicodedata.category(c) != 'Mn')


def apply_moves(chosen):
    used = set()
    for j in chosen:
        for target_region, rules in MOVES.items():
            pulled = {plain(n) for n in PULL.get(target_region, [])}
            if j['region'] != target_region and plain(j['name']) not in pulled:
                continue
            for target, names in rules.items():
                if plain(j['name']) in {plain(n) for n in names}:
                    j['bucket'] = ('creatures', None) if target == 'creatures' else ('places', None) if target == 'places' else ('group', target)
                    j['region'] = target_region
                    used.add((target_region, plain(j['name'])))
    for target_region, rules in MOVES.items():
        for names in rules.values():
            for n in names:
                if (target_region, plain(n)) not in used:
                    print(f'  warning: no picture named "{n}" in {target_region}')
    return chosen


def tokens(text):
    return set(re.findall(r'[a-z0-9]+', plain(text)))


def load_champions():
    """Every League of Legends champion: English and Portuguese names, title, short bio, faction and splash art."""
    base = 'https://universe-meeps.leagueoflegends.com/v1/'
    browse = {lang: json.load(open(get(f'{base}{lang}/champion-browse/index.json', os.path.join(CACHE, f'browse-{lang}.json')), encoding='utf-8'))['champions']
              for lang in ('en_us', 'pt_br')}
    pt_by_slug = {c['slug']: c for c in browse['pt_br']}
    version = json.load(open(get('https://ddragon.leagueoflegends.com/api/versions.json', os.path.join(CACHE, 'ddversions.json'))))[0]
    dd = json.load(open(get(f'https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/champion.json', os.path.join(CACHE, f'dd-{version}-en.json')), encoding='utf-8'))['data']
    dd_pt = json.load(open(get(f'https://ddragon.leagueoflegends.com/cdn/{version}/data/pt_BR/champion.json', os.path.join(CACHE, f'dd-{version}-pt.json')), encoding='utf-8'))['data']
    dd_id = {plain(re.sub(r'[^A-Za-z0-9]', '', v['name'])): k for k, v in dd.items()}
    out = []
    for c in browse['en_us']:
        slug = c['slug']
        pt = pt_by_slug.get(slug) or c
        full = json.load(open(get(f'{base}pt_br/champions/{slug}/index.json', os.path.join(CACHE, 'champ-pt', slug + '.json')), encoding='utf-8'))['champion']
        short = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', (full.get('biography') or {}).get('short') or '')).strip()
        did = dd_id.get(plain(re.sub(r'[^A-Za-z0-9]', '', c['name'])))
        url = f'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/{did}_0.jpg' if did and slug not in UNIVERSE_SPLASH else (c.get('image') or {}).get('uri', '').split('?')[0]
        title = (dd_pt.get(did) or {}).get('title') or ''
        out.append(dict(slug=slug, en=c['name'], pt=pt['name'], title=title, short=short, faction=c.get('associated-faction-slug') or 'unaffiliated', url=url))
    return out


def main():
    os.makedirs(OUT_IMG, exist_ok=True)
    taken = site_hashes()
    en, pt = load_lor()
    force = {nm(n): r for r, names in FORCE_REGION.items() for n in names}
    creature_champs = {nm(n): r for r, names in CREATURE_CHAMPS.items() for n in names}
    creature_cards = {nm(n) for n in CREATURE_CARDS}

    # ------------------------------------------------------------ choose the cards
    jobs = []   # dicts: key, url, kind, region, bucket, name, flavor, en
    for code, c in sorted(en.items()):
        champ = c.get('supertype') == 'Champion'
        if c['type'] not in UNIT_TYPES:              # spell art comes in a black oval frame: left out
            continue
        region = force.get(nm(c['name'])) or site_region(c)
        if not region:
            continue
        p = pt.get(code, c)
        name_pt, flavor = p['name'], (p.get('flavorText') or '').strip()
        g = group_for(c['name'], c.get('flavorText', ''), region, champ) if c['type'] != 'Landmark' else None
        if nm(c['name']) in creature_champs:
            region, bucket = creature_champs[nm(c['name'])], ('creatures', None)
        elif g:
            region, bucket = g['region'], ('group', g['id'])
        elif region == 'runeterra':
            bucket = ('group', 'rt-shards' if 'WORLD RUNE' in c.get('subtypes', []) else 'rt-darkin' if 'DARKIN' in c.get('subtypes', []) else 'rt-wanderers')
            if nm(c['name']) in creature_cards:
                bucket = ('creatures', None)
        elif c['type'] == 'Landmark':
            bucket = ('places', None)
        elif (is_creature(c) or nm(c['name']) in creature_cards) and not champ:
            bucket = ('creatures', None)
        else:
            bucket = ('group', 'outros')
        jobs.append(dict(key=code, url=c['assets'][0]['fullAbsolutePath'].replace('http://', 'https://').replace('/en_us/', '/pt_br/'),
                         kind='lor', region=region, bucket=bucket, name=name_pt, flavor=flavor, en=c['name'] if champ else '', card=c['name']))

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
                desc = re.sub(r'\s+', ' ', a.get('description') or '').strip()
                shown = nice(t)
                if not t and m.get('slug') in UNI_MODULE_TITLES:
                    t = UNI_MODULE_TITLES[m['slug']]
                    first = re.split(r'(?<=[.!?]) ', desc)[0] if desc else t
                    shown = first if len(first) <= 70 else first[:67].rsplit(' ', 1)[0] + '…'
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
                jobs.append(dict(key=key, url=url, kind='uni', region=region, bucket=bucket, name=shown or 'Arte de ' + REGION_NAME[region], flavor=desc, en=''))

    # ------------------------------------------------------------ download and make thumbnails
    def work(j):
        out = os.path.join(OUT_IMG, j['key'] + '.webp')
        if j['kind'] == 'wiki':
            src = get_wiki(j['url'], os.path.join(CACHE, 'wiki', j['url']))
        else:
            src = get(j['url'], os.path.join(CACHE, 'img', j['key'] + os.path.splitext(j['url'])[1]))
        im = Image.open(src).convert('RGB')
        h = dhash(im)
        if j['kind'] == 'lor':
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

    def accept(results):
        for j, h, th, out in results:
            if h is None or near(h, seen):
                continue                                       # same art as a picture already used (here or elsewhere)
            if j['kind'] == 'uni' and near(h, titles.get((j['region'], j['name']), []), 12):
                continue                                       # the Universe sometimes posts the same picture twice, cropped differently
            seen.append(h)
            titles.setdefault((j['region'], j['name']), []).append(h)
            th.save(out, 'WEBP', quality=QUALITY, method=6)
            chosen.append(j)

    with cf.ThreadPoolExecutor(16) as ex:
        accept(list(ex.map(work, jobs)))

    # ------------------------------------------------------------ League of Legends champions without Legends of Runeterra art
    have = [tokens(j['en']) for j in chosen if j['en']]
    have += [tokens(j['en']) for j in jobs if j['en']]          # a LoR card whose art repeats one used elsewhere still counts
    champs = load_champions()
    known = {nm(n) for g in GROUPS for n in g.get('champs', [])}
    unknown = known - {nm(c['en']) for c in champs} - {nm(j['en']) for j in jobs if j['en']} - {nm(j.get('card', '')) for j in jobs}
    for n in sorted(unknown):
        print(f'  warning: champion "{n}" in groups.py matches no champion')
    lol = []
    for c in champs:
        t = tokens(c['en'])
        if any(t <= h for h in have) and c['en'] not in FORCE_SPLASH:
            continue
        g = group_for(c['en'], '', FACTION_REGION.get(c['faction'], 'runeterra'), True)
        if nm(c['en']) in creature_champs:
            region, bucket = creature_champs[nm(c['en'])], ('creatures', None)
        elif g:
            region, bucket = g['region'], ('group', g['id'])
        else:
            region = FACTION_REGION.get(c['faction'], 'runeterra')
            bucket = ('group', 'rt-wanderers' if region == 'runeterra' else 'outros')
        blurb = (c['title'][:1].upper() + c['title'][1:] + '.\n' if c['title'] else '') + c['short']
        lol.append(dict(key='l' + c['slug'].replace('-', '')[:18], url=c['url'], kind='lol', region=region, bucket=bucket, name=c['pt'], flavor=blurb, en=c['en']))
    with cf.ThreadPoolExecutor(16) as ex:
        accept(list(ex.map(work, lol)))

    # ------------------------------------------------------------ concept art picked by hand from the League of Legends wiki (groups.py: WIKI_PICKS)
    wiki = []
    for name, region, bucket, caption in WIKI_PICKS:
        cat, gid = ('group', bucket) if bucket not in ('places', 'creatures') else (bucket, None)
        wiki.append(dict(key='w' + hashlib.sha1(name.encode()).hexdigest()[:10], url=name, kind='wiki', region=region, bucket=(cat, gid),
                         name=caption, flavor='', en=''))
    with cf.ThreadPoolExecutor(8) as ex:
        accept(list(ex.map(work, wiki)))

    # ------------------------------------------------------------ hand-made moves (groups.py: MOVES)
    chosen = apply_moves(chosen)
    keys = {j['key'] for j in chosen}
    for k in RELOCATE:
        if k not in keys:
            print(f'  warning: RELOCATE key {k} matches no picture')
    for j in chosen:
        if j['key'] in RELOCATE:
            region, bucket = RELOCATE[j['key']]
            j['region'] = region
            j['bucket'] = (bucket, None) if bucket in ('places', 'creatures', 'drop') else ('group', bucket)
    chosen = [j for j in chosen if j['bucket'][0] != 'drop']      # pictures taken out of the galleries on purpose

    keep = {j['key'] + '.webp' for j in chosen}
    for f in os.listdir(OUT_IMG):
        if f.endswith('.webp') and f not in keep:
            os.remove(os.path.join(OUT_IMG, f))

    # ------------------------------------------------------------ write the data file
    data = {}
    for j in chosen:
        cat, gid = j['bucket']
        r = data.setdefault(j['region'], {'groups': {}, 'places': [], 'creatures': []})
        item = {'s': j['key'], 'n': RENAME.get(j['key']) or ptbr(j['name'])}
        if j['flavor']:
            item['f'] = FLAVOR_PT.get(j['key']) or ptbr(clean_text(j['flavor']))
        if j['kind'] == 'wiki':
            item['w'] = 1
        elif j['kind'] == 'uni':
            item['u'] = 1
        elif j['kind'] == 'lol':
            item['l'] = 1
        if cat == 'group':
            r['groups'].setdefault(gid, []).append(item)
        else:
            r[cat].append(item)
    meta = {g['region'] + '/' + g['id']: {'name': ptbr(g['name']), 'desc': ptbr(g['desc'])} for g in GROUPS}
    out = {}
    for region, r in data.items():
        order = list(dict.fromkeys([g['id'] for g in GROUPS if g['region'] == region] + ['outros']))
        groups = []
        for gid in order:
            items = r['groups'].get(gid)
            if not items:
                continue
            m = meta.get(region + '/' + gid) or {'name': None, 'desc': None}
            groups.append({'id': gid, 'name': m['name'], 'desc': m['desc'], 'items': sorted(items, key=sort_key)})
        out[region] = {'groups': groups, 'places': sorted(r['places'], key=sort_key), 'creatures': sorted(r['creatures'], key=sort_key)}
    with open(OUT_JS, 'w', encoding='utf-8') as f:
        f.write('// Generated by tools/lore-gallery/build.py from Legends of Runeterra card art, the League of Legends Universe\n'
                '// galleries and champion splash arts (Riot Games). Do not edit by hand: change tools/lore-gallery/groups.py and run the script again.\n')
        f.write('window.LORE_GALLERY = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
    total = sum(len(g['items']) for r in out.values() for g in r['groups']) + sum(len(r['places']) + len(r['creatures']) for r in out.values())
    size = sum(os.path.getsize(os.path.join(OUT_IMG, f)) for f in os.listdir(OUT_IMG))
    print(f'{total} pictures, {size / 1e6:.1f} MB; {sum(1 for j in chosen if j["kind"] == "lol")} champion splash arts')
    for region, r in out.items():
        print(f"  {region}: {', '.join(g['id'] + ' ' + str(len(g['items'])) for g in r['groups'])} | places {len(r['places'])} | creatures {len(r['creatures'])}")


REGION_NAME = {'demacia': 'Demacia', 'freljord': 'Freljord', 'ionia': 'Ionia', 'noxus': 'Noxus', 'piltover': 'Piltover', 'zaun': 'Zaun',
               'shadow-isles': 'Ilhas das Sombras', 'bilgewater': 'Águas de Sentina', 'shurima': 'Shurima', 'targon': 'Targon', 'bandle': 'Bandópolis',
               'void': 'o Vazio', 'ixtal': 'Ixtal', 'nazumah': 'Nazumah', 'runeterra': 'Outras'}
PROPER = ['Rakkor', 'Solari', 'Lunari', 'Targon', 'Ra’Horak', 'Garra do Inverno', 'Draklorn', 'Mortis']


def nice(t):
    """Universe titles written in capitals become sentence case (keeping proper names)."""
    if not t or not t.isupper():
        return t
    out = t[0] + t[1:].lower()
    for p in PROPER:
        out = re.sub(re.escape(p), p, out, flags=re.I)
    return out


def sort_key(it):
    return (it.get('u', 0) + 2 * it.get('l', 0) + 3 * it.get('w', 0), it['n'].lower())


if __name__ == '__main__':
    main()
