/* eslint-disable no-console */
const path = require('path');
const PrerendererWebpackPlugin = require('@weweb-prerender/webpack-plugin');

const fs = require('fs');

const PRERENDER_DISABLED = `${process.env.PRERENDER_DISABLED}` == 'true' ? true : false;
process.env.VUE_APP_PRERENDER_DISABLED = process.env.PRERENDER_DISABLED || false;
process.env.VUE_APP_VERSION = process.env.npm_package_version;
// eslint-disable-next-line no-undef
const allRoutes = ["/signin","/404","/legal_information","/terms-privacy","/auth","/playground","/","/qlaus-chat","/1","/qreamui","/signup--"];

module.exports = {
    productionSourceMap: false,
    outputDir: './dist/',
    assetsDir: 'public',
    publicPath: '/',
    pages: {
        index: {
            // entry for the page
            entry: 'src/_front/main.js',
            // the source template
            template: 'public/index_for_prerender.html',
            // output as dist/index.html
            filename: 'index_for_prerender.html',
            // when using title option,
            // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
            title: 'Index Page',
            // chunks to include on this page, by default includes
            // extracted common chunks and vendor chunks.
            chunks: ['chunk-vendors', 'chunk-common', 'index'],
        },
    },
    configureWebpack: config => {
        console.log('');
        console.log('BUILDING VERSION : ' + process.env.npm_package_version);
        console.log('MODE : ' + process.env.MODE);
        console.log('');

        config.module.rules.push({
            test: /\.mjs$/,
            include: /node_modules/,
            type: 'javascript/auto',
        });

        config.plugins.push(
            new PrerendererWebpackPlugin({
                entryPath: 'index_for_prerender.html',

                // Required - The path to the webpack-outputted app to prerender.
                staticDir: path.join(__dirname, 'dist'),

                // Optional - The path your rendered app should be output to.
                // (Defaults to staticDir.)
                outputDir: path.join(__dirname, 'dist'),

                // Optional - The location of index.html
                // indexPath: path.join(__dirname, 'dist', 'index.html'),

                // Required - Routes to render.
                // eslint-disable-next-line no-undef
                routes: process.env.ROUTES_TO_RENDER ? JSON.parse(process.env.ROUTES_TO_RENDER) : allRoutes,
                // routes: ['/', '/home', '/about', '/fr', '/fr/home', '/fr/about', '/en', '/en/home', '/en/about'],

                // Optional - Uses html-minifier (https://github.com/kangax/html-minifier)
                // To minify the resulting HTML.
                // Option reference: https://github.com/kangax/html-minifier#options-quick-reference
                minify: {
                    collapseBooleanAttributes: true,
                    // collapseWhitespace: true,
                    decodeEntities: true,
                    keepClosingSlash: true,
                    sortAttributes: true,
                },

                // Server configuration options.
                // server: {
                //     // Normally a free port is autodetected, but feel free to set this if needed.
                //     // port: 8001
                // },

                // The actual renderer to use. (Feel free to write your own)
                // Available renderers: https://github.com/Tribex/prerenderer/tree/master/renderers
                renderer: '@weweb-prerender/renderer-puppeteer',

                rendererOptions: {
                    // Optional - Wait to render until the specified event is dispatched on the document.
                    // eg, with `document.dispatchEvent(new Event('custom-render-trigger'))`
                    renderAfterDocumentEvent: 'ww-prerender-page',
                    // renderAfterTime: 200000,
                    maxConcurrentRoutes: 10,
                    skipThirdPartyRequests: true,
                    timeout: 120000,
                    // headless: false,

                    // Optional - Any values you'd like your app to have access to via `window.injectProperty`.
                    inject: true,
                    injectProperty: '__WW_IS_PRERENDER__',

                    defaultViewport: {
                        width: 1920,
                        height: 1080,
                    },
                    allowedUrls: [
                        'https://cdn.weweb.io/',
                        'https://cdn.weweb-preprod.io/',
                        'https://cdn.weweb-staging.io/',
                        'https://weweb-v3.twic.pics/',
                        'https://dl.airtable.com/',
                        'https://cdn.weweb.app/',
                        'https://fonts.googleapis.com/',
                        'https://fonts.gstatic.com/',
                    ],
                },

                postProcess(renderedRoute) {
                    //Save screenShot
                    fs.mkdirSync(path.join(__dirname, `dist${renderedRoute.route}/`), { recursive: true });
                    if (renderedRoute.screenShot) {
                        fs.writeFileSync(
                            path.join(__dirname, `dist${renderedRoute.route}/screen.png`),
                            renderedRoute.screenShot
                        );
                    }

                    //Add id=app
                    renderedRoute.html = renderedRoute.html.replace(
                        /<\/noscript>\s*<div(.*)class="website-wrapper"/gi,
                        '</noscript><div id="app" $1 class="website-wrapper"'
                    );

                    //Add async to all scripts
                    renderedRoute.html = renderedRoute.html.replace(
                        /(<script(?:(?!defer|script).)*)(><\/script>)/gi,
                        '$1 async$2'
                    );

                    //Extract styles and generate media files
                    if (!PRERENDER_DISABLED) {
                        const random = Math.round(Math.random() * 10000000000);
                        const screens = ['default', 'tablet', 'mobile'];
                        for (const screen of screens) {
                            let regexp = new RegExp(
                                `<style generated-css="${screen}" generated-media="(.*?)">(.*?)</style>`,
                                'gi'
                            );
                            const matches = regexp.exec(renderedRoute.html);

                            if (matches && matches[1] && matches[2]) {
                                const media = matches[1];
                                const css = matches[2];

                                fs.mkdirSync(path.join(__dirname, `dist/public/css${renderedRoute.route}/`), {
                                    recursive: true,
                                });
                                fs.writeFileSync(
                                    path.join(
                                        __dirname,
                                        `dist/public/css${renderedRoute.route}/${screen}-${random}.css`
                                    ),
                                    css
                                );

                                renderedRoute.html = renderedRoute.html.replace(
                                    regexp,
                                    `<link generated-css="${screen}" href="public/css${renderedRoute.route}${
                                        renderedRoute.route.endsWith('/') ? '' : '/'
                                    }${screen}-${random}.css" rel="stylesheet" media="${media}">`
                                );
                            }
                        }
                    }

                    //BASE TAG
                    let baseTag = {} || {};
                    if (Object.keys(baseTag).length !== 2) baseTag = { href: '/' };
                    renderedRoute.html = renderedRoute.html.replace(
                        /<head>/gi,
                        `<head><base href="${baseTag.href || '/'}" ${
                            baseTag.target ? `target="${baseTag.target}"` : ''
                        }/>`
                    );

                    // /public/
                    renderedRoute.html = renderedRoute.html.replace(/src="\/public\//gi, 'src="public/');
                    renderedRoute.html = renderedRoute.html.replace(/href="\/public\//gi, 'href="public/');

                    //Remove remaining style
                    const regStyles = /(<[^>]*ww-responsive[^>]*)style="[^"]*"/gi;
                    renderedRoute.html = renderedRoute.html.replace(regStyles, '$1');

                    //PAGE SCRIPTS
                    const regex = /<(?:div|body)(?:.*)ww-page-id="([^"]*)"/gi;
                    const match = regex.exec(renderedRoute.html);

                    if (match && match[1]) {
                        const id = match[1];

                        // eslint-disable-next-line no-undef
                        const scripts = {"head":{},"body":{},"globalHead":"","globalBody":""};

                        if (scripts && scripts.globalHead) {
                            renderedRoute.html = renderedRoute.html.replace(
                                /<\/head>/gi,
                                scripts.globalHead + '</head>'
                            );
                        }
                        if (scripts && scripts.head[id]) {
                            renderedRoute.html = renderedRoute.html.replace(/<\/head>/gi, scripts.head[id] + '</head>');
                        }
                        if (scripts && scripts.globalBody) {
                            renderedRoute.html = renderedRoute.html.replace(
                                /<\/body>/gi,
                                scripts.globalBody + '</body>'
                            );
                        }
                        if (scripts && scripts.body[id]) {
                            renderedRoute.html = renderedRoute.html.replace(/<\/body>/gi, scripts.body[id] + '</body>');
                        }
                    }

                    return renderedRoute;
                },
            })
        );
    },
};
