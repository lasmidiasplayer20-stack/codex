# Regras deste projeto

- Leia `README.md`, `docs/LEIA_PRIMEIRO.md`, `docs/SKILL.md` e os dois roteiros antes de alterar a história.
- Preserve os bonecos existentes. Não substitua nem sobrescreva `preserved/`, `vendor/rig-controller.js`, o perfil original ou as quatro funções originais em `src/legacy-renderer.js` sem autorização explícita do usuário.
- Antes de modificar componentes existentes, preserve uma cópia e seus hashes. Os commits e os backups desta entrega documentam as versões originais. Prefira módulos novos para novos recursos.
- Física e coreografia alimentam o FK original. Não capture, trace ou masque filmagens para substituir o personagem programado.
- Mantenha 25 takes, 125 s, 24 fps, 1920×1080 e 3000 frames nesta história. Use estado persistente; o reset em 115 s é um corte explícito.
- Rode `npm test` e valide cada MP4 com `scripts/validate-export.py`. Após mudanças visuais, renderize e reveja os frames/transições antes de afirmar conclusão.
- Use arquivos de exportação com nomes de revisão para preservar entregas anteriores. Execute trabalhos pesados na nuvem; nada deve ser instalado automaticamente no computador do usuário.
- As origens de imagem do renderer são formas e o rig por código. Áudio sintetizado é original; não há dependência de Drive ou tokens.
