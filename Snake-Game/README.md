# Snake Game

A classic snake game with modern features including AI opponent, multiplayer mode, and customizable settings.

## Live Demo

[https://aiml-1870-2026.github.io/Mcsponge/Snake-Game/](https://aiml-1870-2026.github.io/Mcsponge/Snake-Game/)

## Features

- **Purple snake with big googly eyes** that follow the direction of movement
- **Three game modes**: Solo, 2 Players, and VS AI
- **Smart AI opponent** that chases food and avoids obstacles
- **Customizable settings** for speed, grid size, and food count
- **Snakes start with length 3** for immediate action

## Game Modes

| Mode | Description |
|------|-------------|
| 1 Player | Classic solo snake game |
| 2 Players | Local multiplayer on the same keyboard |
| VS AI | Compete against an AI-controlled red snake |

## Controls

| Player | Keys |
|--------|------|
| Player 1 | W, A, S, D |
| Player 2 | Arrow Keys |

## Menu Options

| Setting | Options |
|---------|---------|
| Speed Level | Slow, Normal, Fast, Extreme |
| Grid Size | Small (15x15), Medium (20x20), Large (25x25), Extra Large (30x30) |
| Food Count | 1, 3, 5, or 10 Apples |

## AI Behavior

The AI snake uses a scoring algorithm that:
- Chases the nearest food
- Avoids walls and other snakes
- Looks ahead to avoid trapping itself
- Prefers staying away from edges

## Game Rules

- Eat apples to grow longer and increase your score
- Avoid hitting walls, yourself, or the other snake
- In multiplayer/AI mode, the game ends when either snake dies
- The surviving snake (or the one with more points in a tie) wins

## Technologies

- HTML5 Canvas
- Vanilla JavaScript
- CSS3

## Author

Mcsponge - AIML 1870
