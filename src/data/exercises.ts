export type ExerciseType = 'reading' | 'improvisation' | 'repetition' | 'warmup' | 'proprioception' | 'rebus' | 'retelling' | 'neurologie' | 'latence';

export interface RebusSegment {
  segment: string;
  emoji: string;
  pause_after: boolean;
}

export interface Exercise {
  id: string;
  text: string;
  tip: string;
  title: string;
  isClinical?: boolean;
  type?: ExerciseType; // For special exercise modes
  duration?: number; // For timed exercises (in seconds)
  repetitions?: number; // For repetition exercises
  content_type?: 'text' | 'rebus';
  rebusContent?: RebusSegment[];
  keyPoints?: string[];
}

export interface ExerciseCategory {
  id: string;
  level: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  exercises: Exercise[];
  isClinical?: boolean;
  type?: ExerciseType; // Category-wide type
}

export const exerciseCategories: ExerciseCategory[] = [
  {
    id: "slow-reading",
    level: 1,
    title: "Ralentissement",
    description: "Textes progressifs avec un accent sur les pauses et la respiration. Idéal pour apprendre à contrôler son débit.",
    icon: "🌱",
    color: "from-green-500/20 to-green-600/10",
    exercises: [
      {
        id: "slow-1",
        title: "La Respiration Consciente",
        text: "Je prends le temps de respirer. Chaque inspiration remplit mes poumons d'air frais. Chaque expiration libère les tensions. Mon corps se détend progressivement. Mes épaules s'abaissent naturellement. Ma mâchoire se relâche. Je ne suis pas pressé. Le temps s'écoule à mon rythme. Je savoure cet instant de calme. Les pensées agitées s'apaisent peu à peu. Je suis présent, ici et maintenant. Ma voix trouve son tempo naturel. Les mots viennent à moi sans effort. Je les prononce avec clarté. Chaque syllabe a sa place. Les pauses donnent du sens à mes phrases. Le silence entre les mots n'est pas un vide. Il est une respiration, un repos nécessaire. Je m'autorise à prendre mon temps. Personne ne me presse. Cette liberté est précieuse. Je la cultive avec patience. Chaque jour, je progresse un peu plus. Mon calme devient ma force. Ma parole devient plus claire. Les autres m'écoutent avec attention. Je communique avec assurance. La respiration reste mon ancre. Je reviens toujours à elle quand le rythme s'accélère.",
        tip: "Respirez profondément entre chaque phrase. Comptez mentalement deux secondes avant de reprendre la parole."
      },
      {
        id: "slow-2",
        title: "Une Promenade dans la Nature",
        text: "Le sentier serpente à travers la forêt. Les arbres centenaires tendent leurs branches vers le ciel. Leurs feuilles filtrent la lumière du soleil. Des rayons dorés dansent sur le sol couvert de mousse. L'air est frais et parfumé. Je respire profondément cette odeur de terre humide. Un ruisseau coule quelque part, j'entends son murmure apaisant. Les oiseaux chantent dans les hauteurs. Chacun a sa mélodie unique. Je m'arrête pour les écouter. Le temps semble suspendu dans cet endroit préservé. Un écureuil traverse le chemin devant moi. Il s'arrête, me regarde, puis disparaît dans les feuillages. Je souris de cette rencontre furtive. Mes pas foulent doucement les feuilles mortes. Elles craquent sous mes pieds avec un bruit rassurant. Le chemin monte légèrement vers une clairière. Là-haut, le ciel s'ouvre en grand. Les nuages blancs dérivent lentement. Je m'assieds sur un rocher plat. La chaleur du soleil réchauffe mon visage. Je ferme les yeux un instant. Tous mes sens sont en éveil. La nature m'offre ce moment de paix. Je lui suis reconnaissant.",
        tip: "Visualisez chaque scène mentalement avant de la décrire. Laissez les images guider votre rythme de lecture."
      },
      {
        id: "slow-3",
        title: "Le Réveil en Douceur",
        text: "Le jour se lève tranquillement. Les premiers rayons du soleil traversent les rideaux. La chambre s'éclaire progressivement d'une lumière dorée. Je reste quelques instants dans la chaleur des draps. Mon corps s'éveille lentement, membre après membre. J'étire mes bras au-dessus de ma tête. Je sens mes muscles se réveiller. Un bâillement profond m'échappe. C'est le signe que la nuit a été réparatrice. Je tourne la tête vers la fenêtre. Le ciel est d'un bleu pâle, promesse d'une belle journée. Les oiseaux ont commencé leur concert matinal. Leurs chants joyeux me donnent envie de me lever. Je repousse doucement la couverture. Mes pieds touchent le sol frais. Cette sensation me réveille complètement. Je me dirige vers la cuisine d'un pas tranquille. L'odeur du café commence à embaumer la maison. Une tasse chaude entre les mains, je m'installe près de la fenêtre. Je contemple le jardin qui s'éveille lui aussi. La rosée brille sur les pétales des fleurs. Un chat traverse la pelouse avec élégance. La journée peut commencer. Je suis prêt à l'accueillir avec sérénité.",
        tip: "Articulez chaque syllabe distinctement. Le matin est un moment de transition, votre lecture doit refléter cette douceur."
      },
      {
        id: "slow-4",
        title: "Le Rythme de la Marche",
        text: "Un pas, puis un autre. Le chemin s'étend devant moi. Je ne connais pas sa fin, mais cela n'a pas d'importance. Ce qui compte, c'est le voyage, pas la destination. Mes pieds trouvent leur rythme naturel. Ni trop vite, ni trop lent. Juste le tempo qui convient à mon corps. Je ressens le contact du sol sous mes semelles. Chaque surface a sa texture particulière. Le béton dur de la ville, le gravier qui crisse, l'herbe souple du parc. J'adapte ma marche à chaque terrain. Mon souffle accompagne mes pas. Inspiration sur deux pas, expiration sur deux pas. Ce rythme régulier calme mon esprit. Les pensées parasites s'éloignent. Je suis pleinement présent dans mon corps en mouvement. Le paysage défile autour de moi. Je remarque des détails que je n'avais jamais vus. Une fleur au bord du trottoir, un graffiti coloré sur un mur, le sourire d'un passant. La marche ouvre mes sens au monde. Elle me reconnecte à l'essentiel. Chaque promenade est une méditation en mouvement. Je reviens toujours apaisé, l'esprit clarifié.",
        tip: "Synchronisez votre respiration avec le rythme de la lecture. Imaginez que vos mots sont des pas réguliers."
      },
      {
        id: "slow-5",
        title: "L'Art de l'Écoute",
        text: "Écouter vraiment, c'est un art qui se cultive. Cela demande de faire taire notre voix intérieure. De suspendre nos jugements et nos interprétations. D'accueillir les mots de l'autre avec ouverture. Je m'entraîne chaque jour à mieux écouter. Je regarde la personne qui me parle. Je remarque ses expressions, ses gestes, ses silences. Tout cela fait partie du message. Les mots ne représentent qu'une partie de la communication. Le ton de la voix en dit parfois plus long. Une hésitation peut révéler une émotion cachée. Un sourire peut contredire des paroles négatives. Je prête attention à ces signaux subtils. Quand quelqu'un me parle, je résiste à l'envie de l'interrompre. Je lui laisse le temps de formuler sa pensée. Parfois, les meilleures idées viennent après une pause. Je pose des questions pour mieux comprendre. Des questions ouvertes qui invitent à approfondir. Je reformule parfois ce que j'ai entendu. Cela montre que j'ai vraiment écouté. Cette qualité d'écoute transforme mes relations. Les autres se sentent respectés et valorisés. En retour, ils m'écoutent aussi avec plus d'attention.",
        tip: "Lisez ce texte comme si vous parliez à quelqu'un. Les pauses naturelles donnent du poids à vos mots."
      },
      {
        id: "slow-6",
        title: "La Patience au Quotidien",
        text: "La patience n'est pas l'attente passive. C'est une force active qui demande de la pratique. Dans notre monde qui valorise la vitesse, elle devient un acte de résistance. Je cultive cette qualité précieuse au quotidien. Dans la file d'attente au supermarché, je respire calmement. Ce temps n'est pas perdu, il m'appartient. Je peux observer les gens autour de moi. Chacun a son histoire, ses préoccupations. Dans les embouteillages, je choisis de ne pas m'énerver. La colère ne fera pas avancer les voitures. Autant profiter de ce moment pour écouter de la musique. Ou pour réfléchir tranquillement à mes projets. Avec mes proches, la patience prend une autre forme. J'accepte que chacun ait son propre rythme. Mes enfants apprennent à leur vitesse. Mon conjoint a sa manière de fonctionner. Je ne peux pas les forcer à changer. Mais je peux les accompagner avec bienveillance. La patience que je développe envers les autres, je l'applique aussi à moi-même. Je ne me juge pas trop sévèrement quand je fais des erreurs. J'accepte que le progrès prenne du temps. Chaque petit pas compte dans ce long chemin.",
        tip: "La patience s'applique aussi à la lecture. Prenez le temps nécessaire pour chaque phrase sans vous presser."
      },
      {
        id: "slow-7",
        title: "Le Jardin Secret",
        text: "Au fond du jardin, derrière les rosiers, il y a un petit coin que personne ne connaît. C'est mon refuge, mon espace de tranquillité. Un vieux banc de pierre y attend depuis des décennies. La mousse a recouvert les pieds, lui donnant un charme intemporel. Je m'y installe souvent pour lire ou simplement rêver. Le lierre grimpe le long du mur, créant un écran de verdure. Les bruits de la rue disparaissent ici. Seuls parviennent le chant des oiseaux et le bourdonnement des abeilles. Au printemps, les iris mauves fleurissent au pied du mur. Leur parfum délicat emplit l'air. En été, le jasmin prend le relais avec ses fleurs blanches étoilées. L'automne apporte les feuilles dorées qui tapissent le sol. L'hiver, le jardin se repose sous une fine couche de givre. Chaque saison a sa beauté particulière dans ce petit coin de paradis. Je viens ici quand j'ai besoin de me ressourcer. Le temps s'arrête entre ces murs couverts de verdure. Mes pensées se clarifient, mes soucis s'allègent. Ce jardin secret est mon allié dans la quête du calme intérieur.",
        tip: "Laissez les descriptions créer des images dans votre esprit. La visualisation aide naturellement à ralentir."
      },
      {
        id: "slow-8",
        title: "L'Horloge Ancienne",
        text: "Dans le salon de mes grands-parents trônait une vieille horloge comtoise. Son balancier oscillait régulièrement, marquant le passage du temps avec dignité. Chaque heure, elle sonnait de sa voix grave et profonde. Ce son résonnait dans toute la maison, rappelant à chacun que le temps avançait. Enfant, je restais fasciné par ce mécanisme complexe. Les engrenages dorés tournaient avec une précision millimétrique. Les aiguilles progressaient imperceptiblement sur le cadran d'émail. Mon grand-père remontait l'horloge chaque dimanche matin. C'était un rituel immuable, un geste transmis de père en fils. Il manipulait la clé de laiton avec respect et attention. Jamais il ne brusquait le mécanisme centenaire. Cette horloge lui avait appris la valeur du temps, disait-il. Non pas pour le compter anxieusement, mais pour l'apprécier pleinement. Chaque tic-tac était une invitation à vivre l'instant présent. Aujourd'hui, cette horloge est chez moi. Elle continue de rythmer mes journées de son battement régulier. Quand je l'entends, je pense à mon grand-père. Je me souviens de ses paroles sages sur la patience et le temps.",
        tip: "Le rythme de l'horloge peut guider votre lecture. Imaginez le balancier qui oscille lentement."
      },
      {
        id: "slow-9",
        title: "La Cuisine du Dimanche",
        text: "Le dimanche, la cuisine devient le cœur de la maison. Dès le matin, les préparatifs commencent sans hâte. Je sors les ingrédients un à un, les dispose sur le plan de travail. Chaque geste est mesuré, chaque étape a son importance. L'eau commence à frémir dans la grande casserole. Les légumes attendent sagement d'être épluchés. Je prends le couteau et commence mon travail avec application. Les carottes sont coupées en rondelles régulières. Les oignons émincés finement libèrent leur parfum piquant. Les herbes du jardin apportent leur touche de fraîcheur. Le thym, le romarin, le laurier embaument déjà la pièce. Le bouillon mijote doucement sur le feu. Je surveille sans intervenir, laissant le temps faire son œuvre. La patience est l'ingrédient secret des bons plats. Les saveurs se développent lentement, les textures s'harmonisent. À midi, la famille se réunit autour de la table. Les conversations sont joyeuses, les assiettes se remplissent. Ce repas est le fruit de plusieurs heures de préparation tranquille. Mais le résultat en vaut largement la peine.",
        tip: "Comme en cuisine, la précipitation n'apporte rien de bon. Savourez chaque mot comme un bon ingrédient."
      },
      {
        id: "slow-10",
        title: "Le Voyage en Train",
        text: "Le train quitte lentement la gare. Les derniers quais défilent derrière la vitre. Peu à peu, le paysage urbain cède la place à la campagne. Les immeubles se transforment en maisons, puis en champs à perte de vue. Je m'installe confortablement dans mon siège. Le rythme régulier des roues sur les rails m'apaise. Ce bruit caractéristique est une berceuse pour adultes. Je regarde le monde défiler sans me presser. Les vaches paissent tranquillement dans les prés. Un tracteur trace des sillons dans un champ labouré. Un village apparaît au loin avec son clocher pointu. Puis il disparaît aussi vite qu'il était apparu. Le temps de voyage est un temps suspendu. Pas de téléphone qui sonne, pas de réunion qui presse. Je peux enfin lire ce livre qui m'attendait depuis des mois. Ou simplement contempler le paysage en laissant vagabonder mes pensées. Le contrôleur passe vérifier les billets. Son sourire est accueillant, son pas mesuré. Lui aussi semble avoir adopté le rythme du train. La destination approche, mais je ne suis pas pressé d'arriver. Le voyage lui-même est déjà un cadeau.",
        tip: "Adoptez le rythme du train : régulier, paisible, sans à-coups. Les virgules sont vos arrêts en gare."
      },
      {
        id: "slow-11",
        title: "Le Café du Matin",
        text: "La cafetière commence son travail dans un chuintement discret. L'eau chaude traverse lentement le filtre, libérant les arômes du café fraîchement moulu. L'odeur se répand dans toute la cuisine, douce et réconfortante. Je sors ma tasse préférée, celle en céramique bleue que ma sœur m'a offerte. Le café coule, noir et brillant. J'ajoute un nuage de lait qui dessine des spirales blanches à la surface. Je m'assieds à la table, face à la fenêtre. Dehors, la rue s'anime doucement. Un voisin sort son chien. Une voiture passe au loin. Le facteur glisse le courrier dans la boîte aux lettres. Je bois ma première gorgée. La chaleur descend dans ma gorge, dans ma poitrine. Mon corps se réveille. Mon esprit se clarifie. Ce moment du matin n'appartient qu'à moi. Pas d'urgence, pas de pression. Juste le café, le silence et la lumière qui grandit.",
        tip: "Savourez chaque phrase comme une gorgée de café. Les descriptions sensorielles invitent naturellement à ralentir."
      },
      {
        id: "slow-12",
        title: "Les Saisons qui Passent",
        text: "Le printemps arrive sur la pointe des pieds. Un bourgeon ici, une fleur là. Les jours rallongent imperceptiblement. L'air se réchauffe, timidement d'abord, puis avec assurance. Les oiseaux reviennent de leur long voyage. L'été s'installe ensuite avec sa chaleur généreuse. Les journées s'étirent jusqu'au soir. On mange dehors, on rit entre amis. Les enfants jouent tard dans les jardins. Puis l'automne glisse ses couleurs dans le paysage. Le rouge, l'orange, le doré envahissent les forêts. Les matins sont frais, les après-midi encore doux. Les feuilles tombent en tourbillonnant. L'hiver referme le cycle avec sa couverture blanche. Le froid pique les joues. La nuit tombe tôt. On se réfugie au coin du feu. Et dans ce ralentissement imposé par la nature, on se souvient que chaque saison a sa beauté. Que rien ne dure éternellement. Et que c'est justement cela qui rend chaque moment précieux.",
        tip: "Chaque saison est un paragraphe. Marquez une pause plus longue entre les saisons pour laisser le changement s'installer."
      },
      {
        id: "slow-13",
        title: "Le Bruit de la Pluie",
        text: "La pluie commence par quelques gouttes hésitantes. Elles frappent la vitre au hasard, comme pour tester le terrain. Puis le rythme s'installe, régulier et apaisant. Les gouttes se multiplient, formant un rideau d'eau transparent. Le bruit de la pluie sur le toit est une musique ancienne. Elle accompagne l'humanité depuis la nuit des temps. Nos ancêtres l'écoutaient comme nous l'écoutons aujourd'hui. Ce son constant et prévisible calme les nerfs. Il invite au repos, à la contemplation. Les rues se vident, les gens courent se mettre à l'abri. Mais certains restent dehors, le visage offert à la pluie. Ils sentent l'eau couler sur leur peau. Ils sourient. La pluie lave tout, les trottoirs, les voitures, les soucis. Elle nourrit la terre, remplit les rivières, fait pousser les fleurs. Quand elle s'arrête, le monde semble neuf. L'air est pur, les couleurs plus vives. Une odeur de terre mouillée monte du sol. L'arc-en-ciel parfois apparaît, promesse silencieuse que le beau temps reviendra.",
        tip: "Suivez le rythme de la pluie : régulier, sans précipitation. Laissez chaque image se former dans votre esprit."
      },
      {
        id: "slow-14",
        title: "La Lettre à un Ami",
        text: "Cher ami, cela fait longtemps que je voulais t'écrire. Les jours passent si vite que je repousse toujours au lendemain. Mais aujourd'hui, je prends le temps. Je m'assieds à mon bureau, je sors une feuille blanche, et je te parle. Comment vas-tu ? Je pense souvent à nos conversations d'autrefois. À ces heures passées à refaire le monde. Nous avions tant de projets, tant de rêves. Certains se sont réalisés, d'autres ont pris des chemins que nous n'avions pas prévus. Mais l'essentiel est resté : notre amitié, notre complicité, cette confiance qui ne faiblit pas malgré la distance. J'espère que la vie te traite bien. Que tu trouves de la joie dans les petites choses du quotidien. Que tu prends soin de toi. De mon côté, j'apprends à ralentir. À apprécier ce que j'ai plutôt que de courir après ce qui me manque. C'est un exercice difficile, mais qui en vaut la peine. J'aimerais te revoir bientôt. En attendant, sache que tu comptes pour moi. Ton ami fidèle.",
        tip: "Lisez comme si vous dictiez la lettre à voix haute. Le ton doit être chaleureux et posé."
      },
      {
        id: "slow-15",
        title: "L'Atelier du Menuisier",
        text: "L'atelier sent le bois et la colle. Des copeaux jonchent le sol, dorés comme des boucles de cheveux. Le menuisier travaille en silence, concentré sur sa pièce. Ses mains sont rugueuses mais précises. Chaque geste est réfléchi, chaque coup de rabot mesuré. Le bois se transforme sous ses doigts. Une planche brute devient un tiroir. Un tronc devient un pied de table. Il n'y a pas de place pour la hâte dans ce métier. La précipitation gâche le bois, fausse les angles, fragilise les assemblages. Le menuisier le sait. Il a appris la patience auprès de son père, qui l'avait apprise du sien. Trois générations de mains patientes, de regards attentifs, de gestes transmis. Quand la pièce est terminée, il la caresse du plat de la main. Le bois est lisse, chaud, vivant. Il recule d'un pas pour admirer son travail. Un sourire discret éclaire son visage. Demain, il recommencera avec une nouvelle pièce. Et le même plaisir sera au rendez-vous.",
        tip: "Chaque geste du menuisier est lent et précis. Votre lecture doit refléter cette même attention au détail."
      }
    ]
  },
  {
    id: "daily-life",
    level: 2,
    title: "Vie quotidienne",
    description: "Emails, conversations et situations courantes. Entraînez-vous sur des textes réalistes du quotidien.",
    icon: "📧",
    color: "from-blue-500/20 to-blue-600/10",
    exercises: [
      {
        id: "daily-1",
        title: "L'Email Professionnel",
        text: "Bonjour Monsieur Dupont, je vous remercie sincèrement pour votre message du quinze janvier dernier. J'ai pris le temps de lire attentivement votre proposition commerciale, et je dois dire qu'elle a retenu toute mon attention. Les conditions que vous proposez correspondent globalement à nos attentes. Cependant, j'aimerais clarifier certains points avant de nous engager. Premièrement, concernant les délais de livraison, vous mentionnez un délai de trois semaines, mais serait-il possible de le réduire à deux semaines pour les commandes urgentes ? Deuxièmement, je souhaiterais en savoir plus sur les conditions de garantie. Vous indiquez une garantie de deux ans, mais couvre-t-elle également les pièces d'usure ? Troisièmement, nous aimerions discuter des modalités de paiement. Un échelonnement sur trois mois nous conviendrait mieux qu'un paiement comptant. Je suis disponible mardi prochain, le vingt-trois janvier, pour en discuter de vive voix lors d'un rendez-vous téléphonique. Merci de me confirmer votre disponibilité. N'hésitez pas à me contacter si vous avez des questions ou des remarques concernant ces points. Je reste à votre entière disposition pour tout complément d'information. Dans l'attente de votre retour, je vous prie d'agréer, Monsieur, l'expression de mes salutations distinguées. Bien cordialement, Marie Martin, Responsable des Achats.",
        tip: "Les emails professionnels méritent un débit posé et clair. Marquez bien les transitions entre les différents points."
      },
      {
        id: "daily-2",
        title: "La Commande au Restaurant",
        text: "Bonsoir, nous avons réservé une table pour quatre personnes au nom de Leblanc pour vingt heures. Parfait, merci de nous installer près de la fenêtre si possible. Nous aimerions commencer par consulter la carte des vins. Pourriez-vous nous recommander un vin rouge qui accompagnerait bien un plat de viande rouge ? Excellent, nous allons prendre une bouteille de ce Côtes-du-Rhône que vous recommandez. Pour les entrées, je vais prendre le foie gras maison avec son chutney de figues. Mon épouse prendra la salade de chèvre chaud aux noix. Pour les enfants, nous allons commander deux soupes du jour. Pour les plats principaux, je choisirai l'entrecôte grillée, cuisson à point, avec des frites maison et une sauce au poivre. Ma femme souhaite le filet de bar poêlé avec sa purée de céleri. Pour les enfants, deux steaks hachés avec des haricots verts, s'il vous plaît. Ah, j'oubliais, mon fils est allergique aux noix, pourriez-vous le signaler en cuisine ? Merci beaucoup. Nous verrons pour le dessert plus tard. Pourrions-nous également avoir une carafe d'eau plate et une bouteille d'eau gazeuse ? Et si c'est possible, un peu plus de pain, celui-ci est délicieux. Merci infiniment pour votre patience et votre professionnalisme.",
        tip: "Dans un commerce, parlez assez lentement pour être compris du premier coup. Les commandes détaillées nécessitent clarté et pauses."
      },
      {
        id: "daily-3",
        title: "La Réunion d'Équipe",
        text: "Merci à tous d'être présents pour cette réunion hebdomadaire. Je sais que vous avez des emplois du temps chargés, donc j'essaierai d'être aussi concis que possible. Aujourd'hui, nous allons aborder cinq points essentiels qui concernent directement notre équipe et nos objectifs du trimestre. Premièrement, faisons le bilan du mois de janvier. Les résultats sont encourageants : nous avons atteint cent quinze pour cent de notre objectif de ventes. C'est un excellent travail d'équipe, et je tenais à vous féliciter. Deuxièmement, parlons des objectifs pour février. Nous devons maintenir cette dynamique tout en préparant le lancement du nouveau produit prévu pour le quinze mars. Troisièmement, j'aimerais discuter de la réorganisation du planning. Suite aux retours que vous m'avez faits, nous allons décaler les réunions du lundi matin au mardi après-midi. Cela devrait convenir à tout le monde. Quatrièmement, concernant les formations, nous avons obtenu le budget pour trois sessions de formation au nouveau logiciel. Les inscriptions seront ouvertes dès demain. Cinquièmement et dernièrement, les questions ouvertes. Y a-t-il des sujets que vous souhaitez aborder ? Des préoccupations ? Des suggestions ? N'hésitez pas à prendre la parole. Votre avis compte énormément pour la réussite de nos projets communs. Avant de conclure, je vous rappelle que les entretiens individuels auront lieu la semaine prochaine.",
        tip: "Numérotez vos points à voix haute en marquant des pauses. En réunion, un débit calme facilite la prise de notes."
      },
      {
        id: "daily-4",
        title: "Les Directions Détaillées",
        text: "Bien sûr, je vais vous expliquer comment aller à la gare depuis ici. C'est assez simple, mais écoutez bien car il y a quelques tournants. Sortez de ce bâtiment par la porte principale. Une fois dehors, tournez à droite et continuez tout droit pendant environ deux cents mètres. Vous allez passer devant une boulangerie sur votre gauche, puis une pharmacie sur votre droite. Au premier feu rouge, celui qui se trouve juste après le café du Commerce, tournez à gauche. Vous serez alors sur l'avenue Victor Hugo. Suivez cette avenue pendant environ quatre cents mètres. Vous passerez devant le parc municipal sur votre droite, c'est un bon repère. Continuez tout droit jusqu'au grand carrefour avec le rond-point. Prenez la deuxième sortie du rond-point, direction centre-ville. La rue s'appelle rue de la République. Marchez encore cent cinquante mètres environ. La gare sera sur votre droite, juste après le bureau de poste. Vous ne pouvez pas la manquer, il y a un grand panneau bleu avec le logo de la SNCF. En tout, comptez environ dix à quinze minutes de marche à un rythme normal. Si vous êtes pressé, vous pouvez aussi prendre le bus numéro sept qui passe toutes les dix minutes devant ce bâtiment et qui s'arrête directement devant la gare. Bon courage et bonne route !",
        tip: "Donnez les instructions par étapes distinctes. Chaque direction mérite une pause pour permettre l'assimilation."
      },
      {
        id: "daily-5",
        title: "L'Appel au Service Client",
        text: "Allô, bonjour, je vous appelle concernant un problème avec ma commande passée sur votre site internet. Mon numéro de commande est le quatre-vingt-seize deux cent trente-quatre cinq cent soixante-dix-huit. J'ai passé cette commande le dix janvier et je devais la recevoir sous cinq jours ouvrés. Nous sommes aujourd'hui le vingt-deux janvier et je n'ai toujours rien reçu. J'ai vérifié le suivi de colis avec le numéro que vous m'avez envoyé par email, mais le statut indique que le colis est bloqué à l'entrepôt depuis le quatorze janvier. J'ai essayé de contacter le transporteur, mais ils m'ont renvoyé vers vous en disant que le problème venait de l'expéditeur. C'est assez frustrant car j'avais besoin de cet article pour un événement ce week-end. Pourriez-vous vérifier ce qui se passe avec ma commande ? Est-il possible de la faire livrer en express ? Ou si ce n'est pas possible, je souhaiterais être remboursé pour pouvoir acheter l'article ailleurs. Je comprends que les retards peuvent arriver, mais deux semaines sans nouvelles, c'est vraiment long. Pouvez-vous me donner une solution aujourd'hui ? Je vous remercie par avance pour votre aide et votre compréhension. Mon numéro de téléphone est le zéro six douze trente-quatre cinquante-six soixante-dix-huit si vous avez besoin de me recontacter.",
        tip: "Au téléphone, articulez davantage car l'autre ne voit pas vos lèvres. Énoncez clairement les numéros."
      },
      {
        id: "daily-6",
        title: "La Présentation Professionnelle",
        text: "Bonjour à tous et bienvenue à cette présentation. Je m'appelle Thomas Martin et je suis le responsable du projet Innovation au sein de notre département. Aujourd'hui, je vais vous présenter les résultats de notre étude de marché et nos recommandations pour le lancement du nouveau produit. Cette présentation durera environ trente minutes, suivies d'une session de questions-réponses. Si vous avez des questions pendant la présentation, n'hésitez pas à m'interrompre. Commençons par le contexte. Comme vous le savez, le marché a beaucoup évolué ces deux dernières années. Nos concurrents ont lancé des produits innovants et nos parts de marché ont légèrement diminué. Face à ce constat, nous avons mené une étude approfondie auprès de cinq cents clients potentiels. Les résultats sont très instructifs. Soixante-dix pour cent des personnes interrogées se disent prêtes à essayer un nouveau produit si celui-ci répond à trois critères principaux : la qualité, le prix et la durabilité. Notre nouveau produit répond parfaitement à ces attentes. Passons maintenant aux chiffres prévisionnels. Nous estimons pouvoir conquérir huit pour cent de parts de marché la première année, et douze pour cent la deuxième année. Pour atteindre ces objectifs, nous recommandons un investissement marketing de deux cent mille euros répartis sur dix-huit mois. Je vais maintenant vous montrer les maquettes du produit et les retours des groupes de discussion.",
        tip: "En présentation, parlez vingt pour cent plus lentement que d'habitude. Utilisez les pauses pour laisser le temps à l'audience d'absorber l'information."
      },
      {
        id: "daily-7",
        title: "La Consultation Médicale",
        text: "Docteur, je viens vous voir car je ressens une douleur persistante au niveau du bas du dos depuis environ trois semaines maintenant. C'est une douleur qui a commencé progressivement, sans événement déclencheur particulier que je puisse identifier. Elle est surtout présente le matin au réveil et quand je reste assis trop longtemps à mon bureau. La douleur diminue généralement quand je bouge et quand je marche. J'ai essayé de faire des étirements que j'ai trouvés sur internet, mais ça ne suffit pas à la soulager durablement. J'ai aussi pris du paracétamol pendant quelques jours, ce qui atténue un peu la douleur, mais elle revient dès que l'effet du médicament se dissipe. Sur une échelle de un à dix, je dirais que la douleur est autour de cinq ou six. Ce n'est pas insupportable, mais c'est vraiment gênant au quotidien, surtout dans mon travail où je dois rester assis de longues heures. J'ai remarqué que la douleur irradie parfois vers ma jambe droite, surtout le soir. Je n'ai pas de fièvre, pas de perte de poids, et je n'ai pas eu d'accident récent. Par contre, je dois vous dire que je fais très peu de sport depuis plusieurs mois et que mon fauteuil de bureau n'est pas très ergonomique. Qu'en pensez-vous, docteur ? Est-ce que je devrais faire des examens complémentaires ?",
        tip: "Décrivez vos symptômes calmement et méthodiquement. Un discours posé aide le médecin à bien comprendre votre situation."
      },
      {
        id: "daily-8",
        title: "La Négociation Commerciale",
        text: "Je comprends parfaitement votre position, et je l'entends sincèrement. Vous avez des contraintes budgétaires, et nous avons nos coûts de production à couvrir. C'est une situation classique dans toute négociation commerciale. Cependant, je suis convaincu que nous pouvons trouver un terrain d'entente qui satisfasse les deux parties. Permettez-moi de vous faire une proposition alternative. Au lieu du tarif standard de cinquante euros par unité, je peux vous proposer quarante-cinq euros, soit une réduction de dix pour cent. En contrepartie, je vous demanderais un engagement sur une commande minimale de cinq cents unités au lieu des trois cents initialement prévues. De plus, nous pourrions envisager un partenariat sur le long terme avec des tarifs dégressifs selon les volumes commandés. Pour les commandes dépassant mille unités, le prix pourrait descendre à quarante-deux euros. Qu'en pensez-vous ? Cette proposition vous permettrait de réduire vos coûts tout en nous garantissant un volume suffisant pour maintenir notre qualité de service. Je suis également ouvert à discuter des délais de paiement. Si un règlement à soixante jours vous convient mieux qu'à trente jours, nous pouvons nous adapter. L'important pour nous est de construire une relation de confiance durable. Prenez le temps d'y réfléchir et revenez vers moi avec vos commentaires. Je reste flexible et ouvert à la discussion.",
        tip: "Dans une négociation, les pauses stratégiques montrent votre assurance. Parlez lentement pour donner du poids à chaque proposition."
      },
      {
        id: "daily-9",
        title: "Le Rendez-vous Bancaire",
        text: "Bonjour, j'ai rendez-vous à quatorze heures trente avec Monsieur Lambert, mon conseiller financier. Je viens pour discuter d'un projet immobilier. Mon épouse et moi souhaitons acheter un appartement dans le centre-ville. Notre budget se situe entre deux cent cinquante mille et trois cent mille euros. Nous disposons d'un apport personnel de cinquante mille euros, soit environ vingt pour cent du prix total. Nous aimerions un prêt sur vingt ans, avec des mensualités ne dépassant pas mille deux cents euros. Pourriez-vous nous présenter les différentes options de taux ? Nous avons vu qu'il existe des taux fixes et des taux variables. Quelle est la différence en termes de risque ? Et concernant l'assurance emprunteur, est-il possible de la souscrire auprès d'un organisme extérieur ? Nous avons aussi entendu parler du prêt à taux zéro. Y avons-nous droit ? Enfin, quels documents devons-nous vous fournir pour constituer le dossier ? Je préfère anticiper pour ne rien oublier.",
        tip: "Les chiffres financiers exigent une diction précise. Articulez chaque montant distinctement."
      },
      {
        id: "daily-10",
        title: "L'Appel à l'Assurance",
        text: "Bonjour, je vous appelle suite à un sinistre dans mon appartement. Il y a eu un dégât des eaux hier soir, vers vingt-deux heures. Le tuyau sous l'évier de la cuisine a lâché et l'eau s'est infiltrée dans le sol pendant environ deux heures avant que je ne m'en aperçoive. Le parquet de la cuisine et du salon est endommagé sur environ huit mètres carrés. Le plafond de mon voisin du dessous est également touché. J'ai coupé l'arrivée d'eau immédiatement et j'ai prévenu le gardien de l'immeuble. Mon numéro de contrat est le H sept cent quatre-vingt-trois mille deux cent quinze. J'ai pris des photos des dégâts que je peux vous envoyer par email. Mon plombier est intervenu ce matin pour réparer la fuite. La facture s'élève à trois cent vingt euros. Pouvez-vous m'expliquer la marche à suivre pour la déclaration ? Quels sont les délais de remboursement ? Et est-ce que la franchise s'applique dans ce cas ? Je vous remercie pour votre aide.",
        tip: "En situation de stress, on a tendance à tout dire d'un coup. Structurez votre récit chronologiquement."
      },
      {
        id: "daily-11",
        title: "La Réunion de Copropriété",
        text: "Mesdames, messieurs, merci d'être venus à cette assemblée générale de copropriété. Le premier point à l'ordre du jour concerne les travaux de ravalement de la façade. Le devis de l'entreprise Dubois s'élève à quarante-cinq mille euros, répartis sur l'ensemble des copropriétaires selon les tantièmes. Pour un appartement de trois pièces, cela représente environ mille cinq cents euros. Le deuxième point concerne le remplacement de la chaudière collective. L'installation actuelle a trente-deux ans et les pannes se multiplient. Nous avons reçu trois devis. Le syndic recommande l'option intermédiaire à soixante-douze mille euros, avec une garantie de dix ans. Troisième point, le règlement intérieur. Plusieurs résidents ont signalé des nuisances sonores répétées le week-end. Je vous rappelle que le silence est de mise entre vingt-deux heures et sept heures du matin. Enfin, dernier point, la question du local à vélos. La demande est forte, les places limitées. Nous proposons d'installer des crochets muraux pour doubler la capacité. Procédons maintenant au vote sur chaque point.",
        tip: "Le registre formel impose un débit posé. Détachez les chiffres et les termes techniques."
      },
      {
        id: "daily-12",
        title: "Le Parent d'Élève",
        text: "Bonsoir madame, je suis le père de Léa, en classe de CE2 avec vous. Je voulais prendre un moment pour discuter de sa progression. Léa nous dit qu'elle se sent un peu perdue en mathématiques depuis les divisions. À la maison, nous essayons de l'aider mais elle se bloque rapidement et se met à pleurer. En revanche, elle adore la lecture et nous raconte chaque soir ce qu'elle a lu en classe. Pour l'écriture, elle fait encore beaucoup de fautes d'orthographe, mais son écriture est de plus en plus lisible. Est-ce que vous avez remarqué des difficultés particulières en classe ? Comment se comporte-t-elle avec les autres enfants ? Sa meilleure amie a changé d'école en septembre et nous pensons que cela l'a un peu affectée. Nous voulions aussi vous demander si un soutien scolaire serait utile pour les mathématiques, ou si c'est simplement une question de temps et de pratique. Merci beaucoup pour tout ce que vous faites. Léa parle de vous avec beaucoup d'affection.",
        tip: "Parler de son enfant peut accélérer le débit. Gardez un ton calme et structuré."
      }
    ]
  },
  {
    id: "articulation",
    level: 3,
    title: "Défis d'articulation",
    description: "Virelangues et mots complexes. Le niveau expert pour perfectionner votre diction et votre contrôle.",
    icon: "🎯",
    color: "from-red-500/20 to-red-600/10",
    exercises: [
      {
        id: "artic-1",
        title: "Les Chaussettes",
        text: "Les chaussettes de l'archiduchesse sont-elles sèches, archi-sèches ? Si elles sont sèches, c'est qu'elles ont été bien séchées. L'archiduchesse cherche ses chaussettes sèches dans le séchoir. Mais ces chaussettes sont-elles assez sèches pour l'archiduchesse ?",
        tip: "Articulez chaque syllabe en exagérant les mouvements de la bouche."
      },
      {
        id: "artic-2",
        title: "Le Chasseur",
        text: "Un chasseur sachant chasser doit savoir chasser sans son chien. Car un bon chasseur qui chasse sans son chien chasse mieux qu'avec. Sachant cela, le chasseur sachant chasser prend son chien qui sait chercher ce que le chasseur chasse.",
        tip: "Concentrez-vous sur le son 'ch' sans le transformer en 's'."
      },
      {
        id: "artic-3",
        title: "Les Scies",
        text: "Si six scies scient six cyprès, six cents scies scient six cents cyprès. Et si six mille scies scient, combien de cyprès sont sciés ? Six mille six cent six cyprès sciés, c'est sûr !",
        tip: "Ralentissez considérablement sur les sons 's' et 'c'."
      },
      {
        id: "artic-4",
        title: "Tonton",
        text: "Tonton, ton thé t'a-t-il ôté ta toux ? Si ton thé t'a ôté ta toux, alors ton thé était un bon thé. Tonton tousse toujours, ton thé ne t'a donc pas tout ôté ta toux tenace.",
        tip: "Faites bien la différence entre les sons 't' et 'th'."
      },
      {
        id: "artic-5",
        title: "Didon",
        text: "Didon dîna, dit-on, du dos d'un dodu dindon. Don d'un don divin, Didon dîna donc du dindon. Didon dit de dédaigner les dindons dodus, mais donna tout de même du dindon à ses dames.",
        tip: "Pratiquez d'abord lentement, puis accélérez progressivement."
      },
      {
        id: "artic-6",
        title: "Les Fruits",
        text: "Fruits frais, fruits frits, fruits cuits, fruits crus. Un fruit frit n'est plus un fruit frais, mais un fruit cuit peut rester cru au centre. Fréquemment, Frédéric frit des fruits frais pour son frère François.",
        tip: "Les allitérations en 'fr' demandent une articulation précise."
      },
      {
        id: "artic-7",
        title: "Le son KS",
        text: "Le fisc fixe exprès chaque taxe fixe excessive exclusivement au luxe et à l'exquis. Cette taxe fixe excessive est fixée exprès par le fisc. Six fiscalistes fixent six taxes fixes sur six exercices.",
        tip: "Le son 'x' est le plus difficile - décomposez-le en 'ks'."
      },
      {
        id: "artic-8",
        title: "Le Pêcheur",
        text: "Pauvre petit pêcheur, prend patience pour pouvoir prendre plusieurs petits poissons. Les petits poissons ne pressent pas le pêcheur patient. Près du port, Pierre le pêcheur pêche peu de poissons par peur des pirates.",
        tip: "Exagérez le 'p' en projetant légèrement de l'air."
      },
      {
        id: "artic-9",
        title: "Piano Panier",
        text: "Piano, panier, piano, panier. Je dis piano panier, puis panier piano. Un piano dans un panier, un panier sur un piano. Qui porte le panier au piano ? Le pianiste porte son panier près du piano.",
        tip: "Alternez rapidement entre les sons 'pi' et 'pa'."
      },
      {
        id: "artic-10",
        title: "Le Rat",
        text: "Rat vit rôt, rôt tenta rat. Rat mit patte à rôt, rôt brûla patte à rat. Rat secoua sa patte et rata le rôt. Rat rageur regretta vraiment d'avoir raté ce rôti royal.",
        tip: "Roulez légèrement les 'r' pour plus de clarté."
      },
      {
        id: "artic-11",
        title: "Trois Tortues",
        text: "Trois très gros, gras, grands rats gris grattent trois très gros, gras, grands rats gris. Trois tortues trottaient sur un trottoir très étroit. Trop de tortues trottent, le trottoir tremble.",
        tip: "Les groupes consonantiques 'gr' et 'tr' demandent de l'attention."
      },
      {
        id: "artic-12",
        title: "Saucissons Secs",
        text: "Je veux et j'exige d'exquises excuses. Ces six saucissons-ci sont si secs qu'on ne sait si c'en sont. Combien ces six saucissons-ci ? Six sous ces six saucissons-ci, c'est suffisant.",
        tip: "Articulez les sifflantes 's' avec précision."
      },
      {
        id: "artic-13",
        title: "La Roue",
        text: "La roue sur la rue roule, la rue sous la roue reste. Trois gros rats roux rongent trois gros croûtons ronds. Roger regarde la roue rouler sur la route royale.",
        tip: "Travaillez la fluidité des enchaînements de 'r'."
      },
      {
        id: "artic-14",
        title: "Les Poulets",
        text: "Poule pond, poule pond pas. Pourquoi la poule pond ? Parce que le papa poule propose. Pas de poule, pas de poulet. Pas de poulet, pas de poulette. Cinq poules pondent cinq œufs par jour.",
        tip: "Enchaînez les 'p' explosifs avec précision."
      },
      {
        id: "artic-15",
        title: "Les Coquillages",
        text: "Elle cueille ces coquillages sur les côtes du Cotentin. Ces coquillages sont des coquilles de coques. Combien de coquillages Catherine cueille-t-elle ? Quinze coques, cinq coquilles, quatre coquillages.",
        tip: "Distinguez bien les sons 'k' et 'g' dans les enchaînements."
      },
      {
        id: "artic-16",
        title: "Le Blé",
        text: "Beau blé blond bien blanchi blanchit bien. Le blé blond blanchit sous le soleil de Brest. Bruno broie le blé blond pour en faire du bon pain blanc bien beau.",
        tip: "Les groupes 'bl' et 'br' demandent une articulation soignée."
      },
      {
        id: "artic-17",
        title: "Le Nid",
        text: "Nid de pie, pie dans le nid. Nid de pie sans pie, ça n'a ni queue ni tête. Neuf nids nichent dans le noyer. Les petites pies piaillent dans leurs petits nids.",
        tip: "Le son 'ni' doit rester net et distinct."
      },
      {
        id: "artic-18",
        title: "Les Grenouilles",
        text: "Grosse grenouille grasse grimpe dans la grande grotte grise. La grenouille grogne car le grillon grince. Gaston le gros grillon grignote des grains de grenade avec la grenouille grise.",
        tip: "Maintenez la régularité sur les groupes 'gr' répétés."
      },
      {
        id: "artic-19",
        title: "Le Crabe",
        text: "Crabe craque, croque et crépite sur la crêpe croustillante. Le cuisinier craintif craint que le crabe ne crée une crise. Quatre crabes croquent quatre crevettes crues.",
        tip: "Les groupes 'cr' et 'qu' exigent une langue bien positionnée."
      },
      {
        id: "artic-20",
        title: "L'Âne et le Bœuf",
        text: "L'âne et le bœuf boivent au bord du ru. Le bœuf boit beaucoup, l'âne boit un peu. Bientôt le bœuf sera bedonnant, l'âne restera bancal. Mais qui des deux bavarde le plus ?",
        tip: "Faites bien la liaison entre les voyelles et les consonnes."
      }
    ]
  },
  {
    id: "clinical-texts",
    level: 2,
    title: "Textes Cliniques (Diagnostic)",
    description: "Textes utilisés par les orthophonistes pour évaluer le débit de parole. Validés scientifiquement.",
    icon: "🩺",
    color: "from-purple-500/20 to-purple-600/10",
    isClinical: true,
    exercises: [
      {
        id: "clinical-1",
        title: "Lecture Normée (Maupassant)",
        text: "Les deux femmes habitaient une petite maison à volets verts, le long d'une route en Normandie, au centre du pays de Caux. Comme elles possédaient, devant l'habitation, un étroit jardin, elles cultivaient quelques légumes. Or, une nuit, on lui vola une douzaine d'oignons. La vieille mère courut chez le garde champêtre. Il prit note de la plainte et s'en retourna. Elle pleura. Toutes les ressources de ces malheureuses venaient de ce petit jardin qu'elles cultivaient avec soin. La mère bêchait, tandis que la fille arrosait les plantes. Elles vivaient péniblement, mais tranquillement, dans cette maison isolée. Un jour, elles reçurent la visite d'un homme qui leur proposa d'acheter leur terrain. Elles refusèrent avec dignité. Quelques semaines plus tard, un incendie ravagea une partie de leur jardin. Les voisins accoururent pour les aider. On ne retrouva jamais le coupable. Les deux femmes reconstruisirent patiemment ce qui avait été détruit. Le printemps suivant, leur jardin était plus beau que jamais. Les légumes poussaient en abondance. Les oignons avaient été replantés en double quantité. La vieille mère disait souvent que l'adversité forge le caractère et que rien ne peut arrêter ceux qui ont la volonté de persévérer.",
        tip: "Ce texte est utilisé par les professionnels pour mesurer votre débit naturel. Lisez comme vous le feriez normalement, sans forcer.",
        isClinical: true
      },
      {
        id: "clinical-2",
        title: "Extrait Littéraire (Soie)",
        text: "Bien que son père eût imaginé pour lui un brillant avenir dans l'armée, Hervé Joncour avait fini par gagner sa vie grâce à une profession insolite, à laquelle n'étaient pas étrangers, par une singulière ironie, des traits à ce point aimables qu'ils trahissaient une vague inflexion féminine. Pour vivre, Hervé Joncour achetait et vendait des vers à soie. C'était en mil huit cent soixante et un. Flaubert écrivait Salammbô, l'éclairage électrique n'était encore qu'une hypothèse et Abraham Lincoln, de l'autre côté de l'océan, livrait une guerre dont il ne verrait pas la fin. Hervé Joncour avait trente-deux ans, et l'achat et la vente des vers à soie lui permettaient de mener une existence confortable. Il habitait Lavilledieu, un petit village du sud de la France, dans une grande maison au sommet d'une colline. De là, il voyait les toits du village en contrebas et la vallée qui s'étendait au loin. Chaque année, au début du printemps, il partait pour un long voyage. Il traversait l'Europe en train, puis l'Asie en bateau et à cheval. Il restait plusieurs semaines absent, parfois des mois entiers. Quand il rentrait, ses malles étaient pleines de ces précieux œufs minuscules que l'on transformerait en soie.",
        tip: "Texte complexe avec des structures grammaticales élaborées. Idéal pour tester votre fluidité sur des phrases longues et des subordonnées.",
        isClinical: true
      },
      {
        id: "clinical-3",
        title: "Le Corbeau et le Renard (La Fontaine)",
        text: "Maître Corbeau, sur un arbre perché, tenait en son bec un fromage. Maître Renard, par l'odeur alléché, lui tint à peu près ce langage : Hé ! bonjour, Monsieur du Corbeau. Que vous êtes joli ! que vous me semblez beau ! Sans mentir, si votre ramage se rapporte à votre plumage, vous êtes le Phénix des hôtes de ces bois. À ces mots le Corbeau ne se sent pas de joie. Et pour montrer sa belle voix, il ouvre un large bec, laisse tomber sa proie. Le Renard s'en saisit, et dit : Mon bon Monsieur, apprenez que tout flatteur vit aux dépens de celui qui l'écoute. Cette leçon vaut bien un fromage, sans doute. Le Corbeau, honteux et confus, jura, mais un peu tard, qu'on ne l'y prendrait plus. Cette fable de Jean de La Fontaine nous enseigne qu'il faut se méfier des flatteurs. Les compliments excessifs cachent souvent des intentions malveillantes. Le corbeau, aveuglé par la vanité, perd son bien le plus précieux. La morale est claire : gardons notre esprit critique face aux louanges.",
        tip: "Fable classique utilisée pour évaluer l'intonation et le rythme. Attention aux dialogues et aux changements de ton entre le narrateur et les personnages.",
        isClinical: true
      },
      {
        id: "clinical-4",
        title: "Texte Scientifique",
        text: "La photosynthèse est un processus bioénergétique fondamental qui permet aux plantes, aux algues et à certaines bactéries de synthétiser de la matière organique en utilisant la lumière du soleil comme source d'énergie. Cette réaction chimique essentielle à la vie sur Terre se déroule principalement dans les chloroplastes des cellules végétales. Le processus se divise en deux phases distinctes. La première phase, appelée phase lumineuse, se produit dans les membranes des thylakoïdes. L'énergie lumineuse est captée par les molécules de chlorophylle, qui absorbent principalement les longueurs d'onde rouges et bleues du spectre visible. Cette énergie sert à scinder les molécules d'eau en oxygène, protons et électrons. L'oxygène est libéré dans l'atmosphère comme sous-produit. La seconde phase, appelée cycle de Calvin ou phase sombre, se déroule dans le stroma du chloroplaste. Elle utilise l'énergie stockée lors de la phase lumineuse pour fixer le dioxyde de carbone atmosphérique et le transformer en glucose. Ce sucre constitue la base de l'alimentation de la plante et, indirectement, de la quasi-totalité des êtres vivants. Sans la photosynthèse, la vie telle que nous la connaissons n'existerait pas sur notre planète.",
        tip: "Texte technique pour évaluer votre capacité à maintenir un débit constant sur du vocabulaire scientifique complexe. Articulez bien les termes spécialisés.",
        isClinical: true
      },
      {
        id: "clinical-5",
        title: "Recette de Cuisine Détaillée",
        text: "Pour réaliser un délicieux gâteau au chocolat moelleux pour huit personnes, commencez par préchauffer votre four à cent quatre-vingts degrés. Pendant ce temps, faites fondre deux cents grammes de chocolat noir pâtissier avec cent grammes de beurre au bain-marie ou au micro-ondes. Remuez régulièrement pour obtenir un mélange lisse et homogène. Dans un grand saladier, mélangez cent cinquante grammes de sucre en poudre avec quatre œufs entiers. Battez énergiquement pendant trois à quatre minutes jusqu'à ce que le mélange blanchisse et double de volume. Incorporez délicatement le mélange chocolat-beurre tiédi, en remuant de bas en haut pour ne pas faire retomber la préparation. Ajoutez ensuite cinquante grammes de farine tamisée et une pincée de sel. Mélangez jusqu'à obtenir une pâte homogène sans grumeaux. Beurrez et farinez un moule à manqué de vingt-deux centimètres de diamètre. Versez la préparation et enfournez pendant vingt-cinq à trente minutes. Le gâteau est cuit lorsqu'un couteau planté en son centre ressort légèrement humide. Laissez refroidir dix minutes avant de démouler. Servez tiède avec une boule de glace vanille ou un peu de crème fraîche. Ce gâteau se conserve trois jours dans une boîte hermétique à température ambiante.",
        tip: "Les instructions de recette testent votre capacité à faire des pauses logiques entre les étapes. Chaque nouvelle action mérite une respiration."
      }
    ]
  },
  {
    id: "warmup",
    level: 1,
    title: "Gymnastique Articulatoire",
    description: "Échauffez vos muscles articulatoires — des phrases simples aux défis avancés. Parfait pour préparer votre appareil phonatoire.",
    icon: "🏋️",
    color: "from-orange-500/20 to-amber-600/10",
    type: "warmup",
    exercises: [
      {
        id: "warmup-simple-1",
        title: "Le chat attrape la balle",
        text: "Le chat attrape la balle dans le jardin",
        tip: "Commencez doucement, articulez bien le /tr/ de 'attrape' et le /bl/ de 'balle'.",
        type: "warmup"
      },
      {
        id: "warmup-simple-2",
        title: "Papa prépare le repas",
        text: "Papa prépare le repas pour toute la famille",
        tip: "Sentez le /p/ qui revient souvent — faites claquer les lèvres à chaque fois.",
        type: "warmup"
      },
      {
        id: "warmup-simple-3",
        title: "La tortue trotte",
        text: "La tortue trotte tranquillement sur le trottoir",
        tip: "Le /tr/ revient trois fois — gardez le même rythme posé sur chaque mot.",
        type: "warmup"
      },
      {
        id: "warmup-simple-4",
        title: "Bruno brosse ses bottes",
        text: "Bruno brosse ses belles bottes brunes",
        tip: "Le /br/ et le /b/ travaillent vos lèvres. Exagérez l'ouverture de la bouche.",
        type: "warmup"
      },
      {
        id: "warmup-simple-5",
        title: "Claire croque un croissant",
        text: "Claire croque un croissant croustillant au petit-déjeuner",
        tip: "Le /kr/ demande que la langue touche bien le palais. Allez-y doucement.",
        type: "warmup"
      },
      {
        id: "warmup-simple-6",
        title: "Le train traverse le pont",
        text: "Le train traverse le grand pont de la ville",
        tip: "Deux groupes consonantiques simples : /tr/ et /gr/. Articulez sans forcer.",
        type: "warmup"
      },
      {
        id: "warmup-simple-7",
        title: "Ma grande sœur",
        text: "Ma grande sœur porte un pull gris et des bottes noires",
        tip: "Les groupes /gr/ et /pl/ sont courants — entraînez-les ici en douceur.",
        type: "warmup"
      },
      {
        id: "warmup-simple-8",
        title: "Le clown fait claquer ses clés",
        text: "Le clown fait claquer ses clés devant les enfants",
        tip: "Le /kl/ revient trois fois. C'est ludique — amusez-vous avec le rythme !",
        type: "warmup"
      },
      {
        id: "warmup-simple-9",
        title: "La fleur bleue",
        text: "La fleur bleue flotte doucement sur l'eau du lac",
        tip: "Les sons /fl/ et /bl/ sont doux. Laissez l'air passer entre les dents.",
        type: "warmup"
      },
      {
        id: "warmup-simple-10",
        title: "Trois petits dragons",
        text: "Trois petits dragons dorment dans la grotte sombre",
        tip: "Les groupes /dr/ et /gr/ préparent aux mots plus complexes. Vous y êtes presque !",
        type: "warmup"
      },
      {
        id: "warmup-1",
        title: "Chronologie bouleversante",
        text: "Une chronologie bouleversante et imprévisible",
        tip: "Articulez bien les groupes /kr/ dans 'chronologie' et /pr/ dans 'imprévisible'.",
        type: "warmup"
      },
      {
        id: "warmup-2",
        title: "Réglementation exceptionnelle",
        text: "La réglementation exceptionnelle du laboratoire",
        tip: "Attention au /ks/ de 'exceptionnelle' et au /gl/ de 'réglementation'. Projetez bien chaque consonne.",
        type: "warmup"
      },
      {
        id: "warmup-3",
        title: "Infrastructure stratégique",
        text: "Infrastructure stratégique et développement",
        tip: "Les groupes /str/ et /fr/ demandent une langue bien placée. Ralentissez sur 'stratégique'.",
        type: "warmup"
      },
      {
        id: "warmup-4",
        title: "Multiplicateur spectaculaire",
        text: "Un multiplicateur spectaculaire et invraisemblable",
        tip: "Enchaînez les mots longs sans précipiter. Le /vr/ de 'invraisemblable' est un bon défi.",
        type: "warmup"
      },
      {
        id: "warmup-5",
        title: "Perpétuellement introuvable",
        text: "Perpétuellement introuvable et indéchiffrable",
        tip: "Les /rp/ et /fr/ sont exigeants. Exagérez l'articulation de chaque syllabe.",
        type: "warmup"
      },
      {
        id: "warmup-6",
        title: "Le prestidigitateur",
        text: "Le prestidigitateur manipulait extraordinairement vite",
        tip: "Décomposez 'prestidigitateur' en syllabes : pres-ti-di-gi-ta-teur. Ne sautez aucune !",
        type: "warmup"
      },
      {
        id: "warmup-7",
        title: "Transformation progressive",
        text: "La transformation progressive de l'architecture",
        tip: "Les groupes /tr/, /sf/ et /kt/ se succèdent. Maintenez un débit constant.",
        type: "warmup"
      },
      {
        id: "warmup-8",
        title: "Électrocardiogramme",
        text: "Un électrocardiogramme particulièrement complexe",
        tip: "Mot très long ! Découpez : é-lec-tro-car-dio-gramme. Chaque syllabe compte.",
        type: "warmup"
      },
      {
        id: "warmup-9",
        title: "Vraisemblablement",
        text: "Vraisemblablement incompréhensible et contradictoire",
        tip: "Le /vr/ initial est rare en français. Préparez bien la position de vos lèvres avant de démarrer.",
        type: "warmup"
      },
      {
        id: "warmup-10",
        title: "Anthropologie structurale",
        text: "L'anthropologie structurale contemporaine",
        tip: "Les clusters /tr/, /str/ et /kt/ sont le cœur du défi. Articulez sans accélérer.",
        type: "warmup"
      }
    ]
  },
  {
    id: "improvisation",
    level: 2,
    title: "Improvisation Guidée",
    description: "Parlez librement sur un thème donné. Le vrai test du bredouillement : organiser sa pensée en temps réel.",
    icon: "🎤",
    color: "from-pink-500/20 to-rose-600/10",
    type: "improvisation",
    exercises: [
      {
        id: "impro-1",
        title: "Le dernier film",
        text: "Racontez le dernier film que vous avez vu.",
        tip: "Structurez votre récit : contexte, intrigue, avis personnel. Faites des pauses.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-2",
        title: "Vos dernières vacances",
        text: "Décrivez vos dernières vacances.",
        tip: "Utilisez des connecteurs : d'abord, ensuite, puis, finalement.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-3",
        title: "Expliquer son métier",
        text: "Expliquez votre métier à un enfant de 5 ans.",
        tip: "Simplifiez votre vocabulaire. Les phrases courtes sont vos alliées.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-4",
        title: "Votre plat préféré",
        text: "Quel est votre plat préféré et comment le cuisine-t-on ?",
        tip: "Énumérez les étapes calmement, comme si vous lisiez une recette.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-5",
        title: "Un souvenir d'enfance",
        text: "Racontez un souvenir marquant de votre enfance.",
        tip: "Les émotions peuvent accélérer le débit. Restez vigilant.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-6",
        title: "Votre journée idéale",
        text: "Décrivez votre journée idéale du réveil au coucher.",
        tip: "Chronologie = structure. Utilisez-la pour rester organisé.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-7",
        title: "Un lieu que vous aimez",
        text: "Décrivez un lieu qui vous est cher et expliquez pourquoi.",
        tip: "Décrivez d'abord le visuel, puis les sensations, puis les émotions.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-8",
        title: "Convaincre un ami",
        text: "Convainquez un ami de lire votre livre préféré.",
        tip: "L'argumentation demande des pauses pour que l'autre 'réfléchisse'.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-9",
        title: "La pièce autour de vous",
        text: "Décrivez la pièce dans laquelle vous vous trouvez.",
        tip: "Commencez par le général (forme, taille) puis allez vers les détails.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-10",
        title: "Super-pouvoir",
        text: "Si vous aviez un super-pouvoir, lequel choisiriez-vous et pourquoi ?",
        tip: "Justifiez votre choix avec des exemples concrets de son utilisation.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-11",
        title: "Votre meilleur ami",
        text: "Décrivez votre meilleur ami : son caractère, vos moments partagés.",
        tip: "Les anecdotes personnelles activent les émotions. Ralentissez.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-12",
        title: "Matin vs Soir",
        text: "Êtes-vous plutôt du matin ou du soir ? Expliquez pourquoi.",
        tip: "Comparez les deux situations pour structurer votre propos.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-13",
        title: "Votre animal préféré",
        text: "Quel est votre animal préféré et pourquoi vous fascine-t-il ?",
        tip: "Décrivez l'animal avant d'expliquer votre attachement.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-14",
        title: "Un objet important",
        text: "Décrivez un objet qui a une valeur sentimentale pour vous.",
        tip: "Racontez l'histoire derrière l'objet, pas juste sa description physique.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-15",
        title: "Votre saison préférée",
        text: "Quelle est votre saison préférée et qu'aimez-vous y faire ?",
        tip: "Utilisez les 5 sens : ce que vous voyez, entendez, sentez...",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-16",
        title: "Un talent caché",
        text: "Avez-vous un talent ou une passion que peu de gens connaissent ?",
        tip: "Expliquez comment vous l'avez découvert et développé.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-17",
        title: "Conseil à votre moi du passé",
        text: "Quel conseil donneriez-vous à vous-même il y a 10 ans ?",
        tip: "Structurez : le contexte passé, le conseil, pourquoi il est important.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-18",
        title: "Une invention utile",
        text: "Quelle invention du quotidien vous semble indispensable ?",
        tip: "Décrivez l'objet, puis expliquez son impact sur votre vie.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-19",
        title: "Votre week-end idéal",
        text: "Comment passerez-vous un week-end parfait ?",
        tip: "Déroulez chronologiquement : samedi matin, après-midi, soir, dimanche...",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-20",
        title: "Un rêve récurrent",
        text: "Avez-vous un rêve ou une aspiration qui vous tient à cœur ?",
        tip: "Parlez de vos motivations profondes. Prenez votre temps.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-21",
        title: "À la boulangerie",
        text: "Vous entrez dans une boulangerie bondée. Commandez plusieurs viennoiseries et un gâteau pour un anniversaire, en précisant vos choix et quantités.",
        tip: "Énumérez calmement. Le stress de la file d'attente pousse à accélérer — résistez.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-22",
        title: "Appel téléphonique urgent",
        text: "Vous appelez votre médecin pour obtenir un rendez-vous en urgence. Expliquez vos symptômes clairement et répondez aux questions de la secrétaire.",
        tip: "L'urgence pousse à parler vite. Forcez-vous à articuler chaque information.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-23",
        title: "Réclamation en magasin",
        text: "Vous retournez un article défectueux dans un magasin. Expliquez le problème, ce que vous attendez, et restez poli malgré la frustration.",
        tip: "La colère accélère le débit. Respirez entre chaque argument.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-24",
        title: "Se présenter à un inconnu",
        text: "Vous êtes à une soirée et quelqu'un vous demande ce que vous faites dans la vie. Présentez-vous de manière claire et engageante.",
        tip: "Le regard de l'autre peut intimider. Concentrez-vous sur votre souffle.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-25",
        title: "Donner son chemin",
        text: "Un touriste vous demande comment aller de la gare à la mairie. Expliquez l'itinéraire étape par étape avec des repères visuels.",
        tip: "Les directions demandent de la précision. Marquez une pause entre chaque étape.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-26",
        title: "Entretien d'embauche",
        text: "On vous demande en entretien : 'Parlez-moi de vous et de votre parcours.' Répondez de manière structurée et convaincante.",
        tip: "Situation à fort enjeu. Structurez : formation, expérience, motivation. Respirez.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-27",
        title: "Réunion parents-profs",
        text: "Vous êtes en réunion parents-professeurs. Posez des questions sur les résultats de votre enfant et discutez des pistes d'amélioration.",
        tip: "Les émotions parentales accélèrent la parole. Restez factuel et posé.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-28",
        title: "Commander au drive",
        text: "Vous êtes au drive d'un fast-food. Commandez pour toute la famille en détaillant chaque menu, les boissons et les suppléments.",
        tip: "Le micro du drive crée une pression de temps. Articulez, on ne vous voit pas.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-29",
        title: "Appeler les pompiers",
        text: "Vous êtes témoin d'un petit accident de la route. Appelez les secours et décrivez la situation : lieu, nombre de personnes, ce que vous voyez.",
        tip: "En situation d'urgence, la clarté sauve des vies. Parlez lentement et distinctement.",
        type: "improvisation",
        duration: 120
      },
      {
        id: "impro-30",
        title: "Négocier un prix",
        text: "Vous êtes dans un marché aux puces et vous voulez négocier le prix d'un meuble ancien. Argumentez poliment pour obtenir une réduction.",
        tip: "La négociation demande de l'assurance. Les silences sont vos meilleurs alliés.",
        type: "improvisation",
        duration: 120
      }
    ]
  },
  {
    id: "motor-challenges",
    level: 3,
    title: "Défis Moteurs (Diadococinésie)",
    description: "Exercices de coordination motrice utilisés en orthophonie. Répétez des syllabes le plus régulièrement possible.",
    icon: "⚡",
    color: "from-cyan-500/20 to-teal-600/10",
    type: "repetition",
    isClinical: true,
    exercises: [
      {
        id: "motor-1",
        title: "PA - PA - PA",
        text: "PA - PA - PA - PA - PA - PA - PA - PA - PA - PA",
        tip: "Gardez un rythme régulier. Chaque 'PA' doit avoir la même durée.",
        type: "repetition",
        repetitions: 10
      },
      {
        id: "motor-2",
        title: "TA - TA - TA",
        text: "TA - TA - TA - TA - TA - TA - TA - TA - TA - TA",
        tip: "La langue touche le palais au même endroit à chaque fois.",
        type: "repetition",
        repetitions: 10
      },
      {
        id: "motor-3",
        title: "KA - KA - KA",
        text: "KA - KA - KA - KA - KA - KA - KA - KA - KA - KA",
        tip: "Le 'K' vient du fond de la gorge. Projetez le son vers l'avant.",
        type: "repetition",
        repetitions: 10
      },
      {
        id: "motor-4",
        title: "TA - KA alternés",
        text: "TA - KA - TA - KA - TA - KA - TA - KA - TA - KA",
        tip: "Alternez entre l'avant (TA) et l'arrière (KA) de la bouche.",
        type: "repetition",
        repetitions: 10
      },
      {
        id: "motor-5",
        title: "PA - TA - KA",
        text: "PA - TA - KA - PA - TA - KA - PA - TA - KA",
        tip: "La séquence classique ! Trois positions différentes : lèvres, langue avant, langue arrière.",
        type: "repetition",
        repetitions: 9
      },
      {
        id: "motor-6",
        title: "PA - TA - KA rapide",
        text: "PATAKA - PATAKA - PATAKA - PATAKA - PATAKA",
        tip: "Enchaînez sans pause entre les syllabes, mais restez régulier.",
        type: "repetition",
        repetitions: 5
      },
      {
        id: "motor-7",
        title: "BA - DA - GA",
        text: "BA - DA - GA - BA - DA - GA - BA - DA - GA",
        tip: "Version sonore de PA-TA-KA. Les cordes vocales vibrent.",
        type: "repetition",
        repetitions: 9
      },
      {
        id: "motor-8",
        title: "Buttercup Challenge",
        text: "BUT - TER - CUP - BUT - TER - CUP - BUT - TER - CUP",
        tip: "Test anglo-saxon populaire. Le 'R' peut être roulé ou non.",
        type: "repetition",
        repetitions: 9
      },
      {
        id: "motor-9",
        title: "LA - LA - LA",
        text: "LA - LA - LA - LA - LA - LA - LA - LA - LA - LA",
        tip: "La langue touche les alvéoles supérieures. Son latéral.",
        type: "repetition",
        repetitions: 10
      },
      {
        id: "motor-10",
        title: "MA - NA - LA",
        text: "MA - NA - LA - MA - NA - LA - MA - NA - LA",
        tip: "Trois consonnes nasales et latérales. Laissez l'air passer par le nez pour M et N.",
        type: "repetition",
        repetitions: 9
      },
      {
        id: "motor-11",
        title: "FA - SA - CHA",
        text: "FA - SA - CHA - FA - SA - CHA - FA - SA - CHA",
        tip: "Trois fricatives différentes. Maintenez le souffle continu.",
        type: "repetition",
        repetitions: 9
      },
      {
        id: "motor-12",
        title: "RA - RA - RA",
        text: "RA - RA - RA - RA - RA - RA - RA - RA - RA - RA",
        tip: "Le R français est guttural. Sentez la vibration au fond de la gorge.",
        type: "repetition",
        repetitions: 10
      },
      {
        id: "motor-13",
        title: "TRA - TRA - TRA",
        text: "TRA - TRA - TRA - TRA - TRA - TRA - TRA - TRA - TRA - TRA",
        tip: "Groupe consonantique complexe. Ne séparez pas le T du R.",
        type: "repetition",
        repetitions: 10
      },
      {
        id: "motor-14",
        title: "PLA - BLA - FLA",
        text: "PLA - BLA - FLA - PLA - BLA - FLA - PLA - BLA - FLA",
        tip: "Groupes avec L. La langue doit être rapide et précise.",
        type: "repetition",
        repetitions: 9
      },
      {
        id: "motor-15",
        title: "GLO - GRO - BRO",
        text: "GLO - GRO - BRO - GLO - GRO - BRO - GLO - GRO - BRO",
        tip: "Voyelle arrondie O. Gardez les lèvres en position.",
        type: "repetition",
        repetitions: 9
      }
    ]
  },
  {
    id: "breath-control",
    level: 2,
    title: "Gestion du Souffle",
    description: "Textes longs pour apprendre à gérer votre respiration et maintenir un débit constant sur la durée.",
    icon: "🌬️",
    color: "from-sky-500/20 to-blue-600/10",
    exercises: [
      {
        id: "breath-1",
        title: "La Plongée",
        text: "Prenez une grande inspiration maintenant. Imaginez que vous plongez sous l'eau, lentement, sans panique. Observez les poissons, les coraux, le calme absolu. Remontez doucement vers la surface, en expirant tout l'air de vos poumons. Les bulles s'élèvent autour de vous. La lumière du soleil traverse l'eau claire. Vous approchez de la surface, sentant la chaleur revenir.",
        tip: "Lisez chaque phrase sur une seule expiration, jusqu'à la pause suivante. Repérez les virgules et les points comme vos moments de reprise d'air."
      },
      {
        id: "breath-2",
        title: "L'Alexandrin (Hugo)",
        text: "Demain, dès l'aube, à l'heure où blanchit la campagne, Je partirai. Vois-tu, je sais que tu m'attends. J'irai par la forêt, j'irai par la montagne. Je ne puis demeurer loin de toi plus longtemps. Je marcherai les yeux fixés sur mes pensées, Sans rien voir au dehors, sans entendre aucun bruit, Seul, inconnu, le dos courbé, les mains croisées, Triste, et le jour pour moi sera comme la nuit.",
        tip: "La poésie a un rythme naturel. Respectez les virgules et les points comme des respirations."
      },
      {
        id: "breath-3",
        title: "Le Marathon Vocal",
        text: "Ceci est un test d'endurance pour votre voix. Le but n'est pas d'aller vite, mais de tenir la distance sans vous essouffler. Contrôlez votre débit, faites des pauses à chaque virgule, et assurez-vous de bien finir chaque mot avant de commencer le suivant. La régularité prime sur la vitesse. Imaginez que vous courez sur une longue distance. Votre respiration doit rester stable du début à la fin. Chaque phrase est une foulée régulière vers l'arrivée.",
        tip: "Imaginez que vous courez un marathon. Économisez votre souffle."
      },
      {
        id: "breath-4",
        title: "La Description Longue",
        text: "La maison se dressait au bout du chemin, entourée de grands arbres centenaires dont les branches formaient une voûte naturelle au-dessus de l'allée de gravier. Les volets verts, légèrement écaillés par le temps, contrastaient avec les murs de pierre blonde. Une glycine grimpait le long de la façade, offrant ses grappes mauves au soleil de juin. Le jardin s'étendait à perte de vue, parsemé de rosiers anciens et de lavandes odorantes. Au fond, une vieille fontaine murmurait sa chanson éternelle.",
        tip: "Les descriptions longues testent votre capacité à maintenir l'attention du lecteur."
      },
      {
        id: "breath-5",
        title: "L'Exposé Scientifique",
        text: "Le cycle de l'eau comprend plusieurs étapes essentielles. L'évaporation transforme l'eau liquide en vapeur. Cette vapeur s'élève dans l'atmosphère où elle se refroidit et se condense en nuages. Les précipitations ramènent ensuite l'eau vers la surface terrestre, où elle s'infiltre dans les sols ou ruisselle vers les rivières. Les rivières rejoignent les fleuves, les fleuves se jettent dans les océans. Le soleil réchauffe les océans, et le cycle recommence infiniment.",
        tip: "Les textes informatifs demandent clarté et régularité. Chaque phrase apporte une information."
      },
      {
        id: "breath-6",
        title: "Le Vent d'Automne",
        text: "Le vent d'automne souffle dans les arbres. Les feuilles dorées se détachent une à une, voltigent dans l'air frais et viennent se poser délicatement sur le sol. Certaines tournoient longtemps avant de trouver leur place. D'autres tombent directement, comme fatiguées de leur voyage. Le vent continue sa course à travers le parc. Il fait danser les branches, siffle entre les troncs et emporte avec lui les dernières chaleurs de l'été. L'automne s'installe doucement, avec ses couleurs chaudes et sa mélancolie apaisante.",
        tip: "Laissez votre voix suivre le mouvement du vent : parfois forte, parfois douce."
      },
      {
        id: "breath-7",
        title: "La Lettre d'Amour",
        text: "Mon cœur déborde de mots que je ne sais pas toujours exprimer. Chaque jour passé loin de toi me semble une éternité. Je pense à ton sourire le matin au réveil. Je pense à ta voix qui me rassure dans les moments de doute. Tu es ma lumière quand tout semble sombre. Tu es mon calme quand la tempête gronde. Je voudrais pouvoir te dire tout cela en face, mais les mots se bousculent et ma voix tremble. Alors je t'écris, lettre après lettre, pour que tu saches à quel point tu comptes pour moi. Chaque phrase est un battement de mon cœur.",
        tip: "Les émotions peuvent accélérer le débit. Gardez le contrôle pour que chaque mot porte."
      },
      {
        id: "breath-8",
        title: "Le Discours de Fin d'Année",
        text: "Chers collègues, chers amis, nous voici réunis pour célébrer une année exceptionnelle. Ensemble, nous avons surmonté des défis que nous pensions insurmontables. Ensemble, nous avons atteint des objectifs ambitieux. Je tiens à remercier chacun d'entre vous pour votre engagement, votre créativité et votre persévérance. Les mois à venir nous réservent de nouveaux challenges, mais je sais que nous les affronterons avec la même énergie. Notre force réside dans notre capacité à travailler ensemble, à nous soutenir mutuellement. Je suis fier de faire partie de cette équipe. Portons un toast à notre réussite passée et à nos succès futurs.",
        tip: "Un discours demande de l'endurance. Gérez votre souffle pour tenir jusqu'à la fin."
      },
      {
        id: "breath-9",
        title: "Le Conte pour Enfants",
        text: "Il était une fois, dans un royaume lointain, une petite princesse qui n'aimait pas dormir. Chaque soir, elle trouvait une excuse pour rester éveillée. Elle demandait un verre d'eau, puis une histoire, puis une chanson. Ses parents, le roi et la reine, ne savaient plus quoi faire. Un jour, une fée bienveillante vint leur rendre visite. Elle offrit à la princesse un rêve magique, si beau qu'elle avait hâte de dormir pour le retrouver. Depuis ce jour, la petite princesse s'endort paisiblement chaque soir, avec le sourire aux lèvres.",
        tip: "Les contes se lisent avec douceur et régularité. La voix doit bercer l'enfant."
      },
      {
        id: "breath-10",
        title: "La Récitation Classique",
        text: "Heureux qui comme Ulysse a fait un beau voyage, ou comme celui-là qui conquit la Toison, et puis est retourné plein d'usage et raison, vivre entre ses parents le reste de son âge. Quand reverrai-je, hélas, de mon petit village, fumer la cheminée, et en quelle saison, reverrai-je le clos de ma pauvre maison, qui m'est une province et beaucoup davantage. Plus me plaît le séjour qu'ont bâti mes aïeux, que des palais romains le front audacieux.",
        tip: "La poésie classique demande un rythme soutenu. Respirez aux césures naturelles."
      },
      {
        id: "breath-11",
        title: "Respirer en Parlant",
        text: "La respiration est le moteur de la parole. Sans souffle, pas de voix. Pourtant, beaucoup de personnes oublient de respirer quand elles parlent. Elles enchaînent les phrases sans reprendre leur souffle. Résultat : la voix faiblit, le débit s'accélère, les mots se télescopent. L'exercice est simple : lisez une phrase, puis marquez une pause pour inspirer. Ne reprenez la phrase suivante qu'une fois vos poumons bien remplis. Sentez l'air descendre dans votre ventre, pas seulement dans votre poitrine. Cette respiration abdominale soutient la voix sur toute la durée de la phrase. Avec la pratique, ce réflexe deviendra automatique.",
        tip: "À chaque point, posez-vous. Inspirez par le nez en gonflant le ventre. Puis reprenez la lecture en expirant."
      },
      {
        id: "breath-12",
        title: "Le Souffle et les Pauses",
        text: "Les pauses ne sont pas des moments de silence vide. Ce sont des respirations actives qui rechargent votre voix. Quand vous parlez, chaque virgule est une occasion de reprendre un peu d'air. Chaque point est une respiration complète. Les pauses longues, après un point d'exclamation ou un point d'interrogation, permettent de recharger pleinement vos poumons. Entraînez-vous à exagérer ces pauses. Comptez mentalement deux temps à chaque virgule. Comptez trois temps à chaque point. Cette discipline ralentit votre débit et améliore la qualité de votre voix. Votre interlocuteur vous comprend mieux. Votre message gagne en impact. Et vous, vous restez serein.",
        tip: "Exagérez les pauses respiratoires. 2 temps aux virgules, 3 temps aux points."
      },
      {
        id: "breath-13",
        title: "La Respiration Carrée",
        text: "La respiration carrée est une technique utilisée par les militaires et les sportifs de haut niveau. Elle consiste à respirer en quatre temps égaux. Inspirez pendant quatre secondes. Retenez votre souffle pendant quatre secondes. Expirez pendant quatre secondes. Puis restez poumons vides pendant quatre secondes. Ce cycle régulier calme le système nerveux et prépare à la prise de parole. Avant de commencer à parler, faites trois cycles complets de respiration carrée. Puis lancez-vous dans votre lecture ou votre discours. Vous sentirez une différence immédiate : votre voix est plus posée, votre débit plus régulier, votre esprit plus clair. Cette technique est particulièrement utile avant un examen oral, un entretien d'embauche ou une présentation importante.",
        tip: "Faites 3 cycles de respiration carrée (4-4-4-4) avant de commencer la lecture."
      },
      {
        id: "breath-14",
        title: "Parler sur l'Expiration",
        text: "Un principe fondamental de la phonation : on parle en expirant, jamais en inspirant. Chaque phrase doit être portée par un flux d'air régulier et contrôlé. Si vous manquez d'air avant la fin de votre phrase, c'est que la phrase est trop longue ou que votre inspiration était insuffisante. La solution n'est pas de parler plus vite pour finir la phrase. La solution est de raccourcir vos phrases ou de respirer plus profondément. Entraînez-vous avec ce texte : lisez chaque phrase en une seule expiration. Si vous sentez que l'air manque, arrêtez-vous, respirez, et reprenez au début de la phrase suivante. Ne sacrifiez jamais la qualité de votre voix pour finir une phrase. Le confort respiratoire est la priorité absolue.",
        tip: "Une phrase = une expiration. Si l'air manque, arrêtez, respirez, reprenez."
      }
    ]
  },
  {
    id: "cognitive-traps",
    level: 3,
    title: "Pièges Cognitifs",
    description: "Textes conçus pour piéger les lecteurs rapides. Changements de rythme, chiffres et mots-pièges.",
    icon: "🧠",
    color: "from-amber-500/20 to-yellow-600/10",
    exercises: [
      {
        id: "trap-1",
        title: "Le Piège à Vitesse",
        text: "Attention, cette phrase va changer de vitesse. Parfois elle est lente. Et soudainement elle accélère pour voir si vous suivez ! Mais vous devez garder, absolument, le contrôle, du, rythme. Toujours. Même quand le texte tente de vous faire courir. Restez maître de votre lecture.",
        tip: "Ne vous laissez pas emporter par le texte. VOUS contrôlez le tempo, pas lui."
      },
      {
        id: "trap-2",
        title: "Les Chiffres",
        text: "Compter demande de la précision. 1984, 2023, 3310, 555. Les chiffres cassent le rythme naturel de la lecture. Dites: mille neuf cent quatre-vingt-quatre, deux mille vingt-trois, trois mille trois cent dix, cinq cent cinquante-cinq. Soyez vigilants sur les liaisons.",
        tip: "Prononcez chaque chiffre en toutes lettres, lentement et distinctement."
      },
      {
        id: "trap-3",
        title: "L'Entretien d'Embauche",
        text: "Bonjour, je me présente pour le poste de chef de projet. Je suis quelqu'un de dynamique, organisé et très motivé. J'ai géré des équipes de dix personnes pendant cinq ans. Mon point fort ? L'écoute. Mon point faible ? Je suis parfois trop perfectionniste. En résumé, je pense être le candidat idéal pour ce poste passionnant.",
        tip: "En situation de stress, on accélère. Pratiquez pour rester calme le jour J."
      },
      {
        id: "trap-4",
        title: "Le Texte Inversé",
        text: "Lisez ce texte normalement. Maintenant plus lentement. Encore plus lentement. Puis accélérez légèrement. Revenez à la normale. Le but est de varier consciemment votre vitesse sans perdre la clarté. Vous êtes le chef d'orchestre de votre propre voix.",
        tip: "Cet exercice vous apprend à moduler votre débit à volonté."
      },
      {
        id: "trap-5",
        title: "Les Homophones",
        text: "Le ver vert va vers le verre vert. Ces sept sots sans sous sont si saouls. Ton thon t'a-t-il tâté ? La mère du maire va à la mer. Le seau d'eau de la sotte saute. Le comte conte un conte au comte.",
        tip: "Les homophones piègent le cerveau. Articulez pour différencier les sons."
      },
      {
        id: "trap-6",
        title: "Questions-Réponses Rapides",
        text: "Comment vous appelez-vous ? Je m'appelle Jean Dupont. Quelle est votre adresse ? J'habite au 15 rue de la Paix à Lyon. Votre numéro de téléphone ? C'est le 06 12 34 56 78. Votre date de naissance ? Le 3 mars 1985. Votre nationalité ? Française. Votre situation familiale ? Marié, deux enfants.",
        tip: "Les informations personnelles partent souvent trop vite. Ralentissez sur les données."
      },
      {
        id: "trap-7",
        title: "Les Négations",
        text: "Je ne dis pas que je ne veux pas. Ce n'est pas que ce n'est pas bien. Il n'est pas impossible qu'il ne vienne pas. Elle n'a pas dit qu'elle ne savait pas. Nous ne pensons pas ne pas pouvoir. Les doubles négations trompent l'oreille et l'esprit.",
        tip: "Les négations multiples sont des pièges classiques. Lisez chaque mot."
      },
      {
        id: "trap-8",
        title: "Les Sigles",
        text: "La SNCF collabore avec la RATP et le TGV. L'ONU travaille avec l'OMS et l'UNESCO. Le PDG de cette PME a obtenu son MBA à HEC. La TVA sur le PIB affecte le SMIC. Chaque sigle doit être épelé clairement.",
        tip: "Épelez chaque lettre distinctement sans accélérer entre les sigles."
      },
      {
        id: "trap-9",
        title: "Le Formulaire Administratif",
        text: "Nom : Dupont. Prénom : Marie. Née le : 15 janvier 1990. À : Paris, 75015. Adresse actuelle : 42 avenue des Champs-Élysées, 75008 Paris. Numéro de sécurité sociale : 2 90 01 75 115 042 35. Référence du dossier : AB-2024-00567.",
        tip: "Les données administratives exigent une diction parfaite. Chaque chiffre compte."
      },
      {
        id: "trap-10",
        title: "Les Mots Proches",
        text: "Poison et poisson. Dessert et désert. Conversation et conservation. Attitude et altitude. Éminent et imminent. Ces mots se ressemblent mais leurs sens diffèrent grandement. La confusion vient de la vitesse. Ralentissez pour bien les prononcer.",
        tip: "Les paronymes (mots qui se ressemblent) piègent les locuteurs pressés."
      },
      {
        id: "trap-11",
        title: "L'Énumération Longue",
        text: "J'ai besoin de : pommes, poires, bananes, oranges, citrons, mandarines, kiwis, mangues, ananas, fraises, framboises, myrtilles, cassis, groseilles, cerises, abricots, pêches, nectarines, prunes, et melons. Vingt fruits à ne pas oublier.",
        tip: "Les listes longues poussent à accélérer. Gardez le même rythme du premier au dernier mot."
      },
      {
        id: "trap-12",
        title: "Les Liaisons Obligatoires",
        text: "Les amis arrivent. Un ancien ami. Nous avons attendu. Ils ont eu. C'est un homme aimable. Les arbres immenses. Ces enfants adorables. Vous êtes invités. Les éléphants énormes. Un grand honneur.",
        tip: "Les liaisons entre voyelles sont obligatoires. Prononcez-les sans les avaler."
      }
    ]
  },
  {
    id: "auto-controle",
    level: 2,
    title: "Auto-Contrôle",
    description: "Parlez sans regarder l'écran et découvrez votre résultat à la fin. Apprenez à ressentir votre rythme.",
    icon: "🎧",
    color: "from-indigo-500/20 to-violet-600/10",
    type: "proprioception",
    exercises: [
      {
        id: "proprio-1",
        title: "Décrivez votre logement",
        text: "Décrivez l'endroit où vous habitez : les pièces, la décoration, ce que vous aimez.",
        tip: "Fermez les yeux et concentrez-vous sur les sensations de votre appareil phonatoire.",
        type: "proprioception"
      },
      {
        id: "proprio-2",
        title: "Vos dernières vacances",
        text: "Racontez vos dernières vacances : où, avec qui, vos meilleurs souvenirs.",
        tip: "Écoutez votre voix intérieure pour maintenir le rythme souhaité.",
        type: "proprioception"
      },
      {
        id: "proprio-3",
        title: "Votre journée d'hier",
        text: "Décrivez en détail ce que vous avez fait hier, du réveil au coucher.",
        tip: "La chronologie vous aide à structurer sans accélérer.",
        type: "proprioception"
      },
      {
        id: "proprio-4",
        title: "Votre repas préféré",
        text: "Quel est votre plat préféré ? Décrivez-le et expliquez comment le préparer.",
        tip: "Les étapes de recette imposent un rythme naturel.",
        type: "proprioception"
      },
      {
        id: "proprio-5",
        title: "Votre travail ou études",
        text: "Expliquez ce que vous faites dans votre travail ou vos études au quotidien.",
        tip: "Simplifiez comme si vous parliez à quelqu'un qui ne connaît pas votre domaine.",
        type: "proprioception"
      },
      {
        id: "proprio-6",
        title: "Votre week-end idéal",
        text: "Décrivez votre week-end parfait : activités, lieux, personnes.",
        tip: "L'imagination peut accélérer le débit. Restez ancré dans vos sensations.",
        type: "proprioception"
      },
      {
        id: "proprio-7",
        title: "Un objet qui vous est cher",
        text: "Décrivez un objet auquel vous tenez et racontez son histoire.",
        tip: "Les émotions peuvent accélérer. Utilisez-les comme signal d'alerte.",
        type: "proprioception"
      },
      {
        id: "proprio-8",
        title: "Le trajet jusqu'ici",
        text: "Décrivez comment vous êtes arrivé(e) ici aujourd'hui, étape par étape.",
        tip: "Le récit chronologique structure naturellement la parole.",
        type: "proprioception"
      },
      {
        id: "proprio-9",
        title: "Votre série ou film préféré",
        text: "Parlez de votre série ou film préféré : l'histoire, pourquoi vous l'aimez.",
        tip: "L'enthousiasme accélère souvent. Surveillez votre rythme interne.",
        type: "proprioception"
      },
      {
        id: "proprio-10",
        title: "Un projet que vous avez",
        text: "Décrivez un projet personnel ou professionnel sur lequel vous travaillez.",
        tip: "Expliquer un projet demande de l'organisation. Prenez votre temps.",
        type: "proprioception"
      }
    ]
  },
  {
    id: "rebus-enfant",
    level: 0,
    title: "Mode Rébus 🧒",
    description: "Exercices en images pour les non-lecteurs. L'enfant suit les emojis et les barres de souffle pour apprendre le rythme.",
    icon: "🖼️",
    color: "from-yellow-400/20 to-orange-400/10",
    type: "rebus" as ExerciseType,
    exercises: [
      // --- Animaux rigolos ---
      {
        id: "rebus-1",
        title: "La vache gourmande",
        text: "La vache mange une glace.",
        tip: "Fais une grande pause à chaque barre orange ! Inspire bien.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "La vache", emoji: "🐄", pause_after: false },
          { segment: "mange", emoji: "😋", pause_after: false },
          { segment: "une glace", emoji: "🍦", pause_after: false }
        ]
      },
      {
        id: "rebus-2",
        title: "Le robot fatigué",
        text: "Le robot dort dans le garage.",
        tip: "Parle lentement comme un robot qui s'endort. Pause aux barres !",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Le robot", emoji: "🤖", pause_after: false },
          { segment: "dort", emoji: "😴", pause_after: false },
          { segment: "dans le garage", emoji: "🏠", pause_after: false }
        ]
      },
      {
        id: "rebus-3",
        title: "La bougie magique",
        text: "Je souffle très fort sur la bougie.",
        tip: "Quand tu vois la bougie, souffle vraiment ! C'est un exercice de respiration.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Je souffle", emoji: "💨", pause_after: false },
          { segment: "très fort", emoji: "💪", pause_after: false },
          { segment: "sur la bougie", emoji: "🕯️", pause_after: false }
        ]
      },
      {
        id: "rebus-4",
        title: "Le chat musicien",
        text: "Le chat joue de la guitare sous la lune.",
        tip: "Imagine un chat qui gratte sa guitare ! Pause entre chaque image.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Le chat", emoji: "🐱", pause_after: false },
          { segment: "joue de la guitare", emoji: "🎸", pause_after: false },
          { segment: "sous la lune", emoji: "🌙", pause_after: false }
        ]
      },
      {
        id: "rebus-5",
        title: "Le chien au parc",
        text: "Le chien court après le ballon dans le parc.",
        tip: "Dis chaque morceau bien fort, puis respire aux barres !",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Le chien", emoji: "🐕", pause_after: false },
          { segment: "court après le ballon", emoji: "🏃", pause_after: true },
          { segment: "dans le parc", emoji: "🌳", pause_after: false }
        ]
      },
      {
        id: "rebus-6",
        title: "Le poisson volant",
        text: "Le poisson saute hors de l'eau et vole dans le ciel.",
        tip: "Un poisson qui vole, c'est drôle ! Respire bien entre les images.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Le poisson", emoji: "🐟", pause_after: false },
          { segment: "saute hors de l'eau", emoji: "💦", pause_after: true },
          { segment: "et vole", emoji: "🦅", pause_after: false },
          { segment: "dans le ciel", emoji: "☁️", pause_after: false }
        ]
      },
      {
        id: "rebus-7",
        title: "L'ours gourmand",
        text: "L'ours mange du miel avec une cuillère.",
        tip: "Mmmh du miel ! Parle doucement et respire aux barres.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "L'ours", emoji: "🐻", pause_after: false },
          { segment: "mange du miel", emoji: "🍯", pause_after: false },
          { segment: "avec une cuillère", emoji: "🥄", pause_after: false }
        ]
      },
      // --- Vie quotidienne ---
      {
        id: "rebus-8",
        title: "Le matin à l'école",
        text: "À huit heures le garçon va à l'école.",
        tip: "Raconte ta matinée image par image. Pause aux barres !",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "À huit heures", emoji: "🕗", pause_after: true },
          { segment: "le garçon va", emoji: "🚶", pause_after: false },
          { segment: "à l'école", emoji: "🏫", pause_after: false }
        ]
      },
      {
        id: "rebus-9",
        title: "Le petit déjeuner",
        text: "Je bois du lait et je mange un croissant.",
        tip: "Miam ! Dis chaque partie lentement. Respire bien.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Je bois", emoji: "🥛", pause_after: false },
          { segment: "du lait", emoji: "🥛", pause_after: true },
          { segment: "et je mange", emoji: "😋", pause_after: false },
          { segment: "un croissant", emoji: "🥐", pause_after: false }
        ]
      },
      {
        id: "rebus-10",
        title: "La douche du matin",
        text: "Je prends ma douche et je mets mes habits.",
        tip: "Chaque geste du matin, un par un. Respire entre les images !",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Je prends", emoji: "🚿", pause_after: false },
          { segment: "ma douche", emoji: "🧼", pause_after: true },
          { segment: "et je mets", emoji: "👕", pause_after: false },
          { segment: "mes habits", emoji: "👖", pause_after: false }
        ]
      },
      {
        id: "rebus-11",
        title: "Le dodo",
        text: "Le soir je mets mon pyjama et je dors dans mon lit.",
        tip: "Chuchoter comme au moment du coucher. Pause douce aux barres.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Le soir", emoji: "🌙", pause_after: true },
          { segment: "je mets mon pyjama", emoji: "👕", pause_after: true },
          { segment: "et je dors dans mon lit", emoji: "🛏️", pause_after: false }
        ]
      },
      // --- Histoires drôles ---
      {
        id: "rebus-12",
        title: "Le dinosaure en ville",
        text: "Le dinosaure marche dans la rue et mange une pizza.",
        tip: "Un dinosaure qui mange une pizza ! C'est trop drôle. Respire bien.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Le dinosaure", emoji: "🦕", pause_after: false },
          { segment: "marche dans la rue", emoji: "🏙️", pause_after: true },
          { segment: "et mange une pizza", emoji: "🍕", pause_after: false }
        ]
      },
      {
        id: "rebus-13",
        title: "La princesse astronaute",
        text: "La princesse monte dans la fusée et va sur la lune.",
        tip: "Trois, deux, un, décollage ! Dis chaque partie clairement.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "La princesse", emoji: "👸", pause_after: false },
          { segment: "monte dans la fusée", emoji: "🚀", pause_after: true },
          { segment: "et va sur la lune", emoji: "🌕", pause_after: false }
        ]
      },
      {
        id: "rebus-14",
        title: "Le pirate et le trésor",
        text: "Le pirate navigue sur la mer et trouve un trésor.",
        tip: "Arrr ! Parle comme un pirate, mais lentement. Respire aux barres !",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Le pirate", emoji: "🏴‍☠️", pause_after: false },
          { segment: "navigue sur la mer", emoji: "⛵", pause_after: true },
          { segment: "et trouve un trésor", emoji: "💎", pause_after: false }
        ]
      },
      {
        id: "rebus-15",
        title: "Le monstre gentil",
        text: "Le monstre fait un câlin au lapin et lui donne un gâteau.",
        tip: "Un monstre gentil ! Parle doucement comme lui.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Le monstre", emoji: "👾", pause_after: false },
          { segment: "fait un câlin au lapin", emoji: "🐰", pause_after: true },
          { segment: "et lui donne un gâteau", emoji: "🎂", pause_after: false }
        ]
      },
      // --- Météo et nature ---
      {
        id: "rebus-16",
        title: "Il pleut !",
        text: "Il pleut dehors et je prends mon parapluie.",
        tip: "Plic ploc ! Respire entre chaque image comme entre les gouttes.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Il pleut dehors", emoji: "🌧️", pause_after: true },
          { segment: "et je prends mon parapluie", emoji: "☂️", pause_after: false }
        ]
      },
      {
        id: "rebus-17",
        title: "Le soleil brille",
        text: "Le soleil brille et les fleurs poussent dans le jardin.",
        tip: "Pense au beau soleil chaud. Prends ton temps à chaque image.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Le soleil brille", emoji: "☀️", pause_after: true },
          { segment: "et les fleurs poussent", emoji: "🌸", pause_after: false },
          { segment: "dans le jardin", emoji: "🏡", pause_after: false }
        ]
      },
      {
        id: "rebus-18",
        title: "La neige tombe",
        text: "La neige tombe et je fais un bonhomme de neige.",
        tip: "Brrr ! Parle doucement comme les flocons qui tombent.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "La neige tombe", emoji: "❄️", pause_after: true },
          { segment: "et je fais un bonhomme de neige", emoji: "⛄", pause_after: false }
        ]
      },
      {
        id: "rebus-19",
        title: "L'arc-en-ciel",
        text: "Après la pluie il y a un arc-en-ciel dans le ciel.",
        tip: "Les couleurs de l'arc-en-ciel ! Respire entre chaque image.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Après la pluie", emoji: "🌧️", pause_after: true },
          { segment: "il y a un arc-en-ciel dans le ciel", emoji: "🌈", pause_after: false }
        ]
      },
      // --- Transports ---
      {
        id: "rebus-20",
        title: "Le train rapide",
        text: "Le train roule vite sur les rails et arrive à la gare.",
        tip: "Tchou tchou ! Mais attention, toi tu parles len-te-ment.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Le train", emoji: "🚂", pause_after: false },
          { segment: "roule vite sur les rails", emoji: "🛤️", pause_after: true },
          { segment: "et arrive à la gare", emoji: "🏛️", pause_after: false }
        ]
      },
      {
        id: "rebus-21",
        title: "L'avion dans les nuages",
        text: "L'avion décolle et vole au-dessus des nuages.",
        tip: "On décolle ! Dis chaque morceau calmement.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "L'avion décolle", emoji: "🛫", pause_after: true },
          { segment: "et vole au-dessus des nuages", emoji: "☁️", pause_after: false }
        ]
      },
      {
        id: "rebus-22",
        title: "Le vélo de papa",
        text: "Papa fait du vélo dans le parc avec moi.",
        tip: "Pédale doucement dans ta tête ! Pause aux barres.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Papa", emoji: "👨", pause_after: false },
          { segment: "fait du vélo", emoji: "🚲", pause_after: false },
          { segment: "dans le parc avec moi", emoji: "🌳", pause_after: false }
        ]
      },
      // --- Émotions ---
      {
        id: "rebus-23",
        title: "Je suis content",
        text: "Je suis content parce que c'est mon anniversaire.",
        tip: "Souris en parlant ! Respire bien entre les images.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Je suis content", emoji: "😊", pause_after: false },
          { segment: "parce que", emoji: "💭", pause_after: false },
          { segment: "c'est mon anniversaire", emoji: "🎂", pause_after: false }
        ]
      },
      {
        id: "rebus-24",
        title: "J'ai un peu peur",
        text: "J'ai un peu peur du noir mais ma lampe me rassure.",
        tip: "C'est normal d'avoir peur. Parle doucement, ça rassure.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "J'ai un peu peur du noir", emoji: "😨", pause_after: true },
          { segment: "mais ma lampe me rassure", emoji: "😌", pause_after: false }
        ]
      },
      {
        id: "rebus-25",
        title: "Je suis en colère",
        text: "Je suis en colère mais je respire et je me calme.",
        tip: "Inspire profondément à chaque barre. Ça aide vraiment !",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Je suis en colère", emoji: "😠", pause_after: true },
          { segment: "mais je respire et je me calme", emoji: "😌", pause_after: false }
        ]
      },
      // --- Nourriture ---
      {
        id: "rebus-26",
        title: "La salade de fruits",
        text: "Je coupe une pomme une banane et une orange pour la salade.",
        tip: "Miam ! Nomme chaque fruit lentement.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Je coupe", emoji: "🔪", pause_after: false },
          { segment: "une pomme", emoji: "🍎", pause_after: false },
          { segment: "une banane", emoji: "🍌", pause_after: false },
          { segment: "et une orange", emoji: "🍊", pause_after: true },
          { segment: "pour la salade", emoji: "🥗", pause_after: false }
        ]
      },
      {
        id: "rebus-27",
        title: "Le gâteau au chocolat",
        text: "Maman prépare un gâteau au chocolat dans la cuisine.",
        tip: "Mmmmh le bon gâteau ! Parle lentement pour bien sentir le chocolat.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Maman", emoji: "👩", pause_after: false },
          { segment: "prépare un gâteau au chocolat", emoji: "🍫", pause_after: true },
          { segment: "dans la cuisine", emoji: "🍳", pause_after: false }
        ]
      },
      // --- Souffle et respiration ---
      {
        id: "rebus-28",
        title: "Les bulles de savon",
        text: "Je souffle doucement et je fais de grosses bulles.",
        tip: "Souffle vraiment quand tu vois les bulles ! Exercice de souffle.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Je souffle doucement", emoji: "💨", pause_after: true },
          { segment: "et je fais de grosses bulles", emoji: "🫧", pause_after: false }
        ]
      },
      {
        id: "rebus-29",
        title: "Le ballon gonflable",
        text: "Je gonfle un gros ballon rouge et il s'envole.",
        tip: "Gonfle tes joues à chaque barre ! Puis parle.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Je gonfle", emoji: "💨", pause_after: false },
          { segment: "un gros ballon rouge", emoji: "🎈", pause_after: true },
          { segment: "et il s'envole", emoji: "🕊️", pause_after: false }
        ]
      },
      {
        id: "rebus-30",
        title: "Le vent dans les arbres",
        text: "Le vent souffle dans les arbres et les feuilles volent.",
        tip: "Fais le bruit du vent à chaque pause ! Chuuut...",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Le vent souffle dans les arbres", emoji: "🌬️", pause_after: true },
          { segment: "et les feuilles volent", emoji: "🍃", pause_after: false }
        ]
      },
      {
        id: "rebus-31",
        title: "Je suis content",
        text: "Je suis content parce que c'est mon anniversaire.",
        tip: "Montre ton plus beau sourire à chaque pause !",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Je suis content", emoji: "😊", pause_after: false },
          { segment: "parce que c'est mon anniversaire", emoji: "🎂", pause_after: false }
        ]
      },
      {
        id: "rebus-32",
        title: "Le docteur gentil",
        text: "Le docteur écoute mon cœur avec son appareil.",
        tip: "Pose ta main sur ton cœur et parle doucement.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Le docteur", emoji: "👨‍⚕️", pause_after: false },
          { segment: "écoute mon cœur", emoji: "❤️", pause_after: false },
          { segment: "avec son appareil", emoji: "🩺", pause_after: false }
        ]
      },
      {
        id: "rebus-33",
        title: "La colère du lion",
        text: "Le lion est en colère et il rugit très fort.",
        tip: "Fais le lion qui rugit, mais pas trop vite !",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Le lion est en colère", emoji: "🦁", pause_after: false },
          { segment: "et il rugit très fort", emoji: "🔊", pause_after: false }
        ]
      },
      {
        id: "rebus-34",
        title: "Le bébé qui pleure",
        text: "Le bébé pleure et maman lui fait un câlin.",
        tip: "Parle tout doucement, comme pour consoler le bébé.",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Le bébé pleure", emoji: "👶", pause_after: true },
          { segment: "et maman lui fait un câlin", emoji: "🤗", pause_after: false }
        ]
      },
      {
        id: "rebus-35",
        title: "La danse joyeuse",
        text: "Je mets de la musique et je danse dans le salon.",
        tip: "Balance-toi doucement en parlant, comme si tu dansais !",
        type: "rebus" as ExerciseType,
        content_type: "rebus" as const,
        rebusContent: [
          { segment: "Je mets de la musique", emoji: "🎵", pause_after: true },
          { segment: "et je danse dans le salon", emoji: "💃", pause_after: false }
        ]
      }
    ]
  },
  {
    id: "teen-life",
    level: 2,
    title: "Situations Ado",
    description: "Scénarios de parole libre adaptés aux 12-18 ans. Pas de texte à lire : des situations concrètes où vous devez parler.",
    icon: "🎒",
    color: "from-orange-500/20 to-orange-600/10",
    type: "improvisation" as ExerciseType,
    exercises: [
      {
        id: "teen-1",
        title: "Le Match Décisif",
        text: "Vous venez de vivre un moment sportif incroyable : une finale, un match serré, un retournement de situation. Racontez ce qui s'est passé comme si vous le reviviez. Décrivez le terrain, l'ambiance, vos émotions. Faites monter la tension jusqu'au dénouement.",
        tip: "Faites monter la tension progressivement. Accélérez dans l'action, ralentissez sur l'émotion.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-2",
        title: "Premier Jour au Lycée",
        text: "C'est la rentrée dans un nouvel établissement. Vous ne connaissez personne. Racontez votre journée : le trajet, l'arrivée, la recherche de votre salle, votre première interaction avec quelqu'un. Comment vous vous êtes senti et comment ça s'est terminé.",
        tip: "Racontez comme si vous parliez à un ami le soir même. Naturel et détendu.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-3",
        title: "Le Camping Sauvage",
        text: "Vous racontez une soirée camping entre amis. Décrivez les préparatifs, le trajet, l'installation du camp, le feu, les discussions sous les étoiles. Faites vivre l'ambiance et les émotions du moment.",
        tip: "Alternez entre les passages d'action et les moments calmes. Le contraste crée l'atmosphère.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-4",
        title: "Le Concert",
        text: "Vous revenez d'un concert ou d'un spectacle qui vous a marqué. Racontez tout : l'attente, l'entrée dans la salle, le moment où la musique commence, l'ambiance, vos moments préférés. Faites ressentir l'énergie.",
        tip: "Faites vivre l'ambiance dans votre voix. Les passages calmes contrastent avec les moments intenses.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-5",
        title: "Le Débat en Classe",
        text: "Votre prof lance un débat sur un sujet de société qui vous tient à cœur. Choisissez votre camp et défendez votre point de vue avec des arguments structurés. Essayez aussi de répondre à une objection que quelqu'un pourrait vous faire.",
        tip: "Chaque nouvelle idée mérite une pause avant d'être développée. Structure : argument, exemple, conclusion.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-6",
        title: "La Recette du Dimanche",
        text: "Vous expliquez à un ami comment préparer votre plat ou votre gâteau préféré. Détaillez les ingrédients, les quantités, et chaque étape de la préparation. Soyez précis pour qu'il puisse suivre vos instructions.",
        tip: "Énoncez les quantités clairement. Chaque étape est une phrase à part.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-7",
        title: "Le Road Trip",
        text: "Vous racontez un voyage en voiture ou en train avec des amis ou votre famille. Décrivez le départ, les arrêts, les paysages qui défilent, les moments drôles ou imprévus. Où alliez-vous et comment ça s'est passé ?",
        tip: "Les énumérations donnent du rythme, les descriptions demandent de ralentir.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-8",
        title: "L'Oral du Brevet",
        text: "Vous passez un oral devant un jury. Présentez un sujet qui vous passionne en trois parties : ce que c'est, pourquoi ça vous intéresse, et ce que vous avez fait ou appris dans ce domaine. Concluez et proposez de répondre aux questions.",
        tip: "Structurez votre exposé avec des pauses nettes entre chaque partie. Parlez au public, pas à vos notes.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-9",
        title: "Le Podcast",
        text: "Vous enregistrez un épisode de podcast sur un sujet qui vous concerne : la pression scolaire, l'amitié, le sport, ou autre chose. Donnez votre avis, citez des exemples autour de vous, et posez une question ouverte à vos auditeurs.",
        tip: "Adoptez un ton de conversation, comme si vous parliez dans un micro. Les questions sont des pauses naturelles.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-10",
        title: "Le Défi Sportif",
        text: "Vous vous êtes lancé un défi sportif : une course, un entraînement, un objectif à atteindre. Racontez votre préparation, l'effort, les moments où vous avez voulu abandonner, et comment vous avez tenu bon. Qu'avez-vous ressenti à la fin ?",
        tip: "Faites ressentir l'effort dans votre voix : ralentissez sur les passages difficiles, reprenez de l'élan quand vous vous remotivez.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-impro-1",
        title: "Commander au fast-food",
        text: "Vous êtes au comptoir d'un fast-food bondé. Derrière vous, la file s'allonge et les gens commencent à s'impatienter. Vous devez commander pour vous et vos trois amis, en détaillant chaque menu, les suppléments, et les boissons. Parlez clairement pour que le serveur comprenne du premier coup.",
        tip: "Organisez votre commande mentalement avant de parler. Détaillez chaque élément calmement, sans vous laisser presser par la file.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-impro-2",
        title: "Expliquer un retard au prof",
        text: "Vous arrivez en cours avec quinze minutes de retard. Le prof vous regarde et attend une explication. Vous devez inventer une excuse crédible et la raconter de manière convaincante, avec des détails précis. Attention, le prof pose des questions pour vérifier votre histoire.",
        tip: "Gardez un ton calme et assuré. Les détails rendent l'histoire crédible, mais n'en faites pas trop.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-impro-3",
        title: "Convaincre ses parents",
        text: "Vous voulez aller à une soirée chez un ami ce week-end, mais vos parents hésitent. Vous devez les convaincre en trouvant les bons arguments : qui sera là, comment vous rentrez, pourquoi c'est important pour vous. Anticipez leurs objections et répondez-y.",
        tip: "Commencez par montrer que vous comprenez leurs inquiétudes avant de présenter vos arguments. L'empathie, c'est la clé de la persuasion.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-impro-4",
        title: "Se présenter à un nouveau groupe",
        text: "C'est la rentrée dans un nouveau lycée, ou vous rejoignez un club de sport. Vous ne connaissez personne. Un groupe d'élèves discute, et l'un d'eux vous demande de vous présenter. Dites qui vous êtes, d'où vous venez, ce que vous aimez, et posez des questions aux autres pour créer du lien.",
        tip: "Soyez naturel, souriez, et montrez de la curiosité pour les autres. La présentation parfaite n'existe pas, l'important c'est d'être authentique.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-impro-5",
        title: "Raconter son week-end",
        text: "C'est lundi matin, un ami vous demande ce que vous avez fait ce week-end. Racontez votre fin de semaine en détail : les activités, les rencontres, les moments drôles ou inattendus. Faites vivre votre récit avec des descriptions et des dialogues.",
        tip: "Structurez votre récit chronologiquement. Les petits détails et les dialogues rapportés rendent l'histoire vivante.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-11",
        title: "Appeler pour un job d'été",
        text: "Vous appelez un commerce ou un restaurant pour demander s'ils cherchent quelqu'un pour l'été. Présentez-vous, expliquez votre disponibilité, vos motivations, et posez des questions sur le poste. Soyez poli et professionnel.",
        tip: "Préparez mentalement vos phrases clés avant de « décrocher ». Un ton posé inspire confiance.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-12",
        title: "Expliquer les règles d'un jeu",
        text: "Vous devez expliquer les règles d'un jeu de société ou d'un jeu de cartes à quelqu'un qui n'y a jamais joué. Soyez clair, logique, et donnez des exemples pour que l'autre comprenne sans avoir à relire la notice.",
        tip: "Allez du plus simple au plus complexe. Vérifiez que chaque étape est comprise avant de passer à la suivante.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-13",
        title: "Décrire un film à quelqu'un",
        text: "Vous venez de voir un film ou une série qui vous a marqué. Racontez l'histoire sans trop spoiler, expliquez ce qui vous a plu ou déplu, et dites pourquoi vous le recommanderiez ou non.",
        tip: "Organisez-vous : le pitch en deux phrases, puis votre avis. Évitez de tout résumer scène par scène.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-14",
        title: "Demander un service à un voisin",
        text: "Vous sonnez chez un voisin que vous connaissez peu pour lui demander un service : emprunter un outil, récupérer un colis, garder un animal pendant un week-end. Expliquez votre situation et formulez votre demande poliment.",
        tip: "Commencez par vous présenter et expliquer le contexte. La politesse et la clarté facilitent tout.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-15",
        title: "Raconter un souvenir d'enfance",
        text: "Choisissez un souvenir d'enfance qui vous tient à cœur : des vacances, un anniversaire, un moment avec vos grands-parents. Racontez-le avec des détails sensoriels : les odeurs, les sons, les couleurs. Faites revivre ce moment.",
        tip: "Les détails sensoriels rendent le récit vivant. Prenez votre temps sur les images qui comptent.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-16",
        title: "Guider quelqu'un dans la rue",
        text: "Un passant vous demande comment aller à la gare, à la mairie, ou à un endroit que vous connaissez bien. Donnez-lui des indications précises : les rues, les repères visuels, les distances approximatives.",
        tip: "Utilisez des repères concrets (le feu rouge, la boulangerie) plutôt que des directions abstraites.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-17",
        title: "Présenter son animal",
        text: "Vous présentez votre animal de compagnie (réel ou imaginaire) à quelqu'un : son nom, sa race, son caractère, ses habitudes, une anecdote drôle ou attendrissante. Si vous n'en avez pas, décrivez celui que vous aimeriez avoir et pourquoi.",
        tip: "Les anecdotes concrètes rendent la description vivante. Évitez la liste de caractéristiques sèches.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-18",
        title: "Régler un malentendu",
        text: "Un ami pense que vous avez dit quelque chose de méchant sur lui, mais c'est un malentendu. Expliquez calmement ce qui s'est réellement passé, montrez que vous comprenez pourquoi il a pu mal interpréter, et proposez de régler la situation.",
        tip: "Restez calme et factuel. Reconnaissez les émotions de l'autre avant de donner votre version.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-19",
        title: "Choisir une destination de vacances",
        text: "Votre famille vous demande de choisir la destination des prochaines vacances et de justifier votre choix. Proposez un endroit, expliquez ce qu'on pourrait y faire, pourquoi ça plairait à tout le monde, et comment organiser le séjour.",
        tip: "Structurez votre proposition : la destination, les activités, les arguments pour chaque membre de la famille.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-20",
        title: "Raconter une galère de transport",
        text: "Vous avez vécu un trajet compliqué : bus en retard, correspondance ratée, panne de vélo, GPS qui vous envoie dans la mauvaise direction. Racontez l'enchaînement des événements et comment vous vous en êtes sorti.",
        tip: "Le comique vient de l'accumulation. Enchaînez les péripéties avec un bon rythme.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-21",
        title: "Expliquer une passion",
        text: "Quelqu'un vous demande pourquoi vous passez autant de temps sur votre passion (musique, dessin, sport, lecture, bricolage…). Expliquez ce que vous y trouvez, comment vous avez commencé, et ce que ça vous apporte au quotidien.",
        tip: "Parlez avec sincérité. Ce qui intéresse les gens, c'est votre enthousiasme, pas la technique.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-22",
        title: "Prendre un rendez-vous médical",
        text: "Vous appelez le cabinet du médecin ou du dentiste pour prendre rendez-vous. Expliquez la raison de votre visite, proposez vos disponibilités, et notez les informations qu'on vous donne (date, heure, documents à apporter).",
        tip: "Préparez les informations essentielles avant d'appeler. Parlez distinctement et n'hésitez pas à faire répéter.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-23",
        title: "Défendre un choix d'orientation",
        text: "Vos parents ou un prof vous demandent pourquoi vous voulez faire telle filière ou tel métier. Expliquez ce qui vous attire, ce que vous savez du parcours, et pourquoi vous pensez que c'est fait pour vous. Anticipez les doutes qu'on pourrait avoir.",
        tip: "Montrez que vous vous êtes renseigné. Un choix argumenté est toujours plus convaincant qu'un simple « j'aime bien ».",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-24",
        title: "Organiser un anniversaire",
        text: "Vous organisez l'anniversaire surprise d'un ami. Expliquez votre plan à un complice : le lieu, les invités, le gâteau, les activités, comment garder le secret. Détaillez chaque étape de l'organisation.",
        tip: "Soyez méthodique : qui fait quoi, quand, où. Les bons organisateurs sont ceux qui anticipent les imprévus.",
        type: "improvisation" as ExerciseType
      },
      {
        id: "teen-25",
        title: "Faire une réclamation polie",
        text: "Vous avez acheté quelque chose en ligne et le produit ne correspond pas à la description. Vous appelez le service client pour expliquer le problème, demander un échange ou un remboursement, tout en restant courtois.",
        tip: "Décrivez le problème factuellement, sans accuser. Les formulations polies obtiennent de meilleurs résultats.",
        type: "improvisation" as ExerciseType
      }
    ]
  },
  {
    id: "retelling",
    level: 4,
    title: "Récit Résumé",
    description: "Écoutez une histoire courte, puis restituez-la de mémoire. Un algorithme évalue si vous avez mentionné les points clés avec concision.",
    icon: "📖",
    color: "from-emerald-500/20 to-teal-600/10",
    type: "retelling" as ExerciseType,
    exercises: [
      {
        id: "retelling-1",
        title: "Le Porte-Monnaie",
        text: "Hier matin, un homme marchait dans la rue quand il a remarqué un porte-monnaie par terre, près d'un banc. Il l'a ramassé et a trouvé dedans une carte d'identité, quelques billets et une photo de famille. Plutôt que de le garder, il est allé directement au commissariat du quartier. Le policier a noté les informations et a contacté le propriétaire. Une heure plus tard, le propriétaire est venu récupérer son porte-monnaie. Il a voulu donner une récompense, mais l'homme a refusé en disant que c'était tout à fait normal.",
        tip: "Concentrez-vous sur les actions principales : trouver, rapporter, rendre. Ne vous attardez pas sur les détails du contenu du porte-monnaie.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Un homme trouve un porte-monnaie dans la rue",
          "Il le rapporte au commissariat",
          "Le propriétaire est contacté et vient le récupérer",
          "Le propriétaire propose une récompense",
          "L'homme refuse la récompense"
        ]
      },
      {
        id: "retelling-2",
        title: "Le Rendez-vous chez le Médecin",
        text: "Madame Dupont avait rendez-vous chez le médecin à quatorze heures. En partant de chez elle, elle s'est rendu compte que sa voiture ne démarrait pas. Elle a appelé un taxi, mais avec les embouteillages, elle est arrivée avec vingt minutes de retard. Heureusement, le médecin avait aussi du retard dans ses consultations. Elle a pu être reçue normalement. En sortant, elle a appelé un garagiste pour sa voiture.",
        tip: "L'histoire suit un enchaînement problème-solution. Restituez cette logique sans ajouter de détails.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Madame Dupont a un rendez-vous chez le médecin",
          "Sa voiture ne démarre pas",
          "Elle prend un taxi et arrive en retard",
          "Le médecin a aussi du retard donc elle est reçue normalement",
          "Elle appelle un garagiste pour sa voiture"
        ]
      },
      {
        id: "retelling-3",
        title: "Le Colis du Voisin",
        text: "Mardi dernier, le facteur a sonné chez Paul pour lui laisser un colis. Mais le colis n'était pas pour lui : il était adressé à sa voisine du troisième étage. Paul a gardé le colis et a glissé un mot sous la porte de sa voisine. Le soir, la voisine est venue frapper chez Paul pour récupérer son paquet. C'était un cadeau d'anniversaire envoyé par sa sœur. Elle a remercié Paul et lui a offert une part du gâteau qu'elle avait préparé.",
        tip: "Qui reçoit quoi, pour qui, et comment ça se résout ? Voilà l'essentiel.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Le facteur dépose un colis chez Paul",
          "Le colis est destiné à sa voisine",
          "Paul prévient la voisine avec un mot",
          "La voisine vient récupérer son colis",
          "Elle remercie Paul"
        ]
      },
      {
        id: "retelling-4",
        title: "La Sortie au Marché",
        text: "Samedi matin, Sophie est allée au marché avec sa liste de courses. Elle a acheté des légumes, du fromage et du pain. En payant le fromager, elle s'est aperçue qu'elle avait oublié son portefeuille à la maison. Le fromager, qui la connaissait bien, lui a dit de payer la prochaine fois. Sophie est revenue l'après-midi pour régler sa dette et en a profité pour acheter un bouquet de fleurs pour le remercier.",
        tip: "Restituez le déroulement : courses, oubli, solution du fromager, retour de Sophie.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Sophie va au marché faire ses courses",
          "Elle oublie son portefeuille en payant",
          "Le fromager lui fait confiance et la laisse partir",
          "Sophie revient payer l'après-midi",
          "Elle offre des fleurs au fromager pour le remercier"
        ]
      },
      {
        id: "retelling-5",
        title: "Le Train Manqué",
        text: "Lucas devait prendre le train de huit heures pour aller à un entretien d'embauche. Son réveil n'a pas sonné et il s'est réveillé en retard. Il a couru jusqu'à la gare mais le train était déjà parti. Il a pris le train suivant, une heure plus tard, et a appelé l'entreprise pour prévenir de son retard. La responsable a accepté de décaler l'entretien. Finalement, l'entretien s'est bien passé et Lucas a été rappelé la semaine suivante.",
        tip: "Problème, conséquence, adaptation, résultat : voilà la structure à restituer.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Lucas doit prendre le train pour un entretien",
          "Son réveil ne sonne pas et il rate le train",
          "Il prend le train suivant et prévient l'entreprise",
          "L'entretien est décalé",
          "L'entretien se passe bien"
        ]
      },
      {
        id: "retelling-6",
        title: "Le Chien Perdu",
        text: "Un garçon promenait son chien dans le parc quand celui-ci s'est échappé en courant après un chat. Le garçon l'a cherché pendant une heure, sans succès. En rentrant, il a fabriqué des affiches avec une photo du chien et les a collées dans le quartier. Trois jours plus tard, une voisine l'a appelé : le chien était dans son jardin. Le garçon, soulagé, est allé le récupérer immédiatement.",
        tip: "Restituez les étapes principales sans vous perdre dans les descriptions.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Le chien s'échappe dans le parc",
          "Le garçon le cherche sans succès",
          "Il met des affiches dans le quartier",
          "Une voisine retrouve le chien",
          "Le garçon récupère son chien"
        ]
      },
      {
        id: "retelling-7",
        title: "La Fuite d'Eau",
        text: "En rentrant du travail, Claire a découvert une flaque d'eau dans sa cuisine. Un tuyau sous l'évier fuyait. Elle a coupé l'arrivée d'eau et a épongé le sol avec des serviettes. Elle a ensuite appelé un plombier qui est venu le lendemain matin. La réparation a pris une demi-heure. Le plombier lui a conseillé de faire vérifier toute la tuyauterie car les joints étaient anciens.",
        tip: "Découverte du problème, actions immédiates, intervention du professionnel : trois temps à respecter.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Claire découvre une fuite d'eau dans sa cuisine",
          "Elle coupe l'eau et éponge",
          "Elle appelle un plombier",
          "Le plombier répare le tuyau",
          "Il conseille de vérifier toute la tuyauterie"
        ]
      },
      {
        id: "retelling-8",
        title: "Le Livre Emprunté",
        text: "Antoine a emprunté un livre à la bibliothèque pour préparer un exposé. Le jour où il devait le rendre, il s'est aperçu qu'il l'avait oublié chez un ami. Il a appelé son ami qui l'a retrouvé sur le canapé du salon. L'ami a déposé le livre à la bibliothèque en passant devant. Antoine a remercié son ami et n'a pas eu de pénalité de retard.",
        tip: "Suivez le parcours du livre : bibliothèque, ami, retour. C'est le fil rouge.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Antoine emprunte un livre à la bibliothèque",
          "Il oublie le livre chez un ami",
          "L'ami retrouve le livre",
          "L'ami rapporte le livre à la bibliothèque",
          "Antoine n'a pas de pénalité"
        ]
      },
      {
        id: "retelling-9",
        title: "La Panne de Voiture",
        text: "Un couple partait en vacances en voiture quand le moteur a commencé à faire un bruit étrange sur l'autoroute. Ils se sont arrêtés sur la bande d'arrêt d'urgence et ont appelé une dépanneuse. Le mécanicien est arrivé au bout d'une heure et a trouvé un problème de courroie. La réparation a pris trente minutes. Le couple a pu repartir et a décidé de s'arrêter dans la prochaine ville pour se reposer un peu.",
        tip: "L'important est la séquence des événements, pas les détails techniques.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Un couple tombe en panne sur l'autoroute",
          "Ils appellent une dépanneuse",
          "Le mécanicien diagnostique le problème",
          "La voiture est réparée",
          "Ils repartent et font une pause"
        ]
      },
      {
        id: "retelling-10",
        title: "Le Gâteau d'Anniversaire",
        text: "Marie voulait préparer un gâteau pour l'anniversaire de sa fille. Elle a suivi une recette mais s'est trompée et a mis du sel à la place du sucre. Le gâteau était immangeable. Comme elle n'avait plus le temps d'en refaire un, elle est allée à la boulangerie du coin et a acheté un beau gâteau au chocolat. Sa fille était ravie et n'a rien remarqué.",
        tip: "Soyez bref et clair : erreur, conséquence, solution, résultat.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Marie prépare un gâteau d'anniversaire",
          "Elle confond le sel et le sucre",
          "Le gâteau est raté et il n'y a plus le temps",
          "Elle achète un gâteau à la boulangerie",
          "Sa fille est contente"
        ]
      },
      {
        id: "retelling-11",
        title: "Les Clés Oubliées",
        text: "Thomas est sorti de chez lui en claquant la porte derrière lui. Il a immédiatement réalisé qu'il avait laissé ses clés à l'intérieur. Il a essayé d'appeler un serrurier, mais c'était dimanche et les tarifs étaient très élevés. Il s'est souvenu que sa mère avait un double de ses clés. Il l'a appelée, elle est venue une heure plus tard et il a pu rentrer chez lui. Depuis, il cache un double chez un voisin de confiance.",
        tip: "Problème, tentatives de solution, résolution : c'est le schéma à restituer.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Thomas s'enferme dehors en oubliant ses clés",
          "Le serrurier est trop cher le dimanche",
          "Sa mère a un double des clés",
          "Elle vient lui ouvrir",
          "Il décide de laisser un double chez un voisin"
        ]
      },
      {
        id: "retelling-12",
        title: "La Lettre Mystérieuse",
        text: "Julie a trouvé une enveloppe sans timbre dans sa boîte aux lettres. À l'intérieur, il y avait une carte avec un dessin d'étoile et un message : rendez-vous au café de la place à dix-sept heures. Intriguée, elle y est allée et a découvert que ses amis avaient organisé une fête surprise pour ses trente ans. Ils avaient décoré le café et préparé un repas. Julie a été très émue et a passé une soirée inoubliable.",
        tip: "Restituez la découverte, le mystère, puis la révélation. C'est l'arc narratif.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Julie trouve une enveloppe mystérieuse dans sa boîte aux lettres",
          "Le message lui donne rendez-vous au café",
          "Elle découvre une fête surprise pour ses trente ans",
          "Ses amis ont tout organisé",
          "Elle passe une très bonne soirée"
        ]
      },
      {
        id: "retelling-13",
        title: "Le Parapluie Échangé",
        text: "En sortant du restaurant, Marc a pris un parapluie noir dans le porte-parapluies, pensant que c'était le sien. En l'ouvrant sous la pluie, il a trouvé une étiquette avec un nom et un numéro de téléphone. Il a appelé le numéro et a expliqué la confusion. Le propriétaire du parapluie avait aussi pris celui de Marc par erreur. Ils se sont retrouvés le lendemain pour échanger leurs parapluies en riant de la situation.",
        tip: "L'erreur, la découverte, le contact, l'échange : quatre étapes simples.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Marc prend le mauvais parapluie au restaurant",
          "Il découvre une étiquette avec un numéro",
          "Il appelle le propriétaire",
          "L'autre personne a aussi pris le mauvais parapluie",
          "Ils échangent leurs parapluies"
        ]
      },
      {
        id: "retelling-14",
        title: "Le Jardin du Voisin",
        text: "Pendant les vacances de ses voisins, Hélène a proposé d'arroser leur jardin. La première semaine, tout s'est bien passé. Mais la deuxième semaine, elle a oublié d'arroser pendant trois jours à cause d'un déplacement professionnel. À leur retour, les voisins ont remarqué que certaines plantes avaient souffert. Hélène s'est excusée et a offert de nouvelles plantes pour remplacer celles qui étaient abîmées. Les voisins l'ont remerciée pour le reste du jardin qui était en parfait état.",
        tip: "L'engagement, le problème, les conséquences et la résolution : restez sur cette trame.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Hélène s'engage à arroser le jardin de ses voisins",
          "Elle oublie d'arroser pendant trois jours",
          "Certaines plantes sont abîmées",
          "Elle offre de nouvelles plantes",
          "Les voisins la remercient quand même"
        ]
      },
      {
        id: "retelling-15",
        title: "Le Portefeuille au Cinéma",
        text: "Après une séance de cinéma, Léa a réalisé qu'elle avait perdu son portefeuille. Elle est retournée dans la salle, mais l'équipe de nettoyage n'avait rien trouvé. Elle a laissé son numéro à l'accueil au cas où. Le lendemain, le cinéma l'a appelée : un spectateur avait trouvé le portefeuille coincé entre deux sièges et l'avait rapporté. Léa est allée le récupérer et tout était à l'intérieur.",
        tip: "Perte, recherche, attente, restitution : une structure linéaire simple.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Léa perd son portefeuille au cinéma",
          "Elle retourne chercher mais ne le trouve pas",
          "Elle laisse son numéro à l'accueil",
          "Un spectateur l'a trouvé et rapporté",
          "Elle récupère son portefeuille intact"
        ]
      },
      {
        id: "retelling-16",
        title: "La Recette Improvisée",
        text: "Pierre voulait faire une quiche pour le dîner, mais en ouvrant le frigo, il a vu qu'il n'avait plus d'œufs. Les magasins étaient fermés. Il a demandé à sa voisine qui lui a prêté quatre œufs. En échange, Pierre lui a apporté une part de quiche une fois qu'elle était prête. La voisine a tellement aimé la recette qu'elle lui a demandé de la lui écrire.",
        tip: "Besoin, problème, entraide, échange : c'est le cœur de l'histoire.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Pierre veut faire une quiche mais n'a plus d'œufs",
          "Les magasins sont fermés",
          "Sa voisine lui prête des œufs",
          "Il lui offre une part de quiche",
          "La voisine demande la recette"
        ]
      },
      {
        id: "retelling-17",
        title: "Le Bus Raté",
        text: "Emma attendait le bus pour aller au travail comme chaque matin. Le bus est passé sans s'arrêter car l'arrêt était en travaux et elle ne l'avait pas remarqué. L'arrêt provisoire était deux cents mètres plus loin. Un passant lui a indiqué le bon endroit. Elle a couru et a réussi à attraper le bus suivant juste à temps. Depuis, elle vérifie toujours les panneaux d'information aux arrêts.",
        tip: "Situation habituelle perturbée, aide extérieure, adaptation : trois temps clairs.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Emma attend le bus mais il ne s'arrête pas",
          "L'arrêt est déplacé à cause de travaux",
          "Un passant lui indique le nouvel arrêt",
          "Elle attrape le bus suivant",
          "Elle fait plus attention aux panneaux depuis"
        ]
      },
      {
        id: "retelling-18",
        title: "Le Cadeau Surprise",
        text: "Pour la fête des mères, Théo et sa sœur ont décidé de préparer le petit-déjeuner au lit pour leur maman. Théo a fait les tartines pendant que sa sœur pressait les oranges. En apportant le plateau, Théo a trébuché et a renversé le jus d'orange sur le tapis. Ils ont vite nettoyé et refait du jus. Leur mère a adoré la surprise et a dit que c'était le plus beau cadeau qu'elle ait jamais reçu.",
        tip: "L'intention, la préparation, l'incident, la réparation et la réaction : cinq moments.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Théo et sa sœur préparent le petit-déjeuner pour la fête des mères",
          "Ils se répartissent les tâches",
          "Théo renverse le jus d'orange",
          "Ils nettoient et recommencent",
          "Leur mère est très touchée"
        ]
      },
      {
        id: "retelling-19",
        title: "Le Chat sur le Toit",
        text: "Le chat de la famille Martin est monté sur le toit et ne savait plus descendre. Il miaulait depuis deux heures. Monsieur Martin a essayé avec une échelle mais le toit était trop haut. Il a appelé les pompiers. Ils sont arrivés avec une grande échelle et ont récupéré le chat en quelques minutes. Les enfants étaient soulagés et ont promis de mieux surveiller le chat.",
        tip: "Le problème, les tentatives, l'intervention et le résultat : gardez cette structure.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Le chat est bloqué sur le toit",
          "Monsieur Martin essaie avec une échelle mais c'est trop haut",
          "Il appelle les pompiers",
          "Les pompiers récupèrent le chat",
          "Les enfants promettent de mieux le surveiller"
        ]
      },
      {
        id: "retelling-20",
        title: "La Valise Échangée",
        text: "À l'aéroport, Nadia a récupéré une valise noire sur le tapis à bagages. En arrivant à l'hôtel, elle a ouvert la valise et a découvert des vêtements qui n'étaient pas les siens. Elle a appelé la compagnie aérienne qui a retrouvé le passager qui avait sa valise. Le lendemain, un coursier a livré la bonne valise à l'hôtel et a repris l'autre. Nadia a vérifié que rien ne manquait.",
        tip: "Erreur, découverte, démarche, échange : une séquence logique à restituer.",
        type: "retelling" as ExerciseType,
        keyPoints: [
          "Nadia prend la mauvaise valise à l'aéroport",
          "Elle découvre l'erreur à l'hôtel",
          "Elle contacte la compagnie aérienne",
          "Un coursier échange les valises le lendemain",
          "Tout est en ordre"
        ]
      }
    ]
  }
  ,
  {
    id: "fluency-reading",
    level: 1,
    title: "Lecture Fluence",
    description: "Textes courts et phonétiquement simples, conçus pour travailler la fluidité sans blocages.",
    icon: "🌊",
    color: "from-cyan-500/20 to-teal-600/10",
    isClinical: true,
    exercises: [
      {
        id: "fluency-read-1",
        title: "Le Matin Calme",
        text: "Le soleil se lève. La lumière entre dans la chambre. Je respire. L'air est doux. Je me lève à mon rythme. Pas de hâte. Mes pieds touchent le sol. Je sens la fraîcheur du carrelage. Je fais un pas, puis un autre. La maison est calme. Je vais vers la cuisine. L'eau coule dans la bouilloire. Le thé va infuser. Je m'assieds. Je regarde dehors. Les arbres bougent avec le vent. Un oiseau chante. La journée commence bien. Je suis là, présent, tranquille.",
        tip: "Phrases très courtes : une idée = une phrase. Prenez une vraie respiration entre chacune.",
        isClinical: true,
      },
      {
        id: "fluency-read-2",
        title: "La Balade au Parc",
        text: "Je marche dans le parc. Le chemin est large. Il y a des fleurs de chaque côté. Les roses sont rouges. Les tulipes sont jaunes. Un banc se trouve sous un arbre. Je m'assieds un moment. Des enfants jouent sur la pelouse. Ils rient. Un chien court après une balle. Le vent souffle doucement. Les feuilles dansent. Je ferme les yeux. J'écoute les sons autour de moi. Tout est paisible. Je me sens bien. Le temps passe sans pression.",
        tip: "Lisez comme si vous racontiez à un ami. Chaque phrase est un moment de calme.",
        isClinical: true,
      },
      {
        id: "fluency-read-3",
        title: "Ma Recette Préférée",
        text: "Je prépare un gâteau. Je sors la farine, le sucre, les œufs. Je mesure chaque dose. Je verse la farine dans le bol. J'ajoute le sucre. Je casse les œufs un à un. Je mélange avec une cuillère. La pâte devient lisse. Je verse un peu de lait. Je remue encore. Le four est déjà chaud. Je mets la pâte dans le moule. Le gâteau va cuire trente minutes. La cuisine sent bon. J'attends avec patience. Le résultat sera délicieux.",
        tip: "Les verbes d'action simples aident à maintenir le rythme. Articulez chaque étape.",
        isClinical: true,
      },
      {
        id: "fluency-read-4",
        title: "Le Soir à la Maison",
        text: "La journée se termine. Je rentre chez moi. Je pose mes affaires. Je retire mes chaussures. Le canapé m'attend. Je m'installe. La télé reste éteinte ce soir. Je prends un livre. Les pages tournent une à une. L'histoire me transporte ailleurs. La lampe éclaire doucement la pièce. Dehors, la nuit tombe. Les étoiles apparaissent. Je lis encore un chapitre. Puis je ferme le livre. Je bois un verre d'eau. Il est temps de dormir. Demain sera un nouveau jour.",
        tip: "Rythme lent et régulier. Les phrases courtes vous protègent des blocages.",
        isClinical: true,
      },
      {
        id: "fluency-read-5",
        title: "Le Marché du Samedi",
        text: "Le samedi, je vais au marché. Les étals sont colorés. Il y a des fruits, des légumes, du fromage. Je prends un sac. Je choisis trois pommes. Elles sont rouges et brillantes. Puis je prends du pain. Le boulanger me sourit. Je paye et je repars. Le soleil brille. Les gens se promènent. Un musicien joue de l'accordéon. Je m'arrête un instant. J'écoute la mélodie. Puis je rentre chez moi. Mon sac est plein. La matinée était belle.",
        tip: "Chaque phrase est un pas tranquille entre les étals. Pas de course.",
        isClinical: true,
      },
      {
        id: "fluency-read-6",
        title: "La Pluie Douce",
        text: "Il pleut doucement. Les gouttes glissent sur la vitre. Je suis au chaud chez moi. J'écoute le bruit de la pluie. C'est un son régulier. Il me calme. Je prends un livre. Je m'installe dans le canapé. Une couverture sur les genoux. Le thé fume sur la table. Je lis quelques pages. Puis je lève les yeux. La pluie continue. Le jardin brille. Les feuilles sont vertes. Tout est lavé, tout est frais. Je souris. La pluie a du bon.",
        tip: "Lisez au rythme de la pluie : doux, régulier, sans à-coups.",
        isClinical: true,
      },
      {
        id: "fluency-read-7",
        title: "Mon Voisin",
        text: "Mon voisin s'appelle Robert. Il a un chien blanc. Chaque matin, il promène son chien. Il passe devant chez moi. Je lui dis bonjour. Il me répond avec un grand sourire. Parfois, il s'arrête. On parle de la météo. Ou du jardin. Ou de rien. Juste quelques mots échangés. Puis il repart. Son chien tire sur la laisse. Robert rit. C'est un homme simple et gentil. Ces petits moments comptent. Ils donnent de la chaleur au quotidien.",
        tip: "Un texte de conversation simple. Gardez un ton naturel, comme si vous racontiez à quelqu'un.",
        isClinical: true,
      },
      {
        id: "fluency-read-8",
        title: "Le Dimanche Tranquille",
        text: "Le dimanche est un jour lent. Pas de réveil. Pas de bus à prendre. Je me lève quand mon corps le décide. Le soleil entre par la fenêtre. Je reste un moment dans mon lit. Puis je me lève. Je prépare le petit-déjeuner. Des tartines, du beurre, de la confiture. Je mange lentement. Je regarde le jardin. Rien ne presse. L'après-midi, je me promène. Je prends le chemin qui longe la rivière. L'eau coule doucement. Des canards nagent en famille. Je rentre avant la nuit. Le repas du soir est simple. Soupe et fromage. Le dimanche est fait pour se reposer.",
        tip: "Le dimanche est le jour le plus lent de la semaine. Votre lecture aussi.",
        isClinical: true,
      },
      {
        id: "fluency-read-9",
        title: "Les Courses",
        text: "Je prends ma liste de courses. Pain. Lait. Beurre. Pommes. Eau. Fromage. Je mets mes chaussures. Je prends le sac. Le magasin est à cinq minutes. J'entre. Le magasin est calme. Je suis les allées une par une. Je trouve le pain. Je le mets dans le sac. Puis le lait. Le beurre. Les pommes. L'eau est lourde. Je la porte à deux mains. Je passe à la caisse. La dame est patiente. Je paye. Je dis merci. Je rentre chez moi. Je range les courses. Tout est en ordre. C'est fait.",
        tip: "Les énumérations simples vous protègent des blocages. Un mot, une pause, le suivant.",
        isClinical: true,
      },
      {
        id: "fluency-read-10",
        title: "Le Chat de la Maison",
        text: "Le chat dort sur le fauteuil. Il est gris avec des rayures. Ses yeux sont fermés. Sa queue pend dans le vide. Il ronfle doucement. Je passe à côté. Il ouvre un œil. Puis le referme. Je ne l'ai pas dérangé. Le chat dort beaucoup. Le matin, le midi, le soir. Entre deux siestes, il mange. Ou il regarde par la fenêtre. Il observe les oiseaux. Sa tête bouge de droite à gauche. Mais il ne sort jamais. Il préfère le confort du canapé. Le chat est un philosophe. Il sait prendre son temps. On pourrait apprendre de lui.",
        tip: "Observez le chat : il ne se presse jamais. Lisez avec la même tranquillité.",
        isClinical: true,
      },
    ],
  },
  // ========== NEUROLOGIE ==========
  {
    id: "neuro-projection",
    level: 1,
    title: "Projection Vocale",
    description: "Exercices d'intensité vocale pour Parkinson et dysarthrie. Lisez fort, projetez votre voix.",
    icon: "📢",
    color: "from-teal-500/20 to-teal-600/10",
    isClinical: true,
    type: "neurologie" as ExerciseType,
    exercises: [
      {
        id: "neuro-proj-1",
        title: "Comptez Fort",
        text: "Comptez de un à vingt en maintenant un volume élevé. Un. Deux. Trois. Quatre. Cinq. Six. Sept. Huit. Neuf. Dix. Onze. Douze. Treize. Quatorze. Quinze. Seize. Dix-sept. Dix-huit. Dix-neuf. Vingt. Recommencez en comptant à rebours. Vingt. Dix-neuf. Dix-huit. Dix-sept. Seize. Quinze. Quatorze. Treize. Douze. Onze. Dix. Neuf. Huit. Sept. Six. Cinq. Quatre. Trois. Deux. Un.",
        tip: "Imaginez que vous parlez à quelqu'un au fond de la pièce. Gardez le volume constant sur chaque chiffre.",
        isClinical: true,
      },
      {
        id: "neuro-proj-2",
        title: "Appel au Loin",
        text: "Bonjour ! Comment allez-vous aujourd'hui ? Je suis content de vous voir ! Entrez, je vous en prie ! Asseyez-vous ici, près de la fenêtre ! Voulez-vous un café ? Le temps est magnifique aujourd'hui ! Regardez comme le jardin est beau ! Les fleurs ont poussé cette semaine ! Venez voir, c'est superbe !",
        tip: "Chaque phrase doit être dite comme un appel. Projetez votre voix comme si votre interlocuteur était à 5 mètres.",
        isClinical: true,
      },
      {
        id: "neuro-proj-3",
        title: "Lecture Projetée",
        text: "Le soleil se lève sur la vallée. Les premiers rayons éclairent les sommets enneigés. Le village s'éveille doucement. On entend les cloches de l'église sonner au loin. Les agriculteurs partent aux champs. Les enfants se préparent pour l'école. La boulangère ouvre sa boutique. L'odeur du pain frais se répand dans la rue. Les passants se saluent chaleureusement. Une nouvelle journée commence dans ce village paisible.",
        tip: "Lisez ce texte comme si vous faisiez un discours public. Volume fort et constant, articulation claire.",
        isClinical: true,
      },
      {
        id: "neuro-proj-4",
        title: "Tenue Vocalique",
        text: "Maintenez chaque voyelle le plus longtemps possible. AAAAAAH. Respirez. OOOOOH. Respirez. EEEEEH. Respirez. IIIIIH. Respirez. UUUUUH. Respirez. Maintenant alternez : AH-OH-AH-OH. EH-IH-EH-IH. OH-UH-OH-UH. Terminez par un long AAAAAAH le plus fort possible.",
        tip: "L'objectif est de tenir chaque son au moins 5 secondes. Respirez profondément entre chaque tenue.",
        isClinical: true,
      },
      {
        id: "neuro-proj-5",
        title: "Crescendo",
        text: "Je commence doucement. Ma voix monte progressivement. Chaque mot est un peu plus fort que le précédent. Je sens ma voix prendre de l'ampleur. Maintenant je projette vraiment. MA VOIX PORTE LOIN. JE PARLE AVEC ASSURANCE. JE SUIS ENTENDU. Puis je redescends progressivement. Ma voix se pose. Elle reste claire. Même plus douce, elle porte.",
        tip: "Augmentez le volume mot par mot, puis redescendez. C'est un exercice de contrôle de l'intensité vocale.",
        isClinical: true,
      },
      {
        id: "neuro-proj-6",
        title: "Les Jours de la Semaine",
        text: "LUNDI ! MARDI ! MERCREDI ! JEUDI ! VENDREDI ! SAMEDI ! DIMANCHE ! Maintenant plus lentement, en projetant chaque syllabe. LUN-DI. MAR-DI. MER-CRE-DI. JEU-DI. VEN-DRE-DI. SA-ME-DI. DI-MAN-CHE. Encore une fois, de plus en plus fort. Lundi. Mardi. Mercredi. JEUDI. VENDREDI. SAMEDI ! DIMANCHE !",
        tip: "Détachez bien chaque syllabe. Sur la dernière série, montez en puissance progressivement.",
        isClinical: true,
      },
      {
        id: "neuro-proj-7",
        title: "Commandes au Restaurant",
        text: "Je voudrais un café, s'il vous plaît ! Et un verre d'eau ! Avez-vous le plat du jour ? Je prendrai le poulet rôti ! Avec des légumes ! Et une salade verte ! Pour le dessert, une tarte aux pommes ! L'addition, s'il vous plaît ! Merci beaucoup ! Au revoir et bonne journée !",
        tip: "Simulez une situation réelle : parler fort dans un environnement bruyant. Chaque commande doit porter.",
        isClinical: true,
      },
      {
        id: "neuro-proj-8",
        title: "Lecture de Poème — Hugo",
        text: "Demain, dès l'aube, à l'heure où blanchit la campagne, je partirai. Vois-tu, je sais que tu m'attends. J'irai par la forêt, j'irai par la montagne. Je ne puis demeurer loin de toi plus longtemps. Je marcherai les yeux fixés sur mes pensées, sans rien voir au dehors, sans entendre aucun bruit, seul, inconnu, le dos courbé, les mains croisées, triste, et le jour pour moi sera comme la nuit.",
        tip: "Projetez comme un acteur sur scène. Chaque vers doit porter jusqu'au fond de la salle.",
        isClinical: true,
      },
      {
        id: "neuro-proj-9",
        title: "Sirène Vocale",
        text: "Faites glisser votre voix du grave vers l'aigu en disant AAAH. Du plus grave possible au plus aigu possible. Redescendez. Montez à nouveau. Maintenez le volume constant pendant toute la glissade. Grave. AIGU. Grave. AIGU. Maintenant sur OH. Grave. AIGU. Et sur EH. Grave. AIGU. Terminez par une note tenue confortable, à plein volume, pendant 10 secondes.",
        tip: "Gardez un volume constant malgré le changement de hauteur. Ne laissez pas le son faiblir dans les aigus.",
        isClinical: true,
      },
      {
        id: "neuro-proj-10",
        title: "Conversation Téléphonique",
        text: "Allô ? Oui, bonjour, c'est moi ! Est-ce que vous m'entendez bien ? Je vous appelle pour prendre rendez-vous ! Mardi, c'est possible ? À quelle heure ? Quatorze heures, parfait ! Je note l'adresse : 15, rue des Lilas ! C'est bien ça ? Merci beaucoup ! À mardi alors ! Au revoir !",
        tip: "Au téléphone, on perd les indices visuels. Votre voix seule doit transmettre clarté et énergie.",
        isClinical: true,
      },
    ],
  },
  {
    id: "neuro-articulation",
    level: 2,
    title: "Articulation Exagérée",
    description: "Exercices d'articulation pour dysarthrie. Exagérez chaque consonne, ouvrez grand la bouche.",
    icon: "👄",
    color: "from-teal-500/20 to-cyan-600/10",
    isClinical: true,
    type: "neurologie" as ExerciseType,
    exercises: [
      {
        id: "neuro-artic-1",
        title: "Paires Minimales",
        text: "Poule. Boule. Ton. Don. Pain. Bain. Pas. Bas. Pont. Bon. Tout. Doux. Père. Bère. Pile. Bile. Port. Bord. Tour. Dour. Tasse. Dace. Pot. Beau. Talon. Ballon. Pâte. Batte.",
        tip: "Prononcez chaque paire lentement. Sentez la différence entre les consonnes sourdes (P, T) et sonores (B, D).",
        isClinical: true,
      },
      {
        id: "neuro-artic-2",
        title: "Virelangues Doux",
        text: "Les chaussettes de l'archiduchesse sont-elles sèches ou archi-sèches ? Un chasseur sachant chasser sait chasser sans son chien. Si six scies scient six cyprès, six cent six scies scient six cent six cyprès. Didon dîna, dit-on, du dos d'un dodu dindon.",
        tip: "Ne cherchez pas la vitesse. Articulez CHAQUE syllabe de manière exagérée, bouche grande ouverte.",
        isClinical: true,
      },
      {
        id: "neuro-artic-3",
        title: "Consonnes Plosives",
        text: "Papa prépare un plat de pâtes. Bébé boit un bon biberon. Tata tient une tarte aux tomates. David danse dans le doux dimanche. Kiki cueille des coquelicots. Gégé goûte le gâteau au gingembre.",
        tip: "Les plosives (P, B, T, D, K, G) doivent être marquées avec force. Exagérez l'ouverture de la bouche.",
        isClinical: true,
      },
      {
        id: "neuro-artic-4",
        title: "Voyelles Ouvertes",
        text: "A comme amour. O comme or. È comme air. A. O. È. A. O. È. Papa a lavé la salade. Toto a trouvé un trésor. Mémé a préparé la fête. La balle roule dans l'allée. Le soleil brille sur le pré. La mer est calme ce matin.",
        tip: "Ouvrez la mâchoire au maximum sur chaque voyelle. Sentez l'espace dans votre bouche.",
        isClinical: true,
      },
      {
        id: "neuro-artic-5",
        title: "Fricatives en Chaîne",
        text: "FFFFF. VVVVV. SSSSS. ZZZZZ. CHCHCH. JJJJJ. Fa, fe, fi, fo, fu. Va, ve, vi, vo, vu. Sa, se, si, so, su. Za, ze, zi, zo, zu. Cha, che, chi, cho, chu. Ja, je, ji, jo, ju. Le vent souffle fort sur les feuilles sèches. La rose rouge fleurit au jardin. Le chat chasse les souris avec patience.",
        tip: "Les fricatives (F, V, S, Z, CH, J) demandent un flux d'air continu. Maintenez le son 3 secondes avant de passer à la syllabe.",
        isClinical: true,
      },
      {
        id: "neuro-artic-6",
        title: "Praxies Bucco-Faciales",
        text: "Tirez la langue le plus loin possible. Rentrez-la. Touchez votre nez avec la langue. Touchez votre menton. Faites le tour de vos lèvres avec la langue. Dans un sens. Dans l'autre. Gonflez les joues. Dégonflez. Joue droite. Joue gauche. Alternez rapidement. Souriez très largement. Faites un O avec les lèvres. Souriez. O. Souriez. O. Claquez la langue. Encore. Plus fort.",
        tip: "Ces mouvements préparent la musculature. Exécutez chaque mouvement 5 fois. Allez jusqu'à la limite de chaque geste.",
        isClinical: true,
      },
      {
        id: "neuro-artic-7",
        title: "Syllabes Alternées (PA-TA-KA)",
        text: "PA-TA-KA. PA-TA-KA. PA-TA-KA. Répétez 10 fois. Maintenant plus vite. PA-TA-KA-PA-TA-KA-PA-TA-KA. Changez : BA-DA-GA. BA-DA-GA. BA-DA-GA. Répétez 10 fois. Plus vite. BA-DA-GA-BA-DA-GA-BA-DA-GA. Alternez : PA-TA-KA-BA-DA-GA-PA-TA-KA-BA-DA-GA.",
        tip: "Le test PA-TA-KA (diadococinésie) mesure la coordination articulatoire. Gardez la précision même en accélérant.",
        isClinical: true,
      },
      {
        id: "neuro-artic-8",
        title: "Phrases à Consonnes Cibles",
        text: "Le petit Pierre porte un panier plein de prunes. La belle Barbara berce le bébé blond. Trois tigres tristes trient des truites. Le dindon dodu dort dans un drap doré. Le coq coquin croque un crouton croustillant. Le gros gorille grogne dans le garage gris.",
        tip: "Chaque phrase cible une consonne spécifique. Exagérez la consonne cible jusqu'à la caricature.",
        isClinical: true,
      },
      {
        id: "neuro-artic-9",
        title: "Mots Longs Décomposés",
        text: "AN-TI-CONS-TI-TU-TION-NEL-LE-MENT. RE-CONS-TI-TU-TION. TRANS-FOR-MA-TION. COM-MU-NI-CA-TION. AD-MI-NIS-TRA-TION. IN-TER-NA-TIO-NA-LI-SA-TION. ÉLEC-TRO-EN-CÉ-PHA-LO-GRAM-ME. OTO-RHI-NO-LA-RYN-GO-LO-GIS-TE.",
        tip: "Décomposez chaque mot en syllabes distinctes. Prononcez chacune clairement avant de reconstituer le mot entier.",
        isClinical: true,
      },
      {
        id: "neuro-artic-10",
        title: "Nasales et Liquides",
        text: "MA-NA-LA-RA. MO-NO-LO-RO. MOU-NOU-LOU-ROU. Maman mange une mandarine. Nana nettoie le nid. La lune luit dans le lointain. Le ruisseau roule sur les rochers ronds. Le miel est doux comme la lumière du matin. Le renne rentre par le long chemin noir.",
        tip: "Les consonnes nasales (M, N) et liquides (L, R) demandent un placement précis de la langue. Sentez les vibrations.",
        isClinical: true,
      },
    ],
  },
  {
    id: "neuro-coherence",
    level: 3,
    title: "Cohérence Narrative",
    description: "Écoutez une histoire courte puis résumez-la. Mode Retelling adapté pour troubles cognitifs, Alzheimer.",
    icon: "🧩",
    color: "from-teal-500/20 to-emerald-600/10",
    isClinical: true,
    type: "neurologie" as ExerciseType,
    exercises: [
      {
        id: "neuro-coh-1",
        title: "Le Marché",
        text: "Marie va au marché. Elle achète des pommes et du fromage. En rentrant, elle croise son voisin Pierre. Ils discutent du beau temps. Marie rentre chez elle et prépare une salade de fruits.",
        tip: "Après lecture, résumez : Qui ? Où ? Quoi ? Comment ça finit ?",
        isClinical: true,
        keyPoints: ["Marie", "marché", "pommes", "fromage", "voisin Pierre", "salade de fruits"],
      },
      {
        id: "neuro-coh-2",
        title: "La Visite",
        text: "Paul rend visite à sa mère. Il apporte un bouquet de fleurs. Sa mère est contente. Ils boivent un thé ensemble. Paul regarde les photos de famille. Il promet de revenir dimanche prochain.",
        tip: "Résumez les événements dans l'ordre. Qui rend visite à qui ? Qu'apporte-t-il ?",
        isClinical: true,
        keyPoints: ["Paul", "mère", "fleurs", "thé", "photos", "dimanche"],
      },
      {
        id: "neuro-coh-3",
        title: "Le Repas",
        text: "Ce soir, la famille dîne ensemble. Le père a cuisiné du poulet rôti. La mère a préparé une tarte aux pommes. Les enfants mettent la table. Tout le monde s'assoit. Le repas est délicieux. Après le dîner, ils regardent un film ensemble.",
        tip: "Qui cuisine quoi ? Que font les enfants ? Comment se termine la soirée ?",
        isClinical: true,
        keyPoints: ["famille", "poulet rôti", "tarte aux pommes", "enfants", "table", "film"],
      },
      {
        id: "neuro-coh-4",
        title: "Le Chien Perdu",
        text: "Lucas promène son chien Rex dans le parc. Rex voit un chat et court après lui. La laisse échappe à Lucas. Il cherche Rex pendant une heure. Finalement, il retrouve Rex près de la fontaine, en train de boire tranquillement.",
        tip: "Racontez l'aventure dans l'ordre : que se passe-t-il ? Comment ça finit ?",
        isClinical: true,
        keyPoints: ["Lucas", "chien Rex", "parc", "chat", "cherche", "fontaine"],
      },
      {
        id: "neuro-coh-5",
        title: "La Fête d'Anniversaire",
        text: "Aujourd'hui, Sophie a 70 ans. Ses trois enfants organisent une surprise. Ils décorent le salon avec des ballons. Sa fille apporte un gâteau au chocolat. Son fils aîné a invité les voisins. Le petit-fils joue de la guitare. Sophie est émue aux larmes. Elle remercie tout le monde. C'est sa plus belle fête.",
        tip: "Combien de personnes participent ? Qui fait quoi ? Quelle est la réaction de Sophie ?",
        isClinical: true,
        keyPoints: ["Sophie", "70 ans", "surprise", "ballons", "gâteau", "guitare", "émue"],
      },
      {
        id: "neuro-coh-6",
        title: "La Recette",
        text: "Pour faire une omelette, il faut trois œufs, du sel et du beurre. D'abord, cassez les œufs dans un bol. Battez-les avec une fourchette. Ajoutez une pincée de sel. Faites fondre le beurre dans la poêle. Versez les œufs battus. Quand le dessous est doré, pliez l'omelette en deux. Servez tout de suite.",
        tip: "Restituez les étapes dans l'ordre. Quels ingrédients ? Quels gestes ? Dans quel ordre ?",
        isClinical: true,
        keyPoints: ["trois œufs", "sel", "beurre", "battre", "poêle", "plier", "servir"],
      },
      {
        id: "neuro-coh-7",
        title: "Le Train",
        text: "Jacques prend le train de 8 heures pour Paris. Il s'assoit côté fenêtre. Le contrôleur passe vérifier les billets. Jacques regarde les champs défiler. Il mange un sandwich au jambon. Le train arrive à Paris à 10 heures. Jacques descend et prend le métro pour aller travailler.",
        tip: "Quel trajet fait Jacques ? Quels détails pouvez-vous retenir ? L'horaire, les actions ?",
        isClinical: true,
        keyPoints: ["Jacques", "train 8h", "Paris", "fenêtre", "sandwich", "10h", "métro"],
      },
      {
        id: "neuro-coh-8",
        title: "Le Jardin",
        text: "Mamie Jeanne adore son jardin. Au printemps, elle plante des tomates et des courgettes. Elle arrose tous les matins à 7 heures. Son chat Minou dort toujours au soleil entre les rangées. En été, Jeanne récolte ses légumes. Elle prépare de la soupe et en donne aux voisins. Tout le quartier adore sa soupe.",
        tip: "Que fait Jeanne et quand ? Quels légumes ? Qui profite de sa récolte ?",
        isClinical: true,
        keyPoints: ["Mamie Jeanne", "printemps", "tomates", "courgettes", "chat Minou", "soupe", "voisins"],
      },
      {
        id: "neuro-coh-9",
        title: "La Bibliothèque",
        text: "Émile va à la bibliothèque tous les mercredis. Il aime les romans policiers. La bibliothécaire, Madame Dupont, lui conseille toujours de bons livres. Aujourd'hui, elle lui recommande un livre sur un détective à Londres. Émile emprunte le livre et rentre chez lui. Il commence à lire dans son fauteuil préféré. Il lit trois chapitres avant le dîner.",
        tip: "Quelles sont les habitudes d'Émile ? Qui l'aide ? Quel livre choisit-il ?",
        isClinical: true,
        keyPoints: ["Émile", "mercredi", "policiers", "Madame Dupont", "détective Londres", "fauteuil", "trois chapitres"],
      },
      {
        id: "neuro-coh-10",
        title: "La Promenade au Lac",
        text: "Dimanche matin, Henri et sa femme Colette vont se promener au bord du lac. Le temps est frais mais ensoleillé. Ils croisent des canards avec leurs petits. Colette prend des photos avec son téléphone. Ils s'arrêtent au café du port pour boire un chocolat chaud. Le serveur les reconnaît, c'est un habitué. Sur le chemin du retour, ils achètent du pain à la boulangerie.",
        tip: "Qui sont les personnages ? Quels lieux visitent-ils ? Quelles actions dans l'ordre ?",
        isClinical: true,
        keyPoints: ["Henri", "Colette", "lac", "canards", "photos", "café", "chocolat chaud", "boulangerie"],
      },
    ],
  },
  {
    id: "latence",
    level: 3,
    title: "Temps de latence",
    description: "Apprenez à marquer une pause avant de parler. Un entraînement clé pour réduire la précipitation et gagner en clarté.",
    icon: "⏱️",
    color: "from-violet-500/20 to-purple-600/10",
    type: "latence" as ExerciseType,
    exercises: [
      {
        id: "latence-1",
        title: "Vie quotidienne",
        text: "Qu'avez-vous mangé ce matin au petit-déjeuner ?\nQu'avez-vous prévu de faire ce week-end ?\nQuel est votre plat préféré, et pourquoi ?\nRacontez un petit moment agréable de votre journée d'hier.",
        tip: "Respirez pendant le décompte. Formulez mentalement le début de votre phrase — vous verrez, la réponse sort plus fluide.",
        type: "latence" as ExerciseType,
      },
      {
        id: "latence-2",
        title: "Monde professionnel",
        text: "Comment décririez-vous votre métier à un enfant de 8 ans ?\nQu'est-ce qui vous plaît le plus dans votre travail ?\nRacontez un moment dont vous êtes fier au travail.\nQuel conseil donneriez-vous à quelqu'un qui débute dans votre domaine ?",
        tip: "Pendant les 3 secondes, choisissez UN mot clé autour duquel construire votre réponse. Ça structure la pensée.",
        type: "latence" as ExerciseType,
      },
      {
        id: "latence-3",
        title: "Opinions et préférences",
        text: "Plutôt mer ou montagne ? Expliquez votre choix.\nQuel livre, film ou chanson vous a le plus marqué ?\nSi vous pouviez apprendre un nouveau talent du jour au lendemain, lequel ?\nRacontez un souvenir d'enfance qui vous tient à cœur.",
        tip: "Résistez à l'envie de répondre immédiatement — c'est justement ça, le travail ! Le silence prépare une parole plus posée.",
        type: "latence" as ExerciseType,
      },
      {
        id: "latence-4",
        title: "Descriptions libres",
        text: "Décrivez votre pièce préférée chez vous.\nRacontez ce que vous avez fait hier soir après le dîner.\nDécrivez votre trajet habituel quand vous sortez de chez vous.\nRacontez la dernière fois où vous avez aidé quelqu'un.",
        tip: "Ces 3 secondes de silence sont un vrai outil. Elles réduisent la précipitation et améliorent la clarté de votre discours, petit à petit.",
        type: "latence" as ExerciseType,
      },
      {
        id: "latence-5",
        title: "Situations sociales",
        text: "Un inconnu vous demande l'heure dans la rue. Que répondez-vous ?\nVotre voisin vous invite à prendre un café. Que dites-vous ?\nUn ami vous demande votre avis sur sa nouvelle coupe de cheveux. Répondez honnêtement.\nQuelqu'un vous bouscule dans le métro et s'excuse. Comment réagissez-vous ?",
        tip: "Les situations sociales déclenchent des réponses automatiques rapides. L'exercice est justement de résister à cet automatisme.",
        type: "latence" as ExerciseType,
      },
      {
        id: "latence-6",
        title: "Mémoire et souvenirs",
        text: "Quel est le premier souvenir qui vous vient quand vous pensez à votre école primaire ?\nDécrivez la maison ou l'appartement de vos grands-parents.\nRacontez le dernier cadeau que vous avez offert à quelqu'un.\nQuel est votre meilleur souvenir de vacances en famille ?",
        tip: "Les souvenirs prennent du temps à remonter. Profitez du décompte pour laisser les images revenir naturellement.",
        type: "latence" as ExerciseType,
      },
      {
        id: "latence-7",
        title: "Choix et dilemmes",
        text: "Si vous deviez déménager demain, où iriez-vous ?\nVous gagnez dix mille euros : que faites-vous avec ?\nVous pouvez inviter n'importe qui à dîner, vivant ou historique. Qui choisissez-vous ?\nOn vous propose de changer de métier du jour au lendemain. Quel métier choisissez-vous ?",
        tip: "Les choix ouverts sont tentants à traiter vite. Utilisez le temps de pause pour peser votre réponse.",
        type: "latence" as ExerciseType,
      },
      {
        id: "latence-8",
        title: "Expliquer simplement",
        text: "Expliquez ce qu'est internet à une personne de 90 ans.\nComment fonctionne un avion ? Essayez en termes simples.\nPourquoi le ciel est-il bleu ?\nComment expliquer le réchauffement climatique en trois phrases ?",
        tip: "Simplifier demande de structurer sa pensée. Le temps de latence vous aide à trouver les bons mots avant de parler.",
        type: "latence" as ExerciseType,
      },
    ],
  },
];

export const getRandomExercise = (categoryId: string): Exercise | null => {
  const category = exerciseCategories.find(c => c.id === categoryId);
  if (!category || category.exercises.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * category.exercises.length);
  return category.exercises[randomIndex];
};

export const getCategoryById = (categoryId: string): ExerciseCategory | undefined => {
  return exerciseCategories.find(c => c.id === categoryId);
};
