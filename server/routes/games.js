import { Router } from 'express';
import { getTopScores } from '../config/database.js';

const router = Router();

export const GAMES_CATALOG = [
  {
    id: 'galaxy-vanguard',
    title: 'Galaxy Vanguard',
    tagline: 'Defiende el espacio exterior de flotas enemigas en un clásico juego de disparos arcade.',
    genre: 'Arcade Shooter',
    icon: '🚀',
    controls: 'Flechas / WASD para moverte, Barra Espaciadora para disparar.'
  },
  {
    id: 'cyber-outrun',
    title: 'Cyber Outrun Turbo',
    tagline: 'Pilota a alta velocidad a través de una autopista en perspectiva 3D esquivando el tráfico.',
    genre: 'Carreras 3D',
    icon: '🏎️',
    controls: 'Flechas Izquierda / Derecha para girar, Arriba / Espacio para acelerar y nitro.'
  },
  {
    id: 'neon-brick-breaker',
    title: 'Brick Breaker Pro',
    tagline: 'Destruye todos los bloques con precisión geométrica, físicas de rebote y mejoras.',
    genre: 'Arcade Puzzle',
    icon: '🧱',
    controls: 'Flechas Izquierda / Derecha para mover la paleta.'
  },
  {
    id: 'cyber-snake',
    title: 'Cyber Snake',
    tagline: 'El legendario juego de la serpiente optimizado con controles táctiles y aumento de velocidad.',
    genre: 'Arcade Clásico',
    icon: '🐍',
    controls: 'Flechas de dirección o WASD para guiar la serpiente.'
  },
  {
    id: 'pixel-jumper',
    title: 'Pixel Jumper',
    tagline: 'Plataformas de acción continua: salta, esquiva obstáculos y recoge gemas.',
    genre: 'Plataformas',
    icon: '🏃',
    controls: 'Flechas para moverte, Espacio / Arriba para saltar.'
  },
  {
    id: 'neon-flap',
    title: 'Precision Flight',
    tagline: 'Pon a prueba tus reflejos maniobrando a través de obstáculos con física de gravedad.',
    genre: 'Arcade Precisión',
    icon: '🪶',
    controls: 'Barra Espaciadora o Clic para elevar el vuelo.'
  }
];

// Get all games
router.get('/', async (req, res) => {
  try {
    const gamesWithTopScores = await Promise.all(
      GAMES_CATALOG.map(async (game) => {
        const topScores = await getTopScores(game.id, 1);
        return {
          ...game,
          highScore: topScores.length > 0 ? topScores[0].score : 0,
          topPlayer: topScores.length > 0 ? topScores[0].playerName : 'Ninguno'
        };
      })
    );
    res.json(gamesWithTopScores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific game info
router.get('/:gameId', (req, res) => {
  const game = GAMES_CATALOG.find(g => g.id === req.params.gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  res.json(game);
});

export default router;
