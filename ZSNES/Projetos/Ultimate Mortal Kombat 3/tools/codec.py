from pathlib import Path

def decode(data,start):
 size=int.from_bytes(data[start:start+2],'little');mode=data[start+2]
 if mode==2:
  z=bytearray();src=start+3
  while True:
   cmd=data[src];src+=1
   if cmd&128:
    dist=(((cmd&7)<<8)|data[src])+1;src+=1;count=((cmd&0x78)>>3)+3
    if dist>len(z):raise ValueError('mode2 reference')
    for _ in range(count):z.append(z[-dist])
   elif cmd&64:
    count=(cmd&63)+1;z+=data[src:src+count][::-1];src+=count
   elif cmd&32:
    count=(cmd&31)+3;value=data[src];src+=1
    z+=bytes((value-i)&255 for i in range(count))
   else:
    count=cmd&31
    if not count:break
    count+=2;z+=bytes([data[src]])*count;src+=1
   if len(z)>size or src-start>size*3+100:raise ValueError('mode2 bounds')
  if len(z)!=size:raise ValueError('mode2 size')
  raw=bytearray(size);half=size//2;raw[1::2]=z[:half][::-1];raw[0::2]=z[half:][::-1]
  return bytes(raw),src
 size=int.from_bytes(data[start:start+2],'little');mode=data[start+2]
 if mode not in (0,1) or not 1<=size<=65535:raise ValueError('header')
 out=bytearray(size);pos=size;src=start+3
 for _ in range(size*2+16):
  cmd=data[src];src+=1
  if cmd&128:
   dist=(((cmd&7)<<8)|data[src])+1;src+=1;n=((cmd&0x78)>>3)+3
   if pos-n<0 or pos-n+dist+n>len(out):raise ValueError(('lz bounds',hex(src-2),pos,dist,n,size))
   pos-=n
   for i in range(n-1,-1,-1):out[pos+i]=out[pos+i+dist]
  elif cmd&64:
   n=(cmd&63)+1
   if pos<n:raise ValueError('literal bounds')
   pos-=n;out[pos:pos+n]=data[src:src+n];src+=n
  elif not (cmd&32):
   n=cmd&31
   if n==0:
    if pos:raise ValueError(('early end',pos))
    return bytes(out[:size]),src
   n+=2;value=data[src];src+=1
   if pos<n:raise ValueError('rle bounds')
   pos-=n;out[pos:pos+n]=bytes([value])*n
  else:
   dist=(cmd&31)+1
   if pos<1 or pos-1+dist>=len(out):raise ValueError(('one bounds',hex(src-1),pos,dist,size))
   pos-=1;out[pos]=out[pos+dist]
  if src-start>size*3+100:raise ValueError('stream bounds')
 raise ValueError('unterminated')

def encode(raw):
 # Literal-only encoding is deterministic and uses the same reverse-output format.
 raw=bytes(raw);out=bytearray(len(raw).to_bytes(2,'little')+b'\x00');pos=len(raw)
 while pos:
  n=min(pos,64);out.append(0x40+n-1);out+=raw[pos-n:pos];pos-=n
 out.append(0x00)
 assert decode(out,0)[0]==raw
 return bytes(out)


def compress(raw,mode=1):
 raw=bytes(raw);z=(raw[1::2][::-1]+raw[0::2][::-1]) if mode==2 else raw[::-1];n=len(z);dp=[10**9]*(n+1);choice=[None]*(n+1);dp[n]=0
 triples={}
 candidates=[[] for _ in z]
 for i in range(n):
  key=z[i:i+3]
  if len(key)==3:
   candidates[i]=[i-p for p in triples.get(key,[]) if 2<=i-p<=2048]
   triples.setdefault(key,[]).append(i)
 for i in range(n-1,-1,-1):
  def offer(length,token):
   v=len(token)+dp[i+length]
   if v<dp[i]:dp[i]=v;choice[i]=(length,token)
  for count in range(1,min(64,n-i)+1):offer(count,bytes([0x40+count-1])+z[i:i+count][::-1])
  if mode!=2:
   for d in range(1,min(32,i)+1):
    if z[i]==z[i-d]:offer(1,bytes([0x20+d-1]));break
  else:
   for count in range(3,min(34,n-i)+1):
    if all(z[i+j]==((z[i]-j)&255) for j in range(count)):offer(count,bytes([0x20+count-3,z[i]]))
    else:break
  for count in range(3,min(33,n-i)+1):
   if z[i:i+count]==bytes([z[i]])*count:offer(count,bytes([count-2,z[i]]))
   else:break
  for d in candidates[i]:
   match=3
   while match<min(18,n-i) and z[i+match]==z[i+match-d]:match+=1
   for count in range(3,match+1):offer(count,bytes([0x80|((count-3)<<3)|((d-1)>>8),(d-1)&255]))
 out=bytearray(n.to_bytes(2,'little')+bytes([mode]));i=0
 while i<n:
  length,token=choice[i];out+=token;i+=length
 out.append(0)
 assert decode(out,0)[0]==raw
 return bytes(out)
