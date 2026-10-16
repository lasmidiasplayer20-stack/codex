"""Offline 2D pose capture: named rig landmarks, never silhouettes or images.

Fits a fixed bone vocabulary to the source's thin stick figure using a medial
graph. Only hips, shoulders, elbows, wrists, knees, feet and head are exported.
"""
import argparse,heapq,json,math,hashlib
from pathlib import Path
import cv2
import numpy as np

cv2.setNumThreads(2)

def thin(mask):
    a=np.pad((mask>0).astype(np.uint8),1)
    for _ in range(100):
        total=0
        for phase in range(2):
            p2=a[:-2,1:-1];p3=a[:-2,2:];p4=a[1:-1,2:];p5=a[2:,2:];p6=a[2:,1:-1];p7=a[2:,:-2];p8=a[1:-1,:-2];p9=a[:-2,:-2]
            seq=[p2,p3,p4,p5,p6,p7,p8,p9,p2]
            n=sum(seq[:-1]);trans=sum((seq[i]==0)&(seq[i+1]==1) for i in range(8))
            if phase==0:extra=(p2*p4*p6==0)&(p4*p6*p8==0)
            else:extra=(p2*p4*p8==0)&(p2*p6*p8==0)
            remove=(a[1:-1,1:-1]>0)&(n>=2)&(n<=6)&(trans==1)&extra
            total+=int(remove.sum());a[1:-1,1:-1][remove]=0
        if total==0:break
    return a[1:-1,1:-1]

