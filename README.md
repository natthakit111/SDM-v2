smart_dormitory


โครงสร้างหลัก
.
├── README.md
├── backend
│   ├── Dockerfile
│   ├── app.js
│   ├── logs
│   │   ├── combined.log
│   │   └── error.log
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js
│   ├── src
│   │   ├── config
│   │   │   ├── db.js
│   │   │   ├── promptpay.js
│   │   │   └── telegram.js
│   │   ├── controllers
│   │   │   ├── announcementController.js
│   │   │   ├── authController.js
│   │   │   ├── billController.js
│   │   │   ├── contractController.js
│   │   │   ├── maintenanceController.js
│   │   │   ├── meterController.js
│   │   │   ├── moveOutController.js
│   │   │   ├── paymentController.js
│   │   │   ├── reportController.js
│   │   │   ├── roomController.js
│   │   │   └── tenantController.js
│   │   ├── middlewares
│   │   │   ├── auth.middleware.js
│   │   │   ├── errorHandler.js
│   │   │   ├── role.middleware.js
│   │   │   └── upload.middleware.js
│   │   ├── models
│   │   │   ├── announcement.model.js
│   │   │   ├── bill.model.js
│   │   │   ├── contract.model.js
│   │   │   ├── maintenance.model.js
│   │   │   ├── meter.model.js
│   │   │   ├── passwordReset.model.js
│   │   │   ├── payment.model.js
│   │   │   ├── room.model.js
│   │   │   ├── tenant.model.js
│   │   │   ├── user.model.js
│   │   │   └── utilityRate.model.js
│   │   ├── routes
│   │   │   ├── announcement.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── bill.routes.js
│   │   │   ├── contract.routes.js
│   │   │   ├── index.js
│   │   │   ├── maintenance.routes.js
│   │   │   ├── meter.routes.js
│   │   │   ├── moveOut.routes.js
│   │   │   ├── oauth.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── report.routes.js
│   │   │   ├── room.routes.js
│   │   │   ├── settings.routes.js
│   │   │   ├── telegram.routes.js
│   │   │   ├── tenant.routes.js
│   │   │   └── utilityRate.routes.js
│   │   ├── services
│   │   │   ├── bill.service.js
│   │   │   ├── cron.service.js
│   │   │   ├── email.service.js
│   │   │   ├── qr.service.js
│   │   │   └── telegram.service.js
│   │   ├── utils
│   │   │   ├── dateHelper.js
│   │   │   ├── logger.js
│   │   │   └── response.js
│   │   └── {utils,config,controllers,routes}
│   └── uploads
│       ├── contracts
│       ├── meter-images
│       │   ├── 1773833029281-661447.jpg
│       │   ├── 1773833063702-644244.jpg
│       │   ├── 1773922738817-280579.jpg
│       │   ├── 1773947880603-425543.jpg
│       │   ├── 1773947880664-171685.jpg
│       │   ├── 1773948949653-499206.png
│       │   ├── 1773948987153-998167.jpg
│       │   ├── 1773948987177-257731.jpg
│       │   ├── 1774004296814-840594.jpg
│       │   ├── 1774004304821-510072.jpg
│       │   ├── 1774004351580-464847.jpg
│       │   └── 1774004351620-431991.jpg
│       └── payment-slips
│           ├── 1773833600488-183892.jpg
│           ├── 1773923307165-982761.jpg
│           ├── 1773923331063-81582.jpg
│           ├── 1773929682498-284355.jpg
│           └── 1773949367632-192169.jpg
├── database
│   ├── schema.sql
│   └── seed.sql
├── docker-compose.yml
└── frontend
    ├── README.md
    ├── app
    │   ├── admin
    │   │   ├── announcements
    │   │   │   └── page.tsx
    │   │   ├── bills
    │   │   │   └── page.tsx
    │   │   ├── contracts
    │   │   │   └── page.tsx
    │   │   ├── deposits
    │   │   │   └── page.tsx
    │   │   ├── layout.tsx
    │   │   ├── maintenance
    │   │   │   └── page.tsx
    │   │   ├── meters
    │   │   │   └── page.tsx
    │   │   ├── move-out
    │   │   │   └── page.tsx
    │   │   ├── notifications
    │   │   │   └── page.tsx
    │   │   ├── page.tsx
    │   │   ├── payment-history
    │   │   │   └── page.tsx
    │   │   ├── payment-verification
    │   │   │   └── page.tsx
    │   │   ├── payments
    │   │   │   └── page.tsx
    │   │   ├── profile
    │   │   │   └── page.tsx
    │   │   ├── rooms
    │   │   │   └── page.tsx
    │   │   ├── settings
    │   │   │   └── page.tsx
    │   │   └── tenants
    │   │       └── page.tsx
    │   ├── api
    │   │   └── cron
    │   │       └── check-overdue
    │   │           └── route.ts
    │   ├── auth
    │   │   ├── google
    │   │   │   └── callback
    │   │   │       └── page.tsx
    │   │   └── telegram
    │   │       └── callback
    │   │           └── page.tsx
    │   ├── forgot-password
    │   │   └── page.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── login
    │   │   └── page.tsx
    │   ├── page.tsx
    │   ├── register
    │   │   └── page.tsx
    │   ├── reset-password
    │   │   └── page.tsx
    │   └── tenant
    │       ├── announcements
    │       │   └── page.tsx
    │       ├── bills
    │       │   └── page.tsx
    │       ├── contract
    │       │   └── page.tsx
    │       ├── layout.tsx
    │       ├── maintenance
    │       │   └── page.tsx
    │       ├── move-out
    │       │   └── page.tsx
    │       ├── notifications
    │       │   └── page.tsx
    │       ├── page.tsx
    │       ├── payment
    │       │   └── page.tsx
    │       ├── payment-history
    │       │   └── page.tsx
    │       └── profile
    │           └── page.tsx
    ├── components
    │   ├── common
    │   │   ├── stats-card.tsx
    │   │   └── status-badge.tsx
    │   ├── layout
    │   │   ├── admin-navbar.tsx
    │   │   ├── admin-sidebar.tsx
    │   │   ├── tenant-bottom-nav.tsx
    │   │   ├── tenant-navbar.tsx
    │   │   └── tenant-sidebar.tsx
    │   ├── meters
    │   │   └── photo-evidence-upload.tsx
    │   ├── payments
    │   │   ├── payment-slip-processor.tsx
    │   │   └── qr-code-display.tsx
    │   ├── theme-provider.tsx
    │   ├── theme-toggle.tsx
    │   └── ui
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── button-group.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── command.tsx
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── drawer.tsx
    │       ├── dropdown-menu.tsx
    │       ├── empty.tsx
    │       ├── field.tsx
    │       ├── form.tsx
    │       ├── hover-card.tsx
    │       ├── input-group.tsx
    │       ├── input-otp.tsx
    │       ├── input.tsx
    │       ├── item.tsx
    │       ├── kbd.tsx
    │       ├── label.tsx
    │       ├── menubar.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── sonner.tsx
    │       ├── spinner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toast.tsx
    │       ├── toaster.tsx
    │       ├── toggle-group.tsx
    │       ├── toggle.tsx
    │       ├── tooltip.tsx
    │       ├── use-mobile.tsx
    │       └── use-toast.ts
    ├── components.json
    ├── context
    │   ├── auth-context.tsx
    │   ├── language-context.tsx
    │   └── notification-context.tsx
    ├── docs
    │   ├── CRON_SETUP.md
    │   └── PROJECT_STATUS.md
    ├── hooks
    │   ├── use-mobile.ts
    │   └── use-toast.ts
    ├── lib
    │   ├── api
    │   │   ├── announcement.api.js
    │   │   ├── auth.api.js
    │   │   ├── axiosInstance.js
    │   │   ├── bill.api.js
    │   │   ├── contract.api.js
    │   │   ├── index.js
    │   │   ├── maintenance.api.js
    │   │   ├── meter.api.js
    │   │   ├── moveOut.api.js
    │   │   ├── payment.api.js
    │   │   ├── report.api.js
    │   │   ├── room.api.js
    │   │   ├── settings.api.js
    │   │   ├── telegram.api.js
    │   │   ├── tenant.api.js
    │   │   └── utilityRate.api.js
    │   ├── mock-data.ts
    │   ├── pdf-export.ts
    │   └── utils.ts
    ├── next-env.d.ts
    ├── next.config.mjs
    ├── package.json
    ├── pnpm-lock.yaml
    ├── postcss.config.mjs
    ├── proxy.ts
    ├── public
    │   ├── apple-icon.png
    │   ├── icon-dark-32x32.png
    │   ├── icon-light-32x32.png
    │   ├── icon.svg
    │   ├── placeholder-logo.png
    │   ├── placeholder-logo.svg
    │   ├── placeholder-user.jpg
    │   ├── placeholder.jpg
    │   └── placeholder.svg
    ├── styles
    │   └── globals.css
    └── tsconfig.json