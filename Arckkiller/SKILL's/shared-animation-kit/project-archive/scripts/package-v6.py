"""Package only after validation, encoded temporal inspection and player checks."""
from pathlib import Path
import hashlib,json,shutil,zipfile
ROOT=Path(__file__).resolve().parents[1];E=ROOT/'exports';Q=ROOT/'.qa'
rig=json.loads((Q/'tests-v6.json').read_text());player=json.loads((Q/'player-v6.json').read_text());review=json.loads((E/'encoded-review-v6.json').read_text());visual=json.loads((Q/'visual-review-v6.json').read_text())
assert player['passed'] and visual['passed'] and review['all_frames_identical_to_parts']
vals=[json.loads(p.read_text()) for p in E.glob('*.validation.json')];assert len(vals)==7 and all(v['passed'] for v in vals)
for v in vals:
 p=E/v['file'];assert p.stat().st_size==v['bytes'] and hashlib.sha256(p.read_bytes()).hexdigest()==v['sha256']
for src,dst in {'tests-v6.json':'rig-and-continuity-v6.json','player-v6.json':'player-validation-v6.json','story.json':'story-and-events-v6.json','visual-review-v6.json':'visual-review-v6.json','score-result.json':'audio-generation-v6.json'}.items():shutil.copy2(Q/src,E/dst)
(E/'audio-analysis-v6.txt').write_text('FFmpeg EBU R128 — decoded AAC\n'+(Q/'audio-analysis.txt').read_text().split('Summary:')[-1].split('[out#')[0].strip()+'\n')
report=f'''# V6 — história contínua e atuação em tempo próprio

Entrega: **150 segundos, seis partes de 25s, três personagens, 1920×1080, 60fps nativos e 9.000 frames**. Textos visíveis em inglês. As revisões anteriores estão preservadas nas pastas irmãs.

## Mudança de direção

Esta versão reescreve a história em torno de uma entrega: levar o núcleo ao receptor para liberar a saída. Um objeto que cai liga a esteira; a alavanca mal regulada devolve o núcleo ao carrinho; uma frenagem o prende no anel; o resgate permite um segundo lançamento; o mesmo freio causa o susto na ponte. O humor acompanha as tentativas de âmbar e as reações dos amigos. Não há mudança de estação, teleporte de objetos por capítulo ou uso de `TempoV5`. O relógio amostrado é `frame/60`, de 0 a 150s.

## Movimento

A atuação recebe posição, velocidade de deslocamento, pose, direção de olhar e contatos em estado persistente. Há marcha com alternância de apoio, balanço de braços relacionado aos pés, flexão para esforços e aterrissagens, braços estendidos durante viradas e continuidade ao agarrar ou soltar objetos. A interpolação de gestos usa arcos para evitar a passagem abrupta da mão pelo ombro. Mãos no carrinho, no núcleo, nos controles, na alavanca e no resgate são alvos explícitos do IK. O perfil, os comprimentos, o FK e o desenho originais permanecem preservados.

Os testes examinaram **{rig['samples']:,} poses**, em 60 amostras por segundo para cada ator. Erro máximo de comprimento: {rig['maxBoneError']:.2e}; **{rig['contacts']:,} amostras de contato** com erro máximo de {rig['maxContactError']:.2e}. Maior passo do quadril: {rig['maxRootStep']:.2f} unidades/frame; maior passo de cabeça/mãos/pés: {rig['maxJointStep']:.2f}. Nos limites dos capítulos, comparar amostras a ±10µs produziu diferença máxima de {rig['chapterBoundaryMaxDistance']:.4f} unidades, sem reset.

O maior intervalo com movimento agregado do trio abaixo de 1,5 unidade/frame foi {rig['longestQuietSeconds']:.2f}s. Esta medida detecta pausas do conjunto; não prova que toda atuação é natural ou que o filme será percebido como dinâmico. Há reações e pausas de leitura deliberadas. A coreografia é dirigida por curvas e trajetórias balísticas, sem solver geral de corpos rígidos.

## Revisão audiovisual

Os sete MP4 passaram no FFprobe e em decodificação completa. Cada parte tem 1.500 frames; o filme tem 9.000 frames. Hashes dos frames decodificados confirmam que a montagem preserva exatamente a sequência das seis partes. O filme recebe um master contínuo de 150s, sem concatenação de áudio AAC por capítulo.

Foram amostrados **{review['encoded_frames_sampled']} frames codificados**, incluindo os dois lados dos cinco limites de capítulo e nove sequências de movimento com intervalos de 200ms. As folhas `motion-review-01.jpg` a `motion-review-09.jpg` foram examinadas visualmente pelo assistente. São amostras temporais, não inspeção manual de todos os frames. As observações estão em `exports/visual-review-v6.json`.

A trilha é sintetizada, estéreo 48kHz, com música original entre 100 e 120 BPM, {rig['events']} eventos de ação e {rig['footsteps']} passos. Motor e campo magnético têm camadas sustentadas nos períodos em que funcionam. A medição do AAC está em `exports/audio-analysis-v6.txt`. A avaliação sonora nesta execução foi técnica, por timestamps, decodificação e medidores; não houve escuta humana.

O player de vídeo foi verificado em 150s/1920×1080, com seis botões de capítulo, buscas em 25/50/75/100/125/0s e HTTP 206. O player por código produziu o mesmo frame ao retornar ao mesmo instante. Todos os backups têm hashes verificados; FK, perfil, adaptador e funções de desenho foram comparados byte a byte com as fontes preservadas.

## Reproduzir ou editar

Veja `README.md` e `docs/ROTEIRO-V6.md`. O ZIP contém fontes, players, seis partes, filme, trilha AAC, backups essenciais e relatórios. WAVs regeneráveis ficam separados no repositório. `SHA256SUMS-v6.txt` cobre as fontes e entregas; `ZIP-SHA256.txt` cobre o pacote.
'''
(ROOT/'RELATORIO.md').write_text(report)
zip_path=E/'projeto-editavel-v6-com-filme.zip';skip={'SHA256SUMS-v6.txt','ZIP-SHA256.txt',zip_path.name}
def eligible(p):return p.is_file() and not any(x in p.relative_to(ROOT).parts for x in ['node_modules','.qa','__pycache__']) and p.name not in skip
files=sorted(p for p in ROOT.rglob('*') if eligible(p))
(E/'SHA256SUMS-v6.txt').write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+str(p.relative_to(ROOT))+'\n' for p in files))
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(ROOT.rglob('*')):
  if not p.is_file() or any(x in p.relative_to(ROOT).parts for x in ['node_modules','.qa','__pycache__']) or p.name in [zip_path.name,'ZIP-SHA256.txt'] or p.suffix=='.wav':continue
  z.write(p,Path(ROOT.name)/p.relative_to(ROOT))
assert zip_path.stat().st_size<100*1024**2
(E/'ZIP-SHA256.txt').write_text(hashlib.sha256(zip_path.read_bytes()).hexdigest()+'  '+zip_path.name+'\n');print(json.dumps({'zip_bytes':zip_path.stat().st_size,'videos':7,'duration':150,'frames':9000}))
