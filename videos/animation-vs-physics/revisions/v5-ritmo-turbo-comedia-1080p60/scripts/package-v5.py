"""Package V5 after exact export checks, temporal review and player verification."""
from pathlib import Path
import json,hashlib,shutil,zipfile
ROOT=Path(__file__).resolve().parents[1];E=ROOT/'exports'
rig=json.loads((ROOT/'.qa/tests-v5.json').read_text());baseline=json.loads((ROOT/'.qa/baseline-v4.json').read_text());review=json.loads((E/'revisao-codificada-v5.json').read_text());player=json.loads((ROOT/'.qa/player-v5.json').read_text());visual=json.loads((ROOT/'.qa/visual-review-v5.json').read_text());assert player['passed'] and visual['passed'] and review['all_frames_identical_to_parts']
vals=[json.loads(p.read_text()) for p in sorted(E.glob('*.validation.json'))];assert len(vals)==7 and all(v['passed'] for v in vals)
comparison={'baseline':baseline,'v5':{k:rig[k] for k in ['duration','frames','meanJointSpeed','activeFraction','longestQuietSeconds']},'mean_joint_speed_ratio':rig['meanJointSpeed']/baseline['meanJointSpeed'],'duration_reduction_percent':48,'new_gag_seconds':26.4,'new_gag_events':36,'note':'World-space joint displacement is an objective motion/quiet measure, not a guarantee of perceived humor. Both versions measured at 60Hz, scene discontinuities excluded.'}
(E/'comparacao-ritmo-v4-v5.json').write_text(json.dumps(comparison,indent=2)+'\n')
for src,dst in {'tests-v5.json':'validacao-rig-e-ritmo-v5.json','player-v5.json':'validacao-player-v5.json','story.json':'eventos-e-coreografia-v5.json','visual-review-v5.json':'revisao-visual-v5.json'}.items():shutil.copy2(ROOT/'.qa'/src,E/dst)
(E/'audio-medicao-v5.txt').write_text('\n'.join(line.rstrip() for line in (ROOT/'.qa/audio-analysis.txt').read_text().split('Summary:')[-1].splitlines())+'\n')
report=f'''# V5 — ritmo rápido e situações cômicas

Entrega: **78 segundos, seis partes de 13s, três personagens, 1920×1080, 60 fps nativos e 4.680 frames**. Todos os textos visíveis no vídeo e nos players estão em inglês. A V4 permanece na pasta irmã.

## Resposta à crítica de ritmo

A V4 tinha 150s; esta versão tem 78s, uma redução de 48%, apesar de acrescentar 26,4s de coreografias novas. O timing das ações principais foi refeito com um mapa de tempo; os seis blocos foram renderizados novamente por código. Não se acelerou o vídeo antigo. Não há fades demorados entre capítulos. As pausas são curtas e servem à preparação e à reação das piadas.

A comparação a 60 Hz mede o deslocamento médio do quadril, cabeça, mãos e pés dos três personagens, excluindo saltos de cena. V4: {baseline['meanJointSpeed']:.2f} unidades/s. V5: {rig['meanJointSpeed']:.2f} unidades/s — **{comparison['mean_joint_speed_ratio']:.2f}×**. A fração do filme acima do limiar de movimento de 20 unidades/s subiu de {baseline['activeFraction']*100:.1f}% para {rig['activeFraction']*100:.1f}%. O maior trecho abaixo desse limiar caiu de {baseline['longestQuietSeconds']:.2f}s para **{rig['longestQuietSeconds']:.2f}s**. Essas medidas ajudam a detectar lentidão; não substituem a avaliação subjetiva de quem assiste.

## Novas situações

1. **Don't touch that!** — luva com mola, esquiva do ciano, voo do âmbar e retorno da esfera para atrapalhar o preto.
2. **Wrong way up** — gangorra causa lançamentos duplos; preto e âmbar giram e aterrissam em sequência.
3. **No brakes!** — o cubo ganha rodas, dispara e inverte; ciano tenta se equilibrar na carga e os outros correm ou saltam para escapar.
4. **Zero gravity, big sneeze** — espirro lança o trio, tensiona o cabo e provoca reações com mola e aterrissagens escalonadas.
5. **Multiball trouble** — três bolas circulam pelo grupo, gerando esquivas e um impacto final.
6. **Perfectly normal.** — a comemoração é interrompida por um pato de borracha na cabeça do preto, com tentativas de se livrar dele, reações dos colegas e quack final.

Há **36 eventos cômicos novos**, {rig['totalEvents']} eventos sonoros no total e música original entre 152 e 178 BPM. Impactos, motor, catraca, espirro, quique, borracha e quack são sintetizados. Medição do AAC: −16,1 LUFS, LRA 3,0 LU e pico real −1,3 dBFS. A verificação sonora foi por eventos e medidores; não houve avaliação auditiva humana nesta execução.

## Movimento e revisão temporal

`npm test` passou: {rig['frames']*3} poses a 60 Hz, coordenadas finitas, erro máximo de comprimento de {rig['maxBoneError']:.2e} unidades e {rig['contacts']} amostras de contato com erro máximo de {rig['maxContactError']:.2e}. Maior deslocamento do quadril entre frames dentro da estação: {rig['maxRootStep']:.2f} unidades. Maior variação angular medida: {rig['maxAngleStep']:.2f}°. Os gestos muito rápidos recebem um acompanhamento angular de 33ms nos braços, preservando os trechos de contato. Os nós e comprimentos originais permanecem fixos.

Foram revistos **{review['encoded_frames_reviewed']} frames decodificados**, os dois lados dos cortes e seis sequências densas de piada. `sequencia-comica-0*.jpg` documenta preparação, impulso e reação em intervalos curtos. Houve também uma prévia em 960×540/60fps para estudar o timing da primeira piada. As folhas foram examinadas visualmente pelo assistente; isso é revisão por amostragem, não inspeção manual de todos os frames.

O player MP4 passou em 78s/1080p, seis capítulos, seis buscas no tempo e HTTP 206. Os sete MP4 passaram no FFprobe e em decodificação completa. As partes têm 780 frames/13s; o filme tem 4.680 frames/78s. Os hashes de **todos os frames** confirmam que a montagem preserva a sequência exata das seis partes. O som do filme usa um master contínuo.

## Arquivos e limites

O ZIP inclui fontes, player, trilha AAC, seis partes, filme completo, backups essenciais e relatórios. WAVs regeneráveis ficam separados no repositório. Há SHA-256 por arquivo e hash do ZIP. O FK, o perfil e as funções originais de desenho foram comparados byte a byte; os backups da V3 e da V4 têm hashes preservados.

As ações fantásticas são coreografadas por tempo absoluto, com IK/FK e cenário geométrico; não é um solver geral de corpos rígidos. As estações mudam por cortes explícitos. Os textos de edição estão em português; os textos que aparecem nos players e no vídeo estão em inglês.
'''
(ROOT/'RELATORIO.md').write_text(report)
zip_path=E/'projeto-editavel-v5-com-filme.zip';excluded={'SHA256SUMS-v5.txt','ZIP-SHA256.txt',zip_path.name}
files=[p for p in ROOT.rglob('*') if p.is_file() and not any(x in p.relative_to(ROOT).parts for x in ['node_modules','.qa','__pycache__']) and p.name not in excluded]
(E/'SHA256SUMS-v5.txt').write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+str(p.relative_to(ROOT))+'\n' for p in sorted(files)))
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(ROOT.rglob('*')):
  if not p.is_file() or any(x in p.relative_to(ROOT).parts for x in ['node_modules','.qa','__pycache__']) or p.name in [zip_path.name,'ZIP-SHA256.txt'] or p.suffix=='.wav':continue
  z.write(p,Path(ROOT.name)/p.relative_to(ROOT))
assert zip_path.stat().st_size<100*1024**2
(E/'ZIP-SHA256.txt').write_text(hashlib.sha256(zip_path.read_bytes()).hexdigest()+'  '+zip_path.name+'\n');print(json.dumps({'zip_bytes':zip_path.stat().st_size,'videos':7,'duration':78,'frames':4680,'joint_speed_ratio':comparison['mean_joint_speed_ratio']}))
