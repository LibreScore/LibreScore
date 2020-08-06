
# Specification: ScorePack format

***Status: Draft***

## Summary

The *ScorePack* format is LibreScore's **immutable**, IPLD-compatible (encoded in [DAG-CBOR](https://github.com/ipld/specs/blob/master/block-layer/codecs/dag-cbor.md)), extensible data structure to store score metadata and CID reference to mscz score file (natively being used in [MuseScore](https://github.com/musescore/MuseScore/)) on IPFS.

## Format Description

Each *ScorePack* is a DAG-CBOR encoded object with the following fields:

| Field | Type | Description |
|---|---|---|
| `_fmt` (Required) | string | format name, always `scorepack` |
| `_ver` (Required) | number (int) | format version, currently `1` (would change if incompatible changes to the format are made) |
| `_sig` (Required) | object \| null | see [User Signatures](#user-signatures) |
| `_prev` | [CID](https://github.com/multiformats/cid) or its string representation | points to the previous revision of the *ScorePack* (*ScorePack*s are **immutable**; it helps us track its revision history) |
| `score` (Required) | [CID](https://github.com/multiformats/cid) | points to the mscz score file  |
| `thumbnail` | [CID](https://github.com/multiformats/cid) | points to the thumbnail image of the first page |
| `title` (Required) | string | |
| `description` | string | |
| `summary` | string | |
| `copyright` | string | *WIP* |
| `tags` | string[] | *WIP* |
| `source` | Source[] | where the score comes from (downloaded from other websites, etc.), see [The `Source` Object](#the-source-object) |
| `created` | ISO8601 datetime string |  |
| `updated` (Required) | ISO8601 datetime string |  |

### The `Source` Object

The following is some suggestions:

| Field | Type | Description |
|---|---|---|
| `name` | string | name of the website, book, collection, etc. |
| `description` | string | |
| `url` | string | |
| `id` | number | score id on the source website (e.g. musescore.com) |
| `user` | number \| string | user id or user name on the source website |

### User Signatures

Verification in an asymmetric encryption system requires a signature and its public key. In order to support multiple identity/wallet providers, just make things simple and generic.

| Field | Type | Description |
|---|---|---|
| `publicKey` | Buffer | user's public key [serialized in protobuf](https://github.com/libp2p/js-libp2p-crypto/blob/master/src/keys/index.js#L85) (libp2p-crypto standard, multiple key types supported) |
| `signature` | Buffer | |

**Notes:**

* Remove all `undefined` values in the ScorePack object (`undefined` values may not exist in other languages; They may trigger errors using in CBOR)
* Sign/Verify the *ScorePack* with `_sig` set to `null`

## Implementations

* [TypeScript](../src/core/scorepack/)