def graph_pose(mask,head,r,offset,previous=None,ship=False,wave=False):
    # Closed vehicle shapes create graph cycles; stop below the foot deck.
    if ship:
        ys,xs=np.where(mask>0)
        if len(ys):mask[int(np.percentile(ys,99)-r*.4):]=0
    sk=thin(mask);ys,xs=np.where(sk>0)
    if len(xs)<15:return None
    coords=np.column_stack([xs+offset[0],ys+offset[1]]).astype(float)
    index={(int(x),int(y)):i for i,(x,y) in enumerate(zip(xs,ys))}
    adj=[[] for _ in coords]
    for i,(x,y) in enumerate(zip(xs,ys)):
        for dx,dy in [(1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)]:
            j=index.get((int(x+dx),int(y+dy)))
            if j is not None:
                # Avoid diagonal shortcuts where an orthogonal connection exists.
                if dx and dy and ((int(x+dx),int(y)) in index or (int(x),int(y+dy)) in index):continue
                adj[i].append((j,math.hypot(dx,dy)))
    root=int(np.argmin(np.linalg.norm(coords-np.array(head),axis=1)))
    dist=np.full(len(coords),np.inf);dist[root]=0;parent=np.full(len(coords),-1,dtype=int);queue=[(0.,root)]
    while queue:
        d,i=heapq.heappop(queue)
        if d>dist[i]:continue
        for j,w in adj[i]:
            if d+w<dist[j]:dist[j]=d+w;parent[j]=i;heapq.heappush(queue,(d+w,j))
    ends=[i for i,a in enumerate(adj) if len(a)==1 and np.isfinite(dist[i]) and dist[i]>r*1.4]
    # Trim small skeleton hairs and merge neighboring endpoints.
    ends=sorted(ends,key=lambda i:dist[i],reverse=True)
    keep=[]
    for i in ends:
        if all(np.linalg.norm(coords[i]-coords[j])>r*.65 for j in keep):keep.append(i)
    ends=keep[:8]
    if len(ends)<2:return None
    def path(i):
        p=[]
        while i!=-1:p.append(i);i=parent[i]
        return p[::-1]
    paths={i:path(i) for i in ends}
    feet=ends[:2]
    if wave:
        trailing=[i for i in ends if coords[i][0]<head[0]-r*.2 and np.linalg.norm(coords[i]-head)>r*3]
        if len(trailing)>=2:feet=trailing[:2]
    def common(pa,pb):
        same=[]
        for a,b in zip(pa,pb):
            if a!=b:break
            same.append(a)
        return same
    shared=common(paths[feet[0]],paths[feet[1]])
    # Hip is the leg fork, with a geodesic anatomy constraint for crossings.
    hip_id=shared[-1]
    if not r*2.8<dist[hip_id]<r*5.4:
        hip_id=min(paths[feet[0]],key=lambda i:abs(dist[i]-r*3.9))
    hands=[i for i in ends if i not in feet and r*1.4<dist[i]<r*7.3]
    if len(hands)>=2:
        # Prefer paths branching before the hip, not board edges or leg hairs.
        hands=sorted(hands,key=lambda i:abs(dist[common(paths[i],paths[feet[0]])[-1]]-r*1.8))[:2]
        arm_shared=common(paths[hands[0]],paths[hands[1]])
        shoulder_id=arm_shared[-1]
        if not r*.9<dist[shoulder_id]<r*3.1:shoulder_id=min(paths[feet[0]],key=lambda i:abs(dist[i]-r*1.6))
    else:shoulder_id=min(paths[feet[0]],key=lambda i:abs(dist[i]-r*1.6))
    if wave:shoulder_id=min(paths[feet[0]],key=lambda i:abs(dist[i]-r*1.3))
    hip=coords[hip_id];shoulder=coords[shoulder_id]
    def limb(endpoint,joint):
        p=paths[endpoint]
        # Locate the start nearest its named attachment, then the actual bend.
        start=min(range(len(p)),key=lambda k:np.linalg.norm(coords[p[k]]-joint))
        seg=p[start:]
        if len(seg)<3:return [joint.tolist(),coords[endpoint].tolist()]
        arclength=dist[seg]-dist[seg[0]];length=arclength[-1]
        # Choose a bend that approximates both straight bone segments well.
        best=None
        for k in range(1,len(seg)-1):
            if not .25<arclength[k]/max(length,.01)<.75:continue
            bend=coords[seg[k]];end=coords[endpoint]
            def line_error(points,a,b):
                v=b-a;den=np.linalg.norm(v)+1e-5
                return np.mean(np.abs((v[0]*(points-a)[:,1]-v[1]*(points-a)[:,0]))/den)
            cost=line_error(coords[seg[:k+1]],joint,bend)+line_error(coords[seg[k:]],bend,end)+abs(arclength[k]/max(length,.01)-.5)*.12
            if best is None or cost<best[0]:best=(cost,bend)
        bend=best[1] if best else coords[seg[np.argmin(abs(arclength-length*.5))]]
        return[bend.tolist(),coords[endpoint].tolist()]
    legs=[limb(i,hip) for i in feet]
    arms=[limb(i,shoulder) for i in hands[:2]]
    # Missing/occluded wrists are completed by the previous pose, not a new gait.
    torso=hip-shoulder;angle=math.atan2(torso[1],torso[0])-math.pi/2
    basis=np.array([[math.cos(angle),-math.sin(angle)],[math.sin(angle),math.cos(angle)]])
    while len(arms)<2:
        side=len(arms);sign=-1 if side==0 else 1
        if previous:
            old_basis=np.array([[math.cos(previous['angle']),-math.sin(previous['angle'])],[math.sin(previous['angle']),math.cos(previous['angle'])]])
            rel=[old_basis.T@(np.array(j)-np.array(previous['shoulder']))/previous['r'] for j in previous['arms'][side]]
            arms.append([(shoulder+basis@(j*r)).tolist() for j in rel])
        else:arms.append([(shoulder+basis@np.array([sign*r*.6,r*1.6])).tolist(),(shoulder+basis@np.array([sign*r*.45,r*3.0])).tolist()])
    # Left/right identities are temporally assigned, avoiding limb swaps.
    def order(limbs,name):
        if previous:
            cost=lambda seq:sum(np.linalg.norm(np.array(seq[i][1])-np.array(previous[name][i][1])) for i in range(2))
            return limbs if cost(limbs)<=cost(limbs[::-1]) else limbs[::-1]
        return sorted(limbs,key=lambda l:l[1][0])
    legs=order(legs,'legs');arms=order(arms,'arms')
    lengths=[np.linalg.norm(np.array(leg[0])-hip)+np.linalg.norm(np.array(leg[1])-np.array(leg[0])) for leg in legs]
    if np.linalg.norm(hip-np.array(head))>r*7 or any(l>r*9 or l<r*1.5 for l in lengths):return None
    return {'head':head,'r':r,'hip':hip.tolist(),'shoulder':shoulder.tolist(),'legs':legs,'arms':arms,'angle':angle,'graphEnds':len(ends)}

