# Typesafe REST API Specification - IO-TS Data Validation Related Libraries

[![CI Pipeline](https://github.com/ty-ras/data-io-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/ty-ras/data-io-ts/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/ty-ras/data-io-ts/actions/workflows/cd.yml/badge.svg)](https://github.com/ty-ras/data-io-ts/actions/workflows/cd.yml)

The Typesafe REST API Specification (TyRAS) is a family of libraries used to enable seamless development of Backend and/or Frontend which communicate via HTTP protocol.
The protocol specification is checked both at compile-time and run-time to verify that communication indeed adhers to the protocol.
This all is done in such way that it does not make development tedious or boring, but instead robust and fun!

This particular repository contains related libraries related to using TyRAS with [`io-ts`](https://github.com/gcanti/io-ts) data validation library:
- [data](./data) folder contains `io-ts`-specific library `@ty-ras/data-io-ts` commonly used by both frontend and backend,
- [data-backend](./data-backend) folder contains `io-ts`-specific library `@ty-ras/data-backend-io-ts` used by backend,
- [state](./state) folder contains `io-ts`-specific library `@ty-ras/state-io-ts` used by backend
- [data-frontend](./data-frontend) folder contains `io-ts`-specific library `@ty-ras/data-frontend-io-ts` used by frontend, and
- [metadata-jsonchema](./metadata-jsonschema) folder contains `io-ts`-specific library `@ty-ras/metadata-jsonschema-io-ts` used to transform `io-ts` validators into [JSON schema](https://json-schema.org/) objects.
  It is typically used by backend, but it is not restricted to that.