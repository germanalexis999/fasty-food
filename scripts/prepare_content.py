"""Prepare web copies of supplied artwork; original files are never modified."""
from pathlib import Path
import json, shutil, subprocess, sys
from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\germa\Downloads\fasty_food_web')
ASSETS = ROOT / 'public/assets'
MEDIA = ROOT / 'public/media'
sys.path.insert(0, str(ROOT / '.tools'))
import imageio_ffmpeg
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
ASSETS.mkdir(parents=True, exist_ok=True)
MEDIA.mkdir(parents=True, exist_ok=True)
pdf = PdfReader(SOURCE / 'MENU FASTY FOOD.pdf')

def webp(image, name, box=None, width=1400):
    if box:
        w,h=image.size
        image=image.crop(tuple(round(v*(w if i%2==0 else h)) for i,v in enumerate(box)))
    image.thumbnail((width,width))
    image.convert('RGB').save(ASSETS / f'{name}.webp', quality=88)

webp(pdf.pages[0].images[0].image, 'burger-hero', (.025,.02,.372,.305))
webp(pdf.pages[0].images[0].image, 'burger-smash', (.65,.015,1,.305))
webp(Image.open(SOURCE / 'Untitled design (2).png'), 'logo', width=600)
webp(Image.open(SOURCE / 'Your paragraph text.png'), 'milkshakes')
webp(pdf.pages[5].images[0].image, 'cajita')
webp(pdf.pages[6].images[0].image, 'tornado-promo')
webp(pdf.pages[8].images[0].image, 'milkshake-promo')
webp(pdf.pages[9].images[0].image, 'smoothie-promo')
webp(pdf.pages[9].images[0].image, 'smoothies', (.28,.18,.94,.84))
webp(pdf.pages[8].images[0].image, 'milkshake-cups', (.21,.18,.94,.83))
webp(Image.open(SOURCE / 'Panchos Menu Landscape (1920 x 1080 px).png'), 'hotdog', (.065,.015,.345,.305))
webp(pdf.pages[6].images[0].image, 'tornado', (.49,.11,.98,.96))

videos = {
 'doble-smash':'DOBLE SMASH.mp4',
 'milkshakes':'LOS MEJORES MILKSHAKE.mp4',
 'papas-tornado':'PROBA NUESTRAS PAPAS TORNADO.mp4',
 'pancho-big-mac':'Pan Brioche salchicha, Salsa BiG Mac, Pepino y Lechuga..mp4',
 'smoothies':'PROBA NUESTROS SMOOTHIES.mp4',
}
for slug, name in videos.items():
    target=MEDIA / f'{slug}.mp4'
    if not target.exists():
        subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-y','-i',str(SOURCE/name),
          '-vf','scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2',
          '-c:v','libx264','-crf','25','-preset','fast','-c:a','aac','-b:a','96k',
          '-movflags','+faststart',str(target)],check=True)
    poster=ASSETS / f'video-{slug}.webp'
    subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-y','-ss','1','-i',str(target),
      '-frames:v','1','-vf','scale=960:-1',str(poster)],check=True)

categories = [
 ('burgers','Hamburguesas','Todas incluyen papas medianas.','burger-hero'),
 ('panchos','Panchos','Gratinados y súper panchos para todos los gustos.','hotdog'),
 ('papas','Papas','Bandejas para compartir y nuestras papas tornado.','tornado'),
 ('milkshakes','Milkshakes','Chocolate, dulce de leche y frutilla.','milkshake-cups'),
 ('smoothies','Smoothies','Frutilla, ananá y durazno.','smoothies'),
 ('cajita','Cajita Fasty','Hamburguesa, papas, bebida y juguete.','cajita'),
 ('bebidas','Sumá una bebida','Adicionales para acompañar tu combo.',''),
]
products=[]
def add(category,name,price,description='',group='',includes='',video='',featured=False):
    import unicodedata,re
    slug=re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',name).encode('ascii','ignore').decode().lower()).strip('-')
    products.append(dict(id=f'{category}-{slug}',category=category,name=name,price=price,
      description=description,group=group,includes=includes,available=True,visible=True,
      order=len(products),video=f'media/{video}.mp4' if video else '',featured=featured))

