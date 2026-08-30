import re, json
from collections import Counter
p = r'D:\deepseek harness work\考研\Athena\data\math3.js'
s = open(p, encoding='utf-8').read()

dataids = re.findall(r"F\('([a-z0-9]+)'", s)
c = Counter(dataids)
dups = [k for k, v in c.items() if v > 1]
print('DATA total', len(dataids), 'unique', len(set(dataids)), 'dups', dups)

exkeys = re.findall(r'^\s{4}"([a-z0-9]+)":', s, re.M)
print('EXAMPLE key total', len(exkeys))
missing = [k for k in exkeys if k not in set(dataids)]
print('EXAMPLE keys not in DATA:', missing)
unused = [k for k in set(dataids) if k not in set(exkeys)]
print('DATA ids with no EXAMPLE:', len(unused), sorted(unused))

# check EXAMPLE structure: each value has q, a, src
# iterate entries
exblock = s[s.find('const EXAMPLE'):s.find('const REL')]
print('EXAMPLE block length', len(exblock))
