---
sidebar_position: 2
---

# Hello Planet!

Let's start with a simple example to shakeout the basics. Let's assume you have a webapp setup already.

Let's create a directory for our planet to live and create two files; one for the planet, the other for the webworker associated with that planet.

```
components
│
└───planet
   │   Planet.worker.ts
   │   Planet.tsx
```

Inside the webworker, we'll import a
