---
sidebar_position: 5
---

# Core

A set of utility functions, useful mostly for seed management.

## Usage

```typescript
import { setRandomSeed, getSeed, random } from "@hello-worlds/core"

setRandomSeed("MyWorldSeed")

getSeed() // "MyWorldSeed"

const value = random() // seeded random number
```
