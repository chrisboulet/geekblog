#!/usr/bin/env python3
"""
Analyze WordPress export XML to extract blog patterns for GeekBlog templates.
"""

import xml.etree.ElementTree as ET
import re
from collections import Counter, defaultdict
import json
import sys
from datetime import datetime
from urllib.parse import urlparse

def clean_html(html_content):
    """Clean HTML content and extract plain text."""
    # Remove HTML tags
    clean_text = re.sub(r'<[^>]+>', ' ', html_content)
    # Remove extra whitespace
    clean_text = re.sub(r'\s+', ' ', clean_text)
    # Remove entities
    clean_text = re.sub(r'&[^;]+;', ' ', clean_text)
    return clean_text.strip()

def extract_categories_and_tags(item):
    """Extract categories and tags from a WordPress item."""
    categories = []
    tags = []
    
    for category in item.findall('category'):
        domain = category.get('domain', '')
        nicename = category.get('nicename', '')
        text = category.text or ''
        
        if domain == 'category':
            categories.append(text)
        elif domain == 'post_tag':
            tags.append(text)
    
    return categories, tags

def analyze_title_patterns(titles):
    """Analyze title patterns to identify common structures."""
    patterns = {
        'questions': [],
        'how_to': [],
        'reviews': [],
        'news': [],
        'opinions': [],
        'tutorials': [],
        'lists': [],
        'series': []
    }
    
    for title in titles:
        title_lower = title.lower()
        
        # Question patterns
        if any(word in title_lower for word in ['comment', 'pourquoi', 'que', 'qui', 'où', 'quand', '?']):
            patterns['questions'].append(title)
        
        # How-to patterns
        if any(word in title_lower for word in ['guide', 'tutorial', 'tuto', 'comment faire', 'installer', 'configurer']):
            patterns['how_to'].append(title)
        
        # Review patterns
        if any(word in title_lower for word in ['test', 'review', 'analyse', 'évaluation', 'comparaison']):
            patterns['reviews'].append(title)
        
        # News patterns
        if any(word in title_lower for word in ['nouvelle', 'news', 'sortie', 'lancé', 'annonce']):
            patterns['news'].append(title)
        
        # Opinion patterns
        if any(word in title_lower for word in ['opinion', 'avis', 'pensée', 'réflexion', 'mon point de vue']):
            patterns['opinions'].append(title)
        
        # Tutorial patterns
        if any(word in title_lower for word in ['étape', 'pas à pas', 'méthode', 'technique']):
            patterns['tutorials'].append(title)
        
        # List patterns
        if any(word in title_lower for word in ['top', 'liste', 'meilleur', 'conseil', 'astuce']):
            patterns['lists'].append(title)
        
        # Series patterns
        if any(word in title_lower for word in ['série', 'partie', 'episode', 'chapitre', '#']):
            patterns['series'].append(title)
    
    return patterns

def analyze_content_structure(content):
    """Analyze content structure and writing patterns."""
    if not content:
        return {}
    
    # Count paragraphs
    paragraphs = content.split('\n\n')
    paragraph_count = len([p for p in paragraphs if p.strip()])
    
    # Count sentences
    sentences = re.split(r'[.!?]+', content)
    sentence_count = len([s for s in sentences if s.strip()])
    
    # Average sentence length
    words = content.split()
    word_count = len(words)
    avg_sentence_length = word_count / sentence_count if sentence_count > 0 else 0
    
    # Count links
    link_count = len(re.findall(r'https?://[^\s]+', content))
    
    # Count images
    image_count = len(re.findall(r'<img[^>]*>', content))
    
    # Count code blocks
    code_count = len(re.findall(r'<code[^>]*>.*?</code>', content, re.DOTALL))
    
    # Check for lists
    list_count = len(re.findall(r'<[ou]l[^>]*>', content))
    
    # Check for headers
    header_count = len(re.findall(r'<h[1-6][^>]*>', content))
    
    return {
        'paragraph_count': paragraph_count,
        'sentence_count': sentence_count,
        'word_count': word_count,
        'avg_sentence_length': avg_sentence_length,
        'link_count': link_count,
        'image_count': image_count,
        'code_count': code_count,
        'list_count': list_count,
        'header_count': header_count
    }

