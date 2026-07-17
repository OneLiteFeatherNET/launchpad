# Changelog

## [1.2.0](https://github.com/OneLiteFeatherNET/launchpad/compare/onelitefeather.net-v1.1.0...onelitefeather.net-v1.2.0) (2026-07-17)


### Features

* **home:** promote cluster-resilience post in the homepage carousel ([b523ec3](https://github.com/OneLiteFeatherNET/launchpad/commit/b523ec3c5f941282ccab407cb9811b76c4e6fa15))
* **team:** roster refresh, application FAQ, role chips ([#157](https://github.com/OneLiteFeatherNET/launchpad/issues/157)) ([736981b](https://github.com/OneLiteFeatherNET/launchpad/commit/736981bf0732092855d16d1a2f501064b192f1d4))
* **team:** ship Minecraft head avatars via Cloudflare Images ([bacfcc0](https://github.com/OneLiteFeatherNET/launchpad/commit/bacfcc048ccc791653bea3c1995482f237b75502))

## [1.1.0](https://github.com/OneLiteFeatherNET/launchpad/compare/onelitefeather.net-v1.0.0...onelitefeather.net-v1.1.0) (2026-05-16)


### Features

* **.claude:** atomic web.dev-aligned skill & reviewer suite ([#138](https://github.com/OneLiteFeatherNET/launchpad/issues/138)) ([22cb2df](https://github.com/OneLiteFeatherNET/launchpad/commit/22cb2dfc6dfd03563d82e9d3fea6f266e2e5d16a))
* improve UX flow & accessibility + reusable Claude agents/skills ([#136](https://github.com/OneLiteFeatherNET/launchpad/issues/136)) ([b748278](https://github.com/OneLiteFeatherNET/launchpad/commit/b748278bad6feb29b21beaead33a65f889ee5b64))


### Bug Fixes

* **seo-check:** do not append mock query to sitemap endpoints ([8e3d09b](https://github.com/OneLiteFeatherNET/launchpad/commit/8e3d09b73213dcfef6029672804621c999101936))
* **seo-check:** skip mock query on sitemap endpoints (unblocks sitemap 7.6 bump) ([#135](https://github.com/OneLiteFeatherNET/launchpad/issues/135)) ([8e3d09b](https://github.com/OneLiteFeatherNET/launchpad/commit/8e3d09b73213dcfef6029672804621c999101936))


### Refactors

* **content:** introduce typed ContentRepository abstraction ([#132](https://github.com/OneLiteFeatherNET/launchpad/issues/132)) ([34c5bef](https://github.com/OneLiteFeatherNET/launchpad/commit/34c5befe22ac4ddb4b8cc931806767f0de492149))

## 1.0.0 (2026-05-15)


### Features

* add blog author profiles ([2b20669](https://github.com/OneLiteFeatherNET/launchpad/commit/2b20669b74b3f3b6c461e1457d02ea7557043a90))
* add blog tags and chips ([bd7f023](https://github.com/OneLiteFeatherNET/launchpad/commit/bd7f023529bc122463e836ed019dae76c79dbdd9))
* add carousel component with mixed slide types for enhanced homepage display ([48ed689](https://github.com/OneLiteFeatherNET/launchpad/commit/48ed6899b80688a9019e1bb78d1bc8928aa62006))
* add carousel component with support for multiple slide types ([0028edf](https://github.com/OneLiteFeatherNET/launchpad/commit/0028edff41b5e79fecfd84ba660fb996301a6193))
* add light gradient variants and utility classes for text gradients ([266b511](https://github.com/OneLiteFeatherNET/launchpad/commit/266b51134ea14dca25750ad7f812a111d89d0b2a))
* add VerticalTimeline component and integrate it into homepage ([923443e](https://github.com/OneLiteFeatherNET/launchpad/commit/923443e905e0f984e0b77cd450d661d17b8c4fc4))
* allow scheduled blog releases ([5e3f945](https://github.com/OneLiteFeatherNET/launchpad/commit/5e3f9458731da1ef93587bc11b76af316bbfbc7e))
* **blog:** translate otis preamble ([d13ad70](https://github.com/OneLiteFeatherNET/launchpad/commit/d13ad704751f0672ba399b07ea8852d776ad7c7e))
* enhance `NavigationIconButton` and `Carousel` with size variants, improved styles, and accessibility ([4700e38](https://github.com/OneLiteFeatherNET/launchpad/commit/4700e382e3d90fa1674626e9167e206dc83821d2))
* replace sitemap with custom locale-aware builder ([c5e1cfc](https://github.com/OneLiteFeatherNET/launchpad/commit/c5e1cfc683c5b5d40f97d4f75e476067e0ae5579))
* **seo:** add BreadcrumbList schema to blog overview page ([d3c444f](https://github.com/OneLiteFeatherNET/launchpad/commit/d3c444f1cf1d28e0e5af254af5554ee6dad9f973))
* **seo:** add dateModified, publisher and BreadcrumbList to blog articles ([d0f307f](https://github.com/OneLiteFeatherNET/launchpad/commit/d0f307fb95d7bf135ad50d266212c63b36378e81))
* **seo:** add llms.txt for AI crawler discoverability ([c077c54](https://github.com/OneLiteFeatherNET/launchpad/commit/c077c5424890aa466c02f359670b5f1449b4ac74))
* show app version in footer ([e06f702](https://github.com/OneLiteFeatherNET/launchpad/commit/e06f702f78967f164f50cc30a4fbcc00fc9faf46))
* split bedrock copy into host and port ([290cbbf](https://github.com/OneLiteFeatherNET/launchpad/commit/290cbbfe404352dced47084db658aaefbd7606ea))
* update SimpleNavButton styles for improved responsiveness and theming ([aa17c54](https://github.com/OneLiteFeatherNET/launchpad/commit/aa17c5443fa2629c976c287590c386b8461fe698))
* update SimpleNavButton styles for improved responsiveness and theming ([756566f](https://github.com/OneLiteFeatherNET/launchpad/commit/756566fdafd6823dc5db532310841f26c4256767))
* update SimpleNavButton styles for improved responsiveness and theming ([f8f3401](https://github.com/OneLiteFeatherNET/launchpad/commit/f8f34019147da7c162ea810a49a7f6ff745e729a))


### Bug Fixes

* add alternative titles, canonical links, and hreflang alternates to blog posts ([12ebc0d](https://github.com/OneLiteFeatherNET/launchpad/commit/12ebc0daadb804f23bdc658c2a53d26290a2ac43))
* adjust nav role to avoid menuitem requirements ([46ee422](https://github.com/OneLiteFeatherNET/launchpad/commit/46ee42227a4fec152c12f6bc681996ba68897f4c))
* align navigation styling with light/dark themes ([faeb2cd](https://github.com/OneLiteFeatherNET/launchpad/commit/faeb2cd5639b70dbe5fcf67f28c970cb6f28cef1))
* async components for lazy sections ([ddd72be](https://github.com/OneLiteFeatherNET/launchpad/commit/ddd72bebdb4e0a30894322779e7abe429d6e385a))
* **blog:** restore blog subpage rendering ([#119](https://github.com/OneLiteFeatherNET/launchpad/issues/119)) ([d4e6c99](https://github.com/OneLiteFeatherNET/launchpad/commit/d4e6c99a33a3fc3e17f24db391c91f63140a8930))
* clarify bedrock copy address label ([c852328](https://github.com/OneLiteFeatherNET/launchpad/commit/c852328fc66ce6c577dc5604ea546dcb86c0a7ee))
* contain address aura overflow on mobile ([696aac3](https://github.com/OneLiteFeatherNET/launchpad/commit/696aac30b2cb2c9ef0ede12bc69c0a03bd5e45eb))
* contain server connect aura ([9fac2bc](https://github.com/OneLiteFeatherNET/launchpad/commit/9fac2bc4b1ddf677c53b08bb886718683a8d2b79))
* enhance blog post metadata with alternative titles, canonical URLs, and hreflang alternates ([9afd1c1](https://github.com/OneLiteFeatherNET/launchpad/commit/9afd1c113af001ffe9f67ec2ea8fe0b54a6d7827))
* enhance theme colors for light/dark mode compatibility ([d26f8b7](https://github.com/OneLiteFeatherNET/launchpad/commit/d26f8b746aee06197dde4e8bd0c70cd218c02d5a))
* enlarge carousel dot touch targets ([a16e5dd](https://github.com/OneLiteFeatherNET/launchpad/commit/a16e5dd9808ab95d64e4fdd3a915b0af1b156ed5))
* **i18n:** replace hardcoded description fallback in useHomeSeo ([bcd61b3](https://github.com/OneLiteFeatherNET/launchpad/commit/bcd61b3340b1568d799d3c6d6698a351774595c3))
* improve chip contrast across themes ([d264677](https://github.com/OneLiteFeatherNET/launchpad/commit/d264677972c6d45f84cc08e828765af667ebbd20))
* inline axios so cloudflare_module Worker deploy succeeds ([#126](https://github.com/OneLiteFeatherNET/launchpad/issues/126)) ([88ec5fe](https://github.com/OneLiteFeatherNET/launchpad/commit/88ec5fe0d6cc3597c322b4be18654cb4fd390ee5))
* inline axios so wrangler can bundle the Worker ([88ec5fe](https://github.com/OneLiteFeatherNET/launchpad/commit/88ec5fe0d6cc3597c322b4be18654cb4fd390ee5))
* lighten surface color in light theme ([42bf909](https://github.com/OneLiteFeatherNET/launchpad/commit/42bf909dcd175302979a33a9326c7712b98ac9be))
* **nav:** resolve /ndefined phantom route bug ([ca0c6d2](https://github.com/OneLiteFeatherNET/launchpad/commit/ca0c6d26f90c4d31a82d5a8abdde49d86ee9ff9c))
* prevent address gradient from being clipped ([f3790fe](https://github.com/OneLiteFeatherNET/launchpad/commit/f3790fe8b959d2b3869841df72575612b512f171))
* prevent focus on hidden carousel slides ([1e92dc9](https://github.com/OneLiteFeatherNET/launchpad/commit/1e92dc90f1e0cf753d7e6607d374bf720d7bd6ca))
* refine Chip component styles for improved dark mode consistency and focus states ([e67b6ac](https://github.com/OneLiteFeatherNET/launchpad/commit/e67b6ac4fa89eebe872b592bb7c40009e0b397a5))
* refine image rendering logic to handle SVGs and internal paths gracefully ([f9fd8c8](https://github.com/OneLiteFeatherNET/launchpad/commit/f9fd8c8ce0de40737fb300f5117a7b01c1fbb002))
* remove stray opening tag in default.vue ([87a008c](https://github.com/OneLiteFeatherNET/launchpad/commit/87a008c10c4296224b7204f3362e39a4eaf92f2b))
* resize address aura to avoid mobile overflow ([8503923](https://github.com/OneLiteFeatherNET/launchpad/commit/85039231309973cce9cab801a99051eb11a4dcd1))
* resize carousel dots for consistency with design ([416f243](https://github.com/OneLiteFeatherNET/launchpad/commit/416f243e9d316f6c0b37dd4ca37b7de9d08e5f9a))
* resolve blog content on direct links ([f1ad4df](https://github.com/OneLiteFeatherNET/launchpad/commit/f1ad4df15d621c3775b31d92eeb9f4ea81ad5177))
* right-size carousel dots for mobile/desktop ([1ea7b41](https://github.com/OneLiteFeatherNET/launchpad/commit/1ea7b41b77379fdab73aa9827584e5e8f3e215df))
* **seo:** add Schema.org, OG/Twitter meta and i18n for all pages ([350036f](https://github.com/OneLiteFeatherNET/launchpad/commit/350036f5780af232accf6383056f7fa35776e9da))
* **seo:** align blog article canonical URL resolution order ([dee553a](https://github.com/OneLiteFeatherNET/launchpad/commit/dee553af2fb6599adf5e479d1917064679163dbe))
* **seo:** exclude noindex pages from sitemap via routeRules ([3bc7cc2](https://github.com/OneLiteFeatherNET/launchpad/commit/3bc7cc2b09a1cc01e3944d47ede9d482583cf57f))
* **seo:** remove dead links from llms.txt ([149ddf4](https://github.com/OneLiteFeatherNET/launchpad/commit/149ddf4487833d8cd8e946bd6d144eb7b4befeb3))
* **seo:** set home title via i18n ([71fef54](https://github.com/OneLiteFeatherNET/launchpad/commit/71fef54aa7f4418b4b6c1dda6247dbaabe4c6f0f))
* **seo:** standardize x-default hreflang to use English as default locale ([ed131e0](https://github.com/OneLiteFeatherNET/launchpad/commit/ed131e03f451b34f1277386e61b14ee822335a40))
* tighten server aura to stop tablet overflow ([9660690](https://github.com/OneLiteFeatherNET/launchpad/commit/9660690325da7e160aafaca0bf88da7bf916af65))
* update hreflang alternates for blog post to include English link ([d8585cf](https://github.com/OneLiteFeatherNET/launchpad/commit/d8585cf34cf84d2520225f9cb2afb689fea96af7))
* upgrade posthog-node to v5 to drop axios from the Worker bundle ([53b1be3](https://github.com/OneLiteFeatherNET/launchpad/commit/53b1be3eccc952f3a62288f2cc3cdaeada7ebb9a))
* upgrade posthog-node to v5 to fix Worker axios bundling failure ([#128](https://github.com/OneLiteFeatherNET/launchpad/issues/128)) ([53b1be3](https://github.com/OneLiteFeatherNET/launchpad/commit/53b1be3eccc952f3a62288f2cc3cdaeada7ebb9a))


### Performance

* add fetchpriority to carousel LCP ([ad93aab](https://github.com/OneLiteFeatherNET/launchpad/commit/ad93aab7c12729f7b3dd0897993f81073d97e7f0))
* boost carousel lcp with eager priority ([57c0234](https://github.com/OneLiteFeatherNET/launchpad/commit/57c023435049214a4964f8d4fb2ebc787cb32a34))
* lazy load non-critical ui ([8e8a234](https://github.com/OneLiteFeatherNET/launchpad/commit/8e8a2340a13ba9f45e489bf4235e5ea89e1d5874))
* preload first carousel slide for lcp ([acee52a](https://github.com/OneLiteFeatherNET/launchpad/commit/acee52a63aebfc04e2578947b125b4ec7f611201))
* reduce image payload size by lowering quality to 75 ([2db2e27](https://github.com/OneLiteFeatherNET/launchpad/commit/2db2e2758305abc11638d60921fc4cc1e9e3f6f7))
* tree-shake FontAwesome to shrink the main client chunk ([#129](https://github.com/OneLiteFeatherNET/launchpad/issues/129)) ([f5b7736](https://github.com/OneLiteFeatherNET/launchpad/commit/f5b77363e5acb8d19bdf1cd89fbfec2894f8b420))


### Refactors

* DRY content collections and sitemap service ([e64968b](https://github.com/OneLiteFeatherNET/launchpad/commit/e64968bca80455b6833c5b19505f389f938b34e7))
* extract i18n collection helpers ([3ac06d3](https://github.com/OneLiteFeatherNET/launchpad/commit/3ac06d3d551413eb3d1cbd8a2438eeac3845fc40))
* modularize carousel components and improve structure ([faee1e4](https://github.com/OneLiteFeatherNET/launchpad/commit/faee1e44b6abfcc1bb9f67c9a3266abb1edb740d))
* redesign navigation architecture and update styling ([e43283b](https://github.com/OneLiteFeatherNET/launchpad/commit/e43283ba07617857c1afb67e19dd0fd7290b6cc6))
* rewrite Otis blog content for better clarity, structure, and technical depth ([e6e5358](https://github.com/OneLiteFeatherNET/launchpad/commit/e6e53581bb67d59928fbf968374d9c5bfd99ab00))
* simplify localized collection creation ([89100f2](https://github.com/OneLiteFeatherNET/launchpad/commit/89100f2afa639385c08ffd99ff60f951c0790266))
* type blog content composable ([a73d774](https://github.com/OneLiteFeatherNET/launchpad/commit/a73d7746acd6f8c6d1e6f6fe303972d89020e53a))
* update Otis blog content for clarity and SEO, add tags and improve descriptions ([a076e9e](https://github.com/OneLiteFeatherNET/launchpad/commit/a076e9ef42915e55a0a1278c259f6283725caf06))
* use nuxt picture for modern formats ([08e585b](https://github.com/OneLiteFeatherNET/launchpad/commit/08e585b480f8836da74d61f13add355fb9d2eb09))


### Documentation

* add project guidelines and directory structure to AGENTS.md ([2af6f06](https://github.com/OneLiteFeatherNET/launchpad/commit/2af6f06d5ce502b0f595644b99622b06951870f3))
* refresh readme with stack and content guidance ([7ca91df](https://github.com/OneLiteFeatherNET/launchpad/commit/7ca91dff83b1c64140a9ae0079ee042ee725aa13))
* **server-connect:** translate German code comments to English in ServerAddresses.vue and related comment in pages/index.vue (no functional changes) ([348b108](https://github.com/OneLiteFeatherNET/launchpad/commit/348b108c6c98a901e211b188588b79fc06afd8ee))
