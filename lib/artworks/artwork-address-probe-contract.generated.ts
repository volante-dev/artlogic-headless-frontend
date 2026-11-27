// Generated from feature039 contracts. Do not edit; independent of legacy fingerprints.
export interface paths {
    "/v1/internal/artwork-address-probe": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Évaluer le consommateur api avec un challenge privé de contrat 1
         * @description Origine exacte de l’inventaire ; JWT de requête HS256 dédié lié au digest du corps, audience site et rôle. Challenge 60 s, délai 5 s, JSON 65536 octets. Réponse signée consommée une seule fois par coordinateur ; voir probes.md. Pas de CSRF/session admin à la place du jeton de service.
         */
        post: operations["evaluateApiArtworkAddressProbe"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/artwork-address-probe": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Évaluer le consommateur frontend avec un challenge privé de contrat 1
         * @description Origine exacte de l’inventaire ; JWT de requête HS256 dédié lié au digest du corps, audience site et rôle. Challenge 60 s, délai 5 s, JSON 65536 octets. Réponse signée consommée une seule fois par coordinateur ; voir probes.md. Pas de CSRF/session admin à la place du jeton de service.
         */
        post: operations["evaluateFrontendArtworkAddressProbe"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ProbeFixture: {
            /** Format: uuid */
            artworkId: string;
            legacySlug: string;
            address: components["schemas"]["Address"] & {
                slug?: components["schemas"]["ShortSlug"];
                alternates?: unknown;
            };
        };
        /**
         * @example {
         *       "schemaVersion": 1,
         *       "challengeId": "33333333-3333-4333-8333-333333333333",
         *       "nonce": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
         *       "siteId": "55555555-5555-4555-8555-555555555555",
         *       "operationId": "22222222-2222-4222-8222-222222222222",
         *       "consumerId": "frontend.preview",
         *       "expectedBuildId": "build.fixture.17",
         *       "consumerInventoryRevision": "inventory.7",
         *       "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
         *       "contextRevision": "ctx.17",
         *       "issuedAt": 1795788000,
         *       "expiresAt": 1795788060,
         *       "fixture": {
         *         "artworkId": "11111111-1111-4111-8111-111111111111",
         *         "legacySlug": "masque-dan-11111111111141118111111111111111",
         *         "address": {
         *           "artworkId": "11111111-1111-4111-8111-111111111111",
         *           "locale": "fr",
         *           "slug": "masque-dan",
         *           "canonicalPath": "/artworks/masque-dan",
         *           "alternates": [
         *             {
         *               "locale": "en",
         *               "slug": "dan-mask",
         *               "path": "/en/artworks/dan-mask"
         *             }
         *           ]
         *         }
         *       }
         *     }
         * @example {
         *       "schemaVersion": 1,
         *       "challengeId": "33333333-3333-4333-8333-333333333333",
         *       "nonce": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
         *       "siteId": "55555555-5555-4555-8555-555555555555",
         *       "operationId": "22222222-2222-4222-8222-222222222222",
         *       "consumerId": "api.primary",
         *       "expectedBuildId": "build.api.17",
         *       "consumerInventoryRevision": "inventory.7",
         *       "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
         *       "contextRevision": "ctx.17",
         *       "issuedAt": 1795788000,
         *       "expiresAt": 1795788060,
         *       "fixture": {
         *         "artworkId": "11111111-1111-4111-8111-111111111111",
         *         "legacySlug": "masque-dan-11111111111141118111111111111111",
         *         "address": {
         *           "artworkId": "11111111-1111-4111-8111-111111111111",
         *           "locale": "fr",
         *           "slug": "masque-dan",
         *           "canonicalPath": "/artworks/masque-dan",
         *           "alternates": [
         *             {
         *               "locale": "en",
         *               "slug": "dan-mask",
         *               "path": "/en/artworks/dan-mask"
         *             }
         *           ]
         *         }
         *       }
         *     }
         */
        ProbeRequest: {
            /** @constant */
            schemaVersion: 1;
            /** Format: uuid */
            challengeId: string;
            nonce: string;
            /** Format: uuid */
            siteId: string;
            /** Format: uuid */
            operationId: string;
            consumerId: string;
            expectedBuildId: string;
            consumerInventoryRevision: string;
            reportDigest: string;
            contextRevision: string;
            issuedAt: number;
            expiresAt: number;
            fixture: {
                /** Format: uuid */
                artworkId: string;
                legacySlug: string;
                address: components["schemas"]["Address"] & {
                    slug?: components["schemas"]["ShortSlug"];
                    alternates?: unknown;
                };
            };
        };
        /**
         * @description Claims décodés illustratifs ; requestDigest correspond exactement au corps ProbeRequest d’exemple. Les fixtures exécutables signent avec une clé de test éphémère, jamais une clé de service réelle.
         * @example {
         *       "iss": "artwork-address-coordinator",
         *       "aud": "https://frontend.example.test/api/artwork-address-probe",
         *       "scope": "artwork-address-probe:request",
         *       "jti": "33333333-3333-4333-8333-333333333333",
         *       "nonce": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
         *       "siteId": "55555555-5555-4555-8555-555555555555",
         *       "operationId": "22222222-2222-4222-8222-222222222222",
         *       "consumerId": "frontend.preview",
         *       "iat": 1795788000,
         *       "exp": 1795788060,
         *       "requestDigest": "ac89a44e2ae68bace673a11a19fac8ed4e3be7593f95560f50c3e2513648646a"
         *     }
         * @example {
         *       "iss": "artwork-address-coordinator",
         *       "aud": "https://api.example.test/v1/internal/artwork-address-probe",
         *       "scope": "artwork-address-probe:request",
         *       "jti": "33333333-3333-4333-8333-333333333333",
         *       "nonce": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
         *       "siteId": "55555555-5555-4555-8555-555555555555",
         *       "operationId": "22222222-2222-4222-8222-222222222222",
         *       "consumerId": "api.primary",
         *       "iat": 1795788000,
         *       "exp": 1795788060,
         *       "requestDigest": "ca29032c0623583b51977a220ea01323825d6160f13b91ecd4471f4f1e633457"
         *     }
         */
        ProbeRequestClaims: {
            /** @constant */
            iss: "artwork-address-coordinator";
            /** Format: uri */
            aud: string;
            /** @constant */
            scope: "artwork-address-probe:request";
            /** Format: uuid */
            jti: string;
            nonce: string;
            /** Format: uuid */
            siteId: string;
            /** Format: uuid */
            operationId: string;
            consumerId: string;
            iat: number;
            exp: number;
            requestDigest: string;
        };
        /**
         * @example {
         *       "iss": "frontend.preview",
         *       "aud": "artwork-address-coordinator",
         *       "scope": "artwork-address-probe:response",
         *       "jti": "33333333-3333-4333-8333-333333333333",
         *       "nonce": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
         *       "siteId": "55555555-5555-4555-8555-555555555555",
         *       "operationId": "22222222-2222-4222-8222-222222222222",
         *       "consumerId": "frontend.preview",
         *       "requestDigest": "ac89a44e2ae68bace673a11a19fac8ed4e3be7593f95560f50c3e2513648646a",
         *       "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
         *       "consumerInventoryRevision": "inventory.7",
         *       "contextRevision": "ctx.17",
         *       "observedBuildId": "build.fixture.17",
         *       "checkedAt": 1795788002,
         *       "iat": 1795788002,
         *       "exp": 1795788060,
         *       "checks": {
         *         "uuidResolved": true,
         *         "legacyResolved": true,
         *         "preparedResolved": true,
         *         "localeRespected": true,
         *         "v0Compatible": true,
         *         "publicPreparedHidden": true
         *       }
         *     }
         * @example {
         *       "iss": "api.primary",
         *       "aud": "artwork-address-coordinator",
         *       "scope": "artwork-address-probe:response",
         *       "jti": "33333333-3333-4333-8333-333333333333",
         *       "nonce": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
         *       "siteId": "55555555-5555-4555-8555-555555555555",
         *       "operationId": "22222222-2222-4222-8222-222222222222",
         *       "consumerId": "api.primary",
         *       "requestDigest": "ca29032c0623583b51977a220ea01323825d6160f13b91ecd4471f4f1e633457",
         *       "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
         *       "consumerInventoryRevision": "inventory.7",
         *       "contextRevision": "ctx.17",
         *       "observedBuildId": "build.api.17",
         *       "checkedAt": 1795788002,
         *       "iat": 1795788002,
         *       "exp": 1795788060,
         *       "checks": {
         *         "uuidResolved": true,
         *         "legacyResolved": true,
         *         "preparedResolved": true,
         *         "localeRespected": true,
         *         "v0Compatible": true,
         *         "publicPreparedHidden": true
         *       }
         *     }
         */
        ProbeAttestationClaims: {
            iss: string;
            /** @constant */
            aud: "artwork-address-coordinator";
            /** @constant */
            scope: "artwork-address-probe:response";
            /** Format: uuid */
            jti: string;
            nonce: string;
            /** Format: uuid */
            siteId: string;
            /** Format: uuid */
            operationId: string;
            consumerId: string;
            requestDigest: string;
            reportDigest: string;
            consumerInventoryRevision: string;
            contextRevision: string;
            observedBuildId: string;
            checkedAt: number;
            iat: number;
            exp: number;
            checks: {
                uuidResolved: boolean;
                legacyResolved: boolean;
                preparedResolved: boolean;
                localeRespected: boolean;
                v0Compatible: boolean;
                publicPreparedHidden: boolean;
            };
        };
        ProbeResponse: {
            /** @constant */
            schemaVersion: 1;
            attestation: string;
        };
        /**
         * @example {
         *       "alg": "HS256",
         *       "typ": "JWT",
         *       "kid": "fixture.k1"
         *     }
         */
        ProbeJwtHeader: {
            /** @constant */
            alg: "HS256";
            /** @constant */
            typ: "JWT";
            kid: string;
        };
        LocalizedPath: {
            locale: string;
            slug: string;
            path: string;
        };
        /** @description Chemins serveur du même UUID, locales publiques seulement. Mode actif : slug <=80 ; forme, locale, identité et chemins vérifiés ensemble par le lecteur. */
        Address: {
            /** Format: uuid */
            artworkId: string;
            locale: string;
            slug: string;
            canonicalPath: string;
            alternates: components["schemas"]["LocalizedPath"][];
        };
        /** @description Format V0 réservé, même non attribué ; UUID propre exclu aussi par validation sémantique. */
        ShortSlug: string;
        Error: {
            error: {
                /** @enum {unknown} */
                code: "invalid_request" | "unauthorized" | "forbidden" | "not_found" | "address_context_changed" | "catalog_changed" | "language_policy_changed" | "operation_revision_conflict" | "preparation_stale" | "activation_blocked" | "idempotency_conflict" | "already_active" | "rate_limited" | "payload_too_large" | "capability_unavailable" | "service_unavailable";
                message: string;
                requestId: string;
            };
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    evaluateApiArtworkAddressProbe: {
        parameters: {
            query?: never;
            header: {
                "X-Artwork-Address-Probe-Contract": "1";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "schemaVersion": 1,
                 *       "challengeId": "33333333-3333-4333-8333-333333333333",
                 *       "nonce": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                 *       "siteId": "55555555-5555-4555-8555-555555555555",
                 *       "operationId": "22222222-2222-4222-8222-222222222222",
                 *       "consumerId": "api.primary",
                 *       "expectedBuildId": "build.api.17",
                 *       "consumerInventoryRevision": "inventory.7",
                 *       "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                 *       "contextRevision": "ctx.17",
                 *       "issuedAt": 1795788000,
                 *       "expiresAt": 1795788060,
                 *       "fixture": {
                 *         "artworkId": "11111111-1111-4111-8111-111111111111",
                 *         "legacySlug": "masque-dan-11111111111141118111111111111111",
                 *         "address": {
                 *           "artworkId": "11111111-1111-4111-8111-111111111111",
                 *           "locale": "fr",
                 *           "slug": "masque-dan",
                 *           "canonicalPath": "/artworks/masque-dan",
                 *           "alternates": [
                 *             {
                 *               "locale": "en",
                 *               "slug": "dan-mask",
                 *               "path": "/en/artworks/dan-mask"
                 *             }
                 *           ]
                 *         }
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["ProbeRequest"];
            };
        };
        responses: {
            /** @description Attestation signée après évaluation privée, sans modifier contenu/mode/claims. Vérifications sémantiques dans probes.md. */
            200: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProbeResponse"];
                };
            };
            /** @description invalid_request */
            400: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "code": "invalid_request",
                     *         "message": "Probe cannot be accepted",
                     *         "requestId": "probe.fixture"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description unauthorized */
            401: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "code": "unauthorized",
                     *         "message": "Probe cannot be accepted",
                     *         "requestId": "probe.fixture"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description forbidden */
            403: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "code": "forbidden",
                     *         "message": "Probe cannot be accepted",
                     *         "requestId": "probe.fixture"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description not_found */
            404: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "code": "not_found",
                     *         "message": "Probe cannot be accepted",
                     *         "requestId": "probe.fixture"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description preparation_stale */
            409: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "code": "preparation_stale",
                     *         "message": "Probe cannot be accepted",
                     *         "requestId": "probe.fixture"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description rate_limited */
            429: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "code": "rate_limited",
                     *         "message": "Probe cannot be accepted",
                     *         "requestId": "probe.fixture"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description service_unavailable */
            503: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "code": "service_unavailable",
                     *         "message": "Probe cannot be accepted",
                     *         "requestId": "probe.fixture"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
    evaluateFrontendArtworkAddressProbe: {
        parameters: {
            query?: never;
            header: {
                "X-Artwork-Address-Probe-Contract": "1";
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "schemaVersion": 1,
                 *       "challengeId": "33333333-3333-4333-8333-333333333333",
                 *       "nonce": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                 *       "siteId": "55555555-5555-4555-8555-555555555555",
                 *       "operationId": "22222222-2222-4222-8222-222222222222",
                 *       "consumerId": "frontend.preview",
                 *       "expectedBuildId": "build.fixture.17",
                 *       "consumerInventoryRevision": "inventory.7",
                 *       "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                 *       "contextRevision": "ctx.17",
                 *       "issuedAt": 1795788000,
                 *       "expiresAt": 1795788060,
                 *       "fixture": {
                 *         "artworkId": "11111111-1111-4111-8111-111111111111",
                 *         "legacySlug": "masque-dan-11111111111141118111111111111111",
                 *         "address": {
                 *           "artworkId": "11111111-1111-4111-8111-111111111111",
                 *           "locale": "fr",
                 *           "slug": "masque-dan",
                 *           "canonicalPath": "/artworks/masque-dan",
                 *           "alternates": [
                 *             {
                 *               "locale": "en",
                 *               "slug": "dan-mask",
                 *               "path": "/en/artworks/dan-mask"
                 *             }
                 *           ]
                 *         }
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["ProbeRequest"];
            };
        };
        responses: {
            /** @description Attestation signée après évaluation privée, sans modifier contenu/mode/claims. Vérifications sémantiques dans probes.md. */
            200: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProbeResponse"];
                };
            };
            /** @description invalid_request */
            400: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "code": "invalid_request",
                     *         "message": "Probe cannot be accepted",
                     *         "requestId": "probe.fixture"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description unauthorized */
            401: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "code": "unauthorized",
                     *         "message": "Probe cannot be accepted",
                     *         "requestId": "probe.fixture"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description forbidden */
            403: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "code": "forbidden",
                     *         "message": "Probe cannot be accepted",
                     *         "requestId": "probe.fixture"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description not_found */
            404: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "code": "not_found",
                     *         "message": "Probe cannot be accepted",
                     *         "requestId": "probe.fixture"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description preparation_stale */
            409: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "code": "preparation_stale",
                     *         "message": "Probe cannot be accepted",
                     *         "requestId": "probe.fixture"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description rate_limited */
            429: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "code": "rate_limited",
                     *         "message": "Probe cannot be accepted",
                     *         "requestId": "probe.fixture"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
            /** @description service_unavailable */
            503: {
                headers: {
                    /** @description private, no-store */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "error": {
                     *         "code": "service_unavailable",
                     *         "message": "Probe cannot be accepted",
                     *         "requestId": "probe.fixture"
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Error"];
                };
            };
        };
    };
}