def main():
    p=argparse.ArgumentParser();p.add_argument('video');p.add_argument('--controls',required=True);p.add_argument('--output',required=True);p.add_argument('--samples',action='store_true');p.add_argument('--start',type=float,default=0);p.add_argument('--wave-only',action='store_true');a=p.parse_args()
    controls=json.loads(Path(a.controls).read_text());fps=controls['fps'];cap=cv2.VideoCapture(a.video);output=[];previous=None;cache={}
    ship=lambda t:29.5<t<37.8 or 41.336<t<42.75 or 63.2<t<72.74
    tests=[2,4,6,8,9.6,10.2,10.45,13,13.6,14,18,21.6,24,30,32,34,36,44,50,55,66,70,74,84,93.6,94,95,100,112,116,124,129,138]
    indices=set(round(t*fps) for t in tests)
    for i,control in enumerate(controls['frames']):
        if not a.samples and i%300==0:print('Frame',i,flush=True)
        ok,frame=cap.read()
        if not ok:break
        if i/fps<a.start or not control or (a.samples and i not in indices):continue
        if a.wave_only and not control.get('wave'):continue
        t=i/fps;head=control['head'];r=control['radius'];bx,by,bw,bh=control['bbox']
        x0=max(0,int(min(bx,head[0]-r*9))-8);y0=max(0,int(min(by,head[1]-r*9))-8)
        x1=min(848,int(max(bx+bw,head[0]+r*9))+8);y1=min(478,int(max(by+bh,head[1]+r*10))+8)
        crop=frame[y0:y1,x0:x1];hsv=cv2.cvtColor(crop,cv2.COLOR_BGR2HSV)
        wave=bool(control.get('wave'));mask=cv2.inRange(hsv,np.array([42 if wave else 35,145,70]),np.array([54 if wave else 52,255,255 if wave else 228]))
        b,g,red=cv2.split(crop);delta=(red.astype(float)-95)**2+(g.astype(float)-182)**2+b.astype(float)**2
        mask[(b>(100 if wave else 55))|(g<red*1.22)]=0
        if wave:
            hx=int(np.clip(head[0]-x0,0,crop.shape[1]-1));hy=int(np.clip(head[1]-y0,0,crop.shape[0]-1))
            color=np.median(crop[max(0,hy-2):hy+3,max(0,hx-2):hx+3].reshape(-1,3),axis=0)
            delta_head=((crop.astype(float)-color)**2).sum(axis=2)
            mask[(delta_head>68**2)|(g<color[1]*.62)]=0
        if control["menu"]:mask[delta>45**2]=0
        if control["finish"]:
            cutoff=(404 if t>=135.65 else int(control.get('footer',405)))-y0
            mask[max(0,cutoff):]=0;mask[:max(0,int(head[1]-r*2)-y0)]=0
            mask[:,:max(0,164-x0)]=0;mask[:,max(0,350-x0):]=0
        mask=cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((3,3),np.uint8))
        n,labels,stats,_=cv2.connectedComponentsWithStats(mask)
        hx=int(head[0]-x0);hy=int(head[1]-y0)
        label=labels[min(mask.shape[0]-1,max(0,hy)),min(mask.shape[1]-1,max(0,hx))]
        if not label:continue
        selected=(labels==label).astype(np.uint8)*255
        key=(tuple(head),round(r,2),x0,y0,ship(t),hashlib.blake2b(selected.tobytes(),digest_size=12).digest())
        if key in cache:pose=json.loads(json.dumps(cache[key]))
        else:
            pose=graph_pose(selected,head,r,[x0,y0],previous,ship=ship(t),wave=wave);cache[key]=pose
        if pose:
            pose['t']=round(t,5);output.append(pose);previous=pose
        if i%300==0:print('Pose capture',i,flush=True)
        if a.samples:
            overlay=frame.copy()
            if pose:
                def drawline(points,color):cv2.polylines(overlay,[np.rint(points).astype(np.int32)],False,color,2,cv2.LINE_AA)
                drawline([head,pose['shoulder'],pose['hip']],(255,240,255))
                for leg in pose['legs']:drawline([pose['hip'],*leg],(0,200,255))
                for arm in pose['arms']:drawline([pose['shoulder'],*arm],(255,100,0))
            out=Path(a.output).parent;out.mkdir(parents=True,exist_ok=True);cv2.imwrite(str(out/f'pose-{t:.2f}.png'),overlay)
    cap.release();Path(a.output).write_text(json.dumps({'fps':fps,'poses':output,'method':'Named-joint motion capture. No silhouette paths or source pixel assets.'},separators=(',',':')))
    print(json.dumps({'captured':len(output),'bytes':Path(a.output).stat().st_size}))

if __name__=='__main__':main()
