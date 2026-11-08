from pathlib import Path
from html.parser import HTMLParser
import json,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]/'public'
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.h1=0;self.links=[];self.canon=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='h1':self.h1+=1
  if tag in ['a','img','script','link']:
   src=a.get('src',a.get('href',''))
   if src.startswith('/') and not src.startswith('//'):self.links.append(src.split('#')[0].split('?')[0])
  if tag=='link' and a.get('rel')=='canonical':self.canon.append(a['href'])
errors=[]
for p in root.glob('*.html'):
 if p.name=='404.html':continue
 parser=Parser();text=p.read_text();parser.feed(text)
 if parser.h1!=1:errors.append(f'{p.name}: {parser.h1} H1s')
 if len(parser.canon)!=1:errors.append(f'{p.name}: missing canonical')
 if '127' in text or '4.9' in text:errors.append(f'{p.name}: obsolete review claim')
 for link in parser.links:
  target=root/(link.lstrip('/') or 'index.html')
  if not target.exists() and not target.with_suffix('.html').exists():errors.append(f'{p.name}: missing {link}')
tree=ET.parse(root/'sitemap.xml');urls=tree.findall('{*}url');assert len(urls)==27
assert not errors,'\n'.join(errors)
print('Passed: 27 pages, unique H1/canonical, internal links/assets and sitemap.')
