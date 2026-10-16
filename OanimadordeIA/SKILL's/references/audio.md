# Áudio e ElevenLabs

A biblioteca incluída contém 17 MP3s com provider, modelo, prompt, commit de origem e SHA256 em `audio/elevenlabs/manifest.json`. A R4 usa 11 deles em 144 eventos e três camadas adicionais de gravidade; esses números são históricos e não metas para um novo filme.

Use o mapa de eventos da nova animação. Alinhe passos ao apoio real, cliques à ação do botão, impactos à colisão e esforço da corda ao tensionamento. Não reutilize timestamps da V6 ou R4 em outra história.

`score.py` demonstra mistura estéreo, pan por posição, música procedural, trim de silêncio inicial, fades, camadas e masterização. Os utilitários do projeto gerado retiram janelas de mecanismo/silêncio específicas da R4; acrescente as janelas do novo roteiro conscientemente.

Para novos efeitos ElevenLabs, use apenas credenciais existentes e autorização do pedido. Guarde o segredo em uma variável segura (`ELEVENLABS_API_KEY`) ou binding da plataforma, nunca em arquivo do projeto, log, prompt, manifesto ou ZIP. Verifique primeiro as bibliotecas já disponíveis. Se houver falha de rede/autenticação/cota, registre a causa real e continue com os sons existentes quando permitido. Não descreva erro de proxy como chave inválida nem reutilização como geração nova. A skill não inclui uma chave nem garante acesso futuro à API.

No master, evite clipping e descontinuidades de AAC entre partes. Junte primeiro o vídeo e aplique uma faixa contínua. Confira loudness/picos e sincronização em sequências; diferencie medição técnica de audição humana.
