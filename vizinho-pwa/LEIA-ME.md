# Vizinho (PWA)

Pasta pronta para publicar. Um app instalável precisa estar em um endereço com HTTPS.

## Publicar (escolha um)
- **Netlify:** arraste esta pasta (descompactada) para o Netlify Drop.
- **Vercel:** `vercel` dentro da pasta.
- **GitHub Pages:** suba os arquivos em um repositório e ative o Pages.

## Instalar no celular
- **Android (Chrome):** abra o endereço e toque em "Instalar o app" na tela inicial.
- **iPhone (Safari):** Compartilhar > Adicionar à Tela de Início.

## Ao atualizar o app
Troque `CACHE='vizinho-v2'` em `sw.js` (por exemplo, para `vizinho-v3`) para os celulares receberem a versão nova.

## Aviso
Os dados ainda são de demonstração e ficam só no aparelho. Login, Pix e votações ainda são simulados.

## Android sem barra do navegador
`well-known/assetlinks.json` + `_redirects` fazem o site responder em `/.well-known/assetlinks.json`.
Se você gerar outro APK com outra chave, troque a fingerprint nesse arquivo (ou copie o `assetlinks.json` novo do PWABuilder por cima).
