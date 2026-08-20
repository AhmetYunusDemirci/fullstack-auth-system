
```
fullstack-auth-system
├─ backend
│  ├─ env.example
│  ├─ package-lock.json
│  ├─ package.json
│  └─ src
│     ├─ config
│     │  ├─ db.js
│     │  └─ iyzipay.js
│     ├─ controllers
│     │  ├─ adminController.js
│     │  ├─ authController.js
│     │  ├─ cartController.js
│     │  ├─ contactController.js
│     │  ├─ couponController.js
│     │  ├─ dashboardController.js
│     │  ├─ orderController.js
│     │  ├─ paymentController.js
│     │  ├─ productController.js
│     │  ├─ userController.js
│     │  └─ wishlistController.js
│     ├─ middleware
│     │  ├─ authMiddleware.js
│     │  ├─ isAdmin.js
│     │  └─ isSeller.js
│     ├─ models
│     │  ├─ Cart.js
│     │  ├─ ContactMessage.js
│     │  ├─ Coupon.js
│     │  ├─ Order.js
│     │  ├─ Product.js
│     │  ├─ User.js
│     │  └─ Wishlist.js
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
│  │  ├─ contact
│  │  │  └─ page.js
│  │  ├─ dashboard
│  │  │  └─ page.js
│  │  ├─ favicon.ico
│  │  ├─ forgot-password
│  │  │  └─ page.js
│  │  ├─ globals.css
│  │  ├─ login
│  │  │  └─ page.js
│  │  ├─ my-orders
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
│  │  ├─ seller
│  │  │  ├─ orders
│  │  │  │  └─ page.js
│  │  │  └─ products
│  │  │     ├─ edit
│  │  │     │  └─ [id]
│  │  │     │     └─ page.js
│  │  │     ├─ new
│  │  │     │  └─ page.js
│  │  │     └─ page.js
│  │  └─ wishlist
│  │     └─ page.js
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
└─ README.md

```