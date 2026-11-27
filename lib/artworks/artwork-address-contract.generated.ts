// Generated from feature039 contracts. Do not edit; independent of legacy fingerprints.
export interface paths {
    "/v1/public/artwork-addresses/capabilities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lire la capacité publique sans révéler la préparation
         * @description Endpoint absent sur V0 : fallback historique seulement avant activation/plancher 1. Panne réseau et 5xx ne prouvent pas une capacité absente. Mode active implique available true et minimumContractVersion 1.
         */
        get: operations["getArtworkAddressCapabilities"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/public/artwork-addresses/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Résoudre une référence exacte vers son adresse effective
         * @description Visibilité et politique linguistique avant destination. Courte préparée : 404 avant activation. ensure durable sur absence puis relecture cohérente. JSON 200 ; le proxy applique 308 pour canonisation, 307 pour repli linguistique, au plus un saut final. Refuser paramètres inconnus ou répétés.
         */
        get: operations["resolvePublicArtworkAddress"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/public/artwork-addresses/lookup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lire des adresses par lot de 100 UUID au plus
         * @description Lecture groupée sans HTTP par carte. Identités non publiques omises ; aucun claim préparé divulgué. Allocation dérivée bornée sur absence en mode actif, puis relecture ; échec =>503 sans fallback historique.
         */
        get: operations["lookupPublicArtworkAddresses"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/artwork-addresses/state": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lire l’état privé durable du site
         * @description Contrat prévu, non implémenté. Voir http.md et compatibility.md.
         */
        get: operations["getArtworkAddressState"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/artwork-addresses/preparations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Créer une préparation privée sans scan global
         * @description Contrat prévu, non implémenté. Voir http.md et compatibility.md.
         */
        post: operations["prepareArtworkAddresses"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/artwork-addresses/operations/{operationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Retrouver l’état après interruption ou réponse perdue
         * @description Contrat prévu, non implémenté. Voir http.md et compatibility.md.
         */
        get: operations["getArtworkAddressOperation"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/artwork-addresses/operations/{operationId}/report": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Parcourir le bilan privé
         * @description Contrat prévu, non implémenté. Voir http.md et compatibility.md.
         */
        get: operations["getArtworkAddressReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/artwork-addresses/operations/{operationId}/advance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Avancer un lot avec CAS ou recommencer un bilan obsolète
         * @description Un seul lot borné par la batchSize persistée. restart=true réinitialise le bilan obsolète et son curseur, jamais les claims. Ancienne révision =>409 operation_revision_conflict ; ancien bilan sans restart =>409 preparation_stale.
         */
        post: operations["advanceArtworkAddressPreparation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/artwork-addresses/operations/{operationId}/check-consumers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Contrôler les points d’entrée et builds admissibles
         * @description Inventaire configuré, aucune URL arbitraire en entrée. Réseau hors transaction finale. Challenge, site, build, digest et inventaire exacts, reçu expirant. passed=false explique les blocages, ne permet pas activation.
         */
        post: operations["checkArtworkAddressConsumers"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/admin/artwork-addresses/operations/{operationId}/activate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Activer atomiquement et conserver le reçu durable
         * @description Droits, révision, digest, vecteur frais, preuve consommateurs et plancher revalidés. Mode actif et reçu dans le même COMMIT. Pas de backfill/réseau sous verrou. Timeout : lire operation puis rejouer même clé. Pas de désactivation ni de redirection courte vers longue.
         */
        post: operations["activateArtworkAddresses"];
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
        /**
         * @example {
         *       "schemaVersion": 1,
         *       "available": true,
         *       "mode": "legacy",
         *       "addressRevision": "50",
         *       "minimumContractVersion": 0
         *     }
         * @example {
         *       "schemaVersion": 1,
         *       "available": false,
         *       "mode": "legacy",
         *       "addressRevision": null,
         *       "minimumContractVersion": 0
         *     }
         * @example {
         *       "schemaVersion": 1,
         *       "available": true,
         *       "mode": "active",
         *       "addressRevision": "51",
         *       "minimumContractVersion": 1
         *     }
         */
        Capability: {
            /** @constant */
            schemaVersion: 1;
            available: boolean;
            /** @enum {unknown} */
            mode: "legacy" | "active";
            addressRevision: string | null;
            /** @enum {unknown} */
            minimumContractVersion: 0 | 1;
        } & unknown;
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
        /**
         * @description Extension top-level artworkAddresses négociée. Liste bornée par la réponse métier et ses limites existantes ; dédupliquée par artworkId. Allocation en lots <=100, jamais un scan global.
         * @example {
         *       "schemaVersion": 1,
         *       "mode": "active",
         *       "addressRevision": "51",
         *       "contextRevision": "ctx.17",
         *       "items": [
         *         {
         *           "artworkId": "11111111-1111-4111-8111-111111111111",
         *           "locale": "fr",
         *           "slug": "masque-dan",
         *           "canonicalPath": "/artworks/masque-dan",
         *           "alternates": [
         *             {
         *               "locale": "fr",
         *               "slug": "masque-dan",
         *               "path": "/artworks/masque-dan"
         *             },
         *             {
         *               "locale": "en",
         *               "slug": "dan-mask",
         *               "path": "/en/artworks/dan-mask"
         *             }
         *           ]
         *         }
         *       ]
         *     }
         * @example {
         *       "schemaVersion": 1,
         *       "mode": "legacy",
         *       "addressRevision": "50",
         *       "contextRevision": "ctx.16",
         *       "items": [
         *         {
         *           "artworkId": "11111111-1111-4111-8111-111111111111",
         *           "locale": "fr",
         *           "slug": "masque-dan-11111111111141118111111111111111",
         *           "canonicalPath": "/artworks/masque-dan-11111111111141118111111111111111",
         *           "alternates": [
         *             {
         *               "locale": "en",
         *               "slug": "masque-dan-11111111111141118111111111111111",
         *               "path": "/en/artworks/masque-dan-11111111111141118111111111111111"
         *             }
         *           ]
         *         }
         *       ]
         *     }
         */
        AddressSet: {
            /** @constant */
            schemaVersion: 1;
            /** @enum {unknown} */
            mode: "legacy" | "active";
            addressRevision: string;
            contextRevision: string;
            items: components["schemas"]["Address"][];
        } & (unknown & unknown);
        Lookup: components["schemas"]["AddressSet"] & {
            items?: unknown;
        };
        /**
         * @description Décision JSON : canonique servie, canonisation permanente 308, ou repli linguistique réversible 307. Adresse de la même identité publique ; pas de divulgation de locale inactive.
         * @example {
         *       "schemaVersion": 1,
         *       "mode": "active",
         *       "addressRevision": "51",
         *       "contextRevision": "ctx.17",
         *       "address": {
         *         "artworkId": "11111111-1111-4111-8111-111111111111",
         *         "locale": "fr",
         *         "slug": "masque-dan",
         *         "canonicalPath": "/artworks/masque-dan",
         *         "alternates": [
         *           {
         *             "locale": "fr",
         *             "slug": "masque-dan",
         *             "path": "/artworks/masque-dan"
         *           },
         *           {
         *             "locale": "en",
         *             "slug": "dan-mask",
         *             "path": "/en/artworks/dan-mask"
         *           }
         *         ]
         *       },
         *       "redirect": false,
         *       "requestedLocale": "fr",
         *       "decision": "canonical",
         *       "redirectStatus": null
         *     }
         * @example {
         *       "schemaVersion": 1,
         *       "mode": "active",
         *       "addressRevision": "51",
         *       "contextRevision": "ctx.17",
         *       "address": {
         *         "artworkId": "11111111-1111-4111-8111-111111111111",
         *         "locale": "fr",
         *         "slug": "masque-dan",
         *         "canonicalPath": "/artworks/masque-dan",
         *         "alternates": [
         *           {
         *             "locale": "fr",
         *             "slug": "masque-dan",
         *             "path": "/artworks/masque-dan"
         *           },
         *           {
         *             "locale": "en",
         *             "slug": "dan-mask",
         *             "path": "/en/artworks/dan-mask"
         *           }
         *         ]
         *       },
         *       "redirect": true,
         *       "requestedLocale": "fr",
         *       "decision": "canonical_redirect",
         *       "redirectStatus": 308
         *     }
         * @example {
         *       "schemaVersion": 1,
         *       "mode": "active",
         *       "addressRevision": "51",
         *       "contextRevision": "ctx.17",
         *       "address": {
         *         "artworkId": "11111111-1111-4111-8111-111111111111",
         *         "locale": "fr",
         *         "slug": "masque-dan",
         *         "canonicalPath": "/artworks/masque-dan",
         *         "alternates": [
         *           {
         *             "locale": "fr",
         *             "slug": "masque-dan",
         *             "path": "/artworks/masque-dan"
         *           }
         *         ]
         *       },
         *       "redirect": true,
         *       "requestedLocale": "en",
         *       "decision": "locale_fallback",
         *       "redirectStatus": 307
         *     }
         */
        Resolution: {
            /** @constant */
            schemaVersion: 1;
            /** @enum {unknown} */
            mode: "legacy" | "active";
            addressRevision: string;
            contextRevision: string;
            address: components["schemas"]["Address"];
            redirect: boolean;
            requestedLocale: string;
            /** @enum {unknown} */
            decision: "canonical" | "canonical_redirect" | "locale_fallback";
            /** @enum {unknown} */
            redirectStatus: null | 307 | 308;
        } & (unknown & unknown & unknown & unknown & unknown);
        Counts: {
            artworks: number;
            addresses: number;
            resolvedCollisions: number;
            provenAliases: number;
            unmappedHistory: number;
            blockers: number;
        };
        Blocker: {
            code: string;
            artworkId: string | null;
            locale: string | null;
            reason: string;
        };
        ActivationReceipt: {
            /** Format: uuid */
            receiptId: string;
            /** Format: uuid */
            operationId: string;
            /** Format: date-time */
            activatedAt: string;
            addressRevision: string;
            reportDigest: string;
            consumerInventoryRevision: string;
            /** @constant */
            minimumContractVersion: 1;
        };
        /** @description Résumé privé. Pour les lignes complètes et tous les blocages, parcourir report. Révision CAS ; reçu durable après COMMIT. */
        Operation: {
            /** @constant */
            schemaVersion: 1;
            /** Format: uuid */
            operationId: string;
            /** @enum {unknown} */
            status: "preparing" | "ready" | "stale" | "blocked" | "active" | "failed";
            revision: string;
            batchSize: number;
            cursor: string | null;
            sourceVectorDigest: string;
            reportDigest: string | null;
            counts: components["schemas"]["Counts"];
            blockers: components["schemas"]["Blocker"][];
            blockersTruncated: boolean;
            receipt: components["schemas"]["ActivationReceipt"] | null;
        };
        State: {
            /** @constant */
            schemaVersion: 1;
            available: boolean;
            /** @enum {unknown} */
            mode: "legacy" | "active";
            /** @enum {unknown} */
            minimumContractVersion: 0 | 1;
            latestOperationId: string | null;
            activatedAt: string | null;
        };
        ReportLine: {
            /** @enum {unknown} */
            kind: "proposed" | "collision" | "blocked" | "proven_alias" | "unmapped_history";
            artworkId: string | null;
            locale: string | null;
            legacyReference: string | null;
            proposedSlug: components["schemas"]["ShortSlug"] | null;
            reason: string;
            proofReference: string | null;
        };
        Report: {
            /** @constant */
            schemaVersion: 1;
            /** Format: uuid */
            operationId: string;
            revision: string;
            reportDigest: string | null;
            items: components["schemas"]["ReportLine"][];
            nextCursor: string | null;
        };
        ReadinessReceipt: {
            /** @constant */
            schemaVersion: 1;
            /** Format: uuid */
            receiptId: string;
            /** Format: uuid */
            operationId: string;
            operationRevision: string;
            reportDigest: string;
            consumerInventoryRevision: string;
            /** Format: date-time */
            validUntil: string;
            passed: boolean;
            blockers: components["schemas"]["Blocker"][];
        };
        /**
         * @example {
         *       "batchSize": 25
         *     }
         */
        PreparationRequest: {
            /** @default 25 */
            batchSize: number;
        };
        /**
         * @example {
         *       "expectedRevision": "1",
         *       "restart": false
         *     }
         * @example {
         *       "expectedRevision": "4",
         *       "restart": true
         *     }
         */
        AdvanceRequest: {
            expectedRevision: string;
            /** @default false */
            restart: boolean;
        };
        /**
         * @example {
         *       "expectedRevision": "4"
         *     }
         */
        CheckConsumersRequest: {
            expectedRevision: string;
        };
        /**
         * @example {
         *       "expectedRevision": "4",
         *       "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
         *       "readinessReceiptId": "33333333-3333-4333-8333-333333333333"
         *     }
         */
        ActivationRequest: {
            expectedRevision: string;
            reportDigest: string;
            /** Format: uuid */
            readinessReceiptId: string;
        };
        Error: {
            error: {
                /** @enum {unknown} */
                code: "invalid_request" | "unauthorized" | "forbidden" | "not_found" | "address_context_changed" | "catalog_changed" | "language_policy_changed" | "operation_revision_conflict" | "preparation_stale" | "activation_blocked" | "idempotency_conflict" | "already_active" | "rate_limited" | "payload_too_large" | "capability_unavailable" | "service_unavailable";
                message: string;
                requestId: string;
            };
        };
        /** @description Format V0 réservé, même non attribué ; UUID propre exclu aussi par validation sémantique. */
        ShortSlug: string;
    };
    responses: {
        /** @description invalid_request */
        Error400: {
            headers: {
                /** @description private, no-store pour ces réponses. */
                "Cache-Control"?: string;
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "code": "invalid_request",
                 *         "message": "Request cannot be completed",
                 *         "requestId": "recipe.039"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description not_found */
        Error404: {
            headers: {
                /** @description private, no-store pour ces réponses. */
                "Cache-Control"?: string;
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "code": "not_found",
                 *         "message": "Request cannot be completed",
                 *         "requestId": "recipe.039"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description address_context_changed */
        Error409: {
            headers: {
                /** @description private, no-store pour ces réponses. */
                "Cache-Control"?: string;
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description rate_limited */
        Error429: {
            headers: {
                /** @description private, no-store pour ces réponses. */
                "Cache-Control"?: string;
                /** @description Secondes lorsque le serveur fournit une échéance de reprise. */
                "Retry-After"?: string;
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "code": "rate_limited",
                 *         "message": "Request cannot be completed",
                 *         "requestId": "recipe.039"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description service_unavailable */
        Error503: {
            headers: {
                /** @description private, no-store pour ces réponses. */
                "Cache-Control"?: string;
                /** @description Secondes lorsque le serveur fournit une échéance de reprise. */
                "Retry-After"?: string;
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "code": "service_unavailable",
                 *         "message": "Request cannot be completed",
                 *         "requestId": "recipe.039"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description unauthorized */
        Error401: {
            headers: {
                /** @description private, no-store pour ces réponses. */
                "Cache-Control"?: string;
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "code": "unauthorized",
                 *         "message": "Request cannot be completed",
                 *         "requestId": "recipe.039"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description forbidden */
        Error403: {
            headers: {
                /** @description private, no-store pour ces réponses. */
                "Cache-Control"?: string;
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "code": "forbidden",
                 *         "message": "Request cannot be completed",
                 *         "requestId": "recipe.039"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
        /** @description payload_too_large */
        Error413: {
            headers: {
                /** @description private, no-store pour ces réponses. */
                "Cache-Control"?: string;
                [name: string]: unknown;
            };
            content: {
                /**
                 * @example {
                 *       "error": {
                 *         "code": "payload_too_large",
                 *         "message": "Request cannot be completed",
                 *         "requestId": "recipe.039"
                 *       }
                 *     }
                 */
                "application/json": components["schemas"]["Error"];
            };
        };
    };
    parameters: {
        /** @description Absent : document V0 exact. Présent : extension artworkAddresses AddressSet, confirmation de contrat en réponse, Vary et no-store. Valeur inconnue refusée. */
        AddressContract: "1";
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getArtworkAddressCapabilities: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Succès */
            200: {
                headers: {
                    /** @description private, no-store pour ces réponses. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "schemaVersion": 1,
                     *       "available": true,
                     *       "mode": "legacy",
                     *       "addressRevision": "50",
                     *       "minimumContractVersion": 0
                     *     }
                     */
                    "application/json": components["schemas"]["Capability"];
                };
            };
            400: components["responses"]["Error400"];
            404: components["responses"]["Error404"];
            409: components["responses"]["Error409"];
            429: components["responses"]["Error429"];
            503: components["responses"]["Error503"];
        };
    };
    resolvePublicArtworkAddress: {
        parameters: {
            query: {
                locale: string;
                /** @description Exactement un de reference ou path ; UUID, slug V0 ou court. UUID normalisé, jamais rapprochement par titre. */
                reference?: string;
                /** @description Ancien chemin relatif attesté, sans query/fragment/hôte ni double décodage. Exactement un de reference ou path. */
                path?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Succès */
            200: {
                headers: {
                    /** @description private, no-store pour ces réponses. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "schemaVersion": 1,
                     *       "mode": "active",
                     *       "addressRevision": "51",
                     *       "contextRevision": "ctx.17",
                     *       "address": {
                     *         "artworkId": "11111111-1111-4111-8111-111111111111",
                     *         "locale": "fr",
                     *         "slug": "masque-dan",
                     *         "canonicalPath": "/artworks/masque-dan",
                     *         "alternates": [
                     *           {
                     *             "locale": "fr",
                     *             "slug": "masque-dan",
                     *             "path": "/artworks/masque-dan"
                     *           },
                     *           {
                     *             "locale": "en",
                     *             "slug": "dan-mask",
                     *             "path": "/en/artworks/dan-mask"
                     *           }
                     *         ]
                     *       },
                     *       "redirect": true,
                     *       "requestedLocale": "fr",
                     *       "decision": "canonical_redirect",
                     *       "redirectStatus": 308
                     *     }
                     */
                    "application/json": components["schemas"]["Resolution"];
                };
            };
            400: components["responses"]["Error400"];
            404: components["responses"]["Error404"];
            409: components["responses"]["Error409"];
            429: components["responses"]["Error429"];
            503: components["responses"]["Error503"];
        };
    };
    lookupPublicArtworkAddresses: {
        parameters: {
            query: {
                locale: string;
                /** @description Liste CSV, un seul paramètre, ordre stable de réponse pour les identités publiques demandées. */
                ids: string[];
                /** @description Si différente : 409 address_context_changed ; pas de mélange de contextes. */
                contextRevision?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Succès */
            200: {
                headers: {
                    /** @description private, no-store pour ces réponses. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "schemaVersion": 1,
                     *       "mode": "active",
                     *       "addressRevision": "51",
                     *       "contextRevision": "ctx.17",
                     *       "items": [
                     *         {
                     *           "artworkId": "11111111-1111-4111-8111-111111111111",
                     *           "locale": "fr",
                     *           "slug": "masque-dan",
                     *           "canonicalPath": "/artworks/masque-dan",
                     *           "alternates": [
                     *             {
                     *               "locale": "fr",
                     *               "slug": "masque-dan",
                     *               "path": "/artworks/masque-dan"
                     *             },
                     *             {
                     *               "locale": "en",
                     *               "slug": "dan-mask",
                     *               "path": "/en/artworks/dan-mask"
                     *             }
                     *           ]
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["Lookup"];
                };
            };
            400: components["responses"]["Error400"];
            404: components["responses"]["Error404"];
            409: components["responses"]["Error409"];
            429: components["responses"]["Error429"];
            503: components["responses"]["Error503"];
        };
    };
    getArtworkAddressState: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Succès */
            200: {
                headers: {
                    /** @description private, no-store pour ces réponses. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "schemaVersion": 1,
                     *       "available": true,
                     *       "mode": "legacy",
                     *       "minimumContractVersion": 0,
                     *       "latestOperationId": "22222222-2222-4222-8222-222222222222",
                     *       "activatedAt": null
                     *     }
                     */
                    "application/json": components["schemas"]["State"];
                };
            };
            400: components["responses"]["Error400"];
            401: components["responses"]["Error401"];
            403: components["responses"]["Error403"];
            404: components["responses"]["Error404"];
            409: components["responses"]["Error409"];
            429: components["responses"]["Error429"];
            503: components["responses"]["Error503"];
        };
    };
    prepareArtworkAddresses: {
        parameters: {
            query?: never;
            header: {
                /** @description Clé unique site/acteur ; empreinte méthode, chemin avec operationId, query et corps canoniques. Rejeu exact : résultat durable ; autre cible/contenu : 409. */
                "Idempotency-Key": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PreparationRequest"];
            };
        };
        responses: {
            /** @description Succès */
            201: {
                headers: {
                    /** @description private, no-store pour ces réponses. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "schemaVersion": 1,
                     *       "operationId": "22222222-2222-4222-8222-222222222222",
                     *       "status": "preparing",
                     *       "revision": "0",
                     *       "batchSize": 25,
                     *       "cursor": null,
                     *       "sourceVectorDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                     *       "reportDigest": null,
                     *       "counts": {
                     *         "artworks": 0,
                     *         "addresses": 0,
                     *         "resolvedCollisions": 0,
                     *         "provenAliases": 0,
                     *         "unmappedHistory": 0,
                     *         "blockers": 0
                     *       },
                     *       "blockers": [],
                     *       "blockersTruncated": false,
                     *       "receipt": null
                     *     }
                     */
                    "application/json": components["schemas"]["Operation"];
                };
            };
            400: components["responses"]["Error400"];
            401: components["responses"]["Error401"];
            403: components["responses"]["Error403"];
            404: components["responses"]["Error404"];
            409: components["responses"]["Error409"];
            413: components["responses"]["Error413"];
            429: components["responses"]["Error429"];
            503: components["responses"]["Error503"];
        };
    };
    getArtworkAddressOperation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                operationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Succès */
            200: {
                headers: {
                    /** @description private, no-store pour ces réponses. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "schemaVersion": 1,
                     *       "operationId": "22222222-2222-4222-8222-222222222222",
                     *       "status": "ready",
                     *       "revision": "4",
                     *       "batchSize": 25,
                     *       "cursor": null,
                     *       "sourceVectorDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                     *       "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                     *       "counts": {
                     *         "artworks": 25,
                     *         "addresses": 50,
                     *         "resolvedCollisions": 2,
                     *         "provenAliases": 3,
                     *         "unmappedHistory": 1,
                     *         "blockers": 0
                     *       },
                     *       "blockers": [],
                     *       "blockersTruncated": false,
                     *       "receipt": null
                     *     }
                     */
                    "application/json": components["schemas"]["Operation"];
                };
            };
            400: components["responses"]["Error400"];
            401: components["responses"]["Error401"];
            403: components["responses"]["Error403"];
            404: components["responses"]["Error404"];
            409: components["responses"]["Error409"];
            429: components["responses"]["Error429"];
            503: components["responses"]["Error503"];
        };
    };
    getArtworkAddressReport: {
        parameters: {
            query?: {
                cursor?: string;
                limit?: number;
            };
            header?: never;
            path: {
                operationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Succès */
            200: {
                headers: {
                    /** @description private, no-store pour ces réponses. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "schemaVersion": 1,
                     *       "operationId": "22222222-2222-4222-8222-222222222222",
                     *       "revision": "4",
                     *       "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                     *       "items": [
                     *         {
                     *           "kind": "collision",
                     *           "artworkId": "44444444-4444-4444-8444-444444444444",
                     *           "locale": "fr",
                     *           "legacyReference": "artwork-44444444444444448444444444444444",
                     *           "proposedSlug": "masque-dan-2",
                     *           "reason": "base_reserved",
                     *           "proofReference": null
                     *         },
                     *         {
                     *           "kind": "unmapped_history",
                     *           "artworkId": null,
                     *           "locale": "fr",
                     *           "legacyReference": "/ancienne-collection/inconnue",
                     *           "proposedSlug": null,
                     *           "reason": "no_attested_owner",
                     *           "proofReference": null
                     *         }
                     *       ],
                     *       "nextCursor": null
                     *     }
                     */
                    "application/json": components["schemas"]["Report"];
                };
            };
            400: components["responses"]["Error400"];
            401: components["responses"]["Error401"];
            403: components["responses"]["Error403"];
            404: components["responses"]["Error404"];
            409: components["responses"]["Error409"];
            429: components["responses"]["Error429"];
            503: components["responses"]["Error503"];
        };
    };
    advanceArtworkAddressPreparation: {
        parameters: {
            query?: never;
            header: {
                /** @description Clé unique site/acteur ; empreinte méthode, chemin avec operationId, query et corps canoniques. Rejeu exact : résultat durable ; autre cible/contenu : 409. */
                "Idempotency-Key": string;
            };
            path: {
                operationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdvanceRequest"];
            };
        };
        responses: {
            /** @description Succès */
            200: {
                headers: {
                    /** @description private, no-store pour ces réponses. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "schemaVersion": 1,
                     *       "operationId": "22222222-2222-4222-8222-222222222222",
                     *       "status": "ready",
                     *       "revision": "4",
                     *       "batchSize": 25,
                     *       "cursor": null,
                     *       "sourceVectorDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                     *       "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                     *       "counts": {
                     *         "artworks": 25,
                     *         "addresses": 50,
                     *         "resolvedCollisions": 2,
                     *         "provenAliases": 3,
                     *         "unmappedHistory": 1,
                     *         "blockers": 0
                     *       },
                     *       "blockers": [],
                     *       "blockersTruncated": false,
                     *       "receipt": null
                     *     }
                     */
                    "application/json": components["schemas"]["Operation"];
                };
            };
            400: components["responses"]["Error400"];
            401: components["responses"]["Error401"];
            403: components["responses"]["Error403"];
            404: components["responses"]["Error404"];
            409: components["responses"]["Error409"];
            413: components["responses"]["Error413"];
            429: components["responses"]["Error429"];
            503: components["responses"]["Error503"];
        };
    };
    checkArtworkAddressConsumers: {
        parameters: {
            query?: never;
            header: {
                /** @description Clé unique site/acteur ; empreinte méthode, chemin avec operationId, query et corps canoniques. Rejeu exact : résultat durable ; autre cible/contenu : 409. */
                "Idempotency-Key": string;
            };
            path: {
                operationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CheckConsumersRequest"];
            };
        };
        responses: {
            /** @description Succès */
            200: {
                headers: {
                    /** @description private, no-store pour ces réponses. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "schemaVersion": 1,
                     *       "receiptId": "33333333-3333-4333-8333-333333333333",
                     *       "operationId": "22222222-2222-4222-8222-222222222222",
                     *       "operationRevision": "4",
                     *       "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                     *       "consumerInventoryRevision": "inventory.7",
                     *       "validUntil": "2026-11-27T14:05:00Z",
                     *       "passed": true,
                     *       "blockers": []
                     *     }
                     */
                    "application/json": components["schemas"]["ReadinessReceipt"];
                };
            };
            400: components["responses"]["Error400"];
            401: components["responses"]["Error401"];
            403: components["responses"]["Error403"];
            404: components["responses"]["Error404"];
            409: components["responses"]["Error409"];
            413: components["responses"]["Error413"];
            429: components["responses"]["Error429"];
            503: components["responses"]["Error503"];
        };
    };
    activateArtworkAddresses: {
        parameters: {
            query?: never;
            header: {
                /** @description Clé unique site/acteur ; empreinte méthode, chemin avec operationId, query et corps canoniques. Rejeu exact : résultat durable ; autre cible/contenu : 409. */
                "Idempotency-Key": string;
            };
            path: {
                operationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActivationRequest"];
            };
        };
        responses: {
            /** @description Succès */
            200: {
                headers: {
                    /** @description private, no-store pour ces réponses. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "schemaVersion": 1,
                     *       "operationId": "22222222-2222-4222-8222-222222222222",
                     *       "status": "active",
                     *       "revision": "5",
                     *       "batchSize": 25,
                     *       "cursor": null,
                     *       "sourceVectorDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                     *       "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                     *       "counts": {
                     *         "artworks": 25,
                     *         "addresses": 50,
                     *         "resolvedCollisions": 2,
                     *         "provenAliases": 3,
                     *         "unmappedHistory": 1,
                     *         "blockers": 0
                     *       },
                     *       "blockers": [],
                     *       "blockersTruncated": false,
                     *       "receipt": {
                     *         "receiptId": "33333333-3333-4333-8333-333333333333",
                     *         "operationId": "22222222-2222-4222-8222-222222222222",
                     *         "activatedAt": "2026-11-27T14:00:00Z",
                     *         "addressRevision": "51",
                     *         "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                     *         "consumerInventoryRevision": "inventory.7",
                     *         "minimumContractVersion": 1
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["Operation"];
                };
            };
            400: components["responses"]["Error400"];
            401: components["responses"]["Error401"];
            403: components["responses"]["Error403"];
            404: components["responses"]["Error404"];
            409: components["responses"]["Error409"];
            413: components["responses"]["Error413"];
            429: components["responses"]["Error429"];
            503: components["responses"]["Error503"];
        };
    };
}
