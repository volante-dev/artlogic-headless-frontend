# Navigation des fiches d’œuvres

Le lien public connaît déjà sa destination. Un clic interne lance directement la
route Next.js interceptée et conserve la page, son défilement et son déclencheur.
Il ne doit pas demander préalablement `/api/artwork-experiences/…`.

La route résout les anciennes adresses, contrôle la disponibilité publique et
transmet ensemble le contenu et sa présentation. La version interactive adopte
ces données sans seconde lecture JSON lors de son montage ou de l’hydratation
d’un document direct. Le document natif reste utilisable sans JavaScript.

Une œuvre devenue indisponible affiche l’état prévu par la route. Elle possède
alors une entrée d’historique normale ; la fermeture revient à la véritable
origine, y compris après une redirection depuis une ancienne adresse UUID.
L’origine déjà cliquable est reconnue immédiatement, sans attendre l’hydratation
d’un marqueur de streaming supplémentaire. Une fermeture anticipée abandonne
la navigation encore en attente ; un rendu React retardé ne doit pas écraser
l’état de restauration détenu par cette fermeture.

Une réactivation d’historique conservée et une demande explicite
`artwork-revalidate` peuvent encore relire la disponibilité. Les erreurs,
identités et langues des réponses restent validées. Un changement de langue
utilise le parcours de traduction existant. Aucune comparaison de révision ni
lecture supplémentaire n’est nécessaire à une ouverture normale.

Cette évolution ne modifie aucun contrat API et reste compatible avec la version
précédente du backend, avec les adresses historiques et les deux variantes de
modale. Les contrôles de disponibilité serveur restent en place. Les achats,
les écritures administratives et leurs préconditions ne sont pas concernés.

Après un rechargement, les identifiants stockés dans l’historique peuvent provenir
du document précédent. Le header reconnaît le rendu déjà monté par son adresse
et son marqueur de requête serveur. Revenir à cette même page ne doit ni la
masquer, ni attendre une nouvelle émission du marqueur, ni déclencher son délai
d’erreur de navigation. Les pages cachées par une autre route ne constituent
pas une preuve de rendu actif.
