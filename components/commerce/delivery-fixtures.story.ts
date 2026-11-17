// Synthetic, local test data only. No real seller, payment or order.
export const deliveryStoryData={
  "siteId": "32000000-0000-4000-8000-000000000001",
  "items": [
    {
      "productId": "b9b0dc96-b1d1-4664-b03c-f8d5060a9c91",
      "quantity": 1
    },
    {
      "productId": "a954b716-571a-4c9a-afb2-29a937eb11c2",
      "quantity": 1
    }
  ],
  "products": [
    {
      "id": "b9b0dc96-b1d1-4664-b03c-f8d5060a9c91",
      "sku": "BOOK-SYN",
      "kind": "book",
      "title": "Livre",
      "description": "Synthetic book",
      "attributes": {},
      "grossUnitAmount": 2000,
      "currency": "EUR",
      "taxDisplayLabel": "Taxes incluses",
      "availability": "available",
      "maxPurchasableQuantity": 5,
      "images": []
    },
    {
      "id": "a954b716-571a-4c9a-afb2-29a937eb11c2",
      "sku": "BAG-SYN",
      "kind": "goodie",
      "title": "Sac",
      "description": "Synthetic bag",
      "attributes": {},
      "grossUnitAmount": 3000,
      "currency": "EUR",
      "taxDisplayLabel": "Taxes incluses",
      "availability": "available",
      "maxPurchasableQuantity": 5,
      "images": []
    }
  ],
  "options": {
    "destinations": [
      "FR"
    ],
    "addressRules": {
      "FR": {
        "postalCodeRequired": true,
        "regionRequired": false
      },
      "HK": {
        "postalCodeRequired": false,
        "regionRequired": false
      }
    },
    "phoneRequiredCountries": []
  },
  "variants": {
    "common": {
      "quote": {
        "id": "af15134e-ee96-4df0-978c-909001b86307",
        "expiresAt": "2026-11-16T12:10:00.000Z",
        "locale": "fr",
        "lines": [
          {
            "productId": "b9b0dc96-b1d1-4664-b03c-f8d5060a9c91",
            "sku": "BOOK-SYN",
            "title": "Livre",
            "quantity": 1,
            "unitGross": 2000,
            "gross": 2000,
            "net": 1896,
            "tax": 104,
            "rateBps": 550,
            "taxCategory": "book",
            "productRevision": 1
          },
          {
            "productId": "a954b716-571a-4c9a-afb2-29a937eb11c2",
            "sku": "BAG-SYN",
            "title": "Sac",
            "quantity": 1,
            "unitGross": 3000,
            "gross": 3000,
            "net": 2500,
            "tax": 500,
            "rateBps": 2000,
            "taxCategory": "goodie",
            "productRevision": 1
          }
        ],
        "shippingAddress": {
          "fullName": "Synthetic Guest",
          "line1": "11 rue Exemple",
          "locality": "Paris",
          "postalCode": "75006",
          "country": "FR"
        },
        "billingAddress": {
          "fullName": "Synthetic Guest",
          "line1": "11 rue Exemple",
          "locality": "Paris",
          "postalCode": "75006",
          "country": "FR"
        },
        "shippingOption": {
          "zoneId": "a1f23ce6-fc8a-4e3c-a6fe-325c176d83d6",
          "label": "Transport 1 · Zone",
          "gross": 600,
          "deliveryEstimate": "2026-11-17",
          "phoneRequired": false
        },
        "amounts": {
          "currency": "EUR",
          "itemsGross": 5000,
          "itemsNet": 4396,
          "itemsTax": 604,
          "shippingGross": 600,
          "shippingNet": 527,
          "shippingTax": 73,
          "totalGross": 5600
        },
        "shippingTaxLines": [
          {
            "category": "book",
            "rateBps": 550,
            "gross": 240,
            "net": 227,
            "tax": 13
          },
          {
            "category": "goodie",
            "rateBps": 2000,
            "gross": 360,
            "net": 300,
            "tax": 60
          }
        ],
        "importDisclosure": "",
        "termsVersion": "synthetic-1",
        "termsHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "fingerprint": "c8dde430f31b72032114af78bc4468fc9a6cbf8edf63a5d363a8a4917cffaf74"
      },
      "delivery": {
        "calculatedAt": "2026-11-16T12:00:00.000Z",
        "fingerprint": "783b9f72f34567f8c64d1957450245ad766d6dc8159271a387ccf04a938db51a",
        "groups": [
          {
            "alternatives": [
              {
                "estimate": {
                  "calendarFingerprint": "84820483933ed3825dfde3bafdeb0a76cc553e16ac79693d997398ff6387068c",
                  "cutoffAt": "2026-11-16T15:00:00.000Z",
                  "date": "2026-11-17",
                  "estimatedAt": "2026-11-17T15:00:00.000Z",
                  "leadTimeHours": 24,
                  "timeZone": "Europe/Paris"
                },
                "grossAmount": 600,
                "label": "Transport 1 · Zone",
                "methodId": "b3469938-46b6-4bfa-912a-71039d734f50"
              }
            ],
            "estimate": {
              "calendarFingerprint": "84820483933ed3825dfde3bafdeb0a76cc553e16ac79693d997398ff6387068c",
              "cutoffAt": "2026-11-16T15:00:00.000Z",
              "date": "2026-11-17",
              "estimatedAt": "2026-11-17T15:00:00.000Z",
              "leadTimeHours": 24,
              "timeZone": "Europe/Paris"
            },
            "grossAmount": 600,
            "id": "8e90372fca7de6a981e95b5e75c4ad58",
            "importDisclosure": "",
            "items": [
              {
                "productId": "a954b716-571a-4c9a-afb2-29a937eb11c2",
                "quantity": 1
              },
              {
                "productId": "b9b0dc96-b1d1-4664-b03c-f8d5060a9c91",
                "quantity": 1
              }
            ],
            "label": "Transport 1 · Zone",
            "methodId": "b3469938-46b6-4bfa-912a-71039d734f50",
            "phoneRequired": false,
            "productTitles": {
              "a954b716-571a-4c9a-afb2-29a937eb11c2": "Sac",
              "b9b0dc96-b1d1-4664-b03c-f8d5060a9c91": "Livre"
            },
            "zoneId": "a1f23ce6-fc8a-4e3c-a6fe-325c176d83d6"
          }
        ],
        "mode": "shipping",
        "pickupAddress": null,
        "pickupOnly": false,
        "separateShipments": false,
        "shippingGross": 600,
        "shippingRevision": 1
      }
    },
    "split": {
      "quote": {
        "id": "68f0024a-f400-4e90-817c-653aaeec7a9f",
        "expiresAt": "2026-11-16T12:10:00.000Z",
        "locale": "fr",
        "lines": [
          {
            "productId": "b9b0dc96-b1d1-4664-b03c-f8d5060a9c91",
            "sku": "BOOK-SYN",
            "title": "Livre",
            "quantity": 1,
            "unitGross": 2000,
            "gross": 2000,
            "net": 1896,
            "tax": 104,
            "rateBps": 550,
            "taxCategory": "book",
            "productRevision": 1
          },
          {
            "productId": "a954b716-571a-4c9a-afb2-29a937eb11c2",
            "sku": "BAG-SYN",
            "title": "Sac",
            "quantity": 1,
            "unitGross": 3000,
            "gross": 3000,
            "net": 2500,
            "tax": 500,
            "rateBps": 2000,
            "taxCategory": "goodie",
            "productRevision": 1
          }
        ],
        "shippingAddress": {
          "fullName": "Synthetic Guest",
          "line1": "11 rue Exemple",
          "locality": "Paris",
          "postalCode": "75006",
          "country": "FR"
        },
        "billingAddress": {
          "fullName": "Synthetic Guest",
          "line1": "11 rue Exemple",
          "locality": "Paris",
          "postalCode": "75006",
          "country": "FR"
        },
        "shippingOption": {
          "zoneId": "a1f23ce6-fc8a-4e3c-a6fe-325c176d83d6",
          "label": "2 envois séparés",
          "gross": 1300,
          "deliveryEstimate": "2026-11-17 / 2026-11-17",
          "phoneRequired": false
        },
        "amounts": {
          "currency": "EUR",
          "itemsGross": 5000,
          "itemsNet": 4396,
          "itemsTax": 604,
          "shippingGross": 1300,
          "shippingNet": 1143,
          "shippingTax": 157,
          "totalGross": 6300
        },
        "shippingTaxLines": [
          {
            "category": "book",
            "rateBps": 550,
            "gross": 520,
            "net": 493,
            "tax": 27
          },
          {
            "category": "goodie",
            "rateBps": 2000,
            "gross": 780,
            "net": 650,
            "tax": 130
          }
        ],
        "importDisclosure": "Envoi 1 : 6,00 € (2026-11-17). Envoi 2 : 7,00 € (2026-11-17).",
        "termsVersion": "synthetic-1",
        "termsHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "fingerprint": "c443b789320bb493fae58e11d05da0926cafc5e604b578f0aa4dda6f3cdd1a4e"
      },
      "delivery": {
        "calculatedAt": "2026-11-16T12:00:00.000Z",
        "fingerprint": "5cb1f84161c13a536b87b9eeed66795be27268d00d654ea5bc33e21302a32707",
        "groups": [
          {
            "alternatives": [
              {
                "estimate": {
                  "calendarFingerprint": "84820483933ed3825dfde3bafdeb0a76cc553e16ac79693d997398ff6387068c",
                  "cutoffAt": "2026-11-16T15:00:00.000Z",
                  "date": "2026-11-17",
                  "estimatedAt": "2026-11-17T15:00:00.000Z",
                  "leadTimeHours": 24,
                  "timeZone": "Europe/Paris"
                },
                "grossAmount": 600,
                "label": "Transport 1 · Zone",
                "methodId": "b3469938-46b6-4bfa-912a-71039d734f50"
              }
            ],
            "estimate": {
              "calendarFingerprint": "84820483933ed3825dfde3bafdeb0a76cc553e16ac79693d997398ff6387068c",
              "cutoffAt": "2026-11-16T15:00:00.000Z",
              "date": "2026-11-17",
              "estimatedAt": "2026-11-17T15:00:00.000Z",
              "leadTimeHours": 24,
              "timeZone": "Europe/Paris"
            },
            "grossAmount": 600,
            "id": "e575a4b8824e18c25e94e107e4be8e66",
            "importDisclosure": "",
            "items": [
              {
                "productId": "b9b0dc96-b1d1-4664-b03c-f8d5060a9c91",
                "quantity": 1
              }
            ],
            "label": "Transport 1 · Zone",
            "methodId": "b3469938-46b6-4bfa-912a-71039d734f50",
            "phoneRequired": false,
            "productTitles": {
              "b9b0dc96-b1d1-4664-b03c-f8d5060a9c91": "Livre"
            },
            "zoneId": "a1f23ce6-fc8a-4e3c-a6fe-325c176d83d6"
          },
          {
            "alternatives": [
              {
                "estimate": {
                  "calendarFingerprint": "84820483933ed3825dfde3bafdeb0a76cc553e16ac79693d997398ff6387068c",
                  "cutoffAt": "2026-11-16T15:00:00.000Z",
                  "date": "2026-11-17",
                  "estimatedAt": "2026-11-17T15:00:00.000Z",
                  "leadTimeHours": 24,
                  "timeZone": "Europe/Paris"
                },
                "grossAmount": 700,
                "label": "Transport 2 · Zone",
                "methodId": "5882b973-f2c2-4ae2-a738-0ea89b426d0d"
              }
            ],
            "estimate": {
              "calendarFingerprint": "84820483933ed3825dfde3bafdeb0a76cc553e16ac79693d997398ff6387068c",
              "cutoffAt": "2026-11-16T15:00:00.000Z",
              "date": "2026-11-17",
              "estimatedAt": "2026-11-17T15:00:00.000Z",
              "leadTimeHours": 24,
              "timeZone": "Europe/Paris"
            },
            "grossAmount": 700,
            "id": "9bd422cb7edb4493a553c4639f3e9ac9",
            "importDisclosure": "",
            "items": [
              {
                "productId": "a954b716-571a-4c9a-afb2-29a937eb11c2",
                "quantity": 1
              }
            ],
            "label": "Transport 2 · Zone",
            "methodId": "5882b973-f2c2-4ae2-a738-0ea89b426d0d",
            "phoneRequired": false,
            "productTitles": {
              "a954b716-571a-4c9a-afb2-29a937eb11c2": "Sac"
            },
            "zoneId": "d508f46b-7117-4dd9-b6d5-3a09d1a554c0"
          }
        ],
        "mode": "shipping",
        "pickupAddress": null,
        "pickupOnly": false,
        "separateShipments": true,
        "shippingGross": 1300,
        "shippingRevision": 1
      }
    },
    "pickup": {
      "quote": {
        "id": "74c4fe46-e549-45f9-8ad1-d521cbbead1b",
        "expiresAt": "2026-11-16T12:10:00.000Z",
        "locale": "fr",
        "lines": [
          {
            "productId": "b9b0dc96-b1d1-4664-b03c-f8d5060a9c91",
            "sku": "BOOK-SYN",
            "title": "Livre",
            "quantity": 1,
            "unitGross": 2000,
            "gross": 2000,
            "net": 1896,
            "tax": 104,
            "rateBps": 550,
            "taxCategory": "book",
            "productRevision": 1
          },
          {
            "productId": "a954b716-571a-4c9a-afb2-29a937eb11c2",
            "sku": "BAG-SYN",
            "title": "Sac",
            "quantity": 1,
            "unitGross": 3000,
            "gross": 3000,
            "net": 2500,
            "tax": 500,
            "rateBps": 2000,
            "taxCategory": "goodie",
            "productRevision": 1
          }
        ],
        "shippingAddress": {
          "fullName": "Synthetic Guest",
          "line1": "11 rue Exemple",
          "locality": "Paris",
          "postalCode": "75006",
          "country": "FR"
        },
        "billingAddress": {
          "fullName": "Synthetic Guest",
          "line1": "11 rue Exemple",
          "locality": "Paris",
          "postalCode": "75006",
          "country": "FR"
        },
        "shippingOption": {
          "zoneId": "00000000-0000-4000-8000-000000000001",
          "label": "Retrait à la galerie",
          "gross": 0,
          "deliveryEstimate": "2026-11-16",
          "phoneRequired": false
        },
        "amounts": {
          "currency": "EUR",
          "itemsGross": 5000,
          "itemsNet": 4396,
          "itemsTax": 604,
          "shippingGross": 0,
          "shippingNet": 0,
          "shippingTax": 0,
          "totalGross": 5000
        },
        "shippingTaxLines": [
          {
            "category": "book",
            "rateBps": 550,
            "gross": 0,
            "net": 0,
            "tax": 0
          },
          {
            "category": "goodie",
            "rateBps": 2000,
            "gross": 0,
            "net": 0,
            "tax": 0
          }
        ],
        "importDisclosure": "",
        "termsVersion": "synthetic-1",
        "termsHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "fingerprint": "fe5e8263a70ac924ab6bdadb49181ee0a72eb681da5459cada6584ed07ca5387"
      },
      "delivery": {
        "calculatedAt": "2026-11-16T12:00:00.000Z",
        "fingerprint": "b821e04d60a14386088a4c075cc11af015981b72f49792a91917521818f44a6f",
        "groups": [
          {
            "alternatives": [],
            "estimate": {
              "calendarFingerprint": "84820483933ed3825dfde3bafdeb0a76cc553e16ac79693d997398ff6387068c",
              "cutoffAt": "2026-11-16T15:00:00.000Z",
              "date": "2026-11-16",
              "estimatedAt": "2026-11-16T15:00:00.000Z",
              "leadTimeHours": 0,
              "timeZone": "Europe/Paris"
            },
            "grossAmount": 0,
            "id": "gallery-pickup",
            "importDisclosure": "",
            "items": [
              {
                "productId": "b9b0dc96-b1d1-4664-b03c-f8d5060a9c91",
                "quantity": 1
              },
              {
                "productId": "a954b716-571a-4c9a-afb2-29a937eb11c2",
                "quantity": 1
              }
            ],
            "label": "Retrait à la galerie",
            "methodId": "gallery-pickup",
            "phoneRequired": false,
            "productTitles": {
              "a954b716-571a-4c9a-afb2-29a937eb11c2": "Sac",
              "b9b0dc96-b1d1-4664-b03c-f8d5060a9c91": "Livre"
            },
            "zoneId": null
          }
        ],
        "mode": "pickup",
        "pickupAddress": {
          "country": "FR",
          "fullName": "Synthetic Guest",
          "line1": "11 rue Exemple",
          "locality": "Paris",
          "postalCode": "75006"
        },
        "pickupOnly": true,
        "separateShipments": false,
        "shippingGross": 0,
        "shippingRevision": 1
      }
    }
  }
};
