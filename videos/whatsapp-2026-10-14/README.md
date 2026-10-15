# Vídeo de 14/10 — reconstrução por código, em cinco partes

Referência: **WhatsApp Video 2026-10-14 at 10.28.28.mp4**, 1:34,60.

## Primeira prévia

**Parte 01 — abertura e primeira luta, 0:00–0:15,05.** **Revisão R2 para revisão**, com a marca de corte no rosto após o golpe.

- [Prévia leve, MP4 720p / 60 fps](https://raw.githubusercontent.com/lasmidiasplayer20-stack/codex/video-2026-10-14-em-partes-e5fc9397/videos/whatsapp-2026-10-14/exports/parte-01-previa-r2-720p60.mp4)
- [Prévia 1080p / 60 fps](https://raw.githubusercontent.com/lasmidiasplayer20-stack/codex/video-2026-10-14-em-partes-e5fc9397/videos/whatsapp-2026-10-14/exports/parte-01-previa-r2-1080p60.mp4)
- [Código desta etapa em ZIP](https://raw.githubusercontent.com/lasmidiasplayer20-stack/codex/video-2026-10-14-em-partes-e5fc9397/videos/whatsapp-2026-10-14/exports/codigo-parte-01-r2.zip)

Os MP4s ficam em `exports/`. As partes 01 e 02 têm prévias; 03 a 05 continuam em produção.

## Segunda prévia

**Parte 02 — médico, exame e confronto, 0:15,05–0:44.**

- [MP4 720p / 60 fps](https://raw.githubusercontent.com/lasmidiasplayer20-stack/codex/video-2026-10-14-em-partes-e5fc9397/videos/whatsapp-2026-10-14/exports/parte-02-previa-r1-720p60.mp4)
- [MP4 1080p / 60 fps](https://raw.githubusercontent.com/lasmidiasplayer20-stack/codex/video-2026-10-14-em-partes-e5fc9397/videos/whatsapp-2026-10-14/exports/parte-02-previa-r1-1080p60.mp4)
- [Código das partes prontas em ZIP](https://raw.githubusercontent.com/lasmidiasplayer20-stack/codex/video-2026-10-14-em-partes-e5fc9397/videos/whatsapp-2026-10-14/exports/codigo-parte-02-r1.zip)

Inclui a entrada, o desequilíbrio e a pausa sentado, o exame com um dispositivo de luz, os closes, o feixe e a reação do verde. É uma reconstrução dirigida, com diferenças visuais e de poses em relação à referência.

## Sequência de trabalho

| Parte | Intervalo da referência | Conteúdo | Estado |
|---|---|---|---|
| 01 | 0:00–0:15,05 | Abertura, saída da cama, espada, bloqueio, desarme e salto | Prévia R2 para revisão |
| 02 | 0:15,05–0:44 | Médico, exame e confronto | Prévia R1 para revisão |
| 03 | 0:44–1:02,08 | Retorno do vermelho e golpes | Planejada |
| 04 | 1:02,08–1:21,75 | Luta em close e movimentos da câmera | Planejada |
| 05 | 1:21,75–1:34,60 | Chegada do azul e desfecho | Planejada |

Cada etapa terá um MP4 próprio. A montagem final será feita depois da revisão das partes. Os intervalos são contíguos e cobrem a referência inteira.

## Método e limites

Os personagens são modelos próprios: pelvis, pescoço, tronco, braços e pernas com proporções fixas; poses e trajetórias de mãos e pés são dirigidas por keyframes escritos manualmente. A câmera transforma a cena inteira. Membros com curvas e pontas arredondadas dão a aparência mais grossa e flexível.

O original foi consultado em sequências de quadros para entender as ações. O renderizador **não carrega o vídeo original, imagens de seus quadros, silhuetas vetorizadas, máscaras ou dados de optical flow**. Textura, cama, paciente, espada, cenário e efeitos são desenhados por código. A trilha da referência é usada nas prévias.

Esta R2 é uma aproximação dirigida, com diferenças no cenário, desenho e algumas poses. Os testes de contato e proporções verificam defeitos técnicos; **não demonstram que a animação está visualmente perfeita**. O MP4 precisa ser revisado como movimento.

## Estrutura reutilizável

```text
core/                    rig, desenho e player compartilhados
vendor/                  Motion e licença
parts/manifest.json      intervalos e estado das cinco partes
parts/01-.../            coreografia e trilha da primeira parte
parts/02-.../            coreografia, cenário clínico e trilha
parts/03-.../ a 05-.../  roteiro das próximas partes
exports/                 prévias, ZIP e relatórios
scripts/                 inspeção e validação
```

## Execução em um ambiente de desenvolvimento

Requisitos: Node 22+, Python 3, FFmpeg/FFprobe e Chromium. A geração visual usa Canvas 2D e as funções de interpolação do Motion. Não exige GPU.

```bash
npm ci
npx playwright install chromium
npm run inspect
npm run render
```

Se `/usr/bin/chromium` estiver disponível, os scripts usam esse navegador. Caso contrário, usam o Chromium instalado pelo Playwright. `CHROMIUM_PATH` permite escolher outra instalação. O MP4 padrão sai em `exports/parte-01-render-1080p60.mp4`.

Exporte apenas um intervalo para revisar uma correção rápida:

```bash
node render.mjs --start 9.8 --duration 3.4 --width 1280 --output exports/estudo-golpes.mp4
```

O arquivo de referência completo não está no pacote. A versão da biblioteca Motion vendorizada foi reaproveitada do projeto anterior; sua licença está em `vendor/MOTION-LICENSE.md`.

## Histórico da primeira parte

R2 acrescenta a marca do corte no rosto do laranja. Os movimentos da R1 foram preservados. A mudança foi conferida nos quadros antes e depois do golpe.

[Prévia R1 anterior](https://raw.githubusercontent.com/lasmidiasplayer20-stack/codex/cf1b648c92a447cacecbe4c699bdb1fbda224286/videos/whatsapp-2026-10-14/exports/parte-01-previa-r1-720p60.mp4).