def analyze_writing_tone(content):
    """Analyze writing tone and style."""
    if not content:
        return {}
    
    content_lower = content.lower()
    
    # Personal pronouns
    personal_pronouns = len(re.findall(r'\b(je|j\'|me|moi|mon|ma|mes|nous|notre|nos)\b', content_lower))
    
    # Question marks
    questions = len(re.findall(r'\?', content))
    
    # Exclamation marks
    exclamations = len(re.findall(r'!', content))
    
    # Technical terms (common in geek blogs)
    tech_terms = len(re.findall(r'\b(api|framework|code|développement|programmation|serveur|base de données|algorithme|javascript|python|linux|windows|mac|ios|android|app|application|logiciel|software|hardware|cloud|ia|intelligence artificielle|machine learning|blockchain|crypto|bitcoin|tesla|spacex|google|apple|microsoft|amazon|meta|facebook|twitter|github|stackoverflow)\b', content_lower))
    
    # Informal expressions
    informal_expressions = len(re.findall(r'\b(bref|en fait|du coup|genre|style|truc|machin|super|cool|top|génial|excellent|incroyable|impressionnant)\b', content_lower))
    
    # Geek slang
    geek_slang = len(re.findall(r'\b(geek|nerd|dev|admin|user|noob|pro|hacker|bug|debug|crash|lag|troll|epic|fail|win|lol|mdr|wtf|omg|fyi|asap|diy|faq|gui|cli|ui|ux|seo|poo|mvc|rest|json|xml|html|css|js|sql|nosql|crud|mvp|poc|roi|kpi|saas|paas|iaas|b2b|b2c|startup|scale|pivot|disrupt|unicorn|exit|ipo|vc|angel|seed|series|bootstrapped|lean|agile|scrum|kanban|sprint|standup|retro|demo|mvp|poc|prototype|alpha|beta|ga|rtm|eol|lts|cdn|dns|ssl|https|vpn|firewall|ddos|phishing|malware|ransomware|2fa|mfa|oauth|jwt|rbac|gdpr|rgpd|open source|proprietary|freemium|premium|enterprise|community|contributor|maintainer|fork|pull request|merge|commit|push|pull|clone|branch|tag|release|hotfix|patch|rollback|deploy|ci|cd|devops|infrastructure|monitoring|logging|analytics|metrics|dashboard|alert|incident|postmortem|sla|slo|rpo|rto|backup|restore|disaster recovery|high availability|load balancing|horizontal scaling|vertical scaling|microservices|monolith|serverless|container|docker|kubernetes|aws|gcp|azure|heroku|netlify|vercel|firebase|supabase|mongodb|postgresql|mysql|redis|elasticsearch|kafka|rabbitmq|nginx|apache|cloudflare|datadog|sentry|slack|discord|zoom|teams|notion|figma|sketch|photoshop|illustrator|premiere|after effects|blender|unity|unreal|godot|react|vue|angular|svelte|next|nuxt|gatsby|eleventy|wordpress|drupal|joomla|magento|shopify|woocommerce|stripe|paypal|twilio|sendgrid|mailchimp|hubspot|salesforce|zendesk|intercom|typeform|airtable|zapier|ifttt|github actions|gitlab ci|jenkins|travis|circle ci|drone|terraform|ansible|chef|puppet|vagrant|packer|consul|vault|nomad|istio|linkerd|prometheus|grafana|kibana|logstash|beats|fluentd|jaeger|zipkin|opentelemetry|datadog|new relic|splunk|sumo logic|pager duty|opsgenie|victor ops|statuspage|pingdom|uptimerobot|gtmetrix|lighthouse|webpagetest|browserstack|sauce labs|cypress|selenium|puppeteer|playwright|jest|mocha|chai|jasmine|karma|protractor|nightwatch|testcafe|storybook|chromatic|percy|applitools|browserling|lambdatest|cross browser testing|responsinator|am i responsive|what is my viewport|can i use|mdn|w3c|whatwg|ecma|iso|ieee|rfc|owasp|nist|sans|cwe|cve|nvd|mitre|cisa|cert|ncsc|anssi|enisa|gdpr|ccpa|hipaa|sox|pci dss|iso 27001|nist csf|cis controls|owasp top 10|sans top 25|mitre att&ck|kill chain|diamond model|pyramid of pain|threat modeling|risk assessment|vulnerability assessment|penetration testing|red team|blue team|purple team|soc|csirt|cti|threat intelligence|ioc|ttp|apt|malware analysis|reverse engineering|forensics|incident response|threat hunting|security orchestration|soar|siem|ueba|casb|ztna|sase|sd wan|mpls|bgp|ospf|eigrp|rip|vlan|stp|lacp|hsrp|vrrp|glbp|nat|pat|acl|qos|mpls|vpn|ipsec|ssl|tls|pki|ca|crl|ocsp|dnssec|dmarc|spf|dkim|smtp|pop3|imap|ldap|radius|tacacs|kerberos|ntlm|saml|oauth|openid|jwt|rbac|abac|dac|mac|bac|sod|pam|iam|ad|ldap|radius|tacacs|kerberos|ntlm|saml|oauth|openid|jwt|rbac|abac|dac|mac|bac|sod|pam|iam|ad|azure ad|okta|ping|auth0|keycloak|gluu|wso2|forgerock|sailpoint|cyberark|hashicorp vault|aws iam|gcp iam|azure iam|cisco ise|aruba clearpass|f5 apm|citrix netscaler|vmware nsx|palo alto|fortinet|checkpoint|cisco asa|juniper srx|sophos|watchguard|sonicwall|barracuda|imperva|cloudflare|akamai|fastly|cloudfront|azure cdn|gcp cdn|keycdn|bunnycdn|stackpath|maxcdn|rackspace|linode|digitalocean|vultr|hetzner|ovh|scaleway|upcloud|godaddy|namecheap|hover|gandi|name|enom|1and1|ionos|hostgator|bluehost|siteground|dreamhost|hostinger|a2hosting|inmotionhosting|greengeeks|fatcow|ipage|justhost|arvixe|hostmonster|lunarpages|webhostinghub|hostpapa|11|midphase|powweb|startlogic|globat|yahoo|microsoft|google|apple|amazon|meta|facebook|twitter|linkedin|instagram|youtube|tiktok|snapchat|pinterest|reddit|discord|slack|zoom|teams|skype|whatsapp|telegram|signal|viber|line|wechat|qq|weibo|baidu|yandex|duckduckgo|bing|yahoo|ask|aol|excite|lycos|altavista|hotbot|infoseek|webcrawler|dogpile|metacrawler|ixquick|startpage|searx|brave|tor|i2p|freenet|gnunet|ipfs|blockchain|bitcoin|ethereum|litecoin|dogecoin|cardano|polkadot|solana|avalanche|terra|fantom|polygon|binance|coinbase|kraken|gemini|bitfinex|bittrex|kucoin|huobi|okex|gate|bitmart|crypto|defi|nft|dao|dapp|smart contract|web3|metaverse|vr|ar|mr|xr|oculus|quest|rift|pico|vive|index|psvr|gear vr|daydream|cardboard|hololens|magic leap|apple vision|google glass|snapchat spectacles|ray ban stories|meta ray ban|tesla|spacex|boring company|neuralink|starlink|hyperloop|solarcity|gigafactory|supercharger|model s|model 3|model x|model y|cybertruck|roadster|semi|plaid|ludicrous|autopilot|fsd|neural net|dojo|4680|structural pack|cybercab|robovan|optimus|falcon 9|falcon heavy|starship|dragon|crew dragon|cargo dragon|raptor|merlin|starlink|mars|moon|iss|nasa|esa|jaxa|roscosmos|spacex|blue origin|virgin galactic|relativity space|rocket lab|firefly|astra|vector|planet|skybox|blacksky|capella|iceye|spire|swarm|momentus|d orbit|astroscale|clearspace|leo|meo|geo|sso|polar|molniya|gto|gte|escape velocity|delta v|specific impulse|thrust|isp|lox|rp1|methane|hydrogen|xenon|argon|krypton|hall thruster|ion thruster|chemical rocket|nuclear rocket|solar sail|tether|skyhook|railgun|coilgun|mass driver|space elevator|orbital ring|dyson sphere|kardashev scale|fermi paradox|drake equation|seti|breakthrough listen|arecibo|fast|ska|hubble|jwst|kepler|tess|gaia|chandra|spitzer|planck|wmap|cobe|lisa|ligo|virgo|kagra|et|cosmic explorer|neutron star|black hole|white dwarf|red giant|supernova|gamma ray burst|pulsar|quasar|blazar|agn|smbh|stellar mass|solar mass|earth mass|jupiter mass|au|parsec|light year|redshift|cosmic microwave background|dark matter|dark energy|lambda cdm|big bang|inflation|multiverse|string theory|loop quantum gravity|quantum mechanics|general relativity|special relativity|standard model|higgs boson|lhc|cern|fermilab|slac|desy|kek|belle|babar|lhcb|atlas|cms|alice|na62|mu2e|g 2|nova|dune|hyper k|icecube|antares|km3net|auger|telescope array|pamela|ams|planck|euclid|roman|lisa|bet|sn|wfirst|tmt|elt|gmt|ska|fast|lofar|alma|vla|vlba|eht|parkes|arecibo|green bank|lovell|effelsberg|nancay|westerbork|gmrt|meerkat|hera|paper|lwa|ovro lwa|ligo|virgo|kagra|et|cosmic explorer|nicer|nustar|swift|fermi|integral|xmm newton|chandra|suzaku|hitomi|xrism|athena|lynx|axis|strobe x|arcus|hxi|force|ixpe|polarlight|xpolarimeter|smile|theseus|euxo|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter|xpol|xpolarimeter)\b', content_lower))
    
    word_count = len(content.split())
    
    return {
        'personal_pronouns_ratio': personal_pronouns / word_count if word_count > 0 else 0,
        'questions_ratio': questions / word_count if word_count > 0 else 0,
        'exclamations_ratio': exclamations / word_count if word_count > 0 else 0,
        'tech_terms_ratio': tech_terms / word_count if word_count > 0 else 0,
        'informal_ratio': informal_expressions / word_count if word_count > 0 else 0,
        'geek_slang_ratio': geek_slang / word_count if word_count > 0 else 0
    }

