# Contrato dos personagens

Fonte original: `lasmidiasplayer20-stack/codex`, commit `1c6dce3d232179e41629414db70513dc69205853`, pasta `videos/animation-vs-physics/revisions/v6-historia-continua-150s-1080p60`.

Preserve byte a byte `src/model.js`, `src/math.js`, `src/rig-adapter.js`, `src/legacy-renderer.js` e `vendor/rig-controller.js` ao reutilizar os mesmos bonecos. Os hashes estão em `assets/button-r4/qa/character-provenance.json`. Os nomes desses arquivos representam implementações distintas, não instruções para substituir a referência.

| Recurso | Valor/base |
| --- | --- |
| Escala | `MODEL_UNIT = 0.72` |
| Raio da cabeça | 27.4 unidades de modelo; 19.728 no mundo |
| Tronco / pescoço | 61.65 / 30.14, antes da escala |
| Braços | 35.62 + 35.62, antes da escala |
| Pernas | 57 + 57, antes da escala |
| Hierarquia | `[-1,0,1,1,3,1,5,0,7,0,9]` |
| Juntas | quadril, ombro, cabeça, cotovelo/mão esquerda, cotovelo/mão direita, joelho/pé esquerdo, joelho/pé direito |
| Personagens de exemplo | hero (cabeça vazada), cyan e amber (cabeças preenchidas) |
| Construção | IK de dois elos gera registros; FK original reconstrói os bones com comprimentos fixos |
| Passo de atuação/física | 120 Hz; exportação demonstrativa a 60fps |

`FILM_DATA` fornece dimensões, duração, elenco e tracks; `RigAdapter.record` converte poses em ângulos desenrolados; `ElasticRig.at` interpola e reconstrói o esqueleto; `LegacyActor.draw` desenha os membros curvos e a cabeça original. Não desenhe outro stickman por cima para esconder um rig errado.

A pose base e o perfil não são uma coreografia pronta para qualquer história. Mude trajetórias, alvos, apoios e gestos de acordo com o novo roteiro. Para mudar quantidade/nomes de personagens, atualize elenco, tracks, bindings, testes e enquadramentos juntos. Para um novo visual autorizado, crie uma variante de perfil/desenho separada e mantenha a base preservada.
