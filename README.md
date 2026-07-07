# Viking's Burguer — Landing Page

Landing page premium da Viking's Burguer (Leme/SP). HTML semântico, CSS moderno e
**TypeScript** para toda a interatividade.

## Estrutura

```
index.html          Marcação semântica + SEO (Schema.org, Open Graph)
css/style.css        Estilos (design system, animações, responsivo)
src/main.ts          Código-fonte TypeScript (fonte de verdade)
js/main.js           Saída compilada (gerada — não editar à mão)
assets/img/          Imagens dos hambúrgueres e logo
assets/video/        Vídeos (hero + card ASTRID)
```

## Desenvolvimento

Pré-requisito: Node.js 18+.

```bash
npm install        # instala o TypeScript (uma vez)
npm run build      # compila src/main.ts -> js/main.js
npm run watch      # recompila automaticamente a cada alteração
```

> Edite sempre `src/main.ts`. O arquivo `js/main.js` é gerado pelo compilador
> (`tsc`) e é sobrescrito a cada build.

## Publicação

O site é 100% estático. Basta servir a pasta (já com o `js/main.js` compilado)
em qualquer hospedagem. As bibliotecas de animação (GSAP, Lenis, AOS) são
carregadas via CDN.

Ao publicar, troque as `og:image` das meta tags pela URL absoluta do domínio final.
