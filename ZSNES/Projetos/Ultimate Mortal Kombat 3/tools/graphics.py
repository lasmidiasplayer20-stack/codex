from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
from codec import decode,encode,compress
ROOT=Path(__file__).parent

def tile_decode(chunk,depth=2):
 a=np.zeros((8,8),np.uint8)
 for y in range(8):
  for x in range(8):
   for plane in range(depth):a[y,x]|=((chunk[(plane//2)*16+y*2+(plane%2)]>>(7-x))&1)<<plane
 return a

def tile_encode(a,depth=2):
 out=bytearray(depth*8)
 for y in range(8):
  for x in range(8):
   for plane in range(depth):out[(plane//2)*16+y*2+(plane%2)]|=((int(a[y,x])>>plane)&1)<<(7-x)
 return bytes(out)

def hud_patch(original):
 raw,end=decode(original,0x23eecb);raw=bytearray(raw)
 assert end==0x23f261
 # Validate the complete source asset before changing any pixels.
 import hashlib
 assert hashlib.sha256(raw).hexdigest()=='3bcefadb9f8527ec1cecf347d68a2f9496c517878fffbc4aefd12809d862493f'
 edits=[]
 from PIL import ImageFont
 font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf',9)
 for first,count,text,en in [(0x381,10,'USE START','PRESS START'),(0x38b,5,'VITORIAS','WINS:'),(0x39a,6,'PERIGO','DANGER')]:
  width=count*8;box=font.getbbox(text)
  mask=Image.new('1',(box[2]-box[0],box[3]-box[1]));ImageDraw.Draw(mask).text((-box[0],-box[1]),text,font=font,fill=1)
  mask=mask.resize((min(width-1,mask.width),7),Image.Resampling.NEAREST)
  canvas=np.zeros((8,width),np.uint8);x=(width-mask.width)//2
  ink=np.array(mask,dtype=bool)
  for yy in range(7):
   for xx in range(mask.width):
    if ink[yy,xx]:
     if yy+1<8 and x+xx+1<width:canvas[yy+1,x+xx+1]=1
  canvas[:7,x:x+mask.width][ink]=3
  for i in range(count):
   off=(first+i-0x370)*16;raw[off:off+16]=tile_encode(canvas[:,i*8:i*8+8])
  edits.append({'en':en,'pt_BR':text,'vram_first_tile':hex(first)})
 packed=compress(raw)
 return packed,edits
