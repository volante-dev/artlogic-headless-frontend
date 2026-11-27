// Generated from feature039 contracts. Do not edit; independent of legacy fingerprints.
export const artworkAddressContractDigest="ee5e933eaf4b051df5f02dcdbd7a941e14e96dad4d8d9966486ca3a4d6cc620c";
export const artworkAddressSchemas={
  "Capability": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "schemaVersion": {
        "const": 1
      },
      "available": {
        "type": "boolean"
      },
      "mode": {
        "enum": [
          "legacy",
          "active"
        ]
      },
      "addressRevision": {
        "anyOf": [
          {
            "type": "string",
            "pattern": "^(0|[1-9][0-9]*)$",
            "maxLength": 30
          },
          {
            "type": "null"
          }
        ]
      },
      "minimumContractVersion": {
        "enum": [
          0,
          1
        ]
      }
    },
    "required": [
      "schemaVersion",
      "available",
      "mode",
      "addressRevision",
      "minimumContractVersion"
    ],
    "allOf": [
      {
        "if": {
          "properties": {
            "mode": {
              "const": "active"
            }
          }
        },
        "then": {
          "properties": {
            "available": {
              "const": true
            },
            "minimumContractVersion": {
              "const": 1
            },
            "addressRevision": {
              "type": "string",
              "pattern": "^(0|[1-9][0-9]*)$",
              "maxLength": 30
            }
          }
        }
      }
    ],
    "examples": [
      {
        "schemaVersion": 1,
        "available": true,
        "mode": "legacy",
        "addressRevision": "50",
        "minimumContractVersion": 0
      },
      {
        "schemaVersion": 1,
        "available": false,
        "mode": "legacy",
        "addressRevision": null,
        "minimumContractVersion": 0
      },
      {
        "schemaVersion": 1,
        "available": true,
        "mode": "active",
        "addressRevision": "51",
        "minimumContractVersion": 1
      }
    ]
  },
  "LocalizedPath": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "locale": {
        "type": "string",
        "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
        "maxLength": 35
      },
      "slug": {
        "type": "string",
        "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
        "minLength": 1,
        "maxLength": 113
      },
      "path": {
        "type": "string",
        "pattern": "^/(?!/)[^?#\\\\\\s]*$",
        "maxLength": 2048
      }
    },
    "required": [
      "locale",
      "slug",
      "path"
    ]
  },
  "Address": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "artworkId": {
        "type": "string",
        "format": "uuid"
      },
      "locale": {
        "type": "string",
        "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
        "maxLength": 35
      },
      "slug": {
        "type": "string",
        "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
        "minLength": 1,
        "maxLength": 113
      },
      "canonicalPath": {
        "type": "string",
        "pattern": "^/(?!/)[^?#\\\\\\s]*$",
        "maxLength": 2048
      },
      "alternates": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "locale": {
              "type": "string",
              "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
              "maxLength": 35
            },
            "slug": {
              "type": "string",
              "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
              "minLength": 1,
              "maxLength": 113
            },
            "path": {
              "type": "string",
              "pattern": "^/(?!/)[^?#\\\\\\s]*$",
              "maxLength": 2048
            }
          },
          "required": [
            "locale",
            "slug",
            "path"
          ]
        },
        "maxItems": 8
      }
    },
    "required": [
      "artworkId",
      "locale",
      "slug",
      "canonicalPath",
      "alternates"
    ],
    "description": "Chemins serveur du même UUID, locales publiques seulement. Mode actif : slug <=80 ; forme, locale, identité et chemins vérifiés ensemble par le lecteur."
  },
  "AddressSet": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "schemaVersion": {
        "const": 1
      },
      "mode": {
        "enum": [
          "legacy",
          "active"
        ]
      },
      "addressRevision": {
        "type": "string",
        "pattern": "^(0|[1-9][0-9]*)$",
        "maxLength": 30
      },
      "contextRevision": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
      },
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "artworkId": {
              "type": "string",
              "format": "uuid"
            },
            "locale": {
              "type": "string",
              "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
              "maxLength": 35
            },
            "slug": {
              "type": "string",
              "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
              "minLength": 1,
              "maxLength": 113
            },
            "canonicalPath": {
              "type": "string",
              "pattern": "^/(?!/)[^?#\\\\\\s]*$",
              "maxLength": 2048
            },
            "alternates": {
              "type": "array",
              "items": {
                "type": "object",
                "additionalProperties": false,
                "properties": {
                  "locale": {
                    "type": "string",
                    "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
                    "maxLength": 35
                  },
                  "slug": {
                    "type": "string",
                    "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                    "minLength": 1,
                    "maxLength": 113
                  },
                  "path": {
                    "type": "string",
                    "pattern": "^/(?!/)[^?#\\\\\\s]*$",
                    "maxLength": 2048
                  }
                },
                "required": [
                  "locale",
                  "slug",
                  "path"
                ]
              },
              "maxItems": 8
            }
          },
          "required": [
            "artworkId",
            "locale",
            "slug",
            "canonicalPath",
            "alternates"
          ],
          "description": "Chemins serveur du même UUID, locales publiques seulement. Mode actif : slug <=80 ; forme, locale, identité et chemins vérifiés ensemble par le lecteur."
        }
      }
    },
    "required": [
      "schemaVersion",
      "mode",
      "addressRevision",
      "contextRevision",
      "items"
    ],
    "description": "Extension top-level artworkAddresses négociée. Liste bornée par la réponse métier et ses limites existantes ; dédupliquée par artworkId. Allocation en lots <=100, jamais un scan global.",
    "allOf": [
      {
        "if": {
          "properties": {
            "mode": {
              "const": "active"
            }
          }
        },
        "then": {
          "properties": {
            "items": {
              "items": {
                "properties": {
                  "slug": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 80,
                    "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                    "not": {
                      "anyOf": [
                        {
                          "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                        },
                        {
                          "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
                        }
                      ]
                    },
                    "description": "Format V0 réservé, même non attribué ; UUID propre exclu aussi par validation sémantique."
                  },
                  "alternates": {
                    "items": {
                      "properties": {
                        "slug": {
                          "type": "string",
                          "minLength": 1,
                          "maxLength": 80,
                          "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                          "not": {
                            "anyOf": [
                              {
                                "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                              },
                              {
                                "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
                              }
                            ]
                          },
                          "description": "Format V0 réservé, même non attribué ; UUID propre exclu aussi par validation sémantique."
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        "if": {
          "properties": {
            "mode": {
              "const": "legacy"
            }
          }
        },
        "then": {
          "properties": {
            "items": {
              "items": {
                "allOf": [
                  {
                    "properties": {
                      "slug": {
                        "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                      }
                    }
                  },
                  {
                    "properties": {
                      "alternates": {
                        "items": {
                          "properties": {
                            "slug": {
                              "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                            }
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ],
    "examples": [
      {
        "schemaVersion": 1,
        "mode": "active",
        "addressRevision": "51",
        "contextRevision": "ctx.17",
        "items": [
          {
            "artworkId": "11111111-1111-4111-8111-111111111111",
            "locale": "fr",
            "slug": "masque-dan",
            "canonicalPath": "/artworks/masque-dan",
            "alternates": [
              {
                "locale": "fr",
                "slug": "masque-dan",
                "path": "/artworks/masque-dan"
              },
              {
                "locale": "en",
                "slug": "dan-mask",
                "path": "/en/artworks/dan-mask"
              }
            ]
          }
        ]
      },
      {
        "schemaVersion": 1,
        "mode": "legacy",
        "addressRevision": "50",
        "contextRevision": "ctx.16",
        "items": [
          {
            "artworkId": "11111111-1111-4111-8111-111111111111",
            "locale": "fr",
            "slug": "masque-dan-11111111111141118111111111111111",
            "canonicalPath": "/artworks/masque-dan-11111111111141118111111111111111",
            "alternates": [
              {
                "locale": "en",
                "slug": "masque-dan-11111111111141118111111111111111",
                "path": "/en/artworks/masque-dan-11111111111141118111111111111111"
              }
            ]
          }
        ]
      }
    ]
  },
  "Lookup": {
    "allOf": [
      {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "schemaVersion": {
            "const": 1
          },
          "mode": {
            "enum": [
              "legacy",
              "active"
            ]
          },
          "addressRevision": {
            "type": "string",
            "pattern": "^(0|[1-9][0-9]*)$",
            "maxLength": 30
          },
          "contextRevision": {
            "type": "string",
            "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
          },
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "properties": {
                "artworkId": {
                  "type": "string",
                  "format": "uuid"
                },
                "locale": {
                  "type": "string",
                  "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
                  "maxLength": 35
                },
                "slug": {
                  "type": "string",
                  "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                  "minLength": 1,
                  "maxLength": 113
                },
                "canonicalPath": {
                  "type": "string",
                  "pattern": "^/(?!/)[^?#\\\\\\s]*$",
                  "maxLength": 2048
                },
                "alternates": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                      "locale": {
                        "type": "string",
                        "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
                        "maxLength": 35
                      },
                      "slug": {
                        "type": "string",
                        "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                        "minLength": 1,
                        "maxLength": 113
                      },
                      "path": {
                        "type": "string",
                        "pattern": "^/(?!/)[^?#\\\\\\s]*$",
                        "maxLength": 2048
                      }
                    },
                    "required": [
                      "locale",
                      "slug",
                      "path"
                    ]
                  },
                  "maxItems": 8
                }
              },
              "required": [
                "artworkId",
                "locale",
                "slug",
                "canonicalPath",
                "alternates"
              ],
              "description": "Chemins serveur du même UUID, locales publiques seulement. Mode actif : slug <=80 ; forme, locale, identité et chemins vérifiés ensemble par le lecteur."
            }
          }
        },
        "required": [
          "schemaVersion",
          "mode",
          "addressRevision",
          "contextRevision",
          "items"
        ],
        "description": "Extension top-level artworkAddresses négociée. Liste bornée par la réponse métier et ses limites existantes ; dédupliquée par artworkId. Allocation en lots <=100, jamais un scan global.",
        "allOf": [
          {
            "if": {
              "properties": {
                "mode": {
                  "const": "active"
                }
              }
            },
            "then": {
              "properties": {
                "items": {
                  "items": {
                    "properties": {
                      "slug": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 80,
                        "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                        "not": {
                          "anyOf": [
                            {
                              "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                            },
                            {
                              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
                            }
                          ]
                        },
                        "description": "Format V0 réservé, même non attribué ; UUID propre exclu aussi par validation sémantique."
                      },
                      "alternates": {
                        "items": {
                          "properties": {
                            "slug": {
                              "type": "string",
                              "minLength": 1,
                              "maxLength": 80,
                              "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                              "not": {
                                "anyOf": [
                                  {
                                    "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                                  },
                                  {
                                    "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
                                  }
                                ]
                              },
                              "description": "Format V0 réservé, même non attribué ; UUID propre exclu aussi par validation sémantique."
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          {
            "if": {
              "properties": {
                "mode": {
                  "const": "legacy"
                }
              }
            },
            "then": {
              "properties": {
                "items": {
                  "items": {
                    "allOf": [
                      {
                        "properties": {
                          "slug": {
                            "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                          }
                        }
                      },
                      {
                        "properties": {
                          "alternates": {
                            "items": {
                              "properties": {
                                "slug": {
                                  "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                                }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        ],
        "examples": [
          {
            "schemaVersion": 1,
            "mode": "active",
            "addressRevision": "51",
            "contextRevision": "ctx.17",
            "items": [
              {
                "artworkId": "11111111-1111-4111-8111-111111111111",
                "locale": "fr",
                "slug": "masque-dan",
                "canonicalPath": "/artworks/masque-dan",
                "alternates": [
                  {
                    "locale": "fr",
                    "slug": "masque-dan",
                    "path": "/artworks/masque-dan"
                  },
                  {
                    "locale": "en",
                    "slug": "dan-mask",
                    "path": "/en/artworks/dan-mask"
                  }
                ]
              }
            ]
          },
          {
            "schemaVersion": 1,
            "mode": "legacy",
            "addressRevision": "50",
            "contextRevision": "ctx.16",
            "items": [
              {
                "artworkId": "11111111-1111-4111-8111-111111111111",
                "locale": "fr",
                "slug": "masque-dan-11111111111141118111111111111111",
                "canonicalPath": "/artworks/masque-dan-11111111111141118111111111111111",
                "alternates": [
                  {
                    "locale": "en",
                    "slug": "masque-dan-11111111111141118111111111111111",
                    "path": "/en/artworks/masque-dan-11111111111141118111111111111111"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "properties": {
          "items": {
            "maxItems": 100
          }
        }
      }
    ]
  },
  "Resolution": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "schemaVersion": {
        "const": 1
      },
      "mode": {
        "enum": [
          "legacy",
          "active"
        ]
      },
      "addressRevision": {
        "type": "string",
        "pattern": "^(0|[1-9][0-9]*)$",
        "maxLength": 30
      },
      "contextRevision": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
      },
      "address": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "artworkId": {
            "type": "string",
            "format": "uuid"
          },
          "locale": {
            "type": "string",
            "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
            "maxLength": 35
          },
          "slug": {
            "type": "string",
            "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            "minLength": 1,
            "maxLength": 113
          },
          "canonicalPath": {
            "type": "string",
            "pattern": "^/(?!/)[^?#\\\\\\s]*$",
            "maxLength": 2048
          },
          "alternates": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "properties": {
                "locale": {
                  "type": "string",
                  "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
                  "maxLength": 35
                },
                "slug": {
                  "type": "string",
                  "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                  "minLength": 1,
                  "maxLength": 113
                },
                "path": {
                  "type": "string",
                  "pattern": "^/(?!/)[^?#\\\\\\s]*$",
                  "maxLength": 2048
                }
              },
              "required": [
                "locale",
                "slug",
                "path"
              ]
            },
            "maxItems": 8
          }
        },
        "required": [
          "artworkId",
          "locale",
          "slug",
          "canonicalPath",
          "alternates"
        ],
        "description": "Chemins serveur du même UUID, locales publiques seulement. Mode actif : slug <=80 ; forme, locale, identité et chemins vérifiés ensemble par le lecteur."
      },
      "redirect": {
        "type": "boolean"
      },
      "requestedLocale": {
        "type": "string",
        "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
        "maxLength": 35
      },
      "decision": {
        "enum": [
          "canonical",
          "canonical_redirect",
          "locale_fallback"
        ]
      },
      "redirectStatus": {
        "enum": [
          null,
          307,
          308
        ]
      }
    },
    "required": [
      "schemaVersion",
      "mode",
      "addressRevision",
      "contextRevision",
      "address",
      "redirect",
      "requestedLocale",
      "decision",
      "redirectStatus"
    ],
    "description": "Décision JSON : canonique servie, canonisation permanente 308, ou repli linguistique réversible 307. Adresse de la même identité publique ; pas de divulgation de locale inactive.",
    "allOf": [
      {
        "if": {
          "properties": {
            "mode": {
              "const": "active"
            }
          }
        },
        "then": {
          "properties": {
            "address": {
              "properties": {
                "slug": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 80,
                  "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                  "not": {
                    "anyOf": [
                      {
                        "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                      },
                      {
                        "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
                      }
                    ]
                  },
                  "description": "Format V0 réservé, même non attribué ; UUID propre exclu aussi par validation sémantique."
                },
                "alternates": {
                  "items": {
                    "properties": {
                      "slug": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 80,
                        "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                        "not": {
                          "anyOf": [
                            {
                              "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                            },
                            {
                              "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
                            }
                          ]
                        },
                        "description": "Format V0 réservé, même non attribué ; UUID propre exclu aussi par validation sémantique."
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        "if": {
          "properties": {
            "mode": {
              "const": "legacy"
            }
          }
        },
        "then": {
          "properties": {
            "address": {
              "allOf": [
                {
                  "properties": {
                    "slug": {
                      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                    }
                  }
                },
                {
                  "properties": {
                    "alternates": {
                      "items": {
                        "properties": {
                          "slug": {
                            "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                          }
                        }
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      },
      {
        "if": {
          "properties": {
            "decision": {
              "const": "canonical"
            }
          }
        },
        "then": {
          "properties": {
            "redirect": {
              "const": false
            },
            "redirectStatus": {
              "const": null
            }
          }
        }
      },
      {
        "if": {
          "properties": {
            "decision": {
              "const": "canonical_redirect"
            }
          }
        },
        "then": {
          "properties": {
            "redirect": {
              "const": true
            },
            "redirectStatus": {
              "const": 308
            }
          }
        }
      },
      {
        "if": {
          "properties": {
            "decision": {
              "const": "locale_fallback"
            }
          }
        },
        "then": {
          "properties": {
            "redirect": {
              "const": true
            },
            "redirectStatus": {
              "const": 307
            }
          }
        }
      }
    ],
    "examples": [
      {
        "schemaVersion": 1,
        "mode": "active",
        "addressRevision": "51",
        "contextRevision": "ctx.17",
        "address": {
          "artworkId": "11111111-1111-4111-8111-111111111111",
          "locale": "fr",
          "slug": "masque-dan",
          "canonicalPath": "/artworks/masque-dan",
          "alternates": [
            {
              "locale": "fr",
              "slug": "masque-dan",
              "path": "/artworks/masque-dan"
            },
            {
              "locale": "en",
              "slug": "dan-mask",
              "path": "/en/artworks/dan-mask"
            }
          ]
        },
        "redirect": false,
        "requestedLocale": "fr",
        "decision": "canonical",
        "redirectStatus": null
      },
      {
        "schemaVersion": 1,
        "mode": "active",
        "addressRevision": "51",
        "contextRevision": "ctx.17",
        "address": {
          "artworkId": "11111111-1111-4111-8111-111111111111",
          "locale": "fr",
          "slug": "masque-dan",
          "canonicalPath": "/artworks/masque-dan",
          "alternates": [
            {
              "locale": "fr",
              "slug": "masque-dan",
              "path": "/artworks/masque-dan"
            },
            {
              "locale": "en",
              "slug": "dan-mask",
              "path": "/en/artworks/dan-mask"
            }
          ]
        },
        "redirect": true,
        "requestedLocale": "fr",
        "decision": "canonical_redirect",
        "redirectStatus": 308
      },
      {
        "schemaVersion": 1,
        "mode": "active",
        "addressRevision": "51",
        "contextRevision": "ctx.17",
        "address": {
          "artworkId": "11111111-1111-4111-8111-111111111111",
          "locale": "fr",
          "slug": "masque-dan",
          "canonicalPath": "/artworks/masque-dan",
          "alternates": [
            {
              "locale": "fr",
              "slug": "masque-dan",
              "path": "/artworks/masque-dan"
            }
          ]
        },
        "redirect": true,
        "requestedLocale": "en",
        "decision": "locale_fallback",
        "redirectStatus": 307
      }
    ]
  },
  "Counts": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "artworks": {
        "type": "integer",
        "minimum": 0
      },
      "addresses": {
        "type": "integer",
        "minimum": 0
      },
      "resolvedCollisions": {
        "type": "integer",
        "minimum": 0
      },
      "provenAliases": {
        "type": "integer",
        "minimum": 0
      },
      "unmappedHistory": {
        "type": "integer",
        "minimum": 0
      },
      "blockers": {
        "type": "integer",
        "minimum": 0
      }
    },
    "required": [
      "artworks",
      "addresses",
      "resolvedCollisions",
      "provenAliases",
      "unmappedHistory",
      "blockers"
    ]
  },
  "Blocker": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "code": {
        "type": "string",
        "minLength": 1,
        "maxLength": 80
      },
      "artworkId": {
        "anyOf": [
          {
            "type": "string",
            "format": "uuid"
          },
          {
            "type": "null"
          }
        ]
      },
      "locale": {
        "anyOf": [
          {
            "type": "string",
            "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
            "maxLength": 35
          },
          {
            "type": "null"
          }
        ]
      },
      "reason": {
        "type": "string",
        "minLength": 1,
        "maxLength": 500
      }
    },
    "required": [
      "code",
      "artworkId",
      "locale",
      "reason"
    ]
  },
  "ActivationReceipt": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "receiptId": {
        "type": "string",
        "format": "uuid"
      },
      "operationId": {
        "type": "string",
        "format": "uuid"
      },
      "activatedAt": {
        "type": "string",
        "format": "date-time"
      },
      "addressRevision": {
        "type": "string",
        "pattern": "^(0|[1-9][0-9]*)$",
        "maxLength": 30
      },
      "reportDigest": {
        "type": "string",
        "pattern": "^[0-9a-f]{64}$"
      },
      "consumerInventoryRevision": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
      },
      "minimumContractVersion": {
        "const": 1
      }
    },
    "required": [
      "receiptId",
      "operationId",
      "activatedAt",
      "addressRevision",
      "reportDigest",
      "consumerInventoryRevision",
      "minimumContractVersion"
    ]
  },
  "Operation": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "schemaVersion": {
        "const": 1
      },
      "operationId": {
        "type": "string",
        "format": "uuid"
      },
      "status": {
        "enum": [
          "preparing",
          "ready",
          "stale",
          "blocked",
          "active",
          "failed"
        ]
      },
      "revision": {
        "type": "string",
        "pattern": "^(0|[1-9][0-9]*)$",
        "maxLength": 30
      },
      "batchSize": {
        "type": "integer",
        "minimum": 1,
        "maximum": 100
      },
      "cursor": {
        "anyOf": [
          {
            "type": "string",
            "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
          },
          {
            "type": "null"
          }
        ]
      },
      "sourceVectorDigest": {
        "type": "string",
        "pattern": "^[0-9a-f]{64}$"
      },
      "reportDigest": {
        "anyOf": [
          {
            "type": "string",
            "pattern": "^[0-9a-f]{64}$"
          },
          {
            "type": "null"
          }
        ]
      },
      "counts": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "artworks": {
            "type": "integer",
            "minimum": 0
          },
          "addresses": {
            "type": "integer",
            "minimum": 0
          },
          "resolvedCollisions": {
            "type": "integer",
            "minimum": 0
          },
          "provenAliases": {
            "type": "integer",
            "minimum": 0
          },
          "unmappedHistory": {
            "type": "integer",
            "minimum": 0
          },
          "blockers": {
            "type": "integer",
            "minimum": 0
          }
        },
        "required": [
          "artworks",
          "addresses",
          "resolvedCollisions",
          "provenAliases",
          "unmappedHistory",
          "blockers"
        ]
      },
      "blockers": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "code": {
              "type": "string",
              "minLength": 1,
              "maxLength": 80
            },
            "artworkId": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "uuid"
                },
                {
                  "type": "null"
                }
              ]
            },
            "locale": {
              "anyOf": [
                {
                  "type": "string",
                  "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
                  "maxLength": 35
                },
                {
                  "type": "null"
                }
              ]
            },
            "reason": {
              "type": "string",
              "minLength": 1,
              "maxLength": 500
            }
          },
          "required": [
            "code",
            "artworkId",
            "locale",
            "reason"
          ]
        },
        "maxItems": 100
      },
      "blockersTruncated": {
        "type": "boolean"
      },
      "receipt": {
        "anyOf": [
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "receiptId": {
                "type": "string",
                "format": "uuid"
              },
              "operationId": {
                "type": "string",
                "format": "uuid"
              },
              "activatedAt": {
                "type": "string",
                "format": "date-time"
              },
              "addressRevision": {
                "type": "string",
                "pattern": "^(0|[1-9][0-9]*)$",
                "maxLength": 30
              },
              "reportDigest": {
                "type": "string",
                "pattern": "^[0-9a-f]{64}$"
              },
              "consumerInventoryRevision": {
                "type": "string",
                "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
              },
              "minimumContractVersion": {
                "const": 1
              }
            },
            "required": [
              "receiptId",
              "operationId",
              "activatedAt",
              "addressRevision",
              "reportDigest",
              "consumerInventoryRevision",
              "minimumContractVersion"
            ]
          },
          {
            "type": "null"
          }
        ]
      }
    },
    "required": [
      "schemaVersion",
      "operationId",
      "status",
      "revision",
      "batchSize",
      "cursor",
      "sourceVectorDigest",
      "reportDigest",
      "counts",
      "blockers",
      "blockersTruncated",
      "receipt"
    ],
    "description": "Résumé privé. Pour les lignes complètes et tous les blocages, parcourir report. Révision CAS ; reçu durable après COMMIT."
  },
  "State": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "schemaVersion": {
        "const": 1
      },
      "available": {
        "type": "boolean"
      },
      "mode": {
        "enum": [
          "legacy",
          "active"
        ]
      },
      "minimumContractVersion": {
        "enum": [
          0,
          1
        ]
      },
      "latestOperationId": {
        "anyOf": [
          {
            "type": "string",
            "format": "uuid"
          },
          {
            "type": "null"
          }
        ]
      },
      "activatedAt": {
        "anyOf": [
          {
            "type": "string",
            "format": "date-time"
          },
          {
            "type": "null"
          }
        ]
      }
    },
    "required": [
      "schemaVersion",
      "available",
      "mode",
      "minimumContractVersion",
      "latestOperationId",
      "activatedAt"
    ]
  },
  "ReportLine": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "kind": {
        "enum": [
          "proposed",
          "collision",
          "blocked",
          "proven_alias",
          "unmapped_history"
        ]
      },
      "artworkId": {
        "anyOf": [
          {
            "type": "string",
            "format": "uuid"
          },
          {
            "type": "null"
          }
        ]
      },
      "locale": {
        "anyOf": [
          {
            "type": "string",
            "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
            "maxLength": 35
          },
          {
            "type": "null"
          }
        ]
      },
      "legacyReference": {
        "anyOf": [
          {
            "type": "string",
            "maxLength": 2048
          },
          {
            "type": "null"
          }
        ]
      },
      "proposedSlug": {
        "anyOf": [
          {
            "type": "string",
            "minLength": 1,
            "maxLength": 80,
            "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            "not": {
              "anyOf": [
                {
                  "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                },
                {
                  "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
                }
              ]
            },
            "description": "Format V0 réservé, même non attribué ; UUID propre exclu aussi par validation sémantique."
          },
          {
            "type": "null"
          }
        ]
      },
      "reason": {
        "type": "string",
        "maxLength": 500
      },
      "proofReference": {
        "anyOf": [
          {
            "type": "string",
            "maxLength": 500
          },
          {
            "type": "null"
          }
        ]
      }
    },
    "required": [
      "kind",
      "artworkId",
      "locale",
      "legacyReference",
      "proposedSlug",
      "reason",
      "proofReference"
    ]
  },
  "Report": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "schemaVersion": {
        "const": 1
      },
      "operationId": {
        "type": "string",
        "format": "uuid"
      },
      "revision": {
        "type": "string",
        "pattern": "^(0|[1-9][0-9]*)$",
        "maxLength": 30
      },
      "reportDigest": {
        "anyOf": [
          {
            "type": "string",
            "pattern": "^[0-9a-f]{64}$"
          },
          {
            "type": "null"
          }
        ]
      },
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "kind": {
              "enum": [
                "proposed",
                "collision",
                "blocked",
                "proven_alias",
                "unmapped_history"
              ]
            },
            "artworkId": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "uuid"
                },
                {
                  "type": "null"
                }
              ]
            },
            "locale": {
              "anyOf": [
                {
                  "type": "string",
                  "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
                  "maxLength": 35
                },
                {
                  "type": "null"
                }
              ]
            },
            "legacyReference": {
              "anyOf": [
                {
                  "type": "string",
                  "maxLength": 2048
                },
                {
                  "type": "null"
                }
              ]
            },
            "proposedSlug": {
              "anyOf": [
                {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 80,
                  "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                  "not": {
                    "anyOf": [
                      {
                        "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                      },
                      {
                        "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
                      }
                    ]
                  },
                  "description": "Format V0 réservé, même non attribué ; UUID propre exclu aussi par validation sémantique."
                },
                {
                  "type": "null"
                }
              ]
            },
            "reason": {
              "type": "string",
              "maxLength": 500
            },
            "proofReference": {
              "anyOf": [
                {
                  "type": "string",
                  "maxLength": 500
                },
                {
                  "type": "null"
                }
              ]
            }
          },
          "required": [
            "kind",
            "artworkId",
            "locale",
            "legacyReference",
            "proposedSlug",
            "reason",
            "proofReference"
          ]
        },
        "maxItems": 100
      },
      "nextCursor": {
        "anyOf": [
          {
            "type": "string",
            "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
          },
          {
            "type": "null"
          }
        ]
      }
    },
    "required": [
      "schemaVersion",
      "operationId",
      "revision",
      "reportDigest",
      "items",
      "nextCursor"
    ]
  },
  "ReadinessReceipt": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "schemaVersion": {
        "const": 1
      },
      "receiptId": {
        "type": "string",
        "format": "uuid"
      },
      "operationId": {
        "type": "string",
        "format": "uuid"
      },
      "operationRevision": {
        "type": "string",
        "pattern": "^(0|[1-9][0-9]*)$",
        "maxLength": 30
      },
      "reportDigest": {
        "type": "string",
        "pattern": "^[0-9a-f]{64}$"
      },
      "consumerInventoryRevision": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
      },
      "validUntil": {
        "type": "string",
        "format": "date-time"
      },
      "passed": {
        "type": "boolean"
      },
      "blockers": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "code": {
              "type": "string",
              "minLength": 1,
              "maxLength": 80
            },
            "artworkId": {
              "anyOf": [
                {
                  "type": "string",
                  "format": "uuid"
                },
                {
                  "type": "null"
                }
              ]
            },
            "locale": {
              "anyOf": [
                {
                  "type": "string",
                  "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
                  "maxLength": 35
                },
                {
                  "type": "null"
                }
              ]
            },
            "reason": {
              "type": "string",
              "minLength": 1,
              "maxLength": 500
            }
          },
          "required": [
            "code",
            "artworkId",
            "locale",
            "reason"
          ]
        },
        "maxItems": 100
      }
    },
    "required": [
      "schemaVersion",
      "receiptId",
      "operationId",
      "operationRevision",
      "reportDigest",
      "consumerInventoryRevision",
      "validUntil",
      "passed",
      "blockers"
    ]
  },
  "PreparationRequest": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "batchSize": {
        "type": "integer",
        "minimum": 1,
        "maximum": 100,
        "default": 25
      }
    },
    "required": [],
    "examples": [
      {
        "batchSize": 25
      }
    ]
  },
  "AdvanceRequest": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "expectedRevision": {
        "type": "string",
        "pattern": "^(0|[1-9][0-9]*)$",
        "maxLength": 30
      },
      "restart": {
        "type": "boolean",
        "default": false
      }
    },
    "required": [
      "expectedRevision"
    ],
    "examples": [
      {
        "expectedRevision": "1",
        "restart": false
      },
      {
        "expectedRevision": "4",
        "restart": true
      }
    ]
  },
  "CheckConsumersRequest": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "expectedRevision": {
        "type": "string",
        "pattern": "^(0|[1-9][0-9]*)$",
        "maxLength": 30
      }
    },
    "required": [
      "expectedRevision"
    ],
    "examples": [
      {
        "expectedRevision": "4"
      }
    ]
  },
  "ActivationRequest": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "expectedRevision": {
        "type": "string",
        "pattern": "^(0|[1-9][0-9]*)$",
        "maxLength": 30
      },
      "reportDigest": {
        "type": "string",
        "pattern": "^[0-9a-f]{64}$"
      },
      "readinessReceiptId": {
        "type": "string",
        "format": "uuid"
      }
    },
    "required": [
      "expectedRevision",
      "reportDigest",
      "readinessReceiptId"
    ],
    "examples": [
      {
        "expectedRevision": "4",
        "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "readinessReceiptId": "33333333-3333-4333-8333-333333333333"
      }
    ]
  },
  "Error": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "error": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "code": {
            "enum": [
              "invalid_request",
              "unauthorized",
              "forbidden",
              "not_found",
              "address_context_changed",
              "catalog_changed",
              "language_policy_changed",
              "operation_revision_conflict",
              "preparation_stale",
              "activation_blocked",
              "idempotency_conflict",
              "already_active",
              "rate_limited",
              "payload_too_large",
              "capability_unavailable",
              "service_unavailable"
            ]
          },
          "message": {
            "type": "string",
            "maxLength": 500
          },
          "requestId": {
            "type": "string",
            "minLength": 1,
            "maxLength": 160
          }
        },
        "required": [
          "code",
          "message",
          "requestId"
        ]
      }
    },
    "required": [
      "error"
    ]
  },
  "ShortSlug": {
    "type": "string",
    "minLength": 1,
    "maxLength": 80,
    "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    "not": {
      "anyOf": [
        {
          "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
        },
        {
          "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
        }
      ]
    },
    "description": "Format V0 réservé, même non attribué ; UUID propre exclu aussi par validation sémantique."
  },
  "ProbeFixture": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "artworkId": {
        "type": "string",
        "format": "uuid"
      },
      "legacySlug": {
        "type": "string",
        "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$",
        "maxLength": 113
      },
      "address": {
        "allOf": [
          {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "artworkId": {
                "type": "string",
                "format": "uuid"
              },
              "locale": {
                "type": "string",
                "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
                "maxLength": 35
              },
              "slug": {
                "type": "string",
                "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                "minLength": 1,
                "maxLength": 113
              },
              "canonicalPath": {
                "type": "string",
                "pattern": "^/(?!/)[^?#\\\\\\s]*$",
                "maxLength": 2048
              },
              "alternates": {
                "type": "array",
                "items": {
                  "type": "object",
                  "additionalProperties": false,
                  "properties": {
                    "locale": {
                      "type": "string",
                      "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
                      "maxLength": 35
                    },
                    "slug": {
                      "type": "string",
                      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                      "minLength": 1,
                      "maxLength": 113
                    },
                    "path": {
                      "type": "string",
                      "pattern": "^/(?!/)[^?#\\\\\\s]*$",
                      "maxLength": 2048
                    }
                  },
                  "required": [
                    "locale",
                    "slug",
                    "path"
                  ]
                },
                "maxItems": 8
              }
            },
            "required": [
              "artworkId",
              "locale",
              "slug",
              "canonicalPath",
              "alternates"
            ],
            "description": "Chemins serveur du même UUID, locales publiques seulement. Mode actif : slug <=80 ; forme, locale, identité et chemins vérifiés ensemble par le lecteur."
          },
          {
            "properties": {
              "slug": {
                "type": "string",
                "minLength": 1,
                "maxLength": 80,
                "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                "not": {
                  "anyOf": [
                    {
                      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                    },
                    {
                      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
                    }
                  ]
                },
                "description": "Format V0 réservé, même non attribué ; UUID propre exclu aussi par validation sémantique."
              },
              "alternates": {
                "items": {
                  "properties": {
                    "slug": {
                      "type": "string",
                      "minLength": 1,
                      "maxLength": 80,
                      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                      "not": {
                        "anyOf": [
                          {
                            "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                          },
                          {
                            "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
                          }
                        ]
                      },
                      "description": "Format V0 réservé, même non attribué ; UUID propre exclu aussi par validation sémantique."
                    }
                  }
                }
              }
            }
          }
        ]
      }
    },
    "required": [
      "artworkId",
      "legacySlug",
      "address"
    ]
  },
  "ProbeRequest": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "schemaVersion": {
        "const": 1
      },
      "challengeId": {
        "type": "string",
        "format": "uuid"
      },
      "nonce": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_-]{43}$"
      },
      "siteId": {
        "type": "string",
        "format": "uuid"
      },
      "operationId": {
        "type": "string",
        "format": "uuid"
      },
      "consumerId": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
      },
      "expectedBuildId": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
      },
      "consumerInventoryRevision": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
      },
      "reportDigest": {
        "type": "string",
        "pattern": "^[0-9a-f]{64}$"
      },
      "contextRevision": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
      },
      "issuedAt": {
        "type": "integer",
        "minimum": 0
      },
      "expiresAt": {
        "type": "integer",
        "minimum": 0
      },
      "fixture": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "artworkId": {
            "type": "string",
            "format": "uuid"
          },
          "legacySlug": {
            "type": "string",
            "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$",
            "maxLength": 113
          },
          "address": {
            "allOf": [
              {
                "type": "object",
                "additionalProperties": false,
                "properties": {
                  "artworkId": {
                    "type": "string",
                    "format": "uuid"
                  },
                  "locale": {
                    "type": "string",
                    "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
                    "maxLength": 35
                  },
                  "slug": {
                    "type": "string",
                    "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                    "minLength": 1,
                    "maxLength": 113
                  },
                  "canonicalPath": {
                    "type": "string",
                    "pattern": "^/(?!/)[^?#\\\\\\s]*$",
                    "maxLength": 2048
                  },
                  "alternates": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "additionalProperties": false,
                      "properties": {
                        "locale": {
                          "type": "string",
                          "pattern": "^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$",
                          "maxLength": 35
                        },
                        "slug": {
                          "type": "string",
                          "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                          "minLength": 1,
                          "maxLength": 113
                        },
                        "path": {
                          "type": "string",
                          "pattern": "^/(?!/)[^?#\\\\\\s]*$",
                          "maxLength": 2048
                        }
                      },
                      "required": [
                        "locale",
                        "slug",
                        "path"
                      ]
                    },
                    "maxItems": 8
                  }
                },
                "required": [
                  "artworkId",
                  "locale",
                  "slug",
                  "canonicalPath",
                  "alternates"
                ],
                "description": "Chemins serveur du même UUID, locales publiques seulement. Mode actif : slug <=80 ; forme, locale, identité et chemins vérifiés ensemble par le lecteur."
              },
              {
                "properties": {
                  "slug": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 80,
                    "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                    "not": {
                      "anyOf": [
                        {
                          "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                        },
                        {
                          "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
                        }
                      ]
                    },
                    "description": "Format V0 réservé, même non attribué ; UUID propre exclu aussi par validation sémantique."
                  },
                  "alternates": {
                    "items": {
                      "properties": {
                        "slug": {
                          "type": "string",
                          "minLength": 1,
                          "maxLength": 80,
                          "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                          "not": {
                            "anyOf": [
                              {
                                "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$"
                              },
                              {
                                "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
                              }
                            ]
                          },
                          "description": "Format V0 réservé, même non attribué ; UUID propre exclu aussi par validation sémantique."
                        }
                      }
                    }
                  }
                }
              }
            ]
          }
        },
        "required": [
          "artworkId",
          "legacySlug",
          "address"
        ]
      }
    },
    "required": [
      "schemaVersion",
      "challengeId",
      "nonce",
      "siteId",
      "operationId",
      "consumerId",
      "expectedBuildId",
      "consumerInventoryRevision",
      "reportDigest",
      "contextRevision",
      "issuedAt",
      "expiresAt",
      "fixture"
    ],
    "examples": [
      {
        "schemaVersion": 1,
        "challengeId": "33333333-3333-4333-8333-333333333333",
        "nonce": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        "siteId": "55555555-5555-4555-8555-555555555555",
        "operationId": "22222222-2222-4222-8222-222222222222",
        "consumerId": "frontend.preview",
        "expectedBuildId": "build.fixture.17",
        "consumerInventoryRevision": "inventory.7",
        "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "contextRevision": "ctx.17",
        "issuedAt": 1795788000,
        "expiresAt": 1795788060,
        "fixture": {
          "artworkId": "11111111-1111-4111-8111-111111111111",
          "legacySlug": "masque-dan-11111111111141118111111111111111",
          "address": {
            "artworkId": "11111111-1111-4111-8111-111111111111",
            "locale": "fr",
            "slug": "masque-dan",
            "canonicalPath": "/artworks/masque-dan",
            "alternates": [
              {
                "locale": "en",
                "slug": "dan-mask",
                "path": "/en/artworks/dan-mask"
              }
            ]
          }
        }
      },
      {
        "schemaVersion": 1,
        "challengeId": "33333333-3333-4333-8333-333333333333",
        "nonce": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        "siteId": "55555555-5555-4555-8555-555555555555",
        "operationId": "22222222-2222-4222-8222-222222222222",
        "consumerId": "api.primary",
        "expectedBuildId": "build.api.17",
        "consumerInventoryRevision": "inventory.7",
        "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "contextRevision": "ctx.17",
        "issuedAt": 1795788000,
        "expiresAt": 1795788060,
        "fixture": {
          "artworkId": "11111111-1111-4111-8111-111111111111",
          "legacySlug": "masque-dan-11111111111141118111111111111111",
          "address": {
            "artworkId": "11111111-1111-4111-8111-111111111111",
            "locale": "fr",
            "slug": "masque-dan",
            "canonicalPath": "/artworks/masque-dan",
            "alternates": [
              {
                "locale": "en",
                "slug": "dan-mask",
                "path": "/en/artworks/dan-mask"
              }
            ]
          }
        }
      }
    ]
  },
  "ProbeRequestClaims": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "iss": {
        "const": "artwork-address-coordinator"
      },
      "aud": {
        "type": "string",
        "format": "uri",
        "maxLength": 2048
      },
      "scope": {
        "const": "artwork-address-probe:request"
      },
      "jti": {
        "type": "string",
        "format": "uuid"
      },
      "nonce": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_-]{43}$"
      },
      "siteId": {
        "type": "string",
        "format": "uuid"
      },
      "operationId": {
        "type": "string",
        "format": "uuid"
      },
      "consumerId": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
      },
      "iat": {
        "type": "integer",
        "minimum": 0
      },
      "exp": {
        "type": "integer",
        "minimum": 0
      },
      "requestDigest": {
        "type": "string",
        "pattern": "^[0-9a-f]{64}$"
      }
    },
    "required": [
      "iss",
      "aud",
      "scope",
      "jti",
      "nonce",
      "siteId",
      "operationId",
      "consumerId",
      "iat",
      "exp",
      "requestDigest"
    ],
    "examples": [
      {
        "iss": "artwork-address-coordinator",
        "aud": "https://frontend.example.test/api/artwork-address-probe",
        "scope": "artwork-address-probe:request",
        "jti": "33333333-3333-4333-8333-333333333333",
        "nonce": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        "siteId": "55555555-5555-4555-8555-555555555555",
        "operationId": "22222222-2222-4222-8222-222222222222",
        "consumerId": "frontend.preview",
        "iat": 1795788000,
        "exp": 1795788060,
        "requestDigest": "ac89a44e2ae68bace673a11a19fac8ed4e3be7593f95560f50c3e2513648646a"
      },
      {
        "iss": "artwork-address-coordinator",
        "aud": "https://api.example.test/v1/internal/artwork-address-probe",
        "scope": "artwork-address-probe:request",
        "jti": "33333333-3333-4333-8333-333333333333",
        "nonce": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        "siteId": "55555555-5555-4555-8555-555555555555",
        "operationId": "22222222-2222-4222-8222-222222222222",
        "consumerId": "api.primary",
        "iat": 1795788000,
        "exp": 1795788060,
        "requestDigest": "ca29032c0623583b51977a220ea01323825d6160f13b91ecd4471f4f1e633457"
      }
    ],
    "description": "Claims décodés illustratifs ; requestDigest correspond exactement au corps ProbeRequest d’exemple. Les fixtures exécutables signent avec une clé de test éphémère, jamais une clé de service réelle."
  },
  "ProbeAttestationClaims": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "iss": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
      },
      "aud": {
        "const": "artwork-address-coordinator"
      },
      "scope": {
        "const": "artwork-address-probe:response"
      },
      "jti": {
        "type": "string",
        "format": "uuid"
      },
      "nonce": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_-]{43}$"
      },
      "siteId": {
        "type": "string",
        "format": "uuid"
      },
      "operationId": {
        "type": "string",
        "format": "uuid"
      },
      "consumerId": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
      },
      "requestDigest": {
        "type": "string",
        "pattern": "^[0-9a-f]{64}$"
      },
      "reportDigest": {
        "type": "string",
        "pattern": "^[0-9a-f]{64}$"
      },
      "consumerInventoryRevision": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
      },
      "contextRevision": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
      },
      "observedBuildId": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
      },
      "checkedAt": {
        "type": "integer",
        "minimum": 0
      },
      "iat": {
        "type": "integer",
        "minimum": 0
      },
      "exp": {
        "type": "integer",
        "minimum": 0
      },
      "checks": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "uuidResolved": {
            "type": "boolean"
          },
          "legacyResolved": {
            "type": "boolean"
          },
          "preparedResolved": {
            "type": "boolean"
          },
          "localeRespected": {
            "type": "boolean"
          },
          "v0Compatible": {
            "type": "boolean"
          },
          "publicPreparedHidden": {
            "type": "boolean"
          }
        },
        "required": [
          "uuidResolved",
          "legacyResolved",
          "preparedResolved",
          "localeRespected",
          "v0Compatible",
          "publicPreparedHidden"
        ]
      }
    },
    "required": [
      "iss",
      "aud",
      "scope",
      "jti",
      "nonce",
      "siteId",
      "operationId",
      "consumerId",
      "requestDigest",
      "reportDigest",
      "consumerInventoryRevision",
      "contextRevision",
      "observedBuildId",
      "checkedAt",
      "iat",
      "exp",
      "checks"
    ],
    "examples": [
      {
        "iss": "frontend.preview",
        "aud": "artwork-address-coordinator",
        "scope": "artwork-address-probe:response",
        "jti": "33333333-3333-4333-8333-333333333333",
        "nonce": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        "siteId": "55555555-5555-4555-8555-555555555555",
        "operationId": "22222222-2222-4222-8222-222222222222",
        "consumerId": "frontend.preview",
        "requestDigest": "ac89a44e2ae68bace673a11a19fac8ed4e3be7593f95560f50c3e2513648646a",
        "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "consumerInventoryRevision": "inventory.7",
        "contextRevision": "ctx.17",
        "observedBuildId": "build.fixture.17",
        "checkedAt": 1795788002,
        "iat": 1795788002,
        "exp": 1795788060,
        "checks": {
          "uuidResolved": true,
          "legacyResolved": true,
          "preparedResolved": true,
          "localeRespected": true,
          "v0Compatible": true,
          "publicPreparedHidden": true
        }
      },
      {
        "iss": "api.primary",
        "aud": "artwork-address-coordinator",
        "scope": "artwork-address-probe:response",
        "jti": "33333333-3333-4333-8333-333333333333",
        "nonce": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        "siteId": "55555555-5555-4555-8555-555555555555",
        "operationId": "22222222-2222-4222-8222-222222222222",
        "consumerId": "api.primary",
        "requestDigest": "ca29032c0623583b51977a220ea01323825d6160f13b91ecd4471f4f1e633457",
        "reportDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "consumerInventoryRevision": "inventory.7",
        "contextRevision": "ctx.17",
        "observedBuildId": "build.api.17",
        "checkedAt": 1795788002,
        "iat": 1795788002,
        "exp": 1795788060,
        "checks": {
          "uuidResolved": true,
          "legacyResolved": true,
          "preparedResolved": true,
          "localeRespected": true,
          "v0Compatible": true,
          "publicPreparedHidden": true
        }
      }
    ]
  },
  "ProbeResponse": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "schemaVersion": {
        "const": 1
      },
      "attestation": {
        "type": "string",
        "minLength": 1,
        "maxLength": 32768,
        "pattern": "^[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$"
      }
    },
    "required": [
      "schemaVersion",
      "attestation"
    ]
  },
  "ProbeJwtHeader": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "alg": {
        "const": "HS256"
      },
      "typ": {
        "const": "JWT"
      },
      "kid": {
        "type": "string",
        "pattern": "^[A-Za-z0-9_.:-]{1,160}$"
      }
    },
    "required": [
      "alg",
      "typ",
      "kid"
    ],
    "examples": [
      {
        "alg": "HS256",
        "typ": "JWT",
        "kid": "fixture.k1"
      }
    ]
  }
} as const;
