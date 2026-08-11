
```
fullstack-auth-system
├─ backend
│  ├─ env.example
│  ├─ package-lock.json
│  ├─ package.json
│  └─ src
│     ├─ config
│     │  └─ db.js
│     ├─ controllers
│     │  ├─ adminController.js
│     │  ├─ authController.js
│     │  ├─ cartController.js
│     │  ├─ dashboardController.js
│     │  ├─ productController.js
│     │  └─ userController.js
│     ├─ middleware
│     │  ├─ authMiddleware.js
│     │  ├─ isAdmin.js
│     │  └─ isSeller.js
│     ├─ models
│     │  ├─ Cart.js
│     │  ├─ Product.js
│     │  └─ User.js
│     ├─ server.js
│     └─ utils
│        └─ sendEmail.js
├─ frontend
│  ├─ AGENTS.md
│  ├─ app
│  │  ├─ admin
│  │  │  └─ page.js
│  │  ├─ cart
│  │  │  └─ page.js
│  │  ├─ dashboard
│  │  │  └─ page.js
│  │  ├─ favicon.ico
│  │  ├─ forgot-password
│  │  │  └─ page.js
│  │  ├─ globals.css
│  │  ├─ login
│  │  │  └─ page.js
│  │  ├─ page.js
│  │  ├─ products
│  │  │  └─ [id]
│  │  │     └─ page.js
│  │  ├─ profile
│  │  │  └─ page.js
│  │  ├─ register
│  │  │  └─ page.js
│  │  ├─ reset-password
│  │  │  └─ [token]
│  │  │     └─ page.js
│  │  └─ seller
│  │     └─ products
│  │        ├─ edit
│  │        │  └─ [id]
│  │        │     └─ page.js
│  │        ├─ new
│  │        │  └─ page.js
│  │        └─ page.js
│  ├─ CLAUDE.md
│  ├─ components
│  │  ├─ Button.jsx
│  │  ├─ Input.jsx
│  │  └─ Navbar.js
│  ├─ eslint.config.mjs
│  ├─ lib
│  │  └─ api.js
│  ├─ next-env.d.ts
│  ├─ next.config.ts
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.mjs
│  ├─ public
│  │  ├─ file.svg
│  │  ├─ globe.svg
│  │  ├─ next.svg
│  │  ├─ vercel.svg
│  │  └─ window.svg
│  ├─ README.md
│  ├─ services
│  │  └─ authService.js
│  └─ tsconfig.json
└─ projectree.md

```