for name,price,description in [
 ('Simple JR',9000,'Medallón de carne de 80 g y doble queso.'),
 ('Doble JR',10000,'Doble medallón de 80 g y doble cheddar.'),
 ('Doble Tasty',18000,'Dos medallones de 125 g de carne, triple cheddar, lechuga, tomate y salsa especial Tasty.'),
 ('Doble Cuarto',18000,'Clásico doble cuarto de libra con cebolla y ketchup.'),
 ('Doble Bacon',18000,'Dos medallones de 125 g de carne, triple cheddar y doble bacon ahumado.'),
 ('Cuarto de libra',16000,'Clásico cuarto de libra con cebolla y ketchup.'),
 ('Tasty Simple',16000,'Medallón de 125 g de carne, doble cheddar, lechuga, tomate y salsa especial Tasty.'),
 ('Clásica Doble',15000,'Dos medallones de 125 g de carne, lechuga y tomate.'),
 ('Mega Cuádruple',26000,'Cuatro medallones de 125 g y cuádruple cheddar. 500 g de carne.'),
]: add('burgers',name,price,description,'Clásicas','Incluye papas medianas')
for name,price,description in [
 ('Smash Doble',18000,'Hamburguesa casera, doble medallón smash de 120 g, triple cheddar y pan de papa.'),
 ('Smash Simple',16000,'Hamburguesa casera, un medallón smash de 120 g, doble cheddar y pan de papa.'),
 ('Smash Doble Cebolla',18000,'Hamburguesa casera, medallón smash de 120 g, triple cheddar y pan de papa.'),
 ('Smash Doble Bacon',19000,'Hamburguesa casera, doble medallón smash de 120 g, triple cheddar, doble bacon ahumado y pan de papa.'),
]: add('burgers',name,price,description,'Smash','Incluye papas medianas','doble-smash' if name=='Smash Doble' else '',name=='Smash Doble')
for name,price,description in [
 ('Mexicano',13500,'Pan brioche, salchicha, salsa de guacamole, tomate y nachos.'),
 ('Americano',12000,'Pan especial, salchicha, queso cheddar y bacon.'),
 ('Cheesy',12000,'Pan de parmesano, salchicha, cheddar, provolone, muzzarella y parmesano fundido.'),
 ('Big Mac',13500,'Pan brioche, salchicha, salsa Big Mac, pepino y lechuga.'),
 ('Venezolano',13500,'Pan especial, salchicha, zanahoria, choclo y fontina gratinado.'),
 ('Napolitano',12000,'Pan especial, salchicha, salsa de tomate y muzzarella.'),
 ('Jamón y queso',12000,'Pan especial, salchicha, jamón y queso gouda fundido.'),
 ('Argento',12000,'Pan brioche, salchicha, criolla y chimichurri.'),
]: add('panchos',name,price,description,'Gratinados','Incluye lata de gaseosa','pancho-big-mac' if name=='Big Mac' else '')
for name,price,description in [
 ('Súper Pancho Fasty',2500,'Pan artesanal, salchicha premium y papas pay.'),
 ('Súper Pancho Alemán',4000,'Pan brioche suave, salchicha Frankfurt y papas pay.'),
 ('Súper Pancho Parmesano',4000,'Pan de parmesano gratinado, salchicha Frankfurt y papas pay.'),
 ('Súper Pancho Doble',4000,'Pan artesanal, doble salchicha premium y papas pay.'),
 ('Súper Pancho Triple',6000,'Pan artesanal, triple salchicha premium y papas pay.'),
]: add('panchos',name,price,description,'Súper panchos')
for size,weight,price in [('Chica','250 g',4500),('Mediana','500 g',8500),('Familiar','750 g',12500)]:
    add('papas',f'Bandeja {size.lower()}',price,f'Papas fritas · {weight}.','Bandejas')
for flavor in ['Original','Cheddar','Doritos']:
    add('papas',f'Tornado {flavor}',4500,'Papa en espiral en pincho.','Papas tornado',video='papas-tornado' if flavor=='Original' else '')
for flavor in ['Chocolate','Dulce de leche','Frutilla']:
    add('milkshakes',f'Milkshake de {flavor.lower()}',6000,'',video='milkshakes' if flavor=='Chocolate' else '')
for flavor in ['Frutilla','Ananá','Durazno']:
    add('smoothies',f'Smoothie de {flavor.lower()}',5000,'',video='smoothies' if flavor=='Frutilla' else '')
add('cajita','Cajita Fasty',12000,'Hamburguesa, papas y bebida. ¡Incluye juguete!')
for name,price in [('Lata de gaseosa',1500),('Gaseosa en botella',2500),('Cerveza artesanal',4000)]:
    add('bebidas',name,price,'Adicional a tu combo.')

promotions=[
 dict(id='tornado-2',title='Papas tornado',subtitle='Elegí original, cheddar o Doritos.',quantity=2,price=8000,image='assets/tornado-promo.webp',category='papas',visible=True,order=0),
 dict(id='milkshake-2',title='Milkshakes',subtitle='Chocolate, dulce de leche o frutilla.',quantity=2,price=10000,image='assets/milkshake-promo.webp',category='milkshakes',visible=True,order=1),
 dict(id='smoothie-2',title='Smoothies',subtitle='Frutilla, ananá o durazno.',quantity=2,price=8000,image='assets/smoothie-promo.webp',category='smoothies',visible=True,order=2),
]
content=dict(settings=dict(name='FastyFood',tagline='Hamburguesería & panchos',whatsapp='5491123337893',phoneDisplay='11 2333-7893',address='',hours='',mapsUrl='',instagramUrl='',heroTitle='EL ANTOJO\nTIENE NOMBRE.',heroSubtitle='Hamburguesas, panchos, papas y algo bien fresco. Encontrá tu próximo favorito.'),
 categories=[dict(id=id,name=name,description=desc,image=f'assets/{img}.webp' if img else '',order=i) for i,(id,name,desc,img) in enumerate(categories)],products=products,promotions=promotions,
 videos=[dict(id='video-'+slug,title=title,src=f'media/{slug}.mp4',poster=f'assets/video-{slug}.webp',visible=True,order=i) for i,(slug,title) in enumerate([('doble-smash','Doble smash'),('papas-tornado','Papas tornado'),('pancho-big-mac','Pancho Big Mac'),('milkshakes','Milkshakes'),('smoothies','Smoothies')])])
(ROOT/'public/content.json').write_text(json.dumps(content,ensure_ascii=False,indent=2),encoding='utf-8')
if not (ROOT/'public/config.json').exists():
    (ROOT/'public/config.json').write_text(json.dumps(dict(projectId='',dataset='production',apiVersion='2026-11-06',studioUrl=''),indent=2),encoding='utf-8')
print(f'Prepared {len(products)} products, {len(promotions)} promotions and {len(videos)} videos.')