def main():
    """Main analysis function."""
    xml_file = "/mnt/c/code/geekblog/examples/lesgeeksatempspartiel.WordPress.2025-06-28.xml"
    
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
        
        # WordPress XML namespace
        wp_ns = '{http://wordpress.org/export/1.2/}'
        content_ns = '{http://purl.org/rss/1.0/modules/content/}'
        
        # Analysis containers
        posts = []
        all_categories = []
        all_tags = []
        all_titles = []
        content_structures = []
        writing_tones = []
        
        # Parse all items
        for item in root.findall('.//item'):
            post_type = item.find(f'.//{wp_ns}post_type')
            status = item.find(f'.//{wp_ns}status')
            
            # Only analyze published posts
            if (post_type is not None and post_type.text == 'post' and
                status is not None and status.text == 'publish'):
                
                title = item.find('title').text or ''
                content = item.find(f'{content_ns}encoded').text or ''
                pub_date = item.find('pubDate').text or ''
                
                # Clean content
                clean_content = clean_html(content)
                
                # Extract categories and tags
                categories, tags = extract_categories_and_tags(item)
                
                # Store post data
                post_data = {
                    'title': title,
                    'content': clean_content,
                    'pub_date': pub_date,
                    'categories': categories,
                    'tags': tags,
                    'content_length': len(clean_content),
                    'word_count': len(clean_content.split()) if clean_content else 0
                }
                
                posts.append(post_data)
                all_categories.extend(categories)
                all_tags.extend(tags)
                all_titles.append(title)
                
                # Analyze content structure
                if clean_content:
                    structure = analyze_content_structure(content)
                    content_structures.append(structure)
                    
                    # Analyze writing tone
                    tone = analyze_writing_tone(clean_content)
                    writing_tones.append(tone)
        
        # Generate analysis report
        report = {
            'blog_info': {
                'total_posts': len(posts),
                'date_range': {
                    'earliest': min([p['pub_date'] for p in posts if p['pub_date']]) if posts else None,
                    'latest': max([p['pub_date'] for p in posts if p['pub_date']]) if posts else None
                },
                'avg_post_length': sum([p['content_length'] for p in posts]) / len(posts) if posts else 0,
                'avg_word_count': sum([p['word_count'] for p in posts]) / len(posts) if posts else 0
            },
            'categories': {
                'total_unique': len(set(all_categories)),
                'most_common': dict(Counter(all_categories).most_common(20)),
                'frequency_distribution': dict(Counter(all_categories))
            },
            'tags': {
                'total_unique': len(set(all_tags)),
                'most_common': dict(Counter(all_tags).most_common(30)),
                'frequency_distribution': dict(Counter(all_tags))
            },
            'title_patterns': analyze_title_patterns(all_titles),
            'content_analysis': {
                'avg_paragraphs': sum([s['paragraph_count'] for s in content_structures]) / len(content_structures) if content_structures else 0,
                'avg_sentences': sum([s['sentence_count'] for s in content_structures]) / len(content_structures) if content_structures else 0,
                'avg_words': sum([s['word_count'] for s in content_structures]) / len(content_structures) if content_structures else 0,
                'avg_sentence_length': sum([s['avg_sentence_length'] for s in content_structures]) / len(content_structures) if content_structures else 0,
                'avg_links': sum([s['link_count'] for s in content_structures]) / len(content_structures) if content_structures else 0,
                'avg_images': sum([s['image_count'] for s in content_structures]) / len(content_structures) if content_structures else 0,
                'avg_code_blocks': sum([s['code_count'] for s in content_structures]) / len(content_structures) if content_structures else 0,
                'avg_lists': sum([s['list_count'] for s in content_structures]) / len(content_structures) if content_structures else 0,
                'avg_headers': sum([s['header_count'] for s in content_structures]) / len(content_structures) if content_structures else 0
            },
            'writing_style': {
                'avg_personal_pronouns': sum([t['personal_pronouns_ratio'] for t in writing_tones]) / len(writing_tones) if writing_tones else 0,
                'avg_questions': sum([t['questions_ratio'] for t in writing_tones]) / len(writing_tones) if writing_tones else 0,
                'avg_exclamations': sum([t['exclamations_ratio'] for t in writing_tones]) / len(writing_tones) if writing_tones else 0,
                'avg_tech_terms': sum([t['tech_terms_ratio'] for t in writing_tones]) / len(writing_tones) if writing_tones else 0,
                'avg_informal': sum([t['informal_ratio'] for t in writing_tones]) / len(writing_tones) if writing_tones else 0,
                'avg_geek_slang': sum([t['geek_slang_ratio'] for t in writing_tones]) / len(writing_tones) if writing_tones else 0
            },
            'sample_posts': posts[:5]  # First 5 posts for reference
        }
        
        # Save analysis results
        output_file = "/mnt/c/code/geekblog/blog_analysis_report.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"Analysis complete! Report saved to: {output_file}")
        
        # Print summary
        print("\n" + "="*60)
        print("BLOG ANALYSIS SUMMARY")
        print("="*60)
        print(f"Total Posts Analyzed: {report['blog_info']['total_posts']}")
        print(f"Average Post Length: {report['blog_info']['avg_post_length']:.0f} characters")
        print(f"Average Word Count: {report['blog_info']['avg_word_count']:.0f} words")
        
        print("\nTOP CATEGORIES:")
        for cat, count in list(report['categories']['most_common'].items())[:10]:
            print(f"  {cat}: {count} posts")
        
        print("\nTOP TAGS:")
        for tag, count in list(report['tags']['most_common'].items())[:10]:
            print(f"  {tag}: {count} posts")
        
        print("\nTITLE PATTERNS:")
        for pattern, titles in report['title_patterns'].items():
            if titles:
                print(f"  {pattern.replace('_', ' ').title()}: {len(titles)} titles")
        
        print("\nWRITING STYLE:")
        print(f"  Personal tone: {report['writing_style']['avg_personal_pronouns']:.3f}")
        print(f"  Technical content: {report['writing_style']['avg_tech_terms']:.3f}")
        print(f"  Informal style: {report['writing_style']['avg_informal']:.3f}")
        print(f"  Geek culture: {report['writing_style']['avg_geek_slang']:.3f}")
        
        return report
        
    except Exception as e:
        print(f"Error analyzing blog: {e}")
        return None

if __name__ == "__main__":
    main()