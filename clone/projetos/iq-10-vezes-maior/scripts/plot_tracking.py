#!/usr/bin/env python3
import csv,gzip,json,os,tempfile
from pathlib import Path
import numpy as np
os.environ.setdefault('MPLCONFIGDIR',str(Path(tempfile.gettempdir())/'iq-tracking-mpl'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
root=Path(__file__).resolve().parents[1];out=root/'tracking';rows=list(csv.DictReader(gzip.open(out/'camera.csv.gz','rt')));t=np.array([float(r['seconds'])for r in rows]);confidence=np.array([float(r['confidence'])for r in rows]);speed=np.array([np.hypot(float(r['tx']),float(r['ty']))if r['tx']else np.nan for r in rows]);effects=json.loads((out/'effects.json').read_text());audio=np.array([r['t']for r in effects['audioOnsets']]);lum=np.array([abs(r['change'])for r in effects['visualObservations']]);lt=np.array([r['time']for r in effects['visualObservations']]);fig,ax=plt.subplots(3,1,figsize=(12,6.5),sharex=True,layout='constrained');fig.suptitle('Rastreamento do original: 15.759 quadros / 525,3 s',x=.08,ha='left',fontsize=16)
ax[0].plot(t,confidence,color='#4b6f87',lw=.6);ax[0].set_ylabel('Confiança\nda câmera 2D');ax[0].set_ylim(0,1.03)
ax[1].plot(t,np.minimum(speed,100),color='#aa7b53',lw=.6);ax[1].set_ylabel('Translação afim\npx/quadro (até 100)')
ax[2].hist(audio,bins=np.arange(0,527,2),color='#779677');ax[2].set_ylabel('Ataques de áudio\nnão classificados / 2 s');ax[2].set_xlabel('Tempo no original (s)')
for a in ax:a.axvspan(0,60,color='#e5cf99',alpha=.35);a.grid(alpha=.15);a.spines[['top','right']].set_visible(False)
ax[0].text(65,.93,'Faixa amarela: primeiro minuto com revisão editorial',fontsize=9);ax[-1].set_xlim(0,525.3);fig.savefig(out/'visao-geral.png',dpi=140);plt.close(fig)
