// Code-owned descriptors. Never serialize durations or selectors in article documents.
export const motionFamilies = {
  "text": {
    "default": "text-fade",
    "animations": [
      {
        "id": "text-fade",
        "labelFr": "Fondu éditorial",
        "appearance": "opacity",
        "durationMs": 480,
        "ease": "power2.out",
        "status": "validated"
      },
      {
        "id": "text-rise",
        "labelFr": "Élévation douce",
        "appearance": "opacity + translateY 24px",
        "durationMs": 620,
        "ease": "power2.out",
        "status": "validated"
      },
      {
        "id": "text-stagger",
        "labelFr": "Rythme des paragraphes",
        "appearance": "paragraphes opacity + translateY 16px, stagger plafonné",
        "durationMs": 720,
        "ease": "power2.out",
        "status": "validated"
      }
    ]
  },
  "media": {
    "default": "media-fade",
    "animations": [
      {
        "id": "media-fade",
        "labelFr": "Fondu photographique",
        "appearance": "opacity",
        "durationMs": 520,
        "ease": "power2.out",
        "status": "validated"
      },
      {
        "id": "media-zoom-out",
        "labelFr": "Recul du regard",
        "appearance": "opacity + scale 1.06 vers 1",
        "durationMs": 820,
        "ease": "power2.out",
        "status": "validated"
      },
      {
        "id": "media-reveal",
        "labelFr": "Dévoilement latéral",
        "appearance": "masque par transform et image contre-transformée",
        "durationMs": 760,
        "ease": "power2.out",
        "status": "validated"
      }
    ]
  },
  "textMedia": {
    "default": "split-fade",
    "animations": [
      {
        "id": "split-fade",
        "labelFr": "Diptyque en fondu",
        "appearance": "opacity des panneaux simultanée",
        "durationMs": 560,
        "ease": "power2.out",
        "status": "validated"
      },
      {
        "id": "split-cross-reveal",
        "labelFr": "Rencontre des panneaux",
        "appearance": "translateX opposés 32px + opacity",
        "durationMs": 740,
        "ease": "power2.out",
        "status": "validated"
      },
      {
        "id": "split-stagger",
        "labelFr": "Dialogue texte et image",
        "appearance": "opacity + translateY 20px, décalage panneaux",
        "durationMs": 800,
        "ease": "power2.out",
        "status": "validated"
      }
    ]
  },
  "carousel": {
    "default": "carousel-fade",
    "animations": [
      {
        "id": "carousel-fade",
        "labelFr": "Entrée en fondu",
        "appearance": "opacity du cadre, sans modifier la slide active",
        "durationMs": 520,
        "ease": "power2.out",
        "status": "validated"
      },
      {
        "id": "carousel-zoom-out",
        "labelFr": "Cadre en recul",
        "appearance": "opacity + scale 1.04 vers 1 du cadre",
        "durationMs": 780,
        "ease": "power2.out",
        "status": "validated"
      },
      {
        "id": "carousel-reveal",
        "labelFr": "Cadre dévoilé",
        "appearance": "masque par transform du cadre",
        "durationMs": 740,
        "ease": "power2.out",
        "status": "validated"
      }
    ]
  },
  "imageGroup": {
  "default": "group-fade",
  "animations": [
    {
      "id": "group-fade",
      "labelFr": "Fondu coordonné",
      "appearance": "opacity des colonnes simultanée",
      "durationMs": 900,
      "ease": "power2.out",
      "status": "validated"
    },
    {
      "id": "group-reveal",
      "labelFr": "Dévoilement vers le centre",
      "appearance": "deux images : dévoilements latéraux vers le centre ; trois images : côtés vers le centre et image centrale du bas vers le haut, transform/contre-transform simultanés",
      "durationMs": 1700,
      "ease": "power2.out",
      "status": "validated"
    },
    {
      "id": "group-zoom-out",
      "labelFr": "Recul progressif",
      "appearance": "opacity 0 vers1 + scale1.04 vers1 + translateY18px vers0, décalage borné",
      "durationMs": 1400,
      "ease": "power2.out",
      "status": "validated"
    }
  ]
}
,
'form': {default:"form-fade",animations:[{id:"form-fade",labelFr:"Fondu du formulaire",appearance:"opacity",durationMs:450,ease:"power2.out",status:"validated"},{id:"form-rise",labelFr:"Élévation du formulaire",appearance:"opacity + translateY 18px",durationMs:650,ease:"power2.out",status:"validated"},{id:"form-reveal",labelFr:"Dévoilement rythmé",appearance:"groups opacity + translateX 16px",durationMs:800,ease:"power2.out",status:"validated"}]}
,
'formImage': {default:"form-fade",animations:[{id:"form-fade",labelFr:"Fondu du formulaire",appearance:"opacity",durationMs:450,ease:"power2.out",status:"validated"},{id:"form-rise",labelFr:"Élévation du formulaire",appearance:"opacity + translateY 18px",durationMs:650,ease:"power2.out",status:"validated"},{id:"form-reveal",labelFr:"Dévoilement rythmé",appearance:"groups opacity + translateX 16px",durationMs:800,ease:"power2.out",status:"validated"}]}
} as const;
export type BlockKind = keyof typeof motionFamilies;
export type AnimationId = typeof motionFamilies[BlockKind]["animations"][number]["id"];
export const mediaPreparationBudgetMs = 1500;
export const mediaUnavailableAfterMs = 10000;
