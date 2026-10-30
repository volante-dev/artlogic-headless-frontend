# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Visiteurs de galeries et amateurs d’art : découvrir les œuvres sélectionnées par une galerie, consulter ses rubriques et la contacter, sans compte visiteur.
- Administrateurs de galerie autorisés : choisir les œuvres publiques, contribuer les traductions et le logo, puis personnaliser l’apparence et la composition des pages.
- Équipe Volante : développer et déployer des sites clients à partir d’un seul dépôt frontend générique, en réutilisant et en spécialisant les composants.

## Product Purpose

Fournir un boilerplate de site de galerie, connecté au backend Artlogic Headless, qui associe autonomie éditoriale et personnalisation par client sans multiplier les forks du frontend.

## Operating Context

Le frontend, le backend et le web-admin sont trois dépôts voisins. Le backend réplique les œuvres Artlogic dans une destination propre au site. Seules les œuvres publiées par l’admin sont visibles. La consultation publique ne dépend pas de la disponibilité d’Artlogic. L’administration utilise le SSO Volante ; un fournisseur synthétique permet le développement local.

## Capabilities and Constraints

- Six rubriques : actualités, œuvres, expositions, publications, demande d’expertise et contact, plus accueil et fiche d’œuvre.
- Navigation multilingue avec une langue de référence et repli des traductions secondaires ; français/anglais disponibles initialement.
- Déploiements génériques configurés par environnement ; contenus éditoriaux persistés par site.
- Un seul dépôt frontend. Demande explicite du 26 octobre 2026 : introduire MUI et Storybook, avec composants génériques puis spécialisations client.
- Réponse confirmée : l’admin compose les pages à partir de sections prédéfinies et de variantes, qu’il peut ajouter, réordonner, masquer et personnaliser. Pas de composition libre de leur structure interne.
- Couleurs et polices du site configurables depuis l’admin. Les nouveaux types de composants et comportements restent du travail de développement.
- La portée détaillée des médias, polices et publications est définie dans la spécification 003 ; elle ne constitue pas une fonctionnalité déjà livrée.

## Brand Commitments

Interfaces épurées, avec vidéo occupant le premier écran de l’accueil, suivant la référence Studio Volante donnée par l’utilisateur. Le retour accueil/logo reste à gauche, la navigation et le choix de langue à droite. La marque affichée appartient à chaque galerie ; Studio Volante est une référence d’expérience, pas une identité à recopier.

## Evidence on Hand

- Implémentation et recette des features 001/002 dans `../backend/specs/`.
- Référence voisine : `../frontend/components/sections/HeroVideo/HeroVideo.tsx` pour le plein écran, la vidéo muette, son poster et le contrôle lecture/pause.
- Données Artlogic simulées et fixtures synthétiques dans `../backend/mock/`.
- Aucun film, logo, texte de marque ou portefeuille d’œuvres d’une galerie réelle n’a été fourni pour le nouveau template. Les maquettes doivent identifier leur contenu de démonstration et ne pas inventer d’attributions, de prix ou de références commerciales.

## Product Principles

- Les œuvres et leur contexte guident l’expérience.
- Une personnalisation reste propre à sa galerie.
- L’admin configure une offre de composants maîtrisée ; le code porte leurs comportements et leurs règles.
- Une nouvelle apparence conserve la navigation, les traductions et les règles de visibilité existantes.

## Accessibility & Inclusion

Maintenir les parcours clavier et mobile validés en 002, les contrôles accessibles et les replis de langue. La vidéo d’accueil ne doit pas conditionner l’accès au contenu : image de repli, pause et respect de la préférence de réduction des mouvements.